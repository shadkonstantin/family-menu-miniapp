(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MenuEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORE_FACTORS = {
    monetka: { name: 'Монетка', factor: 0.96 },
    magnit: { name: 'Магнит', factor: 0.98 },
    pyaterochka: { name: 'Пятёрочка', factor: 1.0 },
    lenta: { name: 'Лента', factor: 1.02 },
    ok: { name: 'О’КЕЙ', factor: 1.04 },
    perekrestok: { name: 'Перекрёсток', factor: 1.09 },
    vkusvill: { name: 'ВкусВилл', factor: 1.22 }
  };

  // Базовые ориентиры для Екатеринбурга, сентябрь 2026. КБЖУ — на 100 г.
  const PRODUCTS = {
    chicken: ['Куриное филе','Мясо',390,1000,113,23.6,1.9,0.4,['курица']],
    chickenLeg: ['Куриные бёдра','Мясо',295,1000,158,17,10,0,['курица']],
    turkey: ['Филе индейки','Мясо',520,1000,114,23,2,0,['индейка']],
    beef: ['Говядина','Мясо',760,1000,187,18.6,12.4,0,['говядина']],
    pork: ['Свинина','Мясо',470,1000,259,16,21.6,0,['свинина']],
    pollock: ['Минтай','Рыба',290,1000,72,15.9,0.9,0,['рыба']],
    pinkSalmon: ['Горбуша','Рыба',470,1000,140,20.5,6.5,0,['рыба']],
    egg: ['Яйца','Молочное и яйца',130,600,157,12.7,11.5,0.7,['яйца']],
    milk: ['Молоко','Молочное и яйца',95,1000,60,3,3.2,4.7,['молоко']],
    kefir: ['Кефир','Молочное и яйца',100,1000,41,3,1.5,4,['молоко']],
    cottage: ['Творог','Молочное и яйца',430,1000,169,16,9,3,['молоко','творог']],
    cheese: ['Сыр','Молочное и яйца',820,1000,364,24,29,0.3,['молоко']],
    sour: ['Сметана','Молочное и яйца',360,1000,206,2.6,20,3.2,['молоко']],
    butter: ['Сливочное масло','Молочное и яйца',980,1000,748,0.5,82.5,0.8,['молоко']],
    oats: ['Овсяные хлопья','Бакалея',105,1000,352,12.3,6.1,60,['глютен']],
    buckwheat: ['Гречка','Бакалея',125,1000,313,12.6,3.3,62,[]],
    rice: ['Рис','Бакалея',120,1000,344,6.7,0.7,79,[]],
    pasta: ['Макароны','Бакалея',135,1000,350,10.4,1.1,71,['глютен']],
    flour: ['Мука','Бакалея',75,1000,334,10.3,1.1,70,['глютен']],
    lentil: ['Чечевица','Бакалея',190,1000,295,24,1.5,46,[]],
    pea: ['Горох','Бакалея',95,1000,298,21,2,49,[]],
    bread: ['Хлеб','Бакалея',65,400,240,7.7,3,47,['глютен']],
    oil: ['Растительное масло','Бакалея',145,1000,899,0,99.9,0,[]],
    sugar: ['Сахар','Бакалея',78,1000,387,0,0,100,[]],
    tomatoPaste: ['Томатная паста','Бакалея',340,1000,82,4.8,0.5,14,[]],
    potato: ['Картофель','Овощи',58,1000,77,2,0.4,16.3,[]],
    cabbage: ['Капуста','Овощи',55,1000,25,1.3,0.1,4.7,[]],
    beet: ['Свёкла','Овощи',48,1000,43,1.6,0.2,8.8,['свёкла']],
    carrot: ['Морковь','Овощи',58,1000,35,1.3,0.1,6.9,[]],
    onion: ['Лук','Овощи',52,1000,40,1.1,0.1,8.7,[]],
    garlic: ['Чеснок','Овощи',320,1000,149,6.4,0.5,29.9,[]],
    tomato: ['Помидоры','Овощи',240,1000,18,0.9,0.2,3.9,[]],
    cucumber: ['Огурцы','Овощи',190,1000,15,0.7,0.1,3,[]],
    pepper: ['Перец сладкий','Овощи',280,1000,26,1,0.2,5.3,[]],
    zucchini: ['Кабачок','Овощи',140,1000,24,0.6,0.3,4.6,[]],
    pumpkin: ['Тыква','Овощи',85,1000,26,1,0.1,6.5,['тыква']],
    mushroom: ['Шампиньоны','Овощи',340,1000,22,3.1,0.3,3.3,['грибы']],
    greens: ['Зелень','Овощи',55,50,35,2.5,0.5,6,[]],
    apple: ['Яблоки','Фрукты',125,1000,47,0.4,0.4,9.8,[]],
    banana: ['Бананы','Фрукты',150,1000,96,1.5,0.5,21,[]]
  };

  function ing(p, g) { return { p, g }; }
  function dish(id, name, meal, opts) { return Object.assign({ id, name, meal, serves: 4, time: 40, difficulty: 1, equipment: ['stove'], tags: [], batch: false, ingredients: [], steps: [] }, opts); }

  const DISHES = [
    dish('oatmeal','Овсяная каша с бананом','breakfast',{time:12,ingredients:[ing('oats',220),ing('milk',700),ing('banana',300),ing('butter',20)],steps:['Вскипятить молоко с 200 мл воды.','Всыпать хлопья и варить 5–7 минут.','Добавить банан и кусочек масла.']}),
    dish('buckwheatMilk','Гречневая каша на молоке','breakfast',{time:25,ingredients:[ing('buckwheat',220),ing('milk',750),ing('butter',25),ing('sugar',20)],steps:['Промыть гречку и варить в воде 15 минут.','Добавить молоко, сахар и масло.','Прогреть ещё 5 минут.']}),
    dish('omelette','Омлет с помидорами','breakfast',{time:15,ingredients:[ing('egg',480),ing('milk',180),ing('tomato',250),ing('butter',25)],steps:['Взбить яйца с молоком.','Добавить нарезанные помидоры.','Готовить под крышкой 8–10 минут.']}),
    dish('syrniki','Сырники','breakfast',{time:30,difficulty:2,ingredients:[ing('cottage',500),ing('egg',120),ing('flour',90),ing('sugar',35),ing('oil',35)],steps:['Смешать творог, яйцо, сахар и половину муки.','Сформировать сырники и обвалять в муке.','Обжарить по 3–4 минуты с каждой стороны.']}),
    dish('pancakes','Блины','breakfast',{time:35,difficulty:2,ingredients:[ing('flour',300),ing('milk',650),ing('egg',180),ing('sugar',30),ing('oil',35)],steps:['Смешать яйца, молоко, сахар и муку.','Добавить масло и дать тесту постоять 10 минут.','Испечь тонкие блины.']}),
    dish('cottageApple','Творог с яблоком','breakfast',{time:7,equipment:[],ingredients:[ing('cottage',500),ing('apple',400),ing('sour',100)],steps:['Нарезать или натереть яблоки.','Смешать с творогом и сметаной.']}),

    dish('chickenSoup','Куриный суп с лапшой','lunch',{time:60,batch:true,ingredients:[ing('chickenLeg',550),ing('pasta',130),ing('potato',350),ing('carrot',120),ing('onion',100),ing('greens',30)],steps:['Сварить бульон из курицы 35 минут.','Добавить картофель, лук и морковь.','Через 15 минут всыпать лапшу, в конце добавить зелень.']}),
    dish('borsch','Борщ','lunch',{time:90,difficulty:2,batch:true,ingredients:[ing('beef',450),ing('cabbage',350),ing('beet',280),ing('potato',400),ing('carrot',120),ing('onion',120),ing('tomatoPaste',50),ing('oil',25),ing('sour',100)],steps:['Сварить говядину до мягкости.','Потушить свёклу, морковь и лук с томатной пастой.','Добавить картофель и капусту в бульон, затем зажарку. Варить 20 минут.']}),
    dish('cabbageSoup','Щи из свежей капусты','lunch',{time:75,batch:true,ingredients:[ing('chickenLeg',450),ing('cabbage',500),ing('potato',350),ing('carrot',100),ing('onion',100),ing('tomatoPaste',35)],steps:['Сварить куриный бульон.','Добавить картофель и капусту.','Ввести пассерованные лук и морковь, варить до готовности.']}),
    dish('lentilSoup','Чечевичный суп','lunch',{time:40,batch:true,ingredients:[ing('lentil',300),ing('potato',300),ing('carrot',120),ing('onion',120),ing('tomatoPaste',40),ing('oil',25)],steps:['Обжарить лук и морковь.','Добавить чечевицу, картофель и 1,8 л воды.','Варить 25 минут, добавить томатную пасту и специи.']}),
    dish('peaSoup','Гороховый суп со свининой','lunch',{time:90,batch:true,ingredients:[ing('pea',300),ing('pork',350),ing('potato',350),ing('carrot',100),ing('onion',100)],steps:['Замочить горох заранее.','Варить горох со свининой около часа.','Добавить овощи и готовить ещё 20 минут.']}),
    dish('pumpkinSoup','Тыквенный суп-пюре','lunch',{time:35,equipment:['stove','blender'],ingredients:[ing('pumpkin',700),ing('potato',250),ing('carrot',100),ing('onion',100),ing('milk',250),ing('butter',25)],steps:['Сварить овощи до мягкости.','Пробить блендером.','Добавить молоко и масло, прогреть без кипения.']}),

    dish('navyPasta','Макароны по-флотски','dinner',{time:40,equipment:['stove','meatGrinder'],ingredients:[ing('beef',450),ing('pasta',450),ing('onion',120),ing('carrot',80),ing('tomatoPaste',35),ing('oil',25)],steps:['Прокрутить мясо через мясорубку.','Обжарить фарш с луком и морковью.','Смешать с готовыми макаронами и томатной пастой.']}),
    dish('cutletsMash','Домашние котлеты с пюре','dinner',{time:65,difficulty:2,equipment:['stove','meatGrinder'],batch:true,ingredients:[ing('beef',350),ing('pork',300),ing('onion',100),ing('egg',60),ing('bread',100),ing('oil',35),ing('potato',900),ing('milk',180),ing('butter',45)],steps:['Прокрутить мясо и лук, добавить яйцо и размоченный хлеб.','Сформировать и обжарить котлеты.','Отварить картофель и сделать пюре с молоком и маслом.']}),
    dish('meatballsRice','Тефтели с рисом','dinner',{time:70,difficulty:2,equipment:['stove','meatGrinder'],batch:true,ingredients:[ing('beef',350),ing('pork',220),ing('rice',260),ing('onion',100),ing('egg',60),ing('tomatoPaste',45),ing('sour',100)],steps:['Сделать фарш и смешать с частью полуготового риса.','Сформировать тефтели.','Тушить 30 минут в соусе из сметаны и томатной пасты; подать с оставшимся рисом.']}),
    dish('chickenPotato','Курица с картофелем','dinner',{time:55,batch:true,ingredients:[ing('chickenLeg',700),ing('potato',1000),ing('onion',120),ing('carrot',120),ing('oil',30)],steps:['Обжарить курицу до румяности.','Добавить овощи и немного воды.','Тушить под крышкой 35–40 минут.']}),
    dish('ovenChicken','Запечённая курица с гречкой','dinner',{time:45,equipment:['oven'],ingredients:[ing('chicken',650),ing('buckwheat',300),ing('sour',120),ing('cheese',60),ing('garlic',10),ing('onion',80)],steps:['Замариновать курицу в сметане с чесноком.','Запечь 30–35 минут при 190 °C, в конце посыпать сыром.','Отварить гречку с луком.']}),
    dish('plov','Домашний плов','dinner',{time:80,difficulty:2,batch:true,ingredients:[ing('beef',500),ing('rice',420),ing('carrot',250),ing('onion',180),ing('garlic',15),ing('oil',45)],steps:['Обжарить мясо, лук и морковь.','Добавить рис, чеснок и горячую воду.','Томить под крышкой около 35 минут.']}),
    dish('goulash','Гуляш с гречкой','dinner',{time:90,difficulty:2,batch:true,ingredients:[ing('beef',550),ing('buckwheat',320),ing('onion',150),ing('carrot',120),ing('tomatoPaste',45),ing('flour',25),ing('oil',25)],steps:['Обжарить мясо небольшими порциями.','Добавить овощи, томатную пасту и воду, тушить 60 минут.','Загустить мукой и подать с гречкой.']}),
    dish('pollockRice','Минтай с рисом и овощами','dinner',{time:40,ingredients:[ing('pollock',700),ing('rice',320),ing('carrot',150),ing('onion',150),ing('sour',100),ing('oil',25)],steps:['Обжарить лук и морковь.','Добавить рыбу и сметану, тушить 20 минут.','Подать с отварным рисом.']}),
    dish('salmonPotato','Горбуша с картофелем','dinner',{time:50,equipment:['oven'],ingredients:[ing('pinkSalmon',650),ing('potato',900),ing('onion',150),ing('sour',120),ing('oil',20)],steps:['Нарезать картофель тонкими ломтиками.','Выложить рыбу, картофель и лук в форму, смазать сметаной.','Запекать 40 минут при 190 °C.']}),
    dish('turkeyRagu','Индейка с овощным рагу','dinner',{time:50,ingredients:[ing('turkey',600),ing('zucchini',400),ing('potato',450),ing('pepper',250),ing('tomato',250),ing('onion',100),ing('oil',30)],steps:['Обжарить индейку.','Добавить нарезанные овощи.','Тушить под крышкой 30 минут.']}),
    dish('vegRagu','Овощное рагу с чечевицей','dinner',{time:45,tags:['вегетарианское'],ingredients:[ing('lentil',250),ing('potato',400),ing('zucchini',350),ing('pepper',220),ing('tomato',250),ing('carrot',100),ing('onion',100),ing('oil',30)],steps:['Отварить чечевицу до полуготовности.','Обжарить овощи.','Соединить всё и тушить 20 минут.']}),
    dish('buckwheatMushroom','Гречка с грибами и яйцом','dinner',{time:35,tags:['вегетарианское'],ingredients:[ing('buckwheat',350),ing('mushroom',400),ing('onion',150),ing('egg',240),ing('oil',30)],steps:['Отварить гречку.','Обжарить грибы с луком.','Смешать с гречкой и подать с варёным яйцом.']}),
    dish('potatoCasserole','Картофельная запеканка с фаршем','dinner',{time:75,difficulty:2,equipment:['oven','meatGrinder'],batch:true,ingredients:[ing('beef',400),ing('pork',250),ing('potato',1100),ing('onion',120),ing('milk',150),ing('egg',60),ing('cheese',80)],steps:['Сделать фарш и обжарить с луком.','Приготовить картофельное пюре.','Собрать слоями, посыпать сыром и запекать 25 минут.']}),
    dish('lazyCabbage','Ленивые голубцы','dinner',{time:65,equipment:['stove','meatGrinder'],batch:true,ingredients:[ing('beef',350),ing('pork',220),ing('cabbage',650),ing('rice',150),ing('onion',120),ing('carrot',100),ing('tomatoPaste',45),ing('sour',100)],steps:['Прокрутить мясо и смешать с полуготовым рисом.','Добавить нашинкованную капусту.','Тушить в сметанно-томатном соусе 40 минут.']})
  ];

  function product(id) {
    const p = PRODUCTS[id];
    return { id, name:p[0], category:p[1], price:p[2], packGrams:p[3], kcal:p[4], protein:p[5], fat:p[6], carbs:p[7], tags:p[8] };
  }
  function portions(profile) { return Math.max(1, Number(profile.adults || 1) + Number(profile.children || 0) * 0.65); }
  function scaleFor(d, profile) { return portions(profile) / d.serves; }
  function profileFactor(profile) { return (STORE_FACTORS[profile.store] || STORE_FACTORS.pyaterochka).factor; }

  function ingredientCost(x, factor) { const p = product(x.p); return p.price * factor * x.g / p.packGrams; }
  function dishStats(d, profile) {
    const scale = scaleFor(d, profile), factor = profileFactor(profile);
    const totals = d.ingredients.reduce((a,x) => {
      const p = product(x.p), q = x.g * scale;
      a.cost += ingredientCost({p:x.p,g:q}, factor);
      a.kcal += p.kcal * q / 100; a.protein += p.protein * q / 100;
      a.fat += p.fat * q / 100; a.carbs += p.carbs * q / 100;
      return a;
    }, { cost:0,kcal:0,protein:0,fat:0,carbs:0 });
    return Object.fromEntries(Object.entries(totals).map(([k,v]) => [k, Math.round(v)]));
  }

  function dishTags(d) {
    const set = new Set(d.tags || []);
    d.ingredients.forEach(x => product(x.p).tags.forEach(t => set.add(t)));
    return set;
  }
  function available(d, profile) {
    const excluded = new Set(profile.exclusions || []);
    if ([...dishTags(d)].some(t => excluded.has(t))) return false;
    const equipment = profile.equipment || {};
    if ((d.equipment || []).some(e => e !== 'stove' && e !== 'vacuum' && !equipment[e])) return false;
    const maxTime = Number(profile.maxTime || 999);
    return d.time <= maxTime;
  }
  function hash(s) { let h=2166136261; for (let i=0;i<s.length;i++) { h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
  function cheapest(pool, profile) { return pool.slice().sort((a,b)=>dishStats(a,profile).cost-dishStats(b,profile).cost); }

  function buildPlan(profile) {
    const enabled = profile.meals || {breakfast:true,lunch:true,dinner:true};
    const seed = JSON.stringify(profile);
    const pools = {};
    ['breakfast','lunch','dinner'].forEach(meal => {
      pools[meal] = DISHES.filter(d => d.meal===meal && available(d,profile));
      if (!pools[meal].length) pools[meal] = DISHES.filter(d => d.meal===meal);
    });
    const slotCount = 7 * ['breakfast','lunch','dinner'].filter(m=>enabled[m]).length;
    const target = Math.max(1, Number(profile.budget || 6000) - 180) / Math.max(1, slotCount);
    const result=[];
    let previous={};
    for (let day=0; day<7; day++) {
      for (const meal of ['breakfast','lunch','dinner']) {
        if (!enabled[meal]) continue;
        let d;
        if (profile.batchCooking && day>0 && previous[meal] && previous[meal].batch && day % 2 === 1) {
          d = previous[meal];
        } else {
          let pool = cheapest(pools[meal],profile);
          const vegTarget = meal==='dinner' && day < Number(profile.vegDays||0);
          if (vegTarget) {
            const veg=pool.filter(x=>(x.tags||[]).includes('вегетарианское'));
            if (veg.length) pool=veg;
          }
          const affordable=pool.filter(x=>dishStats(x,profile).cost<=target*1.45);
          if (affordable.length) pool=affordable;
          const recent=new Set(result.slice(-5).map(x=>x.dish.id));
          const varied=pool.filter(x=>!recent.has(x.id));
          if (varied.length) pool=varied;
          d=pool[hash(seed+day+meal)%pool.length];
        }
        previous[meal]=d;
        result.push({day,meal,dish:d,stats:dishStats(d,profile)});
      }
    }
    let total = result.reduce((n,x)=>n+x.stats.cost,0) + 180;
    // Если вышли за бюджет — детерминированно заменяем самые дорогие уникальные слоты.
    let guard=80;
    while (total > Number(profile.budget||6000) && guard--) {
      const candidates=result.map((x,i)=>({x,i})).sort((a,b)=>b.x.stats.cost-a.x.stats.cost);
      let changed=false;
      for (const c of candidates) {
        const alternatives=cheapest(pools[c.x.meal],profile).filter(d=>d.id!==c.x.dish.id);
        const alt=alternatives.find(d=>dishStats(d,profile).cost < c.x.stats.cost-5);
        if (alt) { result[c.i]={...c.x,dish:alt,stats:dishStats(alt,profile)}; changed=true; break; }
      }
      if (!changed) break;
      total=result.reduce((n,x)=>n+x.stats.cost,0)+180;
    }
    const shopping=buildShopping(result,profile);
    const exactCost=Math.round(shopping.reduce((n,x)=>n+x.cost,0)+180);
    return { entries:result, shopping, cost:exactCost, reserve:180, overBudget:exactCost>Number(profile.budget||6000), profile };
  }

  function buildShopping(entries, profile) {
    const sums={};
    entries.forEach(e => e.dish.ingredients.forEach(x => {
      sums[x.p]=(sums[x.p]||0)+x.g*scaleFor(e.dish,profile);
    }));
    return Object.entries(sums).map(([id,g])=>{
      const p=product(id), packs=Math.ceil(g/p.packGrams), buyGrams=packs*p.packGrams;
      return {id,name:p.name,category:p.category,needed:Math.round(g),buyGrams,packs,cost:Math.round(p.price*profileFactor(profile)*packs)};
    }).sort((a,b)=>a.category.localeCompare(b.category,'ru')||a.name.localeCompare(b.name,'ru'));
  }

  function formatQty(item) {
    const p=product(item.id);
    if (p.packGrams < 1000) return `${item.packs} уп.`;
    return item.buyGrams>=1000 ? `${(item.buyGrams/1000).toFixed(item.buyGrams%1000?1:0)} кг` : `${item.buyGrams} г`;
  }

  function validateData() {
    const errors=[];
    DISHES.forEach(d=>{
      if (!d.id||!d.name||!['breakfast','lunch','dinner'].includes(d.meal)) errors.push(`bad dish ${d.id}`);
      d.ingredients.forEach(x=>{ if(!PRODUCTS[x.p]) errors.push(`${d.id}: ${x.p}`); if(!(x.g>0)) errors.push(`${d.id}: bad qty`); });
    });
    return errors;
  }

  return { STORE_FACTORS, PRODUCTS, DISHES, product, portions, dishStats, dishTags, available, buildPlan, buildShopping, formatQty, validateData };
});
