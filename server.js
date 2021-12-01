
const PORT = 8080   //Porta que vai rodar
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static("./"))
server.listen(PORT, () => console.log(`Server rodando em ${PORT}`))

io.on("connection", (socket) => {
    let name;
    socket.on("name", (nam) => {
        console.log(`${nam} has connected`)
        name = nam
    })
    let room;
    socket.on("room", (value) => {
        socket.leave(room)
        room = value
        socket.join(room);
        socket.to(room).emit("onname", {name:name, msg:'entrou'})
    })
    let line;
    socket.on("draw", (data) => {
        socket.to(room).emit("ondraw", { x: data.x, y: data.y })
    })

    socket.on("down", (data) => {
        socket.to(room).emit("ondown", { x: data.x, y: data.y })
    })

    socket.on("line", (data) => {
        socket.to(room).emit("online", { line:data.line })
    })
    socket.on("color", (data) => {
        socket.to(room).emit("oncolor", { color:data.color })
    })
    socket.on("over", ()=>{
        socket.to(room).emit("onover")
    })
    socket.on("stop", () => {
        socket.to(room).emit("onstop")
    });
    socket.on("erase", (situation)=>{
        socket.to(room).emit("onerase", situation)
    })
    socket.on("form", (data)=>{
        socket.to(room).emit("onform", data)
    })
    let move
    socket.on("ruler", (data)=>{
        if(data.count == 0){
            move = { x:data.x , y:data.y }
        }else{
            socket.to(room).emit("onruler", {x:data.x, y:data.y, move:move})
        }
    })
    socket.on("disconnect", (reason) => {
        console.log(`${socket.id} is disconnected`)
        socket.to(room).emit("onname", {name:name, msg:'saiu'})
    })
})