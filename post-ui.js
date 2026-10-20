const labels={issues:['مشكلة','Issue'],forum:['نقاش','Discussion'],ideas:['فكرة','Idea'],events:['فعالية','Event'],announcements:['إعلان','Announcement'],polls:['استطلاع','Poll'],lost:['مفقودات ومعثورات','Lost & found'],marketplace:['عرض للبيع','Marketplace']};
export function postSectionLabel(post,lang='ar'){
 const pair=post.kind==='services'?(post.source==='online'?['خدمة قريبة','Nearby service']:['ترشيح خدمة','Recommendation']):labels[post.kind]||['مشاركة','Post'];
 return pair[lang==='ar'?0:1];
}
export function serviceMapUrl(post){
 const exact=googleMapsLink(post.mapUrl)||googleMapsLink(post.address);if(exact)return exact;
 // A Maps search for the public business name/address, not an asserted verified pin.
 return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([post.title,post.address].filter(Boolean).join(', '));
}
export function businessText(post,key,lang='ar'){
 const value=String(post[key]??'');
 if(post.kind!=='services'||post.source!=='online'||!value.includes(' / '))return value;
 const parts=value.split(' / ');
 return lang==='ar'?parts[0]:parts.slice(1).join(' / ');
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

export function postTitleLabel(kind,lang='ar'){
 const pair=kind==='services'?['اسم المكان أو الخدمة','Place or service name']:kind==='marketplace'?['اسم المعروض','Item name']:['موضوع المشاركة','Post subject'];
 return pair[lang==='ar'?0:1];
}
