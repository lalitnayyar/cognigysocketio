require('dotenv').config();
const io = require('socket.io-client');

// Construct the WebSocket URL
const wsUrl = `${process.env.COGNIGY_ENDPOINT}?urlToken=${process.env.URL_TOKEN}&sessionId=${process.env.SESSION_ID}&userId=${process.env.USER_ID}`;

// Connect to Cognigy WebSocket
const socket = io(wsUrl, {
    transports: ['websocket']
});

// Connection event handlers
socket.on('connect', () => {
    console.log('Connected to Cognigy WebSocket');
    
    // Example: Send a message after connection
    sendMessage('Hello from Node.js client!');
});

socket.on('error', (error) => {
    console.error('Connection error:', error);
});

socket.on('disconnect', () => {
    console.log('Disconnected from Cognigy WebSocket');
});

// Listen for messages from Cognigy
socket.on('output', (data) => {
    console.log('Received message:', data);
});

// Function to send messages to Cognigy
function sendMessage(text, resetFlow = false, data = {}) {
    const message = {
        URLToken: process.env.URL_TOKEN,
        sessionId: process.env.SESSION_ID,
        userId: process.env.USER_ID,
        passthroughIP: "127.0.0.1",
        resetFlow: resetFlow,
        text: text,
        data: data
    };

    socket.emit('processInput', message);
    console.log('Sent message:', message);
}

// Example: Send a message with reset flow
// setTimeout(() => {
//     sendMessage('Start new flow', true);
// }, 2000);

// Example: Send a regular message
// setTimeout(() => {
//     sendMessage('How are you?', false, { customData: 'value' });
// }, 4000);

// Handle process termination
process.on('SIGINT', () => {
    console.log('Disconnecting from Cognigy...');
    socket.disconnect();
    process.exit();
});
