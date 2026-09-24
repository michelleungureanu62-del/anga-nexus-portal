const ASSET={code:'ANGA',issuer:'GBXMW62NDMYWVMNJ3CGHNM72SWG33LXOVLPL5WHNA57O3UGGCWEDDXRD'};
const TIERS=[
 {tier:1,min:90,max:449},{tier:2,min:450,max:1349},{tier:3,min:1350,max:3599},{tier:4,min:3600,max:8999},{tier:5,min:9000,max:17999},
 {tier:6,min:18000,max:35999},{tier:7,min:36000,max:67499},{tier:8,min:67500,max:112499},{tier:9,min:112500,max:224999},{tier:10,min:225000,max:null}
];
const CODES=['XLM','XRP','USDT','USDC','GOLD','SILVER','SP500','XDC','BTC','ETH','SOL'];
const RATES=[
 [1000000,50000,30000,30000,7500,15000,75,75000,.10,2,100],[2500000,120000,75000,75000,15000,35000,150,175000,.25,5,250],
 [5000000,350000,150000,150000,30000,75000,300,350000,.50,10,500],[10000000,1000000,300000,300000,60000,175000,500,750000,1,25,1000],
 [25000000,2500000,500000,500000,150000,500000,1500,1500000,2.5,75,2500],[60000000,4500000,1000000,1000000,500000,1750000,5000,3500000,5,150,5000],
 [120000000,9000000,3000000,3000000,1500000,6000000,10000,7500000,10,300,10000],[250000000,20000000,7500000,7500000,4000000,15000000,25000,15000000,25,750,25000],
 [500000000,50000000,20000000,20000000,10000000,40000000,75000,40000000,50,1500,50000],[1000000000,100000000,50000000,50000000,25000000,100000000,200000,100000000,100,3000,100000]
];
function tierFor(b){return [...TIERS].reverse().find(t=>b>=t.min)||null}
function creditObject(i){return Object.fromEntries(CODES.map((c,j)=>[c,RATES[i][j]]))}
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const secret=process.env.CRON_SECRET,auth=req.headers.authorization||'';
  if(!secret||auth!==`Bearer ${secret}`)return res.status(401).json({error:'Unauthorized'});
  const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!base||!key)return res.status(503).json({error:'Database is not configured'});
  const asset=encodeURIComponent(`${ASSET.code}:${ASSET.issuer}`),date=new Date().toISOString().slice(0,10);let url=`https://horizon.stellar.org/accounts?asset=${asset}&limit=200&order=asc`,holders=[],pages=0;
  while(url&&pages<10){pages++;const r=await fetch(url);if(!r.ok)return res.status(502).json({error:'Stellar holder scan failed'});const j=await r.json(),rows=j._embedded?.records||[];holders.push(...rows);url=rows.length===200?j._links?.next?.href:null}
  const payload=[];
  for(const a of holders){const bal=a.balances?.find(x=>x.asset_code===ASSET.code&&x.asset_issuer===ASSET.issuer),b=Number(bal?.balance||0),t=tierFor(b);if(!t)continue;payload.push({wallet:a.account_id,credit_date:date,tier:t.tier,anga_balance:b,credits:creditObject(t.tier-1)})}
  if(!payload.length)return res.status(200).json({date,eligible:0,credited:0});
  const h={apikey:key,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'};
  const r=await fetch(`${base}/rest/v1/dividend_credits?on_conflict=wallet,credit_date`,{method:'POST',headers:h,body:JSON.stringify(payload)});
  if(!r.ok){const detail=await r.text();console.error('Dividend batch write failed',{status:r.status,detail});return res.status(502).json({error:'Dividend batch write failed',upstreamStatus:r.status})}
  return res.status(200).json({date,eligible:payload.length,credited:payload.length,pages});
}
