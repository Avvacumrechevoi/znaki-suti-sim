/* Движок симулятора «Знаки сути» v2. Сценарий: scenario.json (или ?s=case.json). ?fast=1 — без пауз. */
(async function(){
const P=new URLSearchParams(location.search),SRC=P.get('s')||'scenario.json',S=await (await fetch(SRC)).json();
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,FAST=RM||P.has('fast');
const app=document.getElementById('app'),nb=document.getElementById('nb'),$=h=>{const d=document.createElement('div');d.innerHTML=h.trim();return d.firstElementChild};
const HAS_T=S.scenes.some(s=>(s.choices||[]).some(c=>c.effects&&c.effects.tension));const H=Object.fromEntries(S.heroes.map(h=>[h.id,h])),OP=S.opory,KEYS=Object.keys(OP),KEY='znaki-sim:'+SRC;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const col=k=>`--c:var(--${k});--cc:var(--${k}-c);--g:var(--${k}-g)`,wait=ms=>new Promise(r=>setTimeout(r,FAST?0:ms));

const IC={telo:'<path d="M3 19h18"/><path d="M5 19l5-9 3 5 2-3 4 7"/>',um:'<path d="M12 3c3 4.5 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.5 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>',
dusha:'<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 13h15a3 3 0 1 1-3 3"/><path d="M3 17h7"/>',serdce:'<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.8 1.2 2.7 2.2 2.7C11 9 10.5 6 12 3z"/>',
eye:'<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',choose:'<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
react:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="2.5"/>',
theory:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
clue:'<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',note:'<path d="M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z"/><path d="M6 3v18M9 8h6M9 12h6M9 16h3"/>',
heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',bolt:'<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',
office:'<path d="M4 21V5h10v16M14 9h6v12M2 21h20"/><path d="M7 8h2M7 12h2M7 16h2M17 13h1M17 17h1"/>',phone:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',chat:'<path d="M3 5h12v8H8l-5 4z"/><path d="M15 9h6v8l-3-2.5h-6V13"/>',
check:'<path d="M4 12.5l5 5L20 6.5"/>',flag:'<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',start:'<circle cx="12" cy="12" r="8"/><path d="M10 9l5 3-5 3z"/>',timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M10 2h4"/>'};
const ic=(n,cls='')=>`<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||''}</svg>`;
const eb=(n,t,c='')=>`<span class="eyebrow ei"${c?` style="--c:${c}"`:''}>${ic(n)}${t}</span>`;
let st=fresh();function fresh(){return{scene:0,trust:Object.fromEntries(S.heroes.map(h=>[h.id,0])),tension:0,met:[],flags:[],my:Object.fromEntries(KEYS.map(k=>[k,0])),hyp:{},clues:[],step:0}}
const total=S.scenes.filter(s=>!s.stub).length*3+2,prog=()=>{const b=document.getElementById('bar');b.style.width=Math.min(100,st.step/total*100)+'%';b.parentNode.setAttribute('aria-valuenow',Math.round(st.step/total*100))};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
const scrollTo=el=>setTimeout(()=>el.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'}),40);
function add(h,a=true){const e=typeof h==='string'?$(h):h;if(a)e.classList.add('anim');app.appendChild(e);return e}
function toast(t){const e=$(`<div class="toast" role="status">${esc(t)}</div>`);document.body.appendChild(e);setTimeout(()=>e.remove(),1800)}
const mood=id=>st.trust[id]>0?'up':st.trust[id]<0?'down':'';
const moodWord=id=>({up:'теплее',down:'холоднее'})[mood(id)]||'';
const av=(id,cls='')=>`<span class="av ${cls} ${mood(id)?'mood-'+mood(id):''}" data-h="${id}" aria-hidden="true">${H[id].name[0]}</span>`;
function meters(){const m=document.getElementById('meters');if(!st.met.length){m.innerHTML='';return}m.innerHTML=st.met.map(id=>`<span class="mt" data-id="${id}" title="Доверие: ${H[id].name}">${av(id,'mav')}<span class="nm">${H[id].name}</span><b class="tv">${st.trust[id]>0?"+":""}${st.trust[id]}</b><span class="gauge" style="--v:${(st.trust[id]+2)/5*100}%"><i></i></span></span>`).join('')+(HAS_T?
 `<span class="mt tn" data-id="tension" title="Напряжение">${ic("bolt","bolt")}<span class="nm">Напряжение</span><b class="tv">${st.tension}</b><span class="gauge t" style="--v:${st.tension/5*100}%"><i></i></span></span>`:'');
 document.querySelectorAll('.av[data-h]').forEach(a=>{a.classList.remove('mood-up','mood-down');const md=mood(a.dataset.h);if(md)a.classList.add('mood-'+md)})}
const bump=ids=>ids.forEach(id=>document.querySelector(`.mt[data-id="${id}"]`)?.classList.add('bump'));
function renderNb(){document.getElementById('nbN').textContent=st.clues.length;
 document.getElementById('nbL').innerHTML=st.clues.length?S.heroes.map(h=>{const c=st.clues.filter(x=>x.hero===h.id);return c.length?`<h4>${av(h.id,'mav')} ${h.name}</h4>`+c.map(x=>`<div class="clue">${esc(x.text)}</div>`).join(''):''}).join(''):'<p class="muted">Пока пусто.</p>'}
function clue(hero,text){if(st.clues.some(c=>c.text===text))return;st.clues.push({hero,text});renderNb();save();const b=document.getElementById('nbBtn');b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse')}
document.getElementById('nbBtn').onclick=()=>{nb.hidden=false;document.getElementById('nbX').focus()};
const closeNb=()=>{nb.hidden=true;document.getElementById('nbBtn').focus()};document.getElementById('nbX').onclick=closeNb;nb.onclick=e=>{if(e.target===nb)closeNb()};
function lineHtml(l,react){if(l.who==='narr')return `<div class="line narrl"><div class="bub">${esc(l.text)}</div></div>`;
 let t=esc(l.text);if(l.cue&&l.clue){const got=st.clues.some(c=>c.text===l.clue);t=t.replace(esc(l.cue),`<button type="button" class="cue${got?' got':''}" data-hero="${l.who}" data-clue="${esc(l.clue)}" title="Взять улику в блокнот">${esc(l.cue)}</button>`)}
 const mw=react&&moodWord(l.who);return `<div class="line">${av(l.who)}<div class="bub"><div class="who">${H[l.who].name}${mw?`<span class="mood ${mood(l.who)}">${mw}</span>`:''}</div>${t}</div></div>`}
const meLine=(text,k)=>`<div class="line me" style="${col(k)}"><span class="av me" aria-hidden="true">Я</span><div class="bub"><div class="who">Ты</div>${esc(text)}</div></div>`;
app.addEventListener('click',e=>{const c=e.target.closest('.cue');if(!c||c.classList.contains('got'))return;c.classList.add('got');clue(c.dataset.hero,c.dataset.clue);toast('Улика в блокноте: '+H[c.dataset.hero].name)});
async function say(l,react){if(l.who!=='narr'&&!FAST){const ty=add(`<div class="line typing">${av(l.who)}<div class="bub" aria-label="печатает"><i></i><i></i><i></i></div></div>`);await wait(Math.min(1400,350+l.text.length*9));ty.remove()}
 const e=add(lineHtml(l,react));if(!FAST)e.scrollIntoView({behavior:'smooth',block:'nearest'});await wait(250);return e}
const deltas=e=>Object.entries(e||{}).filter(([,v])=>v).map(([k,v])=>k==='tension'?`<span class="delta ${v>0?'m':'p'}">Напряжение ${v>0?'+':'−'}${Math.abs(v)}</span>`:`<span class="delta ${v>0?'p':'m'}">${H[k].name}: ${v>0?'теплее +':'холоднее −'}${Math.abs(v)}</span>`).join('');
// клавиатура: 1–4 — варианты, Enter — «Дальше»
document.addEventListener('keydown',e=>{if(!nb.hidden){if(e.key==='Escape')closeNb();return}if(e.target.closest('input,textarea'))return;
 const n=parseInt(e.key);if(n>=1&&n<=4){const box=[...document.querySelectorAll('.turn .opts-c:not(.done),.hyp:not(.done) .opts')].pop();const b=box&&box.querySelectorAll('button:not([disabled])')[n-1];if(b){e.preventDefault();b.click()}}
 if(e.key==='Enter'&&!(e.target.closest('a')||(e.target.closest('button')&&!e.target.disabled))){const b=[...document.querySelectorAll('[data-next]:not([disabled])')].pop();if(b){e.preventDefault();b.click()}}});
// ВХОД
const m=S.meta;
add(`<section class="entry"><span class="eyebrow" style="--c:var(--pri)">${m.course} · ${m.block}</span><h1>${m.title}</h1><p class="lead">${m.lead}</p>
<div class="facts">${m.facts.map(f=>`<span>${f}</span>`).join('')}</div>
<div class="cross" aria-label="Четыре сути">${KEYS.map(k=>`<div style="${col(k)}"><span class="ib">${ic(k)}</span><span>${OP[k].code}<small>${OP[k].stihiya} · ${OP[k].name}</small></span></div>`).join('')}</div>
<div class="steps"><div>${ic("eye","st")}<i>01</i><b>Наблюдай</b><span>что делают и говорят герои — и ты</span></div><div>${ic("choose","st")}<i>02</i><b>Выбирай</b><span>что сказать и сделать — как в жизни</span></div><div>${ic("theory","st")}<i>03</i><b>Разбирай</b><span>почему вышло так и как можно иначе</span></div></div></section>`);
add(`<section class="open">${eb("flag","Карта урока")}<h3 class="h-sec">Что будет сегодня</h3><ol class="path"><li><span class="node">${ic("start")}</span><span><strong>Старт · Герои</strong>четыре человека, знаки скрыты</span></li>${S.scenes.map(s=>`<li style="${col(s.tone)}"><span class="node">${ic(s.icon)}</span><span><b>${s.num}</b><strong>${s.title}</strong>${s.label}${s.stub?' · <em class="soon">скоро</em>':''}</span></li>`).join('')}<li><span class="node">${ic("check")}</span><span><strong>Итог</strong>знаки героев, твой знак, закрепление</span></li></ol><p class="pull">${m.note}</p></section>`);
const hc=add(`<section class="open">${eb("eye","Герои")}<h3 class="h-sec">С кем ты проведёшь этот вечер</h3><p>${m.heroesNote}</p><div class="heroes">${S.heroes.map(h=>`<div class="hero">${av(h.id)}<div><b>${h.name}</b><div class="r">${h.role}</div><div class="sg">ЗНАК: ?</div></div></div>`).join('')}</div>
<p class="muted kbd-hint" style="margin-top:14px">Клавиши 1–4 выбирают ответ, Enter — дальше.</p><div class="row"><button class="btn" id="go" data-next>Начать урок →</button></div></section>`);
let saved=null;try{saved=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(saved&&saved.scene>0&&saved.scene<=S.scenes.length){const r=add(`<div class="card resume"><span class="eyebrow" style="--c:var(--pri)">Продолжить</span><h3 class="h-sec">Ты остановился(ась) перед сценой ${S.scenes[saved.scene]?.num||'«Итог»'}</h3><p class="muted">Улик собрано: ${saved.clues.length}. Можно продолжить или начать заново.</p><div class="row"><button class="btn" data-next id="res">Продолжить →</button><button class="btn ghost" id="new">Начать заново</button></div></div>`);
 r.querySelector('#res').onclick=()=>{st=saved;r.remove();hc.querySelector('#go').disabled=true;renderNb();meters();prog();scene(st.scene)};
 r.querySelector('#new').onclick=()=>{localStorage.removeItem(KEY);r.remove()}}
meters();renderNb();
hc.querySelector('#go').onclick=e=>{e.target.disabled=true;document.querySelector('.resume')?.remove();st=fresh();st.step=1;prog();scene(0)};
async function scene(i){while(S.scenes[i]&&S.scenes[i].stub)i++;st.scene=i;save();const s=S.scenes[i];if(!s)return final();document.body.dataset.tone=s.tone;
 add(`<div class="div" style="${col(s.tone)}"><b></b></div>`);
 const h=add(`<section class="scene-h" style="${col(s.tone)}"><div class="vig" aria-hidden="true"><span class="vb">${ic(s.icon)}</span><span class="vs">${ic(s.tone)}</span><svg class="vw" viewBox="0 0 400 60" preserveAspectRatio="none"><path d="M0 40 C60 10 120 55 200 30 S330 5 400 28"/><path d="M0 50 C80 30 150 60 230 42 S340 25 400 40"/></svg></div><div class="num">${s.num}</div><div class="meta"><span>${s.time}</span><span>${s.place}</span></div><h2>${s.title}</h2></section>`);scrollTo(h);await wait(500);
 for(const t of s.narration){add(`<p class="narr">${esc(t)}</p>`);await wait(500)}
 if(s.quote)add(`<blockquote class="pq" style="${col(s.tone)}"><p>«${esc(s.quote.text)}»</p><cite>${ic('eye')} Запомни эту фразу · ${H[s.quote.who].name}</cite></blockquote>`);
 for(const l of s.lines.filter(l=>!l.if||st.flags.includes(l.if))){if(l.who!=='narr'&&!st.met.includes(l.who)){st.met.push(l.who);meters()}await say(l)}
(s.autoClues||[]).forEach(c=>clue(c.hero,c.text));
 if(s.after){add(`<p class="narr">${esc(s.after)}</p>`);await wait(300)}
 turn(s,i)}
function turn(s,i){const t=add(`<div class="turn">${eb("choose","Твой ход","var(--pri)")}<h3 class="h-sec">${s.prompt}</h3><p class="muted">Отвечай так, как ответишь в жизни. Правильных ответов нет — просто посмотри, к чему это приведёт.</p>${s.timer?`<div class="timer"><button class="btn ghost" style="padding:6px 14px;font-size:14px" id="tmB">Включить таймер ${s.timer.seconds} с</button><span>${esc(s.timer.text)}</span></div>`:''}<div class="opts-c">${s.choices.map((c,j)=>`<button class="ch" data-j="${j}"><kbd>${j+1}</kbd><span>${esc(c.text)}</span></button>`).join('')}</div></div>`);
 t.scrollIntoView({behavior:RM?'auto':'smooth',block:'nearest'});let tm=null;
 if(s.timer)t.querySelector('#tmB').onclick=e=>{let left=s.timer.seconds;const w=e.target.parentNode;w.innerHTML=`<span class="ei">${ic("timer")} <b id="tl">${left}</b> с</span><div class="tb"><i></i></div>`;const bar=w.querySelector('.tb i');
  tm=setInterval(()=>{left--;w.querySelector('#tl').textContent=left;bar.style.width=left/s.timer.seconds*100+'%';if(left<=0){clearInterval(tm);st.tension=Math.min(5,st.tension+1);meters();bump(['tension']);w.innerHTML='<span><b>Время вышло.</b> Пауза в чате — тоже ответ: напряжение +1. Выбирай.</span>'}},1000)};
 t.querySelectorAll('.ch').forEach(b=>b.onclick=async()=>{clearInterval(tm);const c=s.choices[b.dataset.j];t.querySelector('.opts-c').classList.add('done');t.querySelectorAll('.ch').forEach(x=>x.disabled=true);b.classList.add('sel');
  st.my[c.opora]++;if(c.setFlag&&!st.flags.includes(c.setFlag))st.flags.push(c.setFlag);const ch=[];
  for(const[k,v]of Object.entries(c.effects||{})){if(!v)continue;if(k==='tension')st.tension=Math.max(0,Math.min(5,st.tension+v));else st.trust[k]=Math.max(-2,Math.min(3,st.trust[k]+v));ch.push(k)}
  st.step++;prog();add(meLine(c.text,c.opora));await wait(300);
  for(const x of c.reactions)await say(x,true);meters();bump(ch);if(c.note)add(`<p class="narr muted">${esc(c.note)}</p>`);
  const fc=[];if(c.setFlag)fc.push('<b>Это аукнется позже.</b> Твой ответ изменит одну из следующих сцен.');if(st.tension>=3)fc.push('<b>Напряжение копится.</b> Ещё пара острых ходов — и вечер пойдёт иначе.');
  const w=add(`<div class="what" style="${col(c.opora)}">${eb("react","Что произошло")}<p style="margin-top:10px">${esc(c.what)}</p><div class="deltas">${deltas(c.effects)||'<span class="delta" style="background:var(--rule2);color:var(--ink2)">Без изменений</span>'}</div>${fc.length?`<div class="forecast">${fc.join('<br>')}</div>`:''}<div class="row"><button class="btn ghost" data-a="re">Переиграть: что было бы, если…</button><button class="btn" data-a="go" data-next>Дальше →</button></div></div>`);
  w.scrollIntoView({behavior:RM?'auto':'smooth',block:'nearest'});
  w.querySelector('[data-a=re]').onclick=e=>{e.target.remove();const rp=$(`<div class="replay"><p class="muted">Выбери другой ответ — увидишь реакцию. На твой счёт это не влияет.</p></div>`);
   s.choices.filter(x=>x!==c).forEach(x=>{const d=$(`<div><button class="ch"><span>${esc(x.text)}</span></button></div>`);d.querySelector('button').onclick=ev=>{ev.currentTarget.disabled=true;ev.currentTarget.classList.add('sel');d.insertAdjacentHTML('beforeend',`<div class="res">${x.reactions.map(y=>lineHtml(y).replace(/class="cue[^"]*"/,'')).join('')}<p style="font-size:15px">${esc(x.what)}</p><div class="deltas">${deltas(x.effects)}</div></div>`)};rp.appendChild(d)});
   w.insertBefore(rp,w.querySelector('.row'))};
  w.querySelector('[data-a=go]').onclick=()=>{w.querySelector('.row').remove();after(s,i)}})}
function after(s,i){const steps=[];if(s.theory)steps.push(()=>theory(s.theory,next));if(s.hypothesis)steps.push(()=>hyp(s.hypothesis,next));if(s.check)steps.push(()=>check(s.check,next));let n=0;
 function next(){st.step++;prog();save();const f=steps[n++];f?f():scene(i+1)}next()}
function oporyGrid(){const g=$(`<div class="opory">${KEYS.map(k=>`<button class="op" type="button" style="${col(k)}" data-k="${k}" aria-expanded="false">${ic(k,"opi")}<small>${OP[k].code} · ${OP[k].stihiya}</small><b>${OP[k].name}</b>${OP[k].short}</button>`).join('')}</div>`);
 g.querySelectorAll('.op').forEach(b=>b.onclick=()=>{const p=b.querySelector('p');b.setAttribute('aria-expanded',!p);if(p)p.remove();else b.appendChild($(`<p>${esc(OP[b.dataset.k].portrait)}</p>`))});return g}
function theory(th,cb){const e=add(`<div class="theory">${eb("theory","Разбор · ведущий")}<h3>${th.title}</h3><p>${esc(th.text)}</p></div>`);
 if(th.showOpory){e.appendChild($('<p class="muted">Нажми на знак — откроется его портрет.</p>'));e.appendChild(oporyGrid());th.after&&e.appendChild($(`<p class="muted">${esc(th.after)}</p>`))}
 const r=$(`<div class="row"><button class="btn light" data-next>Дальше →</button></div>`);r.firstChild.onclick=()=>{r.remove();cb()};e.appendChild(r);scrollTo(e)}
function hyp(hy,cb){const hero=H[hy.hero],n=st.clues.filter(c=>c.hero===hy.hero).length;
 const e=add(`<div class="hyp">${eb("clue","Гипотеза","var(--pri)")}<div class="row" style="margin-top:10px">${av(hy.hero)}<h3 class="h-sec" style="margin:0;flex:1">${hy.question}</h3></div>
 <p class="muted">${n?`В блокноте улик про ${hero.name}: ${n}.`:`Улик про ${hero.name} в блокноте пока нет — можешь вернуться к репликам выше и нажать на подчёркнутые фразы.`}</p>
 <div class="conf" role="group" aria-label="Уверенность"><span>Насколько уверен(а):</span>${['догадка','скорее да','уверен(а)'].map((t,j)=>`<button type="button" data-c="${j+1}" aria-pressed="${j==1}">${t}</button>`).join('')}</div>
 <div class="opts">${KEYS.map(k=>`<button class="o" style="${col(k)}" data-k="${k}">${ic(k)}${OP[k].name}<small>${OP[k].code} · ${OP[k].stihiya}</small></button>`).join('')}</div><div class="v" aria-live="polite"></div></div>`);
 let conf=2;e.querySelectorAll('.conf button').forEach(b=>b.onclick=()=>{conf=+b.dataset.c;e.querySelectorAll('.conf button').forEach(x=>x.setAttribute('aria-pressed',x===b))});scrollTo(e);
 e.querySelectorAll('.o').forEach(b=>b.onclick=()=>{const k=b.dataset.k,ok=k===hero.sign;e.querySelectorAll('.o').forEach(x=>{x.classList.toggle('sel',x===b);x.disabled=x!==b});
  st.hyp[hy.hero]={k,ok,conf};save();
  const cal=ok?(conf==3?'И уверенность оправдана.':conf==1?'Чутьё не подвело — доверяй уликам смелее.':''):(conf==3?'Ты был(а) уверен(а) — тем полезнее перепроверить улики.':'');
  e.querySelector('.v').innerHTML=`<div class="verdict ${ok?'y':'n'}"><b>${ok?'Гипотеза подтверждается':'Улик «против» больше'}</b><p style="margin:6px 0">${esc(hy.answers[k])}</p>${ok?'':'<p style="margin:0;font-size:14px">Можно передумать — или оставить и проверить в конце урока.</p>'}${cal?`<p style="margin:4px 0 0;font-size:14px">${cal}</p>`:''}</div><div class="row"><button class="btn ghost" data-a="re">Передумать</button><button class="btn" data-a="go" data-next>Дальше →</button></div>`;
  e.querySelector('[data-a=re]').onclick=()=>{e.querySelector('.v').innerHTML='';e.querySelectorAll('.o').forEach(x=>{x.classList.remove('sel');x.disabled=false})};
  e.querySelector('[data-a=go]').onclick=()=>{e.classList.add('done');e.querySelectorAll('button').forEach(x=>x.disabled=true);e.querySelector('.v .row').remove();cb()}})}
function check(ck,cb){let done=0;const e=add(`<div class="card check">${eb("check",ck.title,"var(--dusha)")}<h3 class="h-sec">${ck.question}</h3>${ck.items.map((it,j)=>`<div class="q" data-j="${j}"><span>${esc(it.quote)}</span><div class="pick">${KEYS.map(k=>`<button style="${col(k)}" data-k="${k}">${OP[k].name}</button>`).join('')}</div></div>`).join('')}<div class="res" aria-live="polite"></div></div>`);scrollTo(e);
 e.querySelectorAll('.q').forEach(q=>{const it=ck.items[q.dataset.j];let tries=0;q.querySelectorAll('button').forEach(b=>b.onclick=()=>{tries++;if(b.dataset.k===it.answer){b.classList.add('ok');q.querySelectorAll('button').forEach(x=>x.disabled=true);if(tries==1)done++;
  if(!e.querySelector('.q button:not([disabled])')){e.querySelector('.res').innerHTML=`<p style="margin-top:12px"><b>${done} из ${ck.items.length} с первого раза.</b> ${done===ck.items.length?'Ты уже видишь опоры по одной фразе.':'Опора видна по тому, что человек делает первым: понимает, делает, чувствует или решает.'}</p><div class="row"><button class="btn" data-next>Дальше →</button></div>`;e.querySelector('[data-next]').onclick=ev=>{ev.target.remove();cb()}}}
  else{b.classList.add('no');b.disabled=true}})})}
async function final(){st.step=total;prog();save();document.body.dataset.tone='none';
 const me=KEYS.slice().sort((a,b)=>st.my[b]-st.my[a])[0];
 add(`<div class="div"><b></b></div>`);
 const e=add(`<section><div class="scene-h" style="${col('serdce')}"><div class="num fin">✦</div><h2>Итог</h2></div><p class="pull">${esc(m.summary)}</p>
 <section class="open">${eb("eye","Знаки героев")}<div class="reveal">${S.heroes.map(h=>{const y=st.hyp[h.id],k=h.sign;return k?`<div class="flip" style="${col(k)}"><div class="in"><div class="f">${av(h.id)}<div><b style="font:700 18px Manrope">${h.name}</b><div class="d">ЗНАК: ?</div></div></div><div class="b"><span class="ib">${ic(k)}</span><b>${h.name}</b><div class="t">${OP[k].name} · ${OP[k].code} · ${OP[k].stihiya}</div><div class="s">${y?(y.ok?'Твоя гипотеза верна':'Твоя гипотеза: '+OP[y.k].name):'Гипотезы не было'}</div></div></div></div>`:`<div class="hero">${av(h.id)}<div><b>${h.name}</b><div class="r">${h.role}</div><div class="sg">ЗНАК: ? · узнаешь в следующих сценах</div></div></div>`}).join('')}</div></section>
 <section class="open" style="${col(me)}">${eb(me,"Твой ход в сцене I")}<h3 class="h-sec">Ты ответил(а) как человек: ${OP[me].name.toLowerCase()} · ${OP[me].code} · ${OP[me].stihiya}</h3><p>${esc(OP[me].portrait)}</p></section>
 <section class="open">${eb("theory","Закрепление · четыре зла и добро")}<ul class="tips">${KEYS.map(k=>`<li style="${col(k)}"><span class="ib">${ic(k)}</span><span><b>${OP[k].code} · ${OP[k].name}</b><br>${esc(OP[k].zlo)}<br><strong>Добро:</strong> ${esc(OP[k].dobro)}</span></li>`).join('')}</ul>
 <div class="row"><button class="btn" id="again">Пройти заново — другим путём</button></div></section></section>`);
 e.querySelector('#again').onclick=()=>{localStorage.removeItem(KEY);location.href=location.pathname+location.search};scrollTo(e);
 await wait(900);for(const f of e.querySelectorAll('.flip')){f.classList.add('on');await wait(450)}}
})();
