// Run only in a trusted environment authenticated as the project owner.
// No downloadable service-account key is required or supported.
import {initializeApp,applicationDefault} from '../functions/node_modules/firebase-admin/lib/app/index.js';
import {getAuth} from '../functions/node_modules/firebase-admin/lib/auth/index.js';
import {getFirestore,FieldValue} from '../functions/node_modules/firebase-admin/lib/firestore/index.js';
initializeApp({credential:applicationDefault(),projectId:'prime-avenue-16524'});
const email=process.argv[2];
if(!email)throw Error('Supply the privately confirmed administrator email as the single argument');
const user=await getAuth().getUserByEmail(email);
if(!user.emailVerified||!user.providerData.some(p=>p.providerId==='google.com'))throw Error('Sign in with the confirmed Google account before bootstrapping');
await getFirestore().doc(`admins/${user.uid}`).set({createdAt:FieldValue.serverTimestamp()});
console.log('Initial administrator configured for the confirmed Google account.');
