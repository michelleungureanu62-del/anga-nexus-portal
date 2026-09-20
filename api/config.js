const WALLET=/^G[A-Z2-7]{55}$/;
const MAX_BODY_BYTES=64*1024;
const WRITE_WINDOW_MS=60*1000,WRITE_LIMIT=30;
const buckets=globalThis.__nexusRateBuckets||(globalThis.__nexusRateBuckets=new Map());
function clientIp(req){return String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim()}
function allowWrite(req){const now=Date.now(),ip=clientIp(req),b=buckets.get(ip);if(!b||now-b.start>=WRITE_WINDOW_MS){buckets.set(ip,{start:now,count:1});return true}if(b.count>=WRITE_LIMIT)return false;b.count++;return true}
function bodyTooLarge(req){const n=Number(req.headers['content-length']||0);if(n>MAX_BODY_BYTES)return true;try{return Buffer.byteLength(JSON.stringify(req.body??{}),'utf8')>MAX_BODY_BYTES}catch{return true}}
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
   if(bodyTooLarge(req))return send(res,413,{error:'Configuration payload too large'});
   if(!allowWrite(req)){res.setHeader('Retry-After','60');return send(res,429,{error:'Too many save requests. Please try again shortly.'});}
   const config=req.body?.config; if(!config||typeof config!=='object'||Array.isArray(config))return send(res,400,{error:'Invalid configuration'});
   const payload={wallet,config,updated_at:new Date().toISOString()};
   const r=await fetch(`${base}/rest/v1/investor_configs?on_conflict=wallet`,{method:'POST',headers:{...h,Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(payload)});
   if(!r.ok){const detail=await r.text();console.error('Supabase write failed',{status:r.status,detail});return send(res,502,{error:'Database write failed',upstreamStatus:r.status});} const rows=await r.json(); return send(res,200,rows[0]||payload);
 }
 return send(res,405,{error:'Method not allowed'});
}
