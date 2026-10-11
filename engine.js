/* Движок симулятора «Знаки сути» v2. Сценарий: scenario.json (или ?s=case.json). ?fast=1 — без пауз. */
(async function(){
const P=new URLSearchParams(location.search),SRC=P.get('s')||'scenario.json',S=await (await fetch(SRC)).json();
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,FAST=RM||P.has('fast');
const app=document.getElementById('app'),nb=document.getElementById('nb'),$=h=>{const d=document.createElement('div');d.innerHTML=h.trim();return d.firstElementChild};
const H=Object.fromEntries(S.heroes.map(h=>[h.id,h])),OP=S.opory,KEYS=Object.keys(OP),KEY='znaki-sim:'+SRC;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const col=k=>`--c:var(--${k});--cc:var(--${k}-c);--g:var(--${k}-g)`,wait=ms=>new Promise(r=>setTimeout(r,FAST?0:ms));
let st=fresh();function fresh(){return{scene:0,trust:Object.fromEntries(S.heroes.map(h=>[h.id,0])),tension:0,met:[],flags:[],my:Object.fromEntries(KEYS.map(k=>[k,0])),hyp:{},clues:[],step:0}}
const total=S.scenes.length*3+2,prog=()=>{const b=document.getElementById('bar');b.style.width=Math.min(100,st.step/total*100)+'%';b.parentNode.setAttribute('aria-valuenow',Math.round(st.step/total*100))};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
const scrollTo=el=>setTimeout(()=>el.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'}),40);
function add(h,a=true){const e=typeof h==='string'?$(h):h;if(a)e.classList.add('anim');app.appendChild(e);return e}
function toast(t){const e=$(`<div class="toast" role="status">${esc(t)}</div>`);document.body.appendChild(e);setTimeout(()=>e.remove(),1800)}
const mood=id=>st.trust[id]>0?'up':st.trust[id]<0?'down':'';
const moodWord=id=>({up:'теплее',down:'холоднее'})[mood(id)]||'';
const av=(id,cls='')=>`<span class="av ${cls} ${mood(id)?'mood-'+mood(id):''}" data-h="${id}" aria-hidden="true">${H[id].name[0]}</span>`;
function meters(){const m=document.getElementById('meters');if(!st.met.length){m.innerHTML='';return}m.innerHTML=st.met.map(id=>`<span class="mt" data-id="${id}" title="Доверие: ${H[id].name}">${av(id,'mav')}<span class="nm">${H[id].name}</span><span class="dots">${[...Array(5)].map((_,i)=>`<i class="${i<st.trust[id]+2?'on':''}"></i>`).join('')}</span></span>`).join('')+
 `<span class="mt tn" data-id="tension" title="Напряжение"><span aria-hidden="true" style="color:var(--serdce)">⚡</span><span class="nm">Напряжение</span><span class="dots">${[...Array(5)].map((_,i)=>`<i class="${i<st.tension?'on':''}"></i>`).join('')}</span></span>`;
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
<div class="cross" aria-label="Русский крест">${KEYS.map(k=>`<div style="${col(k)}">${OP[k].code}<small>${OP[k].stihiya} · ${OP[k].name}</small></div>`).join('')}</div>
<div class="steps"><div><i>01</i><b>Наблюдай</b><span>что делают и говорят герои — и ты</span></div><div><i>02</i><b>Выбирай</b><span>что сказать и сделать — как в жизни</span></div><div><i>03</i><b>Разбирай</b><span>почему вышло так и как можно иначе</span></div></div>
<a class="book" href="#"><span class="ic"></span><span>${m.book.label}<small>${m.book.pos}</small></span></a></section>`);
add(`<div class="card"><span class="eyebrow">Карта урока</span><h3 class="h-sec">Что будет сегодня</h3><ul class="map"><li><b>·</b><span><strong>Старт · Герои</strong>четыре человека, знаки скрыты</span></li>${S.scenes.map(s=>`<li style="${col(s.tone)}"><b>${s.num}</b><span><strong>${s.title}</strong>${s.label}</span></li>`).join('')}<li><b>✦</b><span><strong>Итог</strong>знаки героев, твой знак, закрепление</span></li></ul><p class="muted" style="margin-top:14px">${m.note}</p></div>`);
const hc=add(`<div class="card"><span class="eyebrow">Герои</span><h3 class="h-sec">С кем ты проведёшь этот вечер</h3><p>У каждого из них своя опора — тело, ум, душа или сердце. Какая — пока секрет. Узнать её можно только по уликам.</p><div class="heroes">${S.heroes.map(h=>`<div class="hero">${av(h.id)}<div><b>${h.name}</b><div class="r">${h.role}</div><div class="sg">ЗНАК: ?</div></div></div>`).join('')}</div>
<p class="muted" style="margin-top:14px">Подсказка: в репликах есть подчёркнутые фразы — нажми, и улика попадёт в блокнот. Клавиши 1–4 выбирают ответ, Enter — дальше.</p><div class="row"><button class="btn" id="go" data-next>Начать урок →</button></div></div>`);
let saved=null;try{saved=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(saved&&saved.scene>0&&saved.scene<=S.scenes.length){const r=add(`<div class="card resume"><span class="eyebrow" style="--c:var(--pri)">Продолжить</span><h3 class="h-sec">Ты остановился(ась) перед сценой ${S.scenes[saved.scene]?.num||'«Итог»'}</h3><p class="muted">Улик собрано: ${saved.clues.length}. Можно продолжить или начать заново.</p><div class="row"><button class="btn" data-next id="res">Продолжить →</button><button class="btn ghost" id="new">Начать заново</button></div></div>`);
 r.querySelector('#res').onclick=()=>{st=saved;r.remove();hc.querySelector('#go').disabled=true;renderNb();meters();prog();scene(st.scene)};
 r.querySelector('#new').onclick=()=>{localStorage.removeItem(KEY);r.remove()}}
meters();renderNb();
hc.querySelector('#go').onclick=e=>{e.target.disabled=true;document.querySelector('.resume')?.remove();st=fresh();st.step=1;prog();scene(0)};
async function scene(i){st.scene=i;save();const s=S.scenes[i];if(!s)return final();document.body.dataset.tone=s.tone;
 add(`<div class="div" style="${col(s.tone)}"><b></b></div>`);
 const h=add(`<section class="scene-h" style="${col(s.tone)}"><div class="num">${s.num}</div><div class="meta"><span>${s.label}</span><span>${s.time}</span><span>${s.place}</span></div><h2>${s.title}</h2></section>`);scrollTo(h);await wait(500);
 for(const t of s.narration){add(`<p class="narr">${esc(t)}</p>`);await wait(500)}
 for(const l of s.lines.filter(l=>!l.if||st.flags.includes(l.if))){if(l.who!=='narr'&&!st.met.includes(l.who)){st.met.push(l.who);meters()}await say(l)}
 if(s.after){add(`<p class="narr">${esc(s.after)}</p>`);await wait(300)}
 turn(s,i)}
function turn(s,i){const t=add(`<div class="turn"><span class="eyebrow" style="--c:var(--pri)">Твой ход</span><h3 class="h-sec">${s.prompt}</h3><p class="muted">Отвечай так, как ответишь в жизни. Правильных ответов нет — просто посмотри, к чему это приведёт.</p>${s.timer?`<div class="timer"><button class="btn ghost" style="padding:6px 14px;font-size:14px" id="tmB">Включить таймер ${s.timer.seconds} с</button><span>${esc(s.timer.text)}</span></div>`:''}<div class="opts-c">${s.choices.map((c,j)=>`<button class="ch" data-j="${j}"><kbd>${j+1}</kbd><span>${esc(c.text)}</span></button>`).join('')}</div></div>`);
 t.scrollIntoView({behavior:RM?'auto':'smooth',block:'nearest'});let tm=null;
 if(s.timer)t.querySelector('#tmB').onclick=e=>{let left=s.timer.seconds;const w=e.target.parentNode;w.innerHTML=`<span>⏱ <b id="tl">${left}</b> с</span><div class="tb"><i></i></div>`;const bar=w.querySelector('.tb i');
  tm=setInterval(()=>{left--;w.querySelector('#tl').textContent=left;bar.style.width=left/s.timer.seconds*100+'%';if(left<=0){clearInterval(tm);st.tension=Math.min(5,st.tension+1);meters();bump(['tension']);w.innerHTML='<span><b>Время вышло.</b> Пауза в чате — тоже ответ: напряжение +1. Выбирай.</span>'}},1000)};
 t.querySelectorAll('.ch').forEach(b=>b.onclick=async()=>{clearInterval(tm);const c=s.choices[b.dataset.j];t.querySelector('.opts-c').classList.add('done');t.querySelectorAll('.ch').forEach(x=>x.disabled=true);b.classList.add('sel');
  st.my[c.opora]++;if(c.setFlag&&!st.flags.includes(c.setFlag))st.flags.push(c.setFlag);const ch=[];
  for(const[k,v]of Object.entries(c.effects||{})){if(!v)continue;if(k==='tension')st.tension=Math.max(0,Math.min(5,st.tension+v));else st.trust[k]=Math.max(-2,Math.min(3,st.trust[k]+v));ch.push(k)}
  st.step++;prog();add(meLine(c.text,c.opora));await wait(300);
  for(const x of c.reactions)await say(x,true);meters();bump(ch);if(c.note)add(`<p class="narr muted">${esc(c.note)}</p>`);
  const fc=[];if(c.setFlag)fc.push('<b>Это аукнется позже.</b> Твой ответ изменит одну из следующих сцен.');if(st.tension>=3)fc.push('<b>Напряжение копится.</b> Ещё пара острых ходов — и вечер пойдёт иначе.');
  const w=add(`<div class="what" style="${col(c.opora)}"><span class="eyebrow">Что произошло</span><p style="margin-top:10px">${esc(c.what)}</p><div class="deltas">${deltas(c.effects)||'<span class="delta" style="background:var(--rule2);color:var(--ink2)">Без изменений</span>'}</div>${fc.length?`<div class="forecast">${fc.join('<br>')}</div>`:''}<div class="row"><button class="btn ghost" data-a="re">Переиграть: что было бы, если…</button><button class="btn" data-a="go" data-next>Дальше →</button></div></div>`);
  w.scrollIntoView({behavior:RM?'auto':'smooth',block:'nearest'});
  w.querySelector('[data-a=re]').onclick=e=>{e.target.remove();const rp=$(`<div class="replay"><p class="muted">Выбери другой ответ — увидишь реакцию. На твой счёт это не влияет.</p></div>`);
   s.choices.filter(x=>x!==c).forEach(x=>{const d=$(`<div><button class="ch"><span>${esc(x.text)}</span></button></div>`);d.querySelector('button').onclick=ev=>{ev.currentTarget.disabled=true;ev.currentTarget.classList.add('sel');d.insertAdjacentHTML('beforeend',`<div class="res">${x.reactions.map(y=>lineHtml(y).replace(/class="cue[^"]*"/,'')).join('')}<p style="font-size:15px">${esc(x.what)}</p><div class="deltas">${deltas(x.effects)}</div></div>`)};rp.appendChild(d)});
   w.insertBefore(rp,w.querySelector('.row'))};
  w.querySelector('[data-a=go]').onclick=()=>{w.querySelector('.row').remove();after(s,i)}})}
function after(s,i){const steps=[];if(s.theory)steps.push(()=>theory(s.theory,next));if(s.hypothesis)steps.push(()=>hyp(s.hypothesis,next));if(s.check)steps.push(()=>check(s.check,next));let n=0;
 function next(){st.step++;prog();save();const f=steps[n++];f?f():scene(i+1)}next()}
function oporyGrid(){const g=$(`<div class="opory">${KEYS.map(k=>`<button class="op" type="button" style="${col(k)}" data-k="${k}" aria-expanded="false"><small>${OP[k].code} · ${OP[k].stihiya}</small><b>${OP[k].name}</b>${OP[k].short}</button>`).join('')}</div>`);
 g.querySelectorAll('.op').forEach(b=>b.onclick=()=>{const p=b.querySelector('p');b.setAttribute('aria-expanded',!p);if(p)p.remove();else b.appendChild($(`<p>${esc(OP[b.dataset.k].portrait)}</p>`))});return g}
function theory(th,cb){const e=add(`<div class="theory"><span class="eyebrow">Разбор · ведущий</span><h3>${th.title}</h3><p>${esc(th.text)}</p></div>`);
 if(th.showOpory){e.appendChild($('<p class="muted">Нажми на знак — откроется его портрет.</p>'));e.appendChild(oporyGrid());e.appendChild($('<p class="muted">Знаки героев пока скрыты. Собирай улики — нажимай на подчёркнутые фразы — и выдвигай гипотезы.</p>'))}
 const r=$(`<div class="row"><button class="btn light" data-next>Дальше →</button></div>`);r.firstChild.onclick=()=>{r.remove();cb()};e.appendChild(r);scrollTo(e)}
function hyp(hy,cb){const hero=H[hy.hero],n=st.clues.filter(c=>c.hero===hy.hero).length;
 const e=add(`<div class="hyp"><span class="eyebrow" style="--c:var(--pri)">Гипотеза</span><div class="row" style="margin-top:10px">${av(hy.hero)}<h3 class="h-sec" style="margin:0;flex:1">${hy.question}</h3></div>
 <p class="muted">${n?`В блокноте улик про ${hero.name}: ${n}.`:`Улик про ${hero.name} в блокноте пока нет — можешь вернуться к репликам выше и нажать на подчёркнутые фразы.`}</p>
 <div class="conf" role="group" aria-label="Уверенность"><span>Насколько уверен(а):</span>${['догадка','скорее да','уверен(а)'].map((t,j)=>`<button type="button" data-c="${j+1}" aria-pressed="${j==1}">${t}</button>`).join('')}</div>
 <div class="opts">${KEYS.map(k=>`<button class="o" style="${col(k)}" data-k="${k}">${OP[k].name}<small>${OP[k].code} · ${OP[k].stihiya}</small></button>`).join('')}</div><div class="v" aria-live="polite"></div></div>`);
 let conf=2;e.querySelectorAll('.conf button').forEach(b=>b.onclick=()=>{conf=+b.dataset.c;e.querySelectorAll('.conf button').forEach(x=>x.setAttribute('aria-pressed',x===b))});scrollTo(e);
 e.querySelectorAll('.o').forEach(b=>b.onclick=()=>{const k=b.dataset.k,ok=k===hero.sign;e.querySelectorAll('.o').forEach(x=>{x.classList.toggle('sel',x===b);x.disabled=x!==b});
  st.hyp[hy.hero]={k,ok,conf};save();
  const cal=ok?(conf==3?'И уверенность оправдана.':conf==1?'Чутьё не подвело — доверяй уликам смелее.':''):(conf==3?'Ты был(а) уверен(а) — тем полезнее перепроверить улики.':'');
  e.querySelector('.v').innerHTML=`<div class="verdict ${ok?'y':'n'}"><b>${ok?'Гипотеза подтверждается':'Улик «против» больше'}</b><p style="margin:6px 0">${esc(hy.answers[k])}</p>${ok?'':'<p style="margin:0;font-size:14px">Можно передумать — или оставить и проверить в конце урока.</p>'}${cal?`<p style="margin:4px 0 0;font-size:14px">${cal}</p>`:''}</div><div class="row"><button class="btn ghost" data-a="re">Передумать</button><button class="btn" data-a="go" data-next>Дальше →</button></div>`;
  e.querySelector('[data-a=re]').onclick=()=>{e.querySelector('.v').innerHTML='';e.querySelectorAll('.o').forEach(x=>{x.classList.remove('sel');x.disabled=false})};
  e.querySelector('[data-a=go]').onclick=()=>{e.classList.add('done');e.querySelectorAll('button').forEach(x=>x.disabled=true);e.querySelector('.v .row').remove();cb()}})}
function check(ck,cb){let done=0;const e=add(`<div class="card check"><span class="eyebrow" style="--c:var(--dusha)">${ck.title}</span><h3 class="h-sec">${ck.question}</h3>${ck.items.map((it,j)=>`<div class="q" data-j="${j}"><span>${esc(it.quote)}</span><div class="pick">${KEYS.map(k=>`<button style="${col(k)}" data-k="${k}">${OP[k].name}</button>`).join('')}</div></div>`).join('')}<div class="res" aria-live="polite"></div></div>`);scrollTo(e);
 e.querySelectorAll('.q').forEach(q=>{const it=ck.items[q.dataset.j];let tries=0;q.querySelectorAll('button').forEach(b=>b.onclick=()=>{tries++;if(b.dataset.k===it.answer){b.classList.add('ok');q.querySelectorAll('button').forEach(x=>x.disabled=true);if(tries==1)done++;
  if(!e.querySelector('.q button:not([disabled])')){e.querySelector('.res').innerHTML=`<p style="margin-top:12px"><b>${done} из ${ck.items.length} с первого раза.</b> ${done===ck.items.length?'Ты уже видишь опоры по одной фразе.':'Опора видна по тому, что человек делает первым: понимает, делает, чувствует или решает.'}</p><div class="row"><button class="btn" data-next>Дальше →</button></div>`;e.querySelector('[data-next]').onclick=ev=>{ev.target.remove();cb()}}}
  else{b.classList.add('no');b.disabled=true}})})}
async function final(){st.step=total;prog();save();document.body.dataset.tone='none';const trust=Object.values(st.trust).reduce((a,b)=>a+b,0);
 const en=S.endings.find(x=>trust>=x.minTrust&&st.tension<=x.maxTension)||S.endings[S.endings.length-1];
 const me=KEYS.slice().sort((a,b)=>st.my[b]-st.my[a])[0],mx=Math.max(1,...Object.values(st.my));
 add(`<div class="div"><b></b></div>`);
 const e=add(`<section><div class="scene-h" style="${col('dusha')}"><div class="num">✦</div><h2>Итог</h2></div>
 <div class="end"><span class="eyebrow">Концовка · доверие ${trust>0?'+':''}${trust} · напряжение ${st.tension}</span><h2>${en.title}</h2><p>${esc(en.text)}</p></div>
 <div class="card"><span class="eyebrow">Знаки героев</span><h3 class="h-sec">Кто на что опирается</h3><p class="muted">Карточки переворачиваются по одной.</p><div class="reveal">${S.heroes.map(h=>{const y=st.hyp[h.id],k=h.sign;return `<div class="flip" style="${col(k)}"><div class="in"><div class="f">${av(h.id)}<div><b style="font:700 18px Manrope">${h.name}</b><div class="d">ЗНАК: ?</div></div></div><div class="b"><b>${h.name}</b><div class="t">${OP[k].name} · ${OP[k].code} · ${OP[k].stihiya}</div><div class="s">${y?(y.ok?'✓ Твоя гипотеза верна':'Твоя гипотеза: '+OP[y.k].name+'. Поправь интерпретацию: '+OP[k].short.toLowerCase()):'Гипотезы не было'}</div><div class="d">Доверие в конце: ${st.trust[h.id]>0?'+':''}${st.trust[h.id]}</div></div></div></div>`}).join('')}</div></div>
 <div class="card" style="${col(me)}"><span class="eyebrow">Твой знак — первая гипотеза по твоим ходам</span><h3 class="h-sec" style="color:var(--c)">Похоже, твоя опора — ${OP[me].name} · ${OP[me].code} · ${OP[me].stihiya}</h3><div class="bars">${KEYS.map(k=>`<div class="b" style="${col(k)}"><span>${OP[k].name}</span><div class="tr"><i data-w="${st.my[k]/mx*100}"></i></div><b>${st.my[k]}</b></div>`).join('')}</div><p>${esc(OP[me].portrait)}</p><p class="muted">Четыре сцены — это мало для вывода. Это первая улика о тебе самом(ой): проверь её на следующих уроках.</p></div>
 <div class="card"><span class="eyebrow">Закрепление</span><h3 class="h-sec">Говори на языке опоры</h3><ul class="tips">${KEYS.map(k=>`<li style="${col(k)}"><b>${OP[k].name}</b><span>${({telo:'дай конкретное дело и позаботься о комфорте',um:'дай смысл, факты и признай разбор',dusha:'ответь на чувство, побудь рядом «просто так»',serdce:'покажи цель и встречное решение'})[k]}</span></li>`).join('')}</ul>
 <a class="book" href="#" style="margin-top:16px"><span class="ic"></span><span>${m.book.label}<small>${m.book.pos}</small></span></a><div class="row"><button class="btn" id="again">Пройти заново — другим путём</button></div></div></section>`);
 e.querySelector('#again').onclick=()=>{localStorage.removeItem(KEY);location.href=location.pathname+location.search};scrollTo(e);
 await wait(900);for(const f of e.querySelectorAll('.flip')){f.classList.add('on');await wait(450)}e.querySelectorAll('.bars i').forEach(i=>i.style.width=i.dataset.w+'%')}
})();
