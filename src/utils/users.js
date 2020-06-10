const users = []

const addUser = ({id, username, room}) =>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error: 'User name and room is required'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error: 'user is in use'
        }
    }

    //save user
    const user = { id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user)=> {
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)
    }
}

//getUser
const getUser = (id) =>{
    return users.find((user) => user.id === id)
}

//getUserInRoom
const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}


