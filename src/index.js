const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/message')
const {addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectierypath = path.join(__dirname, '../public')

app.use(express.static(publicDirectierypath))

let message = 'Welcome'

io.on('connection', (socket)=>{

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('welcomeMessage', generateMessage('',message))
        socket.broadcast.to(user.room).emit("welcomeMessage",generateMessage('',`${user.username} has joined the room `))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()
    })

    socket.on('text', (text, callback)=> {
        const filter = new Filter
        if(filter.isProfane(text)){
            return callback('profanity is not allowed')
        }

        const user = getUser(socket.id)

        io.to(user.room).emit('textMessage', generateMessage(user.username, text))
        callback('Delivered')
    })
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user[0].room).emit('welcomeMessage', generateMessage('',`${user[0].username} has left`))
            io.to(user[0].room).emit('roomData', {
                room: user[0].room,
                users: getUserInRoom(user[0].room)
            })
        }
        

    })
    socket.on('location', (cords, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationl', generateLocationMessage(user.username,`https://google.com/maps?q=${cords.lat},${cords.lon}`))
        callback('Location Shared ')
    })
})

server.listen(port, ()=>{
    console.log("surver is up on " + port)
})
