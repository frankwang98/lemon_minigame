/* Return to the arcade with a deliberate horizontal swipe.
   The match-3 canvas uses swipe gestures for gameplay, so only a swipe
   beginning at the far-right edge of that canvas navigates back. */
(function(){
let start=null;
document.addEventListener('touchstart',e=>{
 const t=e.touches[0];if(!t||e.touches.length!==1){start=null;return}
 const canvas=!!e.target.closest('canvas');
 const w=window.innerWidth;
 if(canvas&&t.clientX<w-28){start=null;return}
 if(e.target.closest('button,a,input,textarea,select')){start=null;return}
 start={x:t.clientX,y:t.clientY,canvas,width:w};
},{passive:true});
document.addEventListener('touchend',e=>{
 if(!start)return;
 const t=e.changedTouches[0];if(!t){start=null;return}
 const dx=t.clientX-start.x,dy=Math.abs(t.clientY-start.y);
 const valid=dy<65&&Math.abs(dx)>100&&Math.abs(dx)>dy*1.6;
 const direction=dx<0||start.x<32;
 const back=document.querySelector('[data-hall-back]:not([hidden])');
 if(valid&&direction&&back)back.click();
 start=null;
},{passive:true});
document.addEventListener('touchcancel',()=>{start=null},{passive:true});
})();
