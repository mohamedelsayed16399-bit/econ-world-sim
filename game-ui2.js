function renderCris(){
  const el=$('crisBody');if(!el)return;
  const C=crisOf();const c=S.company;
  if(!c){el.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  let h='';
  const a=C.act;
  if(a){
    const d=crisDaily(a,c);
    h+='<div style="border:1px solid '+(a.dir<0?'var(--dn)':'var(--up)')+';border-radius:12px;padding:9px;margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:13px"><b>'+a.ic+' '+a.n+'</b><span>متبقي '+a.left+' يوم</span></div>'+
      '<div style="font-size:12px;color:var(--dim);margin:3px 0">'+a.msg+' · أثر يومي <b style="color:'+(d>=0?'var(--up)':'var(--dn)')+'">'+(d>=0?'+':'')+fmtD(d)+'</b> · تراكمي '+fmtD(Math.round(a.sum))+'</div>';
    if(!a.resp){
      h+='<div class="tradeRow">'+Object.keys(CRIS_RESP).map(function(k){
        const r=CRIS_RESP[k];return '<button class="btnGhost" onclick="crisRespond(\''+k+'\')" '+(c.cash<r.cost?'disabled':'')+'>'+r.n+(r.cost?' ('+fmtD(r.cost)+')':'')+'</button>';
      }).join('')+'</div>';
    }else h+='<div style="font-size:12px;color:var(--up)">ردك: '+CRIS_RESP[a.resp].n+'</div>';
    h+='</div>';
  }else h+='<div style="font-size:12px;color:var(--dim);margin-bottom:8px">مفيش حدث دلوقتي — أقرب حدث بعد '+Math.max(0,C.next-S.day)+' يوم.</div>';
  if(C.hist.length)h+='<div style="font-size:11.5px;color:var(--dim);line-height:1.7">'+C.hist.slice(-4).reverse().map(function(x){return '• '+x.ic+' '+x.n+': '+(x.sum>=0?'+':'')+fmtD(x.sum)+' ('+CRIS_RESP[x.resp].n+')';}).join('<br>')+'</div>';
  el.innerHTML=h;
}

function dashData(){
  const c=S.company;
  const d={cash:S.cash,nw:netWorth(),items:[],income:0,cost:0};
  if(!c)return d;
  const bp=c.branchProfit||0;
  if(bp){d.items.push({n:'🌍 الفروع',v:bp});d.income+=bp;}
  const ra=c.rAcq||0;
  if(ra){d.items.push({n:'🦈 شركات مستحوذ عليها',v:ra});d.income+=ra;}
  if(S.smug&&S.smug.routes&&S.smug.routes.length){const sp=S.smug.routes.length*9000;d.items.push({n:'🕶️ التهريب (تقديري)',v:sp});d.income+=sp;}
  const b=S.bizins;
  if(b&&b.p){let pr=0;BIZINS.forEach(function(x){if(b.p[x.k])pr+=bizPrem(x);});if(pr){d.items.push({n:'🛡️ أقساط التأمين',v:-pr});d.cost+=pr;}}
  const t=S.tax;
  if(t&&t.due>0){d.items.push({n:'🧾 ضرائب مستحقة (إجمالي)',v:-Math.round(t.due)});}
  const w=(c.workers||0)*22*(c.wage||1);
  if(w){d.items.push({n:'👷 أجور العمال',v:-Math.round(w)});d.cost+=w;}
  d.rep=c.rep||0;d.workers=c.workers||0;d.value=companyValue();
  d.net=Math.round(d.income-d.cost);
  return d;
}
function renderDash(){
  const el=$('dashBody');if(!el)return;
  const c=S.company;
  if(!c){el.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا عشان تظهر إمبراطوريتك.</div>';}
  else{
    const d=dashData();
    let h='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:12.5px;margin-bottom:6px">'+
      '<div>كاش المحفظة: <b>'+fmtD(Math.round(d.cash))+'</b></div>'+
      '<div>صافي الثروة: <b>'+fmtD(Math.round(d.nw))+'</b></div>'+
      '<div>قيمة الشركة: <b>'+fmtD(Math.round(d.value))+'</b></div>'+
      '<div>صافي يومي جانبي: <b style="color:'+(d.net>=0?'var(--up)':'var(--dn)')+'">'+fmtD(d.net)+'</b></div></div>';
    h+=d.items.map(function(x){
      return '<div style="display:flex;justify-content:space-between;border-top:1px solid var(--line);padding:5px 0;font-size:12.5px"><span>'+x.n+'</span><b style="color:'+(x.v>=0?'var(--up)':'var(--dn)')+'">'+(x.v>=0?'+':'')+fmtD(Math.round(x.v))+'</b></div>';
    }).join('');
    el.innerHTML=h;
  }
  const cv=$('dashChart');
  if(cv&&S.nwHist&&S.nwHist.length>1&&typeof spark==='function'){try{spark(cv,S.nwHist.slice(-120));}catch(e){}}
}

function rIPOof(){
  if(!S.rIPO)S.rIPO={offers:[],next:6,listed:[],acquired:[]};
  const r=S.rIPO;
  if(!r.offers)r.offers=[];if(!r.listed)r.listed=[];if(!r.acquired)r.acquired=[];
  if(r.next==null)r.next=6;
  return r;
}
function rIPOspawn(){
  const r=rIPOof();
  if(!S.corp||!S.corp.length)return null;
  const used=r.offers.concat(r.listed).map(function(o){return o.i;});
  const free=[];S.corp.forEach(function(cp,i){if(used.indexOf(i)<0)free.push(i);});
  if(!free.length)return null;
  const i=free[Math.floor(RNG()*free.length)];
  const cp=S.corp[i];if(!cp)return null;
  const shares=1000;
  const price=Math.max(20,Math.round(cp.value*0.9/shares));
  const o={i:i,name:cp.n,price:price,shares:shares,left:Math.round(shares*0.6),close:S.day+4,held:0,listed:false};
  r.offers.push(o);r.next=S.day+14;
  pushNews(S,'📢 "'+cp.n+'" تعلن طرح '+o.left+' سهم للاكتتاب بسعر '+fmtD(price)+' للسهم',0.004,false,true);
  toast('📢 طرح جديد: "'+cp.n+'" — '+fmtD(price)+'/سهم');
  return o;
}
function rIPOsub(i,qty){
  const r=rIPOof();const o=r.offers[i];
  if(!o||o.listed)return false;
  qty=Math.max(1,Math.round(qty));
  if(qty>o.left)qty=o.left;
  const cost=o.price*qty;
  if(S.cash<cost)return false;
  S.cash-=cost;o.left-=qty;o.held=(o.held||0)+qty;
  toast('📝 اكتتبت في "'+o.name+'": '+qty+' سهم بـ'+fmtD(cost));
  if(typeof renderRIPO==='function')renderRIPO();
  return true;
}
function rIPOlist(i){
  const r=rIPOof();const o=r.offers[i];if(!o)return false;
  const key='س:'+o.name;
  if(!S.assets[key])S.assets[key]={kind:'stock',name:o.name,sector:'صناعة',price:o.price,base:o.price,vol:0.03,sent:0,trend:0,hist:[o.price],held:0,avg:o.price,short:0,shortAvg:0,div:0.006};
  S.assets[key].held=(S.assets[key].held||0)+(o.held||0);
  if(!S.assets[key].avg)S.assets[key].avg=o.price;
  o.listed=true;
  r.listed.push({i:o.i,name:o.name,key:key,held:S.assets[key].held||0,shares:o.shares,price:o.price,day:S.day});
  r.offers.splice(i,1);
  pushNews(S,'🔔 "'+o.name+'" اتدرجت في البورصة بسعر '+fmtD(o.price)+' للسهم',0.006,true,true);
  toast('🔔 "'+o.name+'" اتدرجت — السهم متاح للتداول دلوقتي');
  return true;
}
function rIPObuy(idx,qty){
  const r=rIPOof();const L=r.listed[idx];if(!L)return false;
  const a=S.assets[L.key];if(!a)return false;
  qty=Math.max(1,Math.round(qty));
  const cost=+(a.price*qty).toFixed(2);
  if(S.cash<cost)return false;
  S.cash-=cost;a.held=(a.held||0)+qty;
  a.avg=((a.avg||0)*(a.held-qty)+cost)/Math.max(1,a.held);
  L.held=a.held;
  if(typeof renderRIPO==='function')renderRIPO();
  return true;
}
function rIPOsell(idx,qty){
  const r=rIPOof();const L=r.listed[idx];if(!L)return false;
  const a=S.assets[L.key];if(!a)return false;
  qty=Math.min(Math.max(1,Math.round(qty)),a.held||0);
  if(qty<1)return false;
  const gain=+(a.price*qty).toFixed(2);
  S.cash+=gain;a.held-=qty;L.held=a.held;
  toast('💵 بعت '+qty+' سهم "'+L.name+'" بـ'+fmtD(gain));
  if(typeof renderRIPO==='function')renderRIPO();
  return true;
}
function rIPOtakeover(idx){
  const r=rIPOof();const L=r.listed[idx];if(!L)return false;
  const a=S.assets[L.key];if(!a)return false;
  const stake=(a.held||0)/L.shares;
  if(stake<0.51)return false;
  const cost=Math.round(a.price*(L.shares-(a.held||0))*1.3);
  if(S.cash<cost)return false;
  S.cash-=cost;
  const daily=Math.round(0.0008*((S.corp[L.i]&&S.corp[L.i].n===L.name)?S.corp[L.i].value:400000));
  r.acquired.push({name:L.name,daily:daily});
  if(S.corp&&S.corp[L.i]&&S.corp[L.i].n===L.name)S.corp.splice(L.i,1);
  r.listed.splice(idx,1);
  delete S.assets[L.key];
  pushNews(S,'🦈 استحوذت على "'+L.name+'" من البورصة — دخل يومي '+fmtD(daily),0.03,true,true);
  toast('🦈 استحوذت على "'+L.name+'"! دخل يومي '+fmtD(daily));
  beep(1300,.25);
  if(typeof renderRIPO==='function')renderRIPO();
  return true;
}
function rIPTick(){
  const r=rIPOof();
  if(S.day>=r.next&&r.offers.length<2)rIPOspawn();
  for(let i=r.offers.length-1;i>=0;i--){if(S.day>=r.offers[i].close)rIPOlist(i);}
  r.listed.forEach(function(L){
    const a=S.assets[L.key];if(!a)return;
    const cp=S.corp?S.corp[L.i]:null;
    const fair=(cp&&cp.n===L.name)?Math.max(5,cp.value*0.95/L.shares):a.price;
    const pull=(fair-a.price)/Math.max(1,a.price);
    const drift=Math.max(-0.12,Math.min(0.12,pull*0.4))+rnd(-0.03,0.03);
    a.price=Math.max(0.5,+(a.price*(1+drift)).toFixed(2));
    a.hist.push(a.price);if(a.hist.length>240)a.hist.shift();
    L.price=a.price;L.held=a.held||0;
  });
}
function renderRIPO(){
  const el=$('rIPObody');if(!el)return;
  const r=rIPOof();
  let h='';
  if(r.offers.length){
    h+=r.offers.map(function(o,i){
      const left=Math.max(0,o.close-S.day);
      return '<div style="border:1px solid var(--line);border-radius:12px;padding:9px;margin-bottom:7px">'+
        '<div style="display:flex;justify-content:space-between;font-size:13px"><b>'+o.name+'</b><span>'+fmtD(o.price)+'/سهم</span></div>'+
        '<div style="font-size:11.5px;color:var(--dim);margin:3px 0 6px">متاح '+o.left+' من '+o.shares+' سهم · يقفل بعد '+left+' يوم · مكتتبت '+(o.held||0)+'</div>'+
        '<div class="tradeRow"><button class="btnGhost" onclick="rIPOsub('+i+',10)">اكتتب ١٠</button>'+
        '<button class="btnGhost" onclick="rIPOsub('+i+',50)">اكتتب ٥٠</button>'+
        '<button class="btnGhost" onclick="rIPOsub('+i+',100)">اكتتب ١٠٠</button></div></div>';
    }).join('');
  }else{
    h+='<div style="font-size:12px;color:var(--dim);margin-bottom:8px">مفيش طرح مفتوح دلوقتي — أقرب طرح بعد '+Math.max(0,(r.next||S.day)-S.day)+' يوم.</div>';
  }
  if(r.listed.length){
    h+='<div style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px">'+r.listed.map(function(L,i){
      const a=S.assets[L.key]||{price:L.price,held:L.held||0};
      const stake=Math.round((a.held||0)/L.shares*100);
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px;padding:5px 0;flex-wrap:wrap">'+
        '<span><b>'+L.name+'</b> <span style="color:var(--dim)">'+fmtD(a.price)+' · حصتك '+stake+'٪</span></span>'+
        '<span><button class="btnGhost" onclick="rIPObuy('+i+',10)">اشترِ ١٠</button> '+
        '<button class="btnGhost" onclick="rIPOsell('+i+',10)">بيع ١٠</button> '+
        (stake>=51?'<button class="btnGhost" onclick="rIPOtakeover('+i+')" style="border-color:var(--gold);color:var(--gold)">🦈 استحواذ</button>':'')+
        '</span></div>';
    }).join('')+'</div>';
  }
  if(r.acquired.length){
    const tot=r.acquired.reduce(function(x,y){return x+y.daily;},0);
    h+='<div style="margin-top:8px;font-size:11.5px;color:var(--up);line-height:1.7">🏛️ إمبراطوريتك: '+r.acquired.map(function(x){return x.name;}).join(' · ')+' — دخل يومي '+fmtD(tot)+'</div>';
  }
  el.innerHTML=h;
}

const BIZINS=[
  {k:'ops',n:'الأزمات والإضرابات',ic:'🛡️',prem:1200,cover:0.7},
  {k:'tax',n:'الفحص الضريبي',ic:'🧾',prem:900,cover:0.6},
  {k:'cargo',n:'الشحنات والتهريب',ic:'🚚',prem:700,cover:0.5}
];
function bizOf(){
  if(!S.bizins)S.bizins={p:{},paid:0,claims:0,trust:50,log:[],premPaid:0};
  const b=S.bizins;
  if(!b.p)b.p={};if(b.paid==null)b.paid=0;if(b.claims==null)b.claims=0;
  if(b.trust==null)b.trust=50;if(!b.log)b.log=[];if(b.premPaid==null)b.premPaid=0;
  return b;
}
function bizPrem(pol){
  const b=bizOf();
  const disc=Math.max(-0.25,Math.min(0.2,(b.trust-50)/250));
  return Math.max(100,Math.round(pol.prem*(1-disc)));
}
function bizToggle(k){
  const c=S.company;if(!c)return false;
  const pol=BIZINS.filter(function(x){return x.k===k;})[0];if(!pol)return false;
  const b=bizOf();
  b.p[k]=!b.p[k];
  toast(b.p[k]?'🛡️ فعّلت بوليصة '+pol.n+' ('+fmtD(bizPrem(pol))+'/يوم)':'⏹️ ألغيت بوليصة '+pol.n);
  if(typeof renderBizins==='function')renderBizins();
  return true;
}
function bizClaim(kind,amount){
  const b=bizOf();
  const pol=BIZINS.filter(function(x){return x.k===kind;})[0];
  if(!pol||!b.p[kind]||!(amount>0))return 0;
  const back=Math.round(amount*pol.cover);
  b.paid+=back;b.claims=(b.claims||0)+1;
  b.trust=Math.max(0,b.trust-1.5);
  b.log.push({d:S.day,k:kind,t:back});
  if(b.log.length>12)b.log.shift();
  toast(pol.ic+' التأمين غطّى '+fmtD(back)+' من '+fmtD(Math.round(amount)));
  if(typeof renderBizins==='function')renderBizins();
  return back;
}
function bizTick(c){
  const b=bizOf();
  let total=0;
  BIZINS.forEach(function(pol){if(b.p[pol.k])total+=bizPrem(pol);});
  if(total>0){
    if(c.cash>=total){c.cash-=total;b.premPaid+=total;b.trust=Math.min(100,b.trust+0.15);}
    else{
      BIZINS.forEach(function(pol){b.p[pol.k]=false;});
      pushNews(S,'⚠️ بوليصات التأمين التجاري لـ"'+c.name+'" اتلغت — الكاش مش كافي للأقساط',-0.004,true,true);
      toast('⚠️ التأمين التجاري اتلغى — الكاش مش كافي');
    }
  }else if(b.trust<100){b.trust=Math.min(100,b.trust+0.15);}
}
function renderBizins(){
  const el=$('bizinsBody');if(!el)return;
  const c=S.company;
  const b=bizOf();
  if(!c){el.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا عشان تأمّن على شغلك.</div>';return;}
  let daily=0;
  BIZINS.forEach(function(pol){if(b.p[pol.k])daily+=bizPrem(pol);});
  const col=b.claims>3?'var(--dn)':b.claims>0?'var(--gold)':'var(--up)';
  let h='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12.5px;margin-bottom:6px">'+
    '<div>قسط يومي: <b>'+fmtD(daily)+'</b></div>'+
    '<div>تعويضات: <b style="color:var(--up)">'+fmtD(b.paid||0)+'</b></div>'+
    '<div>ثقة التأمين: <b style="color:'+col+'">'+Math.round(b.trust)+'٪</b></div></div>';
  h+=BIZINS.map(function(pol){
    const on=!!b.p[pol.k];
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;flex-wrap:wrap">'+
      '<span>'+pol.ic+' <b>'+pol.n+'</b> <span style="color:var(--dim)">تغطية '+Math.round(pol.cover*100)+'٪ · '+fmtD(bizPrem(pol))+'/يوم</span></span>'+
      '<button class="btnGhost" onclick="bizToggle(\''+pol.k+'\')" style="'+(on?'border-color:var(--up);color:var(--up)':'')+'">'+(on?'✅ شغالة':'فعّل')+'</button></div>';
  }).join('');
  if(b.log.length)h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim);line-height:1.7">'+b.log.slice(-4).reverse().map(function(x){
    const pol=BIZINS.filter(function(p){return p.k===x.k;})[0];
    return '• يوم '+x.d+': '+(pol?pol.ic+' '+pol.n:'')+' غطّت '+fmtD(x.t);}).join('<br>')+'</div>';
  el.innerHTML=h;
}

const TAX_INC=0.22,TAX_VAT=0.14,TAX_CYCLE=10;
function taxOf(){
  if(!S.tax)S.tax={due:0,late:0,hidden:0,next:10,audits:0,filed:0,paid:0,sched:0,hide:false};
  const t=S.tax;
  if(t.due==null)t.due=0;if(t.late==null)t.late=0;if(t.hidden==null)t.hidden=0;
  if(t.next==null)t.next=10;if(t.audits==null)t.audits=0;if(t.filed==null)t.filed=0;
  if(t.paid==null)t.paid=0;if(t.sched==null)t.sched=0;if(t.hide==null)t.hide=false;
  return t;
}
function taxAccrue(c,revenue,profit){
  const t=taxOf();
  const raw=Math.max(0,revenue)*TAX_VAT+Math.max(0,profit)*TAX_INC;
  if(!(raw>0))return 0;
  const net=t.hide?raw*0.7:raw;
  t.due+=net;
  if(t.hide)t.hidden+=(raw-net);
  return net;
}
function taxPay(){
  const t=taxOf();const c=S.company;if(!c)return false;
  const amt=Math.round(t.due);if(amt<=0)return false;
  if(c.cash<amt)return false;
  c.cash-=amt;t.paid+=amt;t.due=0;t.sched=0;t.filed=(t.filed||0)+1;
  toast('🧾 سددت الإقرار الضريبي ('+fmtD(amt)+')');
  pushNews(S,'سددت "'+c.name+'" إقرارها الضريبي بقيمة '+fmtD(amt),0,false,true);
  if(typeof renderTax==='function')renderTax();
  return true;
}
function taxSplit(){
  const t=taxOf();const c=S.company;if(!c)return false;
  if(t.due<=0||t.sched>0)return false;
  t.sched=Math.ceil(t.due/5);
  toast('📆 اتقسّط المستحق على ٥ أيام ('+fmtD(t.sched)+' يوميًا)');
  if(typeof renderTax==='function')renderTax();
  return true;
}
function taxHideToggle(){
  const t=taxOf();const c=S.company;if(!c)return false;
  t.hide=!t.hide;
  toast(t.hide?'🕶️ سجّل ٣٠٪ أقل من مبيعاتك — المستحق قل والمخاطرة زادت':'✅ رجعت تسجل كل مبيعاتك');
  if(typeof renderTax==='function')renderTax();
  return true;
}
function taxSettle(){
  const t=taxOf();const c=S.company;if(!c||t.hidden<=0)return false;
  const amt=Math.round(t.hidden*0.3);
  if(c.cash<amt)return false;
  c.cash-=amt;t.paid+=amt;t.hidden=0;t.hide=false;
  toast('🤝 تسوية ذاتية: دفعت '+fmtD(amt)+' وسمحت صفحتك');
  if(typeof renderTax==='function')renderTax();
  return true;
}
function taxTick(c){
  const t=taxOf();
  if(t.sched>0&&t.due>0){
    const amt=Math.min(Math.round(t.sched),Math.round(t.due));
    if(c.cash>=amt){c.cash-=amt;t.due-=amt;t.paid+=amt;}
    else{t.late=(t.late||0)+1;}
    if(t.due<=0){t.due=0;t.sched=0;toast('✅ خلصت أقساط الإقرار الضريبي');}
  }
  if(S.day>=t.next){
    if(t.due>0.5){
      const pen=Math.round(t.due*0.03);
      t.due+=pen;t.late=(t.late||0)+1;
      if(t.late%2===1)toast('⚠️ الإقرار الضريبي اتأخر — غرامة '+fmtD(pen));
    }
    t.next=S.day+TAX_CYCLE;
  }
  const risk=t.hidden>0?(0.02+Math.min(0.5,t.hidden/2000000)):0;
  if(risk>0&&RNG()<risk){
    const fine=Math.round(t.hidden*0.9+Math.max(0,t.due)*0.2);
    const _tk=bizClaim('tax',fine);
    c.cash=Math.max(0,c.cash-(fine-_tk));c.rep=Math.max(0,(c.rep||50)-8);
    t.hidden=0;t.audits=(t.audits||0)+1;t.hide=false;
    pushNews(S,'🚨 فحص ضريبي على "'+c.name+'" — غرامة '+fmtD(fine)+' وسمعة -٨',-0.012,true,true);
    toast('🚨 فحص ضريبي! غرامة '+fmtD(fine)+' وسمعة -٨');
  }
}
function renderTax(){
  const el=$('taxBody');if(!el)return;
  const c=S.company;const t=taxOf();
  if(!c){el.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا عشان تظهر التزاماتك الضريبية.</div>';return;}
  const left=Math.max(0,t.next-S.day);
  const col=(t.due>0&&left<=2)?'var(--dn)':(t.hide?'var(--gold)':'var(--up)');
  let h='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12.5px;margin-bottom:6px">'+
    '<div>المستحق: <b style="color:'+col+'">'+fmtD(Math.round(t.due))+'</b></div>'+
    '<div>الإقرار الجاي: <b>'+left+' يوم</b></div>'+
    '<div>مدفوع: <b>'+fmtD(t.paid||0)+'</b></div>'+
    '<div>مخفي: <b style="color:'+(t.hidden>0?'var(--dn)':'var(--dim)')+'">'+fmtD(Math.round(t.hidden||0))+'</b></div>'+
    '<div>تأخير: <b>'+(t.late||0)+'</b></div>'+
    '<div>فحوصات: <b>'+(t.audits||0)+'</b></div></div>';
  h+='<div class="tradeRow">'+
    '<button class="btnGhost" onclick="taxPay()" '+(t.due<1?'disabled':'')+'>🧾 سدد الإقرار</button>'+
    '<button class="btnGhost" onclick="taxSplit()" '+((t.due<1||t.sched>0)?'disabled':'')+'>📆 قسّط ٥ أيام</button>'+
    '<button class="btnGhost" onclick="taxHideToggle()" style="'+(t.hide?'border-color:var(--gold);color:var(--gold)':'')+'">'+(t.hide?'🕶️ مسجل أقل (شغال)':'🕶️ سجّل ٣٠٪ أقل')+'</button>'+
    (t.hidden>0?'<button class="btnGhost" onclick="taxSettle()">🤝 تسوية ذاتية</button>':'')+'</div>';
  if(t.hide||t.hidden>0)h+='<div style="font-size:11.5px;color:var(--gold);margin-top:6px;line-height:1.7">التسجيل الأقل بيخفّض المستحق ٣٠٪، بس بيبني «مبلغ مخفي» مصلحة الضرائب ممكن تكتشفه في فحص: غرامة ٩٠٪ من المخفي + سمعة -٨.</div>';
  el.innerHTML=h;
}
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
