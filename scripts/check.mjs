import {readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
for(const path of ['app.js','auth-flow.js','firebase-config.js','sw.js','functions/index.js','functions/validation.js'])execFileSync(process.execPath,['--check',path],{stdio:'inherit'});
const html=readFileSync('index.html','utf8');if(/on(click|submit|change)=|<script(?![^>]*src=)/i.test(html))throw Error('Inline executable code is prohibited');
for(const path of ['app.js','index.html'])if(/localStorage|sessionStorage|Admin\/Admin|prime_avenue_demo_admin/.test(readFileSync(path,'utf8')))throw Error('Prototype state or authentication remains');
for(const path of ['firebase.json','.firebaserc','firestore.indexes.json','package.json','functions/package.json','manifest.webmanifest'])JSON.parse(readFileSync(path,'utf8'));
console.log('Syntax, configuration, CSP and prototype-removal checks passed');
