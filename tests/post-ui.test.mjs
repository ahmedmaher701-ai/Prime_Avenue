import {test} from 'node:test';
import assert from 'node:assert/strict';
import {postSectionLabel,serviceMapUrl,businessText} from '../post-ui.js';
test('post labels distinguish issues, discussions, recommendations and public businesses',()=>{
 assert.equal(postSectionLabel({kind:'issues'}),'مشكلة');
 assert.equal(postSectionLabel({kind:'forum'}),'نقاش');
 assert.equal(postSectionLabel({kind:'services',source:'resident'}),'ترشيح خدمة');
 assert.equal(postSectionLabel({kind:'services',source:'online'},'en'),'Nearby service');
});
test('public bilingual business listings follow the selected language without truncating resident content',()=>{
 const p={kind:'services',source:'online',title:'صيدلية / Pharmacy'};
 assert.equal(businessText(p,'title'),'صيدلية');assert.equal(businessText(p,'title','en'),'Pharmacy');
 assert.equal(businessText({...p,source:'resident'},'title'),'صيدلية / Pharmacy');
});
test('map search encodes the public business and address without allowing URL injection',()=>{
 const p={title:'صيدلية & query=other',address:'حدائق أكتوبر #javascript:alert(1)'};
 const url=new URL(serviceMapUrl(p));
 assert.equal(url.origin,'https://www.google.com');assert.equal(url.pathname,'/maps/search/');
 assert.equal(url.searchParams.get('api'),'1');assert.equal(url.searchParams.get('query'),p.title+', '+p.address);
 assert.equal(url.searchParams.size,2);assert.equal(url.hash,'');
});
