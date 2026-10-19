const labels={issues:['مشكلة','Issue'],forum:['نقاش','Discussion'],ideas:['فكرة','Idea'],events:['فعالية','Event'],announcements:['إعلان','Announcement'],polls:['استطلاع','Poll'],lost:['مفقودات ومعثورات','Lost & found'],marketplace:['عرض للبيع','Marketplace']};
export function postSectionLabel(post,lang='ar'){
 const pair=post.kind==='services'?(post.source==='online'?['خدمة قريبة','Nearby service']:['ترشيح خدمة','Recommendation']):labels[post.kind]||['مشاركة','Post'];
 return pair[lang==='ar'?0:1];
}
export function serviceMapUrl(post){
 // A Maps search for the public business name/address, not an asserted verified pin.
 return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([post.title,post.address].filter(Boolean).join(', '));
}
export function businessText(post,key,lang='ar'){
 const value=String(post[key]??'');
 if(post.kind!=='services'||post.source!=='online'||!value.includes(' / '))return value;
 const parts=value.split(' / ');
 return lang==='ar'?parts[0]:parts.slice(1).join(' / ');
}
