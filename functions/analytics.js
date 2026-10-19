// Aggregate private profiles on the trusted backend; never return individual details.
export function cairoDay(now=new Date()) {
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=k=>parts.find(p=>p.type===k).value;
 return `${get('year')}-${get('month')}-${get('day')}`;
}
export function summarizeResidents(rows,now=new Date()) {
 const result={total:rows.length,active:0,owners:0,tenants:0,unknownType:0,living:0,notLiving:0,unknownLiving:0,last7:0,last30:0,statuses:{},buildings:[]};
 const buildings=new Map();
 for(const r of rows){
  const status=['approved','pending','suspended','rejected'].includes(r.status)?r.status:'unknown';
  result.statuses[status]=(result.statuses[status]||0)+1;if(status==='approved')result.active++;
  const type=r.type==='owner'?'owners':r.type==='tenant'?'tenants':'unknownType';result[type]++;
  const living=r.currentlyLiving===true?'living':r.currentlyLiving===false?'notLiving':'unknownLiving';result[living]++;
  // Normalize Arabic/Persian digits and whitespace, preserving meaningful letters/zeroes.
  const building=String(r.building??'').trim().replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776))||'';
  if(!buildings.has(building))buildings.set(building,{building,total:0,owners:0,tenants:0,unknownType:0,living:0,notLiving:0,unknownLiving:0});
  const b=buildings.get(building);b.total++;b[type]++;b[living]++;
  const ms=r.createdAt?.toMillis?.();const age=now.getTime()-ms;
  if(Number.isFinite(age)&&age>=0){if(age<7*86400000)result.last7++;if(age<30*86400000)result.last30++;}
 }
 result.buildings=[...buildings.values()].sort((a,b)=>a.building.localeCompare(b.building,'en',{numeric:true}));
 return result;
}
