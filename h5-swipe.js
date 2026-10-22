/* Swipe left to return to the hall, without intercepting game-board gestures. */
(function(){
let start=null;
document.addEventListener('touchstart',e=>{
 const t=e.touches[0];if(!t||e.touches.length!==1||e.target.closest('canvas')){start=null;return}
 start={x:t.clientX,y:t.clientY,width:window.innerWidth};
},{passive:true});
document.addEventListener('touchend',e=>{
 if(!start)return;
 const t=e.changedTouches[0],dx=t.clientX-start.x,dy=Math.abs(t.clientY-start.y);
 const leftSwipe=dx < -100 && start.x > start.width-65;
 const rightSwipe=dx > 100 && start.x < 32;
 start=null;
 if(dy>65||(!leftSwipe&&!rightSwipe))return;
 const back=document.querySelector('[data-hall-back]:not([hidden])');
 if(back)back.click();
},{passive:true});
document.addEventListener('touchcancel',()=>{start=null},{passive:true});
})();
