const C=window.ANGA_CONFIG,$=s=>document.querySelector(s),fmt=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n),usd=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0,notation:n>=1e9?'compact':'standard'}).format(n);$('#buyTop').href=$('#buyHero').href=C.buyUrl;let acct,tier,conf={};const tierFor=b=>C.tiers.slice().reverse().find(t=>b>=t.min)||null,key=()=>`anga:nexus:v1:${acct}`;function load(){try{conf=JSON.parse(localStorage.getItem(key())||'{}')}catch{conf={}}}function save(){localStorage.setItem(key(),JSON.stringify(conf))}function qty(r){return tier?r.quantities[tier.tier-1]||0:0}function work(r){let c=conf[r.id];if(!c)return 0;return r.modes.slice(1).reduce((s,m)=>s+Number(c.alloc?.[m]||0),0)}function income(){let l=0,h=0;C.rewards.forEach(r=>{let n=work(r);l+=n*r.annualLow/12;h+=n*r.annualHigh/12});$('#income').textContent=`${usd(l)} – ${usd(h)}+ / month`}function rewards(){let rs=C.rewards.filter(r=>qty(r)>0),g=$('#grid');g.innerHTML='';rs.forEach(r=>{let e=document.createElement('article');e.className='card';e.innerHTML=`<div class=icon>${r.icon}</div><h3>${r.name}</h3><strong>${fmt(qty(r))}</strong><small>${conf[r.id]?'CONFIGURED':'AWAITING CONFIGURATION'}${r.id==='mining'?` • ${r.multipliers[tier.tier-1]}`:''}</small><button class=btn>MANAGE REWARD</button>`;e.querySelector('button').onclick=()=>openR(r);g.appendChild(e)});$('#cats').textContent=rs.length;$('#configured').textContent=rs.filter(r=>conf[r.id]).length;income()}function dash(b){$('#balance').textContent=fmt(b);if(!tier){$('#tier').textContent='NOT ELIGIBLE';$('#tierName').textContent='Minimum 90 ANGA';$('#next').textContent=`${fmt(Math.max(0,90-b))} ANGA to Foundation`;$('#bar').style.width=`${Math.min(100,b/90*100)}%`;return}$('#tier').textContent=`TIER ${tier.tier}`;$('#tierName').textContent=tier.name;let n=C.tiers[tier.tier];if(n){$('#next').textContent=`${fmt(Math.max(0,n.min-b))} ANGA to ${n.name}`;$('#bar').style.width=`${Math.min(100,(b-tier.min)/(n.min-tier.min)*100)}%`}else{$('#next').textContent='HIGHEST ANGA LEVEL';$('#bar').style.width='100%'}}async function lookup(){let a=$('#address').value.trim().toUpperCase();if(!/^G[A-Z2-7]{55}$/.test(a)){status('Enter a valid Stellar public G-address.');return}status('Reading Stellar ledger…');try{let r=await fetch(`https://horizon.stellar.org/accounts/${a}`);if(!r.ok)throw Error('Stellar account not found or unavailable.');let j=await r.json(),x=j.balances.find(b=>b.asset_code===C.asset.code&&b.asset_issuer===C.asset.issuer),b=Number(x?.balance||0);acct=a;tier=tierFor(b);load();dash(b);$('#dash').classList.remove('hidden');if(tier){$('#rewards').classList.remove('hidden');rewards();status(`Connected • ${tier.name} detected.`)}else{$('#rewards').classList.add('hidden');status(`Connected • ${fmt(b)} ANGA detected. Tier 1 starts at 90 ANGA.`)}localStorage.setItem('anga:last',a)}catch(e){status(e.message)}}function status(t){$('#status').textContent=t}function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function openR(r){
  let q=qty(r),o=conf[r.id]||{alloc:{},country:'',region:'',city:'',instructions:'',mine:'Gold',style:'Coastal'};

  if(r.id==='houses'){
    const imgs={
      Coastal:'assets/rewards/houses/houses-coastal.png',
      Modern:'assets/rewards/houses/houses-modern.png',
      Mountain:'assets/rewards/houses/houses-mountain.png'
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
        <img src="assets/rewards/houses/houses-overview.png" alt="NEXUS Houses — Coastal, Modern and Mountain designs">
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


  if(r.id==='commercial'){
    const imgs={
      Office:'assets/rewards/commercial/commercial-office.png',
      Retail:'assets/rewards/commercial/commercial-retail.png',
      Industrial:'assets/rewards/commercial/commercial-industrial.png'
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

  let rows=r.modes.map(m=>`<div class=alloc><b>${m}</b><input data-mode="${m}" type=number min=0 max="${q}" step=1 value="${o.alloc?.[m]||0}"></div>`).join(''),
      mine=r.id==='mining'?`<div class=field><label>WHAT WOULD YOU LIKE TO MINE?</label><select id=mine>${['Gold','Silver','Copper','Lithium','Nickel','Iron Ore','Uranium','Rare Earths','Other'].map(x=>`<option ${o.mine===x?'selected':''}>${x}</option>`).join('')}</select><small>Multiplier: ${r.multipliers[tier.tier-1]}</small></div>`:'';$('#body').innerHTML=`<span>${r.icon} NEXUS REWARD MANAGEMENT</span><h2>${r.name}</h2><p>Entitlement: <b>${fmt(q)}</b></p>${rows}<p id=remain></p><div class=form>${mine}<div class=field><label>COUNTRY</label><input id=country value="${esc(o.country)}" placeholder="Any country"></div><div class=field><label>STATE / REGION</label><input id=region value="${esc(o.region)}"></div><div class=field><label>CITY</label><input id=city value="${esc(o.city)}" placeholder="Any city"></div><div class="field full"><label>DESTINATION / INSTRUCTIONS</label><textarea id=instructions>${esc(o.instructions)}</textarea></div></div><div class=estimate><small>MONTHLY REVENUE</small><b id=est>$0 – $0+ / month</b></div><button id=saveR class="btn save">SAVE NEXUS CONFIGURATION</button>`;$('#modal').classList.remove('hidden');let ins=[...document.querySelectorAll('[data-mode]')],calc=()=>{let total=ins.reduce((s,i)=>s+Math.max(0,Number(i.value||0)),0),w=ins.slice(1).reduce((s,i)=>s+Math.max(0,Number(i.value||0)),0);$('#remain').innerHTML=`Allocated <b>${fmt(total)}</b> / ${fmt(q)} • Remaining <b>${fmt(Math.max(0,q-total))}</b>`;$('#est').textContent=`${usd(w*r.annualLow/12)} – ${usd(w*r.annualHigh/12)}+ / month`;$('#saveR').disabled=total>q};ins.forEach(i=>i.oninput=calc);calc();$('#saveR').onclick=()=>{let a={};ins.forEach(i=>a[i.dataset.mode]=Math.max(0,Number(i.value||0)));if(Object.values(a).reduce((x,y)=>x+y,0)>q)return;conf[r.id]={alloc:a,country:$('#country').value.trim(),region:$('#region').value.trim(),city:$('#city').value.trim(),instructions:$('#instructions').value.trim(),mine:$('#mine')?.value||null};save();$('#modal').classList.add('hidden');rewards()}}
$('#lookup').onclick=lookup;$('#address').onkeydown=e=>{if(e.key==='Enter')lookup()};$('#close').onclick=()=>$('#modal').classList.add('hidden');$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden')};let last=localStorage.getItem('anga:last');if(last)$('#address').value=last;