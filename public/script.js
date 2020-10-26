// here we have access to all the socketIO and roomID, so we can call the [join-room] event
const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    //port: '3001'
    //port: '3000' // the same port as the server is listenning
    port: '443'
});
const myVideo = document.createElement('video');
myVideo.muted = true; // no mic playback, mutes ourselves
const peers = {}


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        });
    });

    socket.on('user-connected', userID => {
        connectToNewUser(userID, stream)
    });
})

socket.on('user-disconnected', userID => {
    if(peers[userID]){
        peers[userID].close();
    }
});

peer.on('open', id => { // as soon as connected to peer server and get back userID // it generates the id automatically
    socket.emit('join-room', ROOM_ID, id); // send event to the server that passes the roomID and userID when user joins the room
});


// socket.on('user-connected', userID => { // test code to check userID when connected
//     console.log('User Connected! - userID', userID);
// });

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => { // once it loads on the page plays the video stream
        video.play();
    });
    videoGrid.append(video);
}

function connectToNewUser(userID, stream){
    const call = peer.call(userID, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    }); // when we call the user from line above we send them our video stream and when they send us back their video stream we get this event called [stream] so we take their video stream
    call.on('close', () => { // leaving videocall/room
        video.remove();
    });

    peers[userID] = call
}