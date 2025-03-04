# Cognigy Socket.IO Client

A Node.js application that enables real-time communication with Cognigy.AI using Socket.IO. This client allows you to send messages to Cognigy and receive responses in real-time.

## Features

- 🔌 Real-time WebSocket connection to Cognigy.AI
- 📨 Bidirectional message communication
- 🔄 Support for conversation flow reset
- 📝 Custom data payload support
- 🛡️ Environment-based configuration
- ⚡ Asynchronous event handling
- 🚫 Error handling and graceful disconnection
- 📊 Console logging for debugging

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)
- Cognigy endpoint URL and URL token

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

The application uses a `.env` file for configuration. The following variables are required:

```env
COGNIGY_ENDPOINT=wss://endpoint-amna.cognigy.cloud
URL_TOKEN=your_url_token
SESSION_ID=your_session_id
USER_ID=your_user_id
```

## Usage Guide

### Starting the Application

```bash
npm start
```

### Sending Messages

The application provides several ways to interact with Cognigy:

1. **Basic Message**
   ```javascript
   sendMessage('Hello, how can you help me?');
   ```

2. **Message with Custom Data**
   ```javascript
   sendMessage('Search for products', false, {
     category: 'electronics',
     maxPrice: 1000
   });
   ```

3. **Reset Flow**
   ```javascript
   sendMessage('Start over', true);
   ```

### Message Format

#### Outgoing Messages
```javascript
{
    URLToken: "your_token",
    sessionId: "your_session_id",
    userId: "your_user_id",
    passthroughIP: "127.0.0.1",
    resetFlow: false,
    text: "Your message",
    data: {
        // Optional custom data
    }
}
```

#### Incoming Messages
```javascript
{
    type: "output",
    data: {
        text: "Response from Cognigy",
        data: {
            // Additional data from Cognigy
        }
    }
}
```

## Event Handling

The client automatically handles the following events:

- `connect`: Triggered when successfully connected to Cognigy
- `output`: Receives messages from Cognigy
- `error`: Handles connection errors
- `disconnect`: Manages clean disconnection

## Error Handling

The application includes built-in error handling for:
- Connection failures
- Message sending errors
- Invalid message formats
- Disconnection events

## Debugging

All events and messages are logged to the console for easy debugging:
- Connection status changes
- Sent messages
- Received messages
- Errors

## Best Practices

1. **Session Management**
   - Use unique session IDs for different conversations
   - Handle session timeouts appropriately

2. **Flow Control**
   - Use `resetFlow: true` sparingly
   - Maintain conversation context when needed

3. **Error Handling**
   - Monitor console logs for errors
   - Implement reconnection logic if needed

4. **Data Security**
   - Never expose your URL token
   - Use environment variables for sensitive data

## Troubleshooting

Common issues and solutions:

1. **Connection Failed**
   - Verify your Cognigy endpoint URL
   - Check URL token validity
   - Ensure internet connectivity

2. **Messages Not Sending**
   - Confirm WebSocket connection status
   - Verify message format
   - Check console for errors

3. **No Responses**
   - Verify event listeners are properly set up
   - Check Cognigy flow configuration
   - Confirm session ID is valid

## Support

For issues and feature requests, please:
1. Check the console logs for errors
2. Review the troubleshooting guide
3. Verify your Cognigy configuration

## License

This project is open-source and available under the MIT License.
