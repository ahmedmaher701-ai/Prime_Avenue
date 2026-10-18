/* Prime Avenue prototype enhancements — browser-only demonstration, not secure authentication. */
const adminLoggedIn=()=>sessionStorage.getItem('prime_avenue_demo_admin')==='active';
const canWrite=()=>!!user()&&!adminLoggedIn();
state.residents=Array.isArray(state.residents)?state.residents:[];
const baseRender=render,baseProfilePage=profilePage,baseNewEntry=newEntry,baseVote=vote,baseAddComment=addComment,baseSubmitEntry=submitEntry,baseVisible=visible,baseEventsPage=eventsPage;
const ui=(ar,en)=>tr(ar,en);
const confirmPrototype=()=>ui('نسخة تجريبية فقط: الحسابات والبلاغات محفوظة على الجهاز ده، مش مشتركة بين السكان. دخول الإدارة التجريبي مش آمن.','Prototype only: accounts and posts live on this device and are not shared. Demo admin login is not secure.');
function authPanel(tab='register'){
const active=k=>tab===k?'style="background:#213f46;color:white"':'';
let body='';
if(tab==='register'){
body='<form onsubmit="register(event)">'+
'<div class="field"><label>'+t('name')+'</label><input name="name" required maxlength="80" autocomplete="name"></div>'+
'<div class="field"><label>'+t('phone')+'</label><input name="phone" type="tel" inputmode="tel" pattern="[0-9+ ]{10,16}" required placeholder="01xxxxxxxxx"></div>'+
'<div class="split"><div class="field"><label>'+t('building')+'</label><input name="building" maxlength="20" required></div><div class="field"><label>'+t('unit')+'</label><input name="unit" maxlength="20" required></div></div>'+
'<div class="field"><label>'+t('residentType')+'</label><select name="type"><option value="owner">'+t('owner')+'</option><option value="tenant">'+t('tenant')+'</option></select></div>'+
'<button class="btn gold" type="submit">'+ui('تسجيل والدخول','Register & enter')+'</button></form>';
}else if(tab==='resident'){
body='<form onsubmit="residentLogin(event)"><div class="field"><label>'+t('phone')+'</label><input name="phone" type="tel" inputmode="tel" required pattern="[0-9+ ]{10,16}" placeholder="01xxxxxxxxx"></div><p class="sub">'+ui('ده تسجيل دخول تجريبي من نفس الجهاز بس.','Demo login works only for profiles created on this device.')+'</p><button class="btn gold" type="submit">'+ui('دخول','Sign in')+'</button></form>';
}else{
body='<form onsubmit="adminSignIn(event)" autocomplete="off"><div class="field"><label>'+ui('اسم المستخدم','Username')+'</label><input name="username" required autocapitalize="none" autocomplete="off"></div><div class="field"><label>'+ui('كلمة السر','Password')+'</label><input name="password" type="password" required autocomplete="off"></div><button class="btn gold" type="submit">'+ui('دخول الإدارة','Admin sign in')+'</button></form>';
}
modal('<h2>'+ui('👋 أهلاً بيك في برايم أفينيو','👋 Welcome to Prime Avenue')+'</h2>'+
'<div class="auth-tabs"><button class="btn light" '+active('register')+' onclick="authPanel(\'register\')">'+ui('ساكن جديد','New resident')+'</button><button class="btn light" '+active('resident')+' onclick="authPanel(\'resident\')">'+ui('مسجل قبل كده','Returning resident')+'</button><button class="btn light" '+active('admin')+' onclick="authPanel(\'admin\')">🔐 '+ui('الإدارة','Admin')+'</button></div>'+body+
'<div class="notice demo-notice">⚠️ '+confirmPrototype()+'</div>');
}
openAccount=function(){if(adminLoggedIn()){nav('admin');return;}if(user()){nav('profile');return;}authPanel('register')};
register=function(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.phone=d.phone.replace(/\s+/g,'');if(state.residents.some(x=>x.phone===d.phone)){alert(ui('الرقم ده متسجل على الجهاز ده بالفعل. استخدم دخول السكان.','This number is already registered on this device. Use resident sign in.'));return;}state.residents.push(d);state.user=d;try{save()}catch(err){state.residents.pop();state.user=null;alert(ui('تعذر حفظ البيانات على الجهاز','Could not save on this device'));return;}closeModal();nav('profile')};
function residentLogin(e){e.preventDefault();const number=String(new FormData(e.target).get('phone')).replace(/\s+/g,'');const resident=state.residents.find(x=>x.phone===number);if(!resident){alert(ui('الرقم مش متسجل على الجهاز ده. اختار ساكن جديد.','No resident with this number was registered on this device. Select New resident.'));return;}state.user=resident;save();closeModal();nav('profile')}
function adminSignIn(e){e.preventDefault();const data=new FormData(e.target);if(data.get('username')!=='Admin'||data.get('password')!=='Admin'){alert(ui('اسم المستخدم أو كلمة السر مش صح.','Incorrect username or password.'));return;}sessionStorage.setItem('prime_avenue_demo_admin','active');state.user=null;save();closeModal();nav('admin')}
function adminLogout(){sessionStorage.removeItem('prime_avenue_demo_admin');nav('home')}
profilePage=function(){
if(adminLoggedIn())return '<div class="card profilebox"><h2>🛡️ '+ui('حساب الإدارة التجريبي','Demo administrator')+'</h2><p>'+confirmPrototype()+'</p><button class="btn gold" onclick="nav(\'admin\')">'+ui('لوحة الإدارة','Admin dashboard')+'</button> <button class="btn light" onclick="adminLogout()">'+t('logout')+'</button></div>';
const regular=baseProfilePage();
return regular+'<div class="card profilebox admin-entry"><h3>🔐 '+ui('دخول الإدارة','Admin access')+'</h3><p class="mini">'+ui('لو أنت المسؤول، تقدر تدخل لوحة الإدارة من هنا.','If you are the administrator, open the admin sign-in here.')+'</p><button class="btn outline" onclick="authPanel(\'admin\')">'+ui('تسجيل دخول المسؤول','Administrator sign in')+'</button></div>';
};
visible=function(k){if(adminLoggedIn())return state[k]||[];return baseVisible(k)};
newEntry=function(k){if(!canWrite()){authPanel('register');return;}return baseNewEntry(k)};
submitEntry=async function(e,k){if(!canWrite()){e.preventDefault();authPanel('register');return;}return baseSubmitEntry(e,k)};
vote=function(k,id){if(!canWrite()){authPanel('register');return;}return baseVote(k,id)};
addComment=function(e,id,k){if(!canWrite()){e.preventDefault();authPanel('register');return;}return baseAddComment(e,id,k)};
render=function(){
const requested=page;
if(requested==='admin'){page='profile';baseRender();page='admin';document.getElementById('app').innerHTML=adminLoggedIn()?adminPage():baseProfilePage();}
else baseRender();
if(adminLoggedIn()){
document.getElementById('accountBtn').textContent='🛡️ Admin';
document.getElementById('desktopNav').insertAdjacentHTML('beforeend','<button class="navbtn '+(requested==='admin'?'active':'')+'" onclick="nav(\'admin\')">🛡️ '+t('admin')+'</button>');
document.getElementById('bottomNav').insertAdjacentHTML('beforeend','<button class="'+(requested==='admin'?'active':'')+'" onclick="nav(\'admin\')"><span>🛡️</span>'+t('admin')+'</button>');
}
document.querySelectorAll('.brand img,.hero .mark').forEach(x=>{x.alt='Prime Avenue';});
};
function escapeId(value){return String(value||'').replace(/[^0-9]/g,'')}
function adminPage(){
const pending=(state.services||[]).filter(x=>x.status==='pending');
const issueActions=state.issues.length?state.issues.slice().reverse().map(x=>'<div class="item"><strong>🛠️ '+esc(x.title)+'</strong><p class="mini">'+esc(x.author)+' · '+esc(x.category)+'</p><select aria-label="'+ui('حالة البلاغ','Issue status')+'" onchange="adminIssueStatus(\''+escapeId(x.id)+'\',this.value)">'+[['open',ui('جديد','New')],['progress',ui('جاري المتابعة','In progress')],['resolved',ui('تم الحل','Resolved')]].map(o=>'<option value="'+o[0]+'" '+(x.issueStatus===o[0]?'selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>').join(''):empty(ui('مفيش بلاغات','No issues yet'));
const pendingActions=pending.length?pending.map(x=>'<div class="item"><strong>📍 '+esc(x.name)+'</strong><p>'+esc(x.description)+'</p><p class="mini">'+esc(x.phone)+' · '+esc(x.address)+'</p><button class="btn gold" onclick="adminService(\''+escapeId(x.id)+'\',\'approved\')">✅ '+ui('موافقة','Approve')+'</button> <button class="btn light" onclick="adminService(\''+escapeId(x.id)+'\',\'rejected\')">❌ '+ui('رفض','Reject')+'</button></div>').join(''):empty(ui('مفيش ترشيحات محتاجة مراجعة','No service recommendations pending'));
const postActions=['forum','ideas'].flatMap(k=>state[k].map(x=>'<div class="item"><strong>'+ (k==='forum'?'💬 ':'💡 ')+esc(x.title)+'</strong><p class="mini">'+esc(x.author)+'</p><button class="btn light" onclick="adminRemove(\''+k+'\',\''+escapeId(x.id)+'\')">🗑️ '+ui('حذف','Remove')+'</button></div>')).join('')||empty(ui('مفيش مشاركات','No posts'));
const eventActions=state.events.map(x=>'<div class="item"><strong>📅 '+esc(x.title)+'</strong> <span class="mini">'+esc(x.eventDate||'')+'</span> <button class="textbtn" onclick="adminRemove(\'events\',\''+escapeId(x.id)+'\')">🗑️</button></div>').join('')||empty(ui('لسه مفيش فعاليات','No events yet'));
return '<div class="page-title"><div><h1>🛡️ '+ui('لوحة إدارة برايم أفينيو','Prime Avenue Admin')+'</h1><p>'+ui('مراجعة البلاغات وترشيحات الخدمات والفعاليات','Manage issues, recommendations and events')+'</p></div><button class="btn outline" onclick="adminLogout()">'+t('logout')+'</button></div>'+
'<div class="notice demo-notice">⚠️ '+ui('الدخول Admin / Admin للتجربة على نفس الجهاز فقط، ومش حماية حقيقية. أي حد يقدر يشوف كود الموقع العام. مش مناسب لإدارة بيانات السكان قبل تفعيل باك إند وصلاحيات آمنة.','Admin / Admin is a same-device demo only, not real protection. Anyone can inspect the public code. Do not use with real resident data until secure backend authorization is configured.')+'</div>'+
'<div class="grid admin-stats">'+[[state.issues.length,ui('بلاغات','Issues'),'🛠️'],[pending.length,ui('مراجعات معلقة','Pending reviews'),'⏳'],[state.events.length,ui('فعاليات','Events'),'📅'],[state.residents.length,ui('مسجلين على الجهاز','Locally registered'),'👥']].map(x=>'<div class="stat"><span>'+x[2]+' '+x[1]+'</span><strong>'+x[0]+'</strong></div>').join('')+'</div>'+
'<div class="two admin-grid"><div class="card"><h2>📍 '+ui('ترشيحات الخدمات','Service approvals')+'</h2>'+pendingActions+'</div><div class="card"><h2>🛠️ '+ui('متابعة البلاغات','Issue statuses')+'</h2>'+issueActions+'</div><div class="card"><div class="row"><h2>📅 '+ui('الفعاليات','Events')+'</h2><button class="btn gold" onclick="adminEventForm()">+ '+ui('إضافة فعالية','New event')+'</button></div>'+eventActions+'</div><div class="card"><h2>💬 '+ui('إشراف المنتدى والأفكار','Forum & ideas moderation')+'</h2>'+postActions+'</div></div>';
}
function adminIssueStatus(id,value){if(!adminLoggedIn()||!['open','progress','resolved'].includes(value))return;const p=state.issues.find(x=>x.id===id);if(p){p.issueStatus=value;save();render()}}
function adminService(id,status){if(!adminLoggedIn()||!['approved','rejected'].includes(status))return;const p=state.services.find(x=>x.id===id);if(p){p.status=status;save();render()}}
function adminRemove(k,id){if(!adminLoggedIn()||!['forum','ideas','events'].includes(k))return;if(!confirm(ui('متأكد إنك عايز تحذف العنصر ده؟','Delete this item?')))return;state[k]=state[k].filter(x=>x.id!==id);save();render()}
function adminEventForm(){if(!adminLoggedIn())return;modal('<h2>📅 '+ui('إضافة فعالية','Add event')+'</h2><form onsubmit="adminSaveEvent(event)"><div class="field"><label>'+t('title')+'</label><input name="title" required maxlength="120"></div><div class="field"><label>'+ui('التاريخ','Date')+'</label><input name="eventDate" type="date" required></div><div class="field"><label>'+t('description')+'</label><textarea name="description" required maxlength="2000"></textarea></div><div class="modal-footer"><button class="btn light" type="button" onclick="closeModal()">'+t('cancel')+'</button><button class="btn gold">'+t('save')+'</button></div></form>')}
function adminSaveEvent(e){e.preventDefault();if(!adminLoggedIn())return;const d=Object.fromEntries(new FormData(e.target));Object.assign(d,{id:String(Date.now()),created:new Date().toISOString(),author:'Admin',status:'approved',votes:[]});state.events.push(d);save();closeModal();render()}
eventsPage=function(){
const events=visible('events').filter(x=>x.status==='approved').slice().sort((a,b)=>(a.eventDate||'').localeCompare(b.eventDate||''));
return header('📅 '+t('events'),t('eventsSubtitle'))+(events.length?'<div class="list">'+events.map(x=>'<div class="post"><h3>🎉 '+esc(x.title)+'</h3><p>'+esc(x.description)+'</p><p class="meta">📅 '+esc(x.eventDate)+'</p></div>').join('')+'</div>':'<div class="soon"><h2>📅 '+t('coming')+'</h2><p>'+ui('قريباً تجمعات أطفال، أنشطة وجلسات للجيران','Kids activities and neighbor gatherings coming soon')+'</p></div>');
};
render();
