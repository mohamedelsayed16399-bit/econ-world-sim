'use strict';

const $=id=>document.getElementById(id);
const fmt=n=>{const neg=n<0;n=Math.abs(n);let s;
  if(n>=1e9)s=(n/1e9).toFixed(2)+' مليار';else if(n>=1e6)s=(n/1e6).toFixed(2)+' م'+'ليون';else if(n>=1e3)s=(n/1e3).toFixed(1)+' ألف';else s=n.toFixed(n<10?2:0);
  return (neg?'-':'')+s;};
const fmtD=n=>fmt(n)+' د.';
const rnd=(a,b)=>a+RNG()*(b-a);
let RNG=Math.random.bind(Math);
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const gauss=()=> (RNG()+RNG()+RNG()+RNG()-2)/1.0;

const SECTORS=['تقنية','طاقة','أغذية','بنوك','نقل','أدوية','عقارات','تجزئة','كريبتو'];
const CITIES=[
  {n:'القاهرة',cost:50000,mult:1.0},{n:'الرياض',cost:120000,mult:1.3},{n:'دبي',cost:150000,mult:1.45},
  {n:'لندن',cost:250000,mult:1.7},{n:'طوكيو',cost:280000,mult:1.75},{n:'نيويورك',cost:320000,mult:1.9},
];
const GLOBAL_EVENTS=[
  {ic:'⚔️',n:'حرب تجارية عالمية',days:3,eff:{'*':-1.1},gold:true,msg:'هروب نحو الملاذات الآمنة والذهب'},
  {ic:'🛢️',n:'طفرة نفطية',days:3,eff:{'طاقة':2.6,'نقل':-0.8},msg:'أسهم الطاقة تتضخم والنقل يتضرر'},
  {ic:'💊',n:'جائحة عالمية',days:4,eff:{'*':-0.8,'أدوية':2.2},msg:'الأدوية تزدهر وباقي السوق يترنح'},
  {ic:'🤖',n:'طفرة الذكاء الاصطناعي',days:3,eff:{'تقنية':2.4},msg:'شركات التقنية في عنان السماء'},
  {ic:'🏦',n:'أزمة مصرفية عالمية',days:2,eff:{'*':-1.4,'بنوك':-2.5},gold:true,msg:'البنوك في عين العاصفة'},
  {ic:'☀️',n:'انتعاش اقتصادي عالمي',days:3,eff:{'*':1.3},msg:'تفاؤل يعم كل الأسواق'},
  {ic:'🔪',n:'حرب أسعار عنيفة',days:2,eff:{'تجزئة':-2.0,'أغذية':-0.6},msg:'عمالقة التجزئة يذبحون بعضهم بالتخفيضات'},
  {ic:'🚀',n:'سباق فضاء جديد',days:3,eff:{'تقنية':1.8,'طاقة':0.7},msg:'عقود فضائية مليارية تشعل التقنية'},
  {ic:'💱',n:'أزمة عملات عالمية',days:2,eff:{'*':-0.6,'بنوك':-1.6},gold:true,msg:'عملات تنهار والمستثمرون يلوذون بالذهب'},
  {ic:'🏘️',n:'فقاعة عقارية',days:3,eff:{'عقارات':2.8,'بنوك':0.8},msg:'أسعار العقارات تحلق والبنوك تمول الحلم'},
  {ic:'⚡',n:'قمع تنظيمي للكريبتو',days:2,eff:{'كريبتو':-2.8},msg:'حكومات تلوّح بالحظر والكريبتو ينزف'},
  {ic:'🌾',n:'أزمة غذاء عالمية',days:3,eff:{'أغذية':2.4,'تجزئة':-0.9},msg:'محاصيل شحيحة وأسعار الغذاء تشتعل'},
];
const MACRO=[
  {n:'توسع',ic:'📈',bias:0.0005,msg:'الاقتصاد في توسع — الأسهم تتنفس'},
  {n:'ذروة',ic:'🔥',bias:0.0001,msg:'ذروة الدورة — الحذر واجب'},
  {n:'ركود',ic:'📉',bias:-0.0006,msg:'ركود — الأسهم تنزف والملاذات تلمع'},
  {n:'قاع',ic:'🌱',bias:-0.0001,msg:'قاع الدورة — فرص الشراء تتكون'},
];
function pmult(){return 1+0.15*(S.prestige||0);}
const COMPS=[
 ['نخبة تك','تقنية',142,0.05],['سحابة','تقنية',88,0.06],['اتصالاتنا','تقنية',41,0.04],
 ['طاقة المستقبل','طاقة',64,0.05],['بترو الصحراء','طاقة',97,0.045],
 ['الصفا للأغذية','أغذية',33,0.03],['مزارع الوفرة','أغذية',21,0.035],
 ['بنك الواحة','بنوك',76,0.03],['بنك النور','بنوك',52,0.032],
 ['أسطول النقل','نقل',29,0.04],['طيران النسر','نقل',58,0.05],
 ['دواء الشفاء','أدوية',112,0.035],['عقارات النيل','عقارات',45,0.04],['أسواق المدينة','تجزئة',26,0.035]
];
const FX=[['دولار',1.0],['يورو',1.09],['جنيه',0.032],['ين',0.0067]];
const CMD=[['ذهب',74],['نفط',82],['قمح',6.4]];
const CRYPTO=[['بيتكوين',45000,0.06],['إيثريوم',3200,0.075],['ميم كوين',0.5,0.16]];
const NPC_NAMES=['الحاج سليمان','مدام كريمة','المهندس طارق','الأسطى رمضان','د. سوسن','الكابتن مجدي','الست ليلى','باشا فؤاد','أنور بيك','الحاجة زينب','سيد الغفار','نادية شكري'];

const NEWS_T=[
 {t:'اكتشاف حقل غاز ضخم',k:'sector',s:'طاقة',m:.09,hot:1,g:1},
 {t:'حريق في مصافي النفط',k:'sector',s:'طاقة',m:-.07,hot:1},
 {t:'طفرة ذكاء اصطناعي جديدة',k:'sector',s:'تقنية',m:.08,g:1},
 {t:'اختراق أمني كبير لشركات التقنية',k:'sector',s:'تقنية',m:-.08,hot:1},
 {t:'موجة جفاف تضرب المحاصيل',k:'cmd',s:'قمح',m:.12,hot:1},
 {t:'محصول قياسي هذا العام',k:'cmd',s:'قمح',m:-.09,g:1},
 {t:'توترات جيوسياسية في المنطقة',k:'all',m:-.05,hot:1},
 {t:'اتفاق سلام تاريخي',k:'all',m:.06,g:1},
 {t:'البنك المركزي يرفع الفائدة',k:'rate',m:.01,hot:1},
 {t:'البنك المركزي يخفض الفائدة',k:'rate',m:-.01,g:1},
 {t:'فضيحة محاسبية في القطاع المصرفي',k:'sector',s:'بنوك',m:-.09,hot:1},
 {t:'قروض ميسّرة للشركات الصغيرة',k:'sector',s:'بنوك',m:.05,g:1},
 {t:'لقاح جديد يحقق نتائج مبهرة',k:'sector',s:'أدوية',m:.10,g:1},
 {t:'سحب دواء شهير من الأسواق',k:'sector',s:'أدوية',m:-.08,hot:1},
 {t:'إضراب عمال الموانئ',k:'sector',s:'نقل',m:-.07,hot:1},
 {t:'افتتاح أكبر ميناء جاف',k:'sector',s:'نقل',m:.06,g:1},
 {t:'طفرة عقارية في العاصمة',k:'sector',s:'عقارات',m:.08,g:1},
 {t:'انهيار أسعار الأراضي',k:'sector',s:'عقارات',m:-.08,hot:1},
 {t:'موسم تسوق قياسي',k:'sector',s:'تجزئة',m:.07,g:1},
 {t:'التضخم يقفز لأعلى مستوى',k:'fx',s:'دولار',m:.05,hot:1},
 {t:'العملة المحلية تتعزز',k:'fx',s:'دولار',m:-.04,g:1},
 {t:'هرع المستثمرين للملاذات الآمنة',k:'cmd',s:'ذهب',m:.10,hot:1},
 {t:'تراجع الطلب على الذهب',k:'cmd',s:'ذهب',m:-.06},
 {t:'أوبك تخفض الإنتاج',k:'cmd',s:'نفط',m:.11,hot:1},
 {t:'فائض نفطي عالمي',k:'cmd',s:'نفط',m:-.09},
 {t:'موجة تفاؤل تجتاح الأسواق',k:'all',m:.04,g:1},
 {t:'مخاوف ركود عالمي',k:'all',m:-.04,hot:1},
 {t:'أمراض تضرب المواشي',k:'sector',s:'أغذية',m:.07,hot:1},
 {t:'دعم حكومي للمزارعين',k:'sector',s:'أغذية',m:-.04,g:1},
 {t:'اعتماد بيتكوين عملة رسمية في دولة كبرى',k:'crypto',m:.14,hot:1,g:1},
 {t:'حملة تنظيمية عالمية على الكريبتو',k:'crypto',m:-.13,hot:1},
 {t:'اختراق أكبر منصة تداول رقمية',k:'crypto',m:-.10,hot:1},
 {t:'موجة اهتمام مؤسسي بالكريبتو',k:'crypto',m:.09,g:1},
];

let S=null;
const FUNDS=[['صندوق الحذر 🛡️',0.006,0.008],['صندوق التوازن ⚖️',0.016,0.012],['صندوق المغامر 🚀',0.04,0.018]];
function freshState(){
  const st={day:1,hour:8,cash:100000,dep:0,loan:0,rate:0.04,infl:0.03,mood:0.15,
    assets:{},news:[],tx:[],nwHist:[100000],company:null,miles:{},repQ:0,
    nextNews:null,achv:{},sectorHist:{},coveredProfit:0,divCount:0,tips:0,tipUsed:0};
  COMPS.forEach(c=>{st.assets['س:'+c[0]]={kind:'stock',name:c[0],sector:c[1],price:c[2],base:c[2],vol:c[3],
    sent:0,trend:0,hist:[c[2]],held:0,avg:0,short:0,shortAvg:0,div:0.004+RNG()*0.01};});
  FX.forEach(c=>{st.assets['ع:'+c[0]]={kind:'fx',name:c[0],price:c[1],base:c[1],vol:0.008,sent:0,trend:0,hist:[c[1]],held:0,avg:0,short:0,shortAvg:0};});
  CMD.forEach(c=>{st.assets['م:'+c[0]]={kind:'cmd',name:c[0],price:c[1],base:c[1],vol:0.03,sent:0,trend:0,hist:[c[1]],held:0,avg:0,short:0,shortAvg:0};});
  CRYPTO.forEach(c=>{st.assets['ك:'+c[0]]={kind:'crypto',name:c[0],sector:'كريبتو',price:c[1],base:c[1],vol:c[2],sent:0,trend:0,hist:[c[1]],held:0,avg:0,short:0,shortAvg:0};});
  SECTORS.forEach(sec=>{st.assets['ص:'+sec]={kind:'etf',name:'صندوق '+sec,sector:sec,price:100,base:100,vol:0.015,sent:0,trend:0,hist:[100],held:0,avg:0,short:0,shortAvg:0};});
  CITIES.forEach(ct=>{st.assets['ب:'+ct.n]={kind:'cidx',name:'بورصة '+ct.n,sector:ct.n,price:100,base:100,vol:0.022,sent:0,trend:0,hist:[100],held:0,avg:0,short:0,shortAvg:0};});
  st.npcs=NPC_NAMES.map(n=>({name:n,worth:rnd(60000,900000),prev:0}));
  SECTORS.forEach(s=>st.sectorHist[s]=[100]);
  st.orders=[];st.alerts=[];st.acq={list:[],next:5};st.corp=null;st.contests=[];st.stats={trades:0,divTotal:0,tipsBought:0,bestTrade:0};st.snd=true;st.macro={phase:0,days:8};
  st.props={};st.propPrice={'شقة وسط البلد':60000,'محل تجاري':120000,'فيلا':200000,'برج مكاتب':500000};
  st.propBase=Object.assign({},st.propPrice);st.bonds=[];st.goal=null;st.rival=null;st.tut=0;st.rentTotal=0;
  st.theme='dark';st.bubbles={};st.offers=0;st.quests=[];st.questDay=0;st.bankruptcies=0;
  st.lotto={pool:20000,tickets:0};st.moodHist=[0.15];st.sortKey=null;
  st.notifs=[];st.splits=0;
  st.prestige=0;st.gEvent=null;st.cityStatus={};st.challenge=null;st.options=[];st.autopilot=false;st.subsidiary=null;st.weekly=null;st.hof=[];st.mining={rigs:0,upg:0,total:0};st.auction=null;st.empire=[];st.ins={until:0,paid:0};st.followers=0;st.quiz={day:0,streak:0,won:0};st.duel=null;st.duelWins=0;st.fundP=[100,100,100];st.fundHist=[[100],[100],[100]];st.fundH=[0,0,0];st.fundAvg=[0,0,0];st.confDay=-20;st.vc=[];st.vcDeal=null;st.vcNext=3;st.vcWins=0;st.vcLost=0;st.marginPos=null;st.recPeak=100000;st.recBestDay=0;st.hf={on:false,capital:0,hwm:0,fees:0,streak:0};
  st.war={active:null,next:6,shield:0,shieldDays:0,wins:0,losses:0,log:[],blocked:0};
  st.allies={list:[],pact:null,heat:0,fines:0,log:[]};
  pushNews(st,'افتتاح السوق العالمية للمحاكاة — حظ موفق أيها المستثمر!',0,false);
  return st;
}
function migrate(){
  
  const defs=freshState().assets;
  for(const k in defs){if(!S.assets[k])S.assets[k]=defs[k];}
  for(const k in S.assets){const a=S.assets[k];if(a.short==null)a.short=0;if(a.shortAvg==null)a.shortAvg=0;}
  if(!S.nextNews&&S.nextNews!==null)S.nextNews=null;
  if(!S.achv)S.achv={};if(!S.sectorHist){S.sectorHist={};SECTORS.forEach(s=>S.sectorHist[s]=[100]);}
  SECTORS.forEach(s=>{if(!S.sectorHist[s])S.sectorHist[s]=[100];});
  if(S.coveredProfit==null)S.coveredProfit=0;if(S.divCount==null)S.divCount=0;
  if(S.tips==null)S.tips=0;if(S.tipUsed==null)S.tipUsed=0;
  if(!S.orders)S.orders=[];if(!S.alerts)S.alerts=[];
  if(!S.acq)S.acq={list:[],next:5};
  if(S.corp===undefined)S.corp=null;
  if(!S.contests)S.contests=[];
  if(S.pubAuc===undefined)S.pubAuc=null;
  if(S.nextAuc==null)S.nextAuc=0;
  if(!S.macro)S.macro={phase:0,days:8};
  if(S.company){
    if(S.company.morale==null)S.company.morale=60;
    if(S.company.wage==null)S.company.wage=1;
    if(!S.company.staff)S.company.staff={eng:0,sales:0,mkt:0};
    STAFF.forEach(x=>{if(S.company.staff[x.k]==null)S.company.staff[x.k]=0;});
    if(!S.company.hist)S.company.hist=[];
    if(S.company.brand==null)S.company.brand=10;
    if(S.company.campaign===undefined)S.company.campaign=null;
    if(S.company.rep==null)S.company.rep=50;
    if(S.company.crisis===undefined)S.company.crisis=null;
    if(!S.company.inv)S.company.inv=invDef();
    if(!S.company.ipo)S.company.ipo={listed:false};
    if(!S.company.sup)S.company.sup={active:null,offers:[],history:[],deals:0};
    if(!S.company.team)S.company.team={xp:{eng:0,sales:0,mkt:0},lastBonus:-99,bonuses:0,trains:0};
    if(S.company.aucIncome==null)S.company.aucIncome=0;
    if(S.company.aucValue==null)S.company.aucValue=0;
    if(!S.company.subs)S.company.subs={active:false,plan:null,members:0,price:0,mrr:0,churn:0,total:0,launchDay:0};
    if(!S.company.care)S.company.care={agents:0,csat:70,tickets:0,resolved:0,backlog:0,trained:0};
  }
  if(!S.stats)S.stats={trades:0,divTotal:0,tipsBought:0,bestTrade:0};
  if(S.stats.worstTrade==null)S.stats.worstTrade=0;
  if(S.snd==null)S.snd=true;
  if(!S.props)S.props={};
  if(!S.propPrice)S.propPrice={'شقة وسط البلد':60000,'محل تجاري':120000,'فيلا':200000,'برج مكاتب':500000};
  if(!S.propBase)S.propBase=Object.assign({},S.propPrice);
  if(!S.bonds)S.bonds=[];if(S.goal===undefined)S.goal=null;if(S.rival===undefined)S.rival=null;
  if(!S.tut)S.tut=0;if(!S.rentTotal)S.rentTotal=0;
  if(!S.theme)S.theme='dark';if(!S.bubbles)S.bubbles={};if(S.offers==null)S.offers=0;
  if(!S.quests)S.quests=[];if(!S.questDay)S.questDay=0;if(!S.bankruptcies)S.bankruptcies=0;
  if(!S.lotto)S.lotto={pool:20000,tickets:0};if(!S.moodHist)S.moodHist=[S.mood||0];
  if(S.sortKey===undefined)S.sortKey=null;
  if(!S.notifs)S.notifs=[];if(!S.splits)S.splits=0;
  if(!S.prestige)S.prestige=0;if(S.gEvent===undefined)S.gEvent=null;
  if(!S.cityStatus)S.cityStatus={};
  if(S.challenge===undefined)S.challenge=null;
  if(!S.options)S.options=[];
  if(S.autopilot===undefined)S.autopilot=false;
  if(S.subsidiary===undefined)S.subsidiary=null;
  if(S.weekly===undefined)S.weekly=null;
  if(!S.hof)S.hof=[];
  if(!S.mining)S.mining={rigs:0,upg:0,total:0};
  if(S.auction===undefined)S.auction=null;if(!S.empire)S.empire=[];
  if(!S.ins)S.ins={until:0,paid:0};
  if(S.followers==null)S.followers=0;
  if(!S.quiz)S.quiz={day:0,streak:0,won:0};if(S.duel===undefined)S.duel=null;if(S.duelWins==null)S.duelWins=0;
  if(!S.fundP)S.fundP=[100,100,100];if(!S.fundHist)S.fundHist=[[100],[100],[100]];if(!S.fundH)S.fundH=[0,0,0];if(!S.fundAvg)S.fundAvg=[0,0,0];
  if(S.confDay==null)S.confDay=-20;
  if(!S.vc)S.vc=[];if(S.vcDeal===undefined)S.vcDeal=null;if(S.vcNext==null)S.vcNext=3;if(S.vcWins==null)S.vcWins=0;if(S.vcLost==null)S.vcLost=0;
  if(!S.hf)S.hf={on:false,capital:0,hwm:0,fees:0,streak:0};
  if(S.marginPos===undefined)S.marginPos=null;if(S.recPeak==null)S.recPeak=100000;if(S.recBestDay==null)S.recBestDay=0;
  if(!S.war)S.war={active:null,next:(S.day||1)+4,shield:0,shieldDays:0,wins:0,losses:0,log:[],blocked:0};
  if(S.war.active===undefined)S.war.active=null;if(S.war.next==null)S.war.next=(S.day||1)+4;
  if(S.war.shield==null)S.war.shield=0;if(S.war.shieldDays==null)S.war.shieldDays=0;
  if(S.war.wins==null)S.war.wins=0;if(S.war.losses==null)S.war.losses=0;if(!S.war.log)S.war.log=[];
  if(S.war.blocked==null)S.war.blocked=0;
  if(S.merger===undefined)S.merger=null;
  if(S.fr===undefined)S.fr=null;
  if(S.bid===undefined)S.bid=null;
  if(!S.allies)S.allies={list:[],pact:null,heat:0,fines:0,log:[]};
  if(!S.allies.list)S.allies.list=[];if(S.allies.pact===undefined)S.allies.pact=null;
  if(S.allies.heat==null)S.allies.heat=0;if(S.allies.fines==null)S.allies.fines=0;if(!S.allies.log)S.allies.log=[];
}
function pushNews(st,text,impact,hot,good){
  st.news.unshift({d:st.day,h:st.hour,text,hot:!!hot,good:!!good});
  if(st.news.length>60)st.news.pop();
}
function save(){try{localStorage.setItem('econLive1',JSON.stringify(S));}catch(e){}}
function load(){try{const s=localStorage.getItem('econLive1');if(s){S=JSON.parse(s);return true;}}catch(e){}return false;}

function companyValue(){
  const c=S.company;if(!c)return 0;
  const ann=Math.max(c.lastYearProfit,0);
  const subVal=(c.subs&&c.subs.active)?Math.round((c.subs.mrr||0)*6):0;
  return Math.max(0,c.cash)+ann*4+c.quality*800+(c.aucValue||0)+subVal;
}
function propsValue(){let v=0;for(const n in S.props){v+=S.props[n].qty*(S.propPrice[n]||S.props[n].avg);}return v;}
function netWorth(){
  let n=S.cash+S.dep-S.loan+propsValue();
  for(const k in S.bonds)n+=S.bonds[k].amt*1.04;
  for(const k in S.assets){const a=S.assets[k];n+=a.held*a.price;n-=(a.short||0)*a.price;}
  if(S.fundH)for(let i=0;i<3;i++)n+=S.fundH[i]*(S.fundP?S.fundP[i]:100);
  if(S.company&&S.company.ipo&&S.company.ipo.listed&&S.company.ticker&&S.assets[S.company.ticker])n+=S.company.ipo.founder*S.assets[S.company.ticker].price;
  return n+companyValue();
}
function shortValue(){let v=0;for(const k in S.assets){const a=S.assets[k];v+=(a.short||0)*a.price;}return v;}

let tickCount=0;
function tick(){
  S.hour++;
  tickCount++;
  
  S.mood+= (0.1-S.mood)*0.01 + gauss()*0.01;
  S.mood=Math.max(-0.6,Math.min(0.8,S.mood));

  for(const k in S.assets){
    const a=S.assets[k];
    const mb=MACRO[S.macro.phase].bias;
    const drift = a.trend + a.sent*0.4 + S.mood*(a.kind==='stock'?0.25:a.kind==='cmd'?0.08:a.kind==='crypto'?0.4:-0.05) + (a.kind==='stock'?0.00025+mb:a.kind==='crypto'?mb*1.5:a.kind==='cmd'?-mb*0.6:0) + (a.kind==='cidx'?(S.cityStatus[a.sector]==='boom'?0.05:S.cityStatus[a.sector]==='bust'?-0.05:0):0);
    const chg = drift*0.02 + gauss()*a.vol*0.16;
    a.price=Math.max(a.base*0.05, a.price*(1+chg));
    a.sent*=0.97;
    a.hist.push(a.price);
    if(a.hist.length>2200)a.hist.shift();
  }
  
  if(!S.nextNews&&RNG()<0.05){
    S.nextNews={i:Math.floor(RNG()*NEWS_T.length),h:Math.round(rnd(5,26))};
    S.tipUsed=0;
  }
  if(S.nextNews){
    S.nextNews.h--;
    if(S.nextNews.h<=0){fireNews(S.nextNews.i);S.nextNews=null;}
  }
  
  S.moodHist.push(S.mood);
  if(S.moodHist.length>800)S.moodHist.shift();
  
  SECTORS.forEach(sec=>{
    let s=0,n=0;
    for(const k in S.assets){const a=S.assets[k];if((a.kind==='stock'||a.kind==='crypto')&&a.sector===sec){s+=a.price/a.base;n++;}}
    if(n){const h=S.sectorHist[sec];h.push(100*s/n);if(h.length>2200)h.shift();}
  });
  
  for(const k in S.assets){const a=S.assets[k];
    if(a.kind==='etf'){const h=S.sectorHist[a.sector];
      if(h&&h.length)a.price=h[h.length-1];
      a.hist.push(a.price);if(a.hist.length>2200)a.hist.shift();
    }
  }
  
  checkOrders();
  checkAlerts();
  
  if(S.hour>=24){S.hour=0;S.day++;endOfDay();}
}
function endOfDay(){
  
  if(S.macro){S.macro.days--;
    if(S.macro.days<=0){
      S.macro.phase=(S.macro.phase+1)%4;
      S.macro.days=Math.round(rnd(6,12));
      const m=MACRO[S.macro.phase];
      pushNews(S,'🌡️ دورة الاقتصاد انتقلت إلى مرحلة "'+m.n+'" — '+m.msg,m.bias>0?0.02:-0.02,true,true);
      toast('🌡️ مرحلة جديدة: '+m.ic+' '+m.n);
    }
  }
  if(S.acq&&S.day>=S.acq.next){S.acq.list=genAcq();S.acq.next=S.day+12;}
  updateCorpStock();
  pubAucTick();
  warTick();
  allyTick();
  if(S.corp&&S.day%7===0){
    S.corp.forEach(c=>{
      c.value=Math.max(50000,Math.round(c.value*(1+rnd(-0.03,0.05))));
      c.rep=Math.max(0,Math.min(100,c.rep+rnd(-2,2)));
      c.brand=Math.max(0,Math.min(100,c.brand+rnd(-2,2)));
    });
    runContest();
  }
  
  S.dep*=1+S.rate/365;
  S.loan*=1+0.09/365;
  
  if(S.mining&&S.mining.rigs>0){
    const eff=1+S.mining.upg*0.5;
    let ch=0,cnt=0;
    Object.keys(S.assets).forEach(k=>{const a=S.assets[k];if(a.kind==='crypto'&&a.hist.length>1){ch+=a.price/a.hist[a.hist.length-2]-1;cnt++;}});
    const mm=cnt?ch/cnt:0;
    const inc=Math.round(S.mining.rigs*eff*250*Math.max(0.2,1+mm*8));
    S.cash+=inc;S.mining.total+=inc;
    log('⛏️ تعدين: +'+fmtD(inc));
  }
  
  if(S.empire&&S.empire.length){S.cash+=S.empire.reduce((s,e)=>s+e.profit,0);}
  
  if(S.auction&&S.day>=S.auction.ends){
    if(S.auction.bid>S.auction.npc){
      S.cash-=S.auction.bid;
      S.empire.push({name:S.auction.name,sector:S.auction.sector,profit:Math.max(200,Math.round(S.auction.val*0.006))});
      pushNews(S,'🏆 فزت بمزاد أصول "'+S.auction.name+'" — أصبحت تدر دخلًا يوميًا!',0.02,true,true);
      toast('🏆 فزت بالمزاد!');
    }else if(S.auction.bid>0){
      pushNews(S,'🔨 خسرت مزاد "'+S.auction.name+'" لصالح مستثمر منافس',0,false,true);
    }
    S.auction=null;
  }
  
  Object.keys(S.assets).forEach(k=>{const a=S.assets[k];
    if(a.kind==='stock'&&a.price>400){
      a.price/=2;a.hist=a.hist.map(v=>v/2);
      if(a.held){a.held*=2;a.avg/=2;}
      if(a.short){a.short*=2;a.shortAvg=(a.shortAvg||a.price)/2;}
      S.splits++;
      pushNews(S,'✂️ تقسيم سهم '+a.name+' (1 لـ 2) بعد تجاوزه 400 د.',0,true,true);
      toast('✂️ تقسيم سهم '+a.name+': أسهمك اتضاعفت');
    }});
  
  if(S.day%10===0){
    let beats=0,misses=0;
    Object.keys(S.assets).forEach(k=>{const a=S.assets[k];
      if(a.kind!=='stock')return;
      const surp=gauss();
      a.price=Math.max(a.base*0.05,a.price*(1+surp*0.055));
      a.hist[a.hist.length-1]=a.price;
      if(surp>1.4){beats++;if(beats<=2)pushNews(S,'📊 '+a.name+' تفوق التوقعات بأرباح قوية',surp*0.04,true,true);}
      else if(surp<-1.4){misses++;if(misses<=2)pushNews(S,'📉 '+a.name+' تخيب الآمال في نتائجها',surp*0.04,true);}
    });
    toast('📊 موسم الأرباح: '+beats+' فاقت التوقعات و'+misses+' خيّبت');
  }
  
  Object.keys(S.assets).forEach(k=>{const a=S.assets[k];
    if((a.kind==='stock'||a.kind==='crypto')&&a.short>0&&a.shortAvg>0&&a.price>a.shortAvg*1.18){
      const q=Math.ceil(a.short/2);
      S.cash-=q*a.price+fee(q*a.price);
      S.coveredProfit+=(a.shortAvg-a.price)*q;
      a.short-=q;if(!a.short)a.shortAvg=0;
      pushNews(S,'🌀 ضغط شورت عنيف على '+a.name+'! المضاربون يتدافعون للتغطية',0.03,true);
      toast('🌀 ضغط شورت! تغطية إجبارية لنصف مركزك في '+a.name);
      log('ضغط شورت: تغطية إجبارية '+q+' × '+a.name);
    }});
  
  settleOptions();
  
  runAutopilot();
  
  if(S.weekly&&S.day>=S.weekly.endDay)finishWeekly();
  
  if(S.gEvent){
    const e=S.gEvent;
    Object.keys(S.assets).forEach(k=>{const a=S.assets[k];
      const secHit=e.eff[a.sector]!==undefined?e.eff[a.sector]:null;
      const ef=secHit!==null?secHit:((a.kind==='stock')?(e.eff['*']||0):0);
      const goldB=(e.gold&&a.kind==='cmd')?1.1:0;
      if(ef||goldB){a.price=Math.max(a.base*0.05,a.price*(1+(ef+goldB)/100));a.hist[a.hist.length-1]=a.price;}
    });
    e.days--;
    if(e.days<=0){pushNews(S,'✅ انقضى الحدث العالمي: '+e.n,0,false,true);toast('🌍 انتهى: '+e.n);S.gEvent=null;}
  }else if(RNG()<0.14){
    const e=JSON.parse(JSON.stringify(GLOBAL_EVENTS[Math.floor(RNG()*GLOBAL_EVENTS.length)]));
    S.gEvent=e;
    pushNews(S,e.ic+' حدث عالمي: '+e.n+'! '+e.msg,0,true,true);
    toast(e.ic+' حدث عالمي: '+e.n);beep(900,.2);
  }
  renderGEvent();
  
  tickChallenge();
  CITIES.forEach(ct=>{
    const cur=S.cityStatus[ct.n]||'normal';
    if(RNG()<0.10){
      const nx=RNG()<0.35?'boom':RNG()<0.5?'bust':'normal';
      if(nx!==cur){
        S.cityStatus[ct.n]=nx;
        if(nx!=='normal')pushNews(S,(nx==='boom'?'🔥 طفرة اقتصادية في ':'🧊 كساد يضرب ')+ct.n,0,nx==='boom',nx==='boom');
      }
    }
  });
  
  let divSum=0;
  for(const k in S.assets){const a=S.assets[k];
    if(a.kind==='stock'&&a.held>0&&RNG()<0.08){const d=a.held*a.price*a.div/90;divSum+=d;}}
  if(divSum>1){divSum=Math.round(divSum*pmult());S.cash+=divSum;S.divCount++;S.stats.divTotal+=divSum;toast('توزيعات أرباح: +'+fmtD(divSum));beep(660,.08);}
  
  if(RNG()<0.22){
    const npc=S.npcs[Math.floor(RNG()*S.npcs.length)];
    const keys=Object.keys(S.assets).filter(k=>S.assets[k].kind==='stock');
    const a=S.assets[keys[Math.floor(RNG()*keys.length)]];
    const dir=RNG()<0.5?1:-1;
    a.sent+=dir*0.03;
    pushNews(S,(dir>0?npc.name+' يشتري حصة كبيرة في ':npc.name+' يتخلص من أسهم ')+a.name,dir*0.03,dir<0,dir>0);
    refreshNewsUI();
  }
  
  if(shortValue()>netWorth()*0.6&&shortValue()>0){
    for(const k in S.assets){const a=S.assets[k];
      if(a.short>0){S.cash-=a.short*a.price-fee(a.short*a.price);log('نداء هامش: تغطية إجبارية '+a.short+' × '+a.name);a.short=0;a.shortAvg=0;}}
    toast('🚨 نداء هامش! غطّينا مراكزك المكشوفة إجباريًا');
  }
  checkAchv();
  
  S.orders.slice().forEach(o=>{
    const a=S.assets[o.sym];if(!a)return;
    const hit=o.dir==='buy'?a.price<=o.target:a.price>=o.target;
    if(hit){
      S.orders.splice(S.orders.indexOf(o),1);
      const q=o.q;
      if(o.dir==='buy'){
        const cost=q*a.price+fee(q*a.price);
        if(cost<=S.cash){S.cash-=cost;const tot=a.held*a.avg+q*a.price;a.held+=q;a.avg=tot/a.held;
          log('أمر محدد: شراء '+q+' × '+a.name+' @ '+a.price.toFixed(2));toast('⚡ نُفذ أمر الشراء: '+a.name);}
        else toast('⚠️ فشل أمر الشراء (كاش غير كافٍ): '+a.name);
      }else{
        if(q<=a.held){S.cash+=q*a.price-fee(q*a.price);a.held-=q;if(!a.held)a.avg=0;
          log('أمر محدد: بيع '+q+' × '+a.name+' @ '+a.price.toFixed(2));toast('⚡ نُفذ أمر البيع: '+a.name);}
        else toast('⚠️ فشل أمر البيع (لا تملك): '+a.name);
      }
      beep(880,.12);
    }
  });
  S.alerts.slice().forEach(al=>{
    const a=S.assets[al.sym];if(!a)return;
    if((al.dir==='up'&&a.price>=al.target)||(al.dir==='down'&&a.price<=al.target)){
      S.alerts.splice(S.alerts.indexOf(al),1);
      toast('🔔 تنبيه: '+a.name+' وصل '+a.price.toFixed(2));beep(990,.15);
    }
  });
  
  if(S.day%7===0)weeklyPaper();
  
  if(S.lotto.tickets>0){
    S.lotto.pool+=800*S.lotto.tickets;
    if(RNG()<Math.min(0.5,0.05*S.lotto.tickets)){
      toast('🎰 جاكبوت! ربحت '+fmtD(S.lotto.pool));beep(1400,.3);
      log('يانصيب: +'+fmtD(S.lotto.pool));
      pushNews(S,'🎰 مستثمر مغمور يفوز بجاكبوت اليانصيب!',0,false,true);
      S.cash+=S.lotto.pool;S.lotto.pool=20000;
    }
    S.lotto.tickets=0;
  }else if(RNG()<0.06){
    pushNews(S,'🎰 أحد الأثرياء يفوز بجاكبوت '+fmtD(S.lotto.pool),0,false,false);
    S.lotto.pool=20000;refreshNewsUI();
  }
  
  const reSent=avgSectorSent('عقارات');
  for(const n in S.propPrice){
    S.propPrice[n]=Math.max(5000,S.propPrice[n]*(1+reSent*0.02+gauss()*0.008));
  }
  let rent=0;
  for(const n in S.props){if(S.props[n].qty>0)rent+=S.props[n].qty*S.propPrice[n]*0.0004;}
  if(rent>0){S.cash+=rent;S.rentTotal+=rent;}
  
  S.bonds.slice().forEach(b=>{
    if(S.day>=b.due){S.cash+=b.amt*1.04;S.bonds.splice(S.bonds.indexOf(b),1);
      toast('💵 سند مستحق: +'+fmtD(b.amt*1.04));log('استحقاق سند '+fmtD(b.amt));}
  });
  
  if(!S.goal)rollGoal();
  else if(netWorth()>=S.goal.target){
    const bonus=Math.round((S.goal.target-S.goal.start)*0.4*pmult());
    S.cash+=bonus;toast('🎯 حققت هدف اليوم! مكافأة '+fmtD(bonus));
    log('هدف اليوم: +'+fmtD(bonus));beep(1200,.15);
    rollGoal();
  }
  
  if(S.rival&&S.company){
    S.rival.strength=Math.max(0.3,Math.min(2,S.rival.strength+gauss()*0.03+avgSectorSent(S.company.sector)*0.02));
    if(RNG()<0.06){S.rival.strength=Math.min(2,S.rival.strength+0.12);
      pushNews(S,'منافسك "'+S.rival.name+'" يطلق منتجًا جديدًا',-0.02,true);refreshNewsUI();}
  }
  
  SECTORS.forEach(sec=>{
    const h=S.sectorHist[sec];
    if(h&&h.length>30){
      const g30=h[h.length-1]/h[Math.max(0,h.length-30)]-1;
      if(g30>0.35)S.bubbles[sec]=(S.bubbles[sec]||0)+1;else S.bubbles[sec]=0;
      if(S.bubbles[sec]>2&&RNG()<0.09){
        S.bubbles[sec]=0;
        for(const k in S.assets){const a=S.assets[k];if(a.kind==='stock'&&a.sector===sec)a.sent-=0.28;}
        S.mood-=0.08;
        pushNews(S,'💥 فقاعة قطاع '+sec+' تنفجر بعد صعود جنوني!',-0.2,true);
        toast('💥 فقاعة تنفجر في قطاع '+sec+'!');beep(180,.3);
        refreshNewsUI();
      }
    }
  });
  if(RNG()<0.006){
    for(const k in S.assets){const a=S.assets[k];if(a.kind==='stock')a.sent-=0.18;}
    S.mood-=0.15;
    pushNews(S,'🌪️ موجة بيع عنيفة تجتاح الأسواق العالمية!',-0.15,true);
    toast('🌪️ انهيار سوقي! كل الأسهم تهبط');beep(140,.4);
    refreshNewsUI();
  }
  
  if(S.day%15===0){
    const ch=(RNG()<0.5?-1:1)*rnd(0.0025,0.015);
    S.rate=Math.max(0.005,S.rate+ch);
    pushNews(S,'🏦 قرار البنك المركزي: الفائدة '+(S.rate*100).toFixed(2)+'% ('+(ch>0?'رفع':'خفض')+')',ch,true,ch<0);
    refreshNewsUI();
  }
  
  if(S.company&&!S.company.public&&companyValue()>100000&&RNG()<0.05)maOffer();
  
  worldRenewal();
  if(S.day!==S.questDay)rollQuests();
  checkQuests();
  
  if(S.company)runCompany();
  
  S.npcs.forEach(n=>{n.prev=n.worth;n.worth*=1+S.mood*0.01+gauss()*0.012;});
  
  FUNDS.forEach((f,i)=>{
    const ret=S.mood*0.02+gauss()*f[1]-f[2]/365;
    S.fundP[i]=Math.max(10,S.fundP[i]*(1+ret));
    S.fundHist[i].push(S.fundP[i]);
    if(S.fundHist[i].length>400)S.fundHist[i].shift();
  });
  
  if(!S.vcDeal&&S.day>=S.vcNext){
    const nm=NEWCO[Math.floor(RNG()*NEWCO.length)]+' '+SECTORS[Math.floor(RNG()*SECTORS.length)];
    S.vcDeal={name:nm,ask:Math.round(rnd(5000,30000)/1000)*1000,mult:Math.round(rnd(2,12)),risk:Math.round(rnd(30,70))/100,due:S.day+10};
    pushNews(S,'🦄 شركة ناشئة "'+nm+'" تبحث عن تمويل مخاطر',0,false,true);
  }
  S.vc.slice().forEach(v=>{
    if(RNG()<v.risk*0.06){
      S.vc.splice(S.vc.indexOf(v),1);S.vcLost++;
      pushNews(S,'💀 الناشئة "'+v.name+'" فشلت — خسرت استثمارك '+fmtD(v.amt),-0.01,true);
      toast('💀 فشلت "'+v.name+'" — خسارة '+fmtD(v.amt));
    }else if(S.day>=v.due){
      const val=Math.round(v.amt*v.mult*(0.5+RNG()));
      S.vc.splice(S.vc.indexOf(v),1);S.cash+=val;S.vcWins++;
      pushNews(S,'🦄💰 خروج ناجح من "'+v.name+'": +'+fmtD(val),0.03,true,true);
      toast('🦄 خروج ناجح: +'+fmtD(val));beep(1200,.15);
      log('خروج مخاطر +'+fmtD(val));
    }
  });
  
  if(S.marginPos){
    const m=S.marginPos;const a=S.assets[m.sym];
    if(a&&a.price<=m.entry*0.75){
      const eq=closeMargin(true);
      pushNews(S,'⚡💥 تصفية إجبارية لمركز الهامش على '+m.name+' — حقوقك المتبقية '+fmtD(Math.max(0,eq)),-0.01,true);
      toast('⚡💥 تمت تصفية مركز الهامش!');
    }
  }
  
  const nwNow=netWorth();
  if(nwNow>S.recPeak)S.recPeak=nwNow;
  if(S.nwHist.length){const dd=S.nwHist[S.nwHist.length-1]>0?(nwNow/S.nwHist[S.nwHist.length-1]-1)*100:0;if(dd>S.recBestDay)S.recBestDay=dd;}
  
  if(S.day%30===0&&S.nwHist.length>20){
    const ref=S.nwHist[Math.max(0,S.nwHist.length-30)];
    const prof=netWorth()-ref;
    if(prof>0){
      const tax=Math.min(Math.round(prof*0.1),S.cash);
      S.cash-=tax;
      pushNews(S,'🧾 ضريبة أرباح: -'+fmtD(tax)+' (١٠٪ من أرباح آخر ٣٠ يوم)',-0.01,true,true);
      toast('🧾 ضريبة أرباح: -'+fmtD(tax));
      log('ضريبة أرباح '+fmtD(tax));
    }
  }
  
  duelDay();
  if(S.nwHist.length){const yn=S.nwHist[S.nwHist.length-1];
    if(netWorth()>yn){const nf=Math.min(20,S.followers+1);
      if((nf===5||nf===10||nf===20)&&nf!==S.followers)pushNews(S,'👥 '+nf+' مستثمرًا يقلدون صفقاتك الآن — مشترياتك تحرك السوق!',0.01,true,true);
      S.followers=nf;
    }else S.followers=Math.max(0,S.followers-1);}
  
  if(S.ins&&S.ins.until>=S.day&&S.nwHist.length){
    const prev=S.nwHist[S.nwHist.length-1],cur=netWorth();
    if(prev>0&&cur<prev*0.92){
      const comp=Math.round((prev-cur)*0.5);
      S.cash+=comp;S.ins.paid+=comp;
      pushNews(S,'🛡️ تأمين المحفظة عوّضك '+fmtD(comp)+' بعد هبوط حاد',0,true,true);
      toast('🛡️ تعويض تأمين: '+fmtD(comp));
    }
  }
  
  if(S.hf&&S.hf.on&&S.nwHist.length){
    const prev=S.nwHist[S.nwHist.length-1],cur=netWorth();
    const r=prev>0?cur/prev-1:0;
    S.hf.capital*=1+r*0.8;
    if(r<0){S.hf.streak++;
      if(S.hf.streak>=3&&S.hf.capital>0){
        S.hf.capital*=0.7;S.hf.hwm=Math.min(S.hf.hwm,S.hf.capital);S.hf.streak=0;
        pushNews(S,'🐺 مستثمرو الصندوق سحبوا ٣٠٪ من رأس المال بعد ٣ أيام خسارة متتالية!',-0.01,true,true);
      }
    }else{S.hf.streak=0;if(r>0.01)S.hf.capital*=1.05;}
    if(S.hf.capital>S.hf.hwm){
      const fee=(S.hf.capital-S.hf.hwm)*0.2;
      S.hf.capital-=fee;S.hf.hwm=S.hf.capital;
      S.cash+=fee;S.hf.fees+=fee;
      pushNews(S,'🐺 صندوق التحوط: رسوم أداء +'+fmtD(Math.round(fee))+' (٢٠٪ من أرباح المستثمرين)',0,true,true);
    }
  }
  S.nwHist.push(netWorth());
  if(S.nwHist.length>900)S.nwHist.shift();
  checkMilestones();
  
  if(S.company&&S.day%30===0)quarterReport();
  save();
}
function fireNews(idx){
  const n=NEWS_T[idx==null?Math.floor(RNG()*NEWS_T.length):idx];
  if(n.k==='sector'){for(const k in S.assets){const a=S.assets[k];if(a.kind==='stock'&&a.sector===n.s)a.sent+=n.m;}}
  else if(n.k==='all'){for(const k in S.assets){const a=S.assets[k];if(a.kind==='stock')a.sent+=n.m;}}
  else if(n.k==='fx'){const a=S.assets['ع:'+n.s];if(a)a.sent+=n.m;}
  else if(n.k==='cmd'){const a=S.assets['م:'+n.s];if(a)a.sent+=n.m;}
  else if(n.k==='crypto'){for(const k in S.assets){const a=S.assets[k];if(a.kind==='crypto')a.sent+=n.m;}}
  else if(n.k==='rate'){S.rate=Math.max(0.005,S.rate+n.m);pushNews(S,n.t+' — الفائدة الآن '+(S.rate*100).toFixed(1)+'%',n.m,n.hot);return;}
  pushNews(S,n.t,n.m,n.hot,n.g);
  refreshNewsUI();
}

const STAFF=[
 {k:'eng',ic:'🧪',n:'مهندس جودة',base:12000,pay:180,d:'+١٫٢ جودة يوميًا لكل مستوى'},
 {k:'sales',ic:'📞',n:'مدير مبيعات',base:15000,pay:220,d:'+٨٪ طلب لكل مستوى'},
 {k:'mkt',ic:'📣',n:'خبير تسويق',base:10000,pay:150,d:'+١٢٪ قوة تسويق لكل مستوى'}
];
function staffCost(c){let s=0;const st=c&&c.staff||{};STAFF.forEach(x=>s+=(st[x.k]||0)*x.pay);return s;}
function staffLevel(c){let s=0;const st=c&&c.staff||{};STAFF.forEach(x=>s+=(st[x.k]||0));return s;}
function hireStaff(k){
  const c=S.company;if(!c)return;
  const def=STAFF.find(x=>x.k===k);if(!def)return;
  if(!c.staff)c.staff={eng:0,sales:0,mkt:0};
  const lv=c.staff[k]||0;
  if(lv>=5)return toast('الفريق في أقصى مستوى');
  const cost=def.base*(lv+1);
  if(c.cash<cost)return toast('❌ خزينة الشركة لا تكفي ('+fmtD(cost)+')');
  c.cash-=cost;c.staff[k]=lv+1;
  toast('🧑‍💼 '+(lv?'ترقية':'تعيين')+': '+def.n+' — المستوى '+(lv+1));
  renderCompany();renderHR();
}
function strikeAccept(){
  const c=S.company;if(!c||!c.strike)return;
  c.wage=c.strike.asked/100;c.morale=Math.min(100,c.morale+8);
  pushNews(S,'✅ اتفاق مع العمال في "'+c.name+'" — الرواتب رُفعت إلى '+c.strike.asked+'%',0.01,false,true);
  S.achv.strike=1;
  c.strike=null;toast('✅ تم الاتفاق ورفع الرواتب');
  renderHR();renderCompany();
}
function strikeReject(){
  const c=S.company;if(!c||!c.strike)return;
  const cost=Math.round(c.workers*150);
  if(c.cash<cost)return toast('❌ الخزينة لا تكفي لتعيين بدلاء ('+fmtD(cost)+')');
  c.cash-=cost;c.morale=Math.max(0,c.morale-10);c.quality=Math.max(0,c.quality-5);
  pushNews(S,'⚠️ إدارة "'+c.name+'" عيّنت بدلاء وأنهت الإضراب',-0.015,true,true);
  S.achv.strike=1;
  c.strike=null;toast('⚠️ انتهى الإضراب بتعيين بدلاء');
  renderHR();renderCompany();
}
function runCompany(){
  const c=S.company;
  if(!c.up)c.up={line:0,auto:0,brand:0};
  if(c.morale==null)c.morale=60;if(c.wage==null)c.wage=1;if(!c.staff)c.staff={eng:0,sales:0,mkt:0};
  STAFF.forEach(x=>{if(c.staff[x.k]==null)c.staff[x.k]=0;});
  const mTarget=Math.max(0,Math.min(100,50+(c.wage-1)*70-Math.max(0,(c.workers-140)/6)));
  c.morale=Math.max(0,Math.min(100,c.morale+(mTarget-c.morale)*0.12));
  if(c.morale<25&&c.workers>5&&RNG()<0.3){
    const q=Math.max(1,Math.round(c.workers*0.04));
    c.workers-=q;c.quits=(c.quits||0)+q;
    toast('🚪 '+q+' عامل استقالوا — الرواتب منخفضة!');
  }
  
  if(!c.strike&&c.morale<30&&c.workers>5&&RNG()<0.15){
    c.strike={days:0,asked:Math.min(160,Math.round((c.wage+0.2)*100))};
    pushNews(S,'✊ إضراب في "'+c.name+'" — العمال يطالبون برفع الرواتب إلى '+c.strike.asked+'%',-0.01,true,true);
    toast('✊ إضراب! العمال يطالبون برواتب '+c.strike.asked+'%');
  }
  if(c.strike){
    c.strike.days=(c.strike.days||0)+1;
    if(c.strike.days>=5){
      c.strike=null;c.morale=Math.max(0,c.morale-5);
      pushNews(S,'انتهى إضراب "'+c.name+'" دون اتفاق والعمال عادوا ساخطين',-0.005,false,true);
      toast('انتهى الإضراب دون اتفاق');
    }
  }
  const strikeF=c.strike?0.35:1;
  if(c.brand==null)c.brand=10;
  if(c.campaign){
    c.campaign.left--;
    if(c.campaign.left<=0){
      pushNews(S,'انتهت '+c.campaign.n+' لـ"'+c.name+'"',0,false,true);
      toast('انتهت '+c.campaign.n);c.campaign=null;
    }
  }
  c.brand=Math.max(0,Math.min(100,c.brand+(c.campaign?0.15:0.02)-0.05));
  const campF=1+(c.campaign?c.campaign.boost:0);
  if(c.rep==null)c.rep=50;
  if(!c.crisis&&c.track.length>5&&RNG()<(0.05+(c.quality<35?0.04:0)+(c.morale<35?0.04:0)))startCrisis();
  if(c.crisis){
    c.crisis.left--;
    c.brand=Math.max(0,(c.brand||10)-0.25);
    if(c.crisis.left<=0){
      c.rep=Math.max(0,c.rep-6);c.crisis=null;
      pushNews(S,'انتهت أزمة "'+c.name+'" دون معالجة — السمعة تضررت',-0.01,false,true);
      toast('انتهت الأزمة دون معالجة — السمعة -6');
    }
  }
  const crisisF=c.crisis?(1-c.crisis.hit*0.3):1;
  const repF=1+(c.rep-50)/500;
  const prod=0.72+c.morale/100*0.56;
  const sectorMood=avgSectorSent(c.sector);
  const cartelF=(S.allies&&S.allies.pact)?1.12:1;
  const fairPrice=(40*(1+sectorMood)+c.quality*1.5)*cartelF;
  const priceFactor=Math.max(0.05,1-(c.price-fairPrice)/fairPrice*0.8);
  const marketing=Math.log(1+c.marketing/100)*(1+0.4*c.up.brand+teamEff('mkt',c)*0.12);
  const capacity=1+0.5*c.up.line;
  
  const rivalF=S.rival?Math.max(0.5,1-S.rival.strength*0.16):1;
  const salesBoost=1+teamEff('sales',c)*0.08;
  const demand=Math.max(0,c.workers*8*capacity*priceFactor*(0.6+0.4*Math.tanh(marketing))*(1+sectorMood*0.5)*rivalF*salesBoost*strikeF*campF*crisisF*repF*(1+c.brand/400)*prod*warDemandF()*allyDemandF()*careDemandF(c)*rnd(0.85,1.15));
  if(!c.inv)c.inv=invDef();
  supTick();
  teamTick(c);
  const production=c.workers*8*capacity*prod*(c.strike?0.35:1);
  c.inv.units=Math.min(c.inv.cap,c.inv.units+production);
  if(c.inv.order){
    c.inv.order.left--;
    if(c.inv.order.left<=0){
      const supRel=(c.sup&&c.sup.active)?c.sup.active.reliability:1;
      if(!c.inv.order.rolled){
        c.inv.order.rolled=1;
        if(RNG()>supRel){c.inv.order.left=1+Math.floor(RNG()*2);toast('⏳ شحنة "'+c.sup.active.name+'" اتأخرت');}
      }
      if(c.inv.order.left<=0){
        const add=Math.min(c.inv.order.units,Math.max(0,c.inv.cap-c.inv.units));
        c.inv.units+=add;c.inv.order=null;
        toast('🚚 وصلت شحنة الموردين ('+Math.round(add)+' وحدة)');
      }
    }
  }
  if(c.inv.auto&&!c.inv.order&&c.inv.units<c.inv.cap*0.25){
    const cost=Math.round(1000*supCost());
    if(c.cash>=cost){c.cash-=cost;c.inv.order={units:1000,left:3};toast('🔁 طلب تلقائي: شحنة 1000 وحدة');}
  }
  const sold=Math.min(demand,c.inv.units);
  c.inv.units-=sold;
  const lost=Math.max(0,demand-sold);
  c.inv.missed=Math.round(lost);
  if(lost>1){
    c.inv.stockDays=(c.inv.stockDays||0)+1;
    c.rep=Math.max(0,(c.rep||50)-0.8);
    c.brand=Math.max(0,(c.brand||10)-0.4);
    if(c.inv.stockDays===3)pushNews(S,'📦 نفاد مخزون في "'+c.name+'" — عملاء خرجوا بدون شراء',-0.01,true,true);
  }else c.inv.stockDays=0;
  careTick(c,sold);
  const revenue=sold*c.price;
  const wageBill=c.workers*22*c.wage;
  const costs=wageBill+staffCost(c)+c.rd+c.marketing+careCost(c)+sold*c.price*0.35*warCostF()*allyCostF();
  const subRev=subTick(c);
  const profit=revenue-costs+(c.aucIncome||0)+subRev;
  const pFinal=profit>0?profit*pmult():profit;
  
  let branchProfit=0;
  if(S.subsidiary)branchProfit+=Math.round(3000*pmult());
  if(c.branches&&c.branches.length){
    c.branches.forEach(b=>{
      const city=CITIES.find(x=>x.n===b.city);if(!city)return;
      const f=b.status==='boom'?1.6:b.status==='bust'?0.35:1;
      branchProfit+=Math.round(4000*b.lvl*city.mult*f-1500*b.lvl);
    });
    c.cash+=branchProfit;
  }
  c.branchProfit=branchProfit;
  frTick(c);
  bidTick(c);
  c.cash+=pFinal;
  c.todayRev=revenue;c.todayProfit=pFinal;c.todaySold=Math.round(sold);c.todaySub=subRev;
  c.quality=Math.min(100,c.quality+c.rd/4000+c.up.auto*0.05+teamEff('eng',c)*0.012+allyQualityBonus());
  c.quality=Math.max(0,c.quality-0.05);
  c.track.push(profit);
  if(!c.hist)c.hist=[];
  c.hist.push({r:Math.round(revenue),p:Math.round(pFinal),s:Math.round(sold),m:Math.round(c.morale)});
  if(c.hist.length>90)c.hist.shift();
  if(c.track.length>365)c.track.shift();
  const yr=c.track.slice(-365).reduce((a,b)=>a+b,0);
  c.lastYearProfit=yr;
  if(c.public&&c.ticker&&S.assets[c.ticker]){
    const a=S.assets[c.ticker];
    a.sent+=Math.max(-0.05,Math.min(0.05,profit/60000));
  }
  if(c.cash<0){ 
    S.cash+=c.cash;c.cash=0;
    toast('⚠️ شركتك استنزفت خزينتها وسحبت من كاشك!');
  }
}
function avgSectorSent(sec){let s=0,n=0;for(const k in S.assets){const a=S.assets[k];if(a.kind==='stock'&&a.sector===sec){s+=a.sent;n++;}}return n?s/n:0;}
function quarterReport(){
  const c=S.company;S.repQ++;
  const q=c.track.slice(-90);const rev=q.reduce((a,b)=>a+b,0);
  showModal('<h2>📊 التقرير ربع السنوي — '+c.name+'</h2>'+
    row('أيام التشغيل',q.length)+row('صافي ربح الربع',fmtD(rev))+
    row('قيمة الشركة التقديرية',fmtD(companyValue()))+row('الجودة',c.quality.toFixed(0)+'/100')+
    row('العمال',c.workers)+row('رضا الفريق',Math.round(c.morale)+'%')+
    row('طاقم الإدارة',staffLevel(c)+'/15')+
    '<button class="bigBtn" style="width:100%;margin-top:14px" onclick="hideModal()">تمام</button>');
}
function row(a,b){return '<div class="row"><span>'+a+'</span><b>'+b+'</b></div>';}
const MILES=[[150000,'وصلت ١٥٠ ألف! بداية قوية 💪'],[250000,'ربع مليون! 🎯'],[500000,'نصف مليون دينار 🔥'],[1000000,'مليونير! 👑'],[5000000,'خمسة ملايين! إمبراطور 🏰'],[20000000,'عشرون مليونًا — أسطورة السوق 🌟']];
function checkMilestones(){
  const nw=netWorth();
  MILES.forEach(m=>{if(nw>=m[0]&&!S.miles[m[0]]){S.miles[m[0]]=1;toast('🏆 '+m[1]);pushNews(S,'مستثمر صاعد يتجاوز '+fmtD(m[0])+'!',0,false,true);}});
}

let sel='س:'+COMPS[0][0], tf=7;
function fee(x){return x*0.001;}
function checkAlerts(){
  if(!S.alerts||!S.alerts.length)return;
  const keep=[];
  S.alerts.forEach(al=>{
    const a=S.assets[al.sym];
    if(!a)return;
    const hit=al.dir==='above'?a.price>=al.target:a.price<=al.target;
    if(hit){
      toast('🔔 تنبيه: '+a.name+' '+(al.dir==='above'?'تجاوز':'نزل تحت')+' '+al.target+' (الحالي '+a.price.toFixed(2)+')');
      beep(1200,.15);
      pushNews(S,'🔔 تنبيه سعرك: '+a.name+' وصل '+a.price.toFixed(2),0,false,true);
      log('تنبيه سعر '+a.name);
    }else keep.push(al);
  });
  if(keep.length!==S.alerts.length){S.alerts=keep;save();renderAll();}
}
function checkOrders(){
  if(!S.orders||!S.orders.length)return;
  const keep=[];
  S.orders.forEach(o=>{
    const a=S.assets[o.sym];
    if(!a)return;
    let done=false;
    if(o.side==='buy'&&a.price<=o.target){
      const cost=o.qty*a.price+fee(o.qty*a.price);
      if(cost<=S.cash){
        S.cash-=cost;const tot=a.held*a.avg+o.qty*a.price;
        a.held+=o.qty;a.avg=tot/a.held;S.stats.trades++;
        toast('📌 نُفذ أمر شراء '+o.qty+' × '+a.name+' @ '+a.price.toFixed(2));log('تنفيذ أمر شراء '+a.name);
      }else{toast('📌 أمر شراء '+a.name+' وصل للسعر لكن الكاش لا يكفي — أُلغي');}
      done=true;
    }else if(o.side==='sell'&&a.price>=o.target){
      if(a.held>=o.qty){
        S.cash+=o.qty*a.price-fee(o.qty*a.price);
        a.held-=o.qty;if(!a.held)a.avg=0;S.stats.trades++;
        toast('📌 نُفذ أمر بيع '+o.qty+' × '+a.name+' @ '+a.price.toFixed(2));log('تنفيذ أمر بيع '+a.name);
      }else{toast('📌 أمر بيع '+a.name+' تحقق سعره لكن لا تملك الكمية — أُلغي');}
      done=true;
    }
    if(!done)keep.push(o);
  });
  if(keep.length!==S.orders.length){S.orders=keep;save();renderAll();}
}
function buy(){
  const a=S.assets[sel];const q=Math.max(0,Math.floor(+$('qty').value||0));if(!q)return;
  const cost=q*a.price+fee(q*a.price);
  if(cost>S.cash){toast('❌ كاش غير كافٍ');return;}
  S.cash-=cost;
  const tot=a.held*a.avg+q*a.price;
  a.held+=q;a.avg=tot/a.held;
  a.sent+=Math.min(0.02,q*a.price/2e6);
  if(S.followers>0&&a.kind==='stock'){a.price*=1+Math.min(0.004*S.followers,0.03);a.hist[a.hist.length-1]=a.price;}
  S.stats.trades++;
  log('شراء '+q+' × '+a.name+' @ '+a.price.toFixed(2));
  save();checkAchv();renderAll();
}
function sell(){
  const a=S.assets[sel];const q=Math.max(0,Math.floor(+$('qty').value||0));if(!q)return;
  if(q>a.held){toast('❌ لا تملك هذه الكمية');return;}
  const pl=(a.price-a.avg)*q;
  S.cash+=q*a.price-fee(q*a.price);
  a.held-=q;if(!a.held)a.avg=0;
  a.sent-=Math.min(0.02,q*a.price/2e6);
  S.stats.trades++;
  if(pl>S.stats.bestTrade)S.stats.bestTrade=pl;
  if(pl<(S.stats.worstTrade||0))S.stats.worstTrade=pl;
  log('بيع '+q+' × '+a.name+' @ '+a.price.toFixed(2));
  save();checkAchv();renderAll();
}
function shortSell(){
  const a=S.assets[sel];const q=Math.max(0,Math.floor(+$('qty').value||0));if(!q)return;
  if(shortValue()+q*a.price>Math.max(0,netWorth())*0.5){toast('❌ تجاوزت حد المكشوف المسموح (٥٠٪ من ثروتك)');return;}
  const proceeds=q*a.price-fee(q*a.price);
  S.cash+=proceeds;
  const tot=a.short*a.shortAvg+q*a.price;
  a.short+=q;a.shortAvg=tot/a.short;
  a.sent-=Math.min(0.02,q*a.price/2e6);
  S.stats.trades++;beep(440,.06);
  log('شورت '+q+' × '+a.name+' @ '+a.price.toFixed(2));
  save();checkAchv();renderAll();
}
function cover(){
  const a=S.assets[sel];const q=Math.min(Math.max(0,Math.floor(+$('qty').value||0)),a.short);if(!q)return;
  const cost=q*a.price+fee(q*a.price);
  if(cost>S.cash){toast('❌ كاش غير كافٍ للتغطية');return;}
  S.cash-=cost;
  const pl=(a.shortAvg-a.price)*q;
  S.coveredProfit+=pl;
  a.short-=q;if(!a.short)a.shortAvg=0;
  S.stats.trades++;
  log('تغطية شورت '+q+' × '+a.name+' @ '+a.price.toFixed(2)+' ('+(pl>=0?'+':'')+fmt(pl)+')');
  save();checkAchv();renderAll();
}
function log(t){S.tx.unshift({d:S.day,t});if(S.tx.length>80)S.tx.pop();}

function buyOption(type){
  const a=S.assets[sel];if(!a)return;
  const q=Math.max(0,Math.floor(+$('qty').value||0));if(!q)return toast('❌ حدّد الكمية');
  const prem=Math.ceil(a.price*q*0.04);
  if(prem>S.cash)return toast('❌ كاش غير كافٍ للقسط ('+fmtD(prem)+')');
  S.cash-=prem;
  S.options.push({sym:sel,type:type,strike:a.price,qty:q,prem:prem,expiry:S.day+5});
  S.stats.trades++;
  toast((type==='call'?'📈 خيار صعود':'📉 خيار هبوط')+' على '+a.name+' — قسط '+fmtD(prem));
  log('خيار '+type+' '+q+' × '+a.name+' @ '+a.price.toFixed(2));
  beep(850,.08);save();checkAchv();renderAll();
}
function settleOptions(){
  S.options.slice().forEach(o=>{
    if(S.day<o.expiry)return;
    const a=S.assets[o.sym];if(!a)return;
    const payoff=Math.max(0,(o.type==='call'?a.price-o.strike:o.strike-a.price))*o.qty;
    S.cash+=payoff;
    S.options.splice(S.options.indexOf(o),1);
    const pl=payoff-o.prem;
    if(pl>S.stats.bestTrade)S.stats.bestTrade=pl;
    if(pl<(S.stats.worstTrade||0))S.stats.worstTrade=pl;
    toast((payoff>0?'💵 خيارك ربح ':'🕳️ خيارك انتهى بلا قيمة: ')+fmtD(payoff)+(payoff>0?' — صافي '+(pl>=0?'+':'')+fmtD(pl):''));
    log('تسوية خيار '+o.type+' '+o.sym+': '+fmtD(payoff));
  });
}
function weekSeed(){const d=new Date();const jan1=new Date(d.getFullYear(),0,1);const wk=Math.ceil(((d-jan1)/864e5+jan1.getDay()+1)/7);return d.getFullYear()*100+wk;}
function startWeekly(){
  const seed=weekSeed();
  showModal('<h2>🏁 تحدي الأسبوع</h2><p style="line-height:1.9">سوق حتمي بذرة الأسبوع <b>#'+seed+'</b> — كل اللاعبين يواجهون نفس السوق بالظبط. عندك 10 أيام من 100 ألف. نتيجتك النهائية هي كود تتحدى بيه أصحابك.<br>⚠️ لعبتك الحالية هتتحفظ وترجع بعد التحدي.</p><div class="tradeRow"><button id="btnWeeklyYes">ابدأ التحدي</button></div>');
  $('btnWeeklyYes').onclick=()=>{
    try{localStorage.setItem('econBackup1',JSON.stringify(S));}catch(e){}
    RNG=mulberry32(seed);
    const st=freshState();
    st.weekly={seed:seed,endDay:11};
    S=st;hideModal();
    toast('🏁 تحدي الأسبوع بدأ! 10 أيام — بالتوفيق');beep(1100,.2);
    save();showPage('market');renderAll();
  };
}
const SCEN=[
 {id:'crash',n:'💥 أزمة مالية ٢٠٠٨',desc:'انهيار تدريجي — مزاج سلبي وتقلب مضاعف. النجاة إنجاز.',seed:2008,mood:-0.6,vol:2},
 {id:'boom',n:'🚀 طفرة كريبتو ٢٠٢١',desc:'حمّى عملات رقمية ومزاج محتدم — ركوب الموجة فن.',seed:2021,mood:0.45,vol:1.4},
 {id:'stag',n:'🐌 ركود السبعينات',desc:'سوق راكد بلا اتجاه — اختبار صبر المستثمر الحقيقي.',seed:1970,mood:-0.12,vol:0.5}
];
function startScenario(i){
  const sc=SCEN[i];
  showModal('<h2>'+sc.n+'</h2><p style="line-height:1.9">'+sc.desc+'<br>سوق حتمي بذرة <b>#'+sc.seed+'</b> — ١٠ أيام من ١٠٠ ألف، والنتيجة كود تحدٍ. لعبتك الحالية تتحفظ وترجع.</p><div class="tradeRow"><button id="btnScnYes">ابدأ السيناريو</button></div>');
  $('btnScnYes').onclick=()=>{
    try{localStorage.setItem('econBackup1',JSON.stringify(S));}catch(e){}
    RNG=mulberry32(sc.seed);
    const st=freshState();
    st.weekly={seed:sc.seed,endDay:11,scn:i};
    st.mood=sc.mood;st.moodHist=[sc.mood];
    Object.keys(st.assets).forEach(k=>{st.assets[k].vol*=sc.vol;});
    S=st;hideModal();
    toast(sc.n+' بدأ! ١٠ أيام');beep(1100,.2);
    save();showPage('market');renderAll();
  };
}
function finishWeekly(){
  const score=Math.round(netWorth());
  const code='W'+S.weekly.seed+'-'+score.toString(36).toUpperCase();
  S.hof.push({seed:S.weekly.seed,score:score});
  S.hof.sort((a,b)=>b.score-a.score);S.hof=S.hof.slice(0,5);
  const seed=S.weekly.seed;
  const scnT=S.weekly.scn!=null?SCEN[S.weekly.scn].n:'🏁 تحدي الأسبوع';
  S.weekly=null;
  RNG=Math.random.bind(Math);
  let backup=null;try{const b=localStorage.getItem('econBackup1');if(b)backup=JSON.parse(b);}catch(e){}
  showModal('<h2>'+scnT+' — انتهى!</h2><p style="line-height:1.9">نتيجتك: <b>'+fmtD(score)+'</b> من 100 ألف في 10 أيام.<br>كود التحدي: <b style="color:var(--gold)">'+code+'</b><br>شارك الكود مع أصحابك وقارنوا — نفس السوق، مين أحسن مستثمر؟</p><div class="tradeRow"><button id="btnWeeklyBack">ارجع للعبتي المحفوظة</button></div>');
  $('btnWeeklyBack').onclick=()=>{
    if(backup){S=backup;migrate();}
    hideModal();save();renderAll();
    toast('👋 رجعت للعبتك الأساسية');
  };
}
function renderWeekly(){
  const el=$('weeklyBody');if(!el)return;
  if(!S.weekly){
    const hofHtml=S.hof&&S.hof.length?'<div style="font-size:12.5px;margin-bottom:8px">🏆 قاعة المشاهير:<br>'+S.hof.map((h,i)=>(i+1)+'. '+fmtD(h.score)+' (أسبوع #'+h.seed+')').join('<br>')+'</div>':'';
    el.innerHTML='<p style="font-size:13px;color:var(--dim);margin-bottom:8px">نفس السوق لكل اللاعبين هذا الأسبوع (بذرة #'+weekSeed()+'). 10 أيام من 100 ألف — النتيجة كود تتحدى بيه أصحابك. لعبتك الحالية تتحفظ وترجع.</p>'+hofHtml+'<div class="tradeRow"><button class="btnShort" id="btnWeekly">ابدأ تحدي الأسبوع</button></div>'+
    '<p style="font-size:12.5px;color:var(--dim);margin:10px 0 4px">أو جرّب سيناريو تاريخيًا:</p><div class="tradeRow">'+SCEN.map((s,i)=>'<button class="btnGhost scnBtn" data-i="'+i+'" title="'+s.desc+'">'+s.n+'</button>').join('')+'</div>';
    $('btnWeekly').onclick=startWeekly;
    el.querySelectorAll('.scnBtn').forEach(b=>b.onclick=()=>startScenario(+b.dataset.i));
  }else{
    const left=S.weekly.endDay-S.day;
    const scnName=S.weekly.scn!=null?SCEN[S.weekly.scn].n:'🏁 تحدي الأسبوع';
    el.innerHTML='<p style="font-size:13px">'+scnName+' جارٍ — بذرة <b>#'+S.weekly.seed+'</b> — متبقٍ <b>'+left+'</b> يوم — ثروتك <b>'+fmtD(netWorth())+'</b></p>';
  }
}
function renderAutopilot(){
  const el=$('autopilotBody');if(!el)return;
  el.innerHTML='<p style="font-size:13px;color:var(--dim);margin-bottom:8px">مدير محفظة آلي: يشتري يوميًا الأكثر انخفاضًا (شراء القاع) ويبيع جزءًا من المراكز الرابحة فوق +25٪. '+(S.autopilot?'<b style="color:var(--up)">يعمل ✅</b>':'<b>متوقف ⏸️</b>')+'</p><div class="tradeRow"><button class="btnShort" id="btnAutopilot">'+(S.autopilot?'إيقاف الطيار':'تشغيل الطيار')+'</button></div>';
  $('btnAutopilot').onclick=()=>{S.autopilot=!S.autopilot;toast(S.autopilot?'🤖 الطيار الآلي يعمل':'⏸️ الطيار الآلي متوقف');save();renderAutopilot();};
}
function runAutopilot(){
  if(!S.autopilot)return;
  let acts=[];
  
  Object.keys(S.assets).forEach(k=>{const a=S.assets[k];
    if(a.held>0&&a.avg>0&&a.price>a.avg*1.25){
      const q=Math.max(1,Math.floor(a.held*0.3));
      S.cash+=q*a.price-fee(q*a.price);
      const pl=(a.price-a.avg)*q;
      if(pl>S.stats.bestTrade)S.stats.bestTrade=pl;
      a.held-=q;if(!a.held)a.avg=0;
      acts.push('بيع '+q+' × '+a.name+' لجني الأرباح');
    }});
  
  if(S.cash>30000){
    let worst=null,wc=0;
    Object.keys(S.assets).forEach(k=>{const a=S.assets[k];
      if(a.kind!=='stock'&&a.kind!=='crypto')return;
      const c=chgPct(a);if(c<wc){wc=c;worst=k;}
    });
    if(worst&&wc<-2){
      const a=S.assets[worst];
      const amt=Math.min(12000,S.cash-5000);
      const q=Math.max(1,Math.floor(amt/a.price));
      const tot=a.held*a.avg+q*a.price;
      a.held+=q;a.avg=tot/a.held;
      S.cash-=q*a.price+fee(q*a.price);
      S.stats.trades++;
      acts.push('شراء '+q+' × '+a.name+' عند القاع ('+wc.toFixed(1)+'%)');
    }
  }
  if(acts.length){acts.forEach(t=>log('🤖 '+t));toast('🤖 الطيار الآلي: '+acts.length+' عملية — راجع السجل');}
}
function renderOptions(){
  const el=$('optList');if(!el)return;
  el.innerHTML=S.options.map(o=>{
    const a=S.assets[o.sym];if(!a)return '';
    const cur=Math.max(0,(o.type==='call'?a.price-o.strike:o.strike-a.price))*o.qty;
    return '<div style="font-size:12.5px;color:var(--dim);margin:3px 0">'+(o.type==='call'?'📈':'📉')+' '+a.name+' × '+o.qty+' | إضراب '+o.strike.toFixed(2)+' | ينتهي يوم '+o.expiry+' | قيمته الآن '+fmtD(cur)+'</div>';
  }).join('');
}
const NEWCO=['روافد','قمة','درة','أفق','سدرة','كيان','تمكين','وفاق','بدر','نماء','ريادة','سواعد'];
function worldRenewal(){
  
  for(const k of Object.keys(S.assets)){
    const a=S.assets[k];
    if(a.kind!=='stock')continue;
    if(S.company&&S.company.ticker===k)continue;
    if(a.price<a.base*0.12){
      const lost=a.held*a.price;
      if(a.short>0){S.cash+=a.short*a.price*0.5;}
      delete S.assets[k];
      S.bankruptcies++;
      if(!S.auction&&RNG()<0.65){
        const val=Math.round(Math.max(25000,a.base*800));
        S.auction={name:a.name,sector:a.sector,val:val,npc:Math.round(val*(0.7+RNG()*0.7)),bid:0,ends:S.day+1};
        pushNews(S,'🔨 أصول "'+a.name+'" معروضة الآن في مزاد إفلاس!',0,false,true);
      }
      pushNews(S,'⚰️ إفلاس شركة "'+a.name+'" وشطبها من البورصة!',-0.03,true);
      if(lost>0){toast('⚰️ أفلست '+a.name+' — خسرت '+fmtD(lost));}
      refreshNewsUI();
    }
  }
  
  const stockCount=Object.keys(S.assets).filter(k=>S.assets[k].kind==='stock').length;
  if(stockCount<18&&(S.day%9===0||stockCount<12)){
    const sec=SECTORS[Math.floor(RNG()*SECTORS.length)];
    let nm=NEWCO[Math.floor(RNG()*NEWCO.length)]+' '+sec;
    let key='س:'+nm;let i=2;
    while(S.assets[key]){key='س:'+nm+' '+i;i++;nm=nm+' '+i;}
    const p=rnd(18,130);
    S.assets[key]={kind:'stock',name:nm,sector:sec,price:p,base:p,vol:rnd(0.03,0.06),sent:0.06,trend:0,hist:[p],held:0,avg:0,short:0,shortAvg:0,div:rnd(0.004,0.014)};
    pushNews(S,'🆕 اكتتاب جديد: شركة "'+nm+'" تنضم للبورصة في قطاع '+sec,0.03,false,true);
    refreshNewsUI();
  }
}

const QUEST_DEFS={
  own_sector:{t:q=>'املك '+q.n+' سهمًا من قطاع '+q.arg,test:q=>{let n=0;for(const k in S.assets){const a=S.assets[k];if(a.kind==='stock'&&a.sector===q.arg)n+=a.held;}return n>=q.n;}},
  trades:{t:q=>'نفّذ '+q.n+' صفقات اليوم',test:q=>S.stats.trades-(q.start||0)>=q.n},
  dep:{t:q=>'ارفع وديعتك البنكية إلى '+fmtD(q.n),test:q=>S.dep>=q.n},
  prop:{t:q=>'املك '+q.n+' عقارات',test:q=>{let n=0;for(const p in S.props)n+=S.props[p].qty;return n>=q.n;}},
  shortp:{t:q=>'اربح '+fmtD(q.n)+' من الشورت',test:q=>S.coveredProfit-(q.start||0)>=q.n},
  cash:{t:q=>'اجمع كاش '+fmtD(q.n),test:q=>S.cash>=q.n},
};
function rollQuests(){
  const pool=[
    {k:'own_sector',arg:SECTORS[Math.floor(RNG()*SECTORS.length)],n:[20,50,100][Math.floor(RNG()*3)]},
    {k:'trades',n:4+Math.floor(RNG()*4),start:S.stats.trades},
    {k:'dep',n:Math.round((S.dep+15000)/5000)*5000},
    {k:'prop',n:1+Object.values(S.props).reduce((s,p)=>s+p.qty,0)},
    {k:'shortp',n:3000+Math.floor(RNG()*3000),start:S.coveredProfit},
    {k:'cash',n:Math.round(S.cash*1.1/5000)*5000+5000},
  ];
  S.quests=[];
  while(S.quests.length<3&&pool.length){
    const q=pool.splice(Math.floor(RNG()*pool.length),1)[0];
    q.reward=2500+Math.floor(RNG()*4000);q.done=0;
    S.quests.push(q);
  }
  S.questDay=S.day;
}
function checkQuests(){
  S.quests.forEach(q=>{
    if(!q.done&&QUEST_DEFS[q.k].test(q)){
      q.done=1;const rw=Math.round(q.reward*pmult());S.cash+=rw;
      toast('✅ مهمة أنجزت! مكافأة '+fmtD(q.reward));beep(1050,.12);
      log('مهمة: '+QUEST_DEFS[q.k].t(q));
    }
  });
}
function renderQuests(){
  const el=$('questList');if(!el)return;
  if(!S.quests.length)return;
  el.innerHTML=S.quests.map(q=>'<div class="achv '+(q.done?'done':'')+'"><span class="ic">'+(q.done?'✅':'🎯')+'</span><span style="flex:1">'+QUEST_DEFS[q.k].t(q)+'</span><b style="color:var(--gold)">'+fmtD(q.reward)+'</b></div>').join('');
}

function advisor(){
  let best=null,cheap=null,worst=null;
  for(const k in S.assets){const a=S.assets[k];if(a.kind!=='stock')continue;
    const h=a.hist;const g30=h.length>30?a.price/h[h.length-30]-1:0;
    if(!best||g30>best.g)best={n:a.name,g:g30,sec:a.sector};
    const ratio=a.price/a.base;
    if(ratio>0.4&&a.sent>-0.05&&(!cheap||ratio<cheap.r))cheap={n:a.name,r:ratio};
    if(!worst||g30<worst.g)worst={n:a.name,g:g30};
  }
  const tips=[];
  if(best)tips.push('📈 أقوى زخم حاليًا: <b>'+best.n+'</b> ('+(best.g*100).toFixed(0)+'% مؤخرًا) — ركوب الموجة خيار.');
  if(cheap)tips.push('💎 فرصة مقيمة بأقل من قيمتها: <b>'+cheap.n+'</b> يتداول عند '+(cheap.r*100).toFixed(0)+'% من قيمته الأساسية.');
  if(worst&&worst.g<-0.1)tips.push('⚠️ ابتعد عن <b>'+worst.n+'</b> — اتجاه هابط قوي، أو جرّب الشورت عليه.');
  if(S.mood<-0.2)tips.push('🌊 السوق في ذعر — عادةً أفضل أوقات الشراء للصبورين.');
  if(S.mood>0.4)tips.push('🎈 السوق مفرط التفاؤل — جني بعض الأرباح حكمة.');
  if(S.company)tips.push('🏭 شركتك: '+(S.company.todayProfit>=0?'تربح '+fmtD(S.company.todayProfit)+' يوميًا — فكّر في ترقية':'تخسر اليوم — راجع السعر مقابل الجودة')+'.');
  showModal('<h2>🤖 المستشار الآلي</h2><div style="font-size:14px;line-height:2">'+tips.join('<br>')+'</div><button class="bigBtn" style="width:100%;margin-top:12px" onclick="hideModal()">فهمت</button>');
}

let maPending=null;
function maOffer(){
  const c=S.company;const val=companyValue();
  const mult=rnd(1.2,1.8);const offer=Math.round(val*mult);
  maPending=offer;S.offers++;
  const buyer=S.rival?S.rival.name:'ائتلاف مستثمرين';
  showModal('<h2>🤝 عرض استحواذ!</h2>'+
    '<div style="font-size:14px;line-height:1.8;margin-bottom:10px">تقدّم <b>'+buyer+'</b> بعرض لشراء <b>'+c.name+'</b> مقابل <b style="color:var(--gold)">'+fmtD(offer)+'</b> نقدًا ('+(mult*100).toFixed(0)+'% من قيمتها التقديرية).</div>'+
    '<div style="display:flex;gap:8px">'+
    '<button class="btnBuy" style="flex:1" onclick="maAccept()">بيع الشركة 💰</button>'+
    '<button class="btnSell" style="flex:1" onclick="maDecline()">رفض العرض</button></div>');
}
function maAccept(){
  const c=S.company;if(!c||!maPending)return;
  S.cash+=maPending;
  toast('💰 بعت '+c.name+' مقابل '+fmtD(maPending)+'!');
  pushNews(S,'صفقة كبرى: بيع شركة "'+c.name+'" مقابل '+fmtD(maPending),0.02,false,true);
  log('بيع الشركة '+fmtD(maPending));
  S.company=null;S.rival=null;maPending=null;
  hideModal();refreshNewsUI();save();checkAchv();renderAll();
}
function maDecline(){
  if(S.rival)S.rival.strength=Math.min(2,S.rival.strength+0.15);
  toast('✊ رفضت العرض — المنافس غاضب!');
  log('رفض عرض استحواذ '+fmtD(maPending));
  maPending=null;hideModal();save();renderAll();
}

function rollGoal(){
  const start=netWorth();
  const target=start*(1.015+RNG()*0.03)+rnd(500,2000);
  S.goal={start,target};
}
function renderGoal(){
  const el=$('goalBar');if(!el)return;
  if(!S.goal){el.innerHTML='';return;}
  const nw=netWorth();
  const p=Math.max(0,Math.min(1,(nw-S.goal.start)/(S.goal.target-S.goal.start)));
  el.innerHTML='<span style="font-size:11.5px;color:var(--dim)">🎯 هدف اليوم: '+fmtD(S.goal.target)+'</span>'+
    '<div style="flex:1;height:8px;background:#1a2340;border-radius:6px;min-width:80px"><div style="width:'+(p*100).toFixed(0)+'%;height:100%;border-radius:6px;background:linear-gradient(90deg,var(--accent),var(--up))"></div></div>'+
    '<span style="font-size:11.5px;color:'+(p>=1?'var(--up)':'var(--dim)')+'">'+(p*100).toFixed(0)+'%</span>';
}
function weeklyPaper(){
  let best=null,worst=null;
  for(const k in S.assets){const a=S.assets[k];if(a.kind!=='stock')continue;
    const ch=chgPct(a);
    if(!best||ch>best.ch)best={n:a.name,ch};
    if(!worst||ch<worst.ch)worst={n:a.name,ch};
  }
  const nw=netWorth();const wk=S.nwHist.length>7?nw/S.nwHist[S.nwHist.length-7]-1:0;
  const newsTop=S.news.slice(0,3).map(n=>'<div style="font-size:13px;padding:5px 0;border-bottom:1px solid #16203a">• '+n.text+'</div>').join('');
  showModal('<h2>🗞️ جريدة الأسبوع — اليوم '+S.day+'</h2>'+
    row('ثروتك',fmtD(nw))+row('تغير الأسبوع',(wk>=0?'+':'')+(wk*100).toFixed(1)+'%')+
    (best?row('نجم السوق',best.n+' ('+(best.ch>=0?'+':'')+best.ch.toFixed(1)+'%)'):'')+
    (worst?row('الخاسر الأكبر',worst.n+' ('+worst.ch.toFixed(1)+'%)'):'')+
    '<h3 style="margin:12px 0 6px;color:var(--dim);font-size:13px">أبرز الأحداث</h3>'+newsTop+
    '<button class="bigBtn" style="width:100%;margin-top:14px" onclick="hideModal()">تمام</button>');
}

let AC=null;
function beep(f,d){
  if(!S||!S.snd)return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(),g=AC.createGain();
    o.frequency.value=f;o.type='sine';
    g.gain.setValueAtTime(0.07,AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+d);
    o.connect(g);g.connect(AC.destination);
    o.start();o.stop(AC.currentTime+d);
  }catch(e){}
}

function drawChart(cv,data,up){
  const ctx=cv.getContext('2d');const W=cv.width=cv.clientWidth*2,H=cv.height=cv.clientHeight*2;
  ctx.clearRect(0,0,W,H);
  if(!data||data.length<2)return;
  const mn=Math.min(...data),mx=Math.max(...data),rg=(mx-mn)||mx*0.01||1;
  const pad=10;
  
  ctx.strokeStyle='#1a2340';ctx.lineWidth=1;
  for(let i=1;i<4;i++){const y=H*i/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  const col=up?'#22c55e':'#ef4444';
  const grad=ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,up?'#22c55e33':'#ef444433');grad.addColorStop(1,'transparent');
  ctx.beginPath();
  data.forEach((v,i)=>{const x=i/(data.length-1)*(W-pad*2)+pad;const y=H-pad-((v-mn)/rg)*(H-pad*2);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
  ctx.strokeStyle=col;ctx.lineWidth=3;ctx.lineJoin='round';ctx.stroke();
  ctx.lineTo(W-pad,H);ctx.lineTo(pad,H);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  
  const lx=W-pad,ly=H-pad-((data[data.length-1]-mn)/rg)*(H-pad*2);
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(lx,ly,6,0,7);ctx.fill();
  pill(ctx,mx,8,6);pill(ctx,mn,8,H-30);
}
function spark(cv,data){
  const ctx=cv.getContext('2d');const W=cv.width=160,H=cv.height=44;
  const mn=Math.min(...data),mx=Math.max(...data),rg=(mx-mn)||1;
  ctx.beginPath();
  data.forEach((v,i)=>{const x=i/(data.length-1)*W;const y=H-3-((v-mn)/rg)*(H-6);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
  ctx.strokeStyle=data[data.length-1]>=data[0]?'#22c55e':'#ef4444';ctx.lineWidth=2.4;ctx.stroke();
}
function tfData(hist){
  const perDay=24;
  if(tf===0)return hist.filter((_,i)=>i%2===0);
  return hist.slice(-tf*perDay);
}
function toCandles(hist){
  const perDay=24;
  let data=hist;
  if(tf!==0)data=hist.slice(-tf*perDay);
  const cs=[];
  for(let i=0;i<data.length;i+=perDay){
    const ch=data.slice(i,i+perDay);if(!ch.length)break;
    cs.push({o:ch[0],h:Math.max(...ch),l:Math.min(...ch),c:ch[ch.length-1]});
  }
  return cs.length?cs:[{o:data[0]||1,h:data[0]||1,l:data[0]||1,c:data[0]||1}];
}
function drawCandles(cv,cs){
  const ctx=cv.getContext('2d');const W=cv.width=cv.clientWidth*2,H=cv.height=cv.clientHeight*2;
  ctx.clearRect(0,0,W,H);
  const mn=Math.min(...cs.map(c=>c.l)),mx=Math.max(...cs.map(c=>c.h)),rg=(mx-mn)||mx*0.01||1;
  const pad=10;const bw=Math.max(3,(W-pad*2)/cs.length*0.6);
  ctx.strokeStyle='#1a2340';
  for(let i=1;i<4;i++){const y=H*i/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  cs.forEach((c,i)=>{
    const x=pad+(i+0.5)/cs.length*(W-pad*2);
    const y=v=>H-pad-((v-mn)/rg)*(H-pad*2);
    const up=c.c>=c.o;const col=up?'#22c55e':'#ef4444';
    ctx.strokeStyle=col;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x,y(c.h));ctx.lineTo(x,y(c.l));ctx.stroke();
    ctx.fillStyle=col;
    const top=y(Math.max(c.o,c.c)),bot=y(Math.min(c.o,c.c));
    ctx.fillRect(x-bw/2,top,bw,Math.max(2,bot-top));
  });
  pill(ctx,mx,8,6);pill(ctx,mn,8,H-30);
}
function pill(ctx,val,x,y){
  ctx.save();ctx.direction='ltr';ctx.textAlign='left';
  const t=fmt(val);ctx.font='22px Tahoma';
  const w=ctx.measureText(t).width;
  ctx.fillStyle='#0e1422ee';ctx.fillRect(x-4,y-4,w+10,30);
  ctx.fillStyle='#c9d4ea';ctx.fillText(t,x,y+20);
  ctx.restore();
}

function money2(n){return n>=1000?fmt(n):n.toFixed(3).replace(/0+$/,'').replace(/\.$/,'');}
const LEVELS=[[0,'🐣 مبتدئ'],[150000,'📈 متداول'],[300000,'💼 مستثمر'],[600000,'🦅 محترف'],[1200000,'👑 مليونير'],[5000000,'🏰 إمبراطور'],[20000000,'🌟 أسطورة']];
function invLevel(){const nw=netWorth();let l=LEVELS[0][1];LEVELS.forEach(x=>{if(nw>=x[0])l=x[1];});return l;}
function renderHead(){
  const nw=netWorth();
  $('hNet').textContent=fmtD(nw);
  $('hLevel').textContent=invLevel();
  $('hCash').textContent=fmtD(S.cash);
  $('hDay').textContent='اليوم '+S.day+' — '+String(S.hour).padStart(2,'0')+':00';
  const m=S.mood;const el=$('hMood');
  el.textContent=m>0.25?'متفائل 🚀':m>0?'هادئ 🙂':m>-0.25?'قلق 😟':'ذعر 🔻';
  el.className=m>=0?'up':'dn';
}
function chgPct(a){const ref=a.hist.length>24?a.hist[a.hist.length-25]:a.base;return (a.price/ref-1)*100;}
function renderMarket(){
  const tb=$('stockTbl').tBodies[0];tb.innerHTML='';
  let keys=Object.keys(S.assets).filter(k=>(S.assets[k].kind==='stock'||S.assets[k].kind==='crypto'||S.assets[k].kind==='etf'||S.assets[k].kind==='cidx')&&(!secFilter||S.assets[k].sector===secFilter));
  if(S.sortKey==='price')keys.sort((x,y)=>S.assets[y].price-S.assets[x].price);
  else if(S.sortKey==='chg')keys.sort((x,y)=>chgPct(S.assets[y])-chgPct(S.assets[x]));
  else if(S.sortKey==='loss')keys.sort((x,y)=>chgPct(S.assets[x])-chgPct(S.assets[y]));
  keys.forEach(k=>{
    const a=S.assets[k];const ch=chgPct(a);
    const tr=document.createElement('tr');tr.className='row'+(k===sel?' sel':'');
    tr.innerHTML='<td><b>'+a.name+'</b></td><td><span class="badge">'+a.sector+'</span></td>'+
      '<td>'+a.price.toFixed(2)+'</td><td class="chg '+(ch>=0?'up':'dn')+'">'+(ch>=0?'▲':'▼')+' '+Math.abs(ch).toFixed(2)+'%</td>'+
      '<td><canvas class="spark" style="width:80px;height:22px"></canvas></td>';
    tr.onclick=()=>{sel=k;renderAll();};
    tb.appendChild(tr);
    spark(tr.querySelector('canvas'),a.hist.slice(-48));
  });
  [['fxTbl','ع'],['cmdTbl','م']].forEach(([tid,pref])=>{
    const t=$(tid).tBodies[0];t.innerHTML='';
    Object.keys(S.assets).filter(k=>S.assets[k].kind===pref).forEach(k=>{
      const a=S.assets[k];const ch=chgPct(a);
      const tr=document.createElement('tr');tr.className='row'+(k===sel?' sel':'');
      tr.innerHTML='<td><b>'+a.name+'</b></td><td>'+money2(a.price)+'</td><td class="chg '+(ch>=0?'up':'dn')+'">'+(ch>=0?'▲':'▼')+' '+Math.abs(ch).toFixed(2)+'%</td>';
      tr.onclick=()=>{sel=k;renderAll();};
      t.appendChild(tr);
    });
  });
}
function renderAsset(){
  const a=S.assets[sel];if(!a)return;
  $('assetName').textContent=a.name;
  $('assetPrice').textContent=money2(a.price)+' د.';
  const ch=chgPct(a);const e=$('assetChg');
  e.textContent=(ch>=0?'▲ +':'▼ ')+ch.toFixed(2)+'%';
  e.className='chg '+(ch>=0?'up':'dn');
  $('assetKind').textContent=a.kind==='stock'?'سهم — '+a.sector:a.kind==='fx'?'عملة':'سلعة';
  const d=tfData(a.hist);
  if(chartMode==='candle')drawCandles($('bigChart'),toCandles(a.hist));
  else drawChart($('bigChart'),d,d[d.length-1]>=d[0]);
  const pos=[];
  if(a.held>0)pos.push('تملك '+a.held+' | متوسط '+a.avg.toFixed(2));
  if(a.short>0){const spl=(a.shortAvg-a.price)*a.short;pos.push('🔻 شورت '+a.short+' | متوسط '+a.shortAvg.toFixed(2)+' | '+(spl>=0?'+':'')+fmt(spl));}
  $('tradeInfo').textContent=pos.join(' — ');
}
function renderMacro(){
  const el=$('macroBody');if(!el)return;
  const m=MACRO[S.macro.phase];
  el.innerHTML='<div class="kpis">'+kpi('المرحلة الحالية',m.ic+' '+m.n)+kpi('تتحول خلال',S.macro.days+' يوم')+'</div>'+
  '<div style="display:flex;gap:4px;margin-top:8px">'+MACRO.map((x,i)=>'<div style="flex:1;text-align:center;padding:6px 2px;border-radius:8px;font-size:12px;'+(i===S.macro.phase?'background:var(--accent);color:#fff;font-weight:700':'background:var(--panel2);color:var(--dim)')+'">'+x.ic+' '+x.n+'</div>').join('')+'</div>'+
  '<div style="font-size:12px;color:var(--dim);margin-top:6px">'+m.msg+' — الأسهم تتأثر بانحياز '+(m.bias>=0?'+':'')+(m.bias*100).toFixed(2)+'% كل ساعة، والكريبتو ×١.٥ والسلع عكسيًا.</div>';
}
function renderAlloc(){
  const cv=$('allocChart');if(!cv)return;
  const B=[['كاش',S.cash,'#3b82f6'],['ودائع',S.dep,'#22d3ee'],['عقارات',propsValue(),'#f59e0b'],['سندات',S.bonds.reduce((s,b)=>s+b.amt*1.04,0),'#a78bfa'],['شركتك',companyValue(),'#f472b6'],['صناديق مُدارة',S.fundH?S.fundH.reduce((s,h,i)=>s+h*(S.fundP?S.fundP[i]:100),0):0,'#34d399'],['مخاطر 🦄',S.vc.reduce((s,v)=>s+v.amt,0),'#fb923c']];
  const kindV={stock:0,crypto:0,fx:0,cmd:0,etf:0,cidx:0};
  for(const k in S.assets){const a=S.assets[k];if(a.held>0)kindV[a.kind]=(kindV[a.kind]||0)+a.held*a.price;}
  B.push(['أسهم',kindV.stock,'#22c55e'],['كريبتو',kindV.crypto,'#eab308'],['عملات',kindV.fx,'#94a3b8'],['سلع',kindV.cmd,'#fbbf24'],['صناديق قطاعات',kindV.etf,'#60a5fa'],['بورصات مدن',kindV.cidx,'#c084fc']);
  const tot=B.reduce((s,b)=>s+Math.max(0,b[1]),0)||1;
  const top=B.filter(b=>b[1]>0).sort((x,y)=>y[1]-x[1]);
  const big=top.slice(0,7);const rest=top.slice(7);
  if(rest.length)big.push(['أخرى',rest.reduce((s,b)=>s+b[1],0),'#475569']);
  const ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);ctx.direction='ltr';
  const cx=90,cy=90,r=62,ir=34;
  let ang=-Math.PI/2;
  big.forEach(b=>{
    const frac=Math.max(0,b[1])/tot,sw=frac*Math.PI*2;
    ctx.beginPath();ctx.arc(cx,cy,r,ang,ang+sw);ctx.arc(cx,cy,ir,ang+sw,ang,true);ctx.closePath();
    ctx.fillStyle=b[2];ctx.fill();ang+=sw;
  });
  ctx.fillStyle='#e8edf7';ctx.font='bold 12px sans-serif';ctx.textAlign='center';
  ctx.fillText(fmtD(tot),cx,cy+4);
  ctx.font='11px sans-serif';ctx.textAlign='left';
  big.forEach((b,i)=>{
    const y=18+i*22;
    ctx.fillStyle=b[2];ctx.fillRect(180,y-8,10,10);
    ctx.fillStyle='#e8edf7';
    ctx.fillText(b[0]+' — '+(Math.max(0,b[1])/tot*100).toFixed(1)+'%',196,y);
  });
}
function renderPortfolio(){
  const tb=$('pfTbl').tBodies[0];tb.innerHTML='';let any=false;
  for(const k in S.assets){const a=S.assets[k];if(!a.held)continue;any=true;
    const v=a.held*a.price,pl=(a.price-a.avg)*a.held;
    const tr=document.createElement('tr');
    tr.innerHTML='<td><b>'+a.name+'</b></td><td>'+a.held+'</td><td>'+a.avg.toFixed(2)+'</td><td>'+money2(a.price)+'</td><td>'+fmtD(v)+'</td>'+
      '<td class="chg '+(pl>=0?'up':'dn')+'">'+(pl>=0?'+':'')+fmt(pl)+'</td>';
    tr.onclick=()=>{sel=k;showPage('market');renderAll();};
    tr.style.cursor='pointer';
    tb.appendChild(tr);}
  $('pfEmpty').classList.toggle('hidden',any);
  drawChart($('nwChart'),S.nwHist,true);
  renderAlloc();
  $('txLog').innerHTML=S.tx.map(t=>'<div style="font-size:12.5px;color:var(--dim);padding:4px 0;border-bottom:1px solid #16203a">يوم '+t.d+' — '+t.t+'</div>').join('')||'<span style="color:var(--dim);font-size:13px">لا عمليات بعد.</span>';
}
function renderBank(){
  $('bkRate').textContent=(S.rate*100).toFixed(1)+'%';
  $('bkDep').textContent=fmtD(S.dep);
  $('bkLoan').textContent=fmtD(S.loan);
  const nextCB=S.day+(15-S.day%15);
  const gdp=50+S.mood*30;
  $('macroKpis').innerHTML=
    kpi('النمو الاقتصادي',gdp.toFixed(1)+'%')+kpi('التضخم',(S.infl*100).toFixed(1)+'%')+
    kpi('الفائدة',(S.rate*100).toFixed(1)+'%')+kpi('ثقة المستهلك',(60+S.mood*40).toFixed(0)+'/100')+
    kpi('🏦 اجتماع المركزي القادم','يوم '+nextCB)+kpi('💥 فقاعات محتملة',Object.values(S.bubbles).filter(v=>v>2).length||'لا شيء');
}
function kpi(l,v){return '<div class="kpi"><b>'+v+'</b><span>'+l+'</span></div>';}
function renderCompany(){
  const c=S.company;
  $('coFound').classList.toggle('hidden',!!c);
  $('coPanel').classList.toggle('hidden',!c);
  if(!c)return;
  $('coTitle').textContent=c.name+' — قطاع '+c.sector;
  $('coKpis').innerHTML=
    kpi('خزينة الشركة',fmtD(c.cash))+kpi('قيمة الشركة',fmtD(companyValue()))+
    kpi('مبيعات اليوم',c.todaySold||0)+kpi('ربح اليوم',fmtD(c.todayProfit||0))+
    kpi('الجودة',c.quality.toFixed(0)+'/100')+kpi('العمال',c.workers)+
    kpi('رضا الفريق',Math.round(c.morale)+'%')+kpi('طاقم الإدارة',staffLevel(c)+'/15')+
    kpi('مشتركون',(c.subs&&c.subs.active)?Math.round(c.subs.members):'—')+kpi('إيراد شهري متكرر',(c.subs&&c.subs.active)?fmtD(c.subs.mrr||0):'—')+
    kpi('رضا العملاء',Math.round((c.care&&c.care.csat)||70)+'%');
  $('vPrice').textContent=c.price+' د.';
  $('vRd').textContent=fmtD(c.rd);
  $('vMk').textContent=fmtD(c.marketing);
  $('vWk').textContent=c.workers;
  $('sPrice').value=c.price;$('sRd').value=c.rd;$('sMk').value=c.marketing;$('sWk').value=c.workers;
}
const RIVAL_CORPS=['مجموعة الشرق','نور القابضة','الاتحاد الصناعي','دلتا تكنولوجيز','البحر الأحمر للصناعة'];
function initCorp(){
  if(S.corp&&S.corp.length)return;
  S.corp=RIVAL_CORPS.map(n=>({n:n,rep:Math.round(rnd(40,80)),brand:Math.round(rnd(35,80)),value:Math.round(rnd(250000,1500000))}));
}
function corpRows(){
  initCorp();
  const rows=S.corp.map(c=>({n:c.n,rep:Math.round(c.rep),brand:Math.round(c.brand),value:Math.round(c.value),me:false}));
  if(S.company)rows.push({n:S.company.name+' (أنت)',rep:Math.round(S.company.rep==null?50:S.company.rep),brand:Math.round(S.company.brand==null?10:S.company.brand),value:Math.round(companyValue()),me:true});
  rows.forEach(r=>{r.score=r.value+r.rep*800+r.brand*600;});
  rows.sort((a,b)=>b.score-a.score);
  return rows;
}
function marketShare(){
  const rows=corpRows();
  const total=rows.reduce((s,r)=>s+r.value,0)||1;
  const mine=rows.filter(r=>r.me).reduce((s,r)=>s+r.value,0);
  return {mine:mine/total*100,top:rows[0]?(rows[0].value/total*100):0,rank:rows.findIndex(r=>r.me)+1,total:total};
}
function runContest(){
  const rows=corpRows();
  if(!rows.length)return;
  const top=rows[0];const wk=Math.floor(S.day/7);const prize=30000;
  if(!S.contests)S.contests=[];
  S.contests.push({w:wk,n:top.n,me:!!top.me,score:Math.round(top.score)});
  if(S.contests.length>8)S.contests.shift();
  if(top.me&&S.company){
    S.company.cash+=prize;
    S.company.brand=Math.min(100,(S.company.brand==null?10:S.company.brand)+8);
    pushNews(S,'🏆 "'+S.company.name+'" شركة الأسبوع — جايزة '+fmtD(prize)+' و+8 علامة',0.02,true,true);
    toast('🏆 شركة الأسبوع! +'+fmtD(prize)+' و+8 علامة');
  }else{
    pushNews(S,'🏆 "'+top.n+'" شركة الأسبوع في السوق لهذا الأسبوع',0.005,false,true);
  }
}
function renderCorp(){
  const b=$('corpBody');if(!b)return;
  const rows=corpRows();
  const myIdx=rows.findIndex(r=>r.me);
  const G='display:grid;grid-template-columns:2.2fr 0.7fr 0.7fr 1.2fr;gap:6px';
  let h='<div style="'+G+';font-size:12px;color:var(--dim);padding:4px 2px;border-bottom:1px solid var(--line)"><span>الشركة</span><span>سمعة</span><span>علامة</span><span>القيمة</span></div>';
  rows.forEach((r,i)=>{
    const bg=r.me?'background:rgba(59,130,246,.12);border-radius:8px;':'';
    h+='<div style="'+G+';font-size:12.5px;padding:6px 2px;border-bottom:1px solid var(--line);'+bg+'"><span>'+(i+1)+'. '+(r.me?'<b>'+r.n+'</b>':r.n)+'</span><span>'+r.rep+'</span><span>'+r.brand+'</span><span>'+fmtD(r.value)+'</span></div>';
  });
  const ms=marketShare();
  h+='<div style="margin-top:10px;font-size:12.5px;color:var(--dim)">حصة السوق: <b style="color:var(--txt)">'+ms.mine.toFixed(1)+'%</b> · المتصدر '+ms.top.toFixed(1)+'%</div>';
  h+='<div style="height:8px;background:var(--panel2);border-radius:6px;overflow:hidden;margin:4px 0 6px"><div style="height:100%;width:'+Math.min(100,ms.mine).toFixed(1)+'%;background:var(--accent)"></div></div>';
  if(S.contests&&S.contests.length){
    h+='<div style="margin-top:8px;font-size:12px;color:var(--dim)">آخر أبطال الأسبوع: '+S.contests.slice(-3).reverse().map(c=>'<b style="color:'+(c.me?'var(--up)':'var(--txt)')+'">'+c.n+'</b>').join(' · ')+'</div>';
  }
  if(myIdx<0){
    h+='<div style="margin-top:8px;color:var(--dim);font-size:12.5px">أسّس شركة عشان تدخل الترتيب.</div>';
  }else if(myIdx===0){
    h+='<div style="margin-top:8px;color:var(--up);font-size:12.5px">👑 أنت رقم ١ في السوق — حافظ على الصدارة</div>';
  }else{
    const above=rows[myIdx-1];const need=Math.max(0,above.score-rows[myIdx].score);
    h+='<div style="margin-top:8px;font-size:12.5px">للصعود مركزًا: محتاج <b>'+fmtD(Math.round(need))+'</b> قوة زيادة على "'+above.n+'" (قيمة + سمعة×800 + علامة×600)</div>';
  }
  b.innerHTML=h;
}
function healthScore(){
  const c=S.company;if(!c)return null;
  const h=c.hist||[];
  let trend=0.5;
  if(h.length>=6){
    const a=h.slice(-3).reduce((x,y)=>x+y.p,0)/3;
    const b=h.slice(-6,-3).reduce((x,y)=>x+y.p,0)/3;
    trend=Math.max(0,Math.min(1,0.5+(a-b)/Math.max(1000,Math.abs(b))*0.5));
  }
  const invFill=c.inv?Math.min(1,c.inv.units/Math.max(1,c.inv.cap*0.35)):0.5;
  const parts=[
   {k:'رضا الفريق',v:(c.morale==null?60:c.morale)/100,w:0.2,tip:'ارفع مستوى الرواتب أو قلّل عدد العمال'},
   {k:'الجودة',v:(c.quality||0)/100,w:0.2,tip:'زود الإنفاق على الجودة أو عيّن مهندس جودة'},
   {k:'العلامة التجارية',v:(c.brand==null?10:c.brand)/100,w:0.15,tip:'شغّل حملة تسويق'},
   {k:'السمعة',v:(c.rep==null?50:c.rep)/100,w:0.2,tip:'عالج الأزمات فورًا'},
   {k:'المخزون',v:invFill,w:0.1,tip:'اطلب شحنة قبل ما المخزون يخلص'},
   {k:'اتجاه الربح',v:trend,w:0.15,tip:'حسّن الهامش أو خفّض التكاليف'}
  ];
  const score=Math.round(parts.reduce((s,p)=>s+p.v*p.w,0)*100);
  return {score:score,parts:parts};
}
function renderHealth(){
  const b=$('healthBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='';return;}
  const hs=healthScore();if(!hs)return;
  const sc=hs.score;
  const col=sc>=70?'var(--up)':sc>=45?'#f59e0b':'var(--dn)';
  const grade=sc>=85?'A':sc>=70?'B':sc>=45?'C':'D';
  let h='<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0"><span style="font-size:14px">❤️ صحة الشركة</span><b style="font-size:22px;color:'+col+'">'+sc+'/100 · '+grade+'</b></div>';
  h+='<div style="height:10px;background:var(--panel2);border-radius:6px;overflow:hidden;margin:2px 0 10px"><div style="height:100%;width:'+sc+'%;background:'+col+'"></div></div>';
  hs.parts.forEach(p=>{
    const v=Math.round(p.v*100);
    const pc=v>=60?'var(--up)':v>=40?'#f59e0b':'var(--dn)';
    h+='<div style="display:flex;justify-content:space-between;gap:10px;padding:4px 0;font-size:13px"><span style="color:var(--dim)">'+p.k+'</span><b style="color:'+pc+'">'+v+'%</b></div>';
  });
  const warns=hs.parts.filter(p=>p.v<0.45);
  if(warns.length){
    h+='<div style="margin-top:8px;background:rgba(239,68,68,.1);border:1px solid var(--dn);border-radius:10px;padding:8px;font-size:12.5px">⚠️ تحذيرات: '+warns.map(w=>w.k+' — '+w.tip).join(' · ')+'</div>';
  }else{
    h+='<div style="margin-top:8px;color:var(--up);font-size:12.5px">✔ كل المؤشرات في نطاق آمن</div>';
  }
  b.innerHTML=h;
}
function invDef(){return {units:2000,cap:6000,order:null,auto:false,missed:0,stockDays:0};}
function orderStock(units){
  const c=S.company;if(!c)return toast('أسّس شركة أولًا');
  if(!c.inv)c.inv=invDef();
  if(c.inv.order)return toast('في شحنة في الطريق بالفعل');
  const cost=Math.round(units*supCost());
  if(c.cash<cost)return toast('❌ الخزينة لا تكفي ('+fmtD(cost)+')');
  c.cash-=cost;c.inv.order={units:units,left:3};
  toast('📦 طلب شحنة '+units+' وحدة — توصل بعد 3 أيام');
  renderInv();renderCompany();
}
function toggleAutoOrder(){
  const c=S.company;if(!c)return;if(!c.inv)c.inv=invDef();
  c.inv.auto=!c.inv.auto;
  toast(c.inv.auto?'🔁 إعادة الطلب التلقائي مفعّلة':'إعادة الطلب التلقائي متوقفة');
  renderInv();
}
function upgradeWarehouse(){
  const c=S.company;if(!c)return;if(!c.inv)c.inv=invDef();
  const cost=25000;
  if(c.cash<cost)return toast('❌ الخزينة لا تكفي ('+fmtD(cost)+')');
  c.cash-=cost;c.inv.cap+=4000;
  toast('🏭 توسيع المخزن (+4,000 وحدة)');
  renderInv();renderCompany();
}
function renderInv(){
  const b=$('invBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  if(!c.inv)c.inv=invDef();
  const u=Math.round(c.inv.units),cap=c.inv.cap;
  const pct=Math.max(0,Math.min(100,Math.round(u/cap*100)));
  const col=pct>40?'var(--up)':pct>15?'#f59e0b':'var(--dn)';
  const prod=Math.round(c.workers*8*(1+0.5*((c.up&&c.up.line)||0))*(0.72+(c.morale||60)/100*0.56));
  let h='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0"><span>المخزون</span><b style="color:'+col+'">'+u+' / '+cap+' وحدة</b></div>';
  h+='<div style="height:9px;background:var(--panel2);border-radius:6px;overflow:hidden;margin:4px 0 10px"><div style="height:100%;width:'+pct+'%;background:'+col+'"></div></div>';
  h+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--line);font-size:13.5px"><span>إنتاج اليوم</span><b>'+prod+' وحدة</b></div>';
  h+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--line);font-size:13.5px"><span>مبيعات فائتة اليوم (نفاد)</span><b style="color:'+(c.inv.missed>0?'var(--dn)':'var(--dim)')+'">'+(c.inv.missed||0)+' وحدة</b></div>';
  if(c.inv.order){
    h+='<div style="background:rgba(59,130,246,.12);border:1px solid var(--accent);border-radius:12px;padding:9px;margin:8px 0">🚚 شحنة '+c.inv.order.units+' وحدة في الطريق — توصل بعد '+c.inv.order.left+' يوم</div>';
  }
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">';
  [500,1500,5000].forEach(n=>{
    h+='<button class="btnGhost" onclick="orderStock('+n+')" '+(c.inv.order||c.cash<n*supCost()?'disabled':'')+'>اطلب '+n+' ('+fmtD(n*supCost())+')</button>';
  });
  h+='</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'+
    '<button class="btnGhost" onclick="toggleAutoOrder()">'+(c.inv.auto?'🔁 إعادة طلب تلقائي: مفعّلة':'🔁 إعادة طلب تلقائي: متوقفة')+'</button>'+
    '<button class="btnGhost" onclick="upgradeWarehouse()" '+(c.cash<25000?'disabled':'')+'>🏭 توسيع المخزن (25.0 ألف د.)</button></div>';
  b.innerHTML=h;
}

const SUP_NAMES=['مصنع النيل','الشرق للتوريد','مجموعة الدلتا','مؤسسة الحرية','توريدات الإسكندرية','مصنع الأمل'];
function supDef(){return {active:null,offers:[],history:[],deals:0};}
function genSupOffers(){
  const c=S.company;if(!c)return [];
  if(!c.sup)c.sup=supDef();
  const pick=[];const used={};
  for(let i=0;i<3;i++){
    let n,guard=0;
    do{n=SUP_NAMES[Math.floor(RNG()*SUP_NAMES.length)];guard++;}while(used[n]&&guard<25);
    used[n]=1;
    const tier=Math.floor(RNG()*3);
    const unitCost=+(rnd(2.1,2.7)+tier*0.55).toFixed(2);
    const reliability=Math.min(0.99,+(0.72+tier*0.09+rnd(-0.03,0.05)).toFixed(2));
    const quality=Math.round(rnd(0,3)+tier*3);
    const volume=Math.round(rnd(600,1400)/100)*100;
    pick.push({name:n,unitCost:unitCost,reliability:reliability,quality:quality,volume:volume,term:30,tier:tier,neg:0,declined:false,fee:Math.round(unitCost*volume*2)});
  }
  c.sup.offers=pick;
  return pick;
}
function supOffers(){
  const c=S.company;if(!c)return [];
  if(!c.sup)c.sup=supDef();
  if(!c.sup.offers||!c.sup.offers.length)genSupOffers();
  return c.sup.offers;
}
function supCost(){const c=S.company;return (c&&c.sup&&c.sup.active)?c.sup.active.unitCost:3;}
function negotiateSup(i,style){
  const c=S.company;if(!c)return false;
  const o=supOffers()[i];if(!o||o.declined||o.neg>=2)return false;
  const rep=(c.rep==null?50:c.rep)/100,br=(c.brand==null?10:c.brand)/100;
  if(style==='hard'){
    if(RNG()<0.35+rep*0.4+br*0.2){
      o.unitCost=+(o.unitCost*0.88).toFixed(2);
      o.reliability=Math.max(0.6,+(o.reliability-0.05).toFixed(2));
      o.quality=Math.max(0,o.quality-2);o.neg++;
      toast('💪 '+o.name+' وافق على خصم ١٢٪');
    }else{
      o.declined=true;o.neg=2;
      toast('🚫 '+o.name+' رفض التفاوض — العرض اتقفل');
    }
  }else if(style==='fair'){
    o.unitCost=+(o.unitCost*0.96).toFixed(2);o.neg++;
    toast('🤝 '+o.name+' وافق على خصم ٤٪');
  }else{
    o.unitCost=+(o.unitCost*1.06).toFixed(2);
    o.reliability=Math.min(0.99,+(o.reliability+0.05).toFixed(2));
    o.quality=o.quality+4;o.neg++;
    toast('⭐ اتفاقية ممتازة مع '+o.name+' — التزام أعلى وجودة أحسن');
  }
  o.fee=Math.round(o.unitCost*o.volume*2);
  c.sup.deals=(c.sup.deals||0)+1;
  save();renderSup();renderCompany();
  return true;
}
function negHard(i){return negotiateSup(i,'hard');}
function negFair(i){return negotiateSup(i,'fair');}
function negPrem(i){return negotiateSup(i,'prem');}
function signSup(i){
  const c=S.company;if(!c)return false;
  if(!c.sup)c.sup=supDef();
  if(c.sup.active)return false;
  const o=supOffers()[i];if(!o||o.declined)return false;
  if(c.cash<o.fee)return false;
  c.cash-=o.fee;
  c.sup.active={name:o.name,unitCost:o.unitCost,reliability:o.reliability,quality:o.quality,volume:o.volume,term:o.term,endDay:S.day+o.term,fee:o.fee};
  c.sup.offers=[];
  c.sup.history.push({d:S.day,n:o.name,cost:o.unitCost});
  if(c.sup.history.length>6)c.sup.history.shift();
  toast('🤝 عقد توريد مع '+o.name+' — '+o.term+' يوم بسعر '+o.unitCost.toFixed(2)+'/وحدة');
  pushNews(S,'🤝 "'+c.name+'" توقّع عقد توريد مع "'+o.name+'" لمدة '+o.term+' يوم',0.01,true,true);
  save();renderSup();renderInv();renderCompany();
  return true;
}
function cancelSup(){
  const c=S.company;if(!c||!c.sup||!c.sup.active)return false;
  const a=c.sup.active;
  const pen=Math.round(a.unitCost*a.volume*2);
  if(c.cash<pen)return false;
  c.cash-=pen;
  c.rep=Math.max(0,(c.rep==null?50:c.rep)-3);
  c.sup.active=null;c.sup.offers=[];
  toast('📄 فسخت العقد — غرامة '+fmtD(pen)+' وسمعة −3');
  pushNews(S,'📄 "'+c.name+'" فسخت عقد التوريد مع "'+a.name+'"',-0.01,false,true);
  save();renderSup();renderInv();renderCompany();
  return true;
}
function supTick(){
  const c=S.company;if(!c||!c.sup||!c.sup.active)return;
  const a=c.sup.active;
  if(a.quality>0)c.quality=Math.min(100,(c.quality||0)+a.quality*0.02);
  if(S.day>=a.endDay){
    c.sup.active=null;c.sup.offers=[];
    toast('📄 انتهى عقد التوريد مع '+a.name+' — اختار مورد جديد');
    pushNews(S,'📄 انتهى عقد توريد "'+c.name+'" مع "'+a.name+'"',0,false,true);
  }
                }
