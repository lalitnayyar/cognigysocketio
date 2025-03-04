// Socket.IO Configuration
const socket = io('wss://endpoint-amna.cognigy.cloud', {
    transports: ['websocket'],
    query: {
        urlToken: '3ce6d23fe7ad0104dad95a02af5202fb70d17d507dd7013df24216c109800489',
        sessionId: 'test-05',
        userId: 'test-01'
    }
});

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

// Load saved configuration from localStorage
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

    // Reconnect socket with new configuration
    if (socket) {
        socket.disconnect();
    }

    // Initialize new socket connection
    socket = io(currentConfig.endpoint, {
        query: {
            'token': currentConfig.token,
            'sessionId': currentConfig.sessionId,
            'userId': currentConfig.userId
        }
    });

    // Reinitialize socket event handlers
    initializeSocketHandlers();

    // Hide config panel
    configPanel.classList.remove('show');
});

// Initialize socket event handlers
function initializeSocketHandlers() {
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
        
        if (output.text) {
            addMessage(output.text, true);
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

// Initialize configuration
initializeConfigInputs();

// Initialize socket with current configuration
let socket = io(currentConfig.endpoint, {
    query: {
        'token': currentConfig.token,
        'sessionId': currentConfig.sessionId,
        'userId': currentConfig.userId
    }
});

// Initialize socket handlers
initializeSocketHandlers();

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const outgoingJson = document.getElementById('outgoingJson');
const incomingJson = document.getElementById('incomingJson');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const disclaimerPopup = document.getElementById('disclaimerPopup');
const closePopupBtn = document.getElementById('closePopup');
const acceptButton = document.getElementById('acceptButton');
const dontShowAgainCheckbox = document.getElementById('dontShowAgain');

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

// Disclaimer Popup Functionality
// Check if user has already accepted the disclaimer
const hasAcceptedDisclaimer = localStorage.getItem('acceptedDisclaimer');

// Show popup if not previously accepted
if (!hasAcceptedDisclaimer) {
    disclaimerPopup.classList.add('show');
}

// Close popup function
function closePopup() {
    disclaimerPopup.classList.remove('show');
    if (dontShowAgainCheckbox.checked) {
        localStorage.setItem('acceptedDisclaimer', 'true');
    }
}

// Event listeners for popup
closePopupBtn.addEventListener('click', closePopup);
acceptButton.addEventListener('click', closePopup);

// Close popup when clicking outside
disclaimerPopup.addEventListener('click', (e) => {
    if (e.target === disclaimerPopup) {
        closePopup();
    }
});

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
