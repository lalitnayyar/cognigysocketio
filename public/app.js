// Socket.IO Configuration
const socket = io('wss://endpoint-amna.cognigy.cloud', {
    transports: ['websocket'],
    query: {
        urlToken: '3ce6d23fe7ad0104dad95a02af5202fb70d17d507dd7013df24216c109800489',
        sessionId: 'test-05',
        userId: 'test-01'
    }
});

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const outgoingJson = document.getElementById('outgoingJson');
const incomingJson = document.getElementById('incomingJson');
const toggleButtons = document.querySelectorAll('.toggle-btn');

// Toggle JSON panels
toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const target = button.dataset.target;
        
        // Update button states
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update panel visibility
        document.querySelectorAll('.json-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(target).classList.add('active');
    });
});

// Format timestamp
function formatTime(timestamp) {
    return moment(timestamp).format('HH:mm');
}

// Safely parse HTML content
function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format message text with HTML support
function formatMessageText(text) {
    if (!text) return '';
    
    // Handle markdown-style formatting
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic
    text = text.replace(/`(.*?)`/g, '<code>$1</code>'); // Code
    text = text.replace(/\n/g, '<br>'); // Line breaks
    
    // Handle URLs
    text = text.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    return text;
}

// Helper function to create message element
function createMessageElement(text, isReceived = false, timestamp = new Date()) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isReceived ? 'received' : 'sent'}`;
    
    const avatar = document.createElement('img');
    avatar.className = 'message-avatar';
    avatar.src = isReceived 
        ? 'https://api.dicebear.com/7.x/bottts/svg?seed=cognigy' 
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=user';
    avatar.alt = isReceived ? 'Bot Avatar' : 'User Avatar';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessageText(text);
    
    const timeSpan = document.createElement('div');
    timeSpan.className = 'message-time';
    timeSpan.textContent = formatTime(timestamp);
    
    contentDiv.appendChild(timeSpan);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    
    return messageDiv;
}

// Function to send message
function sendMessage(text) {
    if (!text.trim()) return;
    
    const message = {
        URLToken: socket.io.opts.query.urlToken,
        sessionId: socket.io.opts.query.sessionId,
        userId: socket.io.opts.query.userId,
        passthroughIP: "127.0.0.1",
        resetFlow: false,
        text: text,
        data: {}
    };
    
    // Update outgoing JSON display
    outgoingJson.textContent = JSON.stringify(message, null, 2);
    
    // Add message to chat
    chatMessages.appendChild(createMessageElement(text, false));
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Send message through socket
    socket.emit('processInput', message);
}

// Event Listeners
sendButton.addEventListener('click', () => {
    sendMessage(messageInput.value);
    messageInput.value = '';
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage(messageInput.value);
        messageInput.value = '';
    }
});

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to Cognigy WebSocket');
});

socket.on('output', (data) => {
    // Update incoming JSON display
    incomingJson.textContent = JSON.stringify(data, null, 2);
    
    // Add message to chat
    if (data.data && data.data.text) {
        chatMessages.appendChild(createMessageElement(data.data.text, true));
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

socket.on('error', (error) => {
    console.error('Connection error:', error);
    // Add error message to chat
    chatMessages.appendChild(createMessageElement('Error: Connection failed. Please try again.', true));
});

socket.on('disconnect', () => {
    console.log('Disconnected from Cognigy WebSocket');
    // Add disconnect message to chat
    chatMessages.appendChild(createMessageElement('Disconnected from server. Attempting to reconnect...', true));
});
