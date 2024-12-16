document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const avatar = document.getElementById('avatar').files[0];
    
    if (!username || !avatar) {
      alert('Both username and avatar are required.');
      return;
    }
  
    const formData = new FormData();
    formData.append('username', username);
    formData.append('avatar', avatar);
  
    const response = await fetch('/upload-avatar', { method: 'POST', body: formData });
    const data = await response.json();
  
    if (data.success) {
      localStorage.setItem('username', username);
      localStorage.setItem('avatarUrl', data.avatarUrl);
      window.location.href = '/chat';
    } else {
      alert('Failed to upload avatar. Please try again.');
    }
  });
  