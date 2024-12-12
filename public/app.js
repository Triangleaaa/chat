const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const chat = document.getElementById('chat');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');
const startButton = document.getElementById('start');

let localStream;
let peerConnection;

const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // STUN server
};

startButton.addEventListener('click', async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(config);
    peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
            socket.emit('candidate', candidate);
        }
    };

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);
});

socket.on('offer', async (offer) => {
    peerConnection = new RTCPeerConnection(config);
    peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
            socket.emit('candidate', candidate);
        }
    };

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

socket.on('answer', async (answer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('candidate', async (candidate) => {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
        console.error('Error adding received ICE candidate', err);
    }
});

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    socket.emit('chatMessage', message);
    chat.value += `You: ${message}\n`;
    messageInput.value = '';
});

socket.on('chatMessage', (message) => {
    chat.value += `Peer: ${message}\n`;
});
