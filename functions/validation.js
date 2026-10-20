export const kinds = ['issues','forum','ideas','events','announcements','polls','lost','services','marketplace'];
export function text(value, max, min=1) {
 if(typeof value !== 'string' || value.trim().length < min || value.trim().length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error('invalid-input');
 return value.trim();
}
export function id(value) { const s=text(value,128); if(!/^[A-Za-z0-9_-]+$/.test(s)) throw new Error('invalid-id'); return s; }
export function registration(d) {
 const p={name:text(d.name,80,2),phone:text(d.phone,20),building:text(d.building,20),unit:text(d.unit,20),type:d.type,currentlyLiving:d.currentlyLiving===undefined?null:d.currentlyLiving};
 if(!/^\+?[0-9 ()-]{9,20}$/.test(p.phone) || !['owner','tenant'].includes(p.type)) throw new Error('invalid-registration');
 if(p.currentlyLiving!==null && typeof p.currentlyLiving!=='boolean') throw new Error('invalid-residency-answer');
 return p;
}
export function postInput(d,admin=false) {
 if(!kinds.includes(d.kind) || (!admin && ['events','announcements','polls'].includes(d.kind))) throw new Error('invalid-kind');
 const p={kind:d.kind,title:text(d.title,120,2),body:text(d.body,3000,2),category:text(d.category||'other',50),eventDate:'',address:'',mapUrl:'',businessPhone:'',price:'',options:[]};
 if(d.kind==='events') { p.eventDate=text(d.eventDate,16); if(!/^\d{4}-\d{2}-\d{2}$/.test(p.eventDate) || Number.isNaN(Date.parse(p.eventDate))) throw new Error('invalid-date'); }
 if(d.kind==='services') { p.address=text(d.address||'',200,0); const supplied=text(d.mapUrl??'',2048,0);p.mapUrl=googleMapsLink(supplied);if(supplied&&!p.mapUrl)throw new Error('invalid-map-url');const legacy=googleMapsLink(p.address);if(legacy){if(!p.mapUrl)p.mapUrl=legacy;p.address='';}if(!p.address&&!p.mapUrl)throw new Error('missing-location');p.businessPhone=text(d.businessPhone||'',25,0); if(p.businessPhone && !/^\+?[0-9 ()-]{5,25}$/.test(p.businessPhone)) throw new Error('invalid-phone'); }
 if(d.kind==='marketplace') p.price=text(d.price||'',40,0);
 if(d.kind==='polls') { if(!Array.isArray(d.options) || d.options.length<2 || d.options.length>6) throw new Error('invalid-options'); p.options=d.options.map(v=>text(v,100)); if(new Set(p.options).size!==p.options.length) throw new Error('duplicate-options'); }
 return p;
}

export function googleMapsLink(value){
 if(typeof value!=='string')return '';
 const s=value.trim();if(!s||s.length>2048||/[\u0000-\u0020\u007f]/.test(s))return '';
 try{
  const u=new URL(s),h=u.hostname.toLowerCase();
  if(u.protocol!=='https:'||u.username||u.password||u.port)return '';
  const full=/^(www\.)?google\.(com|com\.eg|com\.sa|co\.uk|ae)$/.test(h)&&/^\/maps(?:\/|$)/.test(u.pathname);
  const maps=/^maps\.google\.(com|com\.eg|com\.sa|co\.uk|ae)$/.test(h)&&(u.pathname==='/'||/^\/maps(?:\/|$)/.test(u.pathname));
  const short=h==='maps.app.goo.gl'&&/^\/[^/]+/.test(u.pathname)||h==='goo.gl'&&/^\/maps\/[^/]+/.test(u.pathname);
  return full||maps||short?u.href:'';
 }catch{return '';}
}
