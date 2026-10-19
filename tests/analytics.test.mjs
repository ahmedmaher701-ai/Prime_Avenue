import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cairoDay,summarizeResidents} from '../functions/analytics.js';
import {renderAdminAnalytics} from '../admin-analytics-ui.js';
const now=new Date('2026-10-19T12:00:00Z');
const stamp=iso=>({toMillis:()=>Date.parse(iso)});
test('resident totals group Arabic digits and preserve unknown versus no answers',()=>{
 const r=summarizeResidents([{building:' ٢ ',type:'owner',currentlyLiving:false,status:'approved',createdAt:stamp('2026-10-18T12:00:00Z')},{building:'2',type:'tenant',currentlyLiving:true,status:'suspended',createdAt:stamp('2026-10-01T12:00:00Z')},{building:'',status:'pending'}],now);
 assert.equal(r.total,3);assert.equal(r.active,1);assert.equal(r.owners,1);assert.equal(r.tenants,1);assert.equal(r.unknownType,1);assert.equal(r.living,1);assert.equal(r.notLiving,1);assert.equal(r.unknownLiving,1);assert.equal(r.last7,1);assert.equal(r.last30,2);assert.equal(r.buildings.find(b=>b.building==='2').total,2);
 assert.equal(r.buildings.reduce((n,b)=>n+b.total,0),r.total);
});
test('tracking uses Cairo day across UTC midnight and daylight-saving changes',()=>{
 assert.equal(cairoDay(new Date('2026-10-18T22:00:00Z')),'2026-10-19');
 assert.equal(cairoDay(new Date('2026-01-18T21:30:00Z')),'2026-01-18');
});
test('admin summary escapes profile-provided building labels and labels missing tracking honestly',()=>{
 const residents=summarizeResidents([{building:'<img onerror="alert(1)">'}],now);
 const html=renderAdminAnalytics({residents,visits:{days:[],startedAt:null},asOf:now.toISOString()},'en');
 assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));assert.ok(html.includes('excludes visitors before sign-in'));assert.ok(html.includes('Tracking begins'));
});
