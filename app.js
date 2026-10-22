import {GameState} from './js/game-state.js'
import {TowerDefense} from './js/tower-defense.js'
import {GAME_CONFIG} from './js/config.js'
import {LEVELS} from './js/levels.js'
const $=id=>document.getElementById(id)
const canvas=$('game'),ctx=canvas.getContext('2d')
const width=390,height=700
canvas.width=width*devicePixelRatio;canvas.height=height*devicePixelRatio
ctx.scale(devicePixelRatio,devicePixelRatio)
let audioEnabled=true,audioContext=null;
function unlockAudio(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;audioContext??=new C();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});return audioContext}catch(e){return null}}
function beep(freq=480,duration=.09,volume=.065){if(!audioEnabled)return;const ac=unlockAudio();if(!ac)return;try{const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+.02;o.type='sine';o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+duration+.02)}catch(e){}}
globalThis.audioSystem={click:()=>beep(430,.06),ding:()=>beep(660,.12),pop:()=>beep(850,.14),drop:()=>beep(470,.07),fail:()=>beep(180,.17),tool:()=>beep(510,.11),victory:()=>{beep(700,.2);setTimeout(()=>beep(950,.24),130)},gameOver:()=>beep(160,.35)};
function syncAudioButton(){const b=$('matchSound');b.textContent=audioEnabled?'🔊 音效：开':'🔇 音效：关';b.setAttribute('aria-pressed',String(audioEnabled))}
$('matchSound').addEventListener('click',()=>{audioEnabled=!audioEnabled;syncAudioButton();if(audioEnabled)beep(660,.12)});
canvas.addEventListener('pointerdown',unlockAudio,{passive:true});

globalThis.wx={shareAppMessage(){alert('网页版本不支持微信分享领取道具')}}
let scene='home',last=performance.now(),pointer=null,selectedTool=null,match=new GameState(),tower=new TowerDefense(width,height)
const saved=Number(localStorage.getItem('lemon-match-level')||0)
match.loadLevel(Math.min(Math.max(saved,0),LEVELS.length-1))
function home(){window.HallMusic?.stop();scene='home';$('tiles').style.display='grid';$('gameArea').classList.remove('active');$('homeTop').hidden=true;$('intro').hidden=false}
function start(type){if(type==='tower'){window.location.href='./tower-defense-3.html';return}scene=type;$('tiles').style.display='none';$('gameArea').classList.add('active');$('homeTop').hidden=false;$('intro').hidden=true;$('gameTitle').textContent=type==='match'?'🍋 柠檬大消除':'🏰 柠檬塔防';$('instructions').textContent=type==='match'?'拖动相邻柠檬交换；底部可使用道具':'选择底部防御塔，点击道路外空地建造；点已有塔升级或出售';last=performance.now()}
document.querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',()=>start(b.dataset.game)))
$('homeTop').addEventListener('click',home)
$('restart').addEventListener('click',()=>{if(scene==='tower')tower.reset();else if(scene==='match'){match.loadLevel(match.levelIndex);match.gamePhase='playing'}})
const grid={x:16,y:175,size:(width-32)/7}
function cell(x,y){const col=Math.floor((x-grid.x)/grid.size),row=Math.floor((y-grid.y)/grid.size);return col>=0&&col<7&&row>=0&&row<7?{col,row}:null}
function coords(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*width/r.width,y:(e.clientY-r.top)*height/r.height}}
let swappedOnDrag=false
canvas.addEventListener('pointerdown',e=>{if(scene==='home')return;canvas.setPointerCapture(e.pointerId);const p=coords(e);pointer=p;swappedOnDrag=false;if(scene==='tower')tower.touch(p.x,p.y)})
canvas.addEventListener('pointermove',e=>{
 if(scene!=='match'||!pointer||match.gamePhase!=='playing'||match.resolving||selectedTool)return
 const p=coords(e),a=cell(pointer.x,pointer.y)
 if(!a||swappedOnDrag)return
 const dx=p.x-pointer.x,dy=p.y-pointer.y
 if(Math.max(Math.abs(dx),Math.abs(dy))<grid.size*.25)return
 const b={col:a.col+(Math.abs(dx)>Math.abs(dy)?Math.sign(dx):0),row:a.row+(Math.abs(dy)>=Math.abs(dx)?Math.sign(dy):0)}
 if(b.col<0||b.col>=7||b.row<0||b.row>=7)return
 match.trySwapAndResolve(a,b,Date.now());swappedOnDrag=true
})
canvas.addEventListener('pointerup',e=>{
 if(scene!=='match'||!pointer)return
 if(swappedOnDrag){pointer=null;swappedOnDrag=false;return}
 const p=coords(e),a=cell(pointer.x,pointer.y),b=cell(p.x,p.y);pointer=null
 if(match.gamePhase==='ready'){match.gamePhase='playing';return}
 if(match.gamePhase==='levelClear'){match.loadLevel(match.levelIndex+1);match.gamePhase='playing';localStorage.setItem('lemon-match-level',match.levelIndex);return}
 if(match.gamePhase==='gameOver'||match.gamePhase==='gameComplete'){match.loadLevel(match.gamePhase==='gameComplete'?0:match.levelIndex);match.gamePhase='playing';return}
 if(match.gamePhase!=='playing'||match.resolving)return
 if(p.y>620){const i=Math.min(2,Math.floor(p.x/(width/3)));const key=['shuffle','bomb','swap'][i];if(key==='shuffle'&&match.tools.shuffle>0){match.tools.shuffle--;match.shuffleBoard()}else selectedTool=key;return}
 if(selectedTool==='bomb'&&b&&match.tools.bomb>0){match.tools.bomb--;match.useBombAt(b,Date.now());selectedTool=null;return}
 if(selectedTool==='swap'&&b){if(!match.selectedCell)match.selectedCell=b;else{if(match.tools.swap>0){match.tools.swap--;match.swapCells(match.selectedCell,b);match.resolveBoardWithAnimation(Date.now())}match.selectedCell=null;selectedTool=null}return}
 if(a&&b&&match.isAdjacent(a,b))match.trySwapAndResolve(a,b,Date.now())
})
canvas.addEventListener('pointercancel',()=>pointer=null)
function text(t,x,y,size=16,color='#3B5037',align='center'){ctx.fillStyle=color;ctx.textAlign=align;ctx.font='600 '+size+'px system-ui,sans-serif';ctx.fillText(t,x,y)}
function matchDraw(now,dt){
 ctx.fillStyle='#FFFAEB';ctx.fillRect(0,0,width,height)
 if(match.gamePhase==='playing'){match.timeLeft=Math.max(0,match.timeLeft-dt);if(match.timeLeft<=0){match.gamePhase='gameOver'}}
 if(match.animations.length){
  const completed=match.animations.filter(a=>Date.now()-a.startTime>=a.duration)
  match.animations=match.animations.filter(a=>Date.now()-a.startTime<a.duration)
  if(completed.some(a=>a.type==='swap')&&match.resolving)match.resolveBoardWithAnimation(Date.now())
  if(completed.some(a=>a.type==='eliminate')){match.finalizeElimination();match.checkLevelStatus()}
 }
 text('🍋 柠檬大消除',width/2,55,28)
 text('第 '+(match.levelIndex+1)+' 关  ·  '+Math.ceil(match.timeLeft)+' 秒  ·  '+match.movesLeft+' 步',width/2,92,17)
 text('得分 '+match.score+' / 目标 '+(match.target.score||match.target.collect?.count||0),width/2,125,18)
 ctx.fillStyle='#F5EBCF';ctx.fillRect(9,168,width-18,grid.size*7+14)
 const icons=['🍋','🍊','🍈']
 for(let r=0;r<7;r++)for(let c=0;c<7;c++){
  const v=match.board[r][c];if(v===null||v===undefined)continue
  const x=grid.x+c*grid.size,y=grid.y+r*grid.size
  ctx.fillStyle=(r+c)%2?'#FFF7DC':'#FFF1CB';ctx.fillRect(x,y,grid.size-1,grid.size-1)
  text(icons[v]||'🍋',x+grid.size/2,y+grid.size*.69,grid.size*.65)
 }
 if(match.selectedCell){ctx.strokeStyle='#F49E38';ctx.lineWidth=3;ctx.strokeRect(grid.x+match.selectedCell.col*grid.size,grid.y+match.selectedCell.row*grid.size,grid.size,grid.size)}
 const names=['🔄 刷新','💣 爆破','🔁 换位'],keys=['shuffle','bomb','swap']
 names.forEach((name,i)=>{const x=8+i*width/3;ctx.fillStyle=selectedTool===keys[i]?'#FFC658':'#F8DC91';ctx.fillRect(x,625,width/3-12,52);text(name,x+(width/3-12)/2,647,15);text('剩余 '+match.tools[keys[i]],x+(width/3-12)/2,666,11)})
 if(match.gamePhase!=='playing'){
  ctx.fillStyle='rgba(255,250,235,.94)';ctx.fillRect(20,255,width-40,160)
  const labels={ready:'准备开始',levelClear:'🎉 过关啦',gameOver:'挑战失败',gameComplete:'全部通关'}
  text(labels[match.gamePhase],width/2,312,26)
  text(match.gamePhase==='ready'?'点击画面开始':match.gamePhase==='levelClear'?'点击画面进入下一关':'点击画面重新开始',width/2,352,16)
 }
}
function loop(now){const dt=Math.min((now-last)/1000,.05);last=now;if(scene==='match')matchDraw(now,dt);if(scene==='tower') {tower.update(dt);tower.draw(ctx)}requestAnimationFrame(loop)}
requestAnimationFrame(loop)
