const WALLET=/^G[A-Z2-7]{55}$/;
const cors={"Access-Control-Allow-Origin":process.env.NEXUS_ALLOWED_ORIGIN||"*","Access-Control-Allow-Methods":"GET,PUT,OPTIONS","Access-Control-Allow-Headers":"Content-Type"};
function send(res,status,body){Object.entries(cors).forEach(([k,v])=>res.setHeader(k,v));res.status(status).json(body)}
export default async function handler(req,res){
 if(req.method==='OPTIONS')return send(res,204,{});
 const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!key)return send(res,503,{error:'Database is not configured'});
 const wallet=String(req.method==='GET'?req.query.wallet:req.body?.wallet||'').toUpperCase();
 if(!WALLET.test(wallet))return send(res,400,{error:'Invalid Stellar public address'});
 const url=`${base}/rest/v1/investor_configs?wallet=eq.${encodeURIComponent(wallet)}`;
 const h={apikey:key,'Content-Type':'application/json'};
 if(req.method==='GET'){
   const r=await fetch(url+'&select=config,updated_at',{headers:h}); if(!r.ok){const detail=await r.text();console.error('Supabase read failed',{status:r.status,detail});return send(res,502,{error:'Database read failed',upstreamStatus:r.status});}
   const rows=await r.json(); if(!rows.length)return send(res,404,{error:'No configuration'}); return send(res,200,rows[0]);
 }
 if(req.method==='PUT'){
   const config=req.body?.config; if(!config||typeof config!=='object'||Array.isArray(config))return send(res,400,{error:'Invalid configuration'});
   const payload={wallet,config,updated_at:new Date().toISOString()};
   const r=await fetch(`${base}/rest/v1/investor_configs?on_conflict=wallet`,{method:'POST',headers:{...h,Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(payload)});
   if(!r.ok){const detail=await r.text();console.error('Supabase write failed',{status:r.status,detail});return send(res,502,{error:'Database write failed',upstreamStatus:r.status});} const rows=await r.json(); return send(res,200,rows[0]||payload);
 }
 return send(res,405,{error:'Method not allowed'});
}
