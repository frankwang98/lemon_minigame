export function drawRoundedRect(ctx, x, y, w, h, r, fillStyle) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
    ctx.fillStyle = fillStyle
    ctx.fill()
    ctx.restore()
  }
  
  export function drawButton(ctx, text, x, y, w, h, options = {}) {
    const {
      bgColor = '#FFE066',     // 柠檬黄
      textColor = '#333333',
      radius = 12,
      fontSize = 18
    } = options
  
    drawRoundedRect(ctx, x, y, w, h, radius, bgColor)
  
    ctx.save()
    ctx.fillStyle = textColor
    ctx.font = `${fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, x + w / 2, y + h / 2)
    ctx.restore()
  }
  