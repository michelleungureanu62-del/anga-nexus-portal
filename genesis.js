(()=>{'use strict';
const issuer=window.ANGA_CONFIG.asset.issuer,code='ANGA';
const tiers=[[150,5,100],[300,10,200],[450,15,300],[750,25,500],[1000,35,670],[1250,42,835],[1500,50,1000],[2000,70,1350],[2500,85,1700],[3000,100,2000],[4000,135,2700],[5000,170,3400],[6000,200,4000],[7500,250,5000]];
const start=Date.parse('2026-10-08T00:00:00Z'),end=Date.parse('2026-10-19T00:00:00Z');
const $=id=>document.getElementById(id);let wallet='',received=0,towns=0,sentinels=0,locations=[],nextId=1;
const fmt=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:7});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid=n=>Number.isSafeInteger(n)&&n>=0;
function recalc(){const pledged=$('donate').value==='yes'?Number($('donationCount').value):0;let assigned=0,ok=valid(pledged);for(const l of locations){assigned+=l.count; if(!valid(l.count)||l.count<1||!l.country.trim()||!l.place.trim())ok=false;if(l.merge&&(!valid(l.mergeCount)||l.mergeCount<2||l.mergeCount>l.count||!valid(l.output)||l.output<1||l.output>=l.mergeCount))ok=false}if(assigned+pledged>towns)ok=false;$('remaining').textContent=fmt(Math.max(0,towns-assigned-pledged));$('summary').textContent=`${fmt(towns)} towns total · ${fmt(assigned)} assigned to locations · ${fmt(pledged)} foundation preference · ${fmt(towns-assigned-pledged)} remaining${ok?'':' · Check quantities and required location fields'}`;$('save').disabled=!ok;return ok}
function render(){const box=$('locations');box.innerHTML=locations.map((l,i)=>`<article class="location" data-id="${l.id}"><button class="secondary remove" data-action="remove" ${locations.length===1?'disabled':''}>REMOVE</button><h3>LOCATION ${i+1}</h3><div class="fields"><div class="field"><label>Country</label><input data-field="country" value="${esc(l.country)}" placeholder="Country"></div><div class="field"><label>Preferred location</label><input data-field="place" value="${esc(l.place)}" placeholder="City, region, preferred area"></div><div class="field"><label>Number of towns assigned here</label><input data-field="count" type="number" min="1" step="1" value="${l.count}"></div><div class="field"><label>Would you like to merge towns?</label><select data-field="merge"><option value="no" ${!l.merge?'selected':''}>No</option><option value="yes" ${l.merge?'selected':''}>Yes</option></select></div>${l.merge?`<div class="field"><label>How many original towns to merge?</label><input data-field="mergeCount" type="number" min="2" step="1" value="${l.mergeCount}"></div><div class="field"><label>Into how many merged towns?</label><input data-field="output" type="number" min="1" step="1" value="${l.output}"></div><p class="wide note">${l.mergeCount} original towns become ${l.output} merged developments. The ${l.mergeCount} original allocations count against your assigned towns at this location.</p>`:''}<div class="field"><label>Genesis Tower design</label><select data-field="style">${['Aurora','Titan','Horizon','Infinity','Legacy','Custom'].map(v=>`<option ${l.style===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="field wide"><label>Construction and location preferences</label><textarea data-field="preferences" placeholder="Describe how and where you want the town designed and built">${esc(l.preferences)}</textarea></div></div></article>`).join('');recalc()}
function newLocation(){return{id:nextId++,country:'',place:'',count:1,merge:false,mergeCount:2,output:1,style:'Aurora',preferences:''}}
$('locations').addEventListener('input',handle);$('locations').addEventListener('change',handle);
function handle(e){const el=e.target,field=el.dataset.field;if(!field)return;const card=el.closest('[data-id]'),l=locations.find(x=>x.id===Number(card.dataset.id));if(!l)return;if(['count','mergeCount','output'].includes(field))l[field]=Number(el.value);else if(field==='merge'){l.merge=el.value==='yes';render();return}else l[field]=el.value;const validMerge=!l.merge||(valid(l.mergeCount)&&l.mergeCount>=2&&l.mergeCount<=l.count&&valid(l.output)&&l.output>=1&&l.output<l.mergeCount);card.style.borderColor=validMerge?'#5c5260':'#d86b6b';recalc();if(!validMerge)$('save').disabled=true}
$('locations').addEventListener('click',e=>{if(e.target.dataset.action!=='remove')return;locations=locations.filter(l=>l.id!==Number(e.target.closest('[data-id]').dataset.id));render()});
$('addLocation').onclick=()=>{locations.push(newLocation());render()};
$('donate').onchange=()=>{$('donateBox').hidden=$('donate').value!=='yes';recalc()};$('donationCount').oninput=recalc;
function payload(){return{wallet,received,towns,sentinels,promotion:'2026-10-08 through 2026-10-18 UTC',locations,foundation:{contribute:$('donate').value==='yes',towns:$('donate').value==='yes'?Number($('donationCount').value):0},savedAt:new Date().toISOString(),status:'registration preferences'}}
$('save').onclick=async()=>{if(!recalc())return;const button=$('save');button.disabled=true;$('saveStatus').textContent='Saving preferences to database…';try{const r=await fetch('/api/genesis',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({wallet,preferences:payload()})});const data=await r.json();if(!r.ok)throw Error(data.error||'Save failed');$('saveStatus').textContent='Preferences saved to database. You can return and edit them later.'}catch(e){$('saveStatus').textContent='Could not save preferences: '+e.message}finally{recalc()}};
$('lookup').onclick=async()=>{const w=$('wallet').value.trim().toUpperCase();if(!/^G[A-Z2-7]{55}$/.test(w)){$('status').textContent='Enter a valid Stellar public address beginning with G.';return}wallet=w;$('lookup').disabled=true;$('status').textContent='Reading Stellar credit history…';$('registration').hidden=true;try{// Scan both credit effects and executed trades. Trade records provide a second
// source for DEX fills that some Horizon effect feeds do not expose as credits.
// Reconcile by ledger-close timestamp: credits already recorded at that ledger
// are subtracted from trade receipts to avoid counting the same fill twice.
const ledgerDates=new Map();
async function recordTime(r,kind){
  const raw=r.created_at??r.ledger_close_time??r.closed_at;
  if(raw!=null){
    const ms=typeof raw==='number' ? (raw>1e12?raw:raw*1000) : Date.parse(raw);
    if(Number.isFinite(ms))return ms;
  }
  // Horizon account trade records can omit created_at. Resolve the
  // ledger close time instead of rejecting a legitimate executed trade.
  if(Number.isSafeInteger(Number(r.ledger))&&Number(r.ledger)>0){
    const ledger=Number(r.ledger);
    if(!ledgerDates.has(ledger)){
      const response=await fetch(`https://horizon.stellar.org/ledgers/${ledger}`,{cache:'no-store'});
      if(!response.ok)throw Error(`Cannot resolve ${kind} ledger ${ledger}: HTTP ${response.status}`);
      const data=await response.json();
      const ms=Date.parse(data.closed_at??data.created_at);
      if(!Number.isFinite(ms))throw Error(`Ledger ${ledger} has no valid close time`);
      ledgerDates.set(ledger,ms);
    }
    return ledgerDates.get(ledger);
  }
  if(r.transaction_hash){
    const response=await fetch(`https://horizon.stellar.org/transactions/${encodeURIComponent(r.transaction_hash)}`,{cache:'no-store'});
    if(!response.ok)throw Error(`Cannot resolve ${kind} transaction timestamp: HTTP ${response.status}`);
    const data=await response.json();
    const ms=Date.parse(data.created_at);
    if(Number.isFinite(ms))return ms;
  }
  throw Error(`Cannot determine ${kind} timestamp; no partial allocation applied`);
}
async function scan(kind,onRow){
  let url=`https://horizon.stellar.org/accounts/${w}/${kind}?order=desc&limit=200`;
  let pages=0,finished=false;
  const seen=new Set();
  while(!finished){
    if(pages>=1000)throw Error(`${kind} history exceeds scan limit; no partial allocation applied.`);
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok)throw Error(`Stellar ${kind} lookup returned ${response.status}`);
    const data=await response.json();
    const rows=data._embedded?.records;
    if(!Array.isArray(rows))throw Error(`Invalid Stellar ${kind} response`);
    if(!rows.length)break;
    for(const r of rows){
      const date=await recordTime(r,kind);
      if(date<start){finished=true;break;}
      if(date>=end||seen.has(r.id))continue;
      seen.add(r.id);
      onRow(r,date);
    }
    pages++;
    if(finished||rows.length<200)break;
    const next=data._links?.next?.href;
    if(!next||next===url)throw Error(`Incomplete Stellar ${kind} history`);
    url=next;
    $('status').textContent=`Checking Stellar ${kind}… ${pages} pages`;
  }
}
const credits=new Map(),trades=new Map();
const add=(map,key,value)=>{
  if(!Number.isFinite(value)||value<0)throw Error('Invalid ANGA amount in Stellar history');
  if(value>0)map.set(key,(map.get(key)||0)+value);
};
await scan('effects',(r,date)=>{
  if(!['account_credited','trustline_credited'].includes(r.type))return;
  if(r.asset_code!==code||r.asset_issuer!==issuer)return;
  add(credits,String(date),Number(r.amount));
});
await scan('trades',(r,date)=>{
  // Horizon trade base_account is the seller of base_amount;
  // counter_account is the seller of counter_amount.
  const baseSeller=r.base_account===w,counterSeller=r.counter_account===w;
  if(!baseSeller&&!counterSeller)return;
  let assetCode,assetIssuer,amount;
  if(baseSeller){
    assetCode=r.counter_asset_code;
    assetIssuer=r.counter_asset_issuer;
    amount=Number(r.counter_amount);
  }else{
    assetCode=r.base_asset_code;
    assetIssuer=r.base_asset_issuer;
    amount=Number(r.base_amount);
  }
  if(assetCode===code&&assetIssuer===issuer)add(trades,String(date),amount);
});
let total=0;
for(const amount of credits.values())total+=amount;
for(const [timestamp,amount] of trades){
  // A trade credit can also appear in effects; add only the unmatched excess.
  total+=Math.max(0,amount-(credits.get(timestamp)||0));
}
if(!Number.isFinite(total))throw Error('Invalid calculated ANGA total');
received=total;const tier=tiers.filter(t=>total+1e-8>=t[0]).at(-1);towns=tier?.[1]||0;sentinels=tier?.[2]||0;$('received').textContent=fmt(received);$('towns').textContent=fmt(towns);$('sentinels').textContent=fmt(sentinels);$('status').textContent=`Lookup completed. ${tier?'Qualifying promotion tier: '+fmt(tier[0])+' ANGA.':'No published Genesis promotion tier reached.'}`;locations=[newLocation()];$('donate').value='no';$('donationCount').value=0;$('donateBox').hidden=true;try{const savedResponse=await fetch('/api/genesis?wallet='+encodeURIComponent(wallet));if(!savedResponse.ok&&savedResponse.status!==404)throw Error('Database unavailable');const saved=savedResponse.ok?(await savedResponse.json()).preferences:null;if(saved&&Array.isArray(saved.locations)){locations=saved.locations;nextId=Math.max(1,...locations.map(l=>Number(l.id)||0))+1;$('donate').value=saved.foundation?.contribute?'yes':'no';$('donationCount').value=saved.foundation?.towns||0;$('donateBox').hidden=$('donate').value!=='yes'}}catch(e){$('saveStatus').textContent='Saved preferences could not be loaded: '+e.message} $('registration').hidden=false;render()}catch(e){$('status').textContent='Lookup could not be completed: '+e.message}finally{$('lookup').disabled=false}};
})();