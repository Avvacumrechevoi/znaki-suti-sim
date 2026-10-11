/* Движок симулятора «Знаки сути». Сценарий — scenario.json (или ?s=other.json). */
(async function(){
const P=new URLSearchParams(location.search), S=await (await fetch(P.get('s')||'scenario.json')).json();
const app=document.getElementById('app'), $=(h)=>{const d=document.createElement('div');d.innerHTML=h.trim();return d.firstElementChild};
const H=Object.fromEntries(S.heroes.map(h=>[h.id,h])), OP=S.opory, KEYS=Object.keys(OP);
const st={trust:Object.fromEntries(S.heroes.map(h=>[h.id,0])),tension:0,met:new Set(),flags:new Set(),my:Object.fromEntries(KEYS.map(k=>[k,0])),hyp:{},clues:[],step:0};
const total=S.scenes.length*3+2; const prog=()=>document.getElementById('bar').style.width=Math.min(100,st.step/total*100)+'%';
const col=k=>`--c:var(--${k});--cc:var(--${k}-c)`; const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const scrollTo=el=>setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),60);
function add(h){const e=typeof h==='string'?$(h):h;app.appendChild(e);return e}
function meters(){const m=document.getElementById('meters');m.innerHTML='';
 [...st.met].forEach(id=>{const v=st.trust[id];m.appendChild($(`<span class="mt" data-id="${id}" title="Доверие">${H[id].name}<span class="dots">${[...Array(5)].map((_,i)=>`<i class="${i<v+2?'on':''}" style="--c:var(--ok,#0E7C4A)"></i>`).join('')}</span></span>`))});
 m.appendChild($(`<span class="mt" data-id="tension" title="Напряжение">Напряжение<span class="dots">${[...Array(5)].map((_,i)=>`<i class="${i<st.tension?'on':''}" style="--c:var(--serdce)"></i>`).join('')}</span></span>`))}
function bump(ids){ids.forEach(id=>{const e=document.querySelector(`.mt[data-id="${id}"]`);e&&e.classList.add('bump')})}
function clue(hero,text){st.clues.push({hero,text});document.getElementById('nbN').textContent=st.clues.length;
 document.getElementById('nbL').innerHTML=S.heroes.map(h=>{const c=st.clues.filter(x=>x.hero===h.id);return c.length?`<h3>${h.name}</h3>`+c.map(x=>`<div class="clue" style="--c:var(--pri)">${esc(x.text)}</div>`).join(''):''}).join('')}
document.getElementById('nbBtn').onclick=()=>nb.hidden=false; document.getElementById('nbX').onclick=()=>nb.hidden=true; nb.onclick=e=>{if(e.target===nb)nb.hidden=true};
function line(l,me,k){if(l.who==='narr')return `<div class="line narrl"><div class="bub">${esc(l.text)}</div></div>`;
 if(me)return `<div class="line me" style="${col(k)}"><div class="av" style="background:var(--${k})">Я</div><div class="bub"><div class="who">Ты</div>${esc(l)}</div></div>`;
 const h=H[l.who];return `<div class="line"><div class="av">${h.name[0]}</div><div class="bub"><div class="who">${h.name}</div>${esc(l.text)}</div></div>`}
function deltas(e){return Object.entries(e||{}).filter(([k,v])=>v).map(([k,v])=>k==='tension'?`<span class="delta ${v>0?'m':'p'}">Напряжение ${v>0?'+':'−'}${Math.abs(v)}</span>`:`<span class="delta ${v>0?'p':'m'}">${H[k].name} ${v>0?'теплее +':'холоднее −'}${Math.abs(v)}</span>`).join('')}
function oporyGrid(){const g=$(`<div class="opory">${KEYS.map(k=>`<button class="op" type="button" style="${col(k)}" data-k="${k}"><small>${OP[k].code} · ${OP[k].stihiya}</small><b>${OP[k].name}</b>${OP[k].short}</button>`).join('')}</div>`);
 g.querySelectorAll('.op').forEach(b=>b.onclick=()=>{const k=b.dataset.k,p=b.querySelector('p');if(p)p.remove();else b.appendChild($(`<p>${esc(OP[k].portrait)}</p>`))});return g}
// ВХОД
const m=S.meta;
add(`<section class="entry"><div class="kick">${m.course} · ${m.block}</div><h1>${m.title}</h1><p>${m.lead}</p>
<div class="facts">${m.facts.map(f=>`<span>${f}</span>`).join('')}</div>
<div class="cross">${KEYS.map(k=>`<div style="background:var(--${k})" title="${OP[k].stihiya}"></div>`).join('')}</div>
<div class="steps"><div><b>1. Наблюдай</b><span>что делают и говорят герои — и ты</span></div><div><b>2. Выбирай</b><span>что сказать и сделать — как в жизни</span></div><div><b>3. Разбирай</b><span>почему вышло так и как можно иначе</span></div></div>
<a class="book" href="#"><span class="ic"></span><span>${m.book.label}<small>${m.book.pos}</small></span></a></section>`);
add(`<div class="card"><div class="kick">Карта урока</div><h3 style="margin:6px 0 10px">Что будет сегодня</h3><ul class="map"><li><b>·</b>Старт. Герои: четыре человека, знаки скрыты</li>${S.scenes.map(s=>`<li><b>${s.num}</b><span>${s.label}<br><strong>${s.title}</strong></span></li>`).join('')}<li><b>✦</b>Итог: знаки героев, твой знак, закрепление</li></ul><p style="color:var(--ink2)">${m.note}</p></div>`);
const hc=add(`<div class="card"><div class="kick">Герои</div><h3 style="margin:6px 0">С кем ты проведёшь этот вечер</h3><p>У каждого из них своя опора — тело, ум, душа или сердце. Какая — пока секрет. Узнать её можно только по уликам.</p><div class="heroes">${S.heroes.map(h=>`<div class="hero"><div class="av">${h.name[0]}</div><b>${h.name}</b><div style="font-size:14px;color:var(--ink2)">${h.role}</div><div class="sg">ЗНАК: ?</div></div>`).join('')}</div><div class="row"><button class="btn" id="go">Начать урок →</button></div></div>`);
meters();
hc.querySelector('#go').onclick=e=>{e.target.disabled=true;st.step++;prog();scene(0)};
function scene(i){const s=S.scenes[i];if(!s)return final();
 const h=add(`<section class="scene-h"><div class="num">${s.num}</div><div class="meta"><span>${s.label}</span><span>${s.time}</span><span>${s.place}</span></div><h2>${s.title}</h2></section>`);
 s.narration.forEach(t=>add(`<p class="narr">${esc(t)}</p>`));
 s.lines.filter(l=>!l.if||st.flags.has(l.if)).forEach(l=>{add(line(l));if(l.who!=='narr'){st.met.add(l.who);if(l.clue)clue(l.who,l.clue)}});
 meters(); if(s.after)add(`<p class="narr">${esc(s.after)}</p>`); scrollTo(h);
 const t=add(`<div class="turn"><div class="kick">Твой ход</div><h3 style="margin:4px 0">${s.prompt}</h3><p style="font-size:14px;color:var(--ink2);margin:4px 0 8px">Отвечай так, как ответишь в жизни. Правильных ответов здесь нет — просто посмотри, к чему это приведёт.</p>${s.choices.map((c,j)=>`<button class="ch" data-j="${j}">${esc(c.text)}</button>`).join('')}</div>`);
 t.querySelectorAll('.ch').forEach(b=>b.onclick=()=>{const c=s.choices[b.dataset.j];t.querySelectorAll('.ch').forEach(x=>x.disabled=true);b.classList.add('sel');
  st.my[c.opora]++;if(c.setFlag)st.flags.add(c.setFlag);const ch=[];
  for(const[k,v]of Object.entries(c.effects||{})){if(!v)continue;if(k==='tension')st.tension=Math.max(0,Math.min(5,st.tension+v));else st.trust[k]=Math.max(-2,Math.min(3,st.trust[k]+v));ch.push(k)}
  st.step++;prog();const r=add(line(c.text,true,c.opora));c.reactions.forEach(x=>add(line(x)));if(c.note)add(`<p class="narr" style="color:var(--ink2)">${esc(c.note)}</p>`);
  meters();bump(ch);
  const w=add(`<div class="what"><div class="kick">Что произошло</div><p>${esc(c.what)}</p><div>${deltas(c.effects)}</div><div class="row"><button class="btn ghost" data-a="re">Переиграть: что было бы, если…</button><button class="btn" data-a="go">Дальше →</button></div></div>`);
  scrollTo(r);
  w.querySelector('[data-a=re]').onclick=e=>{e.target.remove();const rp=$(`<div><p class="rh" style="font-size:14px;color:var(--ink2)">Выбери другой ответ — увидишь реакцию. На твой счёт это не влияет.</p></div>`);
   s.choices.filter(x=>x!==c).forEach(x=>{const d=$(`<div class="replay"><button class="ch">${esc(x.text)}</button></div>`);d.querySelector('button').onclick=ev=>{ev.target.disabled=true;d.insertAdjacentHTML('beforeend',x.reactions.map(y=>line(y)).join('')+`<p style="font-size:15px">${esc(x.what)}</p><div>${deltas(x.effects)}</div>`)};rp.appendChild(d)});
   w.insertBefore(rp,w.querySelector('.row'))};
  w.querySelector('[data-a=go]').onclick=e=>{w.querySelector('.row').remove();after(s,i)}})}
function after(s,i){const steps=[];if(s.theory)steps.push(()=>theory(s.theory,next));if(s.hypothesis)steps.push(()=>hyp(s.hypothesis,next));let n=0;function next(){st.step++;prog();const f=steps[n++];f?f():scene(i+1)}next()}
function theory(th,cb){const e=add(`<div class="theory"><div class="kick">Разбор · ведущий</div><h3>${th.title}</h3><p>${esc(th.text)}</p>${th.showOpory?'<p style="font-size:14px;opacity:.85">Нажми на знак — откроется его портрет.</p>':''}</div>`);
 if(th.showOpory){e.appendChild(oporyGrid());e.appendChild($('<p style="font-size:14px;opacity:.85">Знаки героев пока скрыты. Собирай улики и выдвигай гипотезы — улики сами попадают в блокнот (кнопка вверху).</p>'))}
 const r=$(`<div class="row"><button class="btn" style="background:#fff;color:#0E4F5A">Дальше →</button></div>`);r.firstChild.onclick=()=>{r.remove();cb()};e.appendChild(r);scrollTo(e)}
function hyp(hy,cb,again){const hero=H[hy.hero];const e=add(`<div class="hyp"><div class="kick">Гипотеза</div><h3 style="margin:4px 0">${again?'Проверь ещё раз: на что опирается '+hero.name+'?':hy.question}</h3>
 <div class="opts">${KEYS.map(k=>`<button class="o" style="${col(k)}" data-k="${k}">${OP[k].name}<small>${OP[k].code} · ${OP[k].stihiya}</small></button>`).join('')}</div>
 <label class="conf">Уверенность <input type="range" min="1" max="3" value="2"><span>средняя</span></label><div class="v"></div></div>`);
 const rng=e.querySelector('input'),lab=e.querySelector('.conf span');rng.oninput=()=>lab.textContent=['','догадка','средняя','уверен(а)'][rng.value];scrollTo(e);
 e.querySelectorAll('.o').forEach(b=>b.onclick=()=>{const k=b.dataset.k,ok=k===hero.sign;e.querySelectorAll('.o').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');
  st.hyp[hy.hero]={k,ok,conf:+rng.value};
  const cal=ok?(rng.value==3?'И уверенность оправдана.':''):(rng.value==3?'Ты был(а) уверен(а) — тем полезнее перепроверить улики.':'');
  e.querySelector('.v').innerHTML=`<div class="verdict ${ok?'y':'n'}"><b>${ok?'Гипотеза подтверждается':'Улик «против» больше'}</b><p style="margin:6px 0">${esc(hy.answers[k])}</p>${ok?'':'<p style="margin:0;font-size:14px">Можно передумать — или оставить и проверить в конце урока.</p>'}<p style="margin:0;font-size:14px">${cal}</p></div><div class="row"><button class="btn ghost" data-a="re">Передумать</button><button class="btn" data-a="go">Дальше →</button></div>`;
  e.querySelector('[data-a=re]').onclick=()=>{e.querySelector('.v').innerHTML='';e.querySelectorAll('.o').forEach(x=>x.classList.remove('sel'))};
  e.querySelector('[data-a=go]').onclick=()=>{e.querySelectorAll('.o').forEach(x=>x.disabled=true);e.querySelector('.v .row').remove();cb()}})}
function final(){st.step=total;prog();const trust=Object.values(st.trust).reduce((a,b)=>a+b,0);
 const en=S.endings.find(x=>trust>=x.minTrust&&st.tension<=x.maxTension);
 const me=KEYS.slice().sort((a,b)=>st.my[b]-st.my[a])[0];const mx=Math.max(1,...Object.values(st.my));
 const e=add(`<section><div class="scene-h"><div class="num">✦</div><h2>Итог</h2></div><div class="end"><div class="kick" style="color:#fff">Концовка · доверие ${trust>0?'+':''}${trust} · напряжение ${st.tension}</div><h2>${en.title}</h2><p>${esc(en.text)}</p></div>
 <div class="card"><div class="kick">Знаки героев</div><h3 style="margin:6px 0 12px">Кто на что опирается</h3><div class="reveal">${S.heroes.map(h=>{const y=st.hyp[h.id],k=h.sign;return `<div class="rv" style="${col(k)}"><b>${h.name}</b><div class="t">${OP[k].name} · ${OP[k].code} · ${OP[k].stihiya}</div><div style="font-size:14px">${y?(y.ok?'✓ твоя гипотеза верна':'Твоя гипотеза: '+OP[y.k].name+' — поправь интерпретацию по уликам'):'гипотезы не было'}</div><div style="font-size:13px;color:var(--ink2)">доверие: ${st.trust[h.id]>0?'+':''}${st.trust[h.id]}</div></div>`}).join('')}</div></div>
 <div class="card" style="${col(me)}"><div class="kick">Твой знак — гипотеза по твоим ходам</div><h3 style="margin:6px 0;color:var(--c)">Похоже, твоя опора — ${OP[me].name} (${OP[me].code} · ${OP[me].stihiya})</h3><div class="bars">${KEYS.map(k=>`<div class="b" style="${col(k)}"><span>${OP[k].name}</span><i style="width:${st.my[k]/mx*70}%"></i>${st.my[k]}</div>`).join('')}</div><p>${esc(OP[me].portrait)}</p><p style="font-size:14px;color:var(--ink2)">Четыре сцены — это мало для вывода. Это первая улика о тебе самом(ой): проверь её на следующих уроках.</p></div>
 <div class="card"><div class="kick">Закрепление</div><h3 style="margin:6px 0">Говори на языке опоры</h3><ul>${KEYS.map(k=>`<li><b style="color:var(--${k})">${OP[k].name}</b> — ${({telo:'дай конкретное дело и позаботься о комфорте',um:'дай смысл, факты и признай разбор',dusha:'ответь на чувство, побудь рядом «просто так»',serdce:'покажи цель и встречное решение'})[k]}</li>`).join('')}</ul>
 <a class="book" href="#"><span class="ic"></span><span>${m.book.label}<small>${m.book.pos}</small></span></a><div class="row"><button class="btn" onclick="location.reload()">Пройти заново — другим путём</button></div></div></section>`);scrollTo(e)}
})();
