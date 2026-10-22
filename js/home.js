// 游戏大厅：两个小游戏共享同一 Canvas，不重复注册触摸事件
export function drawHome(ctx,w,h) {
  ctx.fillStyle='#FFF9E8';ctx.fillRect(0,0,w,h)
  ctx.textAlign='center';ctx.fillStyle='#3F5D36';ctx.font='bold 32px sans-serif';ctx.fillText('柠檬小游戏',w/2,h*.23)
  ctx.font='15px sans-serif';ctx.fillText('选一款，轻松玩一会儿',w/2,h*.23+32)
  const cards=[{y:h*.37,title:'柠檬大消除',sub:'滑动消除 · 连击闯关',color:'#FFD36A'},{y:h*.59,title:'柠檬塔防',sub:'建造防线 · 抵御怪物',color:'#B7DE9C'}]
  cards.forEach(c=>{ctx.fillStyle=c.color;ctx.fillRect(24,c.y,w-48,110);ctx.fillStyle='#3F4B32';ctx.font='bold 23px sans-serif';ctx.fillText(c.title,w/2,c.y+44);ctx.font='14px sans-serif';ctx.fillText(c.sub,w/2,c.y+75)})
}
export function homeChoice(y,h) {return y>=h*.37&&y<=h*.37+110?'match3':y>=h*.59&&y<=h*.59+110?'tower':null}
