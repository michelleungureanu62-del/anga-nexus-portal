const WALLET=/^G[A-Z2-7]{55}$/;
const cors={"Access-Control-Allow-Origin":process.env.NEXUS_ALLOWED_ORIGIN||"*","Access-Control-Allow-Methods":"GET,OPTIONS","Access-Control-Allow-Headers":"Content-Type"};
function send(res,status,body){Object.entries(cors).forEach(([k,v])=>res.setHeader(k,v));res.status(status).json(body)}
export default async function handler(req,res){
  if(req.method==='OPTIONS')return send(res,204,{});
  if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
  const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!base||!key)return send(res,503,{error:'Database is not configured'});
  const wallet=String(req.query.wallet||'').toUpperCase();
  if(!WALLET.test(wallet))return send(res,400,{error:'Invalid Stellar public address'});
  const h={apikey:key,'Content-Type':'application/json'};
  const url=`${base}/rest/v1/dividend_credits?wallet=eq.${encodeURIComponent(wallet)}&select=credit_date,tier,anga_balance,credits,created_at&order=credit_date.desc&limit=90`;
  const r=await fetch(url,{headers:h});
  if(!r.ok){const detail=await r.text();console.error('Dividend read failed',{status:r.status,detail});return send(res,502,{error:'Dividend account unavailable',upstreamStatus:r.status})}
  const rows=await r.json();return send(res,200,{wallet,daysCredited:rows.length,history:rows});
}
