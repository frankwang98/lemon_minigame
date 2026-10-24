(()=>{'use strict';
const $=id=>document.getElementById(id),icons=['🍋','🍓','🍇','🍊','🍒','🥝','🍎','🍉','🍍','🥥','🥕','🌽'];
const anchors=[[17,18],[41,16],[66,19],[83,37],[19,43],[44,42],[70,45],[15,68],[39,70],[65,72],[83,78],[48,85]];
let level=1,items=[],tray=[],history=[],score=0,remaining=0,total=0,seconds=180,undos=3,mixes=2,hints=3,combo=0,lastMatch=0,ended=false,muted=false,ctx=null,timer=null,suggestion=null,win=false;
try{level=Math.max(1,Math.min(20,Number(localStorage.getItem('lemon-catch-level'))||1))}catch(e){}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function beep(freq=550,duration=.09){if(muted)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ctx??=new C();if(ctx.state==='suspended')ctx.resume().catch(()=>{});const t=ctx.currentTime+.01,o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.11,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+duration+.02)}catch(e){}}
function say(s){$('msg').textContent=s}
function floatText(s,x=50,y=40){const d=document.createElement('div');d.className='float';d.textContent=s;d.style.left=x+'%';d.style.top=y+'%';$('board').append(d);setTimeout(()=>d.remove(),510)}
function covered(o){return items.some(v=>v.id!==o.id&&v.z>o.z&&Math.abs(v.x-o.x)<13&&Math.abs(v.y-o.y)<13)}
function save(){return{items:items.map(o=>({...o})),tray:[...tray],score,remaining,combo,lastMatch}}
function restore(s){items=s.items;tray=s.tray;score=s.score;remaining=s.remaining;combo=s.combo;lastMatch=s.lastMatch}
function start(){
clearInterval(timer);ended=false;win=false;tray=[];history=[];score=0;undos=3;mixes=2;hints=3;combo=0;lastMatch=0;suggestion=null;
seconds=level===1?180:level===2?210:240;
const count=Math.min(9,3+level),copies=level<=2?3:6;
const kinds=shuffle([...icons]).slice(0,count),pool=shuffle(kinds.flatMap(t=>Array(copies).fill(t)));
items=pool.map((type,i)=>{const a=anchors[i%anchors.length],layer=Math.floor(i/anchors.length);return{id:i,type,x:Math.max(9,Math.min(91,a[0]+layer*2+(Math.random()-.5)*6)),y:Math.max(9,Math.min(91,a[1]+layer*2+(Math.random()-.5)*6)),z:layer,angle:(Math.random()-.5)*16}});
remaining=total=items.length;$('modal').hidden=true;say('先凑齐三个相同物品，逐层翻找');render();
timer=setInterval(()=>{if(ended||document.hidden)return;seconds=Math.max(0,seconds-1);metrics();if(seconds===0)finish(false,'时间到了')},1000);
}
function metrics(){
$('level').textContent=level;$('left').textContent=remaining;$('score').textContent=score;
$('time').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
$('time').classList.toggle('time-warning',seconds<=30);
$('progress').style.width=(total?(total-remaining)/total*100:0)+'%';
}
function render(){
metrics();const area=$('pieces');area.replaceChildren();
[...items].sort((a,b)=>a.z-b.z).forEach(o=>{const b=document.createElement('button');b.type='button';b.className='piece'+(covered(o)?' covered':'')+(o.id===suggestion?' hint':'');b.style.left=o.x+'%';b.style.top=o.y+'%';b.style.zIndex=o.z+1;b.style.setProperty('--angle',o.angle+'deg');b.textContent=o.type;b.disabled=covered(o)||ended;b.setAttribute('aria-label',o.type+(b.disabled?'被遮挡':'可拿取'));b.onclick=()=>take(o.id);area.append(b)});
const slots=$('tray');slots.replaceChildren();for(let i=0;i<7;i++){const d=document.createElement('div');d.className='slot'+(tray[i]?' filled':'');d.textContent=tray[i]||'';slots.append(d)}
$('count').textContent=tray.length+' / 7';$('un').textContent=undos;$('mn').textContent=mixes;$('hn').textContent=hints;
$('undo').disabled=ended||undos<1||!history.length;$('mix').disabled=ended||mixes<1;$('hint').disabled=ended||hints<1;
}
function finish(success,reason){
ended=true;win=success;clearInterval(timer);
$('result').textContent=success?'🏆 挑战成功！':'🪿 挑战结束';
$('summary').textContent='得分 '+score+' · '+(success?'所有物品已消除！':reason);
$('next').textContent=success?'挑战下一关 →':'重新挑战';
$('modal').hidden=false;if(success)beep(900,.25);else beep(180,.3);render();
}
function take(id){
if(ended)return;const o=items.find(x=>x.id===id);if(!o||covered(o))return;
history.push(save());items=items.filter(x=>x.id!==id);remaining--;tray.push(o.type);suggestion=null;beep(470+tray.length*35,.065);
if(tray.filter(t=>t===o.type).length>=3){
let n=0;tray=tray.filter(t=>{if(t===o.type&&n<3){n++;return false}return true});
const now=Date.now();combo=now-lastMatch<5000?combo+1:1;lastMatch=now;
const gain=100*combo;score+=gain;floatText(combo>1?'🔥 '+combo+' 连击 +'+gain:'✨ 消除 +100',o.x,o.y);say('消除成功，继续连击！');beep(820+combo*35,.15);
}else say('继续寻找 '+o.type);
if(remaining===0&&tray.length===0){finish(true,'');return}
if(tray.length>=7){finish(false,'收集槽已满');return}
render();
}
$('undo').onclick=()=>{if(ended||undos<1||!history.length)return;restore(history.pop());undos--;suggestion=null;beep(360);say('撤回成功');render()};
$('mix').onclick=()=>{if(ended||mixes<1)return;const places=shuffle(items.map(o=>({x:o.x,y:o.y,z:o.z,angle:o.angle})));items.forEach((o,i)=>Object.assign(o,places[i]));history=[];mixes--;suggestion=null;beep(630,.15);floatText('🥘 颠锅！');say('位置已重新打乱');render()};
$('hint').onclick=()=>{if(ended||hints<1)return;const counts={};tray.forEach(t=>counts[t]=(counts[t]||0)+1);const available=items.filter(o=>!covered(o)).sort((a,b)=>(counts[b.type]||0)-(counts[a.type]||0));suggestion=available[0]?.id??null;hints--;beep(700);say('已高亮建议收集的物品');render()};
$('reset').onclick=start;$('next').onclick=()=>{if(win){level=Math.min(20,level+1);try{localStorage.setItem('lemon-catch-level',String(level))}catch(e){}}start()};
$('sound').onclick=()=>{muted=!muted;$('sound').textContent=muted?'🔇 音效：关':'🔊 音效：开';$('sound').setAttribute('aria-pressed',String(!muted));if(!muted)beep(700)};
start();
})();