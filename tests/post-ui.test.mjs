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
test('direct Maps links open the submitted place while legacy and missing URLs remain usable',()=>{
 const link='https://maps.app.goo.gl/rHACEFWvdLCd58Az8?g_st=iw';
 assert.equal(serviceMapUrl({mapUrl:link,title:'Shop',address:'October'}),link);
 assert.equal(serviceMapUrl({address:link,title:'Shop'}),link);
 assert.equal(new URL(serviceMapUrl({mapUrl:'javascript:alert(1)',title:'Shop'})).pathname,'/maps/search/');
});
test('both backend and UI reject deceptive map URLs and accept common Google Maps share formats',async()=>{
 const {googleMapsLink:serverLink}=await import('../functions/validation.js');
 const {googleMapsLink:clientLink}=await import('../post-ui.js');
 const allowed=['https://maps.app.goo.gl/abc123','https://goo.gl/maps/abc123','https://www.google.com/maps/place/October','https://maps.google.com/?q=October','https://www.google.com.eg/maps?cid=123'];
 const blocked=['http://maps.app.goo.gl/abc','https://maps.app.goo.gl.evil.com/abc','https://evil.com/maps/abc','https://google.com/url?q=evil','https://maps.app.goo.gl@evil.com/abc','https://user:pass@google.com/maps','https://google.com:444/maps','//google.com/maps','https://goo.gl/not-maps/abc','data:text/html,test','https://google.com/ma\nps'];
 for(const validate of [serverLink,clientLink]){for(const s of allowed)assert.ok(validate(s));for(const s of blocked)assert.equal(validate(s),'');}
});
