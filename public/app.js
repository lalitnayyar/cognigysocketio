// Get environment variables from window object (injected by server)
const COGNIGY_ENDPOINT = window.COGNIGY_ENDPOINT;
const URL_TOKEN = window.URL_TOKEN;
const SESSION_ID = window.SESSION_ID;
const USER_ID = window.USER_ID;

// DOM Elements
const messageContainer = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const jsonPanel = document.getElementById('jsonPanel');
const outgoingJsonContent = document.getElementById('outgoingJson');
const incomingJsonContent = document.getElementById('incomingJson');

// Configuration Panel
const configPanel = document.getElementById('configPanel');
const toggleConfigBtn = document.getElementById('toggleConfig');
const endpointInput = document.getElementById('endpointInput');
const tokenInput = document.getElementById('tokenInput');
const sessionInput = document.getElementById('sessionInput');
const userInput = document.getElementById('userInput');
const resetConfigBtn = document.getElementById('resetConfig');
const applyConfigBtn = document.getElementById('applyConfig');
const togglePasswordBtn = document.querySelector('.toggle-password');

// Default values from server
let defaultConfig = {
    endpoint: COGNIGY_ENDPOINT || '',
    token: URL_TOKEN || '',
    sessionId: SESSION_ID || '',
    userId: USER_ID || ''
};

// Load saved configuration from localStorage or use defaults
let currentConfig = JSON.parse(localStorage.getItem('cognigyConfig')) || defaultConfig;

// Initialize input values
function initializeConfigInputs() {
    endpointInput.value = currentConfig.endpoint;
    tokenInput.value = currentConfig.token;
    sessionInput.value = currentConfig.sessionId;
    userInput.value = currentConfig.userId;
}

// Toggle config panel
toggleConfigBtn.addEventListener('click', () => {
    configPanel.classList.toggle('show');
});

// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
    const type = tokenInput.type === 'password' ? 'text' : 'password';
    tokenInput.type = type;
    togglePasswordBtn.innerHTML = type === 'password' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
});

// Reset configuration
resetConfigBtn.addEventListener('click', () => {
    currentConfig = { ...defaultConfig };
    localStorage.removeItem('cognigyConfig');
    initializeConfigInputs();
    initializeSocket(currentConfig);
});

// Apply configuration and reconnect
applyConfigBtn.addEventListener('click', async () => {
    const newConfig = {
        endpoint: endpointInput.value || defaultConfig.endpoint,
        token: tokenInput.value || defaultConfig.token,
        sessionId: sessionInput.value || defaultConfig.sessionId,
        userId: userInput.value || defaultConfig.userId
    };

    // Save to localStorage
    localStorage.setItem('cognigyConfig', JSON.stringify(newConfig));
    currentConfig = newConfig;

    // Initialize new socket connection
    initializeSocket(currentConfig);

    // Hide config panel
    configPanel.classList.remove('show');
});

let socket = null;

// Initialize socket with configuration
function initializeSocket(config) {
    // Disconnect existing socket if any
    if (socket) {
        socket.disconnect();
    }

    // Create new socket connection with transports specified
    socket = io(config.endpoint, {
        transports: ['websocket'],
        query: {
            'urlToken': config.token,
            'sessionId': config.sessionId,
            'userId': config.userId
        }
    });

    // Socket event handlers
    socket.on('connect', () => {
        console.log('Connected to Cognigy.AI');
        appendMessage('Connected to Cognigy.AI', false);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from Cognigy.AI');
        appendMessage('Disconnected from Cognigy.AI', false);
    });

    socket.on('error', (error) => {
        console.error('Socket Error:', error);
        appendMessage('Error: ' + error.message, false);
    });

    socket.on('output', (output) => {
        console.log('Received output:', output);
        updateJsonPanel(output, 'incomingJson');
        
        if (output.data && output.data.text) {
            appendMessage(output.data.text, false, output.data);
        }
        
        if (output.data && output.data.quickReplies) {
            const quickRepliesElement = createQuickReplyButtons(output.data.quickReplies);
            if (quickRepliesElement) {
                messageContainer.appendChild(quickRepliesElement);
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        }
    });
}

// Append message to chat
function appendMessage(text, isUser, data = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

    // Create avatar container
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'avatar-container';
    
    // Create avatar image
    const avatarImg = document.createElement('img');
    avatarImg.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${isUser ? 'child' : 'bot'}`;
    avatarImg.alt = `${isUser ? 'User' : 'Bot'} Avatar`;
    avatarContainer.appendChild(avatarImg);
    messageDiv.appendChild(avatarContainer);

    // Create message content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Add message header with sender and timestamp
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    headerDiv.innerHTML = `
        <span class="sender-name">${isUser ? 'You' : 'Cognigy AI'}</span>
        <span class="message-time">${formatTime(new Date())}</span>
    `;
    contentDiv.appendChild(headerDiv);

    // Add message text
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = text;
    contentDiv.appendChild(textDiv);

    // Add data if present
    if (data) {
        const dataDiv = document.createElement('div');
        dataDiv.className = 'message-data';
        dataDiv.textContent = JSON.stringify(data, null, 2);
        contentDiv.appendChild(dataDiv);
    }

    messageDiv.appendChild(contentDiv);
    messageContainer.appendChild(messageDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

// Create quick reply buttons
function createQuickReplyButtons(quickReplies) {
    if (!Array.isArray(quickReplies) || quickReplies.length === 0) return null;

    const container = document.createElement('div');
    container.className = 'quick-replies';

    quickReplies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'quick-reply-btn';
        button.textContent = reply;
        button.onclick = () => {
            const message = {
                text: reply,
                data: null
            };
            socket.emit('processInput', message);
            updateJsonPanel(message, 'outgoingJson');
            appendMessage(reply, true);
            container.remove();
        };
        container.appendChild(button);
    });

    return container;
}

// Update JSON panel
function updateJsonPanel(data, panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.textContent = JSON.stringify(data, null, 2);
    }
}

// Send message
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    const message = {
        URLToken: currentConfig.token,
        sessionId: currentConfig.sessionId,
        userId: currentConfig.userId,
        text: text,
        data: {},
        passthroughIP: "127.0.0.1",
        resetFlow: false
    };

    socket.emit('processInput', message);
    updateJsonPanel(message, 'outgoingJson');
    appendMessage(text, true);
    messageInput.value = '';
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Initialize the app
initializeConfigInputs();
initializeSocket(currentConfig);
