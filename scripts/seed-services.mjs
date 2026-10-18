import {readFileSync} from 'node:fs';
import {initializeApp,applicationDefault} from '../functions/node_modules/firebase-admin/lib/app/index.js';
import {getFirestore,FieldValue} from '../functions/node_modules/firebase-admin/lib/firestore/index.js';
initializeApp({credential:applicationDefault(),projectId:'prime-avenue-16524'});
const db=getFirestore(),rows=JSON.parse(readFileSync(new URL('../data/services.seed.json',import.meta.url),'utf8'));
for(const row of rows){const {id,...p}=row;const ref=db.doc(`posts/${id}`);await db.runTransaction(async tx=>{if((await tx.get(ref)).exists)return;tx.create(ref,{...p,kind:'services',authorId:'online-directory',authorName:'معلومات عامة / Public listing',visibility:'published',source:'online',eventDate:'',price:'',options:[],issueStatus:'open',photoPath:'',voteCount:0,attendanceCount:0,ratingCount:0,ratingTotal:0,pollCounts:[],createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});});}
console.log('Verified source listings added; existing listings and ratings preserved.');
