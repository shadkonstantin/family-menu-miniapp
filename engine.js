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
    chickenCarcass: ['Куриный суповой набор','Мясо',150,1000,170,15,12,0,['курица']],
    wholeChicken: ['Курица целиком','Мясо',350,1300,190,17,13,0,['курица']],
    turkey: ['Филе индейки','Мясо',520,1000,114,23,2,0,['индейка']],
    beef: ['Говядина','Мясо',760,1000,187,18.6,12.4,0,['говядина']],
    pork: ['Свинина','Мясо',470,1000,259,16,21.6,0,['свинина']],
    duck: ['Утка','Мясо',450,1000,250,17,20,0,[]],
    duckFat: ['Утиный жир','Мясо',80,200,900,0,99.8,0,[]],
    ham: ['Ветчина','Мясо',120,200,242,16,19,2,['свинина']],
    bacon: ['Бекон','Мясо',180,300,458,12,45,0.5,['свинина']],
    pollock: ['Минтай','Рыба',290,1000,72,15.9,0.9,0,['рыба']],
    pinkSalmon: ['Горбуша','Рыба',470,1000,140,20.5,6.5,0,['рыба']],
    salmon: ['Филе лосося','Рыба',1200,1000,208,20,13,0,['рыба']],
    egg: ['Яйца','Молочное и яйца',130,600,157,12.7,11.5,0.7,['яйца']],
    milk: ['Молоко','Молочное и яйца',95,1000,60,3,3.2,4.7,['молоко']],
    kefir: ['Кефир','Молочное и яйца',100,1000,41,3,1.5,4,['молоко']],
    cottage: ['Творог','Молочное и яйца',430,1000,169,16,9,3,['молоко','творог']],
    cheese: ['Сыр','Молочное и яйца',820,1000,364,24,29,0.3,['молоко']],
    sour: ['Сметана','Молочное и яйца',360,1000,206,2.6,20,3.2,['молоко']],
    cream: ['Сливки','Молочное и яйца',170,500,206,2.5,20,3.8,['молоко']],
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
    passata: ['Томаты перетёртые','Бакалея',180,500,32,1.5,0.2,6.5,[]],
    coconutMilk: ['Кокосовое молоко','Бакалея',130,400,190,2,19,3,[]],
    wine: ['Вино красное сухое','Бакалея',450,750,83,0.1,0,2.6,[]],
    starch: ['Кукурузный крахмал','Бакалея',120,200,330,0.3,0.1,82,[]],
    soySauce: ['Соевый соус','Бакалея',180,500,53,8,0.6,4.9,['соя','глютен']],
    honey: ['Мёд','Бакалея',350,500,329,0.8,0,81.5,['мёд']],
    stock: ['Бульон','Бакалея',120,1000,15,2,0.5,1,[]],
    bouillon: ['Бульонные кубики','Бакалея',100,100,170,10,10,15,[]],
    gelatin: ['Желатин','Бакалея',130,50,355,87,0.4,0.7,[]],
    breadcrumbs: ['Панировочные сухари','Бакалея',100,300,347,10,2,72,['глютен']],
    potato: ['Картофель','Овощи',58,1000,77,2,0.4,16.3,[]],
    cabbage: ['Капуста','Овощи',55,1000,25,1.3,0.1,4.7,[]],
    beet: ['Свёкла','Овощи',48,1000,43,1.6,0.2,8.8,['свёкла']],
    carrot: ['Морковь','Овощи',58,1000,35,1.3,0.1,6.9,[]],
    onion: ['Лук','Овощи',52,1000,40,1.1,0.1,8.7,[]],
    leek: ['Лук-порей','Овощи',250,1000,33,2.2,0.2,6.5,[]],
    garlic: ['Чеснок','Овощи',320,1000,149,6.4,0.5,29.9,[]],
    tomato: ['Помидоры','Овощи',240,1000,18,0.9,0.2,3.9,[]],
    cucumber: ['Огурцы','Овощи',190,1000,15,0.7,0.1,3,[]],
    pepper: ['Перец сладкий','Овощи',280,1000,26,1,0.2,5.3,[]],
    zucchini: ['Кабачок','Овощи',140,1000,24,0.6,0.3,4.6,[]],
    pumpkin: ['Тыква','Овощи',85,1000,26,1,0.1,6.5,['тыква']],
    celery: ['Сельдерей','Овощи',180,1000,13,0.9,0.1,2.1,[]],
    mushroom: ['Шампиньоны','Овощи',340,1000,22,3.1,0.3,3.3,['грибы']],
    greens: ['Зелень','Овощи',55,50,35,2.5,0.5,6,[]],
    apple: ['Яблоки','Фрукты',125,1000,47,0.4,0.4,9.8,[]],
    banana: ['Бананы','Фрукты',150,1000,96,1.5,0.5,21,[]],
    cherry: ['Вишня замороженная','Фрукты',180,400,50,0.8,0.2,11,[]]
  };

  // ing(p, g, sourceAmount, estimated)
  //   p — ключ продукта; g — нормализованный вес (для ориентировочного КБЖУ/цены);
  //   sourceAmount — оригинальная мера автора (шт., ложки, стаканы, «по вкусу»);
  //   estimated=true — автор не дал точного количества, вес является нашей расчётной оценкой.
  function ing(p, g, sourceAmount, estimated) {
    return { p, g, sourceAmount: sourceAmount != null ? sourceAmount : `${g} г`, estimated: !!estimated };
  }

  function dish(id, name, meal, opts) {
    return Object.assign({
      id, name, meal, serves: 4, time: 40, activeTime: 40, difficulty: 1, equipment: ['stove'],
      tags: [], batch: false, ingredients: [], steps: [], seasoning: [], source: null
    }, opts);
  }

  // Проверенная sourced-база: 16 блюд с достаточными количествами для автоплана.
  // Авторы: Грильков (YouTube, расшифровка видео) и Друже Обломов / @slavnogram (ТГ-канал с граммовками).
  // Все URL подтверждены, ничего не выдумано. Отсутствующие у автора количества помечены estimated=true
  // и НИКОГДА не выдаются за авторскую граммовку (в карточке показывается оригинальная мера + пометка «оценка»).
  // Блюда с неполными ключевыми граммовками (пельменный суп, терияки, карри-грудка, сердца, сосиски,
  // пельмени из щуки, гречка с тушёнкой и др.) НЕ включены в автоплан, чтобы не пересчитывать покупки наугад.
  const DISHES = [
    // ── ЗАВТРАКИ ────────────────────────────────────────────────
    dish('syrniki','Сырники','breakfast',{serves:6,time:60,activeTime:60,difficulty:2,batch:true,equipment:['stove'],ingredients:[
      ing('cottage',800,'800 г'), ing('egg',180,'3 шт'), ing('sugar',100,'5 ст.л. (~100 г)'),
      ing('flour',110,'5 ст.л. (~110 г)'), ing('butter',30,'для жарки',true), ing('oil',30,'для жарки',true)
    ],seasoning:['ванильный сахар ½ ч.л.'],steps:[
      'Смешать творог, яйца, сахар, ванильный сахар и муку до однородности.',
      'Смочить руки водой, скатать шарики и обвалять в муке.',
      'Жарить на смеси сливочного и подсолнечного масла 3–4 мин с одной стороны и 2–3 мин с другой.'
    ],source:{author:'grillkov',authorName:'Грильков',title:'Запас еды на 6 дней! Завтрак, Обед, Ужин!',url:'https://www.youtube.com/watch?v=LcSKidDf4Xk',verified:true,verificationMethod:'transcript',sourceServings:6,gramsComplete:true}}),
    dish('cottageCasserole','Творожная запеканка с вишней','breakfast',{serves:5,time:50,activeTime:20,difficulty:2,batch:true,equipment:['oven','blender'],ingredients:[
      ing('cottage',500,'500 г (мягкий)'), ing('egg',120,'2 шт'), ing('sugar',100,'½ стакана (~100 г)'),
      ing('flour',150,'6 ст.л. с горкой (~150 г)'), ing('sour',40,'2 ст.л.'), ing('cherry',150,'горсть (~150 г)',true),
      ing('starch',20,'2 ст.л.',true)
    ],seasoning:['ванильный сахар ½ ч.л.','разрыхлитель ½ ч.л.'],steps:[
      'Творог взбить блендером с сахаром и ванильным сахаром, ввести яйца.',
      'Добавить муку с разрыхлителем и сметану, вымешать.',
      'Половину теста выложить в форму, сверху вишню в крахмале, затем остальное тесто. Запекать при 170 °C 30–40 мин.'
    ],source:{author:'oblomoff',authorName:'Друже Обломов',title:'Творожная запеканка с вишней (пост #300)',url:'https://t.me/s/slavnogram/300',verified:true,verificationMethod:'telegram_post',sourceServings:5,gramsComplete:true}}),
    dish('hamSouffle','Омлетное суфле с ветчиной','breakfast',{serves:2,time:30,activeTime:10,equipment:['stove'],ingredients:[
      ing('ham',115,'100–130 г'), ing('egg',180,'3 шт'), ing('milk',100,'100 мл (3,5%)'), ing('cheese',30,'посыпка',true)
    ],seasoning:['соль 2 щепотки','перец ½ щепотки','петрушка'],steps:[
      'Натереть ветчину.',
      'Взбить яйца с солью, перцем, молоком и ветчиной.',
      'Перелить в 2 вложенных пищевых пакета, завязать и варить в кипятке 30 мин под крышкой. Подать с сыром и петрушкой.'
    ],source:{author:'grillkov',authorName:'Грильков',title:'Омлетное суфле с ветчиной',url:'https://www.youtube.com/watch?v=ukHX3jsedBc',verified:true,verificationMethod:'transcript',sourceServings:2,gramsComplete:true}}),
    dish('shakshuka','Шакшука','breakfast',{serves:5,time:25,activeTime:25,equipment:['stove'],ingredients:[
      ing('egg',420,'6–7 шт'), ing('tomato',400,'2 шт'), ing('pepper',200,'1 шт'), ing('onion',150,'1 шт'),
      ing('garlic',12,'2–3 зуб.'), ing('tomatoPaste',30,'1 ст.л.'), ing('stock',200,'1 стакан (~200 мл)')
    ],seasoning:['кориандр 1 ч.л.','зира 1 ч.л.','орегано 1 ч.л.'],steps:[
      'Пассеровать лук и перец.',
      'Добавить томаты, специи и томатную пасту, влить бульон.',
      'Тушить 10–15 мин, затем вбить яйца и довести до готовности белков.'
    ],source:{author:'oblomoff',authorName:'Друже Обломов',title:'Шакшука (пост #794)',url:'https://t.me/s/slavnogram/794',verified:true,verificationMethod:'telegram_post',sourceServings:5,gramsComplete:true}}),
    dish('potatoCheeseOmelette','Картофель в сырном омлете','breakfast',{serves:5,time:30,activeTime:30,equipment:['stove'],ingredients:[
      ing('potato',1000,'1 кг'), ing('mushroom',700,'700 г'), ing('bacon',150,'150 г'), ing('onion',300,'300 г'),
      ing('egg',300,'5 шт'), ing('cheese',70,'70 г'), ing('cream',70,'70 г')
    ],seasoning:['соль, перец','куркума 1 ч.л.'],steps:[
      'Обжарить бекон с луком.',
      'Добавить грибы и картофель, готовить до мягкости.',
      'Залить взбитыми яйцами со сливками и сыром, томить под крышкой ~5 мин.'
    ],source:{author:'oblomoff',authorName:'Друже Обломов',title:'Картофель в сырном омлете (пост #559)',url:'https://t.me/s/slavnogram/559',verified:true,verificationMethod:'telegram_post',sourceServings:5,gramsComplete:true}}),
    dish('baconPotatoBreakfast','Картофельно-яичный завтрак с беконом','breakfast',{serves:2,time:20,activeTime:20,difficulty:2,equipment:['stove','oven'],ingredients:[
      ing('bacon',90,'6 полосок'), ing('potato',800,'6 небольших'), ing('onion',75,'½ шт'), ing('butter',30,'30 г'),
      ing('egg',300,'5 шт'), ing('cheese',175,'150–200 г')
    ],seasoning:['соль, перец, чили','зелёный лук'],steps:[
      'Обжарить бекон до хруста.',
      'Натереть картофель и лук, жарить в вытопленном жире с 30 г масла, посолить.',
      'Залить взбитыми яйцами с сыром, вернуть бекон, посыпать сыром и запечь при 200 °C 8–10 мин.'
    ],source:{author:'grillkov',authorName:'Грильков',title:'Я подсел на такой завтрак',url:'https://www.youtube.com/watch?v=XyKZ37NY-50',verified:true,verificationMethod:'transcript',sourceServings:2,gramsComplete:true}}),

    // ── ОБЕДЫ ───────────────────────────────────────────────────
    dish('chickenNoodleSoup','Идеальный куриный суп с домашней лапшой','lunch',{serves:8,time:210,activeTime:45,difficulty:2,batch:true,equipment:['stove'],ingredients:[
      ing('chickenCarcass',2600,'6–7 шт (для бульона)',true), ing('chickenLeg',1200,'4–5 шт (бёдра с голенью)'), ing('carrot',400,'400 г'), ing('onion',400,'400 г'),
      ing('leek',400,'400 г'), ing('garlic',25,'4–6 зуб.'), ing('egg',126,'7 желтков (лапша)'), ing('flour',300,'300 г (лапша)')
    ],seasoning:['лавровый лист 2 шт','душистый перец 5 гор.','соль ½ ч.л.','раст. масло для обжарки'],steps:[
      'Остовы запечь до золотистости, овощи обжарить и варить бульон ~3 ч на минимальном огне.',
      'Бёдра отварить отдельно (10 мин + 30–40 мин под крышкой).',
      'Замесить лапшу из желтков и муки, отварить ~7 мин. Собрать суп и прогреть 2–3 мин.'
    ],source:{author:'oblomoff',authorName:'Друже Обломов',title:'Идеальный куриный суп с домашней лапшой (посты #813 + #823)',url:'https://t.me/s/slavnogram/813',verified:true,verificationMethod:'telegram_post',sourceServings:8,gramsComplete:true}}),
    dish('pumpkinCoconutSoup','Тыквенный суп-пюре с кокосовым молоком','lunch',{serves:4,time:30,activeTime:15,batch:true,equipment:['stove','blender'],tags:['вегетарианское'],ingredients:[
      ing('pumpkin',500,'500 г'), ing('carrot',130,'1 шт'), ing('onion',150,'1 шт (шалот)'),
      ing('coconutMilk',400,'400 мл'), ing('garlic',8,'1–2 зуб.')
    ],seasoning:['карри 1 ч.л.','лавровый лист'],steps:[
      'Нарезать овощи, варить 20–25 мин.',
      'Пробить блендером с кокосовым молоком, добавить карри.'
    ],source:{author:'oblomoff',authorName:'Друже Обломов',title:'Тыквенный суп-пюре с кокосовым молоком (пост #420)',url:'https://t.me/s/slavnogram/420',verified:true,verificationMethod:'telegram_post',sourceServings:4,gramsComplete:true}}),
    dish('mushroomCreamSoup','Грибной крем-суп с сухариками','lunch',{serves:4,time:35,activeTime:20,batch:true,equipment:['stove','blender'],ingredients:[
      ing('mushroom',300,'300 г'), ing('onion',150,'1 шт'), ing('potato',450,'2–3 шт'), ing('cream',150,'150 мл (20%)'),
      ing('bread',100,'для сухариков',true)
    ],seasoning:['мускатный орех'],steps:[
      'Обжарить грибы с луком, добавить картофель и варить до готовности.',
      'Влить сливки, пробить блендером.',
      'Подать с сухариками из хлеба.'
    ],source:{author:'oblomoff',authorName:'Друже Обломов',title:'Грибной крем-суп с сухариками (пост #370)',url:'https://t.me/s/slavnogram/370',verified:true,verificationMethod:'telegram_post',sourceServings:4,gramsComplete:true}}),
    dish('salmonCreamSoup','Сливочный суп с лососем','lunch',{serves:4,time:40,activeTime:20,batch:true,equipment:['stove'],ingredients:[
      ing('salmon',300,'300 г (филе)'), ing('carrot',130,'1 небольшая'), ing('onion',130,'1 небольшая'),
      ing('potato',540,'3 небольших'), ing('cream',500,'500 мл'), ing('butter',20,'для пассеровки',true)
    ],seasoning:[],steps:[
      'Пассеровать морковь и лук, добавить картофель и воду/бульон.',
      'Добавить лосось кусочками и сливки, проварить до готовности.'
    ],source:{author:'oblomoff',authorName:'Друже Обломов',title:'Сливочный суп с лососем (пост #431)',url:'https://t.me/s/slavnogram/431',verified:true,verificationMethod:'telegram_post',sourceServings:4,gramsComplete:true}}),

    // ── УЖИНЫ ───────────────────────────────────────────────────
    dish('bolognese','Болоньезе (мясной соус на неделю)','dinner',{serves:8,time:120,activeTime:35,difficulty:2,batch:true,equipment:['stove'],ingredients:[
      ing('beef',1200,'1,2 кг (фарш)'), ing('mushroom',300,'300 г'), ing('onion',600,'4 шт'), ing('garlic',30,'5–6 зуб.'),
      ing('passata',480,'~480 г (перетёртые)'), ing('tomato',250,'по вкусу',true), ing('cream',175,'150–200 мл (10%)')
    ],seasoning:['тимьян лимонный','сахар (по вкусу)','лавровый лист'],steps:[
      'Обжарить фарш, добавить лук и чеснок, затем грибы.',
      'Ввести перетёртые томаты и сливки, добавить тимьян и сахар.',
      'Томить 1 ч 20–30 мин, лавровый лист в конце.'
    ],source:{author:'grillkov',authorName:'Грильков',title:'Запас еды: Готовлю мясной соус на неделю',url:'https://www.youtube.com/watch?v=zspzWP3aj9Q',verified:true,verificationMethod:'transcript',sourceServings:8,gramsComplete:true}}),
    dish('braisedPork','Томлёная свинина (большие куски мяса)','dinner',{serves:7,time:330,activeTime:20,batch:true,equipment:['oven'],ingredients:[
      ing('pork',1600,'2 × 800 г (1,6 кг)'), ing('tomatoPaste',60,'2 ст.л.'),
      ing('soySauce',30,'по вкусу (~30 мл)',true), ing('honey',21,'1 ст.л.',true), ing('onion',150,'по вкусу',true)
    ],seasoning:['чеснок сушёный, паприка копчёная, соль, перец, кайенский (натирка)','розмарин'],steps:[
      'Натереть мясо специями.',
      'Сделать соус из воды, томатной пасты, соевого соуса и мёда, залить мясо.',
      'Запекать в фольге при 120 °C 5 часов.'
    ],source:{author:'grillkov',authorName:'Грильков',title:'БОЛЬШИЕ КУСКИ МЯСА! На БОЛЬШУЮ компанию готовлю ТАК!',url:'https://www.youtube.com/watch?v=i_L_SBggS5o',verified:true,verificationMethod:'transcript',sourceServings:7,gramsComplete:true}}),

    dish('chickenJars','Куриные ножки в банке','dinner',{serves:7,time:60,activeTime:30,difficulty:2,batch:true,equipment:['oven'],ingredients:[
      ing('chickenLeg',1440,'12 шт'), ing('onion',500,'500 г'), ing('rice',500,'500 г (басмати)'), ing('cream',500,'500 мл'),
      ing('stock',500,'500 мл')
    ],seasoning:['чеснок сушёный 7 г','паприка 7 г','соль 15 г'],steps:[
      'Обжарить лук до ужарки, затем ножки до корочки.',
      'Залить рис бульоном со сливками и специями, разложить по банкам.',
      'Горлышки под фольгу, 40 мин при 180 °C, закупорить горячими.'
    ],source:{author:'oblomoff',authorName:'Друже Обломов',title:'Куриные ножки в банке (пост #1373)',url:'https://t.me/s/slavnogram/1373',verified:true,verificationMethod:'telegram_post',sourceServings:7,gramsComplete:true}}),
    dish('beefGoulash','Гуляш из говядины','dinner',{serves:9,time:150,activeTime:40,difficulty:2,batch:true,equipment:['stove'],ingredients:[
      ing('beef',2000,'2 кг'), ing('carrot',500,'500 г'), ing('onion',600,'600 г'), ing('celery',350,'350 г'),
      ing('tomatoPaste',60,'2 ст.л.'), ing('wine',200,'1 стакан (~200 мл)'), ing('flour',25,'1 ст.л. (загустить)'),
      ing('garlic',40,'1 головка'), ing('bouillon',20,'1–2 кубика',true), ing('butter',25,'для ру',true)
    ],seasoning:['соль 1 ч.л. с горкой','лавровый лист 2 шт','душистый перец 4 гор.','тимьян пучок'],steps:[
      'Мясо кубиком 3–4 см обжарить до корочки.',
      'Пассеровать овощи, загустить мукой на сливочном масле.',
      'Добавить вино, пасту и специи, тушить 2–2,5 ч (в скороварке 1 ч).'
    ],source:{author:'oblomoff',authorName:'Друже Обломов',title:'Гуляш из говядины (пост #1057)',url:'https://t.me/s/slavnogram/1057',verified:true,verificationMethod:'telegram_post',sourceServings:9,gramsComplete:true}}),
    dish('gostCutlets','Котлеты с пюре по ГОСТу','dinner',{serves:10,time:90,activeTime:60,difficulty:2,batch:true,equipment:['oven','meatGrinder'],ingredients:[
      ing('pork',2000,'2 кг (шея свиная)'), ing('bread',600,'600 г (замоченный)'), ing('onion',600,'600 г'),
      ing('egg',240,'4 шт'), ing('potato',1100,'1,1 кг'), ing('butter',50,'50 г'), ing('cream',500,'500 мл'),
      ing('tomatoPaste',135,'2 ст.л. (~135 г)'), ing('oil',50,'50 мл'), ing('flour',100,'4 ст.л. (~100 г)'),
      ing('breadcrumbs',200,'для панировки',true)
    ],seasoning:['соль 3 ч.л. (котлеты)','соль 1 ч.л. (подлива/пюре)'],steps:[
      'Фарш из мяса, хлеба, лука и яиц; сформировать котлеты ~300 г в сухарях.',
      'Запекать при 200 °C 30 мин + 10 мин в выключенной духовке.',
      'Пюре из картофеля с маслом и сливками; подлива из муки, масла, пасты, воды и сливок.'
    ],source:{author:'oblomoff',authorName:'Друже Обломов',title:'Котлеты с пюре по ГОСТу (посты #1261 + #1271)',url:'https://t.me/s/slavnogram/1261',verified:true,verificationMethod:'telegram_post',sourceServings:10,gramsComplete:true}}),
    dish('homemadeSausage','Домашняя колбаса','dinner',{serves:7,time:150,activeTime:45,difficulty:2,batch:true,equipment:['stove'],ingredients:[
      ing('wholeChicken',1300,'1 шт (1,3 кг)'), ing('beet',100,'1 шт (100 г)'), ing('carrot',100,'2 шт (100 г)'),
      ing('onion',100,'2 шт (100 г)'), ing('garlic',40,'1 головка'), ing('gelatin',40,'40 г')
    ],seasoning:['лавровый лист 3 шт','душистый перец 5 гор.','кориандр 1 ч.л.','перец горошком 1 ч.л.','чеснок сушёный 2 ч.л.','мускатный орех 1 ч.л.','соль 22 г'],steps:[
      'Курицу с овощами варить 2 ч (в скороварке 1 ч).',
      'Разобрать мясо, бульон соединить с желатином и соком свёклы, добавить специи.',
      'Сформировать и убрать в холодильник на ночь.'
    ],source:{author:'oblomoff',authorName:'Друже Обломов',title:'Домашняя колбаса (пост #1132)',url:'https://t.me/s/slavnogram/1132',verified:true,verificationMethod:'telegram_post',sourceServings:7,gramsComplete:true}})
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
    return (d.activeTime || d.time) <= maxTime;
  }
  function hash(s) { let h=2166136261; for (let i=0;i<s.length;i++) { h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
  function cheapest(pool, profile) { return pool.slice().sort((a,b)=>dishStats(a,profile).cost-dishStats(b,profile).cost); }

  function buildPlan(profile) {
    const enabled = profile.meals || {breakfast:true,lunch:true,dinner:true};
    const seed = JSON.stringify(profile);
    const pools = {};
    // В автоплан попадают только блюда с полными граммовками (gramsComplete=true).
    const complete = DISHES.filter(d => d.source && d.source.gramsComplete === true);
    ['breakfast','lunch','dinner'].forEach(meal => {
      pools[meal] = complete.filter(d => d.meal===meal && available(d,profile));
    });
    const unavailableMeals = ['breakfast','lunch','dinner'].filter(meal => enabled[meal] && !pools[meal].length);
    const slotCount = 7 * ['breakfast','lunch','dinner'].filter(m=>enabled[m]).length;
    const target = Math.max(1, Number(profile.budget || 6000) - 180) / Math.max(1, slotCount);
    const result=[];
    let previous={};
    for (let day=0; day<7; day++) {
      for (const meal of ['breakfast','lunch','dinner']) {
        if (!enabled[meal]) continue;
        if (!pools[meal].length) continue;
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
    const reserve=result.length?180:0;
    const exactCost=Math.round(shopping.reduce((n,x)=>n+x.cost,0)+reserve);
    return { entries:result, shopping, cost:exactCost, reserve, overBudget:exactCost>Number(profile.budget||6000), unavailableMeals, profile };
  }

  function buildShopping(entries, profile) {
    const sums={};
    entries.forEach(e => {
      if (!e.dish.source || e.dish.source.gramsComplete !== true) return;
      e.dish.ingredients.forEach(x => { sums[x.p]=(sums[x.p]||0)+x.g*scaleFor(e.dish,profile); });
    });
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

  const VALID_SOURCE_HOSTS = new Set(['youtube.com','www.youtube.com','t.me']);
  function validSourceUrl(u) {
    try { return VALID_SOURCE_HOSTS.has(new URL(u).hostname); } catch { return false; }
  }

  function validateData() {
    const errors=[];
    DISHES.forEach(d=>{
      if (!d.id||!d.name||!['breakfast','lunch','dinner'].includes(d.meal)) errors.push(`bad dish ${d.id}`);
      d.ingredients.forEach(x=>{ if(!PRODUCTS[x.p]) errors.push(`${d.id}: ${x.p}`); if(!(x.g>0)) errors.push(`${d.id}: bad qty`); });
      const s=d.source;
      if (!s) errors.push(`${d.id}: no source`);
      else {
        if (!['grillkov','oblomoff'].includes(s.author)) errors.push(`${d.id}: bad author`);
        if (!s.authorName) errors.push(`${d.id}: no authorName`);
        if (!s.title) errors.push(`${d.id}: no title`);
        if (!validSourceUrl(s.url)) errors.push(`${d.id}: bad url`);
        if (s.verified !== true) errors.push(`${d.id}: not verified`);
        if (!s.verificationMethod) errors.push(`${d.id}: no verificationMethod`);
        if (!(s.sourceServings > 0)) errors.push(`${d.id}: bad sourceServings`);
        if (s.gramsComplete !== true) errors.push(`${d.id}: grams incomplete`);
      }
    });
    return errors;
  }

  return { STORE_FACTORS, PRODUCTS, DISHES, product, portions, dishStats, dishTags, available, buildPlan, buildShopping, formatQty, validSourceUrl, validateData };
});
