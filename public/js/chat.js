const socket = io()

//Elements
const form = document.querySelector('form')
const textArea = document.querySelector('#text')
const send = document.querySelector('#send')
const sendLocation = document.querySelector('.send-location')
const messages = document.querySelector('#messages')

//Tamplets
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const autoscroll = ()=>{
    //new message element
    const $newmessage = messages.lastElementChild

    //height of the new element
    const nweMessageStyle = getComputedStyle($newmessage)
    const newMessageMargin = parseInt(nweMessageStyle.marginBottom)
    const newMessageHeight = $newmessage.offsetHeight + newMessageMargin

    //visible height 
    const visibleHeight = messages.offsetHeight

    //height of message content 
    const constainerHeight = messages.scrollHeight

    //how far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight 

    if(constainerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }
}

//options
const {username, room} = Qs.parse(location.search , {ignoreQueryPrefix: true})

socket.on('welcomeMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: "Admin",
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm  a')
    })
    messages.insertAdjacentHTML('beforeend', html)
})

form.addEventListener('submit', (e)=>{
    e.preventDefault()
    send.setAttribute('disabled', 'disabled')
    const text = document.querySelector('#text').value
    socket.emit('text', text, (d)=>{
        send.removeAttribute('disabled')
        textArea.value = ""
        textArea.focus()
        console.log(d)
    })
})

socket.on('textMessage', (text)=> {
    console.log(text)
    const html = Mustache.render(messageTemplate, {
        username: text.username,
        message: text.text,
        createdAt: moment(text.createdAt).format('hh:mm  a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

document.querySelector('.send-location').addEventListener('click', ()=>{
    if(!navigator.geolocation){
        alert('geolocation is not supported by your browser')
    }
    sendLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('location', {
            lat:position.coords.latitude,
            lon:position.coords.longitude
        }, (l) => {
            sendLocation.removeAttribute('disabled')
            console.log(l)
        })
    })
})

socket.on('locationl', (cords)=>{
    console.log(cords)
    const html = Mustache.render(locationTemplate, {
        username: cords.username,
        location: cords.location,
        createdAt: moment(cords.createdAt).format('hh:mm  a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users})=> {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', {username ,room},(error) => {
    if(error){
        alert(error)
        location.href = './'
    }
})