/* Shared H5 background melody. Audio starts only after a user gesture. */
(function(){
let ctx=null,enabled=false,interval=null,step=0;
const notes=[261.63,329.63,392,0,329.63,293.66,261.63,0,220,261.63,329.63,0,293.66,261.63,196,0];
function getContext(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx??=new C();if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx}catch(e){return null}}
function tick(){if(!enabled||document.hidden)return;const ac=getContext();if(!ac||ac.state!=='running')return;const hz=notes[step++%notes.length];if(!hz)return;try{const t=ac.currentTime+.02,o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.022,t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+.28);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+.3)}catch(e){}}
function update(){document.querySelectorAll('[data-hall-music]').forEach(b=>{b.textContent=enabled?'🎵 音乐：开':'🎵 音乐：关';b.setAttribute('aria-pressed',String(enabled))})}
function toggle(){enabled=!enabled;getContext();if(enabled){if(!interval)interval=setInterval(tick,360);tick()}update()}
document.addEventListener('click',e=>{if(e.target.closest('[data-hall-music]'))toggle()});
document.addEventListener('pointerdown',()=>{if(enabled)getContext()},{passive:true});
window.HallMusic={stop(){enabled=false;update()},update};
document.addEventListener('DOMContentLoaded',update);
})();
