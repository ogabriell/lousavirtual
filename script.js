// Conexão com o servidor
const socket = io()
socket.on("connect", () =>{
    console.log(`Seu id é ${socket.id}`)
    socket.emit("name",getName(true))
    socket.emit("room", 'default')
})

// Entra na sala
const getRoom = ()=>{
    let room = document.getElementById('room')
    socket.emit("room", room.value)
    context.clearRect(0, 0, canvas.width, canvas.height)
    alert(`Você entrou na sala ${room.value}`)
}

// Muda o tamanho da linha
let range = 1
const getRange = () =>{
    range = document.getElementById('brushRange')
    document.getElementById('rangeText').innerHTML = range.value
    context.lineWidth = range.value  
    socket.emit('line', { line:context.lineWidth })  
}

// Regua
let rulerDraw = false
let count = 0
const ruler = () =>{
    rulerDraw = true
    selected('ruler')
} 

// Pega as informações da tag canvas
const canvas = document.getElementById('board')

// Pega as informações de altura e largura da tela
canvas.width = window.innerWidth 
canvas.height = window.innerHeight 

// Pega o contexto do canvas
const context = canvas.getContext('2d')

// Configura a linha
context.lineCap = "round"
context.lineJoin = "round"


// Borracha
let situation;
const erase = () => {
    if(situation == 'destination-out'){
        situation = 'source-over'
    }else{
        situation = 'destination-out'
    }
    context.globalCompositeOperation = situation
    socket.emit("erase", situation)
    selected('eraser')
}

// Muda cor do fundo quando ferramenta selecionada
const selected = (id)=>{
    let color = document.getElementById(id).style.backgroundColor
    if (color == "") {
        document.getElementById(id).style.backgroundColor = "#9b9b9b"
        document.getElementById(id).style.borderRadius = "5px"
    } else {
        document.getElementById(id).style.backgroundColor = ""
        document.getElementById(id).style.borderRadius = ""
    }
}

// Muda a cor da linha
const changeColor = color => {
    context.strokeStyle = color
    socket.emit('color', { color:context.strokeStyle })  
}

// Quadrado
let squareDraw = false
const square = ()=>{
    squareDraw = true
    selected('square')
}
// Circulo
let circleDraw = false
const circle = ()=>{
    circleDraw = true
    selected('circle')
}
// Triangulo
let triangleDraw = false
const triangle = ()=>{
    triangleDraw = true
    selected('triangle')
}

// Detecta se tem intenção de desenhar
let isDrawing = false

const startDrawing = (event) => {
    if(block)return
    isDrawing = true
    socket.emit("stop", true)

    if(!!squareDraw){
        triangleDraw = false
        circleDraw = false
        context.lineJoin = "miter"
        context.strokeRect(event.clientX, event.clientY, 200, 200)
        squareDraw = false
        selected('square')
        socket.emit("form", {form:'square', x:event.clientX, y:event.clientY})
        context.lineJoin = "round"
    }

    if(!!circleDraw){
        triangleDraw = false
        squareDraw = false
        context.arc(event.clientX, event.clientY, 100, 0, 2 * Math.PI)
        context.stroke()
        circleDraw = false
        selected('circle')
        socket.emit("form", {form:'circle', x:event.clientX, y:event.clientY})
    }
    if(!!triangleDraw){
        squareDraw = false
        circleDraw = false
        context.lineJoin = "miter"
        context.beginPath();
        context.moveTo(event.clientX, event.clientY)
        context.lineTo(event.clientX + 100, event.clientY + 200)
        context.lineTo(event.clientX - 100, event.clientY + 200)
        context.closePath()
        context.stroke()
        triangleDraw = false
        selected('triangle')
        socket.emit("form", {form:'triangle', x:event.clientX, y:event.clientY})
        context.lineJoin = "round"
    }
    if(!!rulerDraw){
        if(count == 0){
            context.moveTo(event.clientX, event.clientY)
            socket.emit("ruler", {x:event.clientX, y:event.clientY, count:count})
            count++
        }else{
            context.lineTo(event.clientX, event.clientY)
            context.stroke()
            socket.emit("ruler", {x:event.clientX, y:event.clientY, count:count})
            count = 0
            document.getElementById("ruler").style.backgroundColor = ""
            rulerDraw = false
        }
    }
    
    context.moveTo(event.clientX, event.clientY)
    socket.emit('down', { x:event.clientX, y:event.clientY })
}


const stopDrawing = () => {
    isDrawing = false
    socket.emit("stop")
}
const draw = (event) => {
    if(rulerDraw)return
    if (!isDrawing) return
    context.lineTo(event.clientX, event.clientY)
    socket.emit("draw", { x:event.clientX, y:event.clientY })
    context.stroke()
}
const enterCanvas = (event) => {
    context.beginPath()
    socket.emit("over")
}
let block = false
// Recebe informações do servidor
socket.on("ondraw", ({ x, y }) => {
    context.lineTo(x, y)
    context.stroke()
    block = true
});

socket.on("ondown", ({ x, y}) => {
    context.moveTo(x, y)
});
socket.on("onstop", () => {
    block = false
});
socket.on("online", ({line})=>{
    context.lineWidth = line
})
socket.on("oncolor", ({color})=>{
    context.strokeStyle = color
})
socket.on("onover",()=>{
    context.beginPath()
})
socket.on("onerase",(situation)=>{
    context.globalCompositeOperation = situation
})
socket.on("onform",(data)=>{
    if(data.form == 'triangle'){
        context.lineJoin = "miter"
        context.beginPath();
        context.moveTo(data.x, data.y)
        context.lineTo(data.x + 100, data.y + 200)
        context.lineTo(data.x - 100, data.y + 200)
        context.closePath()
        context.stroke()
        context.lineJoin = "round"
    }else if(data.form == 'square'){
        context.lineJoin = "miter"
        context.strokeRect(data.x, data.y, 200, 200)
        context.lineJoin = "round"
    }else{
        context.arc(data.x, data.y, 100, 0, 2 * Math.PI)
        context.stroke()
    }
})
socket.on("onruler",(data)=>{
    context.moveTo(data.move.x, data.move.y)
    context.lineTo(data.x, data.y)
    context.stroke()
})

socket.on("onname", (data)=>{
    console.log(`${data.name} ${data.msg} na sala`)
        document.getElementById('notification').innerHTML = `${data.name} ${data.msg} na sala`
        document.getElementById('notification').style.visibility = "visible"
    const time = setTimeout(() => {
        document.getElementById('notification').style.visibility = "hidden"
    }, 3000)
})

// Detecta interações do usuario
canvas.addEventListener("mousedown", startDrawing)
canvas.addEventListener("mouseup", stopDrawing)
canvas.addEventListener("mousemove", draw)
canvas.addEventListener("mouseover", enterCanvas)