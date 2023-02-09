import React, { useRef, useEffect } from 'react'

const Canvas = props => {
  
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    props.context = context

    //Our first draw
    context.fillStyle = '#000000'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)
  }, [])
  
  return <canvas style={{display:props.isHidden ? 'none' : '', position:'absolute', left:0, top:0}} ref={canvasRef} {...props}/>
}

export default Canvas
