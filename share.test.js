const assert = require('node:assert/strict');
const S = require('./share.js');

const items = [
  {id:'milk', name:'Молоко', qty:'2 уп.'},
  {id:'eggs', name:'Яйца', qty:'10 шт.'},
  {id:'rice', name:'Рис', qty:'900 г'}
];
const message = S.buildShoppingMessage(items, new Set(['eggs']), x => x.qty);
assert.match(message, /Собери корзину ВкусВилла/);
assert.match(message, /• Молоко — 2 уп\./);
assert.match(message, /• Рис — 900 г/);
assert.doesNotMatch(message, /Яйца/);
assert.match(message, /оформление и оплату не подтверждай/i);

assert.equal(S.buildShoppingMessage(items, new Set(items.map(x=>x.id)), x=>x.qty), '');

const url = new URL(S.buildTelegramShareUrl(message, 'https://shadkonstantin.github.io/family-menu-miniapp/'));
assert.equal(url.origin, 'https://t.me');
assert.equal(url.pathname, '/share/url');
assert.equal(url.searchParams.get('url'), 'https://shadkonstantin.github.io/family-menu-miniapp/');
assert.equal(url.searchParams.get('text'), message);

const E = require('./engine.js');
const profile={store:'monetka',adults:2,children:1,meals:{breakfast:true,lunch:true,dinner:true},batchCooking:true,budget:9000,exclusions:[],equipment:{oven:true,multicooker:true,blender:true,meatGrinder:true,vacuum:true},maxTime:60,vegDays:1};
const weekly=E.buildPlan(profile).shopping;
const weeklyMessage=S.buildShoppingMessage(weekly,new Set(),E.formatQty);
const weeklyUrl=S.buildTelegramShareUrl(weeklyMessage,'https://shadkonstantin.github.io/family-menu-miniapp/');
assert.ok(weeklyMessage.length<=4096,`weekly message fits Telegram limit (${weeklyMessage.length})`);
assert.equal(new URL(weeklyUrl).searchParams.get('text'),weeklyMessage,'weekly message survives URL encoding');

console.log('SHARE_TESTS_OK');
