const C=window.ANGA_CONFIG,$=s=>document.querySelector(s),fmt=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n),usd=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0,notation:n>=1e9?'compact':'standard'}).format(n);$('#buyTop').href=$('#buyHero').href=C.buyUrl;let acct,tier,conf={};const tierFor=b=>C.tiers.slice().reverse().find(t=>b>=t.min)||null,key=()=>`anga:nexus:v32:${acct}`;
function cloudEnabled(){return !!(C.apiUrl&&/^https:\/\//.test(C.apiUrl))}
function setSaveState(t,kind=''){let e=document.querySelector('#saveState');if(!e)return;e.textContent=t;e.dataset.kind=kind}
async function load(){
  let cached={};try{cached=JSON.parse(localStorage.getItem(key())||'{}')}catch{}
  conf=cached;
  if(!cloudEnabled())return;
  try{
    let r=await fetch(`${C.apiUrl.replace(/\/$/,'')}/config?wallet=${encodeURIComponent(acct)}`,{headers:{'Accept':'application/json'}});
    if(r.status===404)return;
    if(!r.ok)throw Error('Cloud configuration unavailable');
    let j=await r.json();conf=j.config||{};localStorage.setItem(key(),JSON.stringify(conf));
  }catch(e){console.warn(e);}
}
async function save(){
  localStorage.setItem(key(),JSON.stringify(conf));
  if(!cloudEnabled()){setSaveState('Saved on this device','local');return true}
  setSaveState('Saving…','saving');
  try{
    let r=await fetch(`${C.apiUrl.replace(/\/$/,'')}/config`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({wallet:acct,config:conf})});
    if(!r.ok)throw Error('Cloud save failed');
    let j=await r.json();setSaveState(`Saved to NEXUS • ${new Date(j.updated_at||Date.now()).toLocaleString()}`,'saved');return true;
  }catch(e){setSaveState('Cloud unavailable • saved on this device','error');console.warn(e);return false}
}function qty(r){return tier?r.quantities[tier.tier-1]||0:0}function work(r){let c=conf[r.id];if(!c)return 0;return r.modes.slice(1).reduce((s,m)=>s+Number(c.alloc?.[m]||0),0)}function income(){let l=0,h=0;C.rewards.forEach(r=>{let n=work(r);l+=n*r.annualLow/12;h+=n*r.annualHigh/12});$('#income').textContent=`${usd(l)} – ${usd(h)}+ / month`}function rewards(){let rs=C.rewards.filter(r=>qty(r)>0),g=$('#grid');g.innerHTML='';rs.forEach(r=>{let e=document.createElement('article');e.className='card';e.innerHTML=`<div class=icon>${r.icon}</div><h3>${r.name}</h3><strong>${fmt(qty(r))}</strong><small>${conf[r.id]?'CONFIGURED':'AWAITING CONFIGURATION'}${r.id==='mining'?` • ${r.multipliers[tier.tier-1]}`:''}</small><button class=btn>MANAGE REWARD</button>`;e.querySelector('button').onclick=()=>openR(r);g.appendChild(e)});$('#cats').textContent=rs.length;$('#configured').textContent=rs.filter(r=>conf[r.id]).length;income();updateSuite()}function configWorking(r){let c=conf[r.id];if(!c)return 0;if(Array.isArray(c.allocations))return c.allocations.reduce((s,a)=>s+(/working|managed|lease|production|compute|charter|service|grid|hospitality|tourism|agricultural/i.test(a.use||'')?Number(a.quantity||0):0),0);return r.modes.slice(1).reduce((s,m)=>s+Number(c.alloc?.[m]||0),0)}
function configPlaces(){let out=[];C.rewards.forEach(r=>{let c=conf[r.id];if(!c)return;if(Array.isArray(c.allocations)){c.allocations.forEach(a=>{if(a.country||a.city)out.push({r,country:a.country||'',city:a.city||'',region:a.region||''})})}else if(c.country||c.city)out.push({r,country:c.country||'',city:c.city||'',region:c.region||''})});return out}
function updateSuite(){if(!tier)return;['portfolio','world','revenue'].forEach(id=>$('#'+id)?.classList.remove('hidden'));let rs=C.rewards.filter(r=>qty(r)>0),configured=rs.filter(r=>conf[r.id]),places=configPlaces(),working=rs.reduce((s,r)=>s+configWorking(r),0);$('#pfTotal').textContent=fmt(rs.reduce((s,r)=>s+qty(r),0));$('#pfConfigured').textContent=`${configured.length} / ${rs.length}`;$('#pfCountries').textContent=new Set(places.map(x=>(x.country||x.city).toLowerCase()).filter(Boolean)).size;$('#pfWorking').textContent=fmt(working);let pr=$('#portfolioRows');pr.innerHTML=rs.map(r=>{let c=conf[r.id],place='Not directed';if(c){let a=Array.isArray(c.allocations)?c.allocations[0]:c;if(a&&(a.city||a.country))place=[a.city,a.country].filter(Boolean).join(', ')}let st=c?.status||'REQUESTED';return `<div class="portfolio-row"><div>${r.icon}</div><div><div class="pri">${r.name}</div><small>${place}</small></div><div><small>ELIGIBLE</small><div>${fmt(qty(r))}</div></div><div><small>WORKING / MANAGED</small><div>${fmt(configWorking(r))}</div></div><span class="status-pill">${st}</span></div>`}).join('');
const countryGeo={"fiji":[177.976,-17.938],"tanzania":[34.142,-6.208],"w. sahara":[-12.572,24.231],"canada":[-110.244,56.702],"united states of america":[-99.315,37.237],"kazakhstan":[66.312,48.069],"uzbekistan":[63.443,41.353],"papua new guinea":[144.226,-6.668],"indonesia":[113.269,-0.179],"argentina":[-64.081,-37.239],"chile":[-69.838,-54.016],"dem. rep. congo":[22.391,-4.099],"somalia":[46.794,5.17],"kenya":[37.513,0.312],"sudan":[29.616,15.278],"chad":[18.307,15.278],"haiti":[-72.147,18.944],"dominican rep.":[-70.13,18.701],"russia":[88.597,59.406],"bahamas":[-78.396,26.685],"falkland is.":[-59.389,-51.7],"norway":[22.682,79.958],"greenland":[-39.283,71.867],"fr. s. antarctic lands":[69.647,-49.154],"timor-leste":[125.863,-8.781],"south africa":[26.148,-28.409],"lesotho":[28.244,-29.501],"mexico":[-102.25,23.599],"uruguay":[-55.819,-32.387],"brazil":[-49.712,-14.074],"bolivia":[-63.639,-16.4],"peru":[-75.875,-9.248],"colombia":[-72.486,3.969],"panama":[-81.483,8.406],"costa rica":[-83.684,9.706],"nicaragua":[-85.574,12.89],"honduras":[-87.228,14.488],"el salvador":[-88.92,13.815],"guatemala":[-90.334,15.792],"belize":[-88.699,17.311],"venezuela":[-65.426,6.482],"guyana":[-58.845,4.913],"suriname":[-56.032,3.84],"france":[2.099,46.895],"ecuador":[-78.279,-1.763],"puerto rico":[-66.445,18.301],"jamaica":[-77.152,18.024],"cuba":[-77.705,21.39],"zimbabwe":[29.322,-19.004],"botswana":[24.31,-22.46],"namibia":[17.146,-23.255],"senegal":[-14.729,14.495],"mali":[-0.701,17.955],"mauritania":[-11.493,21.163],"benin":[2.285,9.236],"niger":[9.774,17.39],"nigeria":[7.832,8.928],"cameroon":[13.492,7.226],"togo":[1.119,8.495],"ghana":[-1.087,7.816],"c\u00f4te d'ivoire":[-5.683,7.541],"guinea":[-9.658,9.951],"guinea-bissau":[-15.037,11.885],"liberia":[-9.71,6.33],"sierra leone":[-11.844,8.561],"burkina faso":[-1.276,12.241],"central african rep.":[20.479,6.763],"congo":[15.944,-0.648],"gabon":[11.593,-0.945],"eq. guinea":[10.377,1.711],"zambia":[25.37,-13.08],"malawi":[33.668,-13.175],"mozambique":[34.697,-18.319],"eswatini":[31.36,-26.566],"angola":[18.81,-11.88],"burundi":[29.957,-3.464],"israel":[34.691,31.421],"lebanon":[35.795,33.865],"madagascar":[46.669,-18.647],"palestine":[35.302,32.13],"gambia":[-16.042,13.402],"tunisia":[8.914,33.942],"algeria":[0.526,27.916],"jordan":[36.312,31.295],"united arab emirates":[54.988,24.282],"qatar":[51.179,25.349],"kuwait":[47.393,29.203],"iraq":[42.415,33.198],"oman":[56.977,20.798],"vanuatu":[166.899,-15.163],"cambodia":[104.999,12.866],"thailand":[101.663,13.037],"laos":[102.082,18.175],"myanmar":[95.873,18.997],"vietnam":[107.777,15.994],"north korea":[126.804,40.338],"south korea":[127.901,36.205],"mongolia":[105.334,46.847],"india":[79.179,21.872],"bangladesh":[89.876,23.564],"bhutan":[90.496,27.612],"nepal":[83.444,28.31],"pakistan":[70.093,30.358],"afghanistan":[65.315,33.833],"tajikistan":[71.04,38.754],"kyrgyzstan":[75.192,41.289],"turkmenistan":[58.672,39.121],"iran":[54.118,32.326],"syria":[38.574,35.027],"armenia":[45.064,39.952],"sweden":[14.786,62.275],"belarus":[27.786,53.706],"ukraine":[30.981,48.805],"poland":[19.076,51.884],"austria":[14.953,47.919],"hungary":[19.103,47.245],"moldova":[28.649,47.138],"romania":[24.212,46.036],"lithuania":[24.128,55.091],"latvia":[24.504,56.895],"estonia":[25.562,58.498],"germany":[10.432,51.431],"bulgaria":[25.139,42.739],"greece":[21.806,39.08],"turkey":[35.455,38.634],"albania":[19.968,41.248],"croatia":[15.584,44.545],"switzerland":[8.287,46.81],"luxembourg":[5.964,49.716],"belgium":[4.737,50.58],"netherlands":[5.398,52.04],"portugal":[-8.368,39.511],"spain":[-3.52,39.918],"ireland":[-7.807,53.51],"new caledonia":[165.687,-21.415],"solomon is.":[160.094,-9.505],"new zealand":[176.517,-38.305],"australia":[133.059,-24.841],"sri lanka":[80.684,7.862],"china":[98.77,36.799],"taiwan":[120.989,23.975],"italy":[12.631,42.558],"denmark":[9.461,56.324],"united kingdom":[-1.753,54.225],"iceland":[-18.458,64.988],"azerbaijan":[47.635,40.038],"georgia":[43.602,42.298],"philippines":[125.206,7.604],"malaysia":[102.072,3.833],"brunei":[114.893,4.713],"slovenia":[14.732,46.127],"finland":[27.373,65.03],"slovakia":[19.63,48.712],"czechia":[15.538,49.758],"eritrea":[38.296,15.198],"japan":[138.349,36.093],"paraguay":[-58.637,-23.114],"yemen":[47.473,15.815],"saudi arabia":[44.553,24.265],"n. cyprus":[33.451,35.309],"cyprus":[33.033,34.84],"morocco":[-9.983,28.49],"egypt":[29.37,26.895],"libya":[17.259,26.303],"ethiopia":[38.726,9.362],"djibouti":[42.412,11.855],"somaliland":[46.035,9.757],"uganda":[32.547,1.38],"rwanda":[30.031,-1.957],"bosnia and herz.":[18.115,43.853],"macedonia":[21.72,41.681],"serbia":[21.013,44.137],"montenegro":[19.396,42.75],"kosovo":[20.914,42.514],"trinidad and tobago":[-61.29,10.563],"s. sudan":[28.97,8.027],"usa":[-99.315,37.237],"united states":[-99.315,37.237],"uk":[-1.753,54.225],"uae":[54.988,24.282],"czech republic":[15.538,49.758]};const cityGeo={"cannes":[7.0174,43.5528],"sofia":[23.3219,42.6977],"paris":[2.3522,48.8566],"london":[-0.1276,51.5072],"monaco":[7.4246,43.7384],"sydney":[151.2093,-33.8688],"melbourne":[144.9631,-37.8136],"perth":[115.8605,-31.9505],"brisbane":[153.0251,-27.4698],"new york":[-74.006,40.7128],"los angeles":[-118.2437,34.0522],"las vegas":[-115.1398,36.1699],"miami":[-80.1918,25.7617],"dubai":[55.2708,25.2048],"abu dhabi":[54.3773,24.4539],"singapore":[103.8198,1.3521],"tokyo":[139.6917,35.6895],"hong kong":[114.1694,22.3193],"bangkok":[100.5018,13.7563],"mumbai":[72.8777,19.076],"delhi":[77.1025,28.7041],"rome":[12.4964,41.9028],"milan":[9.19,45.4642],"madrid":[-3.7038,40.4168],"barcelona":[2.1734,41.3851],"berlin":[13.405,52.52],"munich":[11.582,48.1351],"amsterdam":[4.9041,52.3676],"zurich":[8.5417,47.3769],"geneva":[6.1432,46.2044],"lisbon":[-9.1393,38.7223],"athens":[23.7275,37.9838],"istanbul":[28.9784,41.0082],"cape town":[18.4241,-33.9249],"johannesburg":[28.0473,-26.2041],"nairobi":[36.8219,-1.2921],"buenos aires":[-58.3816,-34.6037],"rio de janeiro":[-43.1729,-22.9068],"sao paulo":[-46.6333,-23.5505],"auckland":[174.7633,-36.8485],"queenstown":[168.6626,-45.0312],"mal\u00e9":[73.5093,4.1755],"male":[73.5093,4.1755]};function mapXY(country,city){let c=(city||'').trim().toLowerCase(),k=(country||'').trim().toLowerCase(),ll=cityGeo[c]||countryGeo[k];if(!ll)return [50,50];let lon=ll[0],lat=ll[1];return [((lon+180)/360)*100,((85-lat)/145)*100]}let markers=$('#mapMarkers');markers.innerHTML='';places.slice(0,18).forEach((x,i)=>{let xy=mapXY(x.country,x.city);let m=document.createElement('i');m.className='map-marker';m.style.left=xy[0]+'%';m.style.top=xy[1]+'%';let mode=(x.use||'').toLowerCase().includes('managed')?'managed':(x.use||'').toLowerCase().match(/working|rental/)?'working':'personal';m.dataset.mode=mode;m.dataset.short=`${(x.city||x.country).toUpperCase()} · ${x.r.name.replace('NEXUS ','').toUpperCase()}`;m.innerHTML=`<span class="map-card"><small>NEXUS DESTINATION</small><b>${esc(x.city||x.country)}${x.city&&x.country?', '+esc(x.country):''}</b><p><strong>${x.r.icon} ${esc(x.r.name)}</strong></p><p>${esc(x.use||'Personal')} · ${fmt(x.quantity||0)} allocated</p><p>Status · ${esc(conf[x.r.id]?.status||'REQUESTED')}</p></span>`;markers.appendChild(m)});$('#mapCount').textContent=`${places.length} DESTINATION${places.length===1?'':'S'}`;$('#mapLegend').innerHTML=places.length?places.slice(0,10).map(x=>`<span>${x.r.icon} ${esc(x.city||x.country)} · ${esc(x.country)}</span>`).join(''):'<span>No destinations configured yet.</span>';
let low=0,high=0,rr=[];rs.forEach(r=>{let n=configWorking(r);if(n){let l=n*r.annualLow,h=n*r.annualHigh;low+=l;high+=h;rr.push({r,n,l,h})}});$('#revMonth').textContent=`${usd(low/12)} – ${usd(high/12)}+`;$('#revAnnual').textContent=`${usd(low)} – ${usd(high)}+`;$('#revenueRows').innerHTML=rr.length?rr.map(x=>`<div class="revenue-row"><div>${x.r.icon}</div><div><b>${x.r.name}</b><br><small>WORKING / MANAGED UNITS</small></div><div>${fmt(x.n)}</div><div>${usd(x.l/12)} / mo</div><div>${usd(x.h/12)}+ / mo</div></div>`).join(''):'<div class="revenue-row"><div>—</div><div><b>No working allocations configured</b><br><small>Configure a reward to populate projections.</small></div></div>'}
function statusTimeline(status='REQUESTED'){let steps=['REQUESTED','NEXUS REVIEW','LOCATION CONFIRMED','ACQUISITION / BUILD','PREPARATION','ACTIVE','REVENUE GENERATING'],i=Math.max(0,steps.indexOf(status));return `<div class="timeline">${steps.map((x,j)=>`<div class="timeline-step ${j<=i?'active':''}">${x}</div>`).join('')}</div>`}
function dash(b){$('#balance').textContent=fmt(b);if(!tier){$('#tier').textContent='NOT ELIGIBLE';$('#tierName').textContent='Minimum 90 ANGA';$('#next').textContent=`${fmt(Math.max(0,90-b))} ANGA to Foundation`;$('#bar').style.width=`${Math.min(100,b/90*100)}%`;return}$('#tier').textContent=`TIER ${tier.tier}`;$('#tierName').textContent=tier.name;let n=C.tiers[tier.tier];if(n){$('#next').textContent=`${fmt(Math.max(0,n.min-b))} ANGA to ${n.name}`;$('#bar').style.width=`${Math.min(100,(b-tier.min)/(n.min-tier.min)*100)}%`}else{$('#next').textContent='HIGHEST ANGA LEVEL';$('#bar').style.width='100%'}}async function lookup(){let a=$('#address').value.trim().toUpperCase();if(!/^G[A-Z2-7]{55}$/.test(a)){status('Enter a valid Stellar public G-address.');return}status('Reading Stellar ledger…');try{let r=await fetch(`https://horizon.stellar.org/accounts/${a}`);if(!r.ok)throw Error('Stellar account not found or unavailable.');let j=await r.json(),x=j.balances.find(b=>b.asset_code===C.asset.code&&b.asset_issuer===C.asset.issuer),b=Number(x?.balance||0);acct=a;tier=tierFor(b);await load();dash(b);$('#dash').classList.remove('hidden');if(tier){$('#rewards').classList.remove('hidden');rewards();status(`Connected • ${tier.name} detected.`)}else{$('#rewards').classList.add('hidden');status(`Connected • ${fmt(b)} ANGA detected. Tier 1 starts at 90 ANGA.`)}localStorage.setItem('anga:last',a)}catch(e){status(e.message)}}function status(t){$('#status').textContent=t}function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function openR(r){
  let q=qty(r),o=conf[r.id]||{alloc:{},country:'',region:'',city:'',instructions:'',mine:'Gold',style:'Coastal'};

  if(r.id==='houses'){
    const imgs={
      Coastal:'assets/rewards/houses/houses-coastal.webp',
      Modern:'assets/rewards/houses/houses-modern.webp',
      Mountain:'assets/rewards/houses/houses-mountain.webp'
    };
    let allocations=Array.isArray(o.allocations)&&o.allocations.length
      ? o.allocations
      : [{
          style:o.style||'Coastal',
          quantity:Object.values(o.alloc||{}).reduce((a,b)=>a+Math.max(0,Number(b||0)),0),
          country:o.country||'',
          region:o.region||'',
          city:o.city||'',
          use:'Rental / Working',
          instructions:o.instructions||''
        }];

    $('#body').innerHTML=`<span>🏠 NEXUS REWARD MANAGEMENT</span>
      <h2>NEXUS Houses</h2>
      <div class="house-total-line"><span>HOUSE ALLOCATIONS</span><strong>${fmt(q)} AVAILABLE</strong></div>
      <p class="house-intro">Split your NEXUS Houses across different designs, destinations and uses. Add as many allocations as you need.</p>
      <div class="house-master-gallery">
        <img src="assets/rewards/houses/houses-overview.webp" alt="NEXUS Houses — Coastal, Modern and Mountain designs">
        <div><b>COASTAL</b><b>MODERN</b><b>MOUNTAIN</b></div>
      </div>
      <div class="house-allocation-summary">
        <div><small>ALLOCATED</small><b id="houseAllocated">0</b></div>
        <div><small>REMAINING</small><b id="houseRemaining">${fmt(q)}</b></div>
        <div><small>ALLOCATIONS</small><b id="houseAllocationCount">0</b></div>
      </div>
      <div class="house-progress"><i id="houseProgress"></i></div>
      <div id="houseAllocations"></div>
      <button type="button" id="addHouseAllocation" class="btn ghost house-add">+ ADD HOUSE ALLOCATION</button>
      <div class=estimate><small>MONTHLY REVENUE</small><b id=est>$0 – $0+ / month</b><p>Based on Rental / Working and NEXUS Managed house quantities across all allocations.</p></div>
      <p id="houseError" class="house-error"></p>
      <button id=saveR class="btn save">SAVE HOUSE CONFIGURATION</button>`;

    $('#modal').classList.remove('hidden');

    const holder=$('#houseAllocations');
    function escAttr(v){return esc(String(v??''))}
    function card(a,i){
      let style=a.style||'Coastal';
      return `<article class="house-allocation-card" data-i="${i}">
        <div class="house-allocation-head">
          <div><small>HOUSE ALLOCATION</small><h3>Allocation ${String(i+1).padStart(2,'0')}</h3></div>
          <div class="house-allocation-badge">${style.toUpperCase()}</div>
          ${allocations.length>1?'<button type="button" class="remove-house-allocation">REMOVE</button>':''}
        </div>
        <div class="house-configurator">
          <div class="house-visual-column">
            <div class="house-allocation-photo"><img src="${imgs[style]||imgs.Coastal}" alt="${style} NEXUS House"></div>
            <div class="house-style-title"><small>01</small><div><b>SELECT DESIGN</b><span>Choose the architectural style for this allocation.</span></div></div>
            <div class="house-style-switch">
              ${Object.keys(imgs).map(s=>`<button type="button" data-style="${s}" class="${s===style?'active':''}"><img src="${imgs[s]}" alt=""><span>${s.toUpperCase()}</span></button>`).join('')}
            </div>
          </div>
          <div class="house-control-column">
            <section class="house-config-section"><div class="house-section-label"><small>02</small><div><b>ALLOCATION</b><span>Set quantity and intended use.</span></div></div><div class="house-fields">
              <div class="field"><label>QUANTITY</label><input class="ha-qty" type="number" min="0" max="${q}" step="1" value="${Math.max(0,Number(a.quantity||0))}"></div>
              <div class="field"><label>USE</label><select class="ha-use">${['Personal','NEXUS Managed','Rental / Working'].map(x=>`<option ${a.use===x?'selected':''}>${x}</option>`).join('')}</select></div>
            </div></section>
            <section class="house-config-section"><div class="house-section-label"><small>03</small><div><b>DESTINATION</b><span>Direct this allocation anywhere you choose.</span></div></div><div class="house-fields">
              <div class="field"><label>COUNTRY</label><input class="ha-country" value="${escAttr(a.country)}" placeholder="Any country"></div>
              <div class="field"><label>STATE / REGION</label><input class="ha-region" value="${escAttr(a.region)}" placeholder="State / region"></div>
              <div class="field full"><label>CITY</label><input class="ha-city" value="${escAttr(a.city)}" placeholder="Any city"></div>
              <div class="field full"><label>DESTINATION / INSTRUCTIONS</label><textarea class="ha-instructions" placeholder="Optional instructions">${escAttr(a.instructions)}</textarea></div>
            </div></section>
          </div>
        </div>
      </article>`;
    }

    function render(){
      holder.innerHTML=allocations.map(card).join('');
      holder.querySelectorAll('.house-allocation-card').forEach((el,i)=>{
        el.querySelectorAll('[data-style]').forEach(btn=>btn.onclick=()=>{
          allocations[i].style=btn.dataset.style;
          el.querySelector('.house-allocation-photo img').src=imgs[btn.dataset.style];
          el.querySelector('.house-allocation-badge').textContent=btn.dataset.style.toUpperCase();
          el.querySelectorAll('[data-style]').forEach(x=>x.classList.toggle('active',x===btn));
        });
        let bind=(sel,key,num=false)=>{
          let x=el.querySelector(sel);
          x.oninput=()=>{allocations[i][key]=num?Math.max(0,Math.floor(Number(x.value||0))):x.value;calc()};
          x.onchange=x.oninput;
        };
        bind('.ha-qty','quantity',true); bind('.ha-use','use'); bind('.ha-country','country');
        bind('.ha-region','region'); bind('.ha-city','city'); bind('.ha-instructions','instructions');
        let rem=el.querySelector('.remove-house-allocation');
        if(rem) rem.onclick=()=>{allocations.splice(i,1);render();calc()};
      });
      $('#houseAllocationCount').textContent=allocations.length;
      calc();
    }

    function calc(){
      let total=allocations.reduce((s,a)=>s+Math.max(0,Number(a.quantity||0)),0);
      let working=allocations.reduce((s,a)=>s+((a.use==='Rental / Working'||a.use==='NEXUS Managed')?Math.max(0,Number(a.quantity||0)):0),0);
      let remaining=Math.max(0,q-total);
      $('#houseAllocated').textContent=fmt(total);
      $('#houseRemaining').textContent=fmt(remaining);
      $('#houseAllocationCount').textContent=allocations.length;
      $('#houseProgress').style.width=(q?Math.min(100,total/q*100):0)+'%';
      $('#est').textContent=`${usd(working*r.annualLow/12)} – ${usd(working*r.annualHigh/12)}+ / month`;
      let over=total>q;
      $('#houseError').textContent=over?`Reduce allocations by ${fmt(total-q)} houses.`:'';
      $('#saveR').disabled=over;
    }

    $('#addHouseAllocation').onclick=()=>{
      allocations.push({style:'Modern',quantity:0,country:'',region:'',city:'',use:'Rental / Working',instructions:''});
      render();
      setTimeout(()=>holder.lastElementChild?.scrollIntoView({behavior:'smooth',block:'nearest'}),30);
    };

    $('#saveR').onclick=()=>{
      let total=allocations.reduce((s,a)=>s+Math.max(0,Number(a.quantity||0)),0);
      if(total>q)return;
      conf[r.id]={allocations:allocations.map(a=>({...a,quantity:Math.max(0,Number(a.quantity||0))}))};
      save();$('#modal').classList.add('hidden');rewards();
    };
    render();
    return;
  }


  const premiumGalleries={
    farms:{folder:'farms',overview:'farms-overview.webp',label:'FARM',styles:{Broadacre:'farms-broadacre.webp',Ranch:'farms-ranch.webp','Smart Farm':'farms-smart.webp'}},
    resorts:{folder:'resorts',overview:'resorts-overview.webp',label:'RESORT',styles:{Tropical:'resorts-tropical.webp',Alpine:'resorts-alpine.webp',Urban:'resorts-urban.webp'}},
    islands:{folder:'islands',overview:'islands-overview.webp',label:'ISLAND',styles:{Private:'islands-private.webp',Developed:'islands-developed.webp',Eco:'islands-eco.webp'}},
    smart:{folder:'smart',overview:'smart-overview.webp',label:'SMART BUILDING',styles:{Waterfront:'smart-waterfront.webp',Connected:'smart-connected.webp','Eco Tower':'smart-eco.webp'}},
    datacentres:{folder:'datacentres',overview:'overview.webp',label:'DATA CENTRE',styles:{'Global Hub':'global-hub.webp','Eco Data Center':'eco.webp','Modular Data Center':'modular.webp'}}
  };
  if(premiumGalleries[r.id]){
    const g=premiumGalleries[r.id], base=`assets/rewards/${g.folder}/`, imgs=Object.fromEntries(Object.entries(g.styles).map(([k,v])=>[k,base+v])), first=Object.keys(imgs)[0];
    let allocations=Array.isArray(o.allocations)&&o.allocations.length?o.allocations:[{style:o.style||first,quantity:Object.values(o.alloc||{}).reduce((a,b)=>a+Math.max(0,Number(b||0)),0),country:o.country||'',region:o.region||'',city:o.city||'',use:r.modes[2]||r.modes[1]||r.modes[0],instructions:o.instructions||''}];
    $('#body').innerHTML=`<span>${r.icon} NEXUS REWARD MANAGEMENT</span><h2>${r.name}</h2><div class="house-total-line"><span>${g.label} ALLOCATIONS</span><strong>${fmt(q)} AVAILABLE</strong></div><p class="house-intro">Split your ${r.name} across different designs, destinations and uses. Add as many allocations as you need.</p><div class="house-master-gallery"><img src="${base+g.overview}" alt="${r.name} overview"><div>${Object.keys(imgs).map(x=>`<b>${x.toUpperCase()}</b>`).join('')}</div></div><div class="house-allocation-summary"><div><small>ALLOCATED</small><b id="houseAllocated">0</b></div><div><small>REMAINING</small><b id="houseRemaining">${fmt(q)}</b></div><div><small>ALLOCATIONS</small><b id="houseAllocationCount">0</b></div></div><div class="house-progress"><i id="houseProgress"></i></div><div id="houseAllocations"></div><button type="button" id="addHouseAllocation" class="btn ghost house-add">+ ADD ${g.label} ALLOCATION</button><div class=estimate><small>MONTHLY REVENUE</small><b id=est>$0 – $0+ / month</b><p>Based on working and NEXUS Managed quantities across all allocations.</p></div><p id="houseError" class="house-error"></p><button id=saveR class="btn save">SAVE ${g.label} CONFIGURATION</button>`;
    $('#modal').classList.remove('hidden'); const holder=$('#houseAllocations'); const escAttr=v=>esc(String(v??''));
    function card(a,i){let style=imgs[a.style]?a.style:first;return `<article class="house-allocation-card" data-i="${i}"><div class="house-allocation-head"><div><small>${g.label} ALLOCATION</small><h3>Allocation ${String(i+1).padStart(2,'0')}</h3></div><div class="house-allocation-badge">${style.toUpperCase()}</div>${allocations.length>1?'<button type="button" class="remove-house-allocation">REMOVE</button>':''}</div><div class="house-configurator"><div class="house-visual-column"><div class="house-allocation-photo"><img src="${imgs[style]}" alt="${style} ${r.name}"></div><div class="house-style-title"><small>01</small><div><b>SELECT DESIGN</b><span>Choose the style for this allocation.</span></div></div><div class="house-style-switch">${Object.keys(imgs).map(x=>`<button type="button" data-style="${x}" class="${x===style?'active':''}"><img src="${imgs[x]}" alt=""><span>${x.toUpperCase()}</span></button>`).join('')}</div></div><div class="house-control-column"><section class="house-config-section"><div class="house-section-label"><small>02</small><div><b>ALLOCATION</b><span>Set quantity and intended use.</span></div></div><div class="house-fields"><div class="field"><label>QUANTITY</label><input class="ha-qty" type="number" min="0" max="${q}" step="1" value="${Math.max(0,Number(a.quantity||0))}"></div><div class="field"><label>USE</label><select class="ha-use">${r.modes.map(x=>`<option ${a.use===x?'selected':''}>${x}</option>`).join('')}</select></div></div></section><section class="house-config-section"><div class="house-section-label"><small>03</small><div><b>DESTINATION</b><span>Direct this allocation anywhere you choose.</span></div></div><div class="house-fields"><div class="field"><label>COUNTRY</label><input class="ha-country" value="${escAttr(a.country)}" placeholder="Any country"></div><div class="field"><label>STATE / REGION</label><input class="ha-region" value="${escAttr(a.region)}" placeholder="State / region"></div><div class="field full"><label>CITY</label><input class="ha-city" value="${escAttr(a.city)}" placeholder="Any city"></div><div class="field full"><label>DESTINATION / INSTRUCTIONS</label><textarea class="ha-instructions" placeholder="Optional instructions">${escAttr(a.instructions)}</textarea></div></div></section></div></div></article>`}
    function render(){holder.innerHTML=allocations.map(card).join('');holder.querySelectorAll('.house-allocation-card').forEach((el,i)=>{el.querySelectorAll('[data-style]').forEach(btn=>btn.onclick=()=>{allocations[i].style=btn.dataset.style;el.querySelector('.house-allocation-photo img').src=imgs[btn.dataset.style];el.querySelector('.house-allocation-badge').textContent=btn.dataset.style.toUpperCase();el.querySelectorAll('[data-style]').forEach(x=>x.classList.toggle('active',x===btn))});let bind=(sel,key,num=false)=>{let x=el.querySelector(sel);x.oninput=()=>{allocations[i][key]=num?Math.max(0,Math.floor(Number(x.value||0))):x.value;calc()};x.onchange=x.oninput};bind('.ha-qty','quantity',true);bind('.ha-use','use');bind('.ha-country','country');bind('.ha-region','region');bind('.ha-city','city');bind('.ha-instructions','instructions');let rem=el.querySelector('.remove-house-allocation');if(rem)rem.onclick=()=>{allocations.splice(i,1);render();calc()}});$('#houseAllocationCount').textContent=allocations.length;calc()}
    function calc(){let total=allocations.reduce((s,a)=>s+Math.max(0,Number(a.quantity||0)),0),working=allocations.reduce((s,a)=>s+(a.use!==r.modes[0]?Math.max(0,Number(a.quantity||0)):0),0),remaining=Math.max(0,q-total);$('#houseAllocated').textContent=fmt(total);$('#houseRemaining').textContent=fmt(remaining);$('#houseAllocationCount').textContent=allocations.length;$('#houseProgress').style.width=(q?Math.min(100,total/q*100):0)+'%';$('#est').textContent=`${usd(working*r.annualLow/12)} – ${usd(working*r.annualHigh/12)}+ / month`;let over=total>q;$('#houseError').textContent=over?`Reduce allocations by ${fmt(total-q)}.`:'';$('#saveR').disabled=over}
    $('#addHouseAllocation').onclick=()=>{allocations.push({style:first,quantity:0,country:'',region:'',city:'',use:r.modes[2]||r.modes[1]||r.modes[0],instructions:''});render();setTimeout(()=>holder.lastElementChild?.scrollIntoView({behavior:'smooth',block:'nearest'}),30)};
    $('#saveR').onclick=()=>{let total=allocations.reduce((s,a)=>s+Math.max(0,Number(a.quantity||0)),0);if(total>q)return;conf[r.id]={allocations:allocations.map(a=>({...a,quantity:Math.max(0,Number(a.quantity||0))}))};save();$('#modal').classList.add('hidden');rewards()};render();return;
  }


  if(r.id==='commercial'){
    const imgs={
      Office:'assets/rewards/commercial/commercial-office.webp',
      Retail:'assets/rewards/commercial/commercial-retail.webp',
      Industrial:'assets/rewards/commercial/commercial-industrial.webp'
    };
    let allocations=Array.isArray(o.allocations)&&o.allocations.length
      ? o.allocations
      : [{
          style:o.style||'Office',
          quantity:Object.values(o.alloc||{}).reduce((a,b)=>a+Math.max(0,Number(b||0)),0),
          country:o.country||'',
          region:o.region||'',
          city:o.city||'',
          use:'Rental / Working',
          instructions:o.instructions||''
        }];

    $('#body').innerHTML=`<span>🏢 NEXUS REWARD MANAGEMENT</span>
      <h2>NEXUS Commercial Buildings</h2>
      <div class="house-total-line"><span>COMMERCIAL ALLOCATIONS</span><strong>${fmt(q)} AVAILABLE</strong></div>
      <p class="house-intro">Split your NEXUS Commercial Buildings across different designs, destinations and uses. Add as many allocations as you need.</p>
      <div class="house-master-gallery">
        <img src="assets/rewards/commercial/commercial-overview.jpg" alt="NEXUS Commercial Buildings — Coastal, Modern and Mountain designs">
        <div><b>OFFICE</b><b>RETAIL</b><b>INDUSTRIAL</b></div>
      </div>
      <div class="house-allocation-summary">
        <div><small>ALLOCATED</small><b id="houseAllocated">0</b></div>
        <div><small>REMAINING</small><b id="houseRemaining">${fmt(q)}</b></div>
        <div><small>ALLOCATIONS</small><b id="houseAllocationCount">0</b></div>
      </div>
      <div class="house-progress"><i id="houseProgress"></i></div>
      <div id="houseAllocations"></div>
      <button type="button" id="addHouseAllocation" class="btn ghost house-add">+ ADD COMMERCIAL ALLOCATION</button>
      <div class=estimate><small>MONTHLY REVENUE</small><b id=est>$0 – $0+ / month</b><p>Based on Rental / Working and NEXUS Managed commercial building quantities across all allocations.</p></div>
      <p id="houseError" class="house-error"></p>
      <button id=saveR class="btn save">SAVE COMMERCIAL CONFIGURATION</button>`;

    $('#modal').classList.remove('hidden');

    const holder=$('#houseAllocations');
    function escAttr(v){return esc(String(v??''))}
    function card(a,i){
      let style=a.style||'Office';
      return `<article class="house-allocation-card" data-i="${i}">
        <div class="house-allocation-head">
          <div><small>COMMERCIAL ALLOCATION</small><h3>Allocation ${String(i+1).padStart(2,'0')}</h3></div>
          <div class="house-allocation-badge">${style.toUpperCase()}</div>
          ${allocations.length>1?'<button type="button" class="remove-house-allocation">REMOVE</button>':''}
        </div>
        <div class="house-configurator">
          <div class="house-visual-column">
            <div class="house-allocation-photo"><img src="${imgs[style]||imgs.Office}" alt="${style} NEXUS Commercial Building"></div>
            <div class="house-style-title"><small>01</small><div><b>SELECT DESIGN</b><span>Choose the architectural style for this allocation.</span></div></div>
            <div class="house-style-switch">
              ${Object.keys(imgs).map(s=>`<button type="button" data-style="${s}" class="${s===style?'active':''}"><img src="${imgs[s]}" alt=""><span>${s.toUpperCase()}</span></button>`).join('')}
            </div>
          </div>
          <div class="house-control-column">
            <section class="house-config-section"><div class="house-section-label"><small>02</small><div><b>ALLOCATION</b><span>Set quantity and intended use.</span></div></div><div class="house-fields">
              <div class="field"><label>QUANTITY</label><input class="ha-qty" type="number" min="0" max="${q}" step="1" value="${Math.max(0,Number(a.quantity||0))}"></div>
              <div class="field"><label>USE</label><select class="ha-use">${['Personal','NEXUS Managed','Rental / Working'].map(x=>`<option ${a.use===x?'selected':''}>${x}</option>`).join('')}</select></div>
            </div></section>
            <section class="house-config-section"><div class="house-section-label"><small>03</small><div><b>DESTINATION</b><span>Direct this allocation anywhere you choose.</span></div></div><div class="house-fields">
              <div class="field"><label>COUNTRY</label><input class="ha-country" value="${escAttr(a.country)}" placeholder="Any country"></div>
              <div class="field"><label>STATE / REGION</label><input class="ha-region" value="${escAttr(a.region)}" placeholder="State / region"></div>
              <div class="field full"><label>CITY</label><input class="ha-city" value="${escAttr(a.city)}" placeholder="Any city"></div>
              <div class="field full"><label>DESTINATION / INSTRUCTIONS</label><textarea class="ha-instructions" placeholder="Optional instructions">${escAttr(a.instructions)}</textarea></div>
            </div></section>
          </div>
        </div>
      </article>`;
    }

    function render(){
      holder.innerHTML=allocations.map(card).join('');
      holder.querySelectorAll('.house-allocation-card').forEach((el,i)=>{
        el.querySelectorAll('[data-style]').forEach(btn=>btn.onclick=()=>{
          allocations[i].style=btn.dataset.style;
          el.querySelector('.house-allocation-photo img').src=imgs[btn.dataset.style];
          el.querySelector('.house-allocation-badge').textContent=btn.dataset.style.toUpperCase();
          el.querySelectorAll('[data-style]').forEach(x=>x.classList.toggle('active',x===btn));
        });
        let bind=(sel,key,num=false)=>{
          let x=el.querySelector(sel);
          x.oninput=()=>{allocations[i][key]=num?Math.max(0,Math.floor(Number(x.value||0))):x.value;calc()};
          x.onchange=x.oninput;
        };
        bind('.ha-qty','quantity',true); bind('.ha-use','use'); bind('.ha-country','country');
        bind('.ha-region','region'); bind('.ha-city','city'); bind('.ha-instructions','instructions');
        let rem=el.querySelector('.remove-house-allocation');
        if(rem) rem.onclick=()=>{allocations.splice(i,1);render();calc()};
      });
      $('#houseAllocationCount').textContent=allocations.length;
      calc();
    }

    function calc(){
      let total=allocations.reduce((s,a)=>s+Math.max(0,Number(a.quantity||0)),0);
      let working=allocations.reduce((s,a)=>s+((a.use==='Rental / Working'||a.use==='NEXUS Managed')?Math.max(0,Number(a.quantity||0)):0),0);
      let remaining=Math.max(0,q-total);
      $('#houseAllocated').textContent=fmt(total);
      $('#houseRemaining').textContent=fmt(remaining);
      $('#houseAllocationCount').textContent=allocations.length;
      $('#houseProgress').style.width=(q?Math.min(100,total/q*100):0)+'%';
      $('#est').textContent=`${usd(working*r.annualLow/12)} – ${usd(working*r.annualHigh/12)}+ / month`;
      let over=total>q;
      $('#houseError').textContent=over?`Reduce allocations by ${fmt(total-q)} houses.`:'';
      $('#saveR').disabled=over;
    }

    $('#addHouseAllocation').onclick=()=>{
      allocations.push({style:'Office',quantity:0,country:'',region:'',city:'',use:'Rental / Working',instructions:''});
      render();
      setTimeout(()=>holder.lastElementChild?.scrollIntoView({behavior:'smooth',block:'nearest'}),30);
    };

    $('#saveR').onclick=()=>{
      let total=allocations.reduce((s,a)=>s+Math.max(0,Number(a.quantity||0)),0);
      if(total>q)return;
      conf[r.id]={allocations:allocations.map(a=>({...a,quantity:Math.max(0,Number(a.quantity||0))}))};
      save();$('#modal').classList.add('hidden');rewards();
    };
    render();
    return;
  }

  const rewardPhotos={vehicles:'assets/rewards/vehicles/main.webp',supercars:'assets/rewards/supercars/main.webp',jets:'assets/rewards/jets/main.webp',helicopters:'assets/rewards/helicopters/main.webp',yachts:'assets/rewards/yachts/main.webp',ships:'assets/rewards/ships/main.webp',healingunits:'assets/rewards/healingunits/main.webp',healingcentres:'assets/rewards/healingcentres/main.webp',energy:'assets/rewards/energy/main.webp',mining:'assets/rewards/mining/main.webp'};
  const preferenceRewards=['vehicles','supercars','jets','helicopters','yachts','ships','healingunits','healingcentres','energy','mining'];
  let rows=r.modes.map(m=>`<div class=alloc><b>${m}</b><input data-mode="${m}" type=number min=0 max="${q}" step=1 value="${o.alloc?.[m]||0}"></div>`).join(''),
      mine=r.id==='mining'?`<div class=field><label>WHAT WOULD YOU LIKE TO MINE?</label><select id=mine>${['Gold','Silver','Copper','Lithium','Nickel','Iron Ore','Uranium','Rare Earths','Other'].map(x=>`<option ${o.mine===x?'selected':''}>${x}</option>`).join('')}</select><small>Multiplier: ${r.multipliers[tier.tier-1]}</small></div>`:'',
      hero=rewardPhotos[r.id]?`<div class="reward-single-hero"><img src="${rewardPhotos[r.id]}" alt="${r.name}"></div>`:'',
      pref=preferenceRewards.includes(r.id)?`<div class="field full"><label>STYLE / CATEGORY / MODEL PREFERENCE</label><input id=preference value="${esc(o.preference||'')}" placeholder="Tell NEXUS what style, category or model you prefer"></div>`:'';
  $('#body').innerHTML=`<span>${r.icon} NEXUS REWARD MANAGEMENT</span><h2>${r.name}</h2>${hero}${statusTimeline(o.status||'REQUESTED')}<p>Entitlement: <b>${fmt(q)}</b></p>${rows}<p id=remain></p><div class="configurator-extra"><small>BUILD MY REWARD</small><div class=form><div class=field><label>PREFERRED STYLE / TYPE</label><input id=buildStyle value="${esc(o.buildStyle||'')}" placeholder="Architecture, class, category or design"></div><div class=field><label>KEY FEATURES</label><input id=features value="${esc(o.features||'')}" placeholder="Size, capacity, amenities, specifications..."></div></div></div><div class=form>${mine}${pref}<div class=field><label>COUNTRY</label><input id=country value="${esc(o.country)}" placeholder="Any country"></div><div class=field><label>STATE / REGION</label><input id=region value="${esc(o.region)}"></div><div class=field><label>CITY</label><input id=city value="${esc(o.city)}" placeholder="Any city"></div><div class="field full"><label>DESTINATION / INSTRUCTIONS</label><textarea id=instructions>${esc(o.instructions)}</textarea></div></div><div class=estimate><small>MONTHLY REVENUE</small><b id=est>$0 – $0+ / month</b></div><button id=saveR class="btn save">SAVE NEXUS CONFIGURATION</button>`;$('#modal').classList.remove('hidden');let ins=[...document.querySelectorAll('[data-mode]')],calc=()=>{let total=ins.reduce((s,i)=>s+Math.max(0,Number(i.value||0)),0),w=ins.slice(1).reduce((s,i)=>s+Math.max(0,Number(i.value||0)),0);$('#remain').innerHTML=`Allocated <b>${fmt(total)}</b> / ${fmt(q)} • Remaining <b>${fmt(Math.max(0,q-total))}</b>`;$('#est').textContent=`${usd(w*r.annualLow/12)} – ${usd(w*r.annualHigh/12)}+ / month`;$('#saveR').disabled=total>q};ins.forEach(i=>i.oninput=calc);calc();$('#saveR').onclick=()=>{let a={};ins.forEach(i=>a[i.dataset.mode]=Math.max(0,Number(i.value||0)));if(Object.values(a).reduce((x,y)=>x+y,0)>q)return;conf[r.id]={alloc:a,country:$('#country').value.trim(),region:$('#region').value.trim(),city:$('#city').value.trim(),instructions:$('#instructions').value.trim(),preference:$('#preference')?.value.trim()||'',buildStyle:$('#buildStyle')?.value.trim()||'',features:$('#features')?.value.trim()||'',status:o.status||'REQUESTED',mine:$('#mine')?.value||null};save();$('#modal').classList.add('hidden');rewards()}}
$('#lookup').onclick=lookup;$('#address').onkeydown=e=>{if(e.key==='Enter')lookup()};$('#close').onclick=()=>$('#modal').classList.add('hidden');$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden')};let last=localStorage.getItem('anga:last');if(last)$('#address').value=last;