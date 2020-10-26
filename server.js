const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const socketio = require('socket.io')(httpServer);
const { v4: uuidV4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(httpServer, {
    debug: true
});


app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`); // redirect the user to the dynamic room  // uuidV4() function will give a dynamic URL
});

app.get('/:room', (req, res) => { //  '/:room' is a dynamic parameter
    res.render('room', { roomID: req.params.room }); // get roomID from the URL from above
});

socketio.on('connection', socket => { // runs everytime someone connects to the page
    socket.on('join-room', (roomID, userID) => { // when someone connects to a room it passes in the roomID and the userID
        console.log('roomID, userID', roomID, userID);
        socket.join(roomID) // tell the users on the same roomID that there's a new user that just connected
        socket.to(roomID).broadcast.emit('user-connected', userID);

        socket.on('disconnect', () => {
            socket.to(roomID).broadcast.emit('user-disconnected', userID);
        });
    });
});

httpServer.listen(process.env.PORT||3000); // use the port openned in heroku (in this case) || open localhost port