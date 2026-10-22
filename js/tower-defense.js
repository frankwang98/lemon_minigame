// 原生 Canvas 塔防：固定路线、建塔、升级、出售与波次
export class TowerDefense {
  constructor(width, height) {
    this.w = width; this.h = height
    this.path = [[0,.28],[.28,.28],[.28,.53],[.73,.53],[.73,.77],[1,.77]]
    this.towerTypes = [
      {name:'柠檬炮',cost:45,range:85,damage:15,rate:.65,color:'#F5B82E'},
      {name:'冰冻塔',cost:65,range:90,damage:7,rate:1,color:'#72C9E8',slow:1.3},
      {name:'爆裂塔',cost:90,range:75,damage:25,rate:1.2,color:'#F27B6D',splash:38}
    ]
    this.reset()
  }
  reset() {
    this.gold=140;this.hp=10;this.wave=0;this.enemies=[];this.towers=[];this.shots=[]
    this.spawnLeft=0;this.spawnClock=0;this.waveDelay=1;this.selectedType=0;this.selectedTower=null
    this.phase='playing';this.elapsed=0
  }
  coords() {
    const top=130,bottom=this.h-155
    return this.path.map(([x,y])=>({x:x*this.w,y:top+y*(bottom-top)/.85}))
  }
  position(e) {
    const points=this.coords();let d=e.distance
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],len=Math.hypot(b.x-a.x,b.y-a.y)
      if(d<=len)return {x:a.x+(b.x-a.x)*d/len,y:a.y+(b.y-a.y)*d/len}
      d-=len
    }
    return null
  }
  onPath(x,y) {
    const p=this.coords()
    for(let i=1;i<p.length;i++){
      const a=p[i-1],b=p[i],dx=b.x-a.x,dy=b.y-a.y
      const t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)))
      if(Math.hypot(x-a.x-t*dx,y-a.y-t*dy)<28)return true
    }
    return false
  }
  touch(x,y) {
    if(this.phase!=='playing'){this.reset();return}
    if(y>this.h-100){
      const n=Math.floor(x/(this.w/3));this.selectedType=Math.min(2,Math.max(0,n));this.selectedTower=null;return
    }
    if(y<115){
      if(this.selectedTower){
        const t=this.selectedTower,price=Math.floor(t.type.cost*.7*t.level)
        if(x<this.w/2&&this.gold>=price&&t.level<3){this.gold-=price;t.level++}
        else if(x>=this.w/2){this.gold+=Math.floor(t.type.cost*t.level*.45);this.towers=this.towers.filter(a=>a!==t);this.selectedTower=null}
      }
      return
    }
    const existing=this.towers.find(t=>Math.hypot(t.x-x,t.y-y)<26)
    if(existing){this.selectedTower=existing;return}
    const type=this.towerTypes[this.selectedType]
    if(y<125||y>this.h-130||x<25||x>this.w-25||this.onPath(x,y)||this.towers.some(t=>Math.hypot(t.x-x,t.y-y)<52)||this.gold<type.cost)return
    this.gold-=type.cost;this.towers.push({x,y,type,level:1,cooldown:0});this.selectedTower=null
  }
  update(dt) {
    if(this.phase!=='playing')return
    dt=Math.min(dt,.05);this.elapsed+=dt
    if(!this.spawnLeft&&!this.enemies.length){
      this.waveDelay-=dt
      if(this.waveDelay<=0){this.wave++;this.spawnLeft=4+this.wave*2;this.spawnClock=0;this.waveDelay=3}
    }
    if(this.spawnLeft>0){
      this.spawnClock-=dt
      if(this.spawnClock<=0){
        const boss=this.wave%5===0&&this.spawnLeft===1
        this.enemies.push({distance:0,hp:(boss?220:45)+this.wave*13,maxHp:(boss?220:45)+this.wave*13,speed:boss?30:42+this.wave*2,slowUntil:0,boss})
        this.spawnLeft--;this.spawnClock=.8
      }
    }
    for(const e of this.enemies){
      e.distance+=e.speed*(e.slowUntil>this.elapsed?.55:1)*dt
      if(!this.position(e)){e.escaped=true;this.hp-=e.boss?3:1}
    }
    this.enemies=this.enemies.filter(e=>!e.escaped)
    if(this.hp<=0){this.phase='lost';return}
    for(const t of this.towers){
      t.cooldown-=dt
      if(t.cooldown>0)continue
      const target=this.enemies.find(e=>{const p=this.position(e);return p&&Math.hypot(p.x-t.x,p.y-t.y)<t.type.range+t.level*12})
      if(!target)continue
      const p=this.position(target),damage=t.type.damage*(1+(t.level-1)*.65)
      for(const e of this.enemies){
        const ep=this.position(e)
        if(e===target||(t.type.splash&&ep&&Math.hypot(ep.x-p.x,ep.y-p.y)<t.type.splash))e.hp-=damage
      }
      if(t.type.slow)target.slowUntil=this.elapsed+t.type.slow
      this.shots.push({x:t.x,y:t.y,tx:p.x,ty:p.y,life:.16,color:t.type.color})
      t.cooldown=t.type.rate/(1+(t.level-1)*.2)
    }
    const defeated=this.enemies.filter(e=>e.hp<=0)
    this.gold+=defeated.reduce((sum,e)=>sum+(e.boss?70:12),0)
    this.enemies=this.enemies.filter(e=>e.hp>0)
    this.shots=this.shots.filter(s=>(s.life-=dt)>0)
  }
  draw(ctx) {
    const w=this.w,h=this.h
    ctx.fillStyle='#FFF9E8';ctx.fillRect(0,0,w,h)
    ctx.fillStyle='#3E563C';ctx.font='bold 22px sans-serif';ctx.textAlign='left';ctx.fillText('柠檬塔防',18,43)
    ctx.font='15px sans-serif';ctx.fillText('生命 '+this.hp+'   金币 '+this.gold+'   第 '+this.wave+' 波',18,70)
    ctx.font='12px sans-serif';ctx.fillText(this.selectedTower?'左侧升级 / 右侧出售':'点击下方选塔，再点击空地建造',18,96)
    if(this.selectedTower){ctx.fillStyle='#D9F0C9';ctx.fillRect(0,105,w,29);ctx.fillStyle='#31502C';ctx.fillText('升级 '+Math.floor(this.selectedTower.type.cost*.7*this.selectedTower.level)+' 金',18,125);ctx.fillText('出售',w-55,125)}
    const p=this.coords()
    ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);for(let i=1;i<p.length;i++)ctx.lineTo(p[i].x,p[i].y)
    ctx.strokeStyle='#D5C5A0';ctx.lineWidth=45;ctx.lineJoin='round';ctx.stroke()
    ctx.strokeStyle='#F0E6C8';ctx.lineWidth=34;ctx.stroke()
    for(const t of this.towers){
      ctx.beginPath();ctx.arc(t.x,t.y,20,0,Math.PI*2);ctx.fillStyle=t.type.color;ctx.fill()
      ctx.strokeStyle=t===this.selectedTower?'#3E563C':'#FFFFFF';ctx.lineWidth=3;ctx.stroke()
      ctx.fillStyle='#3B3327';ctx.textAlign='center';ctx.font='bold 13px sans-serif';ctx.fillText(t.level,t.x,t.y+5)
    }
    for(const e of this.enemies){
      const p=this.position(e);if(!p)continue
      ctx.beginPath();ctx.arc(p.x,p.y,e.boss?18:13,0,Math.PI*2);ctx.fillStyle=e.boss?'#B05F89':'#8FBA72';ctx.fill()
      ctx.fillStyle='#E5E5E5';ctx.fillRect(p.x-17,p.y-24,34,4);ctx.fillStyle='#E66C64';ctx.fillRect(p.x-17,p.y-24,34*Math.max(0,e.hp/e.maxHp),4)
    }
    for(const s of this.shots){ctx.strokeStyle=s.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.tx,s.ty);ctx.stroke()}
    const labels=this.towerTypes
    labels.forEach((t,i)=>{const x=i*w/3+5,bw=w/3-10;ctx.fillStyle=i===this.selectedType?'#FFCE55':'#F2E9D3';ctx.fillRect(x,h-95,bw,75);ctx.fillStyle='#3B3327';ctx.textAlign='center';ctx.font='bold 14px sans-serif';ctx.fillText(t.name,x+bw/2,h-64);ctx.font='13px sans-serif';ctx.fillText(t.cost+' 金',x+bw/2,h-40)})
    if(this.phase==='lost'){ctx.fillStyle='rgba(255,249,232,.9)';ctx.fillRect(0,h*.35,w,120);ctx.textAlign='center';ctx.fillStyle='#4D4A35';ctx.font='bold 27px sans-serif';ctx.fillText('防线失守',w/2,h*.35+45);ctx.font='16px sans-serif';ctx.fillText('点击屏幕重新开始',w/2,h*.35+80)}
  }
}
