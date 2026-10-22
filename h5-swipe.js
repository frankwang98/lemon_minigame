/* Edge-swipe to return to hall; avoids hijacking swipes on the game canvas. */
(function(){
let start=null;
document.addEventListener('touchstart',e=>{const t=e.touches[0];if(!t||t.clientX>28||e.target.closest('canvas')){start=null;return}start={x:t.clientX,y:t.clientY}},{passive:true});
document.addEventListener('touchend',e=>{if(!start)return;const t=e.changedTouches[0],dx=t.clientX-start.x,dy=Math.abs(t.clientY-start.y);start=null;if(dx>105&&dy<65){const back=document.querySelector('[data-hall-back]');if(back)back.click()}},{passive:true});
})();
