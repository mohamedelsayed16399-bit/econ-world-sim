function renderSup(){
  const b=$('supBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  if(!c.sup)c.sup=supDef();
  const a=c.sup.active;
  let h='';
  if(a){
    const left=Math.max(0,a.endDay-S.day);
    const G='display:grid;grid-template-columns:repeat(3,1fr);gap:6px';
    h+='<div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:14px">'+a.name+'</b><span style="font-size:12px;color:var(--dim)">عقد ساري</span></div>';
    h+='<div style="'+G+';margin-top:8px;font-size:12px;color:var(--dim)">'+
      '<div>سعر الوحدة<br><b style="color:var(--txt);font-size:12.5px">'+a.unitCost.toFixed(2)+' د.</b></div>'+
      '<div>الالتزام بالتسليم<br><b style="color:var(--txt);font-size:12.5px">'+Math.round(a.reliability*100)+'%</b></div>'+
      '<div>دفعة الجودة<br><b style="color:var(--txt);font-size:12.5px">+'+a.quality+'</b></div>'+
      '<div>حجم الشحنة<br><b style="color:var(--txt);font-size:12.5px">'+a.volume+' وحدة</b></div>'+
      '<div>باقي من العقد<br><b style="color:'+(left<=5?'#f59e0b':'var(--txt)')+';font-size:12.5px">'+left+' يوم</b></div>'+
      '<div>تكلفة ١٠٠٠ وحدة<br><b style="color:var(--up);font-size:12.5px">'+fmtD(a.unitCost*1000)+'</b></div></div>';
    h+='<div class="tradeRow" style="margin-top:8px"><button class="btnGhost" onclick="cancelSup()" '+(c.cash<Math.round(a.unitCost*a.volume*2)?'disabled':'')+'>📄 افسخ العقد (غرامة '+fmtD(a.unitCost*a.volume*2)+')</button></div>';
  }else{
    const os=supOffers();
    h+='<div style="font-size:12.5px;color:var(--dim);margin-bottom:6px">موردين قدّموا عروض — فاوض على السعر أو وقّع. التكلفة الافتراضية بدون عقد ٣.٠٠ د./وحدة.</div>';
    os.forEach(function(o,i){
      const tierTxt=o.tier===2?'ممتاز':(o.tier===1?'متوسط':'رخيص');
      h+='<div style="border:1px solid var(--line);border-radius:12px;padding:9px;margin-top:8px'+(o.declined?';opacity:.5':'')+'">'+
        '<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:13px">'+o.name+'</b><span style="font-size:11.5px;color:var(--dim)">'+tierTxt+' · تفاوض '+(o.neg||0)+'/2</span></div>'+
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:6px;font-size:11.5px;color:var(--dim)">'+
          '<div>السعر<br><b style="color:var(--txt)">'+o.unitCost.toFixed(2)+'</b></div>'+
          '<div>التسليم<br><b style="color:var(--txt)">'+Math.round(o.reliability*100)+'%</b></div>'+
          '<div>الجودة<br><b style="color:var(--txt)">+'+o.quality+'</b></div>'+
          '<div>الشحنة<br><b style="color:var(--txt)">'+o.volume+'</b></div></div>'+
        (o.declined?'<div style="font-size:11.5px;color:var(--dn);margin-top:6px">🚫 رفض التفاوض وانسحب</div>':
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:7px">'+
          '<button class="btnGhost" style="font-size:11.5px" onclick="negHard('+i+')" '+(o.neg>=2?'disabled':'')+'>💪 تفاوض صارم</button>'+
          '<button class="btnGhost" style="font-size:11.5px" onclick="negFair('+i+')" '+(o.neg>=2?'disabled':'')+'>🤝 خصم ٤٪</button>'+
          '<button class="btnGhost" style="font-size:11.5px" onclick="negPrem('+i+')" '+(o.neg>=2?'disabled':'')+'>⭐ اتفاقية ممتازة</button>'+
          '<button class="btnShort" style="font-size:11.5px" onclick="signSup('+i+')" '+(c.cash<o.fee?'disabled':'')+'>وقّع ('+fmtD(o.fee)+')</button>'+
        '</div>')+
      '</div>';
    });
  }
  if(c.sup.history&&c.sup.history.length){
    h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim)">آخر العقود: '+c.sup.history.slice(-3).reverse().map(function(x){return x.n+' ('+x.cost.toFixed(2)+')';}).join(' · ')+'</div>';
  }
  b.innerHTML=h;
}

const AUC_KINDS=[
 {k:'patent',n:'براءة اختراع',ic:'🧪',d:'+٨ جودة فورية وثقة السوق'},
 {k:'branch',n:'فرع جاهز',ic:'🏬',d:'+١٬٥٠٠ د. دخل يومي'},
 {k:'stake',n:'حصة ٥٪ في منافس',ic:'📊',d:'+قيمة سوقية وحصة أكبر'}
];
function genPubAuc(){
  const c=S.company;if(!c)return null;
  initCorp();
  const rival=(S.corp&&S.corp.length)?S.corp[Math.floor(RNG()*S.corp.length)]:null;
  const kind=AUC_KINDS[Math.floor(RNG()*AUC_KINDS.length)];
  const base=Math.round(rnd(20000,60000)/500)*500;
  const max=Math.round(base*rnd(1.5,2.2));
  S.pubAuc={item:kind.n,ic:kind.ic,kind:kind.k,d:kind.d,rival:rival?rival.n:'منافس',base:base,cur:base,max:max,leader:'npc',paid:0,bids:[],endDay:S.day+5,done:false,strength:rival?Math.min(1,rival.value/1200000):0.5};
  S.nextAuc=S.day+8;
  pushNews(S,'🔨 مزاد علني: "'+(rival?rival.n:'منافس')+'" بيطرح '+kind.n+' — المزايدة مفتوحة ٥ أيام',0.01,true,true);
  return S.pubAuc;
}
function pubAucTick(){
  const c=S.company;if(!c)return;
  const a=S.pubAuc;
  if(a&&!a.done&&S.day>=a.endDay)settleAuc();
  if(!S.pubAuc||S.pubAuc.done){
    if(!S.nextAuc)S.nextAuc=S.day+3;
    if(S.day>=S.nextAuc)genPubAuc();
  }
}
function settleAuc(){
  const a=S.pubAuc;if(!a||a.done)return;
  a.done=true;
  if(a.leader==='me')winAuc(a);
  else toast('🔨 المزاد خلص — "'+a.rival+'" خد "'+a.item+'"');
  S.nextAuc=S.day+8;
  save();
}
function winAuc(a){
  const c=S.company;
  if(a.kind==='patent'){c.quality=Math.min(100,(c.quality||0)+8);c.patents=(c.patents||0)+1;}
  else if(a.kind==='branch'){c.aucIncome=(c.aucIncome||0)+1500;c.aucBranches=(c.aucBranches||0)+1;}
  else {c.aucValue=(c.aucValue||0)+Math.round(a.cur*0.9);c.aucStakes=(c.aucStakes||0)+1;}
  c.aucWon=(c.aucWon||0)+1;
  toast('🔨 كسبت المزاد: '+a.item+' بـ'+fmtD(a.cur));
  pushNews(S,'🔨 "'+c.name+'" كسبت مزاد "'+a.item+'" بـ'+fmtD(a.cur)+' من "'+a.rival+'"',0.02,true,true);
  log('مزاد: '+a.item+' بـ'+a.cur);
  save();checkAchv();renderAll();
}
function bidAuc(){
  const a=S.pubAuc;if(!a||a.done)return false;
  if(a.leader==='me')return false;
  const next=Math.round(a.cur*1.05);
  if(S.cash<next)return false;
  S.cash-=next;a.paid=next;a.cur=next;a.leader='me';
  a.bids.push({d:S.day,p:next,who:'me'});
  const chance=0.3+a.strength*0.45;
  if(Math.round(a.cur*1.04)<=a.max&&RNG()<chance){
    S.cash+=a.paid;a.paid=0;
    a.cur=Math.round(a.cur*1.04);a.leader='npc';
    a.bids.push({d:S.day,p:a.cur,who:'npc'});
    toast('⚔️ "'+a.rival+'" زوّد المزايدة لـ'+fmtD(a.cur));
  }
  save();renderAuc();renderCompany();
  return true;
}
function renderAuc(){
  const b=$('aucBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const a=S.pubAuc;
  if(!a||a.done){
    const nxt=Math.max(0,(S.nextAuc||0)-S.day);
    b.innerHTML='<div style="font-size:12.5px;color:var(--dim)">مفيش مزاد شغال حاليًا — المزاد الجاي بعد '+nxt+' يوم.</div>'+
      ((c.aucWon)?'<div style="margin-top:6px;font-size:12px;color:var(--up)">كسبت '+c.aucWon+' مزاد · دخل إضافي '+fmtD(c.aucIncome||0)+'/يوم · قيمة من الحصص '+fmtD(c.aucValue||0)+'</div>':'');
    return;
  }
  const left=Math.max(0,a.endDay-S.day);
  const next=Math.round(a.cur*1.05);
  let h='<div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:14px">'+a.ic+' '+a.item+'</b><span style="font-size:12px;color:var(--dim)">من '+a.rival+' · باقي '+left+' يوم</span></div>';
  h+='<div style="font-size:12px;color:var(--dim);margin:4px 0 8px">'+a.d+'</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12px;color:var(--dim)">'+
    '<div>السعر الحالي<br><b style="color:var(--txt);font-size:15px">'+fmtD(a.cur)+'</b></div>'+
    '<div>المتصدر<br><b style="color:'+(a.leader==='me'?'var(--up)':'var(--dn)')+';font-size:12.5px">'+(a.leader==='me'?'أنت':'المنافس')+'</b></div>'+
    '<div>سقف المنافس<br><b style="color:var(--txt);font-size:12.5px">'+fmtD(a.max)+'</b></div></div>';
  h+='<div class="tradeRow" style="margin-top:8px"><button class="btnShort" onclick="bidAuc()" '+(a.leader==='me'||S.cash<next?'disabled':'')+'>'+(a.leader==='me'?'أنت المتصدر ✔':'زايد +٥٪ ('+fmtD(next)+')')+'</button></div>';
  if(a.bids.length){
    h+='<div style="margin-top:6px;font-size:11.5px;color:var(--dim)">آخر المزايدات: '+a.bids.slice(-4).reverse().map(function(x){return (x.who==='me'?'أنت':'المنافس')+' '+fmtD(x.p);}).join(' · ')+'</div>';
  }else{
    h+='<div style="margin-top:6px;font-size:11.5px;color:var(--dim)">لسه مفيش مزايدات — السعر الافتتاحي '+fmtD(a.base)+'</div>';
  }
  b.innerHTML=h;
}

const WAR_MOVES=[
 {k:'price',n:'حرب أسعار',ic:'🏷️',d:'المنافس خفّض أسعاره — الطلب على منتجك بينزل طول الهجوم',hit:0.14,days:5},
 {k:'raid',n:'سطو على الكفاءات',ic:'🎯',d:'المنافس بيجذب أفضل مهندسيك بعروض أعلى',hit:0.08,days:1},
 {k:'smear',n:'حملة تشويه',ic:'🗣️',d:'شائعات منظمة عن جودة منتجك على السوشيال ميديا',hit:0.10,days:4},
 {k:'squeeze',n:'حصار توريد',ic:'🔗',d:'المنافس بيزاحمك على نفس الموردين — تكلفة الوحدة بتزيد',hit:0.12,days:4}
];
function warLog(t){
  if(!S.war)return;
  if(!S.war.log)S.war.log=[];
  S.war.log.push({d:S.day,t:t});
  if(S.war.log.length>8)S.war.log.shift();
}
function warDemandF(){
  const w=S.war;
  if(!w||!w.active||w.active.k!=='price')return 1;
  return Math.max(0.6,1-w.active.hit*(1-0.7*(w.shield||0)));
}
function warCostF(){
  const w=S.war;
  if(!w||!w.active||w.active.k!=='squeeze')return 1;
  return 1+w.active.hit*(1-0.7*(w.shield||0));
}
function warDefendCost(){
  return Math.round(6000+4000*((S.war&&S.war.shield)||0));
}
function warDefend(){
  const c=S.company;
  if(!c||!S.rival||!S.war)return false;
  const cost=warDefendCost();
  if(c.cash<cost)return false;
  if((S.war.shield||0)>=1)return false;
  c.cash-=cost;
  S.war.shield=Math.min(1,(S.war.shield||0)+0.5);
  S.war.shieldDays=Math.max(S.war.shieldDays||0,6);
  if(S.war.active)S.war.active.left=Math.max(1,(S.war.active.left||1)-2);
  warLog('🛡️ دفاع استباقي — الدرع '+Math.round(S.war.shield*100)+'%');
  toast('🛡️ الدرع الدفاعي اشتغل — الهجمات أضعف');
  save();renderWar();renderCompany();renderHead();
  return true;
}
function launchWarMove(kind){
  const c=S.company,r=S.rival;
  if(!c||!r)return null;
  if(!S.war)S.war={active:null,next:S.day+4,shield:0,shieldDays:0,wins:0,losses:0,log:[],blocked:0};
  let def=null;
  WAR_MOVES.forEach(function(m){if(m.k===kind)def=m;});
  if(!def)def=WAR_MOVES[Math.floor(RNG()*WAR_MOVES.length)];
  const mv={k:def.k,n:def.n,ic:def.ic,d:def.d,left:def.days,hit:def.hit};
  S.war.active=mv;
  if(def.k==='raid'){
    const q=Math.max(1,Math.round(c.workers*0.05));
    c.workers=Math.max(1,c.workers-q);
    c.morale=Math.max(0,(c.morale||60)-5);
    mv.left=1;
    toast('🎯 '+r.name+' سحب '+q+' من كفاءاتك');
  }else if(def.k==='smear'){
    c.brand=Math.max(0,(c.brand||10)-6);
    c.rep=Math.max(0,(c.rep||50)-4);
    toast('🗣️ حملة تشويه من '+r.name+' — العلامة والسمعة نزلت');
  }else if(def.k==='price'){
    toast('🏷️ '+r.name+' بدأ حرب أسعار');
  }else{
    toast('🔗 '+r.name+' بيضغط على الموردين');
  }
  S.war.next=S.day+Math.round(rnd(7,12));
  warLog(def.ic+' هجوم "'+def.n+'" من '+r.name);
  pushNews(S,def.ic+' '+r.name+' يشن '+def.n+' ضد "'+c.name+'"',-0.012,true,true);
  refreshNewsUI();
  save();
  return mv;
}
function warTick(){
  const c=S.company;
  if(!S.war)return;
  const w=S.war;
  if(!c||!S.rival){w.active=null;return;}
  if(w.shieldDays>0){
    w.shieldDays--;
    if(w.shieldDays<=0){w.shield=0;toast('🛡️ انتهى الدرع الدفاعي');}
  }
  if(w.active){
    w.active.left=(w.active.left||0)-1;
    if(w.active.left<=0){
      const a=w.active;
      const blockChance=0.15+(w.shield||0)*0.7;
      if(RNG()<blockChance){
        w.wins++;w.blocked++;
        warLog('✅ صدّيت '+a.n);
        toast('🛡️ صدّيت هجوم "'+a.n+'"');
        pushNews(S,'🛡️ "'+c.name+'" تصدّت لهجوم "'+a.n+'" من '+S.rival.name,0.008,false,true);
      }else{
        w.losses++;
        c.rep=Math.max(0,(c.rep||50)-3);
        c.brand=Math.max(0,(c.brand||10)-2);
        warLog('❌ '+a.n+' اخترق دفاعاتك');
        toast('⚠️ هجوم "'+a.n+'" نجح — سمعة وعلامة نزلت');
        pushNews(S,'⚠️ "'+c.name+'" اتضررت من '+a.n+' — السمعة -3',-0.008,false,true);
      }
      w.active=null;
    }
  }else if(S.day>=(w.next||0)){
    if(allyOf(S.rival.name)){w.next=S.day+Math.round(rnd(5,9));return;}
    if(RNG()<0.6+Math.min(0.35,S.rival.strength*0.2))launchWarMove();
    else w.next=S.day+Math.round(rnd(4,8));
  }
}
function warEffectTxt(a){
  if(!a)return '';
  if(a.k==='price')return 'الطلب -'+Math.round((1-warDemandF())*100)+'%';
  if(a.k==='squeeze')return 'تكلفة التوريد +'+Math.round((warCostF()-1)*100)+'%';
  if(a.k==='smear')return 'ضغط على العلامة والسمعة';
  return 'خسارة كفاءات وروح معنوية';
}
function renderWar(){
  const b=$('warBody');if(!b)return;
  const c=S.company;
  if(!c||!S.rival){b.innerHTML='<div style="font-size:13px;color:var(--dim)">مفيش منافس مباشر لشركتك حاليًا.</div>';return;}
  if(!S.war)S.war={active:null,next:S.day+4,shield:0,shieldDays:0,wins:0,losses:0,log:[],blocked:0};
  const w=S.war,r=S.rival,a=w.active;
  let h='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap"><b style="font-size:14px">'+r.name+'</b><span style="font-size:12px;color:var(--dim)">السجل: <b style="color:var(--up)">'+w.wins+' صدّ</b> · <b style="color:var(--dn)">'+w.losses+' اختراق</b></span></div>';
  h+='<div style="height:8px;background:#1a2340;border-radius:6px;max-width:320px;margin:8px 0 4px"><div style="width:'+Math.min(100,r.strength/2*100).toFixed(0)+'%;height:100%;border-radius:6px;background:var(--down)"></div></div>';
  if(a){
    h+='<div style="border:1px solid var(--line);border-radius:12px;padding:10px;margin-top:8px;background:var(--panel2)">'+
      '<div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:13.5px">'+a.ic+' '+a.n+'</b><span style="font-size:12px;color:var(--dn)">باقي '+Math.max(0,a.left)+' يوم</span></div>'+
      '<div style="font-size:12px;color:var(--dim);margin:4px 0 6px">'+a.d+'</div>'+
      '<div style="font-size:12.5px">الأثر الحالي: <b style="color:var(--dn)">'+warEffectTxt(a)+'</b>'+(w.shield>0?' · الدرع بيخفف <b style="color:var(--up)">'+Math.round(w.shield*70)+'%</b>':'')+'</div></div>';
  }else{
    const nx=Math.max(0,(w.next||0)-S.day);
    h+='<div style="margin-top:8px;font-size:13px;color:var(--dim)">هدوء مؤقت — توقعات هجوم جديد خلال <b style="color:var(--txt)">'+nx+' يوم</b>.</div>';
  }
  if(w.shield>0)h+='<div style="margin-top:8px;font-size:12.5px;color:var(--up)">🛡️ درع دفاعي شغال (باقي '+w.shieldDays+' يوم) — قوة '+Math.round(w.shield*100)+'%</div>';
  const cost=warDefendCost();
  h+='<div class="tradeRow" style="margin-top:10px"><button class="btnShort" onclick="warDefend()" '+(c.cash<cost||w.shield>=1?'disabled':'')+'>🛡️ دفاع استباقي ('+fmtD(cost)+' من الخزينة)</button></div>';
  if(w.log&&w.log.length){
    h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim);line-height:1.7">'+w.log.slice(-4).reverse().map(function(x){return '• يوم '+x.d+': '+x.t;}).join('<br>')+'</div>';
  }
  b.innerHTML=h;
}

const ALLY_TRAITS=[
 {k:'dist',n:'شبكة توزيع قوية',ic:'🚚'},
 {k:'plant',n:'مصنع بتكلفة منخفضة',ic:'🏭'},
 {k:'brand',n:'علامة معروفة',ic:'✨'},
 {k:'rnd',n:'بحوث وتطوير',ic:'🔬'},
 {k:'base',n:'قاعدة عملاء كبيرة',ic:'👥'}
];
function allyDef(){
  if(!S.allies)S.allies={list:[],pact:null,heat:0,fines:0,log:[]};
  return S.allies;
}
function allyOf(name){
  const A=allyDef();
  return A.list.filter(function(a){return a.name===name;})[0]||null;
}
function allyChance(corp){
  const c=S.company;if(!c||!corp)return 0;
  const myRep=(c.rep==null?50:c.rep);
  let ch=0.35+(myRep-50)/200+(corp.rep<myRep?0.15:-0.1)+Math.min(0.2,companyValue()/5000000);
  if(allyDef().list.length>=3)ch-=0.25;
  return Math.max(0.05,Math.min(0.95,ch));
}
function allyLog(t){
  const A=allyDef();
  if(!A.log)A.log=[];
  A.log.push({d:S.day,t:t});
  if(A.log.length>8)A.log.shift();
}
function offerAlliance(i){
  const c=S.company;if(!c)return false;
  initCorp();
  const corp=S.corp[i];if(!corp)return false;
  const A=allyDef();
  if(allyOf(corp.n))return false;
  if(A.list.length>=3)return false;
  const cost=Math.round(corp.value*0.02);
  if(c.cash<cost)return false;
  c.cash-=cost;
  if(RNG()<allyChance(corp)){
    const tr=ALLY_TRAITS[Math.floor(RNG()*ALLY_TRAITS.length)];
    A.list.push({name:corp.n,trait:tr.k,traitN:tr.n,ic:tr.ic,since:S.day});
    allyLog('🤝 تحالف مع '+corp.n+' ('+tr.n+')');
    toast('🤝 تحالف ناجح مع '+corp.n+' — '+tr.n);
    pushNews(S,'🤝 "'+c.name+'" تتحالف مع "'+corp.n+'"',0.012,true,true);
    save();renderAll();
    return true;
  }
  allyLog('❌ '+corp.n+' رفض عرض التحالف');
  toast('❌ '+corp.n+' رفض التحالف — الرسوم اتدفعت');
  save();renderAll();
  return false;
}
function breakAlliance(name){
  const A=allyDef();const c=S.company;
  if(!c)return false;
  const before=A.list.length;
  A.list=A.list.filter(function(a){return a.name!==name;});
  if(A.list.length===before)return false;
  c.rep=Math.max(0,(c.rep||50)-5);
  if(A.list.length<2&&A.pact)dissolveCartel('التحالف انخفض تحت ٢');
  allyLog('💔 فض التحالف مع '+name);
  toast('💔 فضيت التحالف مع '+name+' — السمعة -5');
  save();renderAll();
  return true;
}
function allyDemandF(){
  const A=S.allies;
  if(!A||!A.list||!A.list.length)return 1;
  let f=1;
  A.list.forEach(function(a){
    if(a.trait==='dist')f+=0.08;
    else if(a.trait==='base')f+=0.06;
    else if(a.trait==='brand')f+=0.04;
    else f+=0.03;
  });
  if(A.pact)f+=0.05;
  return f;
}
function allyCostF(){
  const A=S.allies;
  if(!A||!A.list)return 1;
  let f=1;
  A.list.forEach(function(a){if(a.trait==='plant')f-=0.10;});
  return Math.max(0.7,f);
}
function allyQualityBonus(){
  const A=S.allies;
  if(!A||!A.list)return 0;
  return A.list.filter(function(a){return a.trait==='rnd';}).length*0.3;
}
function formCartel(){
  const c=S.company;const A=allyDef();
  if(!c||A.pact)return false;
  if(A.list.length<2)return false;
  const fee=Math.round(companyValue()*0.01);
  if(c.cash<fee)return false;
  c.cash-=fee;
  A.pact={since:S.day,heat:0,paid:fee};
  A.heat=Math.max(A.heat||0,10);
  allyLog('🤫 كارتيل مع '+A.list.length+' شركات');
  toast('🤫 الكارتيل اتفعّل — سعرك بيتباع ١٢٪ فوق السوق');
  pushNews(S,'🤫 كارتيل بين "'+c.name+'" وشركائها يرفع الأسعار في القطاع',0.015,true,true);
  save();renderAll();
  return true;
}
function dissolveCartel(reason){
  const A=S.allies;
  if(!A||!A.pact)return false;
  A.pact=null;A.heat=Math.round((A.heat||0)*0.5);
  allyLog('🚫 انحل الكارتيل ('+(reason||'قرار يدوي')+')');
  return true;
}
function allyTick(){
  const c=S.company;const A=S.allies;
  if(!A||!c||!A.pact)return;
  A.heat=(A.heat||0)+1;
  A.pact.heat=A.heat;
  const risk=Math.min(0.35,(A.heat||0)*0.008);
  if(RNG()<risk){
    const fine=Math.round(companyValue()*0.015)+5000;
    c.cash=Math.max(0,c.cash-fine);
    c.rep=Math.max(0,(c.rep||50)-8);
    A.fines=(A.fines||0)+fine;
    A.pact=null;A.heat=Math.round((A.heat||0)*0.4);
    allyLog('⚖️ غرامة مكافحة الاحتكار '+fmtD(fine));
    toast('⚖️ جهاز حماية المنافسة غرّمك '+fmtD(fine)+' — الكارتيل انحل');
    pushNews(S,'⚖️ غرامة مكافحة احتكار على "'+c.name+'" بـ'+fmtD(fine),-0.015,true,true);
  }
  save();
}
function renderAlly(){
  const b=$('allyBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  initCorp();
  const A=allyDef();
  let h='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap"><b style="font-size:13.5px">تحالفاتك: '+A.list.length+'/3</b><span style="font-size:12px;color:var(--dim)">'+(A.pact?'🤫 كارتيل شغال':'مفيش كارتيل')+'</span></div>';
  if(A.list.length){
    h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">'+A.list.map(function(a){
      return '<span class="badge" style="padding:4px 8px">'+a.ic+' '+a.name+' — '+a.traitN+' <a href="#" onclick="breakAlliance(\''+a.name+'\');return false" style="color:var(--down)">✕</a></span>';
    }).join('')+'</div>';
  }
  h+='<div style="margin-top:10px">'+S.corp.map(function(cp,i){
    const mine=allyOf(cp.n);
    const cost=Math.round(cp.value*0.02);
    const ch=Math.round(allyChance(cp)*100);
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;flex-wrap:wrap">'+
      '<span><b>'+cp.n+'</b> <span style="color:var(--dim)">سمعة '+Math.round(cp.rep)+' · قيمة '+fmtD(cp.value)+'</span></span>'+
      (mine?'<span style="color:var(--up)">متحالف ✔</span>':
        '<button class="btnShort" onclick="offerAlliance('+i+')" '+(A.list.length>=3||c.cash<cost?'disabled':'')+'>عرض تحالف ('+fmtD(cost)+' · فرصة '+ch+'٪)</button>')+
      '</div>';
  }).join('')+'</div>';
  h+='<div style="margin-top:12px;border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--panel2)">';
  if(A.pact){
    const heat=Math.min(100,Math.round((A.heat||0)*3));
    h+='<div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:13px">🤫 كارتيل الأسعار</b><span style="font-size:12px;color:var(--dn)">رقابة '+heat+'٪</span></div>';
    h+='<div style="height:7px;background:#1a2340;border-radius:6px;margin:6px 0"><div style="width:'+heat+'%;height:100%;border-radius:6px;background:'+(heat>60?'var(--down)':'var(--gold)')+'"></div></div>';
    h+='<div style="font-size:12px;color:var(--dim)">سعرك بيتباع ١٢٪ فوق سعر السوق، وخطر غرامة '+fmtD(Math.round(companyValue()*0.015)+5000)+' كل يوم.</div>';
    h+='<div class="tradeRow"><button class="btnShort" onclick="if(dissolveCartel(\'قرار يدوي\')){save();renderAll();}">🚫 فض الكارتيل</button></div>';
  }else{
    const fee=Math.round(companyValue()*0.01);
    h+='<b style="font-size:13px">🤫 كارتيل الأسعار</b>';
    h+='<div style="font-size:12px;color:var(--dim);margin:4px 0 6px">محتاج تحالفين على الأقل. بيديك قوة تسعير +١٢٪ لكنه بيرفع الرقابة وغرامة محتملة لو انكشف.</div>';
    h+='<div class="tradeRow"><button class="btnShort" onclick="formCartel()" '+(A.list.length<2||c.cash<fee?'disabled':'')+'>تكوين كارتيل ('+fmtD(fee)+')</button></div>';
  }
  h+='</div>';
  if(A.log&&A.log.length){
    h+='<div style="margin-top:8px;font-size:11.5px;color:var(--dim);line-height:1.7">'+A.log.slice(-4).reverse().map(function(x){return '• يوم '+x.d+': '+x.t;}).join('<br>')+'</div>';
  }
  b.innerHTML=h;
}

const SUB_PLANS=[
 {k:'basic',n:'أساسي',ic:'🎫',price:25,cap:2400,churn:0.10,need:0},
 {k:'pro',n:'احترافي',ic:'💎',price:60,cap:900,churn:0.06,need:45},
 {k:'premium',n:'بريميوم',ic:'👑',price:140,cap:320,churn:0.03,need:70}
];
function subsOf(c){
  if(!c)return null;
  if(!c.subs)c.subs={active:false,plan:null,members:0,price:0,mrr:0,churn:0,total:0,launchDay:0};
  return c.subs;
}
function subPlanOf(k){
  return SUB_PLANS.filter(function(p){return p.k===k;})[0]||SUB_PLANS[0];
}
function subTick(c){
  const s=subsOf(c);
  if(!s||!s.active||!s.plan){if(s)s.mrr=0;return 0;}
  const plan=subPlanOf(s.plan);
  const q=Math.max(0,Math.min(100,c.quality||0));
  const brand=Math.max(0,Math.min(100,c.brand||10));
  const rep=Math.max(0,Math.min(100,c.rep==null?50:c.rep));
  const sectorMood=avgSectorSent(c.sector);
  let target=plan.cap*(0.25+q/150)*(0.55+brand/220)*(0.5+rep/200)*(1+sectorMood*0.4);
  target=Math.max(0,Math.min(plan.cap,target));
  s.members=Math.max(0,s.members+(target-s.members)*0.06);
  const gap=Math.max(0,(plan.need||0)-q);
  const churn=plan.churn*(1+gap/25)*(1+(60-Math.min(60,rep))/120)*(1+Math.max(0,(55-q))/70)*careChurnF(c);
  s.churn=churn;
  s.members=Math.max(0,s.members*(1-churn/30));
  s.members=Math.round(s.members);
  s.price=plan.price;
  s.mrr=Math.round(s.members*plan.price);
  const rev=Math.round(s.mrr/30);
  s.total=(s.total||0)+rev;
  if(churn>0.12)c.brand=Math.max(0,(c.brand||10)-0.05);
  return rev;
}
function launchSub(k){
  const c=S.company;if(!c)return false;
  const plan=subPlanOf(k);
  if((c.quality||0)<(plan.need||0))return false;
  const s=subsOf(c);
  const was=s.active&&s.members>0;
  s.active=true;s.plan=k;s.price=plan.price;s.launchDay=S.day;
  if(was)s.members=Math.round(s.members*0.6);
  s.mrr=Math.round((s.members||0)*plan.price);
  pushNews(S,'🎫 "'+c.name+'" تطلق خطة اشتراك '+plan.n+' بـ'+plan.price+' د./شهر',0.01,false,true);
  toast('🎫 خطة '+plan.n+' اشتغلت — '+plan.price+' د./شهر');
  save();renderAll();
  return true;
}
function stopSub(){
  const c=S.company;if(!c||!c.subs)return false;
  if(!c.subs.active)return false;
  c.subs.active=false;c.subs.members=0;c.subs.mrr=0;c.subs.churn=0;
  toast('⏹️ الاشتراكات اتوقفت');
  save();renderAll();
  return true;
}
function renderSub(){
  const b=$('subBody');if(!b)return;
  const c=S.company;
  if(!c){b.innerHTML='<div style="color:var(--dim);font-size:13px">أسّس شركة أولًا.</div>';return;}
  const s=subsOf(c);
  let h='';
  if(s.active){
    const plan=subPlanOf(s.plan);
    const fill=Math.min(100,Math.round((s.members||0)/plan.cap*100));
    h+='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap"><b style="font-size:13.5px">'+plan.ic+' خطة '+plan.n+' — '+plan.price+' د./شهر</b><span style="font-size:12px;color:var(--dim)">إجمالي الإيراد '+fmtD(s.total||0)+'</span></div>';
    h+='<div class="kpis" style="margin-top:8px">'+kpi('مشتركون',Math.round(s.members||0))+kpi('إيراد شهري متكرر',fmtD(s.mrr||0))+kpi('فقد شهري',((s.churn||0)*100).toFixed(1)+'%')+'</div>';
    h+='<div style="height:8px;background:#1a2340;border-radius:6px;margin-top:8px"><div style="width:'+fill+'%;height:100%;border-radius:6px;background:var(--up)"></div></div>';
    h+='<div style="font-size:11.5px;color:var(--dim);margin-top:4px">'+Math.round(s.members||0)+' من سقف '+plan.cap+' مشترك ('+fill+'٪) — الدخل اليومي من الاشتراكات '+fmtD(Math.round((s.mrr||0)/30))+'</div>';
  }else{
    h+='<div style="font-size:12.5px;color:var(--dim);margin-bottom:8px">مفيش خطة شغالة. اختار خطة وابدأ دخل متكرر؛ كل ما الجودة والعلامة والسمعة يعلى، عدد المشتركين يقرب من سقف الخطة.</div>';
  }
  h+='<div style="margin-top:10px">'+SUB_PLANS.map(function(p){
    const on=s.active&&s.plan===p.k;
    const can=(c.quality||0)>=(p.need||0);
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:12.5px;flex-wrap:wrap">'+
      '<span><b>'+p.ic+' '+p.n+'</b> <span style="color:var(--dim)">'+p.price+' د./شهر · سقف '+p.cap+(p.need?' · جودة '+p.need+'+':'')+'</span></span>'+
      (on?'<span style="color:var(--up)">مفعّلة ✔</span>':
        '<button class="btnShort" onclick="launchSub(\''+p.k+'\')" '+(can?'':'disabled')+'>'+(can?'تشغيل الخطة':'جودة غير كافية')+'</button>')+
      '</div>';
  }).join('')+'</div>';
  if(s.active)h+='<div class="tradeRow"><button class="btnGhost" onclick="stopSub()">⏹️ إيقاف الاشتراكات</button></div>';
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

const TEAM_ROLES=['eng','sales','mkt'];
function teamDef(){return {xp:{eng:0,sales:0,mkt:0},lastBonus:-99,bonuses:0,trains:0};}
function teamOf(c){
  const cc=c||S.company;
  if(!cc)return teamDef();
  if(!cc.team)cc.team=teamDef();
  TEAM_ROLES.forEach(function(k){if(cc.team.xp[k]==null)cc.team.xp[k]=0;});
  return cc.team;
}
function teamStars(k,c){
  const t=teamOf(c);const xp=t.xp[k]||0;
  return xp>=180?3:(xp>=120?2:(xp>=60?1:0));
}
function teamMult(k,c){return 1+teamStars(k,c)*0.15;}
function teamEff(k,c){const cc=c||S.company;return ((cc&&cc.staff&&cc.staff[k])||0)*teamMult(k,cc);}
function teamTick(c){
  const t=teamOf(c);
  const morale=(c.morale==null?60:c.morale);
  const profit=Math.max(0,c.todayProfit||0);
  const gain=1+morale/60+Math.min(2,profit/20000);
  TEAM_ROLES.forEach(function(k){if((c.staff[k]||0)>0)t.xp[k]=Math.min(999,t.xp[k]+gain);});
}
function trainTeam(k){
  const c=S.company;if(!c)return false;
  if(!(c.staff&&c.staff[k]>0))return false;
  const cost=6000;
  if(c.cash<cost)return false;
  const t=teamOf(c);
  c.cash-=cost;t.xp[k]=Math.min(999,t.xp[k]+45);t.trains=(t.trains||0)+1;
  const def=STAFF.find(function(x){return x.k===k;});
  toast('🎓 تدريب '+def.n+' — الخبرة +45');
  save();renderHR();renderCompany();
  return true;
}
function payBonus(){
  const c=S.company;if(!c)return false;
  const t=teamOf(c);
  if(S.day-t.lastBonus<10)return false;
  const cost=Math.round(c.workers*40+staffCost(c));
  if(c.cash<cost)return false;
  c.cash-=cost;
  const boost=Math.min(14,6+Math.round(cost/20000));
  c.morale=Math.min(100,(c.morale==null?60:c.morale)+boost);
  t.lastBonus=S.day;t.bonuses=(t.bonuses||0)+1;
  toast('🎁 مكافأة جماعية — الروح المعنوية +'+boost);
  pushNews(S,'🎁 "'+c.name+'" صرفت مكافأة للفريق — رضا الموظفين ارتفع',0.01,true,true);
  save();renderHR();renderCompany();
  return true;
}
function renderTeamBlock(c){
  const t=teamOf(c);
  let h='<div style="margin-top:12px;font-weight:700;font-size:13px">⭐ نجوم الفريق وخبرتهم</div>';
  h+='<div style="font-size:11.5px;color:var(--dim);margin:4px 0 6px">كل نجمة تزيد إنتاجية الدور ١٥٪ — الخبرة بتزيد يوميًا مع الربح ورضا الفريق، أو بالتدريب.</div>';
  TEAM_ROLES.forEach(function(k){
    const def=STAFF.find(function(x){return x.k===k;});
    const st=teamStars(k,c);const xp=Math.round(t.xp[k]||0);
    const nextXp=st>=3?180:[60,120,180][st];
    const pct=Math.min(100,Math.round(xp/180*100));
    const stars='★'.repeat(st)+'☆'.repeat(3-st);
    h+='<div style="padding:6px 0;border-bottom:1px solid var(--line)">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px"><span>'+def.ic+' '+def.n+' <b style="color:#f59e0b;letter-spacing:2px">'+stars+'</b></span>'+
      '<span style="font-size:12px;color:var(--dim)">خبرة '+xp+(st<3?' / '+nextXp:' · أقصى نجوم')+'</span></div>'+
      '<div style="height:6px;background:var(--panel2);border-radius:5px;overflow:hidden;margin:4px 0 6px"><div style="height:100%;width:'+pct+'%;background:#f59e0b"></div></div>'+
      '<div style="display:flex;justify-content:space-between;align-items:center;font-size:11.5px;color:var(--dim)"><span>إنتاجية الدور ×'+teamMult(k,c).toFixed(2)+'</span>'+
      ((c.staff[k]||0)>0?'<button class="btnGhost" style="font-size:11.5px" onclick="trainTeam(\''+k+'\')" '+(c.cash<6000?'disabled':'')+'>🎓 تدريب (6.0 ألف د.)</button>':'<span>عيّن أول موظف في الدور</span>')+
      '</div></div>';
  });
  const cool=Math.max(0,10-(S.day-t.lastBonus));
  const bcost=Math.round(c.workers*40+staffCost(c));
  h+='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap">'+
    '<span style="font-size:12px;color:var(--dim)">'+(cool>0?'المكافأة القادمة بعد '+cool+' يوم':'مكافأة جماعية جاهزة — ترفع رضا الفريق')+'</span>'+
    '<button class="btnShort" style="font-size:12px" onclick="payBonus()" '+(cool>0||c.cash<bcost?'disabled':'')+'>🎁 مكافأة جماعية ('+fmtD(bcost)+')</button></div>';
  if(t.bonuses||t.trains){
    h+='<div style="margin-top:6px;font-size:11.5px;color:var(--dim)">مكافآت مصروفة: '+(t.bonuses||0)+' · جلسات تدريب: '+(t.trains||0)+'</div>';
  }
  return h;
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
  h+=renderTeamBlock(c);
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
function renderAll(){renderHead();renderMarket();renderAsset();renderPortfolio();renderBank();renderCompany();renderRanks();renderIdx();renderAchv();renderIPO();renderPend();renderDonut();renderStats();renderUpg();renderGoal();renderProps();renderBonds();renderRival();renderQuests();renderLotto();renderMood();renderNotifs();renderMovers();renderGEvent();renderDepth();renderPrestige();renderBranches();renderChallenge();renderOptions();renderAutopilot();renderWeekly();renderHeatmap();renderTA();renderMining();renderAuction();renderFG();renderIns();renderShare();renderDivCal();renderQuiz();renderDuel();renderFunds();renderDailyRecap();renderConf();renderVC();renderMargin();renderBench();renderBackup();renderEconCal();renderHF();renderOrders();renderMacro();renderHR();renderPerf();renderAcq();renderBrand();renderRep();renderInv();renderHealth();renderCorp();renderSup();renderAuc();renderWar();renderAlly();renderSub();renderCare();renderMerger();renderFr();renderBid();renderAudit();renderCbond();renderTender();renderLobby();renderQA();renderSmug();renderTax();renderBizins();renderRIPO();renderDash();renderCris();renderTech();}

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
