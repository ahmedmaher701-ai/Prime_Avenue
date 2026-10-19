import {test,before} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const requireBackend=createRequire(new URL('../functions/package.json',import.meta.url));
process.env.GCLOUD_PROJECT='demo-prime-avenue';
process.env.FIREBASE_CONFIG=JSON.stringify({projectId:'demo-prime-avenue',storageBucket:'demo-prime-avenue.appspot.com'});
const backend=await import('../functions/index.js');
const {getFirestore}=await import('../functions/node_modules/firebase-admin/lib/firestore/index.js');
const db=getFirestore();
const request=(uid,data={},provider='google.com')=>({data,auth:{uid,token:{email:`${uid}@example.test`,email_verified:true,firebase:{sign_in_provider:provider}}}});
before(async()=>{for(const [path,data] of Object.entries({'admins/test-admin':{active:true},'residents/test-member':{name:'Member',status:'approved'},'residents/test-other':{name:'Other',status:'approved'},'residents/test-pending':{status:'pending'},'residents/test-suspended':{status:'suspended'}}))await db.doc(path).set(data);});
test('pending and suspended accounts cannot create shared content',async()=>{for(const uid of ['test-pending','test-suspended'])await assert.rejects(backend.createPost.run(request(uid,{kind:'forum',title:'Title',body:'Body'})),e=>e.code==='permission-denied');});
test('Google auth and verification are required',async()=>{await assert.rejects(backend.createPost.run(request('test-member',{},'password')),e=>e.code==='unauthenticated');await assert.rejects(backend.createPost.run({data:{}}),e=>e.code==='unauthenticated');});
test('complete registration activates membership without granting forged admin permissions',async()=>{const result=await backend.registerResident.run(request('test-register',{name:'Resident',phone:'01012345678',building:'1',unit:'2',type:'owner',currentlyLiving:false,status:'suspended',admin:true}));const p=(await db.doc('residents/test-register').get()).data();assert.equal(result.status,'approved');assert.equal(result.currentlyLiving,false);assert.equal(p.currentlyLiving,false);assert.equal(p.status,'approved');assert.equal(p.admin,undefined);await backend.createPost.run(request('test-register',{kind:'forum',title:'New member',body:'Can participate immediately'}));await assert.rejects(backend.adminManage.run(request('test-register',{action:'resident',uid:'test-pending',status:'approved'})),e=>e.code==='permission-denied');});
test('legacy pending registration can activate after completing details',async()=>{await db.doc('residents/test-legacy').set({status:'pending'});await backend.registerResident.run(request('test-legacy',{name:'Legacy',phone:'01012345678',building:'1',unit:'2',type:'tenant',currentlyLiving:true}));assert.equal((await db.doc('residents/test-legacy').get()).data().status,'approved');assert.equal((await db.doc('residents/test-legacy').get()).data().currentlyLiving,true);});
test('registration cannot reactivate suspended or rejected accounts',async()=>{for(const status of ['suspended','rejected']){const uid=`blocked-${status}`;await db.doc(`residents/${uid}`).set({status});await assert.rejects(backend.registerResident.run(request(uid,{name:'Blocked',phone:'01012345678',building:'1',unit:'2',type:'owner'})),e=>e.code==='already-exists');assert.equal((await db.doc(`residents/${uid}`).get()).data().status,status);}});
test('admin authorization cannot be forged with request data',async()=>{await assert.rejects(backend.adminManage.run(request('test-member',{action:'resident',uid:'test-pending',status:'approved',admin:true})),e=>e.code==='permission-denied');});
test('admin approval immediately enables resident writes',async()=>{await backend.adminManage.run(request('test-admin',{action:'resident',uid:'test-pending',status:'approved'}));const p=await backend.createPost.run(request('test-pending',{kind:'forum',title:'Shared post',body:'Visible to approved neighbors'}));assert.equal((await db.doc(`posts/${p.id}`).get()).data().visibility,'published');});
test('two accounts share comments and votes while toggles keep counts correct',async()=>{const {id}=await backend.createPost.run(request('test-member',{kind:'ideas',title:'Shared idea',body:'Community idea'}));await backend.addComment.run(request('test-other',{postId:id,body:'A comment from another account'}));assert.equal((await db.collection(`posts/${id}/comments`).get()).size,1);await Promise.all(['test-member','test-other'].map(uid=>backend.respond.run(request(uid,{postId:id}))));assert.equal((await db.doc(`posts/${id}`).get()).data().voteCount,2);await backend.respond.run(request('test-member',{postId:id}));assert.equal((await db.doc(`posts/${id}`).get()).data().voteCount,1);});
test('service recommendations remain pending until admin review',async()=>{const {id}=await backend.createPost.run(request('test-member',{kind:'services',title:'Local service',body:'Recommendation',address:'October'}));assert.equal((await db.doc(`posts/${id}`).get()).data().visibility,'pending');await assert.rejects(backend.respond.run(request('test-other',{postId:id,value:5})),e=>e.code==='permission-denied');await backend.adminManage.run(request('test-admin',{action:'moderate',postId:id,visibility:'published'}));await backend.respond.run(request('test-other',{postId:id,value:5}));await backend.respond.run(request('test-other',{postId:id,value:3}));const p=(await db.doc(`posts/${id}`).get()).data();assert.equal(p.ratingCount,1);assert.equal(p.ratingTotal,3);});
test('event confirmations and poll vote changes are per resident',async()=>{const e=await backend.createPost.run(request('test-admin',{kind:'events',title:'Event',body:'Community event',eventDate:'2026-12-01'}));await backend.respond.run(request('test-member',{postId:e.id}));assert.equal((await db.doc(`posts/${e.id}`).get()).data().attendanceCount,1);const p=await backend.createPost.run(request('test-admin',{kind:'polls',title:'Poll',body:'Choose',options:['A','B']}));await backend.respond.run(request('test-member',{postId:p.id,value:0}));await backend.respond.run(request('test-member',{postId:p.id,value:1}));assert.deepEqual((await db.doc(`posts/${p.id}`).get()).data().pollCounts,[0,1]);});
test('suspension revokes backend permission on the next request',async()=>{await backend.adminManage.run(request('test-admin',{action:'resident',uid:'test-pending',status:'suspended'}));await assert.rejects(backend.createPost.run(request('test-pending',{kind:'forum',title:'Title',body:'Body'})),e=>e.code==='permission-denied');});

test('photos are re-encoded in private Storage and access follows current membership',async()=>{
 const sharp=requireBackend('sharp');
 const image=await sharp({create:{width:16,height:16,channels:3,background:'#b99a65'}}).jpeg().toBuffer();
 const {id}=await backend.createPost.run(request('test-member',{kind:'issues',title:'Photo issue',body:'Issue with photograph'}));
 await backend.uploadPhoto.run(request('test-member',{postId:id,base64:image.toString('base64')}));
 const got=await backend.getPhoto.run(request('test-other',{postId:id}));assert.ok(got.base64.length>0);
 await assert.rejects(backend.uploadPhoto.run(request('test-other',{postId:id,base64:image.toString('base64')})),e=>e.code==='permission-denied');
 await backend.adminManage.run(request('test-admin',{action:'moderate',postId:id,visibility:'hidden'}));
 await assert.rejects(backend.getPhoto.run(request('test-other',{postId:id})),e=>e.code==='permission-denied');
 await assert.rejects(backend.getPhoto.run(request('test-suspended',{postId:id})),e=>e.code==='permission-denied');
});

test('comment totals include legacy comments and concurrent additions without accepting client counts',async()=>{
 const {id}=await backend.createPost.run(request('test-member',{kind:'forum',title:'Count comments',body:'Historical and new comments'}));
 const ref=db.doc(`posts/${id}`);await ref.update({commentCount:(await import('../functions/node_modules/firebase-admin/lib/firestore/index.js')).FieldValue.delete()});
 await ref.collection('comments').doc('legacy').set({body:'Legacy comment',createdAt:new Date()});
 await Promise.all(['test-member','test-other'].map(uid=>backend.addComment.run(request(uid,{postId:id,body:'New comment',commentCount:9999}))));
 assert.equal((await ref.get()).data().commentCount,3);
});
test('only trusted admins can retrieve private resident aggregates',async()=>{
 for(const uid of ['test-member','test-suspended'])await assert.rejects(backend.getAdminAnalytics.run(request(uid,{admin:true})),e=>e.code==='permission-denied');
 await assert.rejects(backend.getAdminAnalytics.run({data:{admin:true}}),e=>e.code==='unauthenticated');
 const result=await backend.getAdminAnalytics.run(request('test-admin'));
 assert.ok(result.residents.total>=5);assert.equal(result.timeZone,'Africa/Cairo');
 assert.ok(!JSON.stringify(result).includes('@example.test'));assert.ok(!JSON.stringify(result).includes('01012345678'));
});
test('signed-in visit counts deduplicate concurrent requests and ignore forged metrics',async()=>{
 const {cairoDay}=await import('../functions/analytics.js');const day=cairoDay();
 const before=(await db.doc(`visitDays/${day}`).get()).data()||{};
 await Promise.all([backend.recordVisit.run(request('test-member',{visits:9000,day:'1900-01-01'})),backend.recordVisit.run(request('test-member'))]);
 await backend.recordVisit.run(request('test-other'));await backend.recordVisit.run(request('test-other'));
 const after=(await db.doc(`visitDays/${day}`).get()).data();
 assert.equal(after.visits-(before.visits||0),2);assert.equal(after.members-(before.members||0),2);
 const summary=await backend.getAdminAnalytics.run(request('test-admin'));assert.equal(summary.visits.today,after.visits);assert.equal(summary.visits.todayMembers,after.members);assert.equal(summary.visits.days.length,30);assert.ok(summary.visits.startedAt);
 await assert.rejects(backend.recordVisit.run(request('test-suspended')),e=>e.code==='permission-denied');
 await assert.rejects(backend.recordVisit.run({data:{}}),e=>e.code==='unauthenticated');
 assert.equal((await db.doc('visitDays/1900-01-01').get()).exists,false);
});
