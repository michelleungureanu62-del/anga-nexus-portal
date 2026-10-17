const WALLET=/^G[A-Z2-7]{55}$/;
const TIERS=[[150,5,100],[300,10,200],[450,15,300],[750,25,500],[1000,35,670],[1250,42,835],[1500,50,1000],[2000,70,1350],[2500,85,1700],[3000,100,2000],[4000,135,2700],[5000,170,3400],[6000,200,4000],[7500,250,5000]];
const allowedStyles=new Set(['Aurora','Titan','Horizon','Infinity','Legacy','Custom']);
const isInt=n=>Number.isSafeInteger(n)&&n>=0;
function respond(res,status,data){res.status(status).json(data)}
function validate(p){
 if(!p||typeof p!=='object'||!Array.isArray(p.locations)||p.locations.length<1||p.locations.length>100)return 'Invalid locations';
 if(!Number.isFinite(p.received)||p.received<0)return 'Invalid token amount';
 const tier=TIERS.filter(t=>p.received+1e-8>=t[0]).at(-1);
 if(p.towns!==(tier?.[1]||0)||p.sentinels!==(tier?.[2]||0))return 'Tier values do not match reported ANGA amount';
 if(!p.towns)return 'No Genesis promotion tier reached';
 let assigned=0;
 for(const l of p.locations){
  if(!l||typeof l.country!=='string'||!l.country.trim()||l.country.length>120||typeof l.place!=='string'||!l.place.trim()||l.place.length>250||!isInt(l.count)||l.count<1||!allowedStyles.has(l.style)||typeof l.preferences!=='string'||l.preferences.length>3000||typeof l.merge!=='boolean')return 'Invalid location preferences';
  if(l.merge&&(!isInt(l.mergeCount)||l.mergeCount<2||l.mergeCount>l.count||!isInt(l.output)||l.output<1||l.output>=l.mergeCount))return 'Invalid merge quantities';
  assigned+=l.count;
 }
 const f=p.foundation;if(!f||typeof f.contribute!=='boolean'||!isInt(f.towns)||(!f.contribute&&f.towns!==0)||assigned+f.towns>p.towns)return 'Town allocation exceeds available amount';
 return null;
}
export default async function handler(req,res){
 if(!['GET','PUT'].includes(req.method))return respond(res,405,{error:'Method not allowed'});
 const base=process.env.SUPABASE_URL?.replace(/\/$/,'');const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!key)return respond(res,503,{error:'Database is not configured'});
 const wallet=String(req.method==='GET'?req.query.wallet:req.body?.wallet||'').toUpperCase();
 if(!WALLET.test(wallet))return respond(res,400,{error:'Invalid Stellar public address'});
 const url=`${base}/rest/v1/genesis_preferences?wallet=eq.${encodeURIComponent(wallet)}`;
 const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
 try{
  if(req.method==='GET'){
   const r=await fetch(url+'&select=preferences,updated_at',{headers});if(!r.ok)throw Error(`Supabase read ${r.status}`);
   const rows=await r.json();return rows.length?respond(res,200,rows[0]):respond(res,404,{error:'No saved Genesis preferences'});
  }
  if(Buffer.byteLength(JSON.stringify(req.body||{}))>64*1024)return respond(res,413,{error:'Preferences too large'});
  const p=req.body?.preferences;const error=validate(p);if(error)return respond(res,400,{error});
  const preferences={...p,wallet,savedAt:new Date().toISOString()};
  const r=await fetch(`${base}/rest/v1/genesis_preferences?on_conflict=wallet`,{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify({wallet,preferences,updated_at:new Date().toISOString()})});
  if(!r.ok)throw Error(`Supabase write ${r.status}`);
  return respond(res,200,{saved:true});
 }catch(e){console.error('Genesis API error',e);return respond(res,502,{error:'Unable to access Genesis preferences database'});}
}
