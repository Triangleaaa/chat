const socket = io();
const username = localStorage.getItem('username');
const avatarUrl = localStorage.getItem('avatarUrl');

if (!username || !avatarUrl) {
  window.location.href = '/';
}

document.getElementById('message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const message = document.getElementById('message').value.trim();
  if (message) {
    const timestamp = new Date().toLocaleTimeString();
    socket.emit('chat message', { username, message, avatarUrl, timestamp });
    document.getElementById('message').value = '';
  }
});

socket.on('chat message', (data) => {
  const messagesContainer = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.innerHTML = `
    <div>
      <img src="${data.avatarUrl}" alt="avatar" width="40" height="40">
      <strong>${data.username}</strong> [${data.timestamp}]: ${data.message}
    </div>
  `;
  messagesContainer.appendChild(messageElement);
});
