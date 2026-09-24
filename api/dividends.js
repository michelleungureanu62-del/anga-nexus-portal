const WALLET=/^G[A-Z2-7]{55}$/;
const cors={"Access-Control-Allow-Origin":process.env.NEXUS_ALLOWED_ORIGIN||"*","Access-Control-Allow-Methods":"GET,OPTIONS","Access-Control-Allow-Headers":"Content-Type"};
function send(res,status,body){Object.entries(cors).forEach(([k,v])=>res.setHeader(k,v));res.status(status).json(body)}
const CODES=['XLM','XRP','USDT','USDC','GOLD','SILVER','SP500','XDC','BTC','ETH','SOL'];
function blankTotals(){return Object.fromEntries(CODES.map(c=>[c,0]))}
function addCredits(total,credits={}){for(const c of CODES)total[c]+=Number(credits[c]||0);return total}
export default async function handler(req,res){
  if(req.method==='OPTIONS')return send(res,204,{});
  if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
  const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!base||!key)return send(res,503,{error:'Database is not configured'});
  const wallet=String(req.query.wallet||'').toUpperCase();
  if(!WALLET.test(wallet))return send(res,400,{error:'Invalid Stellar public address'});
  const h={apikey:key,'Content-Type':'application/json'},all=[];let from=0;
  while(true){
    const to=from+999;
    const url=`${base}/rest/v1/dividend_credits?wallet=eq.${encodeURIComponent(wallet)}&select=credit_date,tier,anga_balance,credits,created_at&order=credit_date.desc`;
    const r=await fetch(url,{headers:{...h,Range:`${from}-${to}`}});
    if(!r.ok){const detail=await r.text();console.error('Dividend read failed',{status:r.status,detail});return send(res,502,{error:'Dividend account unavailable',upstreamStatus:r.status})}
    const batch=await r.json();all.push(...batch);if(batch.length<1000)break;from+=1000;if(from>=10000)break;
  }
  const totals={today:blankTotals(),days30:blankTotals(),allTime:blankTotals()};
  const today=new Date().toISOString().slice(0,10),cutoff=new Date();cutoff.setUTCDate(cutoff.getUTCDate()-29);const cutoffDate=cutoff.toISOString().slice(0,10);
  for(const row of all){addCredits(totals.allTime,row.credits);if(row.credit_date>=cutoffDate)addCredits(totals.days30,row.credits);if(row.credit_date===today)addCredits(totals.today,row.credits)}
  return send(res,200,{wallet,daysCredited:all.length,totals,history:all.slice(0,90)});
}
