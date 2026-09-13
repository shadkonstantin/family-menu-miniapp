(() => {
  'use strict';
  const E = window.MenuEngine;
  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor('#f4f1e8'); tg.setBackgroundColor('#f4f1e8'); }

  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const DAYS=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
  const MEALS={breakfast:['Завтрак','🥣'],lunch:['Обед','🍲'],dinner:['Ужин','🍽']};
  const EXCLUSIONS=[['свинина','Свинина'],['говядина','Говядина'],['курица','Курица'],['рыба','Рыба'],['молоко','Молочное'],['яйца','Яйца'],['глютен','Глютен'],['грибы','Грибы'],['свёкла','Свёкла'],['тыква','Тыква'],['творог','Творог']];
  const EQUIPMENT=[['oven','Духовка','♨️'],['multicooker','Мультиварка','🥘'],['blender','Блендер','🌀'],['meatGrinder','Мясорубка','🥩'],['vacuum','Вакууматор','❄️']];
  const defaults={store:'monetka',adults:2,children:1,meals:{breakfast:true,lunch:true,dinner:true},batchCooking:true,budget:7500,exclusions:[],equipment:{oven:true,multicooker:false,blender:true,meatGrinder:true,vacuum:true},maxTime:60,vegDays:1};
  let profile=load('familyMenu.profile',defaults), plan=null, step=0;

  function load(key,fallback){try{return Object.assign(structuredClone(fallback),JSON.parse(localStorage.getItem(key)||'null')||{});}catch{return structuredClone(fallback)}}
  function money(n){return `${Math.round(n).toLocaleString('ru-RU')} ₽`}
  function pulse(){try{tg?.HapticFeedback?.impactOccurred('light')}catch{}}

  function initChoices(){
    $('#stores').innerHTML=Object.entries(E.STORE_FACTORS).map(([id,s],i)=>`<button type="button" class="choice ${profile.store===id?'selected':''}" data-store="${id}"><span>${['🛒','🟠','🔴','🔵','🟢','🟣','🍏'][i]||'🛍'}</span><b>${s.name}</b></button>`).join('');
    $('#exclusions').innerHTML=EXCLUSIONS.map(([id,name])=>`<button type="button" class="chip ${(profile.exclusions||[]).includes(id)?'selected':''}" data-exclusion="${id}">${name}</button>`).join('');
    $('#equipment').innerHTML=EQUIPMENT.map(([id,name,icon])=>`<button type="button" class="choice ${profile.equipment?.[id]?'selected':''}" data-equipment="${id}"><span>${icon}</span><b>${name}</b></button>`).join('');
    $('#adultsOut').value=profile.adults; $('#childrenOut').value=profile.children;
    $('#budget').value=profile.budget; $('#budgetRange').value=profile.budget;
    $('#maxTime').value=profile.maxTime; $('#vegDays').value=profile.vegDays;
    Object.entries(profile.meals).forEach(([k,v])=>{const el=$(`[name="${k}"]`);if(el)el.checked=v});
    $('[name="batchCooking"]').checked=profile.batchCooking;
  }
  function renderStep(){
    $$('.step').forEach((x,i)=>x.classList.toggle('active',i===step));
    $('#stepText').textContent=`Шаг ${step+1} из 7`; $('#stepBar').style.width=`${(step+1)/7*100}%`;
    $('#backBtn').disabled=step===0; $('#nextBtn').textContent=step===6?'Составить меню':'Далее';
  }
  function collect(){
    profile.meals={breakfast:$('[name="breakfast"]').checked,lunch:$('[name="lunch"]').checked,dinner:$('[name="dinner"]').checked};
    if(!Object.values(profile.meals).some(Boolean)) profile.meals.dinner=true;
    profile.batchCooking=$('[name="batchCooking"]').checked; profile.budget=Number($('#budget').value)||7500;
    profile.maxTime=Number($('#maxTime').value); profile.vegDays=Number($('#vegDays').value);
    localStorage.setItem('familyMenu.profile',JSON.stringify(profile));
  }
  function generate(){ collect(); plan=E.buildPlan(profile); localStorage.setItem('familyMenu.plan',JSON.stringify({profile,cost:plan.cost,at:Date.now()})); renderResult(); $('#wizard').classList.add('hidden'); $('#result').classList.remove('hidden'); scrollTo(0,0); }

  document.addEventListener('click',e=>{
    const s=e.target.closest('[data-store]'); if(s){profile.store=s.dataset.store;$$('[data-store]').forEach(x=>x.classList.toggle('selected',x===s));pulse()}
    const ex=e.target.closest('[data-exclusion]'); if(ex){const id=ex.dataset.exclusion,set=new Set(profile.exclusions||[]);set.has(id)?set.delete(id):set.add(id);profile.exclusions=[...set];ex.classList.toggle('selected');pulse()}
    const eq=e.target.closest('[data-equipment]'); if(eq){const id=eq.dataset.equipment;profile.equipment[id]=!profile.equipment[id];eq.classList.toggle('selected',profile.equipment[id]);pulse()}
    const c=e.target.closest('[data-count]'); if(c){const k=c.dataset.count,min=k==='adults'?1:0,max=k==='adults'?6:4;profile[k]=Math.max(min,Math.min(max,profile[k]+Number(c.dataset.delta)));$(`#${k}Out`).value=profile[k];pulse()}
    const meal=e.target.closest('[data-dish]'); if(meal) openRecipe(meal.dataset.dish);
    const tab=e.target.closest('[data-tab]'); if(tab){$$('[data-tab]').forEach(x=>x.classList.toggle('active',x===tab));$$('.tab-page').forEach(x=>x.classList.toggle('active',x.id===`${tab.dataset.tab}Tab`));pulse()}
  });
  $('#budgetRange').addEventListener('input',e=>$('#budget').value=e.target.value); $('#budget').addEventListener('input',e=>$('#budgetRange').value=Math.max(2500,Math.min(30000,e.target.value||2500)));
  $('#nextBtn').onclick=()=>{if(step<6){step++;renderStep();pulse()}else generate()}; $('#backBtn').onclick=()=>{if(step>0){step--;renderStep();pulse()}};
  $('#editBtn').onclick=()=>{$('#result').classList.add('hidden');$('#wizard').classList.remove('hidden');step=0;renderStep()};

  function renderResult(){
    $('#totalCost').textContent=money(plan.cost); const pct=Math.round(plan.cost/profile.budget*100); $('#budgetPercent').textContent=`${pct}%`; $('#donut').style.setProperty('--pct',`${Math.min(100,pct)}%`);
    $('#budgetStatus').textContent=plan.overBudget?`Выше бюджета на ${money(plan.cost-profile.budget)}`:`Останется около ${money(profile.budget-plan.cost)}`;
    $('#planTab').innerHTML=DAYS.map((day,i)=>{const es=plan.entries.filter(x=>x.day===i);return `<section class="day-card"><header class="day-head"><h2>${day}</h2><small>${money(es.reduce((n,x)=>n+x.stats.cost,0))}</small></header>${es.map(e=>`<button class="meal-row" data-dish="${e.dish.id}"><span class="meal-icon">${MEALS[e.meal][1]}</span><span><small>${MEALS[e.meal][0]}</small><b>${e.dish.name}</b><small>⏱ ${e.dish.time} мин${profile.batchCooking&&e.dish.batch?' · на два дня':''}</small></span><span class="meal-price">${money(e.stats.cost)}</span></button>`).join('')}</section>`}).join('');
    renderShopping(); renderSummary();
  }
  function renderShopping(){
    const checked=new Set(JSON.parse(localStorage.getItem('familyMenu.checked')||'[]')); const groups=plan.shopping.reduce((acc,x)=>{(acc[x.category]??=[]).push(x);return acc},{});
    $('#shoppingTab').innerHTML=`<h2 class="section-title">Список покупок</h2>${Object.entries(groups).map(([cat,items])=>`<section class="shopping-group"><h3>${cat}</h3>${items.map(x=>`<label class="shop-item ${checked.has(x.id)?'checked':''}"><input type="checkbox" data-check="${x.id}" ${checked.has(x.id)?'checked':''}><span class="shop-name"><b>${x.name}</b><small>${E.formatQty(x)}</small></span><span class="shop-cost">${money(x.cost)}<small>≈</small></span></label>`).join('')}</section>`).join('')}<p class="fineprint">Также заложено ${money(plan.reserve)} на соль, специи и мелкие расходники.</p>`;
    $$('[data-check]').forEach(el=>el.onchange=()=>{const set=new Set(JSON.parse(localStorage.getItem('familyMenu.checked')||'[]'));el.checked?set.add(el.dataset.check):set.delete(el.dataset.check);localStorage.setItem('familyMenu.checked',JSON.stringify([...set]));el.closest('.shop-item').classList.toggle('checked',el.checked);pulse()});
  }
  function renderSummary(){
    const meals=plan.entries.length,cooks=plan.entries.filter((e,i,a)=>!(profile.batchCooking&&e.dish.batch&&i>0&&a[i-1]?.dish.id===e.dish.id)).length;
    const avg=plan.entries.reduce((a,e)=>{a.k+=e.stats.kcal/E.portions(profile);a.p+=e.stats.protein/E.portions(profile);return a},{k:0,p:0});
    $('#summaryTab').innerHTML=`<h2 class="section-title">Итоги недели</h2><div class="summary-grid"><div class="stat"><span>Бюджет</span><b>${money(profile.budget)}</b></div><div class="stat ${plan.overBudget?'warning':'ok'}"><span>${plan.overBudget?'Перерасход':'Экономия'}</span><b>${money(Math.abs(profile.budget-plan.cost))}</b></div><div class="stat"><span>Приёмов пищи</span><b>${meals}</b></div><div class="stat"><span>Готовок</span><b>≈ ${cooks}</b></div><div class="stat wide"><span>В среднем на один приём и человека</span><b>${Math.round(avg.k/meals)} ккал · ${Math.round(avg.p/meals)} г белка</b></div></div><p class="fineprint">КБЖУ рассчитаны по справочным значениям продуктов. Цена — оценка для сети «${E.STORE_FACTORS[profile.store].name}» в Екатеринбурге и может отличаться от чека. Домашние запасы и акции не учитываются.</p>`;
  }
  function openRecipe(id){
    const d=E.DISHES.find(x=>x.id===id),stats=E.dishStats(d,profile),scale=E.portions(profile)/d.serves;
    $('#recipeMeal').textContent=MEALS[d.meal][0];$('#recipeTitle').textContent=d.name;
    $('#recipeMeta').innerHTML=`<span>⏱ ${d.time} мин</span><span>≈ ${money(stats.cost)}</span><span>${Math.round(stats.kcal/E.portions(profile))} ккал/порция</span><span>Б ${Math.round(stats.protein/E.portions(profile))} · Ж ${Math.round(stats.fat/E.portions(profile))} · У ${Math.round(stats.carbs/E.portions(profile))}</span>`;
    $('#recipeIngredients').innerHTML=d.ingredients.map(x=>`<li>${E.product(x.p).name} — ${x.g*scale>=1000?(x.g*scale/1000).toFixed(1)+' кг':Math.round(x.g*scale)+' г'}</li>`).join('');
    $('#recipeSteps').innerHTML=d.steps.map(x=>`<li>${x}</li>`).join(''); $('#recipeDialog').showModal();pulse();
  }
  $('#closeDialog').onclick=()=>$('#recipeDialog').close(); $('#recipeDialog').onclick=e=>{if(e.target===$('#recipeDialog'))$('#recipeDialog').close()};

  initChoices(); renderStep(); if(E.validateData().length) console.error(E.validateData());
})();
