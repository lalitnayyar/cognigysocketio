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
        addMessage('Connected to Cognigy.AI', true);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from Cognigy.AI');
        addMessage('Disconnected from Cognigy.AI', true);
    });

    socket.on('error', (error) => {
        console.error('Socket Error:', error);
        addMessage('Error: ' + error.message, true);
    });

    socket.on('output', (output) => {
        console.log('Received output:', output);
        updateJsonPanel(output, 'incomingJson');
        
        if (output.data && output.data.text) {
            addMessage(output.data.text, true);
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

// Add message to chat
function addMessage(text, isBot = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isBot ? 'bot' : 'user'}`;
    
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = moment().format('HH:mm');
    
    const content = document.createElement('div');
    content.className = 'content';
    content.innerHTML = formatMessage(text);
    
    messageDiv.appendChild(content);
    messageDiv.appendChild(timestamp);
    
    messageContainer.appendChild(messageDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Format message with markdown-like syntax
function formatMessage(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
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
            addMessage(reply);
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
    addMessage(text);
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
