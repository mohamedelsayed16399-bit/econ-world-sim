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
function renderNotifs(){
  const el=$('notifList');if(!el)return;
  el.innerHTML=S.notifs.slice().reverse().map(n=>'<div class="newsItem" style="font-size:13px">'+n.msg+'<div class="nt">اليوم '+n.d+' — '+String(n.hh).padStart(2,'0')+':'+String(n.mm).padStart(2,'0')+'</div></div>').join('')||'<div style="color:var(--dim)">لا إشعارات بعد</div>';
}
function renderMovers(){
  const el=$('movers');if(!el)return;
  const stocks=Object.keys(S.assets).filter(k=>S.assets[k].kind==='stock'||S.assets[k].kind==='crypto');
  const byChg=stocks.slice().sort((x,y)=>chgPct(S.assets[y])-chgPct(S.assets[x]));
  const fmt1=k=>{const a=S.assets[k],c=chgPct(a);return '<div style="display:flex;justify-content:space-between;font-size:13px;margin:2px 0"><span>'+a.name+'</span><span class="'+(c>=0?'up':'down')+'">'+(c>=0?'+':'')+c.toFixed(1)+'%</span></div>';};
  el.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><div style="color:var(--up);font-size:12px;margin-bottom:4px">🚀 الأكثر ارتفاعًا</div>'+byChg.slice(0,3).map(fmt1).join('')+'</div><div><div style="color:var(--dn);font-size:12px;margin-bottom:4px">🔻 الأكثر انخفاضًا</div>'+byChg.slice(-3).reverse().map(fmt1).join('')+'</div></div>';
}
function renderMood(){
  const cv=$('moodChart');if(!cv)return;
  spark(cv,S.moodHist.slice(-120));
}

function renderProps(){
  const tb=$('propTbl').tBodies[0];tb.innerHTML='';
  Object.keys(S.propPrice).forEach(n=>{
    const p=S.propPrice[n];const own=S.props[n]?S.props[n].qty:0;
    const ch=(p/S.propBase[n]-1)*100;
    const tr=document.createElement('tr');
    tr.innerHTML='<td><b>'+n+'</b></td><td>'+fmtD(p)+' <span class="chg '+(ch>=0?'up':'dn')+'" style="font-size:11px">'+(ch>=0?'▲':'▼')+Math.abs(ch).toFixed(1)+'%</span></td>'+
      '<td>'+own+'</td><td>'+fmtD(p*0.0004)+'</td>'+
      '<td><button class="btnGhost" data-b="'+n+'">شراء</button> <button class="btnGhost" data-m="'+n+'" title="ادفع ٢٠٪ مقدمًا والباقي قرض">رهن 🏠</button> '+(own?'<button class="btnGhost" data-s="'+n+'">بيع</button>':'')+'</td>';
    tb.appendChild(tr);
  });
  tb.querySelectorAll('button').forEach(b=>b.onclick=()=>{
    if(b.dataset.m){
      const n=b.dataset.m;const p=S.propPrice[n];const down=Math.round(p*0.2);
      if(down>S.cash)return toast('❌ تحتاج ٢٠٪ مقدمًا ('+fmtD(down)+')');
      S.cash-=down;S.loan+=p-down;
      if(!S.props[n])S.props[n]={qty:0,avg:0};
      const t=S.props[n];t.avg=(t.avg*t.qty+p)/(t.qty+1);t.qty++;
      toast('🏠 رهن عقاري: '+n+' — مقدم '+fmtD(down)+' وقرض '+fmtD(p-down));log('رهن عقاري: '+n);
      save();checkAchv();renderAll();return;
    }
    if(b.dataset.b){
      const n=b.dataset.b;const p=S.propPrice[n];
      if(p>S.cash)return toast('❌ كاش غير كافٍ');
      S.cash-=p;
      if(!S.props[n])S.props[n]={qty:0,avg:0};
      const t=S.props[n];t.avg=(t.avg*t.qty+p)/(t.qty+1);t.qty++;
      toast('🏢 اشتريت: '+n);log('شراء عقار: '+n);
    }else{
      const n=b.dataset.s;const t=S.props[n];if(!t||!t.qty)return;
      t.qty--;S.cash+=S.propPrice[n];
      toast('💰 بعت: '+n);log('بيع عقار: '+n);
    }
    save();checkAchv();renderAll();
  });
  $('rentTot').textContent=fmtD(S.rentTotal);
}
$('btnBond').onclick=()=>{
  const v=+$('bondAmt').value||0;
  if(v<1000)return toast('❌ الحد الأدنى ١٬٠٠٠');
  if(v>S.cash)return toast('❌ كاش غير كافٍ');
  S.cash-=v;S.bonds.push({amt:v,due:S.day+30});
  toast('💵 اشتريت سندًا — يستحق يوم '+(S.day+30));
  log('شراء سند '+fmtD(v));save();renderAll();
};
function renderBonds(){
  $('bondList').innerHTML=S.bonds.length?S.bonds.map(b=>'<span class="badge" style="margin:2px">'+fmtD(b.amt)+' ← يستحق يوم '+b.due+'</span>').join(' '):'<span style="color:var(--dim);font-size:12.5px">لا سندات مملوكة.</span>';
}

const RIVAL_NAMES=['عملاق الصناعة','نجمة القطاع','التيتان','الصقر','المستقبل القريب'];
function renderRival(){
  const card=$('rivalCard');
  if(!S.company||!S.rival){card.classList.add('hidden');return;}
  card.classList.remove('hidden');
  const r=S.rival;
  const threat=r.strength>1.3?'خطير 🔴':r.strength>0.9?'قوي 🟠':'ضعيف 🟢';
  $('rivalInfo').innerHTML='<div style="font-size:14px;margin-bottom:6px"><b>'+r.name+'</b> — قوة السوق: '+r.strength.toFixed(2)+' ('+threat+')</div>'+
    '<div style="height:8px;background:#1a2340;border-radius:6px;max-width:300px"><div style="width:'+Math.min(100,r.strength/2*100).toFixed(0)+'%;height:100%;border-radius:6px;background:var(--down)"></div></div>'+
    '<div style="font-size:12px;color:var(--dim);margin-top:6px">كل ما زادت قوته قلّ الطلب على منتجك. الحملات المضادة تُضعفه.</div>';
  
  let bb=$('btnBuyRival');
  if(r.strength<=0.5){
    if(!bb){bb=document.createElement('button');bb.id='btnBuyRival';bb.className='btnShort';$('btnAttack').parentNode.appendChild(bb);bb.onclick=buyRival;}
    const cost=Math.round(250000*r.strength);
    bb.textContent='💰 استحوذ عليه ('+fmtD(cost)+')';
    bb.disabled=S.cash<cost;
  }else if(bb)bb.remove();
}
function buyRival(){
  const r=S.rival;if(!r||!S.company)return;
  const cost=Math.round(250000*r.strength);
  if(S.cash<cost)return toast('❌ كاش غير كافٍ');
  S.cash-=cost;
  S.subsidiary={name:r.name};
  S.rival=null;
  if(!S.achv)S.achv={};S.achv.shark=1;
  pushNews(S,'🦈 '+S.company.name+' تستحوذ على منافسها '+r.name+'!',0.03,true,true);
  toast('🦈 استحوذت على '+r.name+'! أصبح تابعًا لشركتك بإيرد يومي');
  beep(1300,.25);save();renderAll();
}
$('btnAttack').onclick=()=>{
  const c=S.company;if(!c||!S.rival)return;
  if(c.cash<8000)return toast('❌ خزينة الشركة تحتاج ٨٬٠٠٠');
  c.cash-=8000;
  S.rival.strength=Math.max(0.3,S.rival.strength-rnd(0.1,0.28));
  if(RNG()<0.22){
    pushNews(S,'حملة '+c.name+' ضد '+S.rival.name+' ترتد سلبًا!',-0.01,true);
    c.quality=Math.max(0,c.quality-2);
    toast('😬 الحملة ارتدت عليك قليلًا');
  }else{
    pushNews(S,c.name+' تشن حملة ناجحة ضد '+S.rival.name,0.01,false,true);
    toast('📣 الحملة نجحت! المنافس أضعف الآن');
  }
  refreshNewsUI();log('حملة ضد المنافس');save();renderAll();
};

function renderPend(){
  const items=[];
  S.orders.forEach((o,i)=>items.push('<span class="badge" style="margin:2px">⚡ '+(o.dir==='buy'?'شراء':'بيع')+' '+o.q+' × '+S.assets[o.sym].name+' عند '+(o.dir==='buy'?'≤':'≥')+' '+o.target+' <a href="#" data-oi="'+i+'" style="color:var(--down)">✕</a></span>'));
  S.alerts.forEach((al,i)=>items.push('<span class="badge" style="margin:2px">🔔 '+S.assets[al.sym].name+' '+(al.dir==='up'?'≥':'≤')+' '+al.target+' <a href="#" data-ai="'+i+'" style="color:var(--down)">✕</a></span>'));
  $('pendList').innerHTML=items.join(' ')||'';
  $('pendList').querySelectorAll('a').forEach(a=>a.onclick=e=>{
    e.preventDefault();
    if(a.dataset.oi!=null)S.orders.splice(+a.dataset.oi,1);
    else S.alerts.splice(+a.dataset.ai,1);
    save();renderPend();
  });
}
$('btnLoBuy').onclick=()=>{
  const t=+$('loPrice').value||0;const q=Math.max(1,Math.floor(+$('qty').value||0));
  if(t<=0)return toast('❌ حدد السعر المستهدف');
  S.orders.push({sym:sel,dir:'buy',q,target:t});
  toast('⚡ أمر شراء محدد عند '+t);save();renderPend();
};
$('btnLoSell').onclick=()=>{
  const t=+$('loPrice').value||0;const q=Math.max(1,Math.floor(+$('qty').value||0));
  if(t<=0)return toast('❌ حدد السعر المستهدف');
  S.orders.push({sym:sel,dir:'sell',q,target:t});
  toast('⚡ أمر بيع محدد عند '+t);save();renderPend();
};
$('btnAlert').onclick=()=>{
  const t=+$('loPrice').value||0;if(t<=0)return toast('❌ حدد السعر المستهدف');
  const a=S.assets[sel];
  S.alerts.push({sym:sel,dir:t>=a.price?'up':'down',target:t});
  toast('🔔 تنبيه عند '+t);save();renderPend();
};
$('btnSnd').onclick=()=>{S.snd=!S.snd;$('btnSnd').textContent=S.snd?'🔊':'🔇';save();};

const UPGS=[
 ['line','🏭 خط إنتاج جديد','+٥٠٪ طاقة إنتاجية لكل مستوى'],
 ['auto','🤖 نظام آلي','جودة أعلى كل يوم'],
 ['brand','📣 بناء علامة تجارية','+٤٠٪ تأثير التسويق لكل مستوى'],
];
function upgCost(l){return 25000*Math.pow(l+1,2);}
function renderUpg(){
  const c=S.company;const r=$('upgRow');if(!r)return;
  if(!c){r.innerHTML='';return;}
  if(!c.up)c.up={line:0,auto:0,brand:0};
  r.innerHTML='';
  UPGS.forEach(u=>{
    const lvl=c.up[u[0]];const cost=upgCost(lvl);
    const b=document.createElement('button');b.className='btnGhost';b.style.fontSize='12.5px';
    b.innerHTML=u[1]+' <span class="badge">'+lvl+'</span><br><span style="color:var(--gold)">'+fmtD(cost)+'</span>';
    b.title=u[2];
    b.onclick=()=>{
      if(c.cash<cost)return toast('❌ خزينة الشركة تحتاج '+fmtD(cost));
      c.cash-=cost;c.up[u[0]]++;
      toast('⬆️ '+u[1]+' — مستوى '+c.up[u[0]]);
      log('ترقية: '+u[1]);save();renderUpg();
    };
    r.appendChild(b);
  });
}

function renderDonut(){
  const cv=$('donut');const ctx=cv.getContext('2d');
  const W=cv.width=360,H=cv.height=360;ctx.clearRect(0,0,W,H);
  const parts=[['كاش',S.cash,'#3b82f6']];
  if(S.dep>0)parts.push(['وديعة',S.dep,'#06b6d4']);
  let i=0;
  for(const k in S.assets){const a=S.assets[k];if(a.held>0){parts.push([a.name,a.held*a.price,['#22c55e','#f59e0b','#a855f7','#ef4444','#eab308','#14b8a6','#f472b6','#94a3b8'][i%8]]);i++;}}
  const cvv=companyValue();if(cvv>0)parts.push(['شركتك',cvv,'#fb923c']);
  const tot=parts.reduce((s,p)=>s+Math.max(0,p[1]),0)||1;
  let ang=-Math.PI/2;
  parts.forEach(p=>{
    const frac=Math.max(0,p[1])/tot;if(frac<=0)return;
    ctx.beginPath();ctx.moveTo(180,180);
    ctx.arc(180,180,160,ang,ang+frac*Math.PI*2);ctx.closePath();
    ctx.fillStyle=p[2];ctx.fill();
    ang+=frac*Math.PI*2;
  });
  ctx.beginPath();ctx.arc(180,180,88,0,7);ctx.fillStyle='#121828';ctx.fill();
  ctx.direction='ltr';ctx.textAlign='center';
  ctx.fillStyle='#e8edf7';ctx.font='bold 34px Tahoma';
  ctx.fillText(fmt(tot),180,178);
  ctx.fillStyle='#8b97b3';ctx.font='20px Tahoma';
  ctx.fillText('دينار',180,206);
  $('donutLeg').innerHTML=parts.slice(0,8).map(p=>'<span style="margin-inline-end:10px"><span style="color:'+p[2]+'">●</span> '+p[0]+' '+(Math.max(0,p[1])/tot*100).toFixed(0)+'%</span>').join('');
}
function renderStats(){
  const nw0=100000;const roi=(netWorth()/nw0-1)*100;
  $('statKpis').innerHTML=
    kpi('العائد الكلي',(roi>=0?'+':'')+roi.toFixed(1)+'%')+
    kpi('أيام اللعب',S.day)+
    kpi('صفقات منفذة',S.stats.trades)+
    kpi('إجمالي التوزيعات',fmtD(S.stats.divTotal))+
    kpi('أرباح الشورت',fmtD(S.coveredProfit))+
    kpi('أفضل صفقة',fmtD(S.stats.bestTrade||0))+
    kpi('أسوأ صفقة',fmtD(S.stats.worstTrade||0))+
    kpi('إنجازات',Object.keys(S.achv).length+'/'+ACHV.length)+
    kpi('عروض استحواذ',S.offers)+
    kpi('🏔️ قمة الثروة',fmtD(S.recPeak||0))+
    kpi('📅 أفضل يوم',(S.recBestDay>=0?'+':'')+(S.recBestDay||0).toFixed(1)+'%');
}
function shareResult(){
  const t='📊 نتيجتي في "اقتصاد حي": ثروة '+fmtD(netWorth())+' بعد '+S.day+' يوم | العائد '+((netWorth()/100000-1)*100).toFixed(0)+'% | إنجازات '+Object.keys(S.achv).length+'/'+ACHV.length+' 🏆';
  try{navigator.clipboard.writeText(t);toast('📤 نُسخ الملخص — شاركه أين تريد!');}catch(e){showModal('<h2>📤 ملخص نتيجتك</h2><p style="font-size:14px;line-height:1.8">'+t+'</p><button class="bigBtn" style="width:100%;margin-top:10px" onclick="hideModal()">تمام</button>');}
}

function corpStock(){const c=S.company;return (c&&c.ticker)?S.assets[c.ticker]||null:null;}
function corpMcap(){const c=S.company,a=corpStock();if(!c||!c.ipo||!a)return 0;return a.price*c.ipo.shares;}
function updateCorpStock(){
  const c=S.company;if(!c||!c.ipo||!c.ipo.listed)return;
  const a=S.assets[c.ticker];if(!a)return;
  const ipo=c.ipo;
  const fair=(companyValue()*ipo.mult)/Math.max(1,ipo.shares);
  const pull=(fair-a.price)/Math.max(1,a.price);
  const drift=Math.max(-0.14,Math.min(0.14,pull*0.5))+rnd(-0.025,0.025)+(a.sent||0)*0.04;
  a.price=Math.max(0.05,+(a.price*(1+drift)).toFixed(2));
  a.sent=Math.max(-0.7,Math.min(0.7,(a.sent||0)*0.88));
  a.hist.push(a.price);if(a.hist.length>240)a.hist.shift();
  ipo.price=a.price;ipo.mcap=a.price*ipo.shares;ipo.lastChg=+(drift*100).toFixed(2);
}
function openIPO(){
  const c=S.company;if(!c)return;
  if(c.public)return toast('شركتك مدرجة بالفعل في البورصة');
  const val=companyValue();
  if(val<150000)return toast('❌ الاكتتاب متاح لما قيمة الشركة تعدّي ١٥٠ ألف');
  const row=(m,f,lbl,desc)=>{const p=val*m/1000;const raised=p*1000*f;const net=raised*0.98;
    return '<div style="border:1px solid var(--line);border-radius:12px;padding:10px;margin-top:8px">'+
    '<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:13.5px">'+lbl+'</b><span style="font-size:12px;color:var(--dim)">سعر السهم '+fmtD(p)+'</span></div>'+
    '<div style="font-size:12px;color:var(--dim);margin:4px 0 8px">'+desc+'</div>'+
    '<div style="display:flex;justify-content:space-between;font-size:12.5px"><span>تطرح '+Math.round(f*100)+'% من الأسهم</span><span>صافي الجمع <b style="color:var(--up)">'+fmtD(net)+'</b></span></div>'+
    '<button class="bigBtn" style="width:100%;margin-top:8px;font-size:13px" onclick="hideModal();doIPO('+m+','+f+')">نفّذ الطرح</button></div>';};
  showModal('<h2>📢 الاكتتاب العام — '+c.name+'</h2>'+
    '<p style="font-size:12.5px;color:var(--dim);margin:6px 0 2px">قيمة الشركة التقديرية: <b style="color:var(--txt)">'+fmtD(val)+'</b> · إجمالي الأسهم ١٠٠٠ · عمولة بنك الطرح ٢٪</p>'+
    row(0.85,0.2,'🛡️ تسعير محافظ','سعر أقل = طلب أعلى وفرصة صعود أول يوم أكبر، بس تجمع أقل')+
    row(1,0.3,'⚖️ تسعير عادل','المتوسط — أنسب خيار لمعظم الشركات')+
    row(1.25,0.4,'🚀 تسعير جسور','تجمع أكبر كاش، بس خطر هبوط أول يوم لو السوق مش متحمس')+
    '<button class="bigBtn" style="width:100%;margin-top:10px;background:var(--panel2);color:var(--txt)" onclick="hideModal()">إلغاء</button>');
}
function doIPO(mult,floatPct){
  const c=S.company;if(!c||c.public)return false;
  const val=companyValue();if(val<150000)return false;
  let key='س:'+c.name;let i=2;while(S.assets[key]){key='س:'+c.name+' '+i;i++;}
  const shares=1000;
  const price=Math.max(0.1,+((val*mult)/shares).toFixed(2));
  const raised=price*shares*floatPct;const fee=raised*0.02;
  const popBias=((Math.min(100,c.brand==null?10:c.brand)+Math.min(100,c.rep==null?50:c.rep))/200)-0.5;
  const pop=Math.max(-0.15,Math.min(0.28,popBias*0.35+rnd(-0.05,0.09)));
  const open=Math.max(0.1,+(price*(1+pop)).toFixed(2));
  S.assets[key]={kind:'stock',name:c.name,sector:c.sector,price:open,base:price,vol:0.045,sent:0.08,trend:0,hist:[price,open],held:0,avg:0,short:0,shortAvg:0,div:0.006};
  c.cash+=raised-fee;
  c.public=true;c.ticker=key;
  c.ipo={listed:true,shares:shares,founder:Math.round(shares*(1-floatPct)),float:Math.round(shares*floatPct),mult:mult,price:open,offerPrice:price,raised:raised,fee:fee,pop:+(pop*100).toFixed(2),lockUntil:S.day+30,mcap:open*shares,lastChg:+(pop*100).toFixed(2),sold:0,offers:1};
  pushNews(S,'📢 اكتتاب "'+c.name+'" ناجح — جمع '+fmtD(raised-fee)+' صافي، وأول يوم '+(pop>=0?'+':'')+(pop*100).toFixed(1)+'%',0.04,true,true);
  toast('📢 اكتتاب ناجح! خزينة الشركة +'+fmtD(raised-fee));
  log('اكتتاب '+c.name+' — طرح '+Math.round(floatPct*100)+'%');
  save();checkAchv();renderAll();refreshNewsUI();
  return true;
}
function sellFounder(pct){
  const c=S.company;if(!c||!c.ipo||!c.ipo.listed)return false;
  const a=S.assets[c.ticker];if(!a)return false;
  if(S.day<c.ipo.lockUntil)return false;
  const q=Math.floor(c.ipo.founder*pct);if(q<1)return false;
  const net=q*a.price*0.99;
  S.cash+=net;c.ipo.founder-=q;c.ipo.sold+=q;
  toast('💵 بعت '+q+' سهم بـ'+fmtD(net)+' بعد عمولة ١٪');
  pushNews(S,'💵 مؤسس "'+c.name+'" باع '+q+' سهم من حصته بـ'+fmtD(net),-0.02,false,false);
  log('بيع حصة مؤسس '+q+' سهم');save();renderAll();return true;
}
function followOn(pct){
  const c=S.company;if(!c||!c.ipo||!c.ipo.listed)return false;
  const a=S.assets[c.ticker];if(!a)return false;
  if(S.day<c.ipo.lockUntil)return false;
  const add=Math.round(c.ipo.shares*pct);
  const raised=a.price*add*0.98;
  c.ipo.shares+=add;c.ipo.float+=add;c.ipo.raised+=raised;c.ipo.offers++;
  a.price=Math.max(0.05,+(a.price*(1-pct*0.3)).toFixed(2));
  c.cash+=raised;
  c.ipo.price=a.price;c.ipo.mcap=a.price*c.ipo.shares;
  toast('🏦 طرح إضافي: خزينة الشركة +'+fmtD(raised));
  pushNews(S,'🏦 "'+c.name+'" تطرح '+add+' سهم إضافي وتجمع '+fmtD(raised),-0.01,false,true);
  log('طرح إضافي '+add+' سهم');save();renderAll();return true;
}
function renderIPO(){
  const c=S.company;
  const b=$('btnIPO');
  if(b)b.classList.toggle('hidden',!(c&&!c.public&&companyValue()>=150000));
  const el=$('ipoBody');if(!el)return;
  if(!c){el.innerHTML='<div style="font-size:12.5px;color:var(--dim)">أسّس شركة أولًا لتقدر تطرحها في البورصة.</div>';return;}
  if(!c.ipo||!c.ipo.listed){
    const val=companyValue();
    el.innerHTML='<div style="font-size:12.5px;color:var(--dim);line-height:1.9">شركتك لسه مش مدرجة. قيمة الشركة التقديرية: <b style="color:var(--txt)">'+fmtD(val)+'</b>'+
      '<br>'+(val>=150000?'الطرح متاح دلوقتي — تختار التسعير وحجم الطرح بنفسك.':'محتاج قيمة الشركة تعدّي ١٥٠ ألف عشان تفتح الاكتتاب.')+'</div>'+
      (val>=150000?'<button class="bigBtn" style="width:100%;margin-top:8px;font-size:13px" onclick="openIPO()">📢 ابدأ الاكتتاب العام</button>':'');
    return;
  }
  const a=S.assets[c.ticker]||{price:c.ipo.price,hist:[c.ipo.price]};
  const ipo=c.ipo;
  const prev=a.hist&&a.hist.length>1?a.hist[a.hist.length-2]:a.price;
  const chg=prev?((a.price/prev-1)*100):0;
  const stake=ipo.shares?ipo.founder/ipo.shares*100:0;
  const daysLeft=Math.max(0,ipo.lockUntil-S.day);
  const G='display:grid;grid-template-columns:repeat(3,1fr);gap:6px';
  let h='<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px"><b style="font-size:14px">'+a.name+'</b><span style="font-size:12px;color:var(--dim)">'+String(c.ticker).replace('س:','')+'</span></div>';
  h+='<div style="font-size:22px;font-weight:800">'+fmtD(a.price)+' <span style="font-size:12.5px;color:'+(chg>=0?'var(--up)':'var(--down)')+'">'+(chg>=0?'+':'')+chg.toFixed(2)+'%</span></div>';
  h+='<div style="'+G+';margin-top:8px;font-size:12px;color:var(--dim)">'+
    '<div>القيمة السوقية<br><b style="color:var(--txt);font-size:12.5px">'+fmtD(ipo.mcap)+'</b></div>'+
    '<div>حصة المؤسس<br><b style="color:var(--txt);font-size:12.5px">'+stake.toFixed(1)+'%</b></div>'+
    '<div>الأسهم العائمة<br><b style="color:var(--txt);font-size:12.5px">'+ipo.float+'/'+ipo.shares+'</b></div>'+
    '<div>سعر الطرح<br><b style="color:var(--txt);font-size:12.5px">'+fmtD(ipo.offerPrice)+'</b></div>'+
    '<div>صافي الجمع<br><b style="color:var(--txt);font-size:12.5px">'+fmtD(ipo.raised-ipo.fee)+'</b></div>'+
    '<div>أول يوم<br><b style="color:'+(ipo.pop>=0?'var(--up)':'var(--down)')+';font-size:12.5px">'+(ipo.pop>=0?'+':'')+ipo.pop.toFixed(1)+'%</b></div></div>';
  if(daysLeft>0){
    h+='<div style="margin-top:8px;font-size:12px;color:#f59e0b">🔒 حصة المؤسس مقفولة '+daysLeft+' يوم — البيع والطرح الإضافي بعد القفل</div>';
  }else{
    h+='<div class="tradeRow" style="margin-top:8px"><button class="btnShort" id="btnSellFounder">💵 بِع ١٠٪ من حصتي</button><button class="btnGhost" id="btnFollowOn">🏦 طرح إضافي ١٠٪</button></div>';
  }
  h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim)">الطرح رقم '+ipo.offers+' · السعر يتحرك يوميًا مع أرباح الشركة وسمعتها</div>';
  el.innerHTML=h;
  const bs=$('btnSellFounder');if(bs)bs.onclick=()=>sellFounder(0.1);
  const bf=$('btnFollowOn');if(bf)bf.onclick=()=>followOn(0.1);
}
$('btnIPO').onclick=()=>openIPO();

$('btnTip').onclick=()=>{
  if(S.cash<5000)return toast('❌ تحتاج ٥٬٠٠٠ دينار');
  if(!S.nextNews)return toast('🕵️ لا توجد معلومة متاحة الآن — عُد لاحقًا');
  if(S.tipUsed)return toast('🕵️ اشتريت معلومة هذه الجولة بالفعل');
  S.cash-=5000;S.tips++;S.tipUsed=1;
  const n=NEWS_T[S.nextNews.i];
  let target='';
  if(n.k==='sector')target=' — القطاع المتأثر: '+n.s;
  else if(n.k==='fx')target=' — العملة: '+n.s;
  else if(n.k==='cmd')target=' — السلعة: '+n.s;
  else if(n.k==='all')target=' — سيؤثر على السوق كله';
  else if(n.k==='rate')target=' — قرار فائدة';
  $('tipOut').innerHTML='<div class="newsItem '+(n.g?'good':'hot')+'">🕵️ خلال '+S.nextNews.h+' ساعة تقريبًا: <b>'+n.t+'</b>'+target+'</div>';
  log('شراء معلومة مسرّبة');save();checkAchv();renderHead();
};
function toast(t){
  if(S&&S.notifs){S.notifs.push({d:S.day,hh:S.hh,mm:S.mm,msg:t});if(S.notifs.length>60)S.notifs.shift();}
  const d=document.createElement('div');d.className='toast';d.textContent=t;$('toasts').appendChild(d);setTimeout(()=>d.remove(),4200);
  if(document.getElementById('notifList'))renderNotifs();
}
function showModal(h){$('modal').innerHTML=h;$('modalBg').classList.add('on');}
function hideModal(){$('modalBg').classList.remove('on');}
$('modalBg').onclick=e=>{if(e.target.id==='modalBg')hideModal();};

$('btnShare').onclick=shareResult;
$('btnAdvisor').onclick=advisor;

if(!load())S=freshState();
migrate();
applyTheme();
renderAll();refreshNewsUI();
if(!S.tut){
  showModal('<h2>👋 أهلًا بك في "اقتصاد حي"</h2>'+
    '<div style="font-size:14px;line-height:1.9">🌍 عالم كامل يتحرك: أسهم وعملات وسلع وعقارات تتأثر بالأخبار لحظة بلحظة.<br>'+
    '📈 ابدأ بالتداول من صفحة <b>السوق</b> — شراء وبيع وشورت وأوامر محددة.<br>'+
    '🏭 أسّس <b>شركتك</b> وأدرها: سعر وجودة وتسويق وعمال، ونافس شركة أخرى، واطرحها للاكتتاب.<br>'+
    '🏦 استخدم <b>البنك</b>: ودائع وقروض وسندات وعقارات بإيجار يومي.<br>'+
    '🎯 لك <b>هدف يومي</b> بمكافأة، وإنجازات تفتح مع تقدمك.<br>'+
    '⏩ تحكم في سرعة الزمن من الأعلى. اللعبة تُحفظ تلقائيًا.</div>'+
    '<button class="bigBtn" style="width:100%;margin-top:14px" onclick="hideModal();S.tut=1;save()">يلا نبدأ 🚀</button>');
}
setSpeed(1);
if(/^#p-/.test(location.hash)){hideModal();S.tut=1;showPage(location.hash.slice(3));renderAll();}
setInterval(()=>{renderAll();refreshNewsUI();},3000);
window.addEventListener('resize',()=>renderAsset());
