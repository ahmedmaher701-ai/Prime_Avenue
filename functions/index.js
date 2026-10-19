import sharp from 'sharp';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore,FieldValue,Timestamp} from 'firebase-admin/firestore';
import {getStorage} from 'firebase-admin/storage';
import {onCall,HttpsError} from 'firebase-functions/v2/https';
import {setGlobalOptions} from 'firebase-functions/v2';
import {id,text,registration,postInput} from './validation.js';
import {cairoDay,summarizeResidents} from './analytics.js';
initializeApp();
setGlobalOptions({region:'us-central1',maxInstances:2,minInstances:0,memory:'256MiB',timeoutSeconds:30});
const db=getFirestore();
const options={enforceAppCheck:true,cors:['https://ahmedmaher701-ai.github.io','https://prime-avenue-16524.web.app'],maxInstances:2};
const stamp=()=>FieldValue.serverTimestamp();
function fail(message='Permission denied'){throw new HttpsError('permission-denied',message);}
async function actor(r,approved=true) {
 if(!r.auth || r.auth.token.firebase?.sign_in_provider!=='google.com' || r.auth.token.email_verified!==true) throw new HttpsError('unauthenticated','Google sign-in required');
 const uid=r.auth.uid;
 const [a,p]=await Promise.all([db.doc(`admins/${uid}`).get(),db.doc(`residents/${uid}`).get()]);
 const admin=a.exists,profile=p.data();
 if(approved && !admin && profile?.status!=='approved') fail('Resident approval required');
 return {uid,admin,profile,name:profile?.name||'الإدارة / Admin'};
}
async function rate(uid,action,limit=100) {
 const ref=db.doc(`limits/${uid}_${action}_${new Date().toISOString().slice(0,10)}`);
 await db.runTransaction(async tx=>{const s=await tx.get(ref);const n=s.data()?.count||0;if(n>=limit)throw new HttpsError('resource-exhausted','Daily limit reached');tx.set(ref,{count:n+1});});
}
function callable(fn){return onCall(options,async r=>{try{return await fn(r);}catch(e){if(e instanceof HttpsError)throw e; console.error('community operation failed',e.message);throw new HttpsError('invalid-argument','Check the submitted information');}});}
function notify(tx,uid,message,postId='') { tx.set(db.collection(`notifications/${uid}/items`).doc(),{message,postId,createdAt:stamp(),read:false}); }
export const registerResident=callable(async r=>{
 const a=await actor(r,false);const p=registration(r.data);await rate(a.uid,'registration',5);
 const ref=db.doc(`residents/${a.uid}`);
 await db.runTransaction(async tx=>{const old=await tx.get(ref);if(old.exists && old.data().status!=='pending')throw new HttpsError('already-exists','Registration already submitted');tx.set(ref,{...p,status:'approved',createdAt:old.data()?.createdAt||stamp(),email:r.auth.token.email});});
 return {status:'approved',currentlyLiving:p.currentlyLiving};
});
export const createPost=callable(async r=>{
 const a=await actor(r);const p=postInput(r.data,a.admin);await rate(a.uid,'post',20);
 const ref=db.collection('posts').doc();await ref.set({...p,authorId:a.uid,authorName:a.name,visibility:p.kind==='services'&&!a.admin?'pending':'published',source:'resident',sourceUrl:'',verifiedAt:'',issueStatus:'open',photoPath:'',commentCount:0,voteCount:0,attendanceCount:0,ratingCount:0,ratingTotal:0,pollCounts:p.options.map(()=>0),createdAt:stamp(),updatedAt:stamp()});return {id:ref.id};
});
export const addComment=callable(async r=>{
 const a=await actor(r);const postId=id(r.data.postId),body=text(r.data.body,1000);await rate(a.uid,'comment',60);
 await db.runTransaction(async tx=>{const ref=db.doc(`posts/${postId}`);const s=await tx.get(ref);if(!s.exists || s.data().visibility!=='published')fail();const existing=Number.isSafeInteger(s.data().commentCount)?s.data().commentCount:(await tx.get(ref.collection('comments').select())).size;tx.update(ref,{commentCount:existing+1});tx.set(ref.collection('comments').doc(),{authorId:a.uid,authorName:a.name,body,createdAt:stamp()});if(s.data().authorId!==a.uid)notify(tx,s.data().authorId,'في تعليق جديد على مشاركتك / New comment',postId);});return {ok:true};
});
export const respond=callable(async r=>{
 const a=await actor(r);const postId=id(r.data.postId);await rate(a.uid,'response',100);
 return db.runTransaction(async tx=>{
  const ref=db.doc(`posts/${postId}`),rr=ref.collection('responses').doc(a.uid);const [s,rs]=await Promise.all([tx.get(ref),tx.get(rr)]);if(!s.exists||s.data().visibility!=='published')fail();const p=s.data(),old=rs.data()?.value;
  let value=r.data.value,patch={};
  if(['ideas','issues'].includes(p.kind)){value=old===true?false:true;patch.voteCount=Math.max(0,p.voteCount+(value?1:-1));}
  else if(p.kind==='events'){value=old===true?false:true;patch.attendanceCount=Math.max(0,p.attendanceCount+(value?1:-1));}
  else if(p.kind==='services'){if(!Number.isInteger(value)||value<1||value>5)throw new Error('invalid-rating');patch.ratingTotal=p.ratingTotal-(old||0)+value;patch.ratingCount=p.ratingCount+(old?0:1);}
  else if(p.kind==='polls'){if(!Number.isInteger(value)||value<0||value>=p.options.length)throw new Error('invalid-choice');const counts=[...p.pollCounts];if(old!==undefined)counts[old]=Math.max(0,counts[old]-1);counts[value]++;patch.pollCounts=counts;}
  else throw new Error('invalid-response');
  tx.set(rr,{value,updatedAt:stamp()});tx.update(ref,{...patch,updatedAt:stamp()});return {value};
 });
});
export const uploadPhoto=callable(async r=>{
 const a=await actor(r);const postId=id(r.data.postId);await rate(a.uid,'photo',20);
 const ref=db.doc(`posts/${postId}`);const s=await ref.get();if(!s.exists||s.data().authorId!==a.uid||s.data().visibility==='hidden')fail();
 const encoded=text(r.data.base64,2800000);if(!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded))throw new Error('invalid-photo');
 const raw=Buffer.from(encoded,'base64');if(raw.length>2097152)throw new Error('photo-too-large');
 const image=sharp(raw,{limitInputPixels:16000000});const info=await image.metadata();if(!['jpeg','png','webp'].includes(info.format))throw new Error('unsupported-image-format');
 const bytes=await image.rotate().resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).jpeg({quality:78}).toBuffer();
 const path=`photos/${a.uid}/${postId}/image.jpg`;
 await getStorage().bucket().file(path).save(bytes,{resumable:false,metadata:{contentType:'image/jpeg',cacheControl:'private, no-store'}});
 await ref.update({photoPath:path,updatedAt:stamp()});return {ok:true};
});
export const getPhoto=callable(async r=>{
 const a=await actor(r);const postId=id(r.data.postId);const s=await db.doc(`posts/${postId}`).get();
 if(!s.exists||(!a.admin&&s.data().visibility!=='published'&&s.data().authorId!==a.uid))fail();
 if(!s.data().photoPath)return {base64:''};await rate(a.uid,'photoRead',500);
 const [bytes]=await getStorage().bucket().file(s.data().photoPath).download();return {base64:bytes.toString('base64')};
});
export const markNotificationsRead=callable(async r=>{const a=await actor(r,false);const ids=r.data.ids;if(!Array.isArray(ids)||ids.length>30)throw new Error('invalid-ids');const b=db.batch();for(const n of ids)b.update(db.doc(`notifications/${a.uid}/items/${id(n)}`),{read:true});await b.commit();return {ok:true};});
export const adminManage=callable(async r=>{
 const a=await actor(r);if(!a.admin)fail('Administrator required');await rate(a.uid,'admin',200);
 const d=r.data;
 if(d.action==='resident'){
  const uid=id(d.uid);if(!['approved','rejected','suspended'].includes(d.status))throw new Error('invalid-status');
  await db.runTransaction(async tx=>{const ref=db.doc(`residents/${uid}`);const s=await tx.get(ref);if(!s.exists)throw new Error('missing-resident');tx.update(ref,{status:d.status,reviewedAt:stamp(),reviewedBy:a.uid});notify(tx,uid,`حالة عضويتك / Membership: ${d.status}`);});
 }else if(d.action==='moderate'){
  const postId=id(d.postId);if(!['published','rejected','hidden'].includes(d.visibility))throw new Error('invalid-status');await db.doc(`posts/${postId}`).update({visibility:d.visibility,updatedAt:stamp()});
 }else if(d.action==='issue'){
  if(!['open','progress','resolved'].includes(d.status))throw new Error('invalid-status');await db.doc(`posts/${id(d.postId)}`).update({issueStatus:d.status,updatedAt:stamp()});
 }else if(d.action==='edit'){
  const postId=id(d.postId),ref=db.doc(`posts/${postId}`),s=await ref.get();if(!s.exists)throw new Error('missing-post');const p=postInput({...d.post,kind:s.data().kind},true);if(p.kind==='polls'&&JSON.stringify(p.options)!==JSON.stringify(s.data().options))throw new Error('poll-options-immutable');await ref.update({...p,updatedAt:stamp()});
 }else if(d.action==='removeComment'){
  await db.doc(`posts/${id(d.postId)}/comments/${id(d.commentId)}`).update({body:'تم إخفاء التعليق بواسطة الإدارة / Removed by admin',authorName:'الإدارة / Admin'});
 }else throw new Error('invalid-action');
 return {ok:true};
});

// Counts authenticated activity, not public anonymous traffic. Client-supplied counters/dates are ignored.
export const recordVisit=callable(async r=>{
 const a=await actor(r),now=new Date(),day=cairoDay(now),bucket=Math.floor(now.getTime()/1800000);
 const visitor=db.doc(`visitMembers/${a.uid}`),daily=db.doc(`visitDays/${day}`),meta=db.doc('analytics/tracking');
 return db.runTransaction(async tx=>{
  const [old,settings]=await Promise.all([tx.get(visitor),tx.get(meta)]);
  if(old.data()?.bucket===bucket)return {counted:false};
  tx.set(visitor,{bucket,day});
  tx.set(daily,{visits:FieldValue.increment(1),members:FieldValue.increment(old.data()?.day===day?0:1)},{merge:true});
  if(!settings.exists)tx.set(meta,{startedAt:Timestamp.fromDate(now)});
  return {counted:true};
 });
});
export const getAdminAnalytics=callable(async r=>{
 const a=await actor(r);if(!a.admin)fail('Administrator required');await rate(a.uid,'analytics',200);
 const now=new Date(),day=cairoDay(now),start=new Date(`${day}T12:00:00Z`);start.setUTCDate(start.getUTCDate()-29);const firstDay=start.toISOString().slice(0,10);
 const [residents,visits,meta]=await Promise.all([
  db.collection('residents').select('building','type','currentlyLiving','status','createdAt').get(),
  db.collection('visitDays').where('__name__','>=',firstDay).where('__name__','<=',day).orderBy('__name__').limit(30).get(),
  db.doc('analytics/tracking').get()
 ]);
 const daily=visits.docs.map(d=>({day:d.id,visits:d.data().visits||0,members:d.data().members||0}));
 const dates=Array.from({length:30},(_,i)=>{const d=new Date(`${day}T12:00:00Z`);d.setUTCDate(d.getUTCDate()-i);return d.toISOString().slice(0,10);});
 const days=dates.map(day=>daily.find(d=>d.day===day)||{day,visits:0,members:0});
 return {residents:summarizeResidents(residents.docs.map(d=>d.data()),now),visits:{today:days[0].visits,todayMembers:days[0].members,last7:days.slice(0,7).reduce((n,d)=>n+d.visits,0),last30:days.reduce((n,d)=>n+d.visits,0),days:days.slice().reverse(),startedAt:meta.data()?.startedAt?.toDate().toISOString()||null},asOf:now.toISOString(),timeZone:'Africa/Cairo'};
});
