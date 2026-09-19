const C=window.ANGA_CONFIG,$=s=>document.querySelector(s),fmt=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n),usd=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0,notation:n>=1e9?'compact':'standard'}).format(n);$('#buyTop').href=$('#buyHero').href=C.buyUrl;let acct,tier,conf={};const tierFor=b=>C.tiers.slice().reverse().find(t=>b>=t.min)||null,key=()=>`anga:nexus:v1:${acct}`;function load(){try{conf=JSON.parse(localStorage.getItem(key())||'{}')}catch{conf={}}}function save(){localStorage.setItem(key(),JSON.stringify(conf))}function qty(r){return tier?r.quantities[tier.tier-1]||0:0}function work(r){let c=conf[r.id];if(!c)return 0;return r.modes.slice(1).reduce((s,m)=>s+Number(c.alloc?.[m]||0),0)}function income(){let l=0,h=0;C.rewards.forEach(r=>{let n=work(r);l+=n*r.annualLow/12;h+=n*r.annualHigh/12});$('#income').textContent=`${usd(l)} – ${usd(h)}+ / month`}function rewards(){let rs=C.rewards.filter(r=>qty(r)>0),g=$('#grid');g.innerHTML='';rs.forEach(r=>{let e=document.createElement('article');e.className='card';e.innerHTML=`<div class=icon>${r.icon}</div><h3>${r.name}</h3><strong>${fmt(qty(r))}</strong><small>${conf[r.id]?'CONFIGURED':'AWAITING CONFIGURATION'}${r.id==='mining'?` • ${r.multipliers[tier.tier-1]}`:''}</small><button class=btn>MANAGE REWARD</button>`;e.querySelector('button').onclick=()=>openR(r);g.appendChild(e)});$('#cats').textContent=rs.length;$('#configured').textContent=rs.filter(r=>conf[r.id]).length;income()}function dash(b){$('#balance').textContent=fmt(b);if(!tier){$('#tier').textContent='NOT ELIGIBLE';$('#tierName').textContent='Minimum 90 ANGA';$('#next').textContent=`${fmt(Math.max(0,90-b))} ANGA to Foundation`;$('#bar').style.width=`${Math.min(100,b/90*100)}%`;return}$('#tier').textContent=`TIER ${tier.tier}`;$('#tierName').textContent=tier.name;let n=C.tiers[tier.tier];if(n){$('#next').textContent=`${fmt(Math.max(0,n.min-b))} ANGA to ${n.name}`;$('#bar').style.width=`${Math.min(100,(b-tier.min)/(n.min-tier.min)*100)}%`}else{$('#next').textContent='HIGHEST ANGA LEVEL';$('#bar').style.width='100%'}}async function lookup(){let a=$('#address').value.trim().toUpperCase();if(!/^G[A-Z2-7]{55}$/.test(a)){status('Enter a valid Stellar public G-address.');return}status('Reading Stellar ledger…');try{let r=await fetch(`https://horizon.stellar.org/accounts/${a}`);if(!r.ok)throw Error('Stellar account not found or unavailable.');let j=await r.json(),x=j.balances.find(b=>b.asset_code===C.asset.code&&b.asset_issuer===C.asset.issuer),b=Number(x?.balance||0);acct=a;tier=tierFor(b);load();dash(b);$('#dash').classList.remove('hidden');if(tier){$('#rewards').classList.remove('hidden');rewards();status(`Connected • ${tier.name} detected.`)}else{$('#rewards').classList.add('hidden');status(`Connected • ${fmt(b)} ANGA detected. Tier 1 starts at 90 ANGA.`)}localStorage.setItem('anga:last',a)}catch(e){status(e.message)}}function status(t){$('#status').textContent=t}function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function openR(r){let q=qty(r),o=conf[r.id]||{alloc:{},country:'',region:'',city:'',instructions:'',mine:'Gold',style:'Coastal'},houseGallery=r.id==='houses'?`<div class=reward-gallery><div class=reward-hero><img id=rewardHero src="assets/rewards/houses/houses-coastal.png" alt="NEXUS Houses coastal design"></div><div class=reward-thumbs><button type=button class=reward-thumb data-img="assets/rewards/houses/houses-coastal.png" data-style="Coastal"><img src="assets/rewards/houses/houses-coastal.png" alt="Coastal house"><span>COASTAL</span></button><button type=button class=reward-thumb data-img="assets/rewards/houses/houses-modern.png" data-style="Modern"><img src="assets/rewards/houses/houses-modern.png" alt="Modern house"><span>MODERN</span></button><button type=button class=reward-thumb data-img="assets/rewards/houses/houses-mountain.png" data-style="Mountain"><img src="assets/rewards/houses/houses-mountain.png" alt="Mountain house"><span>MOUNTAIN</span></button></div><div class=selected-style>PREFERRED STYLE <b id=selectedStyle>${esc(o.style||'Coastal')}</b></div></div>`:'',rows=r.modes.map(m=>`<div class=alloc><b>${m}</b><input data-mode="${m}" type=number min=0 max="${q}" step=1 value="${o.alloc?.[m]||0}"></div>`).join(''),mine=r.id==='mining'?`<div class=field><label>WHAT WOULD YOU LIKE TO MINE?</label><select id=mine>${['Gold','Silver','Copper','Lithium','Nickel','Iron Ore','Uranium','Rare Earths','Other'].map(x=>`<option ${o.mine===x?'selected':''}>${x}</option>`).join('')}</select><small>Multiplier: ${r.multipliers[tier.tier-1]}</small></div>`:'';$('#body').innerHTML=`<span>${r.icon} NEXUS REWARD MANAGEMENT</span><h2>${r.name}</h2><p>Entitlement: <b>${fmt(q)}</b></p>${houseGallery}${rows}<p id=remain></p><div class=form>${mine}<div class=field><label>COUNTRY</label><input id=country value="${esc(o.country)}" placeholder="Any country"></div><div class=field><label>STATE / REGION</label><input id=region value="${esc(o.region)}"></div><div class=field><label>CITY</label><input id=city value="${esc(o.city)}" placeholder="Any city"></div><div class="field full"><label>DESTINATION / INSTRUCTIONS</label><textarea id=instructions>${esc(o.instructions)}</textarea></div></div><div class=estimate><small>MONTHLY REVENUE</small><b id=est>$0 – $0+ / month</b></div><button id=saveR class="btn save">SAVE NEXUS CONFIGURATION</button>`;$('#modal').classList.remove('hidden');let ins=[...document.querySelectorAll('[data-mode]')],calc=()=>{let total=ins.reduce((s,i)=>s+Math.max(0,Number(i.value||0)),0),w=ins.slice(1).reduce((s,i)=>s+Math.max(0,Number(i.value||0)),0);$('#remain').innerHTML=`Allocated <b>${fmt(total)}</b> / ${fmt(q)} • Remaining <b>${fmt(Math.max(0,q-total))}</b>`;$('#est').textContent=`${usd(w*r.annualLow/12)} – ${usd(w*r.annualHigh/12)}+ / month`;$('#saveR').disabled=total>q};ins.forEach(i=>i.oninput=calc);if(r.id==='houses'){let thumbs=[...document.querySelectorAll('.reward-thumb')],hero=$('#rewardHero'),style=$('#selectedStyle'),initial=o.style||'Coastal',active=thumbs.find(b=>b.dataset.style===initial)||thumbs[0];let choose=b=>{thumbs.forEach(x=>x.classList.remove('active'));b.classList.add('active');hero.src=b.dataset.img;style.textContent=b.dataset.style};choose(active);thumbs.forEach(b=>b.onclick=()=>choose(b))}calc();$('#saveR').onclick=()=>{let a={};ins.forEach(i=>a[i.dataset.mode]=Math.max(0,Number(i.value||0)));if(Object.values(a).reduce((x,y)=>x+y,0)>q)return;conf[r.id]={alloc:a,country:$('#country').value.trim(),region:$('#region').value.trim(),city:$('#city').value.trim(),instructions:$('#instructions').value.trim(),mine:$('#mine')?.value||null,style:$('#selectedStyle')?.textContent||null};save();$('#modal').classList.add('hidden');rewards()}}$('#lookup').onclick=lookup;$('#address').onkeydown=e=>{if(e.key==='Enter')lookup()};$('#close').onclick=()=>$('#modal').classList.add('hidden');$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden')};let last=localStorage.getItem('anga:last');if(last)$('#address').value=last;

/* V19 — NEXUS Houses: independent multi-allocation manager */
(() => {
  const workspace = document.getElementById("houseAllocationWorkspace");
  const list = document.getElementById("houseAllocationList");
  const addBtn = document.getElementById("addHouseAllocation");
  const unallocatedEl = document.getElementById("houseUnallocated");
  const totalEl = document.getElementById("houseAllocationTotal");
  const progressEl = document.getElementById("houseAllocationProgress");
  const msgEl = document.getElementById("houseAllocationMessage");
  if (!workspace || !list || !addBtn) return;

  const STYLE_IMAGES = {
    Coastal: "assets/rewards/houses/nexus-houses-coastal.jpg",
    Modern: "assets/rewards/houses/nexus-houses-modern.jpg",
    Mountain: "assets/rewards/houses/nexus-houses-mountain.jpg"
  };

  let houseTotal = 0;
  let allocations = [];

  function getVisibleHouseTotal() {
    // Prefer a reward quantity shown in the currently open modal.
    const candidates = [
      document.getElementById("rewardQty"),
      document.getElementById("modalRewardQty"),
      document.querySelector("[data-reward-quantity]"),
      document.querySelector(".reward-modal .reward-qty"),
      document.querySelector(".modal .reward-qty")
    ].filter(Boolean);
    for (const el of candidates) {
      const n = Number(String(el.value ?? el.textContent ?? "").replace(/[^0-9.]/g,""));
      if (Number.isFinite(n) && n >= 0) return Math.floor(n);
    }
    // Fallback: infer from tier/reward text if it contains "NEXUS Houses".
    const modal = document.querySelector("dialog[open], .modal.open, .reward-modal");
    if (modal) {
      const txt = modal.textContent || "";
      const m = txt.match(/([\d,]+)\s+NEXUS\s+Houses/i);
      if (m) return Number(m[1].replace(/,/g,""));
    }
    return 0;
  }

  function sumAllocated() {
    return allocations.reduce((s,a) => s + Math.max(0, Number(a.quantity)||0), 0);
  }

  function updateMeter() {
    const used = sumAllocated();
    const remaining = Math.max(0, houseTotal - used);
    unallocatedEl.textContent = remaining.toLocaleString();
    totalEl.textContent = houseTotal.toLocaleString();
    progressEl.style.width = houseTotal ? `${Math.min(100,(used/houseTotal)*100)}%` : "0%";
    msgEl.textContent = used > houseTotal
      ? `Reduce allocations by ${(used-houseTotal).toLocaleString()} houses.`
      : remaining === 0 && houseTotal > 0
        ? "All available houses are allocated."
        : "";
  }

  function render() {
    list.innerHTML = "";
    allocations.forEach((a, i) => {
      const card = document.createElement("article");
      card.className = "house-allocation-card";
      card.innerHTML = `
        <div class="house-allocation-image" style="background-image:url('${STYLE_IMAGES[a.style] || STYLE_IMAGES.Coastal}')"></div>
        <div class="house-allocation-body">
          <div class="house-allocation-title">
            <strong>ALLOCATION ${String(i+1).padStart(2,"0")}</strong>
            ${allocations.length > 1 ? '<button type="button" class="house-allocation-remove">REMOVE</button>' : ""}
          </div>
          <div class="house-allocation-fields">
            <label>STYLE
              <select data-k="style">
                ${Object.keys(STYLE_IMAGES).map(s => `<option ${s===a.style?"selected":""}>${s}</option>`).join("")}
              </select>
            </label>
            <label>QUANTITY
              <input data-k="quantity" type="number" min="0" step="1" value="${a.quantity || ""}" placeholder="0">
            </label>
            <label>COUNTRY
              <input data-k="country" value="${a.country || ""}" placeholder="Australia">
            </label>
            <label>CITY / REGION
              <input data-k="city" value="${a.city || ""}" placeholder="Gold Coast">
            </label>
          </div>
          <div class="house-allocation-use">
            ${["Personal","Revenue","Mixed"].map(use => `<button type="button" class="house-use-btn ${a.use===use?"active":""}" data-use="${use}">${use.toUpperCase()}</button>`).join("")}
          </div>
        </div>`;

      const img = card.querySelector(".house-allocation-image");
      card.querySelectorAll("[data-k]").forEach(el => {
        el.addEventListener("input", () => {
          const key = el.dataset.k;
          allocations[i][key] = key === "quantity" ? Math.max(0, Math.floor(Number(el.value)||0)) : el.value;
          if (key === "style") img.style.backgroundImage = `url('${STYLE_IMAGES[el.value]}')`;
          updateMeter();
          persist();
        });
      });
      card.querySelectorAll("[data-use]").forEach(btn => {
        btn.addEventListener("click", () => {
          allocations[i].use = btn.dataset.use;
          card.querySelectorAll("[data-use]").forEach(b => b.classList.toggle("active", b === btn));
          persist();
        });
      });
      const remove = card.querySelector(".house-allocation-remove");
      if (remove) remove.addEventListener("click", () => {
        allocations.splice(i,1);
        render();
        persist();
      });
      list.appendChild(card);
    });
    updateMeter();
  }

  function persist() {
    try { localStorage.setItem("anga_nexus_house_allocations", JSON.stringify(allocations)); } catch(e) {}
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem("anga_nexus_house_allocations") || "[]");
      if (Array.isArray(saved) && saved.length) allocations = saved;
    } catch(e) {}
    if (!allocations.length) allocations = [{style:"Coastal",quantity:0,country:"",city:"",use:"Revenue"}];
  }

  addBtn.addEventListener("click", () => {
    if (houseTotal && sumAllocated() >= houseTotal) {
      msgEl.textContent = "All available houses are already allocated.";
      return;
    }
    allocations.push({style:"Modern",quantity:0,country:"",city:"",use:"Revenue"});
    render();
  });

  function activateIfHouses() {
    const modal = document.querySelector("dialog[open], .modal.open, .reward-modal");
    const title = modal ? (modal.textContent || "") : "";
    const isHouse = /NEXUS\s+Houses/i.test(title);
    workspace.hidden = !isHouse;
    if (isHouse) {
      houseTotal = getVisibleHouseTotal();
      restore();
      render();
    }
  }

  // Existing app opens reward management through clicks; detect that without
  // changing its event handlers.
  document.addEventListener("click", (e) => {
    const target = e.target.closest("button,a,[role='button']");
    if (!target) return;
    const txt = (target.textContent || "") + " " + (target.getAttribute("data-reward") || "");
    if (/manage|house/i.test(txt)) setTimeout(activateIfHouses, 30);
  });

  const observer = new MutationObserver(() => setTimeout(activateIfHouses, 0));
  observer.observe(document.body, {subtree:true,attributes:true,attributeFilter:["open","class"]});
})();
