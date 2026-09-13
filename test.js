const assert=require('node:assert/strict');
const E=require('./engine.js');
const base={store:'monetka',adults:2,children:1,meals:{breakfast:true,lunch:true,dinner:true},batchCooking:true,budget:9000,exclusions:[],equipment:{oven:true,multicooker:true,blender:true,meatGrinder:true,vacuum:true},maxTime:60,vegDays:1};

// ── Целостность данных (движок сам проверяет source-поля) ────────────────
assert.deepEqual(E.validateData(),[],'data validation');

// ── Требования к sourced-базе ─────────────────────────────────────────────
const VALID_HOSTS=new Set(['youtube.com','www.youtube.com','t.me']);
const validUrl=u=>{try{return VALID_HOSTS.has(new URL(u).hostname);}catch{return false;}};
const MEALS=new Set(['breakfast','lunch','dinner']);

assert.ok(E.DISHES.length>=14,`dishes >= 14 (got ${E.DISHES.length})`);
for(const d of E.DISHES){
  assert.ok(d.source,`${d.id}: has source`);
  assert.ok(['grillkov','oblomoff'].includes(d.source.author),`${d.id}: valid author`);
  assert.ok(typeof d.source.authorName==='string' && d.source.authorName.length>0,`${d.id}: authorName`);
  assert.ok(typeof d.source.title==='string' && d.source.title.length>0,`${d.id}: title`);
  assert.ok(validUrl(d.source.url),`${d.id}: valid url domain (${d.source.url})`);
  assert.equal(d.source.verified,true,`${d.id}: verified=true`);
  assert.ok(typeof d.source.verificationMethod==='string' && d.source.verificationMethod.length>0,`${d.id}: verificationMethod`);
  assert.ok(d.source.sourceServings>0,`${d.id}: sourceServings>0`);
  assert.equal(d.source.gramsComplete,true,`${d.id}: gramsComplete=true`);
  assert.ok(d.ingredients.every(x=>x.sourceAmount!=null),`${d.id}: every ingredient has sourceAmount`);
  assert.ok(MEALS.has(d.meal),`${d.id}: valid meal`);
}
const authors=new Set(E.DISHES.map(d=>d.source.author));
assert.ok(authors.has('grillkov'),'grillkov represented');
assert.ok(authors.has('oblomoff'),'oblomoff represented');
for(const meal of MEALS) assert.ok(E.DISHES.some(d=>d.meal===meal),`${meal} non-empty`);

// ── Поведение планировщика (детерминизм, порции, КБЖУ, покупки) ─────────
const p1=E.buildPlan(base),p2=E.buildPlan(base);
assert.equal(JSON.stringify(p1),JSON.stringify(p2),'deterministic plan');
assert.equal(p1.entries.length,21,'three meals x seven days');
assert.ok(p1.shopping.length>15,'shopping list populated');
assert.equal(new Set(p1.shopping.map(x=>x.id)).size,p1.shopping.length,'no duplicate products');
assert.ok(p1.cost>0 && Number.isFinite(p1.cost),'valid cost');
for(const x of p1.entries){
  assert.ok(x.stats.cost>0 && x.stats.kcal>0,`valid stats ${x.dish.id}`);
  assert.ok(x.dish.source && x.dish.source.gramsComplete===true,`auto-plan dish has gramsComplete source ${x.dish.id}`);
  assert.ok(E.available(x.dish,base),`default plan respects time/equipment/exclusions: ${x.dish.id}`);
}
for(const meal of MEALS) assert.ok(new Set(p1.entries.filter(x=>x.meal===meal).map(x=>x.dish.id)).size>=2,`default ${meal} has variety`);
for(const x of p1.shopping) assert.ok(E.product(x.id) && x.packs>0,`shopping item valid ${x.id}`);

const noPork=E.buildPlan({...base,exclusions:['свинина']});
for(const x of noPork.entries) assert.ok(!E.dishTags(x.dish).has('свинина'),`pork excluded: ${x.dish.id}`);
const noGluten=E.buildPlan({...base,exclusions:['глютен']});
for(const x of noGluten.entries) assert.ok(!E.dishTags(x.dish).has('глютен'),`gluten excluded: ${x.dish.id}`);
const noGear=E.buildPlan({...base,equipment:{oven:false,multicooker:false,blender:false,meatGrinder:false,vacuum:false}});
for(const x of noGear.entries) assert.ok(E.available(x.dish,{...base,equipment:{oven:false,multicooker:false,blender:false,meatGrinder:false,vacuum:false}}),`equipment filtered: ${x.dish.id}`);
const quickProfile={...base,maxTime:30};
const quick=E.buildPlan(quickProfile);
for(const x of quick.entries) assert.ok(E.available(x.dish,quickProfile),`30-minute filter respected: ${x.dish.id}`);
const blockedProfile={...base,exclusions:['курица','яйца','глютен','грибы','молоко','рыба','тыква']};
const blocked=E.buildPlan(blockedProfile);
for(const x of blocked.entries) assert.ok(E.available(x.dish,blockedProfile),`exclusions never bypassed: ${x.dish.id}`);
for(const meal of blocked.unavailableMeals) assert.ok(!blocked.entries.some(x=>x.meal===meal),`unavailable ${meal} omitted instead of unsafe fallback`);
const empty=E.buildPlan({...blockedProfile,exclusions:[...blockedProfile.exclusions,'свинина','говядина','свёкла','мёд','соя'],equipment:{oven:false,multicooker:false,blender:false,meatGrinder:false,vacuum:false},maxTime:30});
assert.equal(empty.entries.length,0,'fully blocked profile has no unsafe fallback');
assert.equal(empty.cost,0,'empty plan has no phantom reserve');
const dinners=E.buildPlan({...base,meals:{breakfast:false,lunch:false,dinner:true}});
assert.equal(dinners.entries.length,7,'dinner-only plan');
const low=E.buildPlan({...base,budget:2500});
assert.ok(Number.isFinite(low.cost) && low.entries.length===21,'low budget does not crash');

const grillkov=E.DISHES.filter(d=>d.source.author==='grillkov').length;
const oblomoff=E.DISHES.filter(d=>d.source.author==='oblomoff').length;
console.log(JSON.stringify({tests:'passed',dishes:E.DISHES.length,grillkov,oblomoff,products:Object.keys(E.PRODUCTS).length,cost:p1.cost,lowBudgetCost:low.cost,shoppingItems:p1.shopping.length}));
