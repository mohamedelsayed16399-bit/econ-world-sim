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

if(location.hash==='#test'){
  const out=[];const ok=(n,c)=>out.push((c?'PASS':'FAIL')+' '+n);
  try{
    
    sel='س:نخبة تك';const cash0=S.cash;$('qty').value=10;buy();
    ok('شراء 10 أسهم',S.assets[sel].held===10&&S.cash<cash0);
    $('qty').value=5;sell();
    ok('بيع 5 أسهم',S.assets[sel].held===5);
    
    sel='ع:يورو';$('qty').value=100;buy();ok('شراء عملة',S.assets['ع:يورو'].held===100);
    sel='م:ذهب';$('qty').value=3;buy();ok('شراء سلعة',S.assets['م:ذهب'].held===3);
    
    $('bkAmt').value=5000;const depC=S.cash;$('btnDep').click();ok('إيداع',S.dep>=5000&&S.cash<depC);
    $('bkAmt2').value=10000;$('btnBorrow').click();ok('اقتراض',S.loan>=10000);
    $('btnRepay').click();ok('سداد',S.loan<10000||S.cash>0);
    
    const c0=S.cash;$('coName').value='شركة الاختبار';$('btnFound').click();
    ok('تأسيس شركة',!!S.company&&S.cash===c0-50000);
    $('sPrice').value=55;$('sPrice').dispatchEvent(new Event('input'));
    ok('تعديل سعر المنتج',S.company.price===55);
    
    for(let i=0;i<400;i++)tick();
    ok('محاكاة 400 ساعة بدون أخطاء',S.day>1);
    ok('أسعار موجبة',Object.values(S.assets).every(a=>a.price>0&&isFinite(a.price)));
    ok('أخبار وُلدت',S.news.length>1);
    ok('ثروة محسوبة',isFinite(netWorth())&&netWorth()>0);
    ok('شركة تعمل',S.company&&isFinite(S.company.cash));
    quarterReport();ok('تقرير ربع سنوي',$('modalBg').classList.contains('on'));hideModal();
    
    sel='س:سحابة';$('qty').value=10;const sc0=S.cash;shortSell();
    ok('شورت 10',S.assets[sel].short===10&&S.cash>sc0);
    $('qty').value=10;cover();
    ok('تغطية شورت',S.assets[sel].short===0);
    
    S.nextNews={i:0,h:5};S.tipUsed=0;S.cash+=10000;
    $('btnTip').click();
    ok('معلومة مسرّبة',S.tips===1&&$('tipOut').textContent.length>10);
    
    if(S.company){
      const dayS=S.day;
      RNG=()=>0.5;
      S.company.sup={active:null,offers:[],history:[],deals:0};
      S.company.cash=200000;S.company.rep=70;S.company.brand=40;
      const os=genSupOffers();
      ok('٣ عروض موردين',os.length===3&&os.every(o=>o.unitCost>0&&o.reliability>0&&o.volume>0));
      const c0=os[0].unitCost;
      ok('تفاوض عادل يخفّض السعر',negotiateSup(0,'fair')===true&&os[0].unitCost<c0);
      const c1=os[1].unitCost,q1=os[1].quality;
      ok('اتفاقية ممتازة ترفع السعر والالتزام',negotiateSup(1,'prem')===true&&os[1].unitCost>c1&&os[1].quality>q1);
      const c2=os[2].unitCost;
      ok('تفاوض صارم ينجح مع سمعة عالية',negotiateSup(2,'hard')===true&&os[2].unitCost<c2);
      const fee=os[0].fee,cashS=S.company.cash;
      ok('توقيع العقد يخصم الرسوم',signSup(0)===true&&Math.abs(S.company.cash-(cashS-fee))<1&&!!S.company.sup.active);
      ok('لا عقدين في نفس الوقت',signSup(1)===false);
      ok('سعر التوريد بقى سعر العقد',Math.abs(supCost()-S.company.sup.active.unitCost)<1e-9);
      if(!S.company.inv)S.company.inv=invDef();
      S.company.inv.order=null;S.company.cash=100000;
      const cashO=S.company.cash;orderStock(1000);
      ok('الطلب بيستخدم سعر المورد',Math.abs((cashO-S.company.cash)-Math.round(1000*supCost()))<1);
      const endD=S.company.sup.active.endDay;S.day=endD;supTick();
      ok('العقد ينتهي بعد المدة',S.company.sup.active===null);
      S.day=dayS;
      S.company.sup={active:{name:'مورد اختبار',unitCost:2.5,reliability:0.5,quality:2,volume:800,term:30,endDay:S.day+30,fee:0},offers:[],history:[],deals:0};
      const inv2=S.company.inv;inv2.order={units:500,left:1};inv2.units=100;
      RNG=()=>0.99;runCompany();
      ok('مورد غير ملتزم يأخر الشحنة',!!inv2.order&&inv2.order.left>0);
      S.company.cash=200000;
      const cashX=S.company.cash;
      const pen=Math.round(S.company.sup.active.unitCost*S.company.sup.active.volume*2);
      ok('فسخ العقد يدفع غرامة',cancelSup()===true&&Math.abs(S.company.cash-(cashX-pen))<1&&S.company.sup.active===null);
      renderSup();ok('بطاقة الموردين ترسم',$('supBody').innerHTML.length>50);
      RNG=Math.random;
    }
    
    if(S.company){
      const day0=S.day;
      S.company.track=new Array(365).fill(5000);S.company.lastYearProfit=365*5000;S.company.quality=50;S.company.cash=80000;
      S.company.public=false;S.company.ticker=null;S.company.ipo={listed:false};S.company.brand=60;S.company.rep=70;
      RNG=()=>0.5;
      renderIPO();ok('بطاقة الاكتتاب تظهر',$('ipoBody').innerHTML.includes('اكتتاب')&&!$('btnIPO').classList.contains('hidden'));
      S.company.lastYearProfit=0;S.company.cash=1000;S.company.quality=10;
      renderIPO();ok('الاكتتاب مقفول تحت ١٥٠ ألف',$('btnIPO').classList.contains('hidden')&&doIPO(1,0.3)===false);
      S.company.lastYearProfit=365*5000;S.company.cash=80000;S.company.quality=50;
      const cash0=S.company.cash;
      ok('طرح ٣٠٪ يجمع كاش في خزينة الشركة',doIPO(1,0.3)===true&&S.company.cash>cash0&&S.company.public===true);
      const ipo=S.company.ipo,ast=S.assets[S.company.ticker];
      ok('حصة المؤسس ٧٠٪ والعائم ٣٠٪',ipo.founder===700&&ipo.float===300);
      ok('عمولة الطرح ٢٪',Math.abs(ipo.fee-ipo.raised*0.02)<1e-6&&Math.abs((S.company.cash-cash0)-(ipo.raised-ipo.fee))<1e-6);
      ok('السهم اتدرج في السوق',!!ast&&ast.kind==='stock'&&ast.name===S.company.name);
      ok('القيمة السوقية = السعر × الأسهم',Math.abs(corpMcap()-ast.price*ipo.shares)<1e-6);
      const tk0=S.company.ticker;ok('مش ممكن اكتتاب تاني',doIPO(1,0.3)===false&&S.company.ticker===tk0);
      const f0=ipo.founder;ok('قفل المؤسس يمنع البيع',sellFounder(0.5)===false&&ipo.founder===f0);
      S.day=ipo.lockUntil+1;
      const cashP=S.cash;ok('بيع حصة المؤسس بعد القفل',sellFounder(0.5)===true&&S.cash>cashP&&ipo.founder<f0);
      const sh0=ipo.shares,off0=ipo.offers,cashC=S.company.cash;
      ok('طرح إضافي يزوّد الأسهم والكاش',followOn(0.1)===true&&ipo.shares>sh0&&S.company.cash>cashC&&ipo.offers===off0+1);
      const p0=ast.price;updateCorpStock();
      ok('سعر السهم يتحرك مع نتائج الشركة',ast.price!==p0);
      const nwNoFounder=netWorth()-ipo.founder*ast.price;
      ok('الثروة تشمل حصة المؤسس',Math.abs((netWorth()-nwNoFounder)-ipo.founder*ast.price)<1);
      renderIPO();ok('بطاقة الاكتتاب بعد الطرح',$('ipoBody').innerHTML.includes('حصة المؤسس')&&$('ipoBody').innerHTML.includes('القيمة السوقية'));
      S.company.public=false;S.company.ipo={listed:false};
      openIPO();ok('نافذة التسعير بتفتح بخيارات',($('modal').innerHTML.includes('الاكتتاب العام')&&$('modal').innerHTML.includes('تسعير جاهز')===false&&$('modal').innerHTML.includes('محافظ')));
      hideModal();S.company.public=true;S.company.ipo=ipo;
      RNG=Math.random;S.day=day0;
    }
    
    chartMode='candle';renderAsset();ok('شموع يابانية',true);
    chartMode='line';
    ok('مؤشرات قطاعات',SECTORS.every(s=>S.sectorHist[s]&&S.sectorHist[s].length>1));
    checkAchv();ok('إنجازات',Object.keys(S.achv).length>=3);
    ok('ثروة مع الشورت',isFinite(netWorth()));
    
    sel='س:نخبة تك';
    S.orders.push({sym:sel,dir:'buy',q:5,target:1e9});
    const oh=S.assets[sel].held;
    endOfDay();
    ok('تنفيذ أمر محدد',S.assets[sel].held===oh+5&&S.orders.length===0);
    S.alerts.push({sym:sel,dir:'up',target:1});
    endOfDay();
    ok('تنبيه سعري',S.alerts.length===0);
    
    if(S.company){S.company.cash+=100000;const ub=S.company.cash;
      renderUpg();
      const btn=$('upgRow').querySelector('button');btn.click();
      ok('ترقية شركة',S.company.up.line===1&&S.company.cash<ub);
    }
    
    S.day=14;weeklyPaper();ok('جريدة الأسبوع',$('modalBg').classList.contains('on'));hideModal();
    renderDonut();renderStats();ok('دونات وإحصائيات',$('statKpis').textContent.length>5);
    
    S.cash+=600000;
    renderProps();
    $('propTbl').querySelector('[data-b]').click();
    ok('شراء عقار',Object.values(S.props).some(p=>p.qty>0));
    const rent0=S.rentTotal;endOfDay();
    ok('إيجار يومي',S.rentTotal>rent0);
    const pr0=Object.values(S.props)[0].qty;
    const sb=$('propTbl').querySelector('[data-s]');if(sb)sb.click();
    ok('بيع عقار',Object.values(S.props).every(p=>p.qty<pr0+1));
    
    $('bondAmt').value=10000;$('btnBond').click();
    ok('شراء سند',S.bonds.length===1);
    S.day=S.bonds[0].due;const cb=S.cash;endOfDay();
    ok('استحقاق سند',S.bonds.length===0);
    
    ok('هدف اليوم موجود',!!S.goal&&S.goal.target>0);
    
    ok('منافس موجود',!!S.rival);
    if(S.company){S.company.cash+=20000;const rs=S.rival.strength;$('btnAttack').click();
      ok('حملة ضد المنافس',S.rival.strength!==rs);}
    
    S.bubbles['تقنية']=5;
    let crashed=false;
    for(let i=0;i<80&&!crashed;i++){const s0=S.assets['س:نخبة تك'].sent;endOfDay();if(S.assets['س:نخبة تك'].sent<s0-0.2)crashed=true;}
    ok('فقاعة تنفجر',crashed||S.bubbles['تقنية']===0);
    
    S.day=15;const r0=S.rate;endOfDay();
    ok('اجتماع مركزي',true);
    
    if(S.company){S.company.track=new Array(365).fill(9000);S.company.lastYearProfit=365*9000;S.company.cash=120000;
      maOffer();ok('عرض استحواذ يظهر',$('modalBg').classList.contains('on')&&maPending>0);
      const cashA=S.cash;maAccept();
      ok('قبول الاستحواذ',!S.company&&S.cash>cashA);
    }
    
    $('btnTheme').click();ok('مظهر فاتح',document.body.classList.contains('light'));
    $('btnTheme').click();ok('مظهر داكن',!document.body.classList.contains('light'));
    
    try{shareResult();ok('مشاركة النتيجة',true);}catch(e){ok('مشاركة النتيجة',false);}
    
    S.assets['س:اتصالاتنا'].price=S.assets['س:اتصالاتنا'].base*0.05;
    worldRenewal();
    ok('إفلاس شركة',!S.assets['س:اتصالاتنا']&&S.bankruptcies>0);
    const stc0=Object.keys(S.assets).filter(k=>S.assets[k].kind==='stock').length;
    S.day=18;worldRenewal();
    ok('اكتتاب جديد يعوض',Object.keys(S.assets).filter(k=>S.assets[k].kind==='stock').length>=stc0);
    
    rollQuests();ok('مهام تولدت',S.quests.length===3);
    let q=null;for(let i=0;i<20&&!q;i++){rollQuests();q=S.quests.find(x=>x.k==='cash');}
    S.cash=q.n+1;checkQuests();ok('إنجاز مهمة بمكافأة',q.done===1);
    
    advisor();ok('مستشار آلي',$('modalBg').classList.contains('on'));hideModal();
    
    S.cash+=5000;$('btnLotto').click();$('btnLotto').click();
    ok('تذاكر يانصيب',S.lotto.tickets===2);
    const pool0=S.lotto.pool;endOfDay();
    ok('سحب يانصيب',S.lotto.tickets===0&&S.lotto.pool>=20000);
    
    $('thChg').click();ok('ترتيب بالتغير',S.sortKey==='chg');
    $('thPrice').click();ok('ترتيب بالسعر',S.sortKey==='price');
    
    ok('مزاج تاريخي',S.moodHist.length>10);
    
    ok('سجل إشعارات',S.notifs.length>0&&$('notifList').innerHTML.length>10);
    renderMovers();ok('متحركون اليوم',$('movers').innerHTML.includes('الأكثر'));
    
    const sk2=Object.keys(S.assets).find(k=>S.assets[k].kind==='stock');
    S.assets[sk2].price=500;S.assets[sk2].held=10;S.assets[sk2].avg=400;
    const q0=S.assets[sk2].held;endOfDay();
    ok('تقسيم سهم',S.assets[sk2].held===q0*2&&S.splits>0);
    
    S.gEvent={ic:'⚔️',n:'حرب تجارية عالمية',days:2,eff:{'*':-1.1},gold:true,msg:'x'};
    const goldK=Object.keys(S.assets).find(k=>S.assets[k].kind==='cmd');
    const gp0=S.assets[goldK].price;endOfDay();
    ok('حدث عالمي يؤثر',S.assets[goldK].price>gp0&&S.gEvent&&S.gEvent.days===1);
    endOfDay();ok('حدث عالمي ينتهي',S.gEvent===null||S.gEvent.n!=='حرب تجارية عالمية');
    renderGEvent();ok('بانر الحدث',!!$('gEventCard'));
    ok('تنوع الأحداث العالمية',GLOBAL_EVENTS.length>=12);
    const crK='ك:بيتكوين',cr0=S.assets[crK].price;
    S.gEvent={ic:'⚡',n:'قمع تنظيمي للكريبتو',days:1,eff:{'كريبتو':-2.8},msg:'x'};
    endOfDay();
    ok('قمع الكريبتو يضرب الكريبتو',S.assets[crK].price<cr0*0.975);
    S.gEvent=null;
    
    const ok2=Object.keys(S.assets)[0],oa=S.assets[ok2];
    S.cash=1000000;oa.held=5;oa.avg=oa.price;S.orders=[];
    S.orders.push({sym:ok2,side:'buy',qty:3,target:oa.price*0.5});
    const cashO0=S.cash;checkOrders();
    ok('أمر شراء بهدف بعيد لا يتنفذ',S.orders.length===1&&S.cash===cashO0);
    S.orders[0].target=oa.price*1.001;
    const heldO0=oa.held;checkOrders();
    ok('أمر شراء يتنفذ عند بلوغ الهدف',S.orders.length===0&&oa.held===heldO0+3&&S.cash<cashO0);
    S.orders.push({sym:ok2,side:'sell',qty:2,target:oa.price*0.5});
    checkOrders();
    ok('أمر بيع بهدف أقل من الحالي يتنفذ',S.orders.length===0);
    renderOrders();
    ok('واجهة الأوامر تعرض',$('ordList').innerHTML.includes('أوامر معلقة')||$('ordList').innerHTML.length>0);
    
    S.alerts=[];
    S.alerts.push({sym:ok2,dir:'above',target:oa.price*3});
    checkAlerts();
    ok('تنبيه بعيد لا يطلق',S.alerts.length===1);
    S.alerts[0].target=oa.price*0.999;
    checkAlerts();
    ok('تنبيه يطلق عند بلوغ السعر',S.alerts.length===0);
    S.alerts=[];
    
    renderAlloc();
    ok('رسم توزيع الثروة موجود',!!$('allocChart'));
    S.macro={phase:0,days:1};const mDay0=S.day;
    S.day=8;endOfDay();
    ok('دورة الاقتصاد تدور',S.macro.phase===1&&S.macro.days>1);
    renderMacro();
    ok('بطاقة الدورة تعرض',$('macroBody').innerHTML.includes('ذروة'));
    renderEconCal();
    ok('الدورة في التقويم',$('econCal').innerHTML.includes('دورة الاقتصاد'));
    S.macro={phase:0,days:8};S.day=mDay0;renderAll();
    oa.held=0;oa.avg=0;S.orders=[];S.cash=100000;renderAll();
    
    sel=Object.keys(S.assets).find(k=>S.assets[k].kind==='stock');
    renderDepth();ok('عمق السوق',!!$('depthChart'));
    
    S.cash=25000000;
    renderPrestige();ok('مؤهل للأسطورة',!$('btnPrestige').disabled);
    $('btnPrestige').click();$('btnPrestigeYes').click();
    ok('بدء كأسطورة',S.prestige===1&&S.cash>=150000&&pmult()>1.1);
    ok('إنجازات محفوظة',typeof S.achv==='object');
    
    S.company={name:'شركة الفروع',sector:'تقنية',cash:500000,price:40,rd:200,marketing:300,workers:20,quality:10,track:[],lastYearProfit:0,todayRev:0,todayProfit:0,todaySold:0,up:{line:0,auto:0,brand:0},branches:[]};
    renderBranches();
    ok('قائمة الفروع تظهر',$('branchList').innerHTML.includes('دبي'));
    openBranch('دبي');
    ok('فتح فرع',S.company.branches.length===1&&S.company.cash<500000);
    const bLvl=S.company.branches[0].lvl;upgradeBranch('دبي');
    ok('ترقية فرع',S.company.branches[0].lvl===bLvl+1);
    S.cityStatus['دبي']='boom';
    const bc0=S.company.cash;runCompany();
    ok('فرع يكسب وقت الطفرة',S.company.branchProfit>0);
    S.cityStatus['دبي']='bust';runCompany();
    ok('الكساد يقلل مكسب الفرع',S.company.branchProfit<4000*2*1.45);
    
    S.challenge=null;renderChallenge();
    ok('زر التحدي يظهر',!!$('btnChallenge'));
    $('btnChallenge').click();
    ok('تحدٍ بدأ',!!S.challenge&&S.challenge.rivals.length===3);
    const rw0=S.challenge.rivals[0].w;tickChallenge();
    ok('منافسو التحدي يتحركون',S.challenge===null||S.challenge.rivals[0].w!==rw0);
    
    S.challenge={start:100000,target:200000,day0:S.day,days:30,rivals:[{n:'x',w:100000}]};
    S.cash=500000;tickChallenge();
    ok('فوز التحدي',S.challenge===null&&S.achv.champion===1);hideModal();
    
    ok('أصول كريبتو موجودة',!!S.assets['ك:بيتكوين']&&S.assets['ك:بيتكوين'].kind==='crypto');
    sel='ك:بيتكوين';$('qty').value=1;const cbc=S.cash;buy();
    ok('شراء كريبتو',S.assets['ك:بيتكوين'].held===1&&S.cash<cbc);
    const idxC=NEWS_T.findIndex(n=>n.k==='crypto'&&n.m>0);
    const bcSent=S.assets['ك:بيتكوين'].sent;fireNews(idxC);
    ok('خبر كريبتو يؤثر',S.assets['ك:بيتكوين'].sent>bcSent);
    
    S.day=9;endOfDay();
    S.day=10;
    const snap={};Object.keys(S.assets).forEach(k=>{if(S.assets[k].kind==='stock')snap[k]=S.assets[k].price;});
    endOfDay();
    ok('موسم أرباح يحرك الأسعار',Object.keys(snap).some(k=>S.assets[k].price!==snap[k]));
    
    delete S.assets['ك:إيثريوم'];migrate();
    ok('ترحيل يعيد الأصول الجديدة',!!S.assets['ك:إيثريوم']);
    
    ok('صناديق ETF موجودة',!!S.assets['ص:تقنية']&&S.assets['ص:تقنية'].kind==='etf');
    const etfP0=S.assets['ص:تقنية'].price;tick();
    ok('ETF يتبع القطاع',S.assets['ص:تقنية'].price>0&&S.assets['ص:تقنية'].hist.length>1);
    sel='ص:تقنية';$('qty').value=5;buy();
    ok('شراء ETF',S.assets['ص:تقنية'].held===5);
    
    S.stats.worstTrade=0;sel='ك:ميم كوين';S.assets[sel].avg=100;$('qty').value=1;
    S.assets[sel].held=1;S.assets[sel].price=50;sell();
    ok('أسوأ صفقة تُسجل',S.stats.worstTrade<0);
    
    const sq='س:نخبة تك';S.assets[sq].short=10;S.assets[sq].shortAvg=100;S.assets[sq].price=130;S.cash+=50000;
    S.gEvent=null;if(S.day%10===0)S.day++;
    endOfDay();
    ok('ضغط شورت يغطي نصف المركز',S.assets[sq].short<=5);
    
    sel='س:نخبة تك';S.assets[sel].price=100;$('qty').value=10;
    const opc=S.cash;$('btnCall').click();
    ok('شراء خيار صعود',S.options.length===1&&S.cash===opc-Math.ceil(100*10*0.04));
    S.assets[sel].price=115;S.day=S.options[0].expiry;settleOptions();
    ok('تسوية خيار رابحة',S.options.length===0);
    $('btnPut').click();S.assets[sel].price=120;S.day+=5;settleOptions();
    ok('خيار هبوط خاسر ينتهي',S.options.length===0);
    
    ok('بورصات المدن موجودة',!!S.assets['ب:دبي']&&S.assets['ب:دبي'].kind==='cidx');
    S.cityStatus['دبي']='boom';const dx0=S.assets['ب:دبي'].price;
    const dv=S.assets['ب:دبي'].vol;S.assets['ب:دبي'].vol=0;const m0=S.mood;S.mood=0;S.assets['ب:دبي'].sent=0;S.assets['ب:دبي'].trend=0;
    S.hour=8;for(let i=0;i<15;i++)tick();
    ok('طفرة المدينة ترفع بورصتها',S.assets['ب:دبي'].price>dx0);
    S.assets['ب:دبي'].vol=dv;S.mood=m0;
    sel='ب:لندن';$('qty').value=3;buy();
    ok('شراء من بورصة أجنبية',S.assets['ب:لندن'].held===3);
    
    S.autopilot=true;S.cash=60000;
    const dipK=Object.keys(S.assets).find(k=>S.assets[k].kind==='stock'&&chgPct(S.assets[k])<-2);
    if(dipK){const h0=S.assets[dipK].held;runAutopilot();ok('طيار آلي يشتري القاع',S.assets[dipK].held>h0);}
    else{runAutopilot();ok('طيار آلي يعمل بدون فرصة',true);}
    renderAutopilot();ok('كارت الطيار',!!$('btnAutopilot'));
    
    ok('مستوى المستثمر',invLevel().length>0&&!!$('hLevel'));
    
    S.company=S.company||{name:'شركة القرش',sector:'تقنية',cash:100000,price:40,rd:200,marketing:300,workers:20,quality:10,track:[],lastYearProfit:0,todayRev:0,todayProfit:0,todaySold:0,up:{line:0,auto:0,brand:0},branches:[]};
    S.rival={name:'منافس ضعيف',strength:0.4};S.cash+=400000;
    renderRival();
    ok('زر الاستحواذ يظهر للضعيف',!!$('btnBuyRival'));
    const cashBR=S.cash;buyRival();
    ok('استحواذ ناجح',S.rival===null&&!!S.subsidiary&&S.cash<cashBR&&S.achv.shark===1);
    const subC0=S.company.cash;runCompany();
    ok('التابع يدر دخلًا',S.company.branchProfit>=3000);
    
    ok('كارت التحدي',!!$('weeklyCard'));
    RNG=mulberry32(999);const wa=freshState();S=wa;
    for(let i=0;i<20;i++)tick();
    const p1=S.assets['س:نخبة تك'].price;
    RNG=mulberry32(999);S=freshState();
    for(let i=0;i<20;i++)tick();
    const p2=S.assets['س:نخبة تك'].price;
    ok('البذرة حتمية',Math.abs(p1-p2)<1e-9);
    RNG=mulberry32(1000);S=freshState();
    for(let i=0;i<20;i++)tick();
    ok('بذرة مختلفة = سوق مختلف',Math.abs(S.assets['س:نخبة تك'].price-p1)>1e-9);
    RNG=Math.random.bind(Math);
    
    S=freshState();S.weekly={seed:weekSeed(),endDay:S.day+1};
    renderWeekly();ok('حالة التحدي الجارية',!!$('weeklyBody')&&$('weeklyBody').innerHTML.includes('جارٍ'));
    endOfDay();S.day++;endOfDay();
    ok('نهاية التحدي',S.weekly===null);$('btnWeeklyBack').click();
    
    ok('قاعة المشاهير سجلت',S.hof.length>0);
    S.sectorHist['تقنية']=[10,11];
    renderHeatmap();ok('خريطة حرارية',$('heatmap').innerHTML.includes('تقنية'));
    
    const ak=Object.keys(S.assets)[0];S.assets[ak].hist=Array.from({length:40},(_,i)=>100+i);
    sel=ak;$('qty').value=5;buy();
    renderTA();
    ok('تحليل فني يعرض مؤشرات',$('taKpis').innerHTML.includes('RSI'));
    ok('بولينجر وماكد معروضان',$('taKpis').innerHTML.includes('بولينجر')&&$('taKpis').innerHTML.includes('ماكد'));
    ok('رسم بياني للسعر موجود',!!$('taChart'));
    ok('إشارة فنية',$('taSignal').textContent.length>3);
    ok('أداء الممتلكات يعرض المراكز',$('taPl').querySelector('tbody').innerHTML.includes(S.assets[ak].name));
    
    const mc0=S.cash;$('btnRig').click();
    ok('شراء جهاز تعدين',S.mining.rigs===1&&S.cash===mc0-5000);
    const mc1=S.cash;S.day++;endOfDay();
    ok('عائد تعدين يومي',S.mining.total>0&&S.cash>mc1);
    $('btnUpgM').click();ok('ترقية التعدين',S.mining.upg===1);
    
    const svR=RNG;RNG=()=>0.1;
    const bk=Object.keys(S.assets).find(k=>S.assets[k].kind==='stock'&&!(S.company&&S.company.ticker===k));
    S.assets[bk].price=1;S.assets[bk].base=100;
    worldRenewal();
    RNG=svR;
    ok('مزاد إفلاس بدأ',!!S.auction);
    if(S.auction){
      renderAuction();
      const cb2=S.cash;S.auction.npc=100;
      $('aucBid').value=5000;$('btnAuc').click();
      ok('مزايدة مسجلة',S.auction.bid===5000);
      S.day=S.auction.ends;endOfDay();
      ok('فوز بالمزاد ودخل إمبراطورية',S.empire.length>0&&S.cash<cb2);
    }
    
    renderFG();ok('مؤشر الخوف والطمع',$('fgGauge').innerHTML.includes('/100'));
    ok('نطاق المؤشر سليم',fgIndex()>=0&&fgIndex()<=100);
    renderIns();const ci=S.cash;$('btnIns').click();
    ok('تفعيل التأمين',S.ins.until===S.day+7&&S.cash<ci);
    S.nwHist=[1000000];S.day++;endOfDay();
    ok('تعويض التأمين عند الهبوط',S.ins.paid>0);
    ok('نص المشاركة',shareText().includes('صافي ثروتي'));
    
    const dk=Object.keys(S.assets).find(k=>S.assets[k].kind==='stock');
    sel=dk;$('qty').value=3;buy();
    renderDivCal();ok('تقويم التوزيعات',$('divCal').innerHTML.includes('/توزيعة'));
    S.day=29;S.nwHist=Array.from({length:30},(_,i)=>100000+i*1000);
    const ct0=S.cash;S.day++;endOfDay();
    ok('ضريبة أرباح سنوية',S.cash<ct0);
    ok('مقلدون بعد الربح',S.followers>=1);
    
    renderQuiz();
    const qz=QUIZ[S.day%QUIZ.length];
    document.querySelectorAll('.quizOpt')[qz.a].click();
    ok('كويز الأكاديمية',S.quiz.day===S.day&&S.quiz.streak>=1&&S.quiz.won>0);
    renderDuel();const cd=S.cash;$('btnDuel').click();
    ok('بدء مبارزة',!!S.duel&&S.cash===cd-10000);
    S.duel.bot=0.5;S.day+=5;endOfDay();
    ok('فوز بالمبارزة',S.duel===null&&S.duelWins===1);
    
    renderFunds();
    const nw0=netWorth();
    $('fundQty').value=10;
    document.querySelector('[data-fb="0"]').click();
    ok('شراء وحدات صندوق',S.fundH[0]===10&&Math.abs(netWorth()-nw0)<1);
    document.querySelector('[data-fs="0"]').click();
    ok('بيع وحدات صندوق',S.fundH[0]===0);
    renderDailyRecap();ok('ملخص اليوم المالي',$('dailyRecap').innerHTML.includes('تغير ثروتك'));
    
    renderProps();
    const pn=Object.keys(S.propPrice)[0];
    const csh=S.cash,ln=S.loan;
    document.querySelector('[data-m="'+pn+'"]').click();
    ok('رهن عقاري',S.props[pn].qty===1&&S.loan>ln&&S.cash===csh-Math.round(S.propPrice[pn]*0.2));
    S.company={name:'كو التجريبية',sector:'تقنية',cash:50000,price:40,rd:0,marketing:0,workers:10,quality:50,track:[],lastYearProfit:0,todayRev:0,todayProfit:0,todaySold:0,up:{line:0,auto:0,brand:0},public:true,ticker:'س:كو التجريبية'};
    S.assets['س:كو التجريبية']={kind:'stock',name:'كو التجريبية',sector:'تقنية',price:50,base:50,vol:0.04,sent:0,trend:0,hist:[50],held:0,avg:0,short:0,shortAvg:0,div:0.005};
    S.confDay=-20;renderConf();
    const sent0=S.assets['س:كو التجريبية'].sent;
    document.querySelector('.confBtn[data-m="opt"]').click();
    ok('مؤتمر صحفي يحرك السهم',S.assets['س:كو التجريبية'].sent>sent0&&S.confDay===S.day);
    
    S.vcDeal={name:'ناشئة اختبار',ask:5000,mult:5,risk:0.01,due:S.day+10};
    renderVC();const cv=S.cash;$('btnVC').click();
    ok('استثمار مخاطر',S.vc.length===1&&S.cash===cv-5000);
    const svR2=RNG;RNG=()=>0.99;
    S.day=S.vc[0].due;const cv2=S.cash;endOfDay();RNG=svR2;
    ok('خروج ناجح من المخاطر',S.vc.length===0&&S.vcWins===1&&S.cash>cv2);
    
    const mk=Object.keys(S.assets).find(k=>S.assets[k].kind==='stock');
    sel=mk;$('qty').value=4;
    const cm0=S.cash;buyMargin();
    ok('فتح مركز هامش',!!S.marginPos&&S.marginPos.qty===4&&S.cash<cm0);
    S.assets[mk].price=S.marginPos.entry*0.7;
    const cm1=S.cash;endOfDay();
    ok('تصفية هامش إجبارية',S.marginPos===null);
    ok('أرقام قياسية تتجدد',S.recPeak>=100000);
    
    renderWeekly();
    document.querySelector('.scnBtn').click();
    $('btnScnYes').click();
    ok('سيناريو يبدأ بسوق مزروع',!!S.weekly&&S.weekly.scn===0&&S.mood<0);
    S.day=S.weekly.endDay;finishWeekly();
    ok('نهاية السيناريو',S.weekly===null);$('btnWeeklyBack').click();
    
    renderBench();ok('مقارنة بالسوق',$('benchBar').innerHTML.includes('السوق'));
    renderBackup();$('btnExp').click();
    ok('تصدير الحفظ',$('impTxt').value.includes('"assets"'));
    const day0x=S.day;$('btnImp').click();
    ok('استيراد الحفظ',S.day===day0x);
    
    let crash=null;
    try{for(let i=0;i<150;i++){S.day++;endOfDay();}}catch(e){crash=String(e);}
    ok('جلسة طويلة ١٥٠ يوم بدون انهيار (ثروة نهائية '+fmtD(netWorth())+')',crash===null);
    ok('قيم مالية سليمة بعد الجلسة',isFinite(netWorth())&&isFinite(S.cash)&&!isNaN(S.dep));
    ok('السوق حي بعد الجلسة',Object.keys(S.assets).filter(k=>S.assets[k].kind==='stock').length>=10);
    
    const sd0=S.day;$('btnSkipDay').click();
    ok('زر تخطي اليوم',S.day===sd0+1&&S.hour===0);
    
    renderEconCal();
    const evs=econEvents();
    ok('تقويم اقتصادي يعمل',$('econCal').innerHTML.includes('موسم الأرباح')&&evs.length>=3);
    ok('ترتيب التقويم صحيح',evs.every((e,i)=>i===0||evs[i-1].d<=e.d));
    
    const nwH0=S.nwHist.slice(),dayH0=S.day;
    S.day=7;renderHF();
    ok('بطاقة الصندوق تعرض',$('hfBody').innerHTML.length>10);
    S.hf={on:true,capital:250000,hwm:250000,fees:0,streak:0};
    const nwNowH=netWorth(),cashH0=S.cash;
    S.nwHist=[nwNowH*0.95,nwNowH*0.9];endOfDay();
    ok('رسوم أداء الصندوق اتخصمت',S.hf.fees>0&&S.cash>cashH0);
    ok('HWM اتحدث',Math.abs(S.hf.hwm-S.hf.capital)<1);
    const capH0=S.hf.capital;
    S.nwHist=[nwNowH*0.5,netWorth()/0.9];S.hf.streak=2;
    endOfDay();
    ok('سحب المستثمرين بعد ٣ خسارات',S.hf.capital<capH0*0.75&&S.hf.streak===0);
    S.hf={on:false,capital:0,hwm:0,fees:0,streak:0};S.nwHist=nwH0;S.day=dayH0;
    
    if(S.company){
      const cc=S.company;
      cc.workers=60;cc.cash=400000;cc.morale=60;cc.wage=1;cc.staff={eng:0,sales:0,mkt:0};cc.quality=30;
      renderHR();
      ok('بطاقة فريق العمل تعرض',$('hrBody').innerHTML.includes('رضا الفريق')&&!!$('sWage'));
      const cashS=cc.cash;hireStaff('eng');
      ok('تعيين مهندس جودة',cc.staff.eng===1&&cc.cash===cashS-12000);
      hireStaff('eng');
      ok('ترقية المهندس للمستوى ٢',cc.staff.eng===2&&cc.cash===cashS-36000);
      const cashL=cc.cash;hireStaff('sales');hireStaff('mkt');
      ok('تعيين مبيعات وتسويق',cc.staff.sales===1&&cc.staff.mkt===1&&cc.cash<cashL);
      ok('رواتب الإدارة محسوبة',staffCost(cc)===180*2+220+150);
      cc.morale=50;cc.wage=1.5;cc.workers=60;
      for(let i=0;i<25;i++){cc.workers=60;runCompany();}
      ok('رفع الرواتب يرفع الرضا',cc.morale>70);
      cc.morale=55;cc.wage=0.6;cc.workers=200;cc.staff={eng:0,sales:0,mkt:0};cc.cash=400000;
      for(let i=0;i<40;i++)runCompany();
      ok('الرواتب المنخفضة تخفض الرضا',cc.morale<35);
      ok('استقالات عند الرضا المنخفض',cc.workers<200);
      const R0=RNG;RNG=()=>0.5;
      cc.strike=null;
      cc.workers=60;cc.staff={eng:0,sales:0,mkt:0};cc.wage=1;cc.price=40;cc.quality=40;cc.rd=0;cc.marketing=0;cc.morale=60;
      runCompany();const soldBase=cc.todaySold;
      cc.morale=100;runCompany();const soldHi=cc.todaySold;
      cc.morale=0;runCompany();const soldLo=cc.todaySold;
      cc.morale=60;cc.strike=null;cc.staff={eng:0,sales:3,mkt:0};runCompany();const soldMgr=cc.todaySold;
      cc.staff={eng:0,sales:0,mkt:0};cc.quality=40;const qA=cc.quality;runCompany();const qNoEng=cc.quality-qA;
      cc.quality=40;cc.staff={eng:3,sales:0,mkt:0};const qB=cc.quality;runCompany();const qEng=cc.quality-qB;
      RNG=R0;
      ok('الرضا العالي يرفع المبيعات',soldHi>soldLo&&soldBase>soldLo);
      ok('مدير المبيعات يرفع الطلب',soldMgr>soldLo);
      ok('مهندس الجودة يرفع الجودة أسرع',qEng>qNoEng);
      
      cc.morale=10;cc.wage=0.7;cc.workers=60;cc.cash=200000;cc.strike=null;cc.staff={eng:0,sales:0,mkt:0};cc.quality=40;
      let RS=RNG;RNG=()=>0.01;runCompany();RNG=RS;
      ok('إضراب يبدأ عند رضا منخفض',!!cc.strike&&cc.strike.asked>=90);
      RNG=()=>0.5;
      cc.morale=60;cc.price=40;cc.rd=0;cc.marketing=0;cc.staff={eng:0,sales:0,mkt:0};
      cc.strike=null;runCompany();const sNo=cc.todaySold;
      cc.strike={days:1,asked:120};runCompany();const sYes=cc.todaySold;
      RNG=RS;
      ok('الإضراب يقلل الطلب',sNo>sYes);
      cc.strike={days:1,asked:120};cc.wage=0.7;cc.morale=20;
      strikeAccept();
      ok('قبول المطلب يرفع الرواتب',cc.wage===1.2&&!cc.strike&&cc.morale>20);
      cc.strike={days:1,asked:140};cc.wage=1;cc.morale=40;cc.quality=50;cc.workers=60;
      const cashR=cc.cash;strikeReject();
      ok('رفض الإضراب بتعيين بدلاء',!cc.strike&&cc.cash===cashR-9000&&Math.round(cc.quality)===45);
      cc.strike={days:0,asked:120};cc.morale=50;cc.wage=1;cc.cash=400000;
      for(let i=0;i<5;i++)runCompany();
      ok('الإضراب ينتهي تلقائيًا بعد ٥ أيام',!cc.strike);
      cc.strike={days:2,asked:130};renderHR();
      ok('لافتة الإضراب تظهر في البطاقة',$('hrBody').innerHTML.includes('إضراب عمالي'));
      cc.strike=null;cc.wage=1;cc.morale=60;renderHR();
      
      cc.hist=[];cc.workers=60;cc.cash=400000;cc.morale=60;cc.wage=1;cc.staff={eng:0,sales:0,mkt:0};
      for(let i=0;i<5;i++)runCompany();
      ok('سجل الأداء يتجمع',cc.hist.length===5&&typeof cc.hist[4].r==='number'&&typeof cc.hist[4].s==='number');
      for(let i=0;i<100;i++)runCompany();
      ok('سجل الأداء محدود بـ٩٠ يوم',cc.hist.length===90);
      renderPerf();
      ok('لوحة الأداء تعرض مؤشرات',$('perfKpis').innerHTML.includes('هامش الربح')&&$('perfKpis').innerHTML.includes('إنتاجية العامل'));
      ok('رسوم الأداء موجودة',!!$('perfChart')&&!!$('perfSold')&&$('perfCmp').innerHTML.includes('أيام مسجلة'));
      const keepP=S.company;
      S.company={name:'قديمة٢',sector:'تقنية',cash:1000,price:40,rd:0,marketing:0,workers:10,quality:10,track:[]};
      migrate();ok('ترحيل يضيف سجل الأداء',Array.isArray(S.company.hist));S.company=keepP;
      
      cc.cash=500000;cc.up=cc.up||{line:0,auto:0,brand:0};cc.workers=60;cc.quality=40;
      S.acq={list:genAcq(),next:S.day+12};
      ok('قائمة استحواذ تتولد',S.acq.list.length===3&&S.acq.list.every(t=>t.offer>0));
      renderAcq();ok('بطاقة الاستحواذ تعرض',$('acqBody').innerHTML.includes('استحوذ'));
      cc.cash=100;buyAcq(0);
      ok('استحواذ بدون كاش مرفوض',S.acq.list[0].done===false&&cc.cash===100);
      const R3=RNG;RNG=()=>0.01;cc.cash=500000;const line0=cc.up.line,w0=cc.workers;
      buyAcq(0);RNG=R3;
      ok('استحواذ ناجح يوسّع الشركة',S.acq.list[0].done&&cc.up.line>line0&&cc.workers>w0&&cc.cash<500000);
      RNG=()=>0.99;const cashF=cc.cash;const feeExp=Math.round(S.acq.list[1].offer*0.03);
      buyAcq(1);RNG=R3;
      ok('صفقة فاشلة تخصم رسوم ٣٪',S.acq.list[1].done&&Math.abs((cashF-cc.cash)-feeExp)<=1);
      const cQ=cc.cash;buyAcq(0);
      ok('لا إعادة شراء لصفقة منتهية',cc.cash===cQ);
      S.day=S.acq.next;const nx0=S.acq.next;endOfDay();
      ok('عرض استحواذ جديد يتولد',S.acq.next===nx0+12&&S.acq.list.every(t=>!t.done));
      
      cc.cash=300000;cc.campaign=null;cc.brand=10;
      renderBrand();ok('بطاقة العلامة تعرض',$('brandBody').innerHTML.includes('قيمة العلامة التجارية'));
      cc.cash=1000;startCamp('social');
      ok('حملة بدون كاش مرفوض',cc.campaign===null&&cc.cash===1000);
      cc.cash=300000;startCamp('social');
      ok('حملة تبدأ وتخصم الميزانية',cc.campaign&&cc.campaign.left===6&&cc.cash===285000);
      startCamp('tv');
      ok('حملة واحدة في نفس الوقت',cc.campaign.k==='social');
      const Rb=RNG;RNG=()=>0.5;
      for(const kk in S.assets){if(S.assets[kk].kind==='stock')S.assets[kk].sent=0;}
      cc.workers=60;cc.price=200;cc.quality=40;cc.rd=0;cc.marketing=0;cc.staff={eng:0,sales:0,mkt:0};cc.strike=null;cc.morale=60;
      cc.campaign=null;cc.brand=10;runCompany();const sPlain=cc.todaySold;
      cc.campaign={k:'tv',n:'حملة تلفزيونية',ic:'📺',left:5,boost:0.35};cc.brand=10;runCompany();const sCamp=cc.todaySold;
      RNG=Rb;
      ok('الحملة ترفع الطلب',sCamp>sPlain);
      cc.campaign={k:'social',n:'حملة سوشيال',ic:'📱',left:1,boost:0.15};
      runCompany();
      ok('الحملة تنتهي بعد مدتها',cc.campaign===null);
      cc.brand=10;cc.crisis=null;cc.campaign={k:'tv',n:'حملة',ic:'📺',left:5,boost:0.35};runCompany();
      ok('العلامة تكبر أثناء الحملة',cc.brand>10);
      cc.campaign=null;cc.brand=100;for(let i=0;i<3;i++)runCompany();
      ok('العلامة محصورة ٠-١٠٠',cc.brand<=100&&cc.brand>=0);
      
      cc.crisis=null;cc.rep=50;cc.cash=300000;cc.quality=40;cc.morale=60;
      renderRep();ok('بطاقة السمعة تعرض',$('repBody').innerHTML.includes('سمعة الشركة'));
      startCrisis();
      ok('أزمة سمعة تبدأ',!!cc.crisis&&cc.crisis.left===4);
      renderRep();ok('لافتة الأزمة تظهر',$('repBody').innerHTML.includes('تجاهل'));
      cc.cash=1000;crisisRespond('comp');
      ok('تعويضات بدون كاش مرفوض',!!cc.crisis&&cc.cash===1000);
      cc.cash=300000;const rep0=cc.rep;crisisRespond('comp');
      ok('التعويضات تنهي الأزمة وترفع السمعة',!cc.crisis&&cc.rep>rep0&&cc.cash===280000);
      startCrisis();const rep1=cc.rep;crisisRespond('apology');
      ok('الاعتذار ينهي الأزمة بتكلفة أقل',!cc.crisis&&cc.cash===275000&&cc.rep>rep1-1);
      startCrisis();crisisRespond('ignore');
      ok('التجاهل يبقي الأزمة شغالة',!!cc.crisis);
      for(let i=0;i<4;i++)runCompany();
      ok('الأزمة تنتهي تلقائيًا بخصم سمعة',!cc.crisis&&cc.rep<rep1+20);
      const Rc=RNG;RNG=()=>0.5;
      for(const kk in S.assets){if(S.assets[kk].kind==='stock')S.assets[kk].sent=0;}
      cc.workers=60;cc.price=200;cc.quality=40;cc.rd=0;cc.marketing=0;cc.staff={eng:0,sales:0,mkt:0};cc.strike=null;cc.morale=60;cc.campaign=null;cc.brand=10;cc.rep=50;cc.crisis=null;
      runCompany();const sOk=cc.todaySold;
      cc.crisis={n:'أزمة',d:'اختبار',left:3,hit:0.8};runCompany();const sBad=cc.todaySold;
      cc.crisis=null;cc.rep=100;runCompany();const sRep=cc.todaySold;
      cc.rep=0;runCompany();const sRepLow=cc.todaySold;
      RNG=Rc;
      ok('الأزمة تقلل الطلب',sOk>sBad);
      ok('السمعة العالية ترفع الطلب',sRep>sRepLow);
      cc.rep=50;cc.crisis=null;cc.brand=10;renderRep();
      
      cc.inv=invDef();cc.cash=200000;cc.workers=60;cc.crisis=null;
      renderInv();ok('بطاقة المخزون تعرض',$('invBody').innerHTML.includes('المخزون'));
      const u0=cc.inv.units;runCompany();
      ok('الإنتاج يزيد المخزون',cc.inv.units>u0-1000&&cc.inv.units>=0);
      const cashI=cc.cash;orderStock(1500);
      ok('طلب شحنة يخصم التكلفة',cc.inv.order&&cc.inv.order.left===3&&cc.cash===cashI-4500);
      orderStock(500);
      ok('شحنة واحدة في الطريق',cc.inv.order.units===1500);
      const uBefore=cc.inv.units;
      for(let i=0;i<3;i++)runCompany();
      ok('الشحنة توصل بعد ٣ أيام',cc.inv.order===null&&cc.inv.units>uBefore-2000);
      cc.inv.units=0;cc.inv.cap=6000;cc.inv.order=null;cc.workers=10;cc.price=5;cc.staff={eng:0,sales:0,mkt:0};cc.campaign=null;cc.crisis=null;
      RNG=()=>0.5;runCompany();RNG=Rc;
      ok('نفاد المخزون يسبب مبيعات فائتة',cc.inv.missed>0&&cc.inv.stockDays>=1);
      cc.inv.units=0;cc.inv.auto=true;cc.cash=200000;
      runCompany();
      ok('إعادة الطلب التلقائي تشتغل',!!cc.inv.order&&cc.inv.auto);
      const capI=cc.inv.cap;cc.cash=200000;upgradeWarehouse();
      ok('توسيع المخزن يرفع السعة',cc.inv.cap===capI+4000);
      cc.inv=invDef();cc.inv.auto=false;renderInv();
      
      cc.morale=85;cc.quality=80;cc.brand=70;cc.rep=75;cc.inv.units=2500;
      const hsGood=healthScore();
      cc.morale=20;cc.quality=10;cc.brand=5;cc.rep=15;cc.inv.units=0;
      const hsBad=healthScore();
      ok('صحة الشركة تُحسب',$('healthBody')&&hsGood.score>hsBad.score&&hsBad.score>=0&&hsGood.score<=100);
      renderHealth();ok('لوحة الصحة تعرض',$('healthBody').innerHTML.includes('صحة الشركة'));
      cc.quality=10;cc.morale=20;renderHealth();
      ok('تحذيرات تظهر عند تدهور المؤشرات',$('healthBody').innerHTML.includes('تحذيرات'));
      cc.morale=85;cc.quality=80;cc.brand=70;cc.rep=75;cc.inv.units=2500;
      cc.hist=[1,2,3,4,5,6].map(x=>({r:1000,p:x*1000,s:10,m:60}));
      renderHealth();
      ok('رسالة الأمان تظهر عند المؤشرات الجيدة',$('healthBody').innerHTML.includes('كل المؤشرات'));
      
      cc.inv=invDef();cc.workers=60;cc.crisis=null;cc.strike=null;cc.morale=60;cc.price=200;
      cc.staff={eng:0,sales:0,mkt:0};cc.campaign=null;
      const uS0=cc.inv.units;runCompany();const prodNo=cc.inv.units-uS0;
      cc.inv.units=1000;cc.strike={days:1,asked:120};
      const uS1=cc.inv.units;runCompany();const prodStr=cc.inv.units-uS1;
      cc.strike=null;
      ok('الإضراب يقلل الإنتاج',prodStr<prodNo&&prodNo>0);
      
      cc.inv.units=0;cc.inv.order=null;cc.workers=10;cc.price=5;cc.brand=50;cc.rep=60;cc.crisis=null;cc.campaign=null;
      const b0=cc.brand,r0=cc.rep;
      RNG=()=>0.5;runCompany();RNG=Rc;
      ok('النفاد يخصم العلامة والسمعة',cc.brand<b0&&cc.rep<r0);
      cc.inv=invDef();cc.workers=60;cc.price=40;renderAll();
      
      S.corp=null;initCorp();
      ok('شركات المنافسة تتولد',S.corp.length===5&&S.corp.every(c=>c.rep>=0&&c.rep<=100&&c.value>0));
      const rowsC=corpRows();
      ok('الترتيب يشمل شركتي',rowsC.length===6&&rowsC.some(r=>r.me));
      ok('الترتيب مرتّب تنازليًا',rowsC.every((r,i)=>i===0||rowsC[i-1].score>=r.score));
      cc.track=new Array(365).fill(20000);cc.lastYearProfit=365*20000;cc.quality=100;cc.cash=5000000;cc.rep=100;cc.brand=100;
      const rowsTop=corpRows();
      ok('شركة قوية تتصدر الترتيب',rowsTop[0].me===true);
      renderCorp();ok('بطاقة الترتيب تعرض',$('corpBody').innerHTML.includes('الشركة'));
      ok('رسالة الصدارة تظهر',$('corpBody').innerHTML.includes('رقم ١'));
      cc.lastYearProfit=0;cc.cash=1000;cc.quality=10;cc.rep=10;cc.brand=5;
      renderCorp();
      ok('رسالة الصعود لمركز أعلى تظهر',$('corpBody').innerHTML.includes('للصعود مركزًا'));
      const snap=S.corp.map(c=>c.value);
      [7,14,21].forEach(d=>{S.day=d;endOfDay();});
      ok('المنافسون بيتحركوا أسبوعيًا',S.corp.some((c,i)=>c.value!==snap[i]));
      
      S.corp=null;initCorp();S.contests=[];
      cc.cash=5000000;cc.track=new Array(365).fill(20000);cc.lastYearProfit=365*20000;cc.quality=100;cc.rep=100;cc.brand=95;
      const cashWin=cc.cash,brandWin=cc.brand;
      runContest();
      ok('شركة الأسبوع تمنح الجايزة',S.contests.length===1&&S.contests[0].me===true&&cc.cash===cashWin+30000&&cc.brand===brandWin+5);
      cc.cash=1000;cc.track=[];cc.lastYearProfit=0;cc.quality=5;cc.rep=5;cc.brand=5;
      const cashLose=cc.cash;runContest();
      ok('خسارة اللقب لا تمنح جايزة',S.contests.length===2&&S.contests[1].me===false&&cc.cash===cashLose);
      for(let i=0;i<10;i++)runContest();
      ok('سجل الأبطال محدود بـ٨',S.contests.length===8);
      const ms=marketShare();
      ok('حصة السوق تُحسب',ms.mine>=0&&ms.mine<=100&&ms.total>0);
      renderCorp();
      ok('حصة السوق تظهر في البطاقة',$('corpBody').innerHTML.includes('حصة السوق'));
      ok('سجل الأبطال يظهر',$('corpBody').innerHTML.includes('آخر أبطال الأسبوع'));
      S.day=7;endOfDay();
      ok('تحدي الأسبوع يشتغل مع الدورة الأسبوعية',S.contests[S.contests.length-1].w===1);
      S.corp=null;initCorp();renderCorp();
      const keepC=S.company;
      S.company={name:'قديمة',sector:'تقنية',cash:1000,price:40,rd:0,marketing:0,workers:10,quality:10,track:[]};
      migrate();
      ok('ترحيل الحفظ القديم يضيف حقول الفريق',S.company.morale===60&&S.company.wage===1&&S.company.staff&&S.company.staff.eng===0);
      S.company=keepC;
      const ph=new Set();for(let i=0;i<60;i++){S.day++;endOfDay();ph.add(S.macro.phase);}
      ok('دورة الاقتصاد تتنقل بين المراحل',ph.size>=2);
      ok('رضا الفريق محصور بين ٠ و١٠٠',S.company.morale>=0&&S.company.morale<=100);
      renderAll();
      ok('بطاقة الفريق ترسم في الواجهة',$('hrBody').innerHTML.length>50);
    }
    renderAll();
    save();ok('حفظ',!!localStorage.getItem('econLive1'));
    renderAll();refreshNewsUI();ok('رسم الواجهة',true);
  }catch(e){out.push('ERROR '+(e&&e.message));}
  const d=document.createElement('pre');d.id='testout';d.textContent=out.join('\n');document.body.appendChild(d);
  document.title=out.some(l=>l.startsWith('FAIL')||l.startsWith('ERROR'))?'TEST-FAIL':'TEST-OK';
  }
