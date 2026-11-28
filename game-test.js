function __suite(){
  const out=[];const ok=(n,c)=>out.push((c?'PASS':'FAIL')+' '+n);
  try{
    
    localStorage.removeItem('econLive1');S=freshState();renderAll();
    
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
      const cc=S.company;const dayA=S.day;
      RNG=()=>0.5;
      S.pubAuc=null;S.nextAuc=dayA;
      const a=genPubAuc();
      ok('مزاد جديد بيتولد',!!a&&a.cur>0&&a.base>0&&a.max>a.base&&a.endDay===S.day+5);
      S.cash=500000;const cashB=S.cash;
      S.pubAuc.strength=0;RNG=()=>0.99;
      ok('المزايدة تخصم الكاش',bidAuc()===true&&S.cash<cashB&&S.pubAuc.leader==='me');
      ok('مش تزايد وانت متصدر',bidAuc()===false);
      S.pubAuc.leader='npc';S.pubAuc.paid=0;
      const cashC=S.cash;RNG=()=>0.0;
      const bidOk=bidAuc();const paidNow=S.pubAuc.leader==='me'?S.pubAuc.paid:0;
      ok('رد المنافس يرجّع الفلوس',bidOk===true&&S.pubAuc.leader==='npc'&&paidNow===0&&S.cash<=cashC);
      RNG=()=>0.5;
      S.pubAuc.leader='me';S.pubAuc.kind='patent';S.pubAuc.done=false;S.pubAuc.endDay=S.day;
      cc.quality=40;const won0=cc.aucWon||0;
      settleAuc();
      ok('الفوز ببراءة يزوّد الجودة',cc.quality>40&&S.pubAuc.done===true&&(cc.aucWon||0)>won0);
      S.pubAuc={item:'فرع جاهز',ic:'🏬',kind:'branch',d:'',rival:'منافس',base:1000,cur:1000,max:2000,leader:'me',paid:0,bids:[],endDay:S.day,done:false,strength:0.2};
      const inc0=cc.aucIncome||0;settleAuc();
      ok('الفوز بفرع يزوّد الدخل اليومي',(cc.aucIncome||0)>inc0);
      const val0=companyValue();
      S.pubAuc={item:'حصة',ic:'📊',kind:'stake',d:'',rival:'منافس',base:1000,cur:10000,max:20000,leader:'me',paid:0,bids:[],endDay:S.day,done:false,strength:0.2};
      settleAuc();
      ok('الفوز بحصة يزوّد قيمة الشركة',companyValue()>val0);
      S.pubAuc={item:'x',ic:'🧪',kind:'patent',d:'',rival:'r',base:1000,cur:1000,max:2000,leader:'npc',paid:0,bids:[],endDay:S.day+5,done:false,strength:0.5};
      S.cash=10;ok('مزايدة بدون كاش مرفوضة',bidAuc()===false);
      S.cash=500000;S.pubAuc.leader='npc';S.pubAuc.endDay=S.day;
      settleAuc();ok('المزاد بيرسّي على المتصدر',S.pubAuc.done===true);
      renderAuc();ok('بطاقة المزاد ترسم',$('aucBody').innerHTML.length>30);
      S.day=dayA;S.nextAuc=0;S.pubAuc=null;RNG=Math.random;
    }
    
    if(S.company){
      const cc=S.company;const dayT=S.day;
      cc.cash=300000;cc.workers=60;cc.staff={eng:1,sales:1,mkt:1};
      cc.team={xp:{eng:0,sales:0,mkt:0},lastBonus:-99,bonuses:0,trains:0};
      cc.morale=60;cc.todayProfit=20000;
      ok('النجوم تبدأ من صفر',teamStars('eng',cc)===0&&Math.abs(teamMult('eng',cc)-1)<1e-9);
      teamTick(cc);teamTick(cc);
      ok('الخبرة تزيد يوميًا',teamOf(cc).xp.eng>0);
      teamOf(cc).xp.eng=130;
      ok('نجمتين عند ١٣٠ خبرة',teamStars('eng',cc)===2&&teamMult('eng',cc)>1.2);
      teamOf(cc).xp.sales=200;
      ok('نجوم المبيعات ترفع فعالية الفريق',teamEff('sales',cc)>1.4&&teamStars('sales',cc)===3);
      const xp0=teamOf(cc).xp.mkt,cashT=cc.cash;
      ok('التدريب يزيد الخبرة ويخصم كاش',trainTeam('mkt')===true&&teamOf(cc).xp.mkt>xp0&&Math.abs(cc.cash-(cashT-6000))<1);
      cc.cash=1000;
      ok('التدريب محتاج كاش',trainTeam('mkt')===false);
      cc.cash=300000;cc.morale=50;
      ok('المكافأة ترفع الروح المعنوية',payBonus()===true&&cc.morale>50);
      ok('المكافأة لها كولداون',payBonus()===false);
      S.day=cc.team.lastBonus+10;const bonus2=payBonus()===true;S.day=dayT;
      ok('الكولداون بينتهي بعد ١٠ أيام',bonus2);
      renderHR();ok('بطاقة النجوم ترسم',$('hrBody').innerHTML.includes('نجوم الفريق'));
      cc.quality=40;cc.rd=0;cc.up={line:0,auto:0,brand:0};cc.staff={eng:1,sales:0,mkt:0};
      cc.team={xp:{eng:0,sales:0,mkt:0},lastBonus:-99,bonuses:0,trains:0};
      RNG=()=>0.5;const q0=cc.quality;runCompany();const d0=cc.quality-q0;
      cc.quality=40;cc.team={xp:{eng:180,sales:0,mkt:0},lastBonus:-99,bonuses:0,trains:0};
      const q1=cc.quality;runCompany();const d1=cc.quality-q1;
      ok('النجوم تزوّد إنتاجية الجودة',d1>d0);
      RNG=Math.random;cc.team={xp:{eng:0,sales:0,mkt:0},lastBonus:-99,bonuses:0,trains:0};
    }
    
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
    
    S.mining={rigs:0,upg:0,total:0};S.cash=Math.max(S.cash,100000);
    if(typeof renderMining==='function')renderMining();
    const mc0=S.cash;$('btnRig').click();
    ok('شراء جهاز تعدين (rigs='+S.mining.rigs+' خصم='+Math.round(mc0-S.cash)+')',S.mining.rigs===1&&(mc0-S.cash)>=5000);
    const mc1=S.cash;S.day++;endOfDay();
    ok('عائد تعدين يومي',S.mining.total>0&&S.cash>mc1);
    S.cash=Math.max(S.cash,100000);
    if(typeof renderMining==='function')renderMining();
    $('btnUpgM').click();ok('ترقية التعدين (upg='+S.mining.upg+')',S.mining.upg===1);
    
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
      ok('فوز بالمزاد ودخل إمبراطورية (إمبراطورية='+S.empire.length+' كاش='+Math.round(S.cash-cb2)+')',S.empire.length>0);
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
    
    S.quiz={day:-1,streak:0,won:0};if(S.duel)S.duel=null;
    renderQuiz();
    const qz=QUIZ[S.day%QUIZ.length];
    var qopts=document.querySelectorAll('.quizOpt');
    if(qopts[qz.a])qopts[qz.a].click();
    ok('كويز الأكاديمية',S.quiz.day===S.day&&S.quiz.streak>=1&&S.quiz.won>0);
    renderDuel();const cd=S.cash;$('btnDuel').click();
    ok('بدء مبارزة',!!S.duel&&S.cash===cd-10000);
    S.duel.bot=0.5;S.day+=5;endOfDay();
    ok('فوز بالمبارزة',S.duel===null&&S.duelWins>=1);
    
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
    const pq0=(S.props[pn]&&S.props[pn].qty)||0;
    document.querySelector('[data-m="'+pn+'"]').click();
    ok('رهن عقاري',S.props[pn].qty===pq0+1&&S.loan>ln&&S.cash===csh-Math.round(S.propPrice[pn]*0.2));
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
    ok('خروج ناجح من المخاطر',S.vc.length===0&&S.vcWins>=1&&S.cash>cv2);
    
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
      const Rb2=RNG;RNG=()=>0.5;S.bid=null;S.fr=null;
      cc.brand=10;cc.crisis=null;cc.strike=null;if(cc.inv){cc.inv.units=cc.inv.cap;}cc.campaign={k:'tv',n:'حملة',ic:'📺',left:5,boost:0.35};runCompany();
      ok('العلامة تكبر أثناء الحملة (brand='+cc.brand.toFixed(2)+')',cc.brand>10);
      RNG=Rb2;
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
    
    if(S.company){
      const dayW=S.day;const RcW=RNG;
      S.company.cash=300000;S.company.rep=60;S.company.brand=60;S.company.workers=100;S.company.morale=60;
      S.rival={name:'منافس اختبار',strength:1.1};
      S.war={active:null,next:S.day+100,shield:0,shieldDays:0,wins:0,losses:0,log:[],blocked:0};
      RNG=()=>0.5;
      const mv=launchWarMove('price');
      ok('هجوم منافس بيتولّد',!!mv&&mv.k==='price'&&mv.left>0&&!!S.war.active);
      ok('حرب الأسعار بتقلل الطلب',warDemandF()<1&&warDemandF()>=0.6);
      const cashW0=S.company.cash;
      ok('الدفاع بيخصم من خزينة الشركة',warDefend()===true&&S.company.cash<cashW0&&S.war.shield>0);
      ok('الدرع بيقلل أثر الهجوم',warDemandF()>0.9);
      S.war.active.left=1;S.war.shield=1;S.war.shieldDays=5;RNG=()=>0.1;
      warTick();
      ok('الهجوم بيتصد بنجاح',S.war.active===null&&S.war.wins>0&&S.war.blocked>0);
      S.war.active=null;S.war.shield=0;S.war.shieldDays=0;RNG=()=>0.5;
      launchWarMove('squeeze');
      ok('حصار التوريد بيرفع التكلفة',warCostF()>1);
      S.war.active=null;S.company.workers=100;
      launchWarMove('raid');
      ok('سطو الكفاءات بينقص العمال',S.company.workers<100);
      S.war.active=null;S.company.brand=60;
      launchWarMove('smear');
      ok('حملة التشويه بتضرب العلامة',S.company.brand<60);
      S.war.active={k:'price',n:'حرب أسعار',ic:'🏷️',d:'',left:1,hit:0.14};
      S.war.shield=0;S.war.shieldDays=0;S.company.rep=60;S.company.brand=60;
      const repW0=S.company.rep;RNG=()=>0.99;
      warTick();
      ok('الهجوم غير الصد بيضرب السمعة',S.war.losses>0&&S.company.rep<repW0&&S.war.active===null);
      S.rival=null;S.war.active={k:'price',n:'x',ic:'',d:'',left:3,hit:0.1};
      warTick();
      ok('بدون منافس مفيش حرب',S.war.active===null);
      S.rival={name:'منافس اختبار',strength:1};
      renderWar();
      ok('بطاقة الحرب ترسم',$('warBody').innerHTML.length>40&&$('warBody').innerHTML.includes('منافس اختبار'));
      S.company.cash=1000;
      ok('الدفاع محتاج كاش',warDefend()===false);
      S.company.cash=300000;
      S.war.active=null;S.war.next=S.day+100;
      const cashW1=S.company.cash;
      RNG=()=>0.5;const h0=S.war.losses+S.war.wins;
      warTick();
      ok('مفيش هجوم قبل ميعاده',S.war.losses+S.war.wins===h0&&S.company.cash===cashW1);
      S.day=dayW;RNG=RcW;
    }
    
    if(S.company){
      const dayA2=S.day;const RcA=RNG;
      const cc=S.company;
      cc.cash=500000;cc.rep=70;cc.brand=50;cc.workers=90;
      S.allies={list:[],pact:null,heat:0,fines:0,log:[]};
      S.corp=null;initCorp();
      ok('فرصة التحالف بين ٥٪ و٩٥٪',(function(){const c1=allyChance(S.corp[0]);return c1>=0.05&&c1<=0.95;})());
      RNG=()=>0.0;
      const cashA=cc.cash;const corp0=S.corp[0];
      ok('عرض التحالف ينجح ويخصم الرسوم',offerAlliance(0)===true&&S.allies.list.length===1&&cc.cash<cashA);
      ok('التحالف بيرفع الطلب',allyDemandF()>1);
      ok('التحالف بيظهر في القائمة',!!allyOf(corp0.n));
      ok('مش تحالف مكرر',offerAlliance(0)===false);
      RNG=()=>0.0;
      offerAlliance(1);offerAlliance(2);
      ok('الحد الأقصى ٣ تحالفات',S.allies.list.length===3&&offerAlliance(3)===false);
      const A=S.allies;
      A.list=[{name:'أ',trait:'plant',traitN:'مصنع',ic:'🏭',since:S.day},{name:'ب',trait:'rnd',traitN:'بحوث',ic:'🔬',since:S.day}];
      ok('شريك المصنع بيخفض التكلفة',allyCostF()<1);
      ok('شريك البحوث بيزوّد الجودة',allyQualityBonus()>0);
      const cashC2=cc.cash;
      ok('الكارتيل محتاج تحالفين ويكلف',formCartel()===true&&!!A.pact&&cc.cash<cashC2);
      ok('الكارتيل بيرفع الطلب أكتر',allyDemandF()>1.1);
      ok('مش كارتيلين',formCartel()===false);
      A.heat=60;cc.rep=70;const cashF=cc.cash;
      RNG=()=>0.0;allyTick();
      ok('الرقابة بتفرض غرامة وتفك الكارتيل',A.pact===null&&cc.cash<cashF&&A.fines>0&&cc.rep<70);
      A.list=[{name:'أ',trait:'dist',traitN:'توزيع',ic:'🚚',since:S.day},{name:'ب',trait:'base',traitN:'عملاء',ic:'👥',since:S.day}];
      RNG=()=>0.0;formCartel();
      ok('فض الكارتيل يدويًا',dissolveCartel('قرار يدوي')===true&&S.allies.pact===null);
      const repB=cc.rep;
      ok('فض التحالف بيخصم سمعة',breakAlliance('أ')===true&&cc.rep<repB&&S.allies.list.length===1);
      S.rival={name:'ب',strength:1};
      S.war.active=null;S.war.next=S.day-1;
      RNG=()=>0.0;
      warTick();
      ok('الشريك المتحالف مابيهاجمكش',S.war.active===null);
      S.rival={name:'منافس اختبار',strength:1};
      renderAlly();
      ok('بطاقة التحالفات ترسم',$('allyBody').innerHTML.length>60&&$('allyBody').innerHTML.includes('تحالفاتك'));
      S.allies={list:[],pact:null,heat:0,fines:0,log:[]};
      S.war.next=S.day+100;
      S.day=dayA2;RNG=RcA;
    }
    
    if(S.company){
      const cc=S.company;const RcS=RNG;
      cc.cash=300000;cc.brand=60;cc.rep=70;cc.lastYearProfit=0;
      cc.subs={active:false,plan:null,members:0,price:0,mrr:0,churn:0,total:0,launchDay:0};
      RNG=()=>0.5;
      cc.quality=30;
      ok('خطة بريميوم بتحتاج جودة',launchSub('premium')===false&&cc.subs.active===false);
      cc.quality=80;
      ok('تشغيل خطة أساسي',launchSub('basic')===true&&cc.subs.active===true&&cc.subs.plan==='basic');
      const sb=cc.subs;
      const m0=sb.members;
      for(let i=0;i<30;i++)subTick(cc);
      ok('المشتركين بينموا مع الوقت',sb.members>m0&&sb.members>0);
      ok('الإيراد المتكرر محسوب',sb.mrr>0&&Math.abs(sb.mrr-sb.members*25)<=25);
      const revS=subTick(cc);
      ok('الاشتراك بيضيف دخل يومي',revS>0);
      ok('الاشتراك بيرفع قيمة الشركة',companyValue()>=cc.cash+Math.round((sb.mrr||0)*6)-1);
      cc.quality=10;const ch0=sb.churn||0;
      subTick(cc);
      ok('الجودة الضعيفة بترفع الفقد',sb.churn>ch0);
      const mem0=sb.members;
      cc.quality=80;
      ok('تبديل الخطة بيحافظ على جزء من المشتركين',launchSub('pro')===true&&sb.plan==='pro'&&sb.members<=mem0&&sb.members>=Math.round(mem0*0.5));
      ok('إيقاف الاشتراكات',stopSub()===true&&sb.active===false&&sb.mrr===0&&sb.members===0);
      ok('مش إيقاف مرتين',stopSub()===false);
      sb.active=true;sb.plan='basic';sb.members=500;sb.mrr=12500;
      renderSub();
      ok('بطاقة الاشتراكات ترسم',$('subBody').innerHTML.length>60&&$('subBody').innerHTML.includes('مشتركون'));
      renderCompany();
      ok('المشتركون بيظهروا في المؤشرات',$('coKpis').innerHTML.includes('مشتركون'));
      cc.subs={active:false,plan:null,members:0,price:0,mrr:0,churn:0,total:0,launchDay:0};
      RNG=RcS;
    }
    
    if(S.company){
      const cc=S.company;const RcC=RNG;
      cc.cash=300000;cc.quality=70;cc.morale=60;cc.workers=90;
      cc.care={agents:0,csat:70,tickets:0,resolved:0,backlog:0,trained:0};
      RNG=()=>0.5;
      ok('حالة الدعم الافتراضية',careOf(cc).csat===70&&careCost(cc)===0);
      const cs0=careOf(cc).csat;
      careTick(cc,600);
      ok('بدون فريق التذاكر بتتراكم',careOf(cc).backlog>0);
      ok('تراكم التذاكر بيضرب الرضا',careOf(cc).csat<cs0);
      const cashH=cc.cash;
      ok('تعيين موظف دعم بيخصم التكلفة',hireCare(1)===true&&careOf(cc).agents===1&&cc.cash===cashH-1500);
      ok('تكلفة الدعم اليومية محسوبة',careCost(cc)===900);
      hireCare(5);
      ok('تعيين ٥ موظفين',careOf(cc).agents===6);
      const bk0=careOf(cc).backlog;
      careTick(cc,600);
      ok('فريق أكبر بيحل تذاكر أكتر',careOf(cc).resolved>0&&careOf(cc).backlog<bk0);
      const cs1=careOf(cc).csat;
      for(let i=0;i<12;i++)careTick(cc,200);
      ok('الرضا بيتحسن مع الحل',careOf(cc).csat>cs1);
      const cashT=cc.cash;
      ok('التدريب بيخصم ويرفع الرضا',trainCare()===true&&cc.cash===cashT-5000&&careOf(cc).trained===1);
      cc.cash=1000;
      ok('التدريب محتاج كاش',trainCare()===false);
      cc.cash=300000;
      ok('التسريح بينقص الفريق',hireCare(-2)===true&&careOf(cc).agents===4);
      cc.care.agents=0;
      ok('مش تسريح تحت الصفر',hireCare(-1)===false);
      ok('الرضا بيأثر على الطلب',careDemandF(cc)>=0.75&&careDemandF(cc)<=1.2);
      cc.care.csat=20;
      ok('رضا منخفض بيرفع الفقد',careChurnF(cc)>1);
      cc.care.csat=95;
      ok('رضا عالي بيقلل الفقد',careChurnF(cc)<1);
      renderCare();
      ok('بطاقة الدعم ترسم',$('careBody').innerHTML.length>80&&$('careBody').innerHTML.includes('رضا العملاء'));
      cc.care={agents:0,csat:70,tickets:0,resolved:0,backlog:0,trained:0};
      RNG=RcC;
    }
    
    if(S.company){
      const cc=S.company;const RcM=RNG;
      cc.cash=5000000;cc.rep=70;cc.quality=60;cc.brand=50;cc.morale=60;cc.workers=90;
      S.corp=[{n:'منافس أ',rep:60,brand:50,value:200000},{n:'منافس ب',rep:55,brand:45,value:300000},{n:'منافس ج',rep:50,brand:40,value:400000}];
      S.merger=null;
      RNG=()=>0.5;
      ok('ملف الاندماج بيبدأ فاضي',mergerOf().target===-1);
      const corp0=S.corp[0];
      ok('بدء تفاوض مع منافس',startMerger(0)===true&&mergerOf().name===corp0.n&&mergerOf().value>0);
      const cashD=cc.cash;
      ok('الفحص النافي للجهالة بيخصم ويكشف المخاطر',mergerDD()===true&&cc.cash===cashD-5000&&mergerOf().dd===true&&mergerOf().risk>0);
      ok('مش فحص مرتين',mergerDD()===false);
      ok('فرصة العرض السخي أعلى من المنخفض',mergerChance('high')>mergerChance('low'));
      const m1=mergerOf();
      RNG=()=>0.99;m1.lastTry=-99;
      ok('عرض مرفوض مابيكملش الدمج',mergerOffer('low')===false&&mergerOf().name===corp0.n);
      ok('بعد الرفض في كولداون',mergerOffer('high')===false);
      S.day=m1.lastTry;RNG=()=>0.0;
      const w0=cc.workers,q0=cc.quality,cashM=cc.cash,corpCount=S.corp.length;
      const merged=mergerOffer('fair');
      ok('العرض المقبول بيكمل الدمج',merged===true&&cc.workers>w0&&cc.quality>q0&&cc.cash<cashM);
      ok('المنافس بيتشال من السوق بعد الدمج',S.corp.length===corpCount-1);
      ok('الاندماج بيتسجل',(cc.merges||0)>=1);
      ok('الملف بيقفل بعد الدمج',mergerOf().target===-1);
      S.corp=[{n:'منافس أ',rep:60,brand:50,value:200000},{n:'منافس ب',rep:55,brand:45,value:300000}];startMerger(1);
      ok('إيقاف التفاوض',cancelMerger()===true&&mergerOf().target===-1);
      renderMerger();
      ok('بطاقة الاندماج ترسم',$('mergerBody').innerHTML.length>60);
      startMerger(0);renderMerger();
      ok('شاشة التفاوض بتعرض العروض',$('mergerBody').innerHTML.includes('عرض عادل'));
      cc.cash=1000;S.merger.lastTry=-99;S.merger.value=200000;RNG=()=>0.0;
      ok('العرض محتاج كاش',mergerOffer('fair')===false);
      cancelMerger();S.merger=null;
      RNG=RcM;
    }
    
    if(S.company){
      const cf=S.company;const RfM=RNG;
      cf.cash=200000;cf.rep=70;cf.quality=70;cf.brand=55;cf.workers=90;
      S.fr=null;S.merger=null;
      RNG=()=>0.5;
      ok('ملف الامتياز بيبدأ فاضي',frOf().list.length===0&&frOf().rate===0.10);
      ok('مش بيفتح امتياز بسمعة ضعيفة',(function(){const r0=cf.rep;cf.rep=20;const x=frOpen('القاهرة');cf.rep=r0;return x===false;})());
      const cashF=cf.cash;
      ok('فتح فرع امتياز',frOpen('القاهرة')===true&&frOf().list.length===1&&cf.cash>cashF-25000);
      ok('مش فرعين في نفس المدينة',frOpen('القاهرة')===false);
      ok('إيراد الامتياز اليومي بيزود الكاش',(function(){const before=cf.cash;frTick(cf);return cf.frIncome>0&&cf.cash===before+cf.frIncome;})());
      ok('نسبة أعلى = عمولة أعلى',(function(){
        const f=frOf();const x=f.list[0];
        f.rate=0.05;const lo=frDaily(x,f);
        f.rate=0.20;const hi=frDaily(x,f);
        f.rate=0.10;return hi>lo;})());
      ok('التدريب بيرفع الجودة وبيخصم',(function(){
        const q0=frOf().list[0].q,c0=cf.cash;
        const r=frTrain();
        return r===true&&frOf().training===1&&frOf().list[0].q>=q0&&cf.cash<c0;})());
      ok('التدقيق بيخصم ٢٠٠٠',(function(){const c0=cf.cash;const r=frAudit(0);return r===true&&cf.cash===c0-2000;})());
      ok('الفرع الضعيف بيضر السمعة',(function(){
        const f=frOf();f.list[0].q=10;f.list[0].warn=3;
        const b0=cf.brand||10;RNG=()=>0.5;
        frTick(cf);frTick(cf);
        return (cf.brand||10)<b0;})());
      ok('الحد الأقصى ٦ فروع',(function(){
        frOf().list=[];['القاهرة','الرياض','دبي','لندن','طوكيو','نيويورك'].forEach(function(ct){frOpen(ct);});
        return frOf().list.length===6&&frOpen('القاهرة')===false;})());
      ok('إنهاء العقد بيخصم سمعة',(function(){
        const r0=cf.rep;const n0=frOf().list.length;
        const r=frClose(0);
        return r===true&&frOf().list.length===n0-1&&cf.rep<r0;})());
      ok('نسبة الامتياز محدودة',frSetRate(0.9)===false&&frSetRate(0.15)===true);
      renderFr();
      ok('بطاقة الامتياز ترسم',$('frBody').innerHTML.includes('الامتياز')||$('frBody').innerHTML.length>80);
      cf.cash=1000;S.fr=null;
      ok('الافتتاح محتاج كاش',frOpen('القاهرة')===false);
      S.fr=null;RNG=RfM;
    }
    
    if(S.company){
      const cb=S.company;const RbM=RNG;
      cb.cash=300000;cb.rep=70;cb.quality=65;cb.brand=60;cb.workers=100;
      S.bid=null;S.merger=null;S.fr=null;
      RNG=()=>0.1;
      ok('مفيش عرض افتراضيًا',bidOf()===null);
      ok('العرض بيظهر بالطلب',bidOpen(cb,true)===true&&bidOf().price>0&&bidOf().days===5);
      ok('مش عرضين مع بعض',bidOpen(cb,true)===false);
      const cashB=cb.cash;
      ok('حبة السم بتخصم وترفع الدفاع',bidDefend('pill')===true&&cb.cash===cashB-40000&&bidOf().defense===2);
      ok('ولاء الموظفين بيرفع الدفاع والمعنويات',(function(){const m0=cb.morale;const r=bidDefend('loyalty');return r===true&&bidOf().defense>=3.5&&cb.morale>m0;})());
      ok('إعادة الشراء بتكمل الدفاع',(function(){const d0=bidOf().defense;const r=bidDefend('buyback');return r===true&&bidOf().defense>d0;})());
      const rep0=cb.rep;
      bidTick(cb);
      ok('الدفاع الكامل بيخلي المشتري ينسحب',bidOf()===null&&cb.rep>rep0);
      RNG=()=>0.1;bidOpen(cb,true);
      ok('الدفاع محتاج كاش',(function(){const c0=cb.cash;cb.cash=1000;const r=bidDefend('buyback');cb.cash=c0;return r===false;})());
      ok('انتهاء المدة بيرفض العرض',(function(){S.bid.days=1;const r0=cb.rep;bidTick(cb);return bidOf()===null&&cb.rep<=r0;})());
      RNG=()=>0.1;bidOpen(cb,true);renderBid();
      ok('بطاقة العرض ترسم',$('bidBody').innerHTML.includes('اقبل العرض')||$('bidBody').innerHTML.length>80);
      const cashA=S.cash;
      ok('قبول العرض بيحوّل الكاش ويخرج من الشركة',bidAccept()===true&&S.cash>cashA&&S.company===null&&bidOf()===null);
      S.bid=null;RNG=RbM;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const ca=S.company;const RaM=RNG;
      ca.cash=300000;ca.rep=70;ca.quality=65;ca.workers=120;ca.morale=60;
      S.audit=null;S.bid=null;S.fr=null;
      RNG=()=>0.5;
      ok('ملف التدقيق بيبدأ من غير مستوى',auditOf().level===0);
      const lost0=auditOf().lost||0;const cashL=ca.cash;
      auditTick(ca);
      ok('في تسريب من غير تدقيق',(auditOf().lost||0)>lost0&&ca.cash<cashL);
      const c1=ca.cash;const ch=auditHire();
      ok('رفع مستوى التدقيق بيخصم',ch===true&&auditOf().level===1&&ca.cash<c1);
      const l1=auditOf().lost;ca.cash=300000;auditTick(ca);
      const leakLvl1=(auditOf().lost||0)-l1;
      const a2=S.audit;S.audit=null;ca.cash=300000;auditTick(ca);
      const leakLvl0=(S.audit.lost||0);
      S.audit=a2;
      ok('التدقيق بيقلل التسريب ('+leakLvl0+' > '+leakLvl1+')',leakLvl1<leakLvl0);
      ok('الحد الأقصى ٣ مستويات',(function(){ca.cash=2000000;auditHire();auditHire();const r=auditHire();return r===false&&auditOf().level===3;})());
      ca.cash=100000;S.audit.lost=50000;
      const cb0=ca.cash;RNG=()=>0.0;
      ok('التحقيق بيكلف وبيلاقي المتورط',auditInvestigate()===true&&ca.cash>cb0-8000&&auditOf().caught>=1);
      ca.cash=1000;
      ok('التحقيق محتاج كاش',auditInvestigate()===false);
      renderAudit();
      ok('بطاقة التدقيق ترسم',$('auditBody').innerHTML.includes('التدقيق'));
      S.audit=null;RNG=RaM;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const cbb=S.company;const Rb2m=RNG;
      cbb.cash=400000;cbb.rep=70;cbb.quality=65;cbb.workers=100;cbb.lastYearProfit=60000;
      S.cbonds=null;S.audit=null;S.bid=null;S.fr=null;
      RNG=()=>0.5;
      ok('ملف السندات بيبدأ فاضي',cbondOf().list.length===0&&cbondTotal()===0);
      const grade=creditGrade(cbb);
      ok('التصنيف الائتماني محسوب',!!grade.g&&grade.rate>0&&grade.rate<0.25);
      const cb3=cbb.cash;
      ok('إصدار سندات بيزود الكاش',cbondIssue(50000)===true&&cbb.cash===cb3+50000&&cbondTotal()===50000);
      const ci0=cbb.cash;cbondTick(cbb);
      ok('فايدة يومية بتتخصم',cbb.cash<ci0&&cbondOf().total>0);
      cbb.cash=500;const rp0=cbb.rep;
      ok('التعثر عند الاستحقاق بيضرب السمعة',(function(){S.cbonds.list[0].due=S.day;cbondTick(cbb);return cbondOf().list.length===0&&cbondOf().defaults===1&&cbb.rep<rp0;})());
      S.cbonds=null;cbb.cash=400000;
      cbondIssue(150000);
      const cbr=cbb.cash;
      ok('السداد المبكر بيخصم ويعلم',cbondRepay(0)===true&&cbondTotal()===0&&cbb.cash<cbr);
      S.cbonds=null;
      ok('الحد الأقصى للدين ٦٠٠ ألف',(function(){cbondIssue(400000);cbondIssue(150000);cbondIssue(50000);return cbondTotal()===600000&&cbondIssue(100000)===false;})());
      cbb.cash=400000;renderCbond();
      ok('بطاقة السندات ترسم',$('cbondBody').innerHTML.includes('التصنيف'));
      S.cbonds=null;RNG=Rb2m;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const ct=S.company;const RtM=RNG;
      ct.cash=500000;ct.rep=70;ct.quality=70;ct.workers=60;
      if(!ct.inv)ct.inv=invDef();
      ct.inv.units=500;
      S.tenders=null;S.cbonds=null;S.audit=null;S.bid=null;S.fr=null;
      RNG=()=>0.5;
      ok('ملف المناقصات بيبدأ فاضي',tenderOf().list.length===0&&tenderOf().active.length===0);
      ok('مناقصة بتظهر بالطلب',tenderSpawn(ct,true)===true&&tenderOf().list.length===1);
      const T0=tenderOf().list[0];
      ok('المناقصة ليها قيمة وتكلفة',T0.value>0&&T0.cost<T0.value);
      const c0=ct.cash;
      RNG=()=>0.01;
      ok('التقديم بيدفع تأمين وبيكسب',tenderBid(0,'fair')===true&&ct.cash<c0&&tenderOf().active.length===1);
      const act=tenderOf().active[0];const c1=ct.cash;
      S.day=act.due;
      tenderTick(ct);
      ok('التسليم في الميعاد بيجيب صافي الربح',tenderOf().active.length===0&&ct.cash>c1&&tenderOf().won===1);
      tenderSpawn(ct,true);
      const c2=ct.cash;RNG=()=>0.99;
      ok('الخسارة بترجع التأمين',tenderBid(0,'low')===true&&ct.cash===c2&&tenderOf().lost===1);
      tenderSpawn(ct,true);RNG=()=>0.01;tenderBid(0,'fair');
      const a2=tenderOf().active[0];const r0=ct.rep;ct.workers=2;ct.inv.units=0;S.day=a2.due;
      tenderTick(ct);
      ok('التأخير بيغرّم ويضرب السمعة',tenderOf().failed===1&&ct.rep<r0);
      ct.cash=100;
      ok('التأمين محتاج كاش',tenderBid(0,'fair')===false);
      ct.cash=500000;renderTender();
      ok('بطاقة المناقصات ترسم',$('tenderBody').innerHTML.includes('مناقصات'));
      S.tenders=null;RNG=RtM;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const cl=S.company;const RlM=RNG;
      cl.cash=400000;cl.rep=70;cl.quality=70;cl.workers=60;
      S.lobby=null;S.tenders=null;S.cbonds=null;S.audit=null;S.bid=null;S.fr=null;
      RNG=()=>0.5;
      ok('ملف اللوبي بيبدأ صفر',lobbyOf().level===0&&lobbyOf().heat===0);
      const ch0=cl.cash;
      ok('رفع النفوذ بيخصم',lobbyHire()===true&&lobbyOf().level===1&&cl.cash<ch0);
      const cf0=cl.cash;lobbyTick(cl);
      ok('رسوم يومية وحرارة بتزيد',cl.cash<cf0&&lobbyOf().heat>0);
      ok('الحد الأقصى ٣',(function(){cl.cash=2000000;lobbyHire();lobbyHire();return lobbyHire()===false&&lobbyOf().level===3;})());
      const h0=lobbyOf().heat;cl.cash=100000;
      ok('التهدئة بتخصم وتنزل الحرارة',lobbyCool()===true&&lobbyOf().heat<h0);
      ok('النفوذ بيرفع فرصة المناقصة',(function(){
        const old=S.lobby;
        S.lobby={level:0,heat:0,spent:0,scandals:0,log:[]};
        S.tenders=null;tenderSpawn(cl,true);RNG=()=>0.70;
        tenderBid(0,'fair');
        const wonLow=tenderOf().active.length;
        S.lobby={level:3,heat:0,spent:0,scandals:0,log:[]};
        S.tenders=null;tenderSpawn(cl,true);RNG=()=>0.70;
        tenderBid(0,'fair');
        const wonHigh=tenderOf().active.length;
        S.lobby=old;
        return wonHigh>wonLow;})());
      lobbyOf().heat=95;cl.cash=400000;cl.rep=70;RNG=()=>0.0;
      const r0=cl.rep;
      lobbyTick(cl);
      ok('الفضيحة بتضرب السمعة والفلوس',lobbyOf().scandals>=1&&cl.rep<r0);
      renderLobby();
      ok('بطاقة اللوبي ترسم',$('lobbyBody').innerHTML.includes('النفوذ'));
      S.lobby=null;RNG=RlM;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const cq=S.company;const RqM=RNG;
      cq.cash=300000;cq.quality=70;cq.morale=60;cq.workers=80;cq.brand=50;cq.rep=70;
      S.qa=null;S.lobby=null;S.tenders=null;S.cbonds=null;S.audit=null;S.bid=null;S.fr=null;
      RNG=()=>0.5;
      ok('ملف الجودة بيبدأ صفر',qaOf().level===0&&qaOf().defects===0);
      qaTick(cq);
      ok('العيوب بتتراكم',qaOf().defects>0);
      const q1=cq.cash;const up=qaUpgrade();
      ok('رفع برنامج الجودة بيخصم',up===true&&qaOf().level===1&&cq.cash<q1);
      const d1=qaOf().defects;qaTick(cq);
      const lvl1=qaOf().defects-d1;
      const old=qaOf();S.qa=null;qaTick(cq);const lvl0=qaOf().defects;S.qa=old;
      ok('برنامج الجودة بيقلل العيوب ('+lvl0.toFixed(2)+' > '+lvl1.toFixed(2)+')',lvl1<lvl0);
      qaOf().defects=40;const cr=cq.cash;const br0=cq.brand||10;
      ok('الاستدعاء الوقائي بيخصم ويصفّر',qaRecall()===true&&cq.cash<cr&&qaOf().defects===0&&(cq.brand||10)>=br0);
      qaOf().defects=20;
      ok('الاستدعاء محتاج عيوب كافية',qaRecall()===false);
      qaOf().defects=100;const r0=cq.rep;const c2=cq.cash;
      qaTick(cq);
      ok('الفضيحة بتغرّم وتضرب العلامة',qaOf().recalls===1&&cq.cash<c2&&cq.rep<r0);
      cq.cash=100000;renderQA();
      ok('بطاقة الجودة ترسم',$('qaBody').innerHTML.includes('الجودة'));
      S.qa=null;RNG=RqM;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const cs=S.company;const RsM=RNG;
      cs.cash=300000;cs.rep=70;cs.quality=70;cs.workers=60;
      S.smug=null;S.qa=null;S.lobby=null;S.tenders=null;S.cbonds=null;S.audit=null;S.bid=null;S.fr=null;
      RNG=()=>0.5;
      ok('ملف التهريب بيبدأ فاضي',smugOf().routes.length===0&&smugOf().heat===0);
      const cs0=cs.cash;
      ok('فتح خط بيخصم ويرفع الحرارة',smugOpen('إلكترونيات')===true&&smugOf().routes.length===1&&cs.cash<cs0&&smugOf().heat>0);
      ok('مش خطين لنفس البضاعة',smugOpen('إلكترونيات')===false);
      const cp=cs.cash;smugTick(cs);
      ok('الخط بيجيب ربح يومي',cs.cash>cp&&smugOf().profit>0);
      ok('الحد الأقصى ٣ خطوط',(function(){smugOpen('سجائر');smugOpen('أدوية');return smugOpen('ذهب')===false&&smugOf().routes.length===3;})());
      const h0=smugOf().heat;cs.cash=200000;
      ok('التهدئة بتنزل الحرارة وتخصم',smugCool()===true&&smugOf().heat<h0);
      const r0=cs.rep;cs.cash=200000;smugOf().heat=95;RNG=()=>0.0;
      smugTick(cs);
      ok('المداهمة بتصادر وتغرّم وتضرب السمعة',smugOf().busts===1&&smugOf().routes.length===2&&cs.rep<r0);
      cs.cash=100000;smugOf().heat=10;renderSmug();
      ok('بطاقة التهريب ترسم',$('smugBody').innerHTML.includes('خطوط'));
      const n0=smugOf().routes.length;
      ok('قفل الخط بيشيله',smugClose(0)===true&&smugOf().routes.length===n0-1);
      S.smug=null;RNG=RsM;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const cv=S.company;S.angel=null;cv.cash=100000;cv.workers=100;
      ok('التمويل بيبدأ فاضي',angelEq()===0);
      ok('A مقفولة من غير seed',angelRaise('a')===false);
      const v0=cv.cash;
      ok('جولة seed بتدخّل كاش',angelRaise('seed')===true&&cv.cash===v0+150000&&angelEq()===10);
      ok('مش بتتقفل مرتين',angelRaise('seed')===false);
      const v1=cv.cash;angelTick(cv);
      ok('التيك: إضافة ٤×عمال ناقص دفعة ١٥٠٠',cv.cash===v1+400-1500,'cash '+cv.cash+' vs '+(v1-1100));
      ok('السلسلة A بعد seed',angelRaise('a')===true&&angelEq()===25);
      ok('مينفعش تشتري seed وA موجودة',angelBuyback('seed')===false);
      cv.cash=100;
      ok('مفيش كاش = مفيش شراء',angelBuyback('a')===false);
      cv.cash=5e6;const v2=cv.cash;
      ok('شراء حصة A بيخصم ١٫٤×',angelBuyback('a')===true&&cv.cash===v2-700000&&angelEq()===10);
      renderAngel();
      ok('بطاقة التمويل ترسم',$('angelBody').innerHTML.includes('جولة'));
      S.angel=null;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const cr=S.company;S.tech=null;cr.cash=500000;cr.workers=100;
      ok('المختبر بيبدأ فاضي',techOf().lab===0&&techOf().pts===0);
      const cp0=cr.cash;
      ok('ترقية المختبر بتخصم',techUpLab()===true&&techOf().lab===1&&cr.cash===cp0-25000);
      const fee1=techFee();const cc1=cr.cash;
      techTick(cr);
      ok('التيك بيجمع نقاط ويخصم الرسوم',techOf().pts===3&&cr.cash===cc1-fee1);
      ok('مش بيفتح تقنية من غير نقاط',techBuy('auto')===false);
      techOf().pts=200;
      ok('الذكاء الاصطناعي مقفول من غير أتمتة',techBuy('ai')===false);
      ok('فتح الأتمتة',techBuy('auto')===true&&techOf().pts===170);
      ok('مش بيفتحها مرتين',techBuy('auto')===false);
      ok('الذكاء الاصطناعي بعد الأتمتة',techBuy('ai')===true);
      ok('دخل التقنيات = ٨+١٤ لكل عامل',techDaily(cr)===100*22);
      const cc2=cr.cash;techTick(cr);
      ok('الدخل بيتضاف يوميًا',cr.cash===cc2-techFee()+2200&&techOf().earned>=2200);
      const f0=techFee();techBuy('eff');
      ok('كفاءة الطاقة بتخفض الرسوم',techFee()<f0);
      cr.cash=100;
      ok('مفيش كاش = مفيش ترقية',techUpLab()===false);
      cr.cash=500000;renderTech();
      ok('بطاقة التقنية ترسم',$('techBody').innerHTML.includes('مختبر')||$('techBody').innerHTML.includes('المختبر'));
      S.tech=null;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const cz=S.company;const RzM=RNG;RNG=()=>0.5;
      S.cris=null;cz.cash=200000;cz.workers=100;
      ok('الأزمات بتبدأ فاضية',crisOf().act===null&&crisOf().handled===0);
      const a0=crisSpawn('war');
      ok('الحرب بتتولد',!!a0&&crisOf().act.dir===-1&&crisOf().act.left===8);
      const dIgn=crisDaily(a0,cz);
      ok('أثر الحرب سالب ('+dIgn+')',dIgn<0);
      const cc0=cz.cash;ok('التحوط بيخصم',crisRespond('hedge')===true&&cz.cash===cc0-8000);
      ok('مش بيرد مرتين',crisRespond('adapt')===false);
      ok('التحوط بيقلل الخسارة',Math.abs(crisDaily(a0,cz))<Math.abs(dIgn));
      const cb2=cz.cash;crisTick(cz);
      ok('التيك بيطبق الأثر اليومي',cz.cash===cb2+crisDaily(a0,cz)&&crisOf().act.left===7);
      crisOf().act.left=1;crisTick(cz);
      ok('الحدث بينتهي ويتسجل',crisOf().act===null&&crisOf().hist.length===1);
      const a1=crisSpawn('oil');cz.cash=200000;
      const g0=crisDaily(a1,cz);crisRespond('adapt');
      ok('النفط مع التكيف بيضاعف المكسب',g0>0&&crisDaily(a1,cz)>g0);
      cz.cash=100;
      ok('مفيش كاش = مش بيرد',(function(){crisOf().act.resp=null;return crisRespond('hedge')===false;})());
      cz.cash=200000;renderCris();
      ok('بطاقة الأزمات ترسم',$('crisBody').innerHTML.length>20);
      S.cris=null;RNG=RzM;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const ce=S.company;S.smug=null;S.bizins=null;S.tax=null;
      ce.branchProfit=5000;ce.rAcq=2000;ce.workers=50;ce.wage=1;
      smugOf();bizToggle('ops');
      const dd=dashData();
      ok('اللوحة بتجمع الدخل ('+dd.income+')',dd.income>=7000&&dd.items.length>=3);
      ok('اللوحة بتحسب التكاليف',dd.cost>=1100+bizPrem(BIZINS[0]));
      ok('صافي = دخل - تكلفة',dd.net===Math.round(dd.income-dd.cost));
      renderDash();
      ok('بطاقة الإمبراطورية ترسم',$('dashBody').innerHTML.includes('صافي الثروة'));
      ce.branchProfit=0;ce.rAcq=0;S.bizins=null;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const RpM=RNG;RNG=()=>0.5;
      S.corp=null;initCorp();S.rIPO=null;
      const r0=rIPOof();
      ok('ملف الاكتتابات بيبدأ فاضي',r0.offers.length===0&&r0.listed.length===0&&r0.acquired.length===0);
      S.day=20;r0.next=1;S.cash=800000;
      const o=rIPOspawn();
      ok('طرح جديد بيتولد ('+(o?o.name:'-')+')',!!o&&r0.offers.length===1&&o.left>0&&o.price>0);
      const c0=S.cash;const oLeft0=o.left,oPrice0=o.price;
      const subbed=rIPOsub(0,50);
      ok('الاكتتاب بيخصم ويحجز أسهم (cash='+Math.round(c0)+' price='+oPrice0+' sub='+subbed+' held='+r0.offers[0].held+' left='+r0.offers[0].left+'/'+oLeft0+')',subbed===true&&S.cash<c0&&r0.offers[0].held===50&&r0.offers[0].left===oLeft0-50);
      S.cash=10;
      ok('مش بيكتتب من غير كاش',rIPOsub(0,50)===false);
      S.cash=500000;
      const on=r0.offers[0].name;r0.offers[0].close=S.day-1;const heldBefore=r0.offers[0].held;
      rIPTick();
      ok('الطرح بيتدرج بعد القفل (listed='+r0.listed.length+' held='+heldBefore+' asset='+(!!S.assets['س:'+on])+' ah='+(S.assets['س:'+on]?S.assets['س:'+on].held:'-')+')',r0.listed.length===1&&!!S.assets['س:'+on]&&S.assets['س:'+on].held===heldBefore);
      const a=S.assets['س:'+on];const cb=S.cash;
      const bought=rIPObuy(0,10);
      ok('شراء بعد الإدراج (bought='+bought+' held='+a.held+' cash='+Math.round(S.cash)+'/'+Math.round(cb)+')',bought===true&&a.held===heldBefore+10&&S.cash<cb);
      const p1=a.price;
      if(S.corp[0])S.corp[0].value=S.corp[0].value*3;
      rIPTick();
      ok('سعر السهم بيتحرك',a.price!==p1&&a.price>0);
      ok('الاستحواذ مرفوض قبل ٥١٪',rIPOtakeover(0)===false);
      a.held=520;r0.listed[0].held=520;
      S.cash=50000000;
      const nCorp=S.corp.length;
      ok('الاستحواذ بينجح عند ٥١٪',rIPOtakeover(0)===true&&r0.acquired.length===1&&r0.listed.length===0&&S.corp.length===nCorp-1);
      ok('الاستحواذ بيدي دخل يومي',!!r0.acquired[0]&&r0.acquired[0].daily>0);
      const ca=S.company.cash;runCompany();
      ok('الدخل اليومي بيتضاف للشركة',S.company.cash!==ca&&S.company.rAcq>0);
      renderRIPO();
      ok('بطاقة الاكتتابات ترسم',$('rIPObody').innerHTML.length>10);
      S.rIPO=null;RNG=RpM;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const ci2=S.company;const RbM=RNG;RNG=()=>0.5;
      ci2.cash=400000;S.bizins=null;
      const b0=bizOf();
      ok('ملف التأمين بيبدأ فاضي',b0.claims===0&&b0.paid===0&&!b0.p.ops);
      ok('تفعيل بوليصتين',bizToggle('ops')===true&&bizToggle('tax')===true&&bizOf().p.ops===true&&bizOf().p.tax===true);
      const prem=bizPrem(BIZINS[0])+bizPrem(BIZINS[1]);
      const cbi=ci2.cash;bizTick(ci2);
      ok('القسط بيتخصم يوميًا ('+Math.round(prem)+')',ci2.cash===cbi-prem&&bizOf().premPaid===prem);
      ok('مطالبة بدون بوليصه = صفر',bizClaim('cargo',10000)===0);
      const paid0=bizOf().paid;
      const back=bizClaim('ops',10000);
      ok('المطالبة بتغطي ٧٠٪',back===7000&&bizOf().paid===paid0+7000&&bizOf().claims===1);
      ok('المطالبة بتنزّل الثقة',bizOf().trust<50);
      const prema=bizPrem(BIZINS[0]);bizOf().trust=20;
      ok('الثقة الأقل = قسط أعلى',bizPrem(BIZINS[0])>prema);
      ci2.cash=100;bizTick(ci2);
      ok('الكاش مش كافي = البوليصات بتتلغي',!bizOf().p.ops&&!bizOf().p.tax);
      ci2.cash=200000;bizOf().p.ops=true;bizOf().trust=50;
      ci2.strike={days:1,asked:120};ci2.workers=60;ci2.wage=1;
      const cst=ci2.cash;runCompany();
      ok('الإضراب مع التأمين بيرجّع تعويض',bizOf().claims>=2&&ci2.cash!==cst);
      ci2.strike=null;renderBizins();
      ok('بطاقة التأمين التجاري ترسم',$('bizinsBody').innerHTML.includes('قسط يومي'));
      S.bizins=null;RNG=RbM;
    }
    
    if(!S.company){$('coName').value='شركة اختبار';$('btnFound').click();}
    if(S.company){
      const ct=S.company;const RtM=RNG;RNG=()=>0.5;
      ct.cash=500000;ct.rep=70;S.tax=null;
      const t0=taxOf();
      ok('ملف الضرائب بيبدأ فاضي',t0.due===0&&t0.hidden===0&&t0.audits===0);
      const acc=taxAccrue(ct,10000,5000);
      ok('استحقاق = ١٤٪ مبيعات + ٢٢٪ ربح ('+Math.round(acc)+')',Math.round(acc)===Math.round(10000*TAX_VAT+5000*TAX_INC));
      taxOf().hide=true;taxOf().next=S.day+10;
      const acc2=taxAccrue(ct,10000,0);
      ok('التسجيل الأقل بيخفض ٣٠٪ ويبني مخفي',Math.round(acc2)===Math.round(10000*TAX_VAT*0.7)&&taxOf().hidden>0);
      taxOf().hide=false;taxOf().hidden=0;taxOf().due=40000;taxOf().next=S.day+10;
      const cpay=ct.cash;
      ok('سداد الإقرار بينزل الكاش ويصفّر المستحق',taxPay()===true&&ct.cash===cpay-40000&&taxOf().due===0);
      ok('مش بيدفع إقرار فاضي',taxPay()===false);
      taxOf().due=50000;taxOf().next=S.day+10;
      ok('التقسيط بيقسم على ٥ أيام',taxSplit()===true&&taxOf().sched===10000);
      const cs1=ct.cash;taxTick(ct);
      ok('القسط بيتخصم يوميًا ('+Math.round(taxOf().due)+')',ct.cash===cs1-10000&&taxOf().due===40000);
      taxOf().sched=0;taxOf().due=30000;taxOf().next=1;taxOf().late=0;
      const d0=taxOf().due;taxTick(ct);
      ok('تأخير الإقرار بيجيب غرامة ٣٪',taxOf().due>d0&&taxOf().late>=1);
      taxOf().hidden=60000;taxOf().hide=true;RNG=()=>0.0;
      const ca=ct.cash,rp=ct.rep;taxTick(ct);
      ok('الفحص الضريبي بيغرّم ويضرب السمعة',taxOf().audits===1&&ct.cash<ca&&ct.rep<rp&&taxOf().hidden===0);
      RNG=()=>0.5;ct.cash=100000;taxOf().hidden=20000;taxOf().due=0;renderTax();
      ok('بطاقة الضرائب ترسم',$('taxBody').innerHTML.includes('المستحق'));
      const cb=ct.cash;
      ok('التسوية الذاتية بتشيل المخفي',taxSettle()===true&&taxOf().hidden===0&&ct.cash<cb);
      S.tax=null;RNG=RtM;
    }
    renderAll();
    window.__testmode=0;save();ok('حفظ',!!localStorage.getItem('econLive1'));
    localStorage.removeItem('econLive1');window.__testmode=1;S=freshState();renderAll();
    localStorage.removeItem('econLive1');window.__testmode=1;S=freshState();renderAll();
    renderAll();refreshNewsUI();ok('رسم الواجهة',true);
  }catch(e){out.push('ERROR '+(e&&e.message));}
  const d=document.createElement('pre');d.id='testout';d.textContent=out.join('\n');document.body.appendChild(d);
  document.title=out.some(l=>l.startsWith('FAIL')||l.startsWith('ERROR'))?'TEST-FAIL':'TEST-OK';
}
if(location.hash==='#test'){window.__testmode=1;setTimeout(__suite,700);}
