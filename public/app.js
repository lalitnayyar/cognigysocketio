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

// Disclaimer Modal
const disclaimerModal = document.getElementById('disclaimerModal');
const hideDisclaimerBtn = document.getElementById('hideDisclaimer');
const acceptDisclaimerBtn = document.getElementById('acceptDisclaimer');
const showDisclaimerBtn = document.getElementById('showDisclaimer');
const dontShowAgainCheckbox = document.getElementById('dontShowAgain');

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
        
        if (output.data && output.data.card) {
            appendBotMessage(output.data.text, output.data);
        }
    });
}

// Random gradient colors for messages
const gradients = [
    ['#4f46e5', '#6366f1'], // Indigo
    ['#2563eb', '#3b82f6'], // Blue
    ['#0891b2', '#06b6d4'], // Cyan
    ['#0d9488', '#14b8a6'], // Teal
    ['#059669', '#10b981'], // Emerald
    ['#16a34a', '#22c55e'], // Green
    ['#7c3aed', '#8b5cf6'], // Violet
    ['#9333ea', '#a855f7'], // Purple
    ['#c026d3', '#d946ef'], // Fuchsia
    ['#db2777', '#ec4899'], // Pink
];

function getRandomGradient() {
    const index = Math.floor(Math.random() * gradients.length);
    return `linear-gradient(135deg, ${gradients[index][0]}, ${gradients[index][1]})`;
}

// Light pastel colors for bot messages
const botMessageColors = [
    { bg: '#f0f7ff', border: '#bfdbfe' }, // Light blue
    { bg: '#f5f3ff', border: '#ddd6fe' }, // Light purple
    { bg: '#f0fdf4', border: '#bbf7d0' }, // Light green
    { bg: '#fff7ed', border: '#fed7aa' }, // Light orange
    { bg: '#fdf2f8', border: '#fbcfe8' }, // Light pink
    { bg: '#f8fafc', border: '#e2e8f0' }, // Light gray
    { bg: '#f0fdfa', border: '#99f6e4' }, // Light teal
    { bg: '#fefce8', border: '#fef08a' }, // Light yellow
    { bg: '#faf5ff', border: '#e9d5ff' }, // Light violet
    { bg: '#fff1f2', border: '#fecdd3' }  // Light rose
];

function getRandomBotMessageColor() {
    return botMessageColors[Math.floor(Math.random() * botMessageColors.length)];
}

// Avatar styles for user
const userAvatarStyles = [
    'adventurer',      // Adventurer style
    'adventurer-neutral', // Neutral adventurer
    'avataaars',       // Classic avataar style
    'big-ears',        // Fun big ears style
    'big-smile',       // Friendly big smile
    'micah',           // Artistic micah style
    'miniavs',         // Minimal style
    'open-peeps',      // Open peeps style
    'pixel-art',       // Retro pixel art
    'personas'         // Modern personas
];

function getRandomUserAvatarStyle() {
    return userAvatarStyles[Math.floor(Math.random() * userAvatarStyles.length)];
}

// Store user's avatar style in session
let userAvatarStyle = getRandomUserAvatarStyle();

function appendMessage(text, isUser, data = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

    // Create avatar container
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'avatar-container';
    const avatarImg = document.createElement('img');
    
    if (isUser) {
        // Use the stored avatar style for consistency
        avatarImg.src = `https://api.dicebear.com/7.x/${userAvatarStyle}/svg?seed=user&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
        avatarImg.alt = 'User Avatar';
    } else {
        // Keep the bot avatar consistent
        avatarImg.src = `https://api.dicebear.com/7.x/bottts/svg?seed=bot&backgroundColor=b6e3f4`;
        avatarImg.alt = 'Bot Avatar';
    }
    
    avatarContainer.appendChild(avatarImg);
    messageDiv.appendChild(avatarContainer);

    // Create message content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Apply background colors
    if (isUser) {
        contentDiv.style.background = getRandomGradient();
        contentDiv.style.color = 'white';
    } else {
        const colors = getRandomBotMessageColor();
        contentDiv.style.background = colors.bg;
        contentDiv.style.borderColor = colors.border;
        contentDiv.style.borderWidth = '1px';
        contentDiv.style.borderStyle = 'solid';
        contentDiv.style.color = '#1f2937';
    }

    // Add message header
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
    textDiv.innerHTML = formatMessage(text);
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
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function appendBotMessage(text, data = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';

    // Create avatar container
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'avatar-container';
    const avatarImg = document.createElement('img');
    avatarImg.src = `https://api.dicebear.com/7.x/bottts/svg?seed=bot`;
    avatarImg.alt = 'Bot Avatar';
    avatarContainer.appendChild(avatarImg);
    messageDiv.appendChild(avatarContainer);

    // Create message content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Add message header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    headerDiv.innerHTML = `
        <span class="sender-name">Cognigy AI</span>
        <span class="message-time">${formatTime(new Date())}</span>
    `;
    contentDiv.appendChild(headerDiv);

    // Add message text
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.innerHTML = formatMessage(text);
    contentDiv.appendChild(textDiv);

    // Add adaptive card if data is present
    if (data && data.card) {
        const card = createAdaptiveCard(data.card);
        contentDiv.appendChild(card);
    }

    messageDiv.appendChild(contentDiv);
    messageContainer.appendChild(messageDiv);
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

function formatMessage(text) {
    return text
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        // Code blocks
        .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Lists
        .replace(/^\s*[\-\*]\s+(.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Numbered lists
        .replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')
        // Links
        .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        // Blockquotes
        .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')
        // Line breaks
        .replace(/\n/g, '<br>');
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
function sendMessage(text) {
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
}

// Initialize event listeners
function initializeEventListeners() {
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const sendButton = messageForm.querySelector('.send-button');

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        
        if (text) {
            sendMessage(text);
            messageInput.value = '';
            messageInput.focus();
        }
    });

    messageInput.addEventListener('input', () => {
        sendButton.disabled = !messageInput.value.trim();
    });

    // Initialize button as disabled
    sendButton.disabled = true;
}

// Function to change user avatar style
function changeUserAvatar() {
    userAvatarStyle = getRandomUserAvatarStyle();
    // Update all existing user avatars
    document.querySelectorAll('.message.user .avatar-container img').forEach(avatar => {
        avatar.src = `https://api.dicebear.com/7.x/${userAvatarStyle}/svg?seed=user&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    });
}

// Add avatar change button to the UI
function addAvatarChangeButton() {
    const chatInput = document.querySelector('.chat-input form .input-group');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'avatar-change-button';
    button.innerHTML = '<i class="fas fa-user-circle"></i>';
    button.title = 'Change Avatar Style';
    button.onclick = changeUserAvatar;
    chatInput.appendChild(button);
}

// Initialize avatar change button
document.addEventListener('DOMContentLoaded', addAvatarChangeButton);

// Disclaimer Modal Functionality
function showModal() {
    disclaimerModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    disclaimerModal.classList.remove('show');
    document.body.style.overflow = '';
    showDisclaimerBtn.classList.add('visible');
    
    if (dontShowAgainCheckbox.checked) {
        localStorage.setItem('hideDisclaimer', 'true');
    }
}

// Show modal on page load if not hidden
if (!localStorage.getItem('hideDisclaimer')) {
    showModal();
}

// Event listeners for disclaimer modal
hideDisclaimerBtn.addEventListener('click', hideModal);
acceptDisclaimerBtn.addEventListener('click', hideModal);
showDisclaimerBtn.addEventListener('click', showModal);

// Close modal when clicking outside
disclaimerModal.addEventListener('click', (e) => {
    if (e.target === disclaimerModal) {
        hideModal();
    }
});

// Show the disclaimer button if modal is hidden
if (localStorage.getItem('hideDisclaimer')) {
    showDisclaimerBtn.classList.add('visible');
}

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && disclaimerModal.classList.contains('show')) {
        hideModal();
    }
});

// Initialize the app
initializeConfigInputs();
initializeSocket(currentConfig);
initializeEventListeners();

// Example usage for testing
function testAdaptiveCard() {
    const cardData = {
        title: 'Booking Information',
        subtitle: 'Please provide your booking details',
        fields: [
            {
                type: 'text',
                label: 'Full Name',
                placeholder: 'Enter your name',
                required: true
            },
            {
                type: 'email',
                label: 'Email Address',
                placeholder: 'your@email.com',
                required: true
            },
            {
                type: 'select',
                label: 'Room Type',
                options: [
                    { value: 'standard', label: 'Standard Room' },
                    { value: 'deluxe', label: 'Deluxe Room' },
                    { value: 'suite', label: 'Suite' }
                ]
            },
            {
                type: 'checkbox',
                label: 'Additional Services',
                options: [
                    { value: 'breakfast', label: 'Breakfast' },
                    { value: 'parking', label: 'Parking' },
                    { value: 'wifi', label: 'WiFi' }
                ]
            }
        ],
        actions: [
            {
                label: 'Submit',
                type: 'primary',
                onClick: () => console.log('Submit clicked')
            },
            {
                label: 'Cancel',
                type: 'secondary',
                onClick: () => console.log('Cancel clicked')
            }
        ]
    };

    appendBotMessage('Please fill out the booking form:', { card: cardData });
}

function createAdaptiveCard(data) {
    const card = document.createElement('div');
    card.className = `adaptive-card ${getRandomTheme()}`;

    // Create header
    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `
        <div class="card-title">${data.title || 'Form'}</div>
        <div class="card-subtitle">${data.subtitle || 'Please fill out the information below'}</div>
    `;
    card.appendChild(header);

    // Create body
    const body = document.createElement('div');
    body.className = 'card-body';

    // Add fields based on data type
    if (data.fields) {
        data.fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'card-field';

            const label = document.createElement('label');
            label.className = 'card-label';
            label.textContent = field.label;
            fieldDiv.appendChild(label);

            switch (field.type) {
                case 'text':
                case 'email':
                case 'tel':
                    const input = document.createElement('input');
                    input.type = field.type;
                    input.className = 'card-input';
                    input.placeholder = field.placeholder || '';
                    input.required = field.required || false;
                    fieldDiv.appendChild(input);
                    break;

                case 'select':
                    const select = document.createElement('select');
                    select.className = 'card-select';
                    field.options.forEach(option => {
                        const opt = document.createElement('option');
                        opt.value = option.value;
                        opt.textContent = option.label;
                        select.appendChild(opt);
                    });
                    fieldDiv.appendChild(select);
                    break;

                case 'checkbox':
                    const checkboxGroup = document.createElement('div');
                    checkboxGroup.className = 'card-checkbox-group';
                    field.options.forEach(option => {
                        const item = document.createElement('label');
                        item.className = 'card-checkbox-item';
                        item.innerHTML = `
                            <input type="checkbox" value="${option.value}">
                            <span>${option.label}</span>
                        `;
                        checkboxGroup.appendChild(item);
                    });
                    fieldDiv.appendChild(checkboxGroup);
                    break;

                case 'radio':
                    const radioGroup = document.createElement('div');
                    radioGroup.className = 'card-radio-group';
                    field.options.forEach(option => {
                        const item = document.createElement('label');
                        item.className = 'card-radio-item';
                        item.innerHTML = `
                            <input type="radio" name="${field.name}" value="${option.value}">
                            <span>${option.label}</span>
                        `;
                        radioGroup.appendChild(item);
                    });
                    fieldDiv.appendChild(radioGroup);
                    break;
            }

            body.appendChild(fieldDiv);
        });
    }

    // Add actions
    if (data.actions) {
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        
        data.actions.forEach(action => {
            const button = document.createElement('button');
            button.className = `card-button ${action.type || 'secondary'}`;
            button.textContent = action.label;
            button.onclick = action.onClick || (() => {});
            actions.appendChild(button);
        });
        
        body.appendChild(actions);
    }

    card.appendChild(body);
    return card;
}

function getRandomTheme() {
    const cardThemes = ['theme-blue', 'theme-purple', 'theme-green', 'theme-orange', 'theme-pink'];
    return cardThemes[Math.floor(Math.random() * cardThemes.length)];
}
