require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cognigy Socket.IO Client</title>
        <link rel="stylesheet" href="styles.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js"></script>
        <script>
            // Inject environment variables
            window.COGNIGY_ENDPOINT = "${process.env.COGNIGY_ENDPOINT || ''}";
            window.URL_TOKEN = "${process.env.URL_TOKEN || ''}";
            window.SESSION_ID = "${process.env.SESSION_ID || ''}";
            window.USER_ID = "${process.env.USER_ID || ''}";
        </script>
    </head>
    <body>
        <div class="container">
            <div class="chat-container">
                <div id="chatMessages" class="messages"></div>
                <div class="input-container">
                    <input type="text" id="messageInput" placeholder="Type your message...">
                    <button id="sendButton">Send</button>
                </div>
            </div>
            <div id="jsonPanel" class="json-panel">
                <div class="json-header">
                    <h2>JSON Exchange</h2>
                    <div class="json-tabs">
                        <button class="json-tab active" data-tab="outgoing">Outgoing</button>
                        <button class="json-tab" data-tab="incoming">Incoming</button>
                    </div>
                </div>
                <div class="json-content">
                    <pre id="outgoingJson" class="json-display active"></pre>
                    <pre id="incomingJson" class="json-display"></pre>
                </div>
            </div>
        </div>

        <!-- Config Panel -->
        <div id="configPanel" class="config-panel">
            <div class="config-header">
                <h2>Configuration</h2>
                <button id="toggleConfig" class="toggle-config-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
            </div>
            <div class="config-content">
                <div class="config-group">
                    <label for="endpointInput">Cognigy Endpoint:</label>
                    <input type="text" id="endpointInput" placeholder="Enter Cognigy endpoint URL">
                </div>
                <div class="config-group">
                    <label for="tokenInput">URL Token:</label>
                    <input type="password" id="tokenInput" placeholder="Enter URL token">
                    <button class="toggle-password" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>
                <div class="config-group">
                    <label for="sessionInput">Session ID:</label>
                    <input type="text" id="sessionInput" placeholder="Enter session ID">
                </div>
                <div class="config-group">
                    <label for="userInput">User ID:</label>
                    <input type="text" id="userInput" placeholder="Enter user ID">
                </div>
                <div class="config-actions">
                    <button id="resetConfig" class="reset-btn">Reset to Default</button>
                    <button id="applyConfig" class="apply-btn">Apply & Connect</button>
                </div>
            </div>
        </div>

        <!-- Disclaimer Popup -->
        <div id="disclaimerPopup" class="popup">
            <div class="popup-content">
                <div class="popup-header">
                    <h2>Disclaimer</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="popup-body">
                    <p>Welcome to the Cognigy Socket.IO Client by <strong>Lalit Nayyar</strong>.</p>
                    <p>This application is a demonstration of Socket.IO integration with Cognigy.AI for real-time chat functionality.</p>
                    <p>Please note:</p>
                    <ul>
                        <li>This is a development tool and should be used responsibly</li>
                        <li>All chat data is processed through Cognigy.AI servers</li>
                        <li>Do not share sensitive information in the chat</li>
                    </ul>
                    <div class="popup-footer">
                        <label class="checkbox-container">
                            <input type="checkbox" id="dontShowAgain">
                            <span class="checkmark"></span>
                            Don't show this message again
                        </label>
                        <button class="accept-btn">Accept & Continue</button>
                    </div>
                </div>
            </div>
        </div>

        <script src="app.js"></script>
    </body>
    </html>`;

    res.send(html);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
