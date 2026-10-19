import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGoogleSignIn} from '../auth-flow.js';
test('setup finishes before login is enabled; early taps do not launch delayed popups',async()=>{
 let finish,opened=0;const states=[];
 const flow=createGoogleSignIn({prepare:()=>new Promise(r=>{finish=r;}),signIn:()=>{opened++;},onState:s=>states.push(s)});
 await Promise.resolve();await flow.start();assert.equal(opened,0);
 finish();await flow.preparation;assert.equal(states.at(-1).ready,true);
});
test('first ready tap invokes sign-in synchronously within the user gesture',async()=>{
 let inGesture=false,opened=0;
 const flow=createGoogleSignIn({prepare:()=>Promise.resolve(),signIn:()=>{assert.equal(inGesture,true);opened++;return 'signed-in';}});
 await flow.preparation;inGesture=true;const result=flow.start();inGesture=false;
 assert.equal(opened,1);assert.equal(await result,'signed-in');
});
test('duplicate taps do not cancel an active sign-in; failures allow another attempt',async()=>{
 let fail,opened=0;const states=[];
 const flow=createGoogleSignIn({prepare:()=>{},signIn:()=>{opened++;return new Promise((_,reject)=>{fail=reject;});},onState:s=>states.push(s)});
 await flow.preparation;const first=flow.start();await flow.start();assert.equal(opened,1);
 fail(new Error('cancelled'));await assert.rejects(first);assert.equal(states.at(-1).busy,false);
 const retry=flow.start();assert.equal(opened,2);fail(new Error('cancelled'));await assert.rejects(retry);
});
