function closeMargin(forced){
  const m=S.marginPos;if(!m)return 0;
  const a=S.assets[m.sym];if(!a){S.marginPos=null;return 0;}
  const equity=m.qty*a.price-m.debt;
  S.cash+=equity;
  S.marginPos=null;
  return equity;
}
function renderBench(){
  const el=$('benchBar');if(!el)return;
  let s=0,n=0;
  Object.keys(S.assets).forEach(k=>{const a=S.assets[k];if(a.kind==='stock'&&a.hist.length&&a.hist[0]>0){s+=a.price/a.hist[0]-1;n++;}});
  const mkt=n?s/n*100:0;
  const you=(netWorth()/100000-1)*100;
  const beat=you>=mkt;
  el.innerHTML='<div style="display:flex;gap:10px;flex-wrap:wrap;font-size:13px;align-items:center">'+
  '<span>أداؤك: <b class="chg '+(you>=0?'up':'dn')+'">'+(you>=0?'+':'')+you.toFixed(1)+'%</b></span>'+
  '<span>السوق: <b class="chg '+(mkt>=0?'up':'dn')+'">'+(mkt>=0?'+':'')+mkt.toFixed(1)+'%</b></span>'+
  '<span class="badge" style="background:'+(beat?'#14532d':'#3f1d1d')+';color:'+(beat?'#86efac':'#fca5a5')+'">'+(beat?'🔥 متفوق على السوق':'🐢 متأخر عن السوق')+'</span></div>';
}
function renderBackup(){
  const be=$('btnExp');if(!be)return;
  be.onclick=()=>{
    const t=JSON.stringify(S);
    $('impTxt').value=t;
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>toast('💾 الحفظ اتنسخ — احتفظ بيه في مكان آمن'),()=>toast('💾 الحفظ في الصندوق تحت — انسخه يدويًا'));
    else toast('💾 الحفظ في الصندوق تحت — انسخه يدويًا');
  };
  $('btnImp').onclick=()=>{
    try{
      const o=JSON.parse($('impTxt').value);
      if(!o||!o.assets||o.cash==null)throw 0;
      try{localStorage.setItem('econBackup1',JSON.stringify(S));}catch(e){}
      S=o;migrate();save();renderAll();
      toast('📥 تم استيراد الحفظ بنجاح');
    }catch(e){toast('❌ نص حفظ غير صالح');}
  };
}
function econEvents(){
  const ev=[];
  const earn=(10-S.day%10)%10;ev.push({d:earn,t:'📊 موسم الأرباح — مفاجآت تهز الأسعار'});
  const tax=(30-S.day%30)%30;ev.push({d:tax,t:'🧾 ضريبة الأرباح (١٠٪ من أرباح ٣٠ يوم)'});
  if(S.bonds.length){const nb=Math.min.apply(null,S.bonds.map(b=>b.due))-S.day;ev.push({d:Math.max(0,nb),t:'💵 استحقاق سند حكومي (+٤٪)'});}
  if(S.weekly)ev.push({d:Math.max(0,S.weekly.endDay-S.day),t:'🏁 نهاية '+(S.weekly.scn!=null?SCEN[S.weekly.scn].n:'تحدي الأسبوع')});
  if(S.auction)ev.push({d:Math.max(0,S.auction.ends-S.day),t:'🔨 حسم مزاد "'+S.auction.name+'"'});
  if(S.duel)ev.push({d:Math.max(0,S.duel.day0+5-S.day),t:'⚔️ نهاية مبارزة المتداولين'});
  if(S.vc.length){const nd=Math.min.apply(null,S.vc.map(v=>v.due))-S.day;ev.push({d:Math.max(0,nd),t:'🦄 خروج استثمار مخاطر'});}
  if(S.options.length){const no=Math.min.apply(null,S.options.map(o=>o.expiry))-S.day;ev.push({d:Math.max(0,no),t:'📈 انتهاء عقد خيارات'});}
  if(S.company)ev.push({d:(30-S.day%30)%30,t:'📋 تقرير شركتك ربع السنوي'});
  if(S.ins&&S.ins.until>=S.day)ev.push({d:S.ins.until-S.day,t:'🛡️ انتهاء تغطية التأمين'});
  if(S.macro)ev.push({d:S.macro.days,t:'🌡️ دورة الاقتصاد تتحول (حاليًا: '+MACRO[S.macro.phase].n+')'});
  ev.push({d:0,t:'🎰 سحب اليانصيب اليومي — نهاية اليوم'});
  return ev.sort((a,b)=>a.d-b.d).slice(0,6);
}
function renderEconCal(){
  const el=$('econCal');if(!el)return;
  el.innerHTML=econEvents().map(e=>'<div style="display:flex;justify-content:space-between;font-size:12.5px;padding:3px 0;border-bottom:1px solid var(--line)"><span>'+e.t+'</span><b style="color:'+(e.d===0?'var(--gold)':'var(--dim)')+'">'+(e.d===0?'اليوم':'بعد '+e.d+' يوم')+'</b></div>').join('');
}
function renderGEvent(){
  const cd=$('gEventCard');if(!cd)return;
  if(S.gEvent){cd.style.display='block';
    $('gEventTitle').textContent=S.gEvent.ic+' '+S.gEvent.n+' — متبقٍ '+S.gEvent.days+' يوم';
    $('gEventDesc').textContent=S.gEvent.msg;
  }else cd.style.display='none';
}
function renderDepth(){
  const cv=$('depthChart');if(!cv)return;
  const a=S.assets[sel];if(!a)return;
  const ctx=cv.getContext('2d');
  const w=cv.width=Math.max(300,cv.clientWidth||600),h=cv.height=90;
  ctx.clearRect(0,0,w,h);
  const rows=8,bh=(h/2-4)/rows;
  const vol=a.vol||0.02;
  for(let i=0;i<rows;i++){
    const bw=(0.25+RNG()*0.75)*(w*0.42)*(1+vol*8)/(1+i*0.18);
    ctx.fillStyle='rgba(34,197,94,.55)';
    ctx.fillRect(w/2-bw,4+i*bh,bw,bh-2);
    ctx.fillStyle='rgba(239,68,68,.55)';
    ctx.fillRect(w/2,h-4-(i+1)*bh,bw,bh-2);
  }
  ctx.direction='ltr';ctx.fillStyle='#94a3b8';ctx.font='10px Cairo';
  ctx.fillText('شراء',6,h/2+8);ctx.fillText('بيع',w-24,h/2-4);
}
function renderPrestige(){
  const el=$('prestigeInfo');if(!el)return;
  const need=20000000,nw=netWorth();
  el.innerHTML='نجومك: '+('⭐'.repeat(S.prestige||0)||'لا شيء بعد')+'<br>مضاعف أرباحك الحالي: ×'+pmult().toFixed(2)+'<br>الرتبة الجاية تحتاج صافي ثروة '+fmtD(need)+' — عندك '+fmtD(nw);
  $('btnPrestige').disabled=nw<need;
  $('btnPrestige').style.opacity=nw<need?0.5:1;
}

function careOf(c){
  if(!c)return null;
  if(!c.care)c.care={agents:0,csat:70,tickets:0,resolved:0,backlog:0,trained:0};
  return c.care;
}
function careCost(c){
  const k=c&&c.care;
  return k?Math.round((k.agents||0)*900):0;
}
function careTick(c,sold){
  const k=careOf(c);
  if(!k)return 70;
  const missed=(c.inv&&c.inv.missed)||0;
  const tickets=Math.round((sold||0)*0.02+missed*0.08+(c.workers||0)*0.02);
  const open=tickets+(k.backlog||0);
  const cap=(k.agents||0)*22*(0.6+Math.min(0.5,(c.morale||60)/200));
  const resolved=Math.min(open,Math.round(cap));
  k.backlog=Math.max(0,open-resolved);
  k.tickets=tickets;k.resolved=resolved;
  const ratio=open>0?resolved/open:1;
  const target=Math.max(5,Math.min(100,45+(c.quality||0)*0.35+ratio*25-(c.crisis?12:0)-Math.min(25,(k.backlog||0)*0.15)+(k.trained||0)));
  k.csat=Math.max(0,Math.min(100,(k.csat==null?70:k.csat)+(target-k.csat)*0.15));
  return k.csat;
}
function careDemandF(c){
  const k=c&&c.care;
  if(!k)return 1;
  return Math.max(0.75,0.85+(k.csat||70)/300);
}
function careChurnF(c){
  const k=c&&c.care;
  if(!k)return 1;
  return Math.max(0.6,1+((60-(k.csat||70))/120));
}
function hireCare(n){
  const c=S.company;if(!c)return false;
  const k=careOf(c);
  const before=k.agents||0;
  const target=Math.max(0,Math.min(40,before+n));
  if(target===before)return false;
  if(n>0){
    const cost=Math.round(1500*n);
    if(c.cash<cost)return false;
    c.cash-=cost;
  }
  k.agents=target;
  toast((n>0?'🧑‍💻 عيّنت ':'🚪 سرّحت ')+Math.abs(target-before)+' من فريق الدعم');
  save();renderAll();
  return true;
}
function trainCare(){
  const c=S.company;if(!c)return false;
  const k=careOf(c);
  if(c.cash<5000)return false;
  if((k.trained||0)>=10)return false;
  c.cash-=5000;
  k.trained=(k.trained||0)+1;
  k.csat=Math.min(100,(k.csat||70)+4);
  toast('🎓 تدريب فريق الدعم — رضا العملاء +4');
  save();renderAll();
  return true;
}
function renderCare(){
  const b=$('careBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const k=careOf(c);
  const csat=Math.round(k.csat||70);
  const col=csat>=75?'var(--up)':csat>=55?'var(--gold)':'var(--down)';
  const mood=csat>=75?'ممتاز 😀':csat>=55?'مقبول 😐':'سيئ 😠';
  let h='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap"><b style="font-size:13.5px">رضا العملاء: <span style="color:'+col+'">'+csat+'٪ — '+mood+'</span></b><span style="font-size:12px;color:var(--dim)">فريق الدعم: '+(k.agents||0)+' · تكلفة '+fmtD(careCost(c))+'/يوم</span></div>';
  h+='<div style="height:9px;background:#1a2340;border-radius:6px;margin:8px 0 10px"><div style="width:'+csat+'%;height:100%;border-radius:6px;background:'+col+'"></div></div>';
  h+='<div class="kpis">'+kpi('تذاكر اليوم',k.tickets||0)+kpi('تم حلها',k.resolved||0)+kpi('متأخرة',Math.round(k.backlog||0))+'</div>';
  h+='<div class="tradeRow" style="margin-top:10px">'+
     '<button class="btnShort" onclick="hireCare(1)" '+(c.cash<1500||(k.agents||0)>=40?'disabled':'')+'>➕ تعيين موظف دعم (١٬٥٠٠)</button>'+
     '<button class="btnGhost" onclick="hireCare(5)" '+(c.cash<7500||(k.agents||0)>=40?'disabled':'')+'>➕ ٥ موظفين (٧٬٥٠٠)</button>'+
     '<button class="btnGhost" onclick="hireCare(-1)" '+((k.agents||0)<=0?'disabled':'')+'>➖ تسريح</button>'+
     '<button class="btnGhost" onclick="trainCare()" '+(c.cash<5000||(k.trained||0)>=10?'disabled':'')+'>🎓 تدريب (٥٬٠٠٠)</button>'+
     '</div>';
  h+='<div style="font-size:11.5px;color:var(--dim);margin-top:8px">أثر الرضا على الطلب: '+Math.round((careDemandF(c)-1)*100)+'٪ · على فقد المشتركين: '+Math.round((careChurnF(c)-1)*100)+'٪ · تدريبات: '+(k.trained||0)+'/10</div>';
  b.innerHTML=h;
}

function mergerOf(){
  if(!S.merger)S.merger={target:-1,name:null,value:0,rep:0,dd:false,risk:0.5,lastTry:-99,log:[]};
  if(!S.merger.log)S.merger.log=[];
  return S.merger;
}
function mlog(t){
  const m=mergerOf();
  m.log.push({d:S.day,t:t});
  if(m.log.length>8)m.log.shift();
}
function startMerger(i){
  initCorp();
  const corp=S.corp[i];
  if(!corp)return false;
  const m=mergerOf();
  m.target=i;m.name=corp.n;m.value=Math.round(corp.value);m.rep=Math.round(corp.rep);
  m.dd=false;m.risk=0.4;m.lastTry=-99;
  mlog('🔎 فتحت ملف اندماج مع '+corp.n);
  toast('🔎 بدأت التفاوض مع '+corp.n);
  save();renderAll();
  return true;
}
function mergerDD(){
  const c=S.company;const m=mergerOf();
  if(!c||m.target<0)return false;
  if(m.dd)return false;
  if(c.cash<5000)return false;
  c.cash-=5000;
  m.dd=true;
  m.risk=Math.round((0.2+RNG()*0.6)*100)/100;
  mlog('📑 فحص نافي للجهالة: مخاطر الدمج '+Math.round(m.risk*100)+'٪');
  toast('📑 الفحص خلص — مخاطر الدمج '+Math.round(m.risk*100)+'٪');
  save();renderAll();
  return true;
}
function mergerChance(style){
  const c=S.company;const m=mergerOf();
  if(!c||m.target<0)return 0;
  const base=style==='high'?0.55:style==='fair'?0.32:0.10;
  return Math.max(0.03,Math.min(0.95,base+((c.rep||50)-50)/300+(m.dd?0.12:0)));
}
function mergerOffer(style){
  const c=S.company;const m=mergerOf();
  if(!c||m.target<0)return false;
  if(S.day<(m.lastTry||-99))return false;
  const mult=style==='low'?0.8:style==='high'?1.2:1.0;
  const price=Math.round(m.value*mult);
  if(c.cash<price)return false;
  if(RNG()<mergerChance(style)){completeMerger(price,style);return true;}
  m.lastTry=S.day+2;
  mlog('❌ '+m.name+' رفض عرض '+fmtD(price));
  toast('❌ '+m.name+' رفض العرض — جرّب تاني بعد يومين');
  save();renderAll();
  return false;
}
function completeMerger(price,style){
  const c=S.company;const m=mergerOf();
  if(!c)return false;
  c.cash-=price;
  const addWorkers=Math.round(Math.max(5,m.value/20000));
  c.workers=(c.workers||0)+addWorkers;
  c.quality=Math.min(100,(c.quality||0)+6);
  c.brand=Math.min(100,(c.brand||10)+4);
  c.rep=Math.min(100,(c.rep||50)+3);
  const risk=(style==='low'?0.6:style==='fair'?0.35:0.2)+(m.dd?0:0.1);
  let clash=false;
  if(RNG()<risk){
    clash=true;
    c.morale=Math.max(0,(c.morale||60)-12);
    const q=Math.round((c.workers||0)*0.06);
    c.workers=Math.max(1,(c.workers||1)-q);
  }
  if(S.corp&&S.corp[m.target]&&S.corp[m.target].n===m.name)S.corp.splice(m.target,1);
  if(S.allies&&S.allies.list)S.allies.list=S.allies.list.filter(function(a){return a.name!==m.name;});
  c.merges=(c.merges||0)+1;
  mlog((clash?'⚠️':'✅')+' اندماج مع '+m.name+' بـ'+fmtD(price)+(clash?' — صدام ثقافات':''));
  pushNews(S,(clash?'⚠️':'🏛️')+' "'+c.name+'" تندمج مع "'+m.name+'" بـ'+fmtD(price),clash?-0.004:0.02,true,true);
  toast((clash?'⚠️':'🏛️')+' اندماج مع '+m.name+' — +'+addWorkers+' عامل'+(clash?' وصدام ثقافات':''));
  const keepLog=m.log;
  S.merger={target:-1,name:null,value:0,rep:0,dd:false,risk:0.5,lastTry:-99,log:keepLog};
  save();renderAll();
  return true;
}
function cancelMerger(){
  const m=mergerOf();
  if(m.target<0)return false;
  mlog('🚫 أوقفت تفاوض '+m.name);
  S.merger={target:-1,name:null,value:0,rep:0,dd:false,risk:0.5,lastTry:-99,log:m.log};
  save();renderAll();
  return true;
}
function renderMerger(){
  const b=$('mergerBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  initCorp();
  const m=mergerOf();
  let h='';
  if(m.target<0){
    h+='<div style="font-size:12.5px;color:var(--dim);margin-bottom:8px">مفيش تفاوض شغال. اختار شركة من السوق:</div>';
    h+='<div>'+S.corp.map(function(cp,i){
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;flex-wrap:wrap">'+
        '<span><b>'+cp.n+'</b> <span style="color:var(--dim)">قيمة '+fmtD(cp.value)+' · سمعة '+Math.round(cp.rep)+'</span></span>'+
        '<button class="btnShort" onclick="startMerger('+i+')">ابدأ تفاوض</button></div>';
    }).join('')+'</div>';
  }else{
    h+='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap"><b style="font-size:13.5px">🎯 '+m.name+'</b><span style="font-size:12px;color:var(--dim)">قيمة '+fmtD(m.value)+' · سمعة '+m.rep+'</span></div>';
    h+='<div style="font-size:12px;color:var(--dim);margin:6px 0 8px">'+(m.dd?('📑 الفحص خلص — مخاطر الدمج المتوقعة <b style="color:'+(m.risk>0.5?'var(--dn)':'var(--up)')+'">'+Math.round(m.risk*100)+'٪</b>'):'📑 الفحص النافي للجهالة لسه ما اتعملش (٥٬٠٠٠ د.) — بيكشف المخاطر ويحسّن فرصة القبول ١٢٪')+'</div>';
    h+='<div class="tradeRow"><button class="btnGhost" onclick="mergerDD()" '+(m.dd||c.cash<5000?'disabled':'')+'>📑 فحص نافي للجهالة (٥٬٠٠٠)</button></div><div class="tradeRow">';
    ['low','fair','high'].forEach(function(st){
      const mult=st==='low'?0.8:st==='high'?1.2:1.0;
      const price=Math.round(m.value*mult);
      const label=st==='low'?'عرض منخفض':st==='high'?'عرض سخي':'عرض عادل';
      h+='<button class="btnShort" onclick="mergerOffer(\''+st+'\')" '+(c.cash<price?'disabled':'')+'>'+label+' '+fmtD(price)+' — '+Math.round(mergerChance(st)*100)+'٪</button>';
    });
    h+='</div><div class="tradeRow"><button class="btnGhost" onclick="cancelMerger()">🚫 إيقاف التفاوض</button></div>';
  }
  if(m.log&&m.log.length){
    h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim);line-height:1.7">'+m.log.slice(-4).reverse().map(function(x){return '• يوم '+x.d+': '+x.t;}).join('<br>')+'</div>';
  }
  b.innerHTML=h;
}

function frOf(){
  if(!S.fr)S.fr={list:[],rate:0.10,training:0,log:[]};
  if(!S.fr.list)S.fr.list=[];
  if(!S.fr.log)S.fr.log=[];
  return S.fr;
}
function frLog(t){
  const f=frOf();f.log.push({d:S.day,t:t});
  if(f.log.length>8)f.log.shift();
}
function frDaily(x,f){
  const city=CITIES.find(z=>z.n===x.city);
  const mult=city?city.mult:1;
  x.rev=Math.round(3200*mult*(0.7+x.q/100)*(0.85+RNG()*0.3));
  x.roy=Math.round(x.rev*(f.rate||0.10));
  return x.roy;
}
function frTick(c){
  const f=frOf();
  if(!f.list.length){c.frIncome=0;c.frCount=0;return;}
  let inc=0,bad=0;
  f.list.forEach(function(x){
    inc+=frDaily(x,f);
    const target=Math.min(95,(c.quality||50)*0.85+f.training*4);
    x.q=Math.max(0,Math.min(100,x.q+(target-x.q)*0.08));
    if((f.rate||0.10)>0.10)x.q=Math.max(0,x.q-(f.rate-0.10)*25);
    if(x.q<35){bad++;x.warn=(x.warn||0)+1;}else x.warn=0;
    if(x.warn>=4){
      x.warn=0;
      c.brand=Math.max(0,(c.brand||10)-2);
      c.rep=Math.max(0,(c.rep||50)-1);
      frLog('⚠️ فرع '+x.city+' بيضر السمعة — درّب أو أنهِ العقد');
      pushNews(S,'⚠️ شكاوى عملاء من فرع امتياز "'+c.name+'" في '+x.city,-0.004,false,true);
      toast('⚠️ فرع الامتياز في '+x.city+' بيضر سمعتك');
    }
  });
  c.frIncome=inc;c.frCount=f.list.length;
  c.cash+=inc;
  if(bad)c.brand=Math.max(0,(c.brand||10)-0.05*bad);
}
function frOpen(city){
  const c=S.company;if(!c)return false;
  const f=frOf();
  if(f.list.length>=6)return false;
  if((c.rep||50)<50||(c.quality||0)<45)return false;
  if(c.cash<25000)return false;
  if(f.list.some(x=>x.city===city))return false;
  c.cash-=25000;
  const fee=Math.round(15000+(c.rep||50)*300);
  c.cash+=fee;
  f.list.push({city:city,q:Math.round(45+RNG()*25),since:S.day,rev:0,roy:0,warn:0,fee:fee});
  frLog('🏪 فرع امتياز جديد في '+city+' (رسم '+fmtD(fee)+')');
  toast('🏪 فرع امتياز في '+city+' — رسم '+fmtD(fee));
  save();renderAll();
  return true;
}
function frTrain(){
  const c=S.company;if(!c)return false;
  const f=frOf();
  if(!f.list.length||f.training>=5)return false;
  const cost=8000*(f.training+1);
  if(c.cash<cost)return false;
  c.cash-=cost;f.training++;
  f.list.forEach(function(x){x.q=Math.min(100,x.q+6);});
  frLog('🎓 برنامج تدريب مستوى '+f.training+' ('+fmtD(cost)+')');
  toast('🎓 تدريب الفروع — جودة أعلى');
  save();renderAll();
  return true;
}
function frAudit(i){
  const c=S.company;if(!c)return false;
  const f=frOf();const x=f.list[i];if(!x)return false;
  if(c.cash<2000)return false;
  c.cash-=2000;
  if(RNG()<0.6){x.q=Math.min(100,x.q+10);frLog('🔍 تدقيق '+x.city+': التزم بالمعايير (+جودة)');toast('🔍 تدقيق '+x.city+' — التزام جيد');}
  else{x.q=Math.max(0,x.q-3);frLog('🔍 تدقيق '+x.city+': مخالفات — غرامة وتحذير');toast('🔍 تدقيق '+x.city+' — لقى مخالفات');}
  save();renderAll();
  return true;
}
function frClose(i){
  const c=S.company;if(!c)return false;
  const f=frOf();const x=f.list[i];if(!x)return false;
  const comp=Math.round(4000*f.list.length);
  if(c.cash<comp)return false;
  c.cash-=comp;
  f.list.splice(i,1);
  c.rep=Math.max(0,(c.rep||50)-1);
  frLog('🚫 إنهاء عقد '+x.city+' (تعويض '+fmtD(comp)+')');
  toast('🚫 أنهيت عقد امتياز '+x.city);
  save();renderAll();
  return true;
}
function frSetRate(r){
  const c=S.company;if(!c)return false;
  const f=frOf();
  if(!(r>=0.05&&r<=0.25))return false;
  f.rate=r;
  frLog('💼 نسبة الامتياز بقت '+Math.round(r*100)+'٪');
  save();renderAll();
  return true;
}
function renderFr(){
  const b=$('frBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const f=frOf();
  const inc=c.frIncome||0;
  let h='<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12.5px;margin-bottom:6px">'+
    '<span>الفروع: <b>'+f.list.length+'/6</b></span>'+
    '<span>إيراد امتياز يومي: <b style="color:var(--up)">'+fmtD(inc)+'</b></span>'+
    '<span>مستوى التدريب: <b>'+f.training+'/5</b></span></div>';
  h+='<div class="tradeRow">'+[0.05,0.10,0.15,0.20].map(function(r){
    return '<button class="btnShort" onclick="frSetRate('+r+')" '+((f.rate||0.10)===r?'style="border-color:var(--acc)"':'')+'>نسبة '+Math.round(r*100)+'٪</button>';
  }).join('')+'</div>';
  if(f.list.length){
    h+='<div style="margin:6px 0">'+f.list.map(function(x,i){
      const col=x.q>=60?'var(--up)':x.q>=35?'var(--warn,#f59e0b)':'var(--dn)';
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;flex-wrap:wrap">'+
        '<span><b>'+x.city+'</b> <span style="color:var(--dim)">جودة <b style="color:'+col+'">'+Math.round(x.q)+'</b> · إيراد '+fmtD(x.rev||0)+' · عمولتك '+fmtD(x.roy||0)+'</span></span>'+
        '<span style="display:flex;gap:6px"><button class="btnGhost" onclick="frAudit('+i+')">🔍 تدقيق (٢٬٠٠٠)</button>'+
        '<button class="btnGhost" onclick="frClose('+i+')">🚫 إنهاء</button></span></div>';
    }).join('')+'</div>';
  }else{
    h+='<div style="font-size:12px;color:var(--dim);margin:6px 0">مفيش فروع امتياز. الافتتاح محتاج سمعة ٥٠+ وجودة ٤٥+ و٢٥٬٠٠٠ د. تجهيز.</div>';
  }
  h+='<div class="tradeRow"><button class="btnGhost" onclick="frTrain()" '+((f.training>=5||!f.list.length)?'disabled':'')+'>🎓 برنامج تدريب ('+fmtD(8000*(f.training+1))+')</button></div>';
  h+='<div class="tradeRow">'+CITIES.map(function(ct){
    const has=f.list.some(function(x){return x.city===ct.n;});
    const dis=has||f.list.length>=6;
    return '<button class="btnShort" onclick="frOpen(\''+ct.n+'\')" '+(dis?'disabled':'')+'>+ '+ct.n+(has?' ✓':'')+'</button>';
  }).join('')+'</div>';
  if(f.log.length){
    h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim);line-height:1.7">'+f.log.slice(-4).reverse().map(function(x){return '• يوم '+x.d+': '+x.t;}).join('<br>')+'</div>';
  }
  b.innerHTML=h;
}

function bidOf(){return S.bid||null;}
function bidOpen(c,force){
  if(S.bid)return false;
  if(!force){
    if(S.day<10)return false;
    if(companyValue()<500000)return false;
    if(RNG()>=0.02)return false;
  }
  const val=Math.round(companyValue());
  S.bid={name:['صندوق الفجر الاستثماري','مجموعة الخليج القابضة','كونسورتيوم النيل'][Math.floor(RNG()*3)%3],
    price:Math.round(val*1.15),days:5,defense:0,offered:S.day,log:[],value0:val};
  bidLog('🦈 عرض شراء بـ'+fmtD(S.bid.price)+' ('+Math.round(115)+'٪ من التقييم)');
  pushNews(S,'🦈 عرض استحواذ على "'+c.name+'" بـ'+fmtD(S.bid.price),0.005,true,true);
  toast('🦈 عرض استحواذ على شركتك — ٥ أيام للرد');
  save();renderAll();
  return true;
}
function bidLog(t){if(!S.bid)return;S.bid.log.push({d:S.day,t:t});if(S.bid.log.length>8)S.bid.log.shift();}
function bidTick(c){
  if(!S.bid){bidOpen(c,false);return;}
  const b=S.bid;
  b.days--;
  if(b.defense>=4){
    S.bid=null;
    c.rep=Math.min(100,(c.rep||50)+4);
    pushNews(S,'✅ انسحب العرض الاستحواذي عن "'+c.name+'" بعد دفاع ناجح',0.01,true,true);
    toast('✅ المشتري انسحب — دفاعك نجح (سمعة +4)');
    save();renderAll();
    return;
  }
  if(b.days<=0){
    S.bid=null;
    c.rep=Math.max(0,(c.rep||50)-2);
    pushNews(S,'انتهى عرض الاستحواذ على "'+c.name+'" دون اتفاق',0,false,true);
    toast('انتهى العرض دون اتفاق (سمعة -2)');
    save();renderAll();
  }
}
function bidDefend(kind){
  const c=S.company;if(!c)return false;
  const b=S.bid;if(!b)return false;
  let cost=0,gain=0;
  if(kind==='pill'){cost=40000;gain=2;}
  else if(kind==='loyalty'){cost=Math.round((c.workers||10)*150);gain=1.5;}
  else if(kind==='buyback'){cost=60000;gain=1;}
  else return false;
  if(c.cash<cost)return false;
  c.cash-=cost;
  b.defense=Math.round((b.defense+gain)*10)/10;
  if(kind==='loyalty')c.morale=Math.min(100,(c.morale||60)+5);
  if(kind==='pill')b.price=Math.round(b.price*1.1);
  bidLog((kind==='pill'?'💊 حبة سم':kind==='loyalty'?'🤝 مكافآت ولاء':'📈 إعادة شراء')+' — دفاع '+b.defense+'/4 ('+fmtD(cost)+')');
  toast('🛡️ دفاع '+b.defense+'/4');
  save();renderAll();
  return true;
}
function bidAccept(){
  const c=S.company;if(!c)return false;
  const b=S.bid;if(!b)return false;
  const price=b.price;
  S.cash+=price;
  S.bid=null;
  S.stats=(S.stats||{});S.stats.exit=(S.stats.exit||0)+1;
  S.company=null;
  pushNews(S,'💰 استحوذ '+b.name+' على شركتك بـ'+fmtD(price),0.01,true,true);
  toast('💰 خرجت من الشركة بـ'+fmtD(price)+' كاش');
  log('بيع الشركة بـ'+fmtD(price));
  save();renderAll();
  return true;
}
function renderBid(){
  const b=$('bidBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const x=S.bid;
  if(!x){
    const val=Math.round(companyValue());
    b.innerHTML='<div style="font-size:12.5px;color:var(--dim)">مفيش عرض حالي. التقييم الحالي '+fmtD(val)+
      (val<500000?' — العروض بتبدأ فوق ٥٠٠ ألف وتحتاج سمعة كويسة.':' — في أي وقت ممكن يوصلك عرض.')+'</div>';
    return;
  }
  let h='<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12.5px;margin-bottom:6px">'+
    '<span>🦈 <b>'+x.name+'</b></span>'+
    '<span>العرض: <b style="color:var(--up)">'+fmtD(x.price)+'</b> · التقييم '+fmtD(x.value0)+'</span>'+
    '<span>متبقي: <b style="color:var(--dn)">'+x.days+' أيام</b></span></div>';
  h+='<div style="height:6px;background:var(--line);border-radius:4px;overflow:hidden;margin:4px 0 8px"><div style="height:100%;width:'+Math.min(100,Math.round(x.defense/4*100))+'%;background:var(--acc)"></div></div>';
  h+='<div style="font-size:12px;color:var(--dim);margin-bottom:6px">قوة دفاعك '+x.defense+'/4 — لو وصلت ٤ المشتري بينسحب.</div>';
  h+='<div class="tradeRow">'+
    '<button class="btnGhost" onclick="bidDefend(\'pill\')" '+(c.cash<40000?'disabled':'')+'>💊 حبة سم (٤٠٬٠٠٠)</button>'+
    '<button class="btnGhost" onclick="bidDefend(\'loyalty\')" '+(c.cash<Math.round((c.workers||10)*150)?'disabled':'')+'>🤝 ولاء الموظفين ('+fmtD(Math.round((c.workers||10)*150))+')</button>'+
    '<button class="btnGhost" onclick="bidDefend(\'buyback\')" '+(c.cash<60000?'disabled':'')+'>📈 إعادة شراء (٦٠٬٠٠٠)</button>'+
    '</div>';
  h+='<div class="tradeRow"><button class="btnShort" style="border-color:var(--dn)" onclick="if(confirm(\'تقبل البيع؟ الشركة هتخرج من ملكك نهائيًا.\'))bidAccept()">💰 اقبل العرض ('+fmtD(x.price)+')</button></div>';
  if(x.log&&x.log.length)h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim);line-height:1.7">'+x.log.slice(-4).reverse().map(function(y){return '• يوم '+y.d+': '+y.t;}).join('<br>')+'</div>';
  b.innerHTML=h;
}

function auditOf(){
  if(!S.audit)S.audit={level:0,caught:0,lost:0,recovered:0,log:[]};
  if(!S.audit.log)S.audit.log=[];
  return S.audit;
}
function auditLog(t){
  const a=auditOf();a.log.push({d:S.day,t:t});if(a.log.length>8)a.log.shift();
}
function auditFee(l){return [0,600,1500,3000][l||0];}
function auditCost(l){return [0,15000,40000,90000][l||0];}
function auditTick(c){
  const a=auditOf();
  if(!c)return;
  if(a.level>0)c.cash-=auditFee(a.level);
  const base=0.012*(1+Math.min(3,(c.workers||0)/120));
  const leak=base*Math.pow(0.45,a.level);
  const amt=Math.round(Math.max(0,c.cash)*leak);
  if(amt>0){
    c.cash-=amt;
    a.lost=(a.lost||0)+amt;
  }
  if(amt>0&&RNG()<0.05*(1+a.level*0.5)){
    auditLog('🕵️ تسريب '+fmtD(amt)+' من الخزينة');
    if(a.level===0&&RNG()<0.5)pushNews(S,'🕵️ تسريب مالي في "'+c.name+'" — مفيش رقابة داخلية',-0.004,false,true);
  }
}
function auditHire(){
  const c=S.company;if(!c)return false;
  const a=auditOf();
  if(a.level>=3)return false;
  const cost=auditCost(a.level+1);
  if(c.cash<cost)return false;
  c.cash-=cost;a.level++;
  auditLog('🧾 تعيين مستوى تدقيق '+a.level+' ('+fmtD(cost)+' + رسوم يومية '+fmtD(auditFee(a.level))+')');
  toast('🧾 مستوى التدقيق بقى '+a.level);
  save();renderAll();
  return true;
}
function auditInvestigate(){
  const c=S.company;if(!c)return false;
  const a=auditOf();
  if(c.cash<8000)return false;
  c.cash-=8000;
  const chance=0.25+a.level*0.2;
  if(RNG()<chance){
    const back=Math.round(Math.min(a.lost||0,(c.cash||0)*0.06+2000));
    c.cash+=back;a.caught=(a.caught||0)+1;a.recovered=(a.recovered||0)+back;
    c.morale=Math.max(0,(c.morale||60)-3);
    auditLog('✅ تحقيق كشف متورط — رجّع '+fmtD(back));
    pushNews(S,'✅ "'+c.name+'" تكشف احتيالًا داخليًا وتستعيد '+fmtD(back),0.004,false,true);
    toast('✅ مسكت المتورط — رجّعت '+fmtD(back));
  }else{
    c.morale=Math.max(0,(c.morale||60)-1);
    auditLog('🔍 تحقيق ملقاش دليل واضح');
    toast('🔍 التحقيق ملقاش دليل');
  }
  save();renderAll();
  return true;
}
function renderAudit(){
  const b=$('auditBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const a=auditOf();
  const leakPct=(0.012*(1+Math.min(3,(c.workers||0)/120))*Math.pow(0.45,a.level)*100).toFixed(2);
  let h='<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12.5px;margin-bottom:6px">'+
    '<span>مستوى التدقيق: <b>'+a.level+'/3</b></span>'+
    '<span>تسريب متوقع: <b style="color:'+(a.level?'var(--up)':'var(--dn)')+'">'+leakPct+'٪ يوميًا</b></span>'+
    '<span>إجمالي المسروق: <b>'+fmtD(a.lost||0)+'</b></span></div>';
  h+='<div style="font-size:12px;color:var(--dim);margin-bottom:6px">استعدت '+fmtD(a.recovered||0)+' · تحقيقات ناجحة '+(a.caught||0)+'</div>';
  h+='<div class="tradeRow">'+
    '<button class="btnShort" onclick="auditHire()" '+(a.level>=3||c.cash<auditCost(a.level+1)?'disabled':'')+'>🧾 رفع التدقيق ('+fmtD(auditCost(a.level+1))+' + '+fmtD(auditFee(a.level+1))+'/يوم)</button>'+
    '<button class="btnGhost" onclick="auditInvestigate()" '+(c.cash<8000?'disabled':'')+'>🔍 تحقيق مفاجئ (٨٬٠٠٠)</button>'+
    '</div>';
  if(a.log&&a.log.length)h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim);line-height:1.7">'+a.log.slice(-4).reverse().map(function(x){return '• يوم '+x.d+': '+x.t;}).join('<br>')+'</div>';
  b.innerHTML=h;
}

function cbondOf(){
  if(!S.cbonds)S.cbonds={list:[],defaults:0,total:0};
  if(!S.cbonds.list)S.cbonds.list=[];
  return S.cbonds;
}
function creditScore(c){
  if(!c)return 0;
  const cash=Math.max(0,c.cash||0);
  const prof=Math.max(0,c.lastYearProfit||0);
  const rep=c.rep==null?50:c.rep;
  return Math.round(Math.min(100,cash/12000+prof/900+rep*0.35));
}
function creditGrade(c){
  const s=creditScore(c);
  if(s>=85)return {g:'AAA',rate:0.035,ic:'🟢'};
  if(s>=68)return {g:'AA',rate:0.05,ic:'🟢'};
  if(s>=50)return {g:'A',rate:0.07,ic:'🟡'};
  if(s>=32)return {g:'BBB',rate:0.10,ic:'🟠'};
  if(s>=16)return {g:'BB',rate:0.14,ic:'🔴'};
  return {g:'B',rate:0.20,ic:'🔴'};
}
function cbondTotal(){
  const b=cbondOf();
  return b.list.reduce(function(a,x){return a+x.amt;},0);
}
function cbondIssue(amt){
  const c=S.company;if(!c)return false;
  const b=cbondOf();
  if(!(amt>0))return false;
  if(cbondTotal()+amt>600000)return false;
  const g=creditGrade(c);
  b.list.push({amt:amt,rate:g.rate,due:S.day+30,day0:S.day});
  c.cash+=amt;
  pushNews(S,'📜 "'+c.name+'" تصدر سندات بـ'+fmtD(amt)+' بفايدة '+Math.round(g.rate*100)+'٪',0.004,true,true);
  toast('📜 إصدار سندات '+fmtD(amt)+' — تصنيف '+g.g);
  save();renderAll();
  return true;
}
function cbondTick(c){
  const b=cbondOf();
  if(!c||!b.list.length)return;
  let interest=0;
  b.list.slice().forEach(function(x){
    interest+=x.amt*x.rate/30;
    if(S.day>=x.due){
      const pay=Math.round(x.amt*(1+x.rate));
      if(c.cash>=pay){
        c.cash-=pay;
        b.list.splice(b.list.indexOf(x),1);
        pushNews(S,'✅ "'+c.name+'" سددت سندات '+fmtD(x.amt)+' في ميعادها',0.006,true,true);
        toast('✅ سداد سندات '+fmtD(pay));
      }else{
        b.list.splice(b.list.indexOf(x),1);
        b.defaults=(b.defaults||0)+1;
        c.rep=Math.max(0,(c.rep||50)-8);
        pushNews(S,'⚠️ "'+c.name+'" عجزت عن سداد سندات '+fmtD(x.amt)+' — تصنيفها الائتماني اتضرب',-0.02,true,true);
        toast('⚠️ تعثر في سداد السندات — سمعة -8');
      }
    }
  });
  if(interest>0){c.cash-=interest;b.total=Math.round(interest);}else b.total=0;
}
function cbondRepay(i){
  const c=S.company;if(!c)return false;
  const b=cbondOf();const x=b.list[i];if(!x)return false;
  const fee=Math.round(x.amt*x.rate*0.5);
  const pay=x.amt+fee;
  if(c.cash<pay)return false;
  c.cash-=pay;b.list.splice(i,1);
  toast('📜 سداد مبكر '+fmtD(x.amt)+' + غرامة '+fmtD(fee));
  save();renderAll();
  return true;
}
function renderCbond(){
  const el=$('cbondBody');if(!el)return;
  const c=S.company;
  if(!c){el.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const b=cbondOf();const g=creditGrade(c);
  const debt=cbondTotal();
  let h='<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12.5px;margin-bottom:6px">'+
    '<span>التصنيف: <b>'+g.ic+' '+g.g+'</b> <span style="color:var(--dim)">(فايدة '+Math.round(g.rate*100)+'٪ سنوي)</span></span>'+
    '<span>إجمالي الدين: <b>'+fmtD(debt)+'</b></span>'+
    '<span>فايدة يومية: <b style="color:var(--dn)">'+fmtD(b.total||0)+'</b></span></div>';
  if(b.defaults)h+='<div style="font-size:12px;color:var(--dn);margin-bottom:6px">⚠️ مرات تعثر: '+b.defaults+'</div>';
  if(b.list.length){
    h+=b.list.map(function(x,i){
      const left=Math.max(0,x.due-S.day);
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;flex-wrap:wrap">'+
        '<span><b>'+fmtD(x.amt)+'</b> <span style="color:var(--dim)">فايدة '+Math.round(x.rate*100)+'٪ · متبقي '+left+' يوم</span></span>'+
        '<button class="btnGhost" onclick="cbondRepay('+i+')">سداد مبكر</button></div>';
    }).join('');
  }else{
    h+='<div style="font-size:12px;color:var(--dim);margin:6px 0">مفيش سندات قائمة. الحد الأقصى للدين ٦٠٠ ألف.</div>';
  }
  h+='<div class="tradeRow">'+[50000,150000,400000].map(function(a){
    return '<button class="btnShort" onclick="cbondIssue('+a+')" '+(debt+a>600000?'disabled':'')+'>إصدار '+fmtD(a)+'</button>';
  }).join('')+'</div>';
  el.innerHTML=h;
}

const TENDER_NAMES=['وزارة الصحة — مستلزمات','وزارة التعليم — أجهزة','هيئة النقل — قطع غيار','وزارة الزراعة — معدات','هيئة الكهرباء — كابلات','وزارة الإسكان — مواد بناء'];
function tenderOf(){
  if(!S.tenders)S.tenders={list:[],active:[],won:0,lost:0,failed:0,log:[],next:S.day+3};
  if(!S.tenders.list)S.tenders.list=[];
  if(!S.tenders.active)S.tenders.active=[];
  if(!S.tenders.log)S.tenders.log=[];
  return S.tenders;
}
function tlog(t){const T=tenderOf();T.log.push({d:S.day,t:t});if(T.log.length>8)T.log.shift();}
function tenderSpawn(c,force){
  const T=tenderOf();
  if(T.list.length>=3)return false;
  if(!force&&S.day<(T.next||0))return false;
  const i=Math.floor(RNG()*TENDER_NAMES.length)%TENDER_NAMES.length;
  const scale=1+Math.min(4,(c.workers||10)/80);
  const value=Math.round((60000+RNG()*90000)*scale);
  T.list.push({id:'t'+S.day+'_'+Math.floor(RNG()*999),name:TENDER_NAMES[i],value:value,
    cost:Math.round(value*(0.55+RNG()*0.2)),closes:S.day+7,deliver:10});
  T.next=S.day+10;
  tlog('📋 مناقصة جديدة: '+TENDER_NAMES[i]+' بـ'+fmtD(value));
  return true;
}
function tenderBid(i,level){
  const c=S.company;if(!c)return false;
  const T=tenderOf();const t=T.list[i];if(!t)return false;
  const mult=level==='low'?0.88:level==='high'?1.06:1.0;
  const bid=Math.round(t.value*mult);
  const bond=Math.round(bid*0.02);
  if(c.cash<bond)return false;
  c.cash-=bond;
  const q=(c.quality||50)/100, rep=(c.rep||50)/100;
  let chance=0.25+rep*0.35+q*0.2+(level==='low'?0.12:level==='high'?-0.12:0)+(S.lobby?(S.lobby.level||0)*0.06:0);
  chance=Math.max(0.05,Math.min(0.92,chance));
  T.list.splice(i,1);
  if(RNG()<chance){
    T.active.push({name:t.name,bid:bid,cost:t.cost,due:S.day+(t.deliver||10)});
    tlog('🏛️ فزت بمناقصة '+t.name+' بـ'+fmtD(bid)+' — تسليم بعد '+(t.deliver||10)+' يوم');
    pushNews(S,'🏛️ "'+c.name+'" تفوز بمناقصة '+t.name+' بـ'+fmtD(bid),0.006,true,true);
    toast('🏛️ فزت بالمناقصة — سلّم في '+(t.deliver||10)+' يوم');
  }else{
    c.cash+=bond;
    T.lost=(T.lost||0)+1;
    tlog('❌ مناقصة '+t.name+' راحت لمنافس (تأمين مسترد)');
    toast('❌ المناقصة راحت لمنافس — التأمين رجع');
  }
  save();renderAll();
  return true;
}
function tenderTick(c){
  const T=tenderOf();
  if(!c)return;
  tenderSpawn(c,false);
  T.list.slice().forEach(function(t){if(S.day>t.closes)T.list.splice(T.list.indexOf(t),1);});
  T.active.slice().forEach(function(a){
    if(S.day>=a.due){
      T.active.splice(T.active.indexOf(a),1);
      const okDeliver=(c.workers||0)>=15&&(c.inv?c.inv.units:0)>=20;
      if(okDeliver){
        const net=a.bid-a.cost;
        c.cash+=net;
        c.rep=Math.min(100,(c.rep||50)+3);
        T.won=(T.won||0)+1;
        tlog('✅ تسليم مناقصة '+a.name+' — صافي '+fmtD(net));
        pushNews(S,'✅ "'+c.name+'" سلّمت مناقصة '+a.name+' في الميعاد',0.008,true,true);
        toast('✅ تسليم ناجح — صافي '+fmtD(net));
      }else{
        const fine=Math.round(a.bid*0.15);
        c.cash-=fine;
        c.rep=Math.max(0,(c.rep||50)-5);
        T.failed=(T.failed||0)+1;
        tlog('⚠️ تأخير في '+a.name+' — غرامة '+fmtD(fine));
        pushNews(S,'⚠️ "'+c.name+'" تأخرت في مناقصة '+a.name+' — غرامة',-0.01,true,true);
        toast('⚠️ تأخير في التسليم — غرامة '+fmtD(fine));
      }
    }
  });
}
function renderTender(){
  const el=$('tenderBody');if(!el)return;
  const c=S.company;
  if(!c){el.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const T=tenderOf();
  let h='<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12.5px;margin-bottom:6px">'+
    '<span>مناقصات مفتوحة: <b>'+T.list.length+'</b></span>'+
    '<span>عقود جارية: <b>'+T.active.length+'</b></span>'+
    '<span>فوز/خسارة/تعثر: <b>'+(T.won||0)+'/'+(T.lost||0)+'/'+(T.failed||0)+'</b></span></div>';
  if(T.list.length){
    h+=T.list.map(function(t,i){
      const left=Math.max(0,t.closes-S.day);
      return '<div style="border-top:1px solid var(--line);padding:8px 0">'+
        '<div style="font-size:12.5px;margin-bottom:4px"><b>'+t.name+'</b> <span style="color:var(--dim)">قيمة '+fmtD(t.value)+' · متبقي '+left+' يوم</span></div>'+
        '<div class="tradeRow" style="margin-top:4px">'+
        '<button class="btnShort" onclick="tenderBid('+i+',\'low\')">منخفض '+fmtD(Math.round(t.value*0.88))+'</button>'+
        '<button class="btnShort" onclick="tenderBid('+i+',\'fair\')">مناسب '+fmtD(t.value)+'</button>'+
        '<button class="btnGhost" onclick="tenderBid('+i+',\'high\')">مرتفع '+fmtD(Math.round(t.value*1.06))+'</button>'+
        '</div></div>';
    }).join('');
  }else{
    h+='<div style="font-size:12px;color:var(--dim);margin:6px 0">مفيش مناقصات مفتوحة دلوقتي — بتظهر كل ~١٠ أيام.</div>';
  }
  if(T.active.length){
    h+='<div style="margin-top:6px;font-size:12.5px">'+T.active.map(function(a){
      return '<div style="border-top:1px solid var(--line);padding:6px 0"><b>'+a.name+'</b> <span style="color:var(--dim)">تسليم بعد '+Math.max(0,a.due-S.day)+' يوم · صافي متوقع '+fmtD(a.bid-a.cost)+'</span></div>';
    }).join('')+'</div>';
  }
  if(T.log.length)h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim);line-height:1.7">'+T.log.slice(-4).reverse().map(function(x){return '• يوم '+x.d+': '+x.t;}).join('<br>')+'</div>';
  el.innerHTML=h;
}

function lobbyOf(){
  if(!S.lobby)S.lobby={level:0,heat:0,spent:0,scandals:0,log:[]};
  if(!S.lobby.log)S.lobby.log=[];
  return S.lobby;
}
function lobbyFee(l){return [0,400,1200,2600][l||0];}
function lobbyCost(l){return [0,20000,55000,120000][l||0];}
function llog(t){const L=lobbyOf();L.log.push({d:S.day,t:t});if(L.log.length>8)L.log.shift();}
function lobbyTick(c){
  const L=lobbyOf();
  if(!c||!L.level)return;
  c.cash-=lobbyFee(L.level);
  L.heat=Math.min(100,(L.heat||0)+L.level*0.35);
  L.spent=(L.spent||0)+lobbyFee(L.level);
  if(L.heat>=70&&RNG()<0.02*L.level){
    const fine=Math.round(8000*L.level);
    c.cash-=fine;
    c.rep=Math.max(0,(c.rep||50)-6);
    L.scandals=(L.scandals||0)+1;
    L.heat=Math.max(0,L.heat-35);
    L.level=Math.max(0,L.level-1);
    llog('📰 فضيحة علاقات عامة — غرامة '+fmtD(fine)+' ومستوى نزل');
    pushNews(S,'📰 فضيحة علاقات حكومية في "'+c.name+'" — غرامة '+fmtD(fine),-0.015,true,true);
    toast('📰 فضيحة! غرامة '+fmtD(fine)+' وسمعة -6');
  }
}
function lobbyHire(){
  const c=S.company;if(!c)return false;
  const L=lobbyOf();
  if(L.level>=3)return false;
  const cost=lobbyCost(L.level+1);
  if(c.cash<cost)return false;
  c.cash-=cost;L.level++;
  llog('🤝 مستوى علاقات '+L.level+' ('+fmtD(cost)+' + '+fmtD(lobbyFee(L.level))+'/يوم)');
  toast('🤝 مستوى العلاقات الحكومية '+L.level);
  save();renderAll();
  return true;
}
function lobbyCool(){
  const c=S.company;if(!c)return false;
  const L=lobbyOf();
  if(!L.heat||c.cash<3000)return false;
  c.cash-=3000;
  L.heat=Math.max(0,L.heat-25);
  llog('🧊 حملة تهدئة إعلامية — الحرارة نزلت');
  toast('🧊 الحرارة نزلت');
  save();renderAll();
  return true;
}
function renderLobby(){
  const el=$('lobbyBody');if(!el)return;
  const c=S.company;
  if(!c){el.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const L=lobbyOf();
  let h='<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12.5px;margin-bottom:6px">'+
    '<span>مستوى النفوذ: <b>'+L.level+'/3</b></span>'+
    '<span>حرارة إعلامية: <b style="color:'+(L.heat>=70?'var(--dn)':'var(--up)')+'">'+Math.round(L.heat||0)+'٪</b></span>'+
    '<span>فضائح: <b>'+(L.scandals||0)+'</b></span></div>';
  h+='<div style="font-size:12px;color:var(--dim);margin-bottom:6px">كل مستوى: +٦٪ فرصة فوز في المناقصات · رسوم يومية '+fmtD(lobbyFee(L.level))+'</div>';
  h+='<div class="tradeRow">'+
    '<button class="btnShort" onclick="lobbyHire()" '+(L.level>=3||c.cash<lobbyCost(L.level+1)?'disabled':'')+'>🤝 رفع النفوذ ('+fmtD(lobbyCost(L.level+1))+')</button>'+
    '<button class="btnGhost" onclick="lobbyCool()" '+(c.cash<3000?'disabled':'')+'>🧊 تهدئة إعلامية (٣٬٠٠٠)</button>'+
    '</div>';
  if(L.log.length)h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim);line-height:1.7">'+L.log.slice(-4).reverse().map(function(x){return '• يوم '+x.d+': '+x.t;}).join('<br>')+'</div>';
  el.innerHTML=h;
}

function qaOf(){
  if(!S.qa)S.qa={level:0,defects:0,recalls:0,prevented:0,log:[]};
  if(!S.qa.log)S.qa.log=[];
  return S.qa;
}
function qaCost(l){return [0,12000,35000][l||0];}
function qaFee(l){return [0,300,900][l||0];}
function qlog(t){const Q=qaOf();Q.log.push({d:S.day,t:t});if(Q.log.length>8)Q.log.shift();}
function qaTick(c){
  const Q=qaOf();
  if(!c)return;
  if(Q.level>0)c.cash-=qaFee(Q.level);
  const q=(c.quality==null?50:c.quality);
  const morale=(c.morale==null?60:c.morale);
  const rate=Math.max(0,0.9-q/100*0.7)+Math.max(0,(45-morale)/400);
  const add=rate*Math.max(0,c.workers||0)*0.06*Math.pow(0.4,Q.level);
  Q.defects=Math.min(100,(Q.defects||0)+add);
  if(Q.defects>=70&&!Q.alert){
    Q.alert=1;
    pushNews(S,'🔬 عيوب متزايدة في منتجات "'+c.name+'" — محتاج قرار استدعاء',-0.006,true,true);
    toast('🔬 العيوب فوق الحد — قرر: استدعاء ولا تأجيل');
  }
  if(Q.defects>=100){
    Q.defects=0;Q.alert=0;Q.recalls=(Q.recalls||0)+1;
    const fine=Math.round(15000+companyValue()*0.01);
    c.cash-=fine;c.brand=Math.max(0,(c.brand||10)-8);c.rep=Math.max(0,(c.rep||50)-6);
    qlog('⚠️ فضيحة جودة — غرامة '+fmtD(fine)+' وعلامة -٨');
    pushNews(S,'⚠️ فضيحة جودة في "'+c.name+'" — استدعاء إجباري وغرامة',-0.02,true,true);
    toast('⚠️ فضيحة جودة! غرامة '+fmtD(fine));
  }
}
function qaUpgrade(){
  const c=S.company;if(!c)return false;
  const Q=qaOf();
  if(Q.level>=2)return false;
  const cost=qaCost(Q.level+1);
  if(c.cash<cost)return false;
  c.cash-=cost;Q.level++;
  qlog('🔬 برنامج جودة مستوى '+Q.level+' ('+fmtD(cost)+' + '+fmtD(qaFee(Q.level))+'/يوم)');
  toast('🔬 برنامج الجودة '+Q.level);
  save();renderAll();
  return true;
}
function qaRecall(){
  const c=S.company;if(!c)return false;
  const Q=qaOf();
  if((Q.defects||0)<25)return false;
  const cost=Math.round(4000+Q.defects*250);
  if(c.cash<cost)return false;
  c.cash-=cost;
  Q.prevented=(Q.prevented||0)+1;
  c.brand=Math.min(100,(c.brand||10)+1);
  qlog('✅ استدعاء وقائي ('+fmtD(cost)+') — العيوب اتصفّرت');
  toast('✅ استدعاء وقائي — العيوب اتصفّرت');
  Q.defects=0;Q.alert=0;
  save();renderAll();
  return true;
}
function renderQA(){
  const el=$('qaBody');if(!el)return;
  const c=S.company;
  if(!c){el.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const Q=qaOf();
  const col=Q.defects>=70?'var(--dn)':Q.defects>=35?'var(--gold)':'var(--up)';
  let h='<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12.5px;margin-bottom:6px">'+
    '<span>برنامج الجودة: <b>'+Q.level+'/2</b></span>'+
    '<span>مؤشر العيوب: <b style="color:'+col+'">'+Math.round(Q.defects||0)+'٪</b></span>'+
    '<span>استدعاءات/وقائية: <b>'+(Q.recalls||0)+'/'+(Q.prevented||0)+'</b></span></div>';
  h+='<div style="height:6px;background:var(--line);border-radius:4px;overflow:hidden;margin:4px 0 8px"><div style="height:100%;width:'+Math.min(100,Math.round(Q.defects||0))+'%;background:'+col+'"></div></div>';
  h+='<div class="tradeRow">'+
    '<button class="btnShort" onclick="qaUpgrade()" '+(Q.level>=2||c.cash<qaCost(Q.level+1)?'disabled':'')+'>🔬 رفع برنامج الجودة ('+fmtD(qaCost(Q.level+1))+' + '+fmtD(qaFee(Q.level+1))+'/يوم)</button>'+
    '<button class="btnGhost" onclick="qaRecall()" '+((Q.defects||0)<25||c.cash<Math.round(4000+(Q.defects||0)*250)?'disabled':'')+'>📦 استدعاء وقائي ('+fmtD(Math.round(4000+(Q.defects||0)*250))+')</button>'+
    '</div>';
  if(Q.log.length)h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim);line-height:1.7">'+Q.log.slice(-4).reverse().map(function(x){return '• يوم '+x.d+': '+x.t;}).join('<br>')+'</div>';
  el.innerHTML=h;
}

const SMUG_GOODS=[['إلكترونيات','📱',1.0],['سجائر','🚬',0.8],['أدوية','💊',1.3],['قطع غيار','⚙️',0.9],['ذهب','🪙',1.6]];
function smugOf(){
  if(!S.smug)S.smug={routes:[],heat:0,busts:0,profit:0,log:[]};
  if(!S.smug.routes)S.smug.routes=[];
  if(!S.smug.log)S.smug.log=[];
  return S.smug;
}
function slog(t){const M=smugOf();M.log.push({d:S.day,t:t});if(M.log.length>8)M.log.shift();}
function smugOpen(goods){
  const c=S.company;if(!c)return false;
  const M=smugOf();
  if(M.routes.length>=3)return false;
  const g=SMUG_GOODS.find(function(x){return x[0]===goods;});
  if(!g)return false;
  if(M.routes.some(function(r){return r.goods===goods;}))return false;
  const setup=25000;
  if(c.cash<setup)return false;
  c.cash-=setup;
  M.routes.push({goods:g[0],ic:g[1],mult:g[2],since:S.day,earned:0});
  M.heat=Math.min(100,(M.heat||0)+6);
  slog('🕶️ خط تهريب جديد: '+g[0]+' ('+fmtD(setup)+')');
  toast('🕶️ فتحت خط تهريب '+g[0]);
  save();renderAll();
  return true;
}
function smugTick(c){
  const M=smugOf();
  if(!c||!M.routes.length)return;
  let inc=0;
  M.routes.forEach(function(r){
    const gain=Math.round(9000*r.mult*(0.8+RNG()*0.5));
    r.earned=(r.earned||0)+gain;
    inc+=gain;
    M.heat=Math.min(100,(M.heat||0)+1.2*r.mult);
  });
  c.cash+=inc;
  M.profit=(M.profit||0)+inc;
  if(M.heat>=70&&RNG()<0.06){
    const fine=Math.round(20000+M.routes.length*8000);
    const _ck=bizClaim('cargo',fine);
    const seized=M.routes.shift();
    c.cash-=(fine-_ck);
    c.rep=Math.max(0,(c.rep||50)-7);
    M.busts=(M.busts||0)+1;
    M.heat=Math.max(0,M.heat-40);
    slog('🚨 مداهمة! مصادرة '+(seized?seized.goods:'')+' وغرامة '+fmtD(fine));
    pushNews(S,'🚨 مداهمة على خطوط تهريب "'+c.name+'" — مصادرة وغرامة '+fmtD(fine),-0.018,true,true);
    toast('🚨 مداهمة! مصادرة وغرامة '+fmtD(fine));
  }
}
function smugCool(){
  const c=S.company;if(!c)return false;
  const M=smugOf();
  if(!M.heat||c.cash<12000)return false;
  c.cash-=12000;
  M.heat=Math.max(0,M.heat-30);
  slog('🧊 تهدئة الجهات — الحرارة نزلت');
  toast('🧊 الحرارة نزلت');
  save();renderAll();
  return true;
}
function smugClose(i){
  const c=S.company;if(!c)return false;
  const M=smugOf();const r=M.routes[i];if(!r)return false;
  M.routes.splice(i,1);
  M.heat=Math.max(0,M.heat-8);
  slog('🚪 قفلت خط '+r.goods);
  toast('🚪 قفلت خط '+r.goods);
  save();renderAll();
  return true;
}
function renderSmug(){
  const el=$('smugBody');if(!el)return;
  const c=S.company;
  if(!c){el.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const M=smugOf();
  const col=M.heat>=70?'var(--dn)':M.heat>=40?'var(--gold)':'var(--up)';
  let h='<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12.5px;margin-bottom:6px">'+
    '<span>خطوط شغالة: <b>'+M.routes.length+'/3</b></span>'+
    '<span>حرارة الجهات: <b style="color:'+col+'">'+Math.round(M.heat||0)+'٪</b></span>'+
    '<span>مداهمات: <b>'+(M.busts||0)+'</b></span></div>';
  h+='<div style="height:6px;background:var(--line);border-radius:4px;overflow:hidden;margin:4px 0 8px"><div style="height:100%;width:'+Math.min(100,Math.round(M.heat||0))+'%;background:'+col+'"></div></div>';
  if(M.routes.length){
    h+=M.routes.map(function(r,i){
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;flex-wrap:wrap">'+
        '<span>'+r.ic+' <b>'+r.goods+'</b> <span style="color:var(--dim)">ربح تراكمي '+fmtD(r.earned||0)+'</span></span>'+
        '<button class="btnGhost" onclick="smugClose('+i+')">قفل الخط</button></div>';
    }).join('');
  }else{
    h+='<div style="font-size:12px;color:var(--dim);margin:6px 0">مفيش خطوط شغالة. الافتتاح ٢٥٬٠٠٠ د. لكل خط (حد ٣).</div>';
  }
  h+='<div class="tradeRow">'+SMUG_GOODS.map(function(g){
    const has=M.routes.some(function(r){return r.goods===g[0];});
    return '<button class="btnShort" onclick="smugOpen(\''+g[0]+'\')" '+(has||M.routes.length>=3?'disabled':'')+'>'+g[1]+' '+g[0]+(has?' ✓':'')+'</button>';
  }).join('')+'</div>';
  h+='<div class="tradeRow"><button class="btnGhost" onclick="smugCool()" '+(c.cash<12000?'disabled':'')+'>🧊 تهدئة الجهات (١٢٬٠٠٠)</button></div>';
  if(M.log.length)h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim);line-height:1.7">'+M.log.slice(-4).reverse().map(function(x){return '• يوم '+x.d+': '+x.t;}).join('<br>')+'</div>';
  el.innerHTML=h;
}
$('btnPrestige').onclick=()=>{
  if(netWorth()<20000000)return;
  showModal('<h2>⭐ البدء كأسطورة</h2><p style="line-height:1.9">هتبدأ من الصفر بكاش أكبر ومضاعف أرباح دائم ×'+(1+0.15*((S.prestige||0)+1)).toFixed(2)+'. هتفقد كل أصولك وشركتك وتقدمك الحالي، وتحتفظ بإنجازاتك ونجومك.</p><div class="tradeRow"><button id="btnPrestigeYes">أكيد، ابدأ من جديد</button></div>');
  $('btnPrestigeYes').onclick=()=>{
    const keepP=(S.prestige||0)+1,keepT=S.theme,keepAch=S.achv||{};
    const st=freshState();
    st.prestige=keepP;st.theme=keepT;st.achv=keepAch;
    st.cash=Math.round(100000*(1+0.5*keepP));
    S=st;hideModal();
    toast('⭐ بدأت من جديد كأسطورة! مضاعف أرباحك ×'+pmult().toFixed(2));
    beep(1400,.3);save();renderAll();
  };
};

const TECHS=[
  {k:'auto',n:'أتمتة الخطوط',ic:'🤖',cost:30,req:null,d:'+٨ د. يوميًا لكل عامل'},
  {k:'eff',n:'كفاءة الطاقة',ic:'⚡',cost:25,req:null,d:'رسوم المختبر -٥٠٪'},
  {k:'patent',n:'براءات اختراع',ic:'📜',cost:45,req:'eff',d:'+٤٬٠٠٠ د. يوميًا'},
  {k:'ai',n:'ذكاء اصطناعي',ic:'🧠',cost:80,req:'auto',d:'+١٤ د. يوميًا لكل عامل'}
];
const LAB_UP=[0,25000,60000,120000];
function techOf(){
  if(!S.tech)S.tech={lab:0,pts:0,got:{},earned:0,fees:0};
  const t=S.tech;if(t.lab==null)t.lab=0;if(t.pts==null)t.pts=0;if(!t.got)t.got={};if(t.earned==null)t.earned=0;if(t.fees==null)t.fees=0;
  return t;
}
function techFee(){
  const t=techOf();
  return Math.round(t.lab*1200*(t.got.eff?0.5:1));
}
function techUpLab(){
  const t=techOf();const c=S.company;if(!c)return false;
  if(t.lab>=3)return false;
  const cost=LAB_UP[t.lab+1];
  if(c.cash<cost)return false;
  c.cash-=cost;t.lab++;
  toast('🔬 المختبر بقى مستوى '+t.lab);
  if(typeof renderTech==='function')renderTech();
  return true;
}
function techBuy(k){
  const t=techOf();const d=TECHS.filter(function(x){return x.k===k;})[0];
  if(!d||t.got[k])return false;
  if(d.req&&!t.got[d.req])return false;
  if(t.pts<d.cost)return false;
  t.pts-=d.cost;t.got[k]=true;
  toast(d.ic+' فتحت تقنية: '+d.n);
  pushNews(S,d.ic+' "'+(S.company?S.company.name:'')+'" تطلق تقنية '+d.n,0.004,false,true);
  if(typeof renderTech==='function')renderTech();
  return true;
}
function techDaily(c){
  const t=techOf();let v=0;
  if(t.got.auto)v+=(c.workers||0)*8;
  if(t.got.ai)v+=(c.workers||0)*14;
  if(t.got.patent)v+=4000;
  return v;
}
function techTick(c){
  const t=techOf();
  if(t.lab>0){
    const fee=techFee();
    if(c.cash>=fee){c.cash-=fee;t.fees+=fee;t.pts+=t.lab*3;}
  }
  const b=techDaily(c);
  if(b>0){c.cash+=b;t.earned+=b;}
}
function renderTech(){
  const el=$('techBody');if(!el)return;
  const t=techOf();const c=S.company;
  if(!c){el.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  let h='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12.5px;margin-bottom:6px">'+
    '<div>المختبر: <b>'+t.lab+'/3</b></div><div>نقاط بحث: <b>'+t.pts+'</b></div><div>رسوم يومية: <b>'+fmtD(techFee())+'</b></div></div>';
  h+='<div class="tradeRow"><button class="btnGhost" onclick="techUpLab()" '+((t.lab>=3||c.cash<(LAB_UP[t.lab+1]||0))?'disabled':'')+'>'+(t.lab>=3?'المختبر في أعلى مستوى':'🔬 ترقية المختبر ('+fmtD(LAB_UP[t.lab+1])+')')+'</button></div>';
  h+=TECHS.map(function(d){
    const own=!!t.got[d.k];const lock=d.req&&!t.got[d.req];
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;flex-wrap:wrap">'+
      '<span>'+d.ic+' <b>'+d.n+'</b> <span style="color:var(--dim)">'+d.d+' · '+d.cost+' نقطة</span></span>'+
      '<button class="btnGhost" onclick="techBuy(\''+d.k+'\')" '+((own||lock||t.pts<d.cost)?'disabled':'')+'>'+(own?'✅ مفتوحة':lock?'🔒 محتاج تقنية قبلها':'افتح')+'</button></div>';
  }).join('');
  if(t.earned)h+='<div style="margin-top:8px;font-size:11.5px;color:var(--up)">إجمالي دخل التقنيات: '+fmtD(Math.round(t.earned))+'</div>';
  el.innerHTML=h;
}

const ROUNDS=[
  {k:'seed',n:'جولة ملاك (Seed)',ic:'👼',raise:150000,eq:10,pay:1500,boost:4,req:null},
  {k:'a',n:'السلسلة A',ic:'🚀',raise:500000,eq:15,pay:4500,boost:10,req:'seed'},
  {k:'b',n:'السلسلة B',ic:'🦄',raise:1500000,eq:20,pay:12000,boost:22,req:'a'}
];
function angelOf(){
  if(!S.angel)S.angel={got:{},paid:0,gained:0,bought:0};
  const a=S.angel;if(!a.got)a.got={};if(a.paid==null)a.paid=0;if(a.gained==null)a.gained=0;if(a.bought==null)a.bought=0;
  return a;
}
function angelRaise(k){
  const a=angelOf();const c=S.company;if(!c)return false;
  const r=ROUNDS.filter(function(x){return x.k===k;})[0];
  if(!r||a.got[k])return false;
  if(r.req&&!a.got[r.req])return false;
  a.got[k]=true;c.cash+=r.raise;
  toast(r.ic+' دخّلت '+fmtD(r.raise)+' من '+r.n);
  pushNews(S,r.ic+' "'+c.name+'" تقفل '+r.n+' بـ '+fmtD(r.raise),0.006,false,true);
  if(typeof renderAngel==='function')renderAngel();
  return true;
}
function angelBuyback(k){
  const a=angelOf();const c=S.company;if(!c)return false;
  const r=ROUNDS.filter(function(x){return x.k===k;})[0];
  if(!r||!a.got[k])return false;
  const later=ROUNDS.some(function(x){return x.req===k&&a.got[x.k];});
  if(later)return false;
  const cost=Math.round(r.raise*1.4);
  if(c.cash<cost)return false;
  c.cash-=cost;delete a.got[k];a.bought+=cost;
  toast('اشتريت حصة المستثمرين: '+r.n);
  if(typeof renderAngel==='function')renderAngel();
  return true;
}
function angelEq(){const a=angelOf();let e=0;ROUNDS.forEach(function(r){if(a.got[r.k])e+=r.eq;});return e;}
function angelDaily(c){
  const a=angelOf();let b=0,p=0;
  ROUNDS.forEach(function(r){if(a.got[r.k]){b+=(c.workers||0)*r.boost;p+=r.pay;}});
  return {boost:b,pay:p};
}
function angelTick(c){
  const d=angelDaily(c);const a=angelOf();
  if(d.boost>0){c.cash+=d.boost;a.gained+=d.boost;}
  if(d.pay>0){const x=Math.min(d.pay,Math.max(0,c.cash));c.cash-=x;a.paid+=x;}
}
function renderAngel(){
  const el=$('angelBody');if(!el)return;
  const a=angelOf();const c=S.company;
  if(!c){el.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const d=angelDaily(c);
  let h='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12.5px;margin-bottom:6px">'+
    '<div>حصتك: <b>'+(100-angelEq())+'٪</b></div><div>دفعات يومية: <b>'+fmtD(d.pay)+'</b></div><div>إضافة يومية: <b>'+fmtD(d.boost)+'</b></div></div>';
  h+=ROUNDS.map(function(r){
    const own=!!a.got[r.k];const lock=r.req&&!a.got[r.req];
    const later=ROUNDS.some(function(x){return x.req===r.k&&a.got[x.k];});
    let btn;
    if(own)btn='<button class="btnGhost" onclick="angelBuyback(\''+r.k+'\')" '+((later||c.cash<Math.round(r.raise*1.4))?'disabled':'')+'>اشترِ الحصة ('+fmtD(Math.round(r.raise*1.4))+')</button>';
    else btn='<button class="btnGhost" onclick="angelRaise(\''+r.k+'\')" '+(lock?'disabled':'')+'>'+(lock?'🔒 محتاج الجولة اللي قبلها':'اقفل الجولة')+'</button>';
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;flex-wrap:wrap">'+
      '<span>'+r.ic+' <b>'+r.n+'</b> <span style="color:var(--dim)">'+fmtD(r.raise)+' مقابل '+r.eq+'٪ · دفعة '+fmtD(r.pay)+'/يوم</span></span>'+btn+'</div>';
  }).join('');
  if(a.gained||a.paid)h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim)">إضافة تراكمية: '+fmtD(Math.round(a.gained))+' · دفعات للمستثمرين: '+fmtD(Math.round(a.paid))+'</div>';
  el.innerHTML=h;
}

const BOARD_P=[
  {k:'expand',n:'توسّع: +١٥ عامل',ic:'🏗️',cost:80000},
  {k:'payout',n:'توزيع أرباح لمحفظتك',ic:'💸',cost:60000},
  {k:'rd',n:'ميزانية بحث: +٣٠ نقطة',ic:'🔬',cost:50000}
];
const BOARD_M=['الحذر 🛡️','النمو 📈','الناشط 🔥'];
function boardOf(){
  if(!S.board)S.board={yes:0,no:0,last:-99,log:[]};
  const b=S.board;if(b.yes==null)b.yes=0;if(b.no==null)b.no=0;if(b.last==null)b.last=-99;if(!b.log)b.log=[];
  return b;
}
function boardVotes(k,c){
  const p=BOARD_P.filter(function(x){return x.k===k;})[0];
  if(!p)return null;
  return [
    c.cash-p.cost>=200000,
    k==='expand'||k==='rd',
    k==='payout'||c.cash>=300000
  ];
}
function boardCan(){const b=boardOf();return (S.day-b.last)>=3;}
function boardPropose(k){
  const b=boardOf();const c=S.company;if(!c)return false;
  const p=BOARD_P.filter(function(x){return x.k===k;})[0];
  if(!p||!boardCan()||c.cash<p.cost)return false;
  const v=boardVotes(k,c);const yes=v.filter(Boolean).length;
  b.last=S.day;
  if(yes>=2){
    b.yes++;
    if(k==='payout'){c.cash-=p.cost;S.cash+=p.cost;}
    else if(k==='expand'){c.cash-=p.cost;c.workers=(c.workers||0)+15;}
    else if(k==='rd'){c.cash-=p.cost;techOf().pts+=30;}
    b.log.unshift(p.ic+' '+p.n+': اتوافق ('+yes+'/3)');
    toast('🏛️ المجلس وافق ('+yes+'/3)');
  }else{
    b.no++;
    b.log.unshift(p.ic+' '+p.n+': اترفض ('+yes+'/3)');
    toast('🏛️ المجلس رفض ('+yes+'/3)');
  }
  b.log=b.log.slice(0,5);
  if(typeof renderBoard==='function')renderBoard();
  return true;
}
function renderBoard(){
  const el=$('boardBody');if(!el)return;
  const b=boardOf();const c=S.company;
  if(!c){el.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const wait=Math.max(0,3-(S.day-b.last));
  let h='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12.5px;margin-bottom:6px"><div>موافقات: <b>'+b.yes+'</b></div><div>رفض: <b>'+b.no+'</b></div><div>'+(wait?'انتظار: <b>'+wait+' يوم</b>':'<b>المجلس جاهز</b>')+'</div></div>';
  h+=BOARD_P.map(function(p){
    const v=boardVotes(p.k,c);
    const pre=v.map(function(x,i){return BOARD_M[i].split(' ')[1]+(x?'✔':'✖');}).join(' ');
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;flex-wrap:wrap"><span>'+p.ic+' <b>'+p.n+'</b> <span style="color:var(--dim)">'+fmtD(p.cost)+' · توقع: '+pre+'</span></span><button class="btnGhost" onclick="boardPropose(\''+p.k+'\')" '+((wait||c.cash<p.cost)?'disabled':'')+'>اعرض على المجلس</button></div>';
  }).join('');
  if(b.log.length)h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim)">'+b.log.join('<br>')+'</div>';
  el.innerHTML=h;
}

function wrOf(){
  if(!S.wr)S.wr={day:S.day,nw:0,mkt:0,cards:[]};
  const w=S.wr;if(!w.cards)w.cards=[];if(w.day==null)w.day=S.day;if(w.nw==null)w.nw=0;if(w.mkt==null)w.mkt=0;
  return w;
}
function wrMkt(){
  let t=0,n=0;for(const k in S.assets){const a=S.assets[k];if(a.kind==='stock'&&a.base){t+=a.price/a.base;n++;}}
  return n?t/n:1;
}
function wrGrade(my,mk){
  const d=my-mk;
  if(d>=0.05)return 'A';if(d>=0.01)return 'B';if(d>=-0.02)return 'C';if(d>=-0.06)return 'D';return 'F';
}
function wrMake(){
  const w=wrOf();const nw=netWorth(),mk=wrMkt();
  if(!w.nw){w.nw=nw;w.mkt=mk;w.day=S.day;return null;}
  const my=nw/w.nw-1,mm=mk/w.mkt-1;
  const card={day:S.day,my:my,mkt:mm,g:wrGrade(my,mm),infl:S.infl,rate:S.rate,mood:S.mood};
  w.cards.unshift(card);w.cards=w.cards.slice(0,6);
  w.nw=nw;w.mkt=mk;w.day=S.day;
  toast('📰 تقرير الأسبوع: تقدير '+card.g);
  return card;
}
function wrTick(){
  const w=wrOf();
  if(!w.nw||(S.day-w.day)>=7)wrMake();
}
function renderWR(){
  const el=$('wrBody');if(!el)return;
  const w=wrOf();
  if(!w.cards.length){el.innerHTML='<div style="color:var(--dim);font-size:13px">أول تقرير بعد '+Math.max(0,7-(S.day-w.day))+' يوم.</div>';return;}
  const pc=function(x){return (x>=0?'+':'')+(x*100).toFixed(1)+'٪';};
  el.innerHTML=w.cards.map(function(c,i){
    const col=c.my>=c.mkt?'var(--up)':'var(--down)';
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;flex-wrap:wrap"><span>يوم '+c.day+' · أنت: <b style="color:'+col+'">'+pc(c.my)+'</b> · السوق: '+pc(c.mkt)+' · تضخم '+(c.infl*100).toFixed(1)+'٪ · فايدة '+(c.rate*100).toFixed(1)+'٪</span><b style="font-size:'+(i?15:22)+'px;color:'+col+'">'+c.g+'</b></div>';
  }).join('');
}

const CMDS=[
  {k:'oil',n:'نفط',ic:'🛢️',p:80,vol:0.035},
  {k:'wheat',n:'قمح',ic:'🌾',p:60,vol:0.025},
  {k:'gold',n:'ذهب',ic:'🥇',p:200,vol:0.015}
];
const CMD_SIZE=10;
function cmdOf(){
  if(!S.cmd)S.cmd={px:{},pos:[],pnl:0,liq:0};
  const c=S.cmd;if(!c.px)c.px={};if(!c.pos)c.pos=[];if(c.pnl==null)c.pnl=0;if(c.liq==null)c.liq=0;
  CMDS.forEach(function(d){if(!c.px[d.k])c.px[d.k]=d.p;});
  return c;
}
function cmdPnl(po,c){return po.dir*(c.px[po.k]-po.entry)*CMD_SIZE*po.qty;}
function cmdEquity(){
  const c=cmdOf();let e=0;
  c.pos.forEach(function(po){e+=po.margin+cmdPnl(po,c);});
  return e;
}
function cmdOpen(k,dir,qty){
  const c=cmdOf();qty=qty||1;
  const d=CMDS.filter(function(x){return x.k===k;})[0];
  if(!d||(dir!==1&&dir!==-1)||c.pos.length>=6)return false;
  const margin=Math.round(c.px[k]*CMD_SIZE*qty*0.2);
  if(S.cash<margin)return false;
  S.cash-=margin;
  c.pos.push({k:k,dir:dir,qty:qty,entry:c.px[k],margin:margin});
  if(typeof renderCmd==='function')renderCmd();
  return true;
}
function cmdClose(i){
  const c=cmdOf();const po=c.pos[i];if(!po)return false;
  const pnl=cmdPnl(po,c);
  S.cash+=Math.max(0,po.margin+pnl);c.pnl+=pnl;
  c.pos.splice(i,1);
  toast((pnl>=0?'🛢️ ربحت ':'🛢️ خسرت ')+fmtD(Math.abs(Math.round(pnl))));
  if(typeof renderCmd==='function')renderCmd();
  return true;
}
function cmdTick(){
  const c=cmdOf();
  CMDS.forEach(function(d){
    const x=(RNG()-0.5)*2*d.vol;
    c.px[d.k]=Math.max(d.p*0.3,Math.round(c.px[d.k]*(1+x)*100)/100);
  });
  for(let i=c.pos.length-1;i>=0;i--){
    const po=c.pos[i];
    if(po.margin+cmdPnl(po,c)<=0){c.pnl-=po.margin;c.liq++;c.pos.splice(i,1);toast('⚠️ تصفية عقد '+po.k);}
  }
}
function renderCmd(){
  const el=$('cmdBody');if(!el)return;
  const c=cmdOf();
  let h=CMDS.map(function(d){
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;flex-wrap:wrap"><span>'+d.ic+' <b>'+d.n+'</b> <span style="color:var(--dim)">'+c.px[d.k].toFixed(2)+' د. · هامش '+fmtD(Math.round(c.px[d.k]*CMD_SIZE*0.2))+'</span></span><span><button class="btnGhost" onclick="cmdOpen(\''+d.k+'\',1)">Long ▲</button> <button class="btnGhost" onclick="cmdOpen(\''+d.k+'\',-1)">Short ▼</button></span></div>';
  }).join('');
  if(c.pos.length){
    h+='<div style="margin-top:8px;font-size:12.5px"><b>مراكزك:</b></div>'+c.pos.map(function(po,i){
      const pl=cmdPnl(po,c);const nm=CMDS.filter(function(x){return x.k===po.k;})[0];
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 0;font-size:12.5px"><span>'+nm.ic+' '+(po.dir>0?'Long':'Short')+' @'+po.entry.toFixed(2)+' · <b style="color:'+(pl>=0?'var(--up)':'var(--down)')+'">'+(pl>=0?'+':'')+fmtD(Math.round(pl))+'</b></span><button class="btnGhost" onclick="cmdClose('+i+')">قفل</button></div>';
    }).join('');
  }
  h+='<div style="margin-top:6px;font-size:11.5px;color:var(--dim)">صافي أرباح السلع: '+fmtD(Math.round(c.pnl))+' · تصفيات: '+c.liq+'</div>';
  el.innerHTML=h;
}

const LGD_AI=[
  {n:'وارن العرب',nw:420000,d:0.0016,v:0.010},
  {n:'سارة كابيتال',nw:310000,d:0.0020,v:0.016},
  {n:'مضاربة بلا حدود',nw:250000,d:0.0018,v:0.034},
  {n:'صندوق النيل',nw:520000,d:0.0012,v:0.008},
  {n:'حسام الذهب',nw:180000,d:0.0022,v:0.022},
  {n:'مستثمر الفجر',nw:140000,d:0.0024,v:0.026},
  {n:'بنك الأهرام',nw:700000,d:0.0010,v:0.006},
  {n:'تريدر الإسكندرية',nw:200000,d:0.0019,v:0.030}
];
function lgdOf(){
  if(!S.lgd)S.lgd={ai:null,peak:0,best:0,days:0};
  const g=S.lgd;if(!g.ai)g.ai=LGD_AI.map(function(a){return {n:a.n,nw:a.nw};});
  if(g.peak==null)g.peak=0;if(g.best==null)g.best=0;if(g.days==null)g.days=0;
  return g;
}
function lgdRank(){
  const g=lgdOf();const my=netWorth();
  return 1+g.ai.filter(function(a){return a.nw>my;}).length;
}
function lgdTitle(r){return r===1?'👑 ملك السوق':r<=3?'🥇 من الكبار':r<=6?'📈 مستثمر محترف':'🌱 مبتدئ طموح';}
function lgdTick(){
  const g=lgdOf();
  g.ai.forEach(function(a,i){
    const d=LGD_AI[i];
    a.nw=Math.max(50000,Math.round(a.nw*(1+d.d+(RNG()-0.5)*2*d.v)));
  });
  const my=netWorth();
  if(my>g.peak)g.peak=my;
  const r=lgdRank();
  if(!g.best||r<g.best)g.best=r;
  g.days++;
}
function renderLgd(){
  const el=$('lgdBody');if(!el)return;
  const g=lgdOf();const my=netWorth();
  const all=g.ai.map(function(a){return {n:a.n,nw:a.nw,me:false};});
  all.push({n:'أنت',nw:my,me:true});
  all.sort(function(a,b){return b.nw-a.nw;});
  const r=lgdRank();
  let h='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12.5px;margin-bottom:6px"><div>ترتيبك: <b>'+r+'/9</b></div><div>أفضل ترتيب: <b>'+(g.best||r)+'</b></div><div>أعلى ثروة: <b>'+fmtD(Math.round(Math.max(g.peak,my)))+'</b></div></div><div style="font-size:13px;margin-bottom:4px">'+lgdTitle(r)+'</div>';
  h+=all.map(function(x,i){
    return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-top:1px solid var(--line);font-size:12.5px;'+(x.me?'color:var(--up);font-weight:700':'')+'"><span>'+(i+1)+'. '+x.n+'</span><span>'+fmtD(Math.round(x.nw))+'</span></div>';
  }).join('');
  el.innerHTML=h;
}

const CRIS=[
  {k:'war',n:'حرب إقليمية',ic:'⚔️',dir:-1,days:8,msg:'خطوط الإمداد اتقطعت والتكاليف زادت'},
  {k:'pandemic',n:'جائحة عالمية',ic:'🦠',dir:-1,days:10,msg:'الطلب نزل والعمال بيغيبوا'},
  {k:'oil',n:'اكتشاف نفط ضخم',ic:'🛢️',dir:1,days:8,msg:'طاقة رخيصة وطلب أعلى على الصناعة'}
];
const CRIS_RESP={ignore:{n:'تجاهل',cost:0},hedge:{n:'تحوّط',cost:8000},adapt:{n:'تكيّف',cost:20000}};
function crisOf(){
  if(!S.cris)S.cris={act:null,next:12,hist:[],handled:0};
  const c=S.cris;if(c.act===undefined)c.act=null;if(c.next==null)c.next=12;if(!c.hist)c.hist=[];if(c.handled==null)c.handled=0;
  return c;
}
function crisMult(a){
  const r=a.resp||'ignore';
  if(a.dir<0)return r==='adapt'?0.1:r==='hedge'?0.4:1;
  return r==='adapt'?1.8:1;
}
function crisDaily(a,c){
  const base=Math.max(1500,(c.workers||0)*40);
  return Math.round(base*a.dir*crisMult(a));
}
function crisSpawn(k){
  const C=crisOf();
  const d=CRIS.filter(function(x){return x.k===k;})[0];if(!d)return null;
  C.act={k:d.k,n:d.n,ic:d.ic,dir:d.dir,left:d.days,total:d.days,msg:d.msg,resp:null,sum:0};
  C.next=S.day+25;
  pushNews(S,d.ic+' '+d.n+': '+d.msg,d.dir<0?-0.02:0.02,true,d.dir>0);
  toast(d.ic+' '+d.n+' — قرر ردك من كارت الأزمات');
  return C.act;
}
function crisRespond(r){
  const C=crisOf();const a=C.act;const c=S.company;
  if(!a||!c||a.resp||!CRIS_RESP[r])return false;
  const cost=CRIS_RESP[r].cost;
  if(c.cash<cost)return false;
  c.cash-=cost;a.resp=r;C.handled++;
  toast('✅ ردك على '+a.n+': '+CRIS_RESP[r].n);
  if(typeof renderCris==='function')renderCris();
  return true;
}
function crisTick(c){
  const C=crisOf();
  if(!C.act&&S.day>=C.next){
    const i=Math.floor(RNG()*CRIS.length);crisSpawn(CRIS[Math.min(i,CRIS.length-1)].k);
  }
  const a=C.act;if(!a)return;
  const d=crisDaily(a,c);
  c.cash+=d;a.sum+=d;a.left--;
  if(a.left<=0){
    C.hist.push({n:a.n,ic:a.ic,sum:Math.round(a.sum),resp:a.resp||'ignore'});
    if(C.hist.length>6)C.hist.shift();
    pushNews(S,'انتهى حدث '+a.n+' — الأثر الكلي '+fmtD(Math.round(a.sum)),0,false,a.sum>=0);
    C.act=null;
  }
    }
