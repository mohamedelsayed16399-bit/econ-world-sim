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
    kpi('رضا الفريق',Math.round(c.morale)+'%')+kpi('طاقم الإدارة',staffLevel(c)+'/15');
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
  const cost=Math.round(units*3);
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
    h+='<button class="btnGhost" onclick="orderStock('+n+')" '+(c.inv.order||c.cash<n*3?'disabled':'')+'>اطلب '+n+' ('+fmtD(n*3)+')</button>';
  });
  h+='</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'+
    '<button class="btnGhost" onclick="toggleAutoOrder()">'+(c.inv.auto?'🔁 إعادة طلب تلقائي: مفعّلة':'🔁 إعادة طلب تلقائي: متوقفة')+'</button>'+
    '<button class="btnGhost" onclick="upgradeWarehouse()" '+(c.cash<25000?'disabled':'')+'>🏭 توسيع المخزن (25.0 ألف د.)</button></div>';
  b.innerHTML=h;
}
const CRISES=[
 {n:'تسريب شكاوى جودة',d:'عملاء نشروا صور منتجات معيبة على السوشيال',hit:0.8},
 {n:'اتهام بغش في الإعلان',d:'جهة رقابية فتحت تحقيقًا في إحدى الحملات',hit:0.7},
 {n:'أزمة تصريح مدير',d:'تصريح مسيء من مدير تنفيذي أغضب المتابعين',hit:0.6},
 {n:'تأخر تسليم كبير',d:'دفعة كبيرة اتأخرت والاتهامات تطارد الشركة',hit:0.75}
];
function startCrisis(){
  const c=S.company;if(!c||c.crisis)return;
  const t=CRISES[Math.floor(RNG()*CRISES.length)];
  c.crisis={n:t.n,d:t.d,left:4,hit:t.hit};
  pushNews(S,'⚠️ أزمة سمعة لـ"'+c.name+'": '+t.n,-0.02,true,true);
  toast('⚠️ أزمة سمعة: '+t.n);
  renderRep();renderCompany();
}
function crisisRespond(kind){
  const c=S.company;if(!c||!c.crisis)return;
  if(c.rep==null)c.rep=50;
  if(kind==='ignore'){toast('اخترت التجاهل — الأزمة مستمرة');return;}
  const cost=kind==='comp'?20000:5000;
  if(c.cash<cost)return toast('❌ الخزينة لا تكفي ('+fmtD(cost)+')');
  c.cash-=cost;
  if(kind==='apology'){
    c.rep=Math.min(100,c.rep+3);c.brand=Math.max(0,(c.brand||10)-2);
    pushNews(S,'📄 "'+c.name+'" اعتذرت علنًا عن '+c.crisis.n+' — الأزمة انتهت',0.005,false,true);
    toast('📄 اعتذار علني — انتهت الأزمة');
  }else{
    c.rep=Math.min(100,c.rep+8);c.brand=Math.min(100,(c.brand||10)+1);
    pushNews(S,'💸 "'+c.name+'" عوّضت المتضررين في '+c.crisis.n+' — ثقة السوق عادت',0.012,false,true);
    toast('💸 تعويضات مدفوعة — السمعة ارتفعت');
  }
  S.achv.crisis=1;
  c.crisis=null;renderRep();renderCompany();
}
function renderRep(){
  const b=$('repBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  if(c.rep==null)c.rep=50;
  const r=Math.round(c.rep);
  const col=r>=60?'var(--up)':r>=35?'#f59e0b':'var(--dn)';
  let h='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0"><span>سمعة الشركة</span><b style="color:'+col+'">'+r+'/100</b></div>';
  h+='<div style="height:9px;background:var(--panel2);border-radius:6px;overflow:hidden;margin:4px 0 10px"><div style="height:100%;width:'+r+'%;background:'+col+'"></div></div>';
  if(c.crisis){
    h+='<div style="background:rgba(239,68,68,.12);border:1px solid var(--dn);border-radius:12px;padding:10px;margin-bottom:8px">'+
      '<div style="font-weight:700;color:var(--dn)">⚠️ '+c.crisis.n+' — باقي '+c.crisis.left+' يوم</div>'+
      '<div style="font-size:12.5px;color:var(--dim);margin:4px 0 8px">'+c.crisis.d+' · الطلب -'+Math.round(c.crisis.hit*30)+'% لحد ما تتحل</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
      '<button class="btnGhost" onclick="crisisRespond(\'apology\')">📄 اعتذار علني (5.0 ألف د.)</button>'+
      '<button class="btnGhost" onclick="crisisRespond(\'comp\')">💸 تعويضات (20.0 ألف د.)</button>'+
      '<button class="btnGhost" onclick="crisisRespond(\'ignore\')">🤐 تجاهل</button></div></div>';
  }else{
    h+='<div style="color:var(--dim);font-size:13px;padding:4px 0">لا توجد أزمة حاليًا. الأزمات بتيجي عشوائيًا وأكتر لو الجودة أو رضا الفريق واطي.</div>';
  }
  b.innerHTML=h;
}
const CAMPS=[
 {k:'social',n:'حملة سوشيال ميديا',ic:'📱',cost:15000,days:6,boost:0.15},
 {k:'tv',n:'حملة تلفزيونية',ic:'📺',cost:50000,days:10,boost:0.35},
 {k:'sponsor',n:'رعاية رياضية كبرى',ic:'🏟️',cost:120000,days:20,boost:0.6}
];
function startCamp(k){
  const c=S.company;if(!c)return toast('أسّس شركة أولًا');
  const d=CAMPS.find(x=>x.k===k);if(!d)return;
  if(c.campaign)return toast('عندك حملة شغّالة بالفعل');
  if(c.cash<d.cost)return toast('❌ خزينة الشركة لا تكفي ('+fmtD(d.cost)+')');
  c.cash-=d.cost;c.campaign={k:k,n:d.n,ic:d.ic,left:d.days,boost:d.boost};
  pushNews(S,'🎯 "'+c.name+'" أطلقت '+d.n+' بميزانية '+fmtD(d.cost),0.01,false,true);
  toast('🎯 بدأت '+d.n);
  renderBrand();renderCompany();
}
function renderBrand(){
  const b=$('brandBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا لتشغيل الحملات.</div>';return;}
  if(c.brand==null)c.brand=10;
  const br=Math.round(c.brand);
  const col=br>=60?'var(--up)':br>=30?'#f59e0b':'var(--dim)';
  let h='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0"><span>قيمة العلامة التجارية</span><b style="color:'+col+'">'+br+'/100</b></div>';
  h+='<div style="height:9px;background:var(--panel2);border-radius:6px;overflow:hidden;margin:4px 0 10px"><div style="height:100%;width:'+br+'%;background:'+col+'"></div></div>';
  if(c.campaign){
    h+='<div style="background:rgba(59,130,246,.12);border:1px solid var(--accent);border-radius:12px;padding:10px;margin-bottom:10px">'+
      '<b>'+c.campaign.ic+' '+c.campaign.n+'</b> — باقي '+c.campaign.left+' يوم<br>'+
      '<span style="color:var(--dim);font-size:12px">الطلب +'+Math.round(c.campaign.boost*100)+'% · العلامة بتكبر أسرع</span></div>';
  }
  CAMPS.forEach(d=>{
    h+='<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);flex-wrap:wrap">'+
      '<span>'+d.ic+' <b>'+d.n+'</b><br><span style="color:var(--dim);font-size:12px">'+fmtD(d.cost)+' · '+d.days+' يوم · طلب +'+Math.round(d.boost*100)+'%</span></span>'+
      '<button class="btnGhost" onclick="startCamp(\''+d.k+'\')" '+((c.campaign||c.cash<d.cost)?'disabled':'')+'>أطلق</button></div>';
  });
  b.innerHTML=h;
}
const ACQ_NAMES=['مصنع الواحة','شركة النور','مجموعة الدلتا','تقنيات المتوسط','مزارع النيل','شبكة الشروق','معامل الشفاء','أسواق الحرية'];
function genAcq(){
  const list=[];
  for(let i=0;i<3;i++){
    const idx=Math.floor(RNG()*COMPS.length);const c=COMPS[idx];
    const price=Math.round(c[2]*400*(1+RNG()*0.8)/1000)*1000;
    list.push({n:ACQ_NAMES[(idx*3+i)%ACQ_NAMES.length],sec:c[1],price:price,offer:Math.round(price*1.12),done:false});
  }
  return list;
}
function acqChance(){return 0.55+Math.min(0.3,companyValue()/1200000*0.3);}
function buyAcq(i){
  const c=S.company;if(!c)return toast('أسّس شركة أولًا');
  if(!S.acq)S.acq={list:[],next:5};
  const t=S.acq.list[i];if(!t||t.done)return;
  if(c.cash<t.offer)return toast('❌ خزينة الشركة لا تكفي ('+fmtD(t.offer)+')');
  if(RNG()<acqChance()){
    c.cash-=t.offer;c.up=c.up||{line:0,auto:0,brand:0};c.up.line+=0.25;
    c.workers+=Math.round(8+t.price/20000);
    c.quality=Math.min(100,c.quality+4);
    S.achv.acq=1;
    pushNews(S,'🏢 "'+c.name+'" استحوذت على "'+t.n+'" — توسّع في قطاع '+t.sec,0.015,true,true);
    toast('🏢 تم الاستحواذ على '+t.n+'!');
  }else{
    const fee=Math.round(t.offer*0.03);c.cash-=fee;
    pushNews(S,'❌ فشلت صفقة استحواذ "'+c.name+'" على "'+t.n+'" — رسوم '+fmtD(fee),-0.005,false,true);
    toast('❌ فشلت الصفقة — رسوم '+fmtD(fee));
  }
  t.done=true;renderAcq();renderCompany();renderPerf();
}
function renderAcq(){
  const b=$('acqBody');if(!b)return;
  if(!S.acq)S.acq={list:[],next:5};
  if(!S.acq.list.length)S.acq.list=genAcq();
  const c=S.company;const ch=Math.round(acqChance()*100);
  b.innerHTML=S.acq.list.map((t,i)=>{
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);flex-wrap:wrap">'+
      '<span>🏢 <b>'+t.n+'</b> <span style="color:var(--dim);font-size:12px">· '+t.sec+'</span><br><span style="color:var(--dim);font-size:12px">سعر الصفقة '+fmtD(t.offer)+' · فرصة نجاح '+ch+'%</span></span>'+
      (t.done?'<b style="color:var(--dim)">انتهت</b>':'<button class="btnGhost" onclick="buyAcq('+i+')" '+(!c||c.cash<t.offer?'disabled':'')+'>استحوذ</button>')+'</div>';
  }).join('')+'<div style="color:var(--dim);font-size:12px;margin-top:8px">عرض جديد بعد '+Math.max(0,S.acq.next-S.day)+' يوم</div>';
}
function renderHR(){
  const c=S.company;const b=$('hrBody');if(!c||!b)return;
  if(c.morale==null)c.morale=60;if(c.wage==null)c.wage=1;if(!c.staff)c.staff={eng:0,sales:0,mkt:0};
  const m=Math.round(c.morale);
  const face=m>=80?'😄':m>=55?'🙂':m>=35?'😐':'😠';
  const col=m>=55?'var(--up)':m>=35?'#f59e0b':'var(--dn)';
  let sb='';
  if(c.strike){
    sb+='<div style="background:rgba(239,68,68,.12);border:1px solid var(--dn);border-radius:12px;padding:10px;margin-bottom:10px">'+
      '<div style="font-weight:700;color:var(--dn);margin-bottom:4px">✊ إضراب عمالي — اليوم '+c.strike.days+' من 5</div>'+
      '<div style="font-size:12.5px;color:var(--dim);margin-bottom:8px">الإنتاج متوقف جزئيًا (الطلب -65%). المطلب: رواتب '+c.strike.asked+'%.</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btnGhost" onclick="strikeAccept()">✅ قبول ورفع الرواتب لـ'+c.strike.asked+'%</button>'+
      '<button class="btnGhost" onclick="strikeReject()">👷 رفض وتعيين بدلاء ('+fmtD(Math.round(c.workers*150))+')</button></div></div>';
  }
  const RW='display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:14px';
  let h='<div style="'+RW+'"><span>رضا الفريق '+face+'</span><b style="color:'+col+'">'+m+'%</b></div>';
  h=sb+h;
  h+='<div style="height:9px;background:var(--panel2);border-radius:6px;overflow:hidden;margin:6px 0 12px"><div style="height:100%;width:'+m+'%;background:'+col+'"></div></div>';
  h+='<div class="sliderRow"><label><span>مستوى الرواتب مقابل السوق</span><b>'+Math.round(c.wage*100)+'%</b></label><input type="range" id="sWage" min="60" max="160" step="5" value="'+Math.round(c.wage*100)+'"></div>';
  h+='<div style="'+RW+'"><span>فاتورة الأجور اليومية</span><b>'+fmtD(Math.round(c.workers*22*c.wage))+'</b></div>';
  h+='<div style="'+RW+'"><span>رواتب طاقم الإدارة</span><b>'+fmtD(staffCost(c))+'</b></div>';
  STAFF.forEach(x=>{
    const lv=c.staff[x.k]||0;const cost=x.base*(lv+1);
    const dots='●'.repeat(lv)+'○'.repeat(5-lv);
    h+='<div style="'+RW+';flex-wrap:wrap"><span>'+x.ic+' '+x.n+' <b style="color:var(--accent);letter-spacing:1px">'+dots+'</b><br><span style="color:var(--dim);font-size:12px">'+x.d+'</span></span>'+
      (lv>=5?'<b style="color:var(--up)">الحد الأقصى ✔</b>':'<button class="btnGhost" onclick="hireStaff(\''+x.k+'\')" '+(c.cash<cost?'disabled':'')+'>'+(lv?'ترقية':'تعيين')+' ('+fmtD(cost)+')</button>')+'</div>';
  });
  b.innerHTML=h;
  const w=$('sWage');
  if(w)w.oninput=()=>{S.company.wage=+w.value/100;renderHR();renderCompany();};
}
function renderPerf(){
  const c=S.company;const k=$('perfKpis');if(!c||!k)return;
  if(!c.hist)c.hist=[];
  const h=c.hist;
  const last=h[h.length-1]||{r:0,p:0,s:0,m:0};
  const margin=last.r>0?last.p/last.r*100:0;
  const prod=c.workers>0?last.s/c.workers:0;
  const w30=h.slice(-30);
  const avg=w30.length?w30.reduce((a,b)=>a+b.p,0)/w30.length:0;
  const n1=Math.min(7,h.length),n2=Math.min(7,Math.max(0,h.length-7));
  const a1=n1?h.slice(-n1).reduce((x,y)=>x+y.p,0)/n1:0;
  const b1=n2?h.slice(-n1-n2,-n1).reduce((x,y)=>x+y.p,0)/n2:0;
  const trend=b1!==0?((a1-b1)/Math.abs(b1)*100):0;
  k.innerHTML=kpi('هامش الربح',margin.toFixed(1)+'%')+kpi('إنتاجية العامل',prod.toFixed(1)+' وحدة')+
    kpi('متوسط ربح ٣٠ يوم',fmtD(Math.round(avg)))+kpi('اتجاه الربح',(trend>=0?'▲ +':'▼ ')+trend.toFixed(1)+'%');
  const cv=$('perfChart');if(cv&&h.length>1)spark(cv,h.slice(-60).map(x=>x.p));
  const sv=$('perfSold');if(sv&&h.length>1)spark(sv,h.slice(-60).map(x=>x.s));
  const cmp=$('perfCmp');
  if(cmp){
    let t='';
    if(S.rival){
      const mine=companyValue();const rv=Math.round(120000*S.rival.strength);
      t+='<div>⚔️ مقابل '+S.rival.name+': قيمة شركتك '+fmtD(mine)+' — تقدير قيمة المنافس '+fmtD(rv)+' '+(mine>=rv?'<b style="color:var(--up)">متقدم ✔</b>':'<b style="color:var(--dn)">متأخر</b>')+'</div>';
    }
    t+='<div style="color:var(--dim);margin-top:4px">أيام مسجلة: '+h.length+' / 90</div>';
    cmp.innerHTML=t;
  }
}
let secFilter=null;
function renderIdx(){
  const g=$('idxGrid');g.innerHTML='';
  SECTORS.forEach(sec=>{
    const h=S.sectorHist[sec];if(!h||h.length<2)return;
    const ch=(h[h.length-1]/h[0]-1)*100;
    const d=document.createElement('div');d.className='idx';
    d.innerHTML='<b>'+sec+'</b><span class="chg '+(ch>=0?'up':'dn')+'">'+(ch>=0?'▲':'▼')+' '+Math.abs(ch).toFixed(1)+'%</span>';
    const cv=document.createElement('canvas');cv.style.cssText='width:100%;height:24px;display:block;margin-top:4px';
    d.appendChild(cv);
    d.onclick=()=>{secFilter=(secFilter===sec?null:sec);renderMarket();renderIdx();};
    if(secFilter===sec)d.style.borderColor='var(--accent)';
    g.appendChild(d);
    spark(cv,h.slice(-96));
  });
}
const ACHV=[
 ['trade','📈','أول صفقة','نفّذ أول عملية تداول',()=>S.tx.length>0],
 ['profit','💰','أول ربح حقيقي','ثروتك تتجاوز ١٢٠ ألف',()=>netWorth()>=120000],
 ['halfm','🔥','نصف مليون','ثروتك تتجاوز ٥٠٠ ألف',()=>netWorth()>=500000],
 ['million','👑','مليونير','ثروتك تتجاوز مليون دينار',()=>netWorth()>=1e6],
 ['empire','🏰','إمبراطور','٥ ملايين دينار',()=>netWorth()>=5e6],
 ['legend','🌟','أسطورة السوق','٢٠ مليون دينار',()=>netWorth()>=2e7],
 ['founder','🏭','صاحب أعمال','أسّس شركتك الخاصة',()=>!!S.company],
 ['ipo','📢','اكتتاب عام','اطرح شركتك في البورصة',()=>S.company&&S.company.public],
 ['bear','🐻','دب السوق','اربح من صفقة شورت',()=>S.coveredProfit>1000],
 ['div','🎁','مستثمر نائم','استلم توزيعات أرباح ٥ مرات',()=>S.divCount>=5],
 ['banker','🏦','رجل البنك','وديعة تتجاوز ٥٠ ألف',()=>S.dep>=50000],
 ['spy','🕵️','الذئب','اشترِ ٣ معلومات مسرّبة',()=>S.tips>=3],
 ['old','📅','المخضرم','العب ١٠٠ يوم',()=>S.day>=100],
 ['champion','🏆','بطل التحدي','اكسب سباق المليون ضد المنافسين',()=>!!(S.achv&&S.achv.champion)],
 ['shark','🦈','قرش السوق','استحوذ على شركة منافسك',()=>!!(S.achv&&S.achv.shark)],
 ['hr','🧑‍💼','قائد فريق','رضا الفريق ٩٠٪ أو أكثر',()=>!!S.company&&S.company.morale>=90],
 ['staff','🎓','طاقم نخبة','طاقم الإدارة بمستوى ٩',()=>!!S.company&&staffLevel(S.company)>=9],
 ['strike','✊','مفاوض','أنهيت إضرابًا عماليًا',()=>!!(S.achv&&S.achv.strike)],
 ['acq','🏢','مستحوذ','استحوذت على شركة صغيرة',()=>!!(S.achv&&S.achv.acq)],
 ['crisis','🛡️','إدارة أزمة','عالجت أزمة سمعة',()=>!!(S.achv&&S.achv.crisis)],
];
function checkAchv(){
  ACHV.forEach(a=>{if(!S.achv[a[0]]&&a[4]()){S.achv[a[0]]=1;toast('🏅 إنجاز جديد: '+a[2]);}});
}
function renderAchv(){
  $('achvList').innerHTML=ACHV.map(a=>{
    const done=S.achv[a[0]];
    return '<div class="achv '+(done?'done':'dim')+'"><span class="ic">'+a[1]+'</span><span><b>'+a[2]+'</b><br><span style="color:var(--dim);font-size:12px">'+a[3]+'</span></span>'+(done?'<span style="margin-inline-start:auto;color:var(--up)">✔</span>':'')+'</div>';
  }).join('');
}
function renderRanks(){
  const list=S.npcs.map(n=>({name:n.name,worth:n.worth,ch:n.prev?(n.worth/n.prev-1)*100:0}));
  list.push({name:'أنت 🧑‍💼',worth:netWorth(),ch:S.nwHist.length>1?(netWorth()/S.nwHist[S.nwHist.length-2]-1)*100:0,me:1});
  list.sort((a,b)=>b.worth-a.worth);
  const tb=$('rankTbl').tBodies[0];tb.innerHTML='';
  list.forEach((r,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML='<td>'+(i+1)+'</td><td>'+(r.me?'<b style="color:var(--gold)">'+r.name+'</b>':r.name)+'</td><td>'+fmtD(r.worth)+'</td>'+
      '<td class="chg '+(r.ch>=0?'up':'dn')+'">'+(r.ch>=0?'+':'')+r.ch.toFixed(1)+'%</td>';
    tb.appendChild(tr);
  });
}
function refreshNewsUI(){
  $('newsFeed').innerHTML=S.news.map(n=>'<div class="newsItem'+(n.hot?' hot':'')+(n.good?' good':'')+'">'+n.text+'<div class="nt">اليوم '+n.d+' — '+String(n.h).padStart(2,'0')+':00</div></div>').join('');
  const items=Object.values(S.assets).slice(0,18).map(a=>{const ch=chgPct(a);return '<span><b>'+a.name+'</b> '+money2(a.price)+' <b style="color:'+(ch>=0?'var(--up)':'var(--down)')+'">'+(ch>=0?'▲':'▼')+Math.abs(ch).toFixed(1)+'%</b></span>';}).join('');
  $('ticker').innerHTML=items+items;
}
function renderAll(){renderHead();renderMarket();renderAsset();renderPortfolio();renderBank();renderCompany();renderRanks();renderIdx();renderAchv();renderIPO();renderPend();renderDonut();renderStats();renderUpg();renderGoal();renderProps();renderBonds();renderRival();renderQuests();renderLotto();renderMood();renderNotifs();renderMovers();renderGEvent();renderDepth();renderPrestige();renderBranches();renderChallenge();renderOptions();renderAutopilot();renderWeekly();renderHeatmap();renderTA();renderMining();renderAuction();renderFG();renderIns();renderShare();renderDivCal();renderQuiz();renderDuel();renderFunds();renderDailyRecap();renderConf();renderVC();renderMargin();renderBench();renderBackup();renderEconCal();renderHF();renderOrders();renderMacro();renderHR();renderPerf();renderAcq();renderBrand();renderRep();renderInv();renderHealth();renderCorp();}

function showPage(p){
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.p===p));
  document.querySelectorAll('.page').forEach(el=>el.classList.toggle('on',el.id==='p-'+p));
}
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{showPage(b.dataset.p);renderAll();});
$('thPrice').onclick=()=>{S.sortKey=S.sortKey==='price'?null:'price';renderMarket();};
$('thChg').onclick=()=>{S.sortKey=S.sortKey==='chg'?'loss':S.sortKey==='loss'?null:'chg';renderMarket();};
document.querySelectorAll('.tfBtns button').forEach(b=>b.onclick=()=>{tf=+b.dataset.tf;document.querySelectorAll('.tfBtns button').forEach(x=>x.classList.toggle('on',x===b));renderAsset();});
document.querySelectorAll('.qpct button').forEach(b=>b.onclick=()=>{
  const a=S.assets[sel];const p=+b.dataset.pct/100;
  $('qty').value=Math.max(1,Math.floor(S.cash*p/a.price));
});
$('btnBuy').onclick=buy;$('btnSell').onclick=sell;
$('btnShort').onclick=shortSell;$('btnCover').onclick=cover;
$('btnCall').onclick=()=>buyOption('call');$('btnPut').onclick=()=>buyOption('put');
$('btnMargin').onclick=buyMargin;
let chartMode='line';
$('cLine').onclick=()=>{chartMode='line';$('cLine').classList.add('on');$('cCandle').classList.remove('on');renderAsset();};
$('cCandle').onclick=()=>{chartMode='candle';$('cCandle').classList.add('on');$('cLine').classList.remove('on');renderAsset();};

let speed=0,timer=null;
const IV={1:420,2:105,3:26};
function setSpeed(s){
  speed=s;['sp0','sp1','sp2','sp3'].forEach((id,i)=>$(id).classList.toggle('on',i===s));
  if(timer)clearInterval(timer);timer=null;
  if(s>0)timer=setInterval(()=>{for(let i=0;i<1;i++)tick();if(tickCount%2===0)renderHead();},IV[s]);
}
function applyTheme(){document.body.classList.toggle('light',S.theme==='light');}
$('btnTheme').onclick=()=>{S.theme=S.theme==='light'?'dark':'light';applyTheme();save();};
$('sp0').onclick=()=>setSpeed(0);$('sp1').onclick=()=>setSpeed(1);$('sp2').onclick=()=>setSpeed(2);$('sp3').onclick=()=>setSpeed(3);
$('btnSkipDay').onclick=()=>{const d0=S.day;let g=0;while(S.day===d0&&g++<40)tick();save();renderAll();toast('⏭ يوم جديد: '+S.day);};

$('btnDep').onclick=()=>{const v=+$('bkAmt').value||0;if(v>S.cash)return toast('❌ كاش غير كافٍ');S.cash-=v;S.dep+=v;log('إيداع '+fmtD(v));save();renderAll();};
$('btnWdr').onclick=()=>{const v=+$('bkAmt').value||0;if(v>S.dep)return toast('❌ الوديعة أقل');S.dep-=v;S.cash+=v;log('سحب وديعة '+fmtD(v));save();renderAll();};
$('btnBorrow').onclick=()=>{const v=+$('bkAmt2').value||0;if(S.loan+v>netWorth()*0.5)return toast('❌ البنك يرفض: تجاوزت حد الائتمان');S.loan+=v;S.cash+=v;log('قرض '+fmtD(v));save();renderAll();};
$('btnRepay').onclick=()=>{const v=Math.min(+$('bkAmt2').value||0,S.loan);if(v>S.cash)return toast('❌ كاش غير كافٍ');S.loan-=v;S.cash-=v;log('سداد قرض '+fmtD(v));save();renderAll();};

$('coSector').innerHTML=SECTORS.map(s=>'<option>'+s+'</option>').join('');
$('btnFound').onclick=()=>{
  if(S.cash<50000)return toast('❌ تحتاج ٥٠٬٠٠٠ دينار');
  const name=$('coName').value.trim()||'شركتي';
  S.cash-=50000;
  S.company={name,sector:$('coSector').value,cash:50000,price:40,rd:200,marketing:300,workers:20,quality:10,track:[],lastYearProfit:0,todayRev:0,todayProfit:0,todaySold:0,up:{line:0,auto:0,brand:0}};
  S.rival={name:RIVAL_NAMES[Math.floor(RNG()*RIVAL_NAMES.length)],strength:rnd(0.8,1.2)};
  toast('🎉 أسّست "'+name+'"! أدِرها بحكمة');
  pushNews(S,'تأسيس شركة "'+name+'" في قطاع '+S.company.sector,0,false,true);
  log('تأسيس شركة '+name);save();renderAll();
};
['sPrice','sRd','sMk','sWk'].forEach(id=>$(id).oninput=()=>{
  if(!S.company)return;
  S.company.price=+$('sPrice').value;S.company.rd=+$('sRd').value;S.company.marketing=+$('sMk').value;S.company.workers=+$('sWk').value;
  renderCompany();save();
});
$('btnInvest').onclick=()=>{if(!S.company||S.cash<10000)return toast('❌ كاش غير كافٍ');S.cash-=10000;S.company.cash+=10000;log('ضخ رأس مال');save();renderAll();};
$('btnWithdraw').onclick=()=>{if(!S.company||S.company.cash<10000)return toast('❌ خزينة الشركة أقل');S.company.cash-=10000;S.cash+=10000;log('سحب من الشركة');save();renderAll();};

$('btnLotto').onclick=()=>{
  if(S.cash<1000)return toast('❌ كاش غير كافٍ');
  S.cash-=1000;S.lotto.tickets++;
  toast('🎫 تذكرة يانصيب! بالتوفيق في سحب الليلة');beep(700,.06);
  save();renderLotto();
};
function renderLotto(){
  $('lottoPool').textContent=fmtD(S.lotto.pool);
  $('lottoT').textContent=S.lotto.tickets;
}
function startChallenge(){
  const start=netWorth();
  S.challenge={start:start,target:start*2,day0:S.day,days:30,
    rivals:[{n:'سلطان المضاربة',w:start},{n:'هالة الحذرة',w:start},{n:'ماجد المغامر',w:start}]};
  toast('⚔️ بدأ السباق! ضاعف ثروتك خلال 30 يوم');beep(1000,.2);
  save();renderChallenge();
}
function tickChallenge(){
  const ch=S.challenge;if(!ch)return;
  ch.rivals.forEach(r=>{r.w=Math.max(1000,r.w*(1+rnd(-0.01,0.038)));});
  const nw=netWorth();
  const winR=ch.rivals.find(r=>r.w>=ch.target);
  if(nw>=ch.target){
    S.challenge=null;
    if(!S.achv)S.achv={};S.achv.champion=1;
    const bonus=Math.round(ch.start*0.25*pmult());S.cash+=bonus;
    showModal('<h2>🏆 كسبت سباق المليون!</h2><p style="line-height:1.9">ضاعفت ثروتك قبل كل المنافسين. مكافأة البطل: <b>'+fmtD(bonus)+'</b> وإنجاز «بطل التحدي».</p><div class="tradeRow"><button onclick="hideModal()">يلا نكمل</button></div>');
    beep(1400,.35);save();
  }else if(winR){
    S.challenge=null;
    showModal('<h2>😤 '+winR.n+' سبقك!</h2><p style="line-height:1.9">وصل لهدف المضاعفة قبلك. جرب تاني — السوق ما بيرحمش.</p><div class="tradeRow"><button onclick="hideModal()">حسنًا</button></div>');
  }else if(S.day>=ch.day0+ch.days){
    const all=ch.rivals.map(r=>({n:r.n,w:r.w})).concat([{n:'أنت',w:nw}]).sort((a,b)=>b.w-a.w);
    const rank=all.findIndex(x=>x.n==='أنت')+1;
    S.challenge=null;
    showModal('<h2>⏰ انتهى السباق</h2><p style="line-height:1.9">ترتيبك: <b>#'+rank+'</b> من 4.<br>'+all.map((x,i)=>(i+1)+'. '+x.n+' — '+fmtD(x.w)).join('<br>')+'</p><div class="tradeRow"><button onclick="hideModal()">حسنًا</button></div>');
  }
}
function renderChallenge(){
  const el=$('challengeBody');if(!el)return;
  const ch=S.challenge;
  if(!ch){
    el.innerHTML='<p style="font-size:13px;color:var(--dim);margin-bottom:8px">سباق 30 يوم ضد 3 منافسين أذكياء: أول واحد يضاعف صافي ثروته يكسب مكافأة 25٪ وإنجاز «بطل التحدي» 🏆</p><div class="tradeRow"><button class="btnShort" id="btnChallenge">ابدأ السباق</button></div>';
    $('btnChallenge').onclick=startChallenge;
    return;
  }
  const nw=netWorth();
  const left=ch.day0+ch.days-S.day;
  const bar=(w)=>{const p=Math.min(100,Math.round(w/ch.target*100));return '<div style="background:var(--panel2);border-radius:6px;height:8px;overflow:hidden"><div style="width:'+p+'%;height:100%;background:linear-gradient(90deg,#22c55e,#a855f7)"></div></div>';};
  el.innerHTML='<p style="font-size:13px;margin-bottom:8px">الهدف: <b>'+fmtD(ch.target)+'</b> — متبقٍ <b>'+left+'</b> يوم</p>'+
    [{n:'أنت',w:nw}].concat(ch.rivals).map(x=>'<div style="font-size:12.5px;margin:6px 0"><div style="display:flex;justify-content:space-between"><span>'+x.n+'</span><span>'+fmtD(x.w)+'</span></div>'+bar(x.w)+'</div>').join('');
}
function renderBranches(){
  const el=$('branchList');if(!el)return;
  const c=S.company;
  if(!c){el.innerHTML='';return;}
  if(!c.branches)c.branches=[];
  el.innerHTML=CITIES.map(ct=>{
    const b=c.branches.find(x=>x.city===ct.n);
    const stt=S.cityStatus[ct.n]||'normal';
    const ic=stt==='boom'?'🔥':stt==='bust'?'🧊':'🏙️';
    if(b){
      const upCost=Math.round(ct.cost*0.6*b.lvl);
      return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:7px 0;border-bottom:1px solid var(--line)"><span>'+ic+' <b>'+ct.n+'</b> — مستوى '+b.lvl+'</span><button class="btnGhost" data-up="'+ct.n+'" '+(c.cash<upCost?'disabled':'')+'>ترقية ('+fmtD(upCost)+')</button></div>';
    }
    return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:7px 0;border-bottom:1px solid var(--line)"><span>'+ic+' '+ct.n+' <span style="color:var(--dim)">×'+ct.mult+'</span></span><button class="btnShort" data-open="'+ct.n+'" '+(c.cash<ct.cost?'disabled':'')+'>افتح فرع ('+fmtD(ct.cost)+')</button></div>';
  }).join('');
  el.querySelectorAll('[data-open]').forEach(bt=>bt.onclick=()=>openBranch(bt.dataset.open));
  el.querySelectorAll('[data-up]').forEach(bt=>bt.onclick=()=>upgradeBranch(bt.dataset.up));
}
function openBranch(cityN){
  const c=S.company,ct=CITIES.find(x=>x.n===cityN);
  if(!c||!ct)return;
  if(c.cash<ct.cost)return toast('❌ خزينة الشركة لا تكفي');
  c.cash-=ct.cost;
  if(!c.branches)c.branches=[];
  c.branches.push({city:cityN,lvl:1});
  toast('🌍 فرع جديد في '+cityN+'!');beep(950,.12);
  pushNews(S,'🌍 '+c.name+' تفتتح فرعًا في '+cityN,0,true,true);
  save();renderBranches();renderCompany();
}
function upgradeBranch(cityN){
  const c=S.company,ct=CITIES.find(x=>x.n===cityN);
  const b=c&&c.branches?c.branches.find(x=>x.city===cityN):null;
  if(!b)return;
  const upCost=Math.round(ct.cost*0.6*b.lvl);
  if(c.cash<upCost)return toast('❌ خزينة الشركة لا تكفي');
  c.cash-=upCost;b.lvl++;
  toast('⬆️ فرع '+cityN+' أصبح مستوى '+b.lvl);beep(800,.1);
  save();renderBranches();renderCompany();
}
function renderHeatmap(){
  const el=$('heatmap');if(!el)return;
  el.innerHTML=SECTORS.map(sec=>{
    const h=S.sectorHist[sec];
    if(!h||h.length<2)return '';
    const ref=h.length>24?h[h.length-25]:h[0];
    const c=(h[h.length-1]/ref-1)*100;
    const inten=Math.min(1,Math.abs(c)/4);
    const bg=c>=0?'rgba(34,197,94,'+(0.15+inten*0.55)+')':'rgba(239,68,68,'+(0.15+inten*0.55)+')';
    return '<div data-sec="'+sec+'" style="background:'+bg+';border:1px solid var(--line);border-radius:10px;padding:8px;text-align:center;cursor:pointer"><div style="font-size:12px">'+sec+'</div><div style="font-size:13px;font-weight:700;direction:ltr">'+(c>=0?'+':'')+c.toFixed(1)+'%</div></div>';
  }).join('');
  el.querySelectorAll('[data-sec]').forEach(t=>t.onclick=()=>{secFilter=t.dataset.sec;renderMarket();renderIdx();});
}
function renderTA(){
  const selEl=$('taSel');if(!selEl)return;
  const keys=Object.keys(S.assets);
  if(selEl.options.length!==keys.length){
    selEl.innerHTML=keys.map(k=>'<option value="'+k+'">'+S.assets[k].name+'</option>').join('');
    selEl.onchange=()=>renderTA();
  }
  if(selEl.value!==''&&!S.assets[selEl.value])selEl.value=keys[0];
  if(selEl.value==='')selEl.value=keys.includes(sel)?sel:keys[0];
  const a=S.assets[selEl.value];if(!a)return;
  const h=a.hist;
  const ma=n=>h.length>=n?h.slice(-n).reduce((x,y)=>x+y,0)/n:a.price;
  const ma7=ma(7),ma30=ma(30);
  let rsi=50;
  if(h.length>15){let g=0,l=0;for(let i=h.length-14;i<h.length;i++){const d=h[i]-h[i-1];if(d>0)g+=d;else l-=d;}rsi=l===0?(g>0?100:50):100-100/(1+g/l);}
  let std=0;if(h.length>=20){const m=ma(20);std=Math.sqrt(h.slice(-20).reduce((x,y)=>x+(y-m)*(y-m),0)/20);}
  const bbHi=ma(20)+2*std,bbLo=ma(20)-2*std;
  const bbPct=std>0?(a.price-bbLo)/(bbHi-bbLo)*100:50;
  const ema=(n)=>{if(h.length<n)return a.price;const k=2/(n+1);let e=h[h.length-n];for(let i=h.length-n+1;i<h.length;i++)e=h[i]*k+e*(1-k);return e;};
  const macd=ema(12)-ema(26);
  let macdSig=macd;for(let back=Math.min(8,h.length-2);back>=0;back--){const hh=h.slice(0,h.length-back);if(hh.length>=27){const kk=2/10;const em=n=>{const k2=2/(n+1);let e=hh[hh.length-n];for(let i=hh.length-n+1;i<hh.length;i++)e=hh[i]*k2+e*(1-k2);return e;};const v=em(12)-em(26);if(back===Math.min(8,h.length-2))macdSig=v;else macdSig=v*kk+macdSig*(1-kk);}}
  const macdH=macd-macdSig;
  $('taKpis').innerHTML=kpi('متوسط ٧ ساعات',fmtD(ma7))+kpi('متوسط ٣٠ ساعة',fmtD(ma30))+kpi('مؤشر RSI',rsi.toFixed(0))+kpi('بولينجر ٪B',bbPct.toFixed(0)+'٪')+kpi('ماكد',(macdH>=0?'+':'')+macdH.toFixed(2));
  const cv=$('taChart');
  if(cv&&h.length>=2){
    const ctx=cv.getContext('2d');const W=cv.width,H=cv.height;
    ctx.clearRect(0,0,W,H);ctx.direction='ltr';
    const N=Math.min(h.length,120);const data=h.slice(-N);
    const mn=Math.min.apply(null,data),mx=Math.max.apply(null,data),rg=(mx-mn)||1;
    const px=i=>i/(N-1)*(W-40)+30,py=v=>H-12-(v-mn)/rg*(H-24);
    ctx.strokeStyle='rgba(148,163,184,.25)';ctx.beginPath();
    for(let g=0;g<4;g++){const y=12+(H-24)*g/3;ctx.moveTo(30,y);ctx.lineTo(W-10,y);}ctx.stroke();
    ctx.fillStyle='rgba(148,163,184,.8)';ctx.font='10px sans-serif';ctx.textAlign='left';
    for(let g=0;g<4;g++){const v=mx-rg*g/3;ctx.fillText(v.toFixed(v<10?3:0),2,12+(H-24)*g/3+3);}
    const line=(fn,color,dash)=>{ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.setLineDash(dash||[]);ctx.beginPath();data.forEach((_,i)=>{if(i===0)ctx.moveTo(px(i),py(fn(i)));else ctx.lineTo(px(i),py(fn(i)));});ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=1;};
    if(N>=7)line(i=>data.slice(Math.max(0,i-6),i+1).reduce((x,y)=>x+y,0)/data.slice(Math.max(0,i-6),i+1).length,'rgba(251,191,36,.85)',[4,3]);
    if(N>=30)line(i=>data.slice(Math.max(0,i-29),i+1).reduce((x,y)=>x+y,0)/data.slice(Math.max(0,i-29),i+1).length,'rgba(96,165,250,.85)',[2,3]);
    line(i=>data[i],'rgba(34,197,94,.95)');
    ctx.fillStyle='rgba(148,163,184,.9)';ctx.font='11px sans-serif';
    ctx.fillText('green price / yellow MA7 / blue MA30',32,H-2);
  }
  let sig,col;
  if(rsi>=70){sig='🔴 تشبع شرائي — حذر من تصحيح';col='var(--down)';}
  else if(rsi<=30){sig='🟢 تشبع بيعي — فرصة شراء محتملة';col='var(--up)';}
  else if(bbPct>95){sig='🔴 السعر عند سقف بولينجر — منطقة مقاومة';col='var(--down)';}
  else if(bbPct<5){sig='🟢 السعر عند قاع بولينجر — منطقة دعم';col='var(--up)';}
  else if(macdH>0&&ma7>ma30){sig='🟢 اتجاه صاعد قوي — ماكد ومتوسطات إيجابية';col='var(--up)';}
  else if(macdH<0&&ma7<ma30){sig='🔴 اتجاه هابط — ماكد ومتوسطات سلبية';col='var(--down)';}
  else if(ma7>ma30){sig='🟢 اتجاه صاعد — المتوسط القصير فوق الطويل';col='var(--up)';}
  else if(ma7<ma30){sig='🔴 اتجاه هابط — المتوسط القصير تحت الطويل';col='var(--down)';}
  else{sig='⚪ محايد';col='var(--dim)';}
  $('taSignal').innerHTML='<span style="color:'+col+'">'+sig+'</span>';
  $('taNote').textContent='تحليل آلي مبسّط من آخر '+h.length+' قراءة سعر — مش نصيحة مالية 😉';
  const tb=$('taPl').querySelector('tbody');let rows=0;
  tb.innerHTML=keys.map(k=>{
    const x=S.assets[k];let cost,cur,qty;
    if(x.held>0){cost=x.avg*x.held;cur=x.price*x.held;qty=x.held;}
    else if(x.short>0){cost=x.shortAvg*x.short;cur=x.price*x.short;qty=x.short;}
    else return '';
    const pnl=(x.held>0?cur-cost:cost-cur);const pct=cost>0?pnl/cost*100:0;
    rows++;
    return '<tr><td>'+x.name+(x.short>0?' 🔻':'')+'</td><td>'+fmtD(cost/qty)+'</td><td>'+fmtD(x.price)+'</td><td class="chg '+(pnl>=0?'up':'dn')+'">'+fmtD(pnl)+'</td><td class="chg '+(pnl>=0?'up':'dn')+'">'+(pnl>=0?'+':'')+pct.toFixed(1)+'%</td></tr>';
  }).join('');
  $('taPlEmpty').style.display=rows?'none':'';
}
function renderMining(){
  const el=$('miningBody');if(!el)return;
  const m=S.mining;
  const rigCost=Math.round(5000*Math.pow(1.6,m.rigs));
  const upgCost=Math.round(10000*(m.upg+1));
  const daily=Math.round(m.rigs*(1+m.upg*0.5)*250);
  el.innerHTML='<div class="kpis">'+kpi('أجهزة التعدين',m.rigs)+kpi('الكفاءة','×'+(1+m.upg*0.5).toFixed(1))+kpi('العائد اليومي التقديري',fmtD(daily))+kpi('إجمالي المُعدَّن',fmtD(m.total))+'</div>'+
  '<div class="tradeRow"><button class="btnShort" id="btnRig">شراء جهاز ('+fmtD(rigCost)+')</button><button class="btnShort" id="btnUpgM">ترقية الكفاءة ('+fmtD(upgCost)+')</button></div>'+
  '<div style="font-size:12px;color:var(--dim);margin-top:6px">العائد يتبع حركة سوق الكريبتو: سوق صاعد يعني تعدينًا أربح.</div>';
  $('btnRig').onclick=()=>{if(S.cash<rigCost)return toast('❌ كاش غير كافٍ');S.cash-=rigCost;S.mining.rigs++;log('شراء جهاز تعدين');save();renderAll();};
  $('btnUpgM').onclick=()=>{if(!S.mining.rigs)return toast('❌ اشترِ جهازًا أولًا');if(S.cash<upgCost)return toast('❌ كاش غير كافٍ');S.cash-=upgCost;S.mining.upg++;log('ترقية كفاءة التعدين');save();renderAll();};
}
function renderAuction(){
  const el=$('auctionBody');if(!el)return;
  let h='';
  if(S.auction){
    const a=S.auction;
    h+='<div style="font-size:13px;margin-bottom:6px">🔨 أصول <b>'+a.name+'</b> ('+a.sector+') — قيمة تقديرية '+fmtD(a.val)+' — يُحسم المزاد نهاية اليوم '+a.ends+'</div>'+
    '<div style="font-size:12.5px;color:var(--dim);margin-bottom:6px">تقارير تشير إلى عرض منافس بحوالي '+fmtD(a.npc)+' | عرضك الحالي: '+(a.bid?fmtD(a.bid):'لا يوجد')+'</div>'+
    '<div class="tradeRow"><input id="aucBid" type="number" min="0" placeholder="عرضك بالدولار" style="flex:1"><button class="btnShort" id="btnAuc">زايد</button></div>';
  }else{
    h+='<div style="font-size:12.5px;color:var(--dim)">لا مزادات حالية. عندما تفلس شركة قد تُعرض أصولها هنا بأقل من قيمتها — صفقة لمن يجرؤ.</div>';
  }
  if(S.empire&&S.empire.length){
    h+='<div style="margin-top:8px;font-size:13px"><b>🏛️ شركات فزت بها:</b><br>'+S.empire.map(e=>'• '+e.name+' ('+e.sector+') — دخل يومي '+fmtD(e.profit)).join('<br>')+'</div>';
  }
  el.innerHTML=h;
  if(S.auction){
    $('btnAuc').onclick=()=>{
      const v=Math.floor(+$('aucBid').value||0);
      if(v<=0)return toast('❌ أدخل عرضًا');
      if(v>S.cash)return toast('❌ كاش غير كافٍ');
      if(v<=S.auction.bid)return toast('❌ يجب أن يتجاوز عرضك الجديد عرضك السابق');
      S.auction.bid=v;log('مزايدة '+fmtD(v)+' على أصول '+S.auction.name);save();renderAll();
    };
  }
}
function fgIndex(){
  let ch=0,cnt=0;
  Object.keys(S.assets).forEach(k=>{const a=S.assets[k];if(a.hist.length>1){ch+=a.price/a.hist[a.hist.length-2]-1;cnt++;}});
  const m=cnt?ch/cnt:0;
  return Math.max(0,Math.min(100,Math.round(50+S.mood*180+m*400)));
}
function renderFG(){
  const el=$('fgGauge');if(!el)return;
  const v=fgIndex();
  const lbl=v<25?'😱 خوف شديد':v<45?'😟 خوف':v<55?'😐 محايد':v<75?'😃 طمع':'🤑 طمع شديد';
  const col=v<45?'var(--down)':v<55?'var(--gold)':'var(--up)';
  el.innerHTML='<div style="position:relative;height:10px;background:linear-gradient(90deg,var(--down),var(--gold),var(--up));border-radius:6px;margin:10px 0 4px">'+
  '<div style="position:absolute;right:'+v+'%;top:-5px;width:3px;height:20px;background:#fff;border-radius:2px;box-shadow:0 0 4px #000"></div></div>'+
  '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--dim)"><span>'+lbl+'</span><b style="color:'+col+'">'+v+'/100</b></div>'+
  '<div style="font-size:11.5px;color:var(--dim);margin-top:4px">محسوب من مزاج السوق وحركة الأسعار الأخيرة — الخوف الشديد يعني فرص، والطمع الشديد يعني حذر.</div>';
}
function renderIns(){
  const el=$('insBody');if(!el)return;
  const invested=Math.max(0,netWorth()-S.cash);
  const prem=Math.max(1000,Math.round(invested*0.02));
  const active=S.ins.until>=S.day;
  el.innerHTML='<p style="font-size:13px;color:var(--dim);margin-bottom:8px">غطّ محفظتك ٧ أيام ضد الانهيارات: لو ثروتك هبطت أكثر من ٨٪ في يوم، تُعوَّض بنصف الخسارة. '+(active?'<b style="color:var(--up)">نشط حتى اليوم '+S.ins.until+' ✅</b>':'<b>غير نشط</b>')+'</p>'+
  '<div class="kpis">'+kpi('القسط (٧ أيام)',fmtD(prem))+kpi('إجمالي التعويضات',fmtD(S.ins.paid))+'</div>'+
  '<div class="tradeRow"><button class="btnShort" id="btnIns">'+(active?'تجديد التغطية':'فعّل التأمين')+'</button></div>';
  $('btnIns').onclick=()=>{if(S.cash<prem)return toast('❌ كاش غير كافٍ للقسط ('+fmtD(prem)+')');S.cash-=prem;S.ins.until=S.day+7;log('تأمين محفظة حتى يوم '+S.ins.until);save();renderAll();};
}
function shareText(){
  const nw=netWorth();const ch=(nw/100000-1)*100;
  return '💼 صافي ثروتي '+fmtD(nw)+' ('+(ch>=0?'+':'')+ch.toFixed(1)+'% في '+S.day+' يوم) في محاكي الاقتصاد العالمي — مستواي '+(typeof hLevel==='function'?hLevel(nw):'')+'! هل تقدر تتغلب عليّ؟ '+(typeof location!=='undefined'?location.origin+location.pathname:'');
}
function renderShare(){
  const b=$('btnShare');if(!b)return;
  b.onclick=()=>{
    const t=shareText();
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(()=>toast('📤 نتيجتك اتنسخت — شاركها مع أصحابك'),()=>toast(t));}
    else{const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('📤 نتيجتك اتنسخت — شاركها');}catch(e){toast(t);}ta.remove();}
  };
}
function renderDivCal(){
  const el=$('divCal');if(!el)return;
  const rows=Object.keys(S.assets).map(k=>S.assets[k]).filter(a=>a.kind==='stock'&&a.held>0&&a.div);
  if(!rows.length){el.innerHTML='<div style="font-size:12.5px;color:var(--dim);padding:4px">لا أسهم موزعة في محفظتك. الأسهم العادية توزع أرباحًا دورية على مالكيها.</div>';return;}
  el.innerHTML='<div style="font-size:12.5px">'+rows.map(a=>{
    const est=a.held*a.price*a.div/90;
    return '<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--line)"><span>'+a.name+' <span style="color:var(--dim);font-size:11px">(عائد '+(a.div*100).toFixed(1)+'%)</span></span><b style="color:var(--gold)">~'+fmtD(est)+'/توزيعة</b></div>';
  }).join('')+'</div><div style="font-size:12px;color:var(--dim);margin-top:6px">إجمالي ما قبضته: <b style="color:var(--up)">'+fmtD(S.stats.divTotal)+'</b></div>';
}
const QUIZ=[
 {q:'ماذا يعني تنويع المحفظة؟',o:['شراء أسهم كثيرة من شركة واحدة','توزيع الاستثمار على أصول مختلفة لتقليل المخاطرة','بيع كل شيء عند أول هبوط'],a:1},
 {q:'عندما يرتفع مؤشر الخوف والطمع فوق ٧٥، غالبًا السوق...',o:['رخيص وفرصة شراء','في تشبع شرائي وقد يصحح','مغلق'],a:1},
 {q:'ما هي التوزيعات (dividends)؟',o:['ضريبة حكومية','جزء من أرباح الشركة يُدفع للمساهمين','رسوم الوسيط'],a:1},
 {q:'البيع على المكشوف (short) يربح عندما...',o:['يرتفع السعر','ينخفض السعر','يثبت السعر'],a:1},
 {q:'خيار الشراء (call) يعطيك حق...',o:['الشراء بسعر محدد قبل انتهاء الصلاحية','بيع الشركة','اقتراض الأسهم'],a:0},
 {q:'أفضل وقت لشراء أصل قوي حسب مؤشر الخوف والطمع؟',o:['طمع شديد','خوف شديد','لا فرق'],a:1},
 {q:'ماذا يفعل رفع الفائدة عادة بسوق الأسهم؟',o:['يدفعه للصعود','يضغط عليه للهبوط','لا تأثير'],a:1},
 {q:'صندوق المؤشر (ETF) هو...',o:['سهم شركة واحدة','سلة أصول تتبع قطاعًا أو مؤشرًا','عملة رقمية'],a:1},
 {q:'متوسط التكلفة (DCA) يعني...',o:['الشراء دفعة واحدة','الشراء بمبالغ ثابتة على فترات','الشراء بالهامش فقط'],a:1},
 {q:'أي أصل يُعد ملاذًا آمنًا وقت الأزمات؟',o:['الكريبتو','الذهب','الأسهم الصغيرة'],a:1}
];
function renderQuiz(){
  const el=$('quizBody');if(!el)return;
  const done=S.quiz.day===S.day;
  const item=QUIZ[S.day%QUIZ.length];
  let h='<div style="font-size:12.5px;color:var(--dim);margin-bottom:6px">سلسلة الإجابات: 🔥 '+S.quiz.streak+' | إجمالي الجوائز: '+fmtD(S.quiz.won)+'</div>';
  if(done){h+='<div style="font-size:13px;color:var(--up)">✅ أجبت على سؤال اليوم — عد غدًا لسؤال جديد.</div>';}
  else{
    h+='<div style="font-size:13.5px;font-weight:700;margin-bottom:6px">'+item.q+'</div>'+
    item.o.map((o,i)=>'<button class="btnGhost quizOpt" data-i="'+i+'" style="display:block;width:100%;text-align:right;margin:4px 0">'+o+'</button>').join('');
  }
  el.innerHTML=h;
  if(!done)el.querySelectorAll('.quizOpt').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;
    if(i===item.a){
      S.quiz.streak++;const prize=Math.round((300+S.quiz.streak*150)*pmult());
      S.cash+=prize;S.quiz.won+=prize;
      toast('🎓 إجابة صحيحة! +'+fmtD(prize));log('جائزة الأكاديمية +'+fmtD(prize));beep(880,.1);
    }else{
      S.quiz.streak=0;toast('❌ إجابة خاطئة — الصحيح: '+item.o[item.a]);
    }
    S.quiz.day=S.day;save();renderAll();
  });
}
function renderDuel(){
  const el=$('duelBody');if(!el)return;
  if(!S.duel){
    el.innerHTML='<div style="font-size:12.5px;color:var(--dim);margin-bottom:6px">تحدَّ بوت المتداول المحترف ٥ أيام: ادفع ١٠٬٠٠٠ دخول، وصاحب أعلى عائد يكسب الجائزة ٢٠٬٠٠٠. انتصاراتك: 🏆 '+S.duelWins+'</div><div class="tradeRow"><button class="btnShort" id="btnDuel">ابدأ المبارزة (١٠٬٠٠٠)</button></div>';
    $('btnDuel').onclick=()=>{
      if(S.cash<10000)return toast('❌ كاش غير كافٍ');
      S.cash-=10000;S.duel={start:netWorth(),bot:1,day0:S.day};
      toast('⚔️ بدأت المبارزة! ٥ أيام');log('بدء مبارزة المتداولين');save();renderAll();
    };
    return;
  }
  const d=S.duel;const left=5-(S.day-d.day0);
  const me=netWorth()/d.start-1;
  el.innerHTML='<div class="kpis">'+kpi('عائدك',(me>=0?'+':'')+(me*100).toFixed(1)+'%')+kpi('عائد البوت',(d.bot>=1?'+':'')+((d.bot-1)*100).toFixed(1)+'%')+kpi('الأيام المتبقية',Math.max(0,left))+'</div>'+
  '<div style="font-size:12px;color:var(--dim);margin-top:4px">'+(me>d.bot-1?'أنت متقدم 🔥':'البوت متقدم 🤖')+'</div>';
}
function duelDay(){
  if(!S.duel)return;
  S.duel.bot*=1+RNG()*0.04-0.015;
  if(S.day-S.duel.day0>=5){
    const me=netWorth()/S.duel.start-1,bot=S.duel.bot-1;
    if(me>bot){S.cash+=20000;S.duelWins++;toast('⚔️🏆 فزت بالمبارزة! +٢٠٬٠٠٠');pushNews(S,'⚔️ هزمت بوت المتداول المحترف في مبارزة ٥ أيام!',0.02,true,true);beep(1200,.2);}
    else{toast('⚔️ خسرت المبارزة ('+(me*100).toFixed(1)+'% مقابل '+(bot*100).toFixed(1)+'%)');pushNews(S,'⚔️ بوت المتداول يتفوق عليك هذه المرة',-0.01,true);}
    log('نهاية المبارزة');S.duel=null;
  }
}
function renderFunds(){
  const tb=$('fundTbl');if(!tb)return;const b=tb.tBodies[0];b.innerHTML='';
  FUNDS.forEach((f,i)=>{
    const h=S.fundHist[i];const ch=h.length>1?(S.fundP[i]/h[h.length-2]-1)*100:0;
    const tr=document.createElement('tr');
    tr.innerHTML='<td><b>'+f[0]+'</b><br><span style="font-size:11px;color:var(--dim)">رسوم '+(f[2]*100).toFixed(1)+'% سنويًا</span></td><td>'+fmtD(S.fundP[i])+'</td><td class="chg '+(ch>=0?'up':'dn')+'">'+(ch>=0?'+':'')+ch.toFixed(1)+'%</td><td>'+S.fundH[i]+'</td><td style="white-space:nowrap"><button class="btnBuy" data-fb="'+i+'" style="padding:5px 10px;font-size:12px">شراء</button> <button class="btnSell" data-fs="'+i+'" style="padding:5px 10px;font-size:12px">بيع</button></td>';
    b.appendChild(tr);
  });
  b.querySelectorAll('[data-fb]').forEach(btn=>btn.onclick=()=>{
    const i=+btn.dataset.fb;const q=Math.max(1,Math.floor(+$('fundQty').value||1));
    const cost=q*S.fundP[i];if(cost>S.cash)return toast('❌ كاش غير كافٍ');
    S.cash-=cost;S.fundAvg[i]=(S.fundAvg[i]*S.fundH[i]+cost)/(S.fundH[i]+q);S.fundH[i]+=q;
    log('شراء '+q+' وحدة '+FUNDS[i][0]);save();renderAll();
  });
  b.querySelectorAll('[data-fs]').forEach(btn=>btn.onclick=()=>{
    const i=+btn.dataset.fs;const q=Math.min(S.fundH[i],Math.max(1,Math.floor(+$('fundQty').value||1)));
    if(!q)return toast('❌ لا وحدات لديك');
    S.fundH[i]-=q;S.cash+=q*S.fundP[i]*(1-0.001);
    log('بيع '+q+' وحدة '+FUNDS[i][0]);save();renderAll();
  });
}
function renderDailyRecap(){
  const el=$('dailyRecap');if(!el)return;
  let ch=0;
  if(S.nwHist.length>1){const a=S.nwHist[S.nwHist.length-2],b=S.nwHist[S.nwHist.length-1];ch=a>0?(b/a-1)*100:0;}
  let best=null,worst=null;
  Object.keys(S.assets).forEach(k=>{const x=S.assets[k];if(x.hist.length<2)return;
    const c=x.price/x.hist[x.hist.length-2]-1;
    if(!best||c>best.c)best={n:x.name,c};if(!worst||c<worst.c)worst={n:x.name,c};});
  el.innerHTML='<div class="kpis">'+
  kpi('تغير ثروتك أمس',(ch>=0?'+':'')+ch.toFixed(2)+'%')+
  (best?kpi('نجم الأمس 🚀',best.n+' '+(best.c>=0?'+':'')+(best.c*100).toFixed(1)+'%'):'')+
  (worst?kpi('خاسر الأمس 🔻',worst.n+' '+(worst.c*100).toFixed(1)+'%'):'')+
  kpi('أخبار اليوم',S.news.filter(n=>n.d===S.day).length)+'</div>';
}
function renderConf(){
  const el=$('confBody');if(!el)return;
  const c=S.company;
  if(!c||!c.public||!c.ticker||!S.assets[c.ticker]){el.innerHTML='<div style="font-size:12.5px;color:var(--dim)">اطرح شركتك للاكتتاب العام أولًا، ثم وجّه رسائل للسوق من هنا كل ١٠ أيام.</div>';return;}
  const cd=10-(S.day-S.confDay);
  if(cd>0){el.innerHTML='<div style="font-size:12.5px;color:var(--dim)">المؤتمر القادم بعد '+cd+' يوم. آخر مؤتمر حرّك سهمك.</div>';return;}
  el.innerHTML='<div style="font-size:12.5px;color:var(--dim);margin-bottom:6px">وجّه رسالة للمستثمرين — كل نبرة تأثير مختلف على سهمك ('+c.ticker+'):</div>'+
  '<div class="tradeRow">'+
  '<button class="btnGhost confBtn" data-m="opt">😃 تفاؤل بنتائج قوية قادمة</button>'+
  '<button class="btnGhost confBtn" data-m="real">🧐 واقعية وشفافية</button>'+
  '<button class="btnGhost confBtn" data-m="shock">🔥 تصريح صادم مفاجئ</button></div>';
  el.querySelectorAll('.confBtn').forEach(b=>b.onclick=()=>{
    const a=S.assets[c.ticker];const m=b.dataset.m;
    if(m==='opt'){a.sent+=0.06;pushNews(S,'🎤 مدير "'+c.name+'" يَعِد بنتائج قوية — المستثمرون متفائلون',0.02,true,true);}
    else if(m==='real'){a.sent+=0.02;c.quality=Math.min(100,c.quality+2);pushNews(S,'🎤 "'+c.name+'" تكشف أرقامها بشفافية — ثقة هادئة في السوق',0.01,false,true);}
    else{a.sent+=(RNG()<0.5?-1:1)*(0.08+RNG()*0.05);pushNews(S,'🎤 تصريح صادم من مدير "'+c.name+'" يشعل الجدل في السوق!',0,true,true);}
    S.confDay=S.day;toast('🎤 انتهى المؤتمر — راقب سهمك');log('مؤتمر صحفي ('+m+')');save();renderAll();
  });
}
function renderVC(){
  const el=$('vcBody');if(!el)return;
  let h='';
  if(S.vcDeal){
    const d=S.vcDeal;
    h+='<div style="font-size:13px;margin-bottom:4px"><b>'+d.name+'</b> — تطلب '+fmtD(d.ask)+' مقابل وعد بـ <b style="color:var(--gold)">'+d.mult+'x</b> خلال ١٠ أيام <span style="color:var(--dim)">(مخاطرة فشل '+(d.risk*100).toFixed(0)+'%)</span></div>'+
    '<div class="tradeRow"><button class="btnShort" id="btnVC">استثمر '+fmtD(d.ask)+'</button><button class="btnGhost" id="btnVCSkip">تجاهل العرض</button></div>';
  }else{
    h+='<div style="font-size:12.5px;color:var(--dim)">لا عروض حالية — الشركات الناشئة تطرح نفسها كل بضعة أيام. مكاسب ضخمة أو خسارة كاملة.</div>';
  }
  if(S.vc.length){
    h+='<div style="margin-top:8px;font-size:12.5px">'+S.vc.map(v=>'• '+v.name+' — '+fmtD(v.amt)+' × '+v.mult+' — متبقٍ '+Math.max(0,v.due-S.day)+' يوم').join('<br>')+'</div>';
  }
  h+='<div style="font-size:11.5px;color:var(--dim);margin-top:6px">خروج ناجح: 🏆 '+S.vcWins+' | فشل: 💀 '+S.vcLost+'</div>';
  el.innerHTML=h;
  if(S.vcDeal){
    $('btnVC').onclick=()=>{const d=S.vcDeal;
      if(d.ask>S.cash)return toast('❌ كاش غير كافٍ');
      S.cash-=d.ask;S.vc.push({name:d.name,amt:d.ask,mult:d.mult,risk:d.risk,due:d.due});
      S.vcDeal=null;S.vcNext=S.day+Math.round(rnd(3,6));
      toast('🦄 استثمرت في ناشئة!');log('استثمار مخاطر '+fmtD(d.ask));save();renderAll();};
    $('btnVCSkip').onclick=()=>{S.vcDeal=null;S.vcNext=S.day+Math.round(rnd(2,5));save();renderAll();};
  }
}
function renderOrders(){
  const selEl=$('ordSym');if(!selEl)return;
  const keys=Object.keys(S.assets);
  if(selEl.options.length!==keys.length)selEl.innerHTML=keys.map(k=>'<option value="'+k+'">'+S.assets[k].name+'</option>').join('');
  $('btnOrdAdd').onclick=()=>{
    const sym=selEl.value||keys[0],a=S.assets[sym];
    const qty=Math.max(0,Math.floor(+$('ordQty').value||0));
    const target=+$('ordTarget').value||0;
    const side=$('ordSide').value;
    if(!qty||target<=0)return toast('❌ حدد الكمية والسعر المستهدف');
    S.orders.push({sym,side,qty,target});
    toast('📌 أمر معلق: '+(side==='buy'?'شراء':'بيع')+' '+qty+' × '+a.name+' عند '+target);
    log('أمر معلق جديد');save();renderAll();
  };
  const el=$('ordList');
  if(!S.orders.length){el.innerHTML='<div style="font-size:12px;color:var(--dim)">لا أوامر معلقة — اضبط أمرًا ويتنفذ تلقائيًا لما السعر يوصله حتى لو مش متابع.</div>';return;}
  el.innerHTML=S.orders.map((o,i)=>{const a=S.assets[o.sym];if(!a)return '';
    return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px;padding:4px 0;border-bottom:1px solid var(--line)"><span>'+(o.side==='buy'?'🟢 شراء':'🔴 بيع')+' '+o.qty+' × '+a.name+' @ '+o.target+' <span style="color:var(--dim)">(الحالي '+a.price.toFixed(2)+')</span></span><button class="btnGhost" data-ord="'+i+'" style="padding:3px 8px;font-size:11px">إلغاء</button></div>';
  }).join('');
  el.querySelectorAll('[data-ord]').forEach(b=>b.onclick=()=>{S.orders.splice(+b.dataset.ord,1);save();renderAll();});
  
  const alSel=$('alSym');
  if(alSel.options.length!==keys.length)alSel.innerHTML=keys.map(k=>'<option value="'+k+'">'+S.assets[k].name+'</option>').join('');
  $('btnAlAdd').onclick=()=>{
    const sym=alSel.value||keys[0],a=S.assets[sym];
    const target=+$('alTarget').value||0;
    if(target<=0)return toast('❌ حدد سعر التنبيه');
    S.alerts.push({sym,dir:$('alDir').value,target});
    toast('🔔 تنبيه مضاف لـ '+a.name);save();renderAll();
  };
  const alEl=$('alList');
  if(!S.alerts.length){alEl.innerHTML='<div style="font-size:12px;color:var(--dim)">لا تنبيهات — نبّهك توست + خبر لما أي سعر يوصل للمستوى اللي تحدده.</div>';return;}
  alEl.innerHTML=S.alerts.map((al,i)=>{const a=S.assets[al.sym];if(!a)return '';
    return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px;padding:3px 0;border-bottom:1px solid var(--line)"><span>🔔 '+a.name+' '+(al.dir==='above'?'فوق':'تحت')+' '+al.target+' <span style="color:var(--dim)">(الحالي '+a.price.toFixed(2)+')</span></span><button class="btnGhost" data-al="'+i+'" style="padding:3px 8px;font-size:11px">حذف</button></div>';
  }).join('');
  alEl.querySelectorAll('[data-al]').forEach(b=>b.onclick=()=>{S.alerts.splice(+b.dataset.al,1);save();renderAll();});
}
function renderHF(){
  const el=$('hfBody');if(!el)return;
  const ok2=netWorth()>=1000000||(S.prestige||0)>=1;
  let h='';
  if(!S.hf.on){
    if(ok2)h='<div style="font-size:12.5px;color:var(--dim);margin-bottom:6px">مستثمرون أثرياء مستعدون يدخلوا معك: تدير <b>أموالهم</b> بنفس أداء محفظتك وتاخد <b style="color:var(--gold)">٢٠٪ رسوم أداء</b> من كل ربح جديد. ٣ أيام خسارة متتالية والمستثمرين يسحبوا ٣٠٪.</div><div class="tradeRow"><button class="btnShort" id="btnHFOpen">افتح الصندوق (رأس مال مبدئي ٢٥٠ ألف)</button></div>';
    else h='<div style="font-size:12.5px;color:var(--dim)">🔒 يتفتح عند صافي ثروة مليون دولار أو نجمة أسطورة ⭐ — المستثمرون الكبار بيثقوا في الكبار بس.</div>';
  }else{
    h='<div class="kpis">'+kpi('رأس مال المستثمرين',fmtD(Math.round(S.hf.capital)))+kpi('أعلى مستوى (HWM)',fmtD(Math.round(S.hf.hwm)))+kpi('إجمالي رسومك',fmtD(Math.round(S.hf.fees)))+kpi('أيام خسارة متتالية',S.hf.streak)+'</div>'+
    '<div style="font-size:12px;color:var(--dim);margin-top:4px">الصندوق يتحرك مع عائدك اليومي (×٠.٨). ربح فوق ١٪ يجذب مستثمرين جدد (+٥٪).</div>'+
    '<div class="tradeRow" style="margin-top:6px"><button class="btnGhost" id="btnHFClose">أغلق الصندوق</button></div>';
  }
  el.innerHTML=h;
  const bo=$('btnHFOpen');if(bo)bo.onclick=()=>{S.hf.on=true;S.hf.capital=250000;S.hf.hwm=250000;S.hf.streak=0;toast('🐺 فتحت صندوق التحوط!');pushNews(S,'🐺 '+S.name+' أطلق صندوق تحوط — المستثمرون يصطفون!',0.01,true,true);log('فتح صندوق تحوط');save();renderAll();};
  const bc=$('btnHFClose');if(bc)bc.onclick=()=>{S.hf.on=false;S.hf.capital=0;S.hf.hwm=0;toast('أغلقت الصندوق — المستثمرون أخذوا أموالهم');log('إغلاق صندوق التحوط');save();renderAll();};
}
function renderMargin(){
  const el=$('marginInfo');if(!el)return;
  if(S.marginPos){const m=S.marginPos;const a=S.assets[m.sym];
    const cur=a?m.qty*a.price-m.debt:0;
    el.textContent=' | ⚡ مركز هامش: '+m.qty+' × '+m.name+' — حقوقك الآن '+fmtD(cur);
  }else el.textContent='';
}
function buyMargin(){
  if(S.marginPos)return toast('❌ لديك مركز هامش مفتوح بالفعل');
  const a=S.assets[sel];if(!a)return;
  const q=Math.max(0,Math.floor(+$('qty').value||0));if(!q)return;
  const half=q*a.price/2;
  if(half>S.cash)return toast('❌ تحتاج نصف القيمة كاش ('+fmtD(half)+')');
  S.cash-=half;
  S.marginPos={sym:sel,name:a.name,qty:q,entry:a.price,debt:half};
  toast('⚡ مركز هامش ٢x على '+a.name);log('هامش ٢x: '+q+' × '+a.name);
  save();renderAll();
}
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
