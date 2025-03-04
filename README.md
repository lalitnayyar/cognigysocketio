# Cognigy Socket.IO Client

A modern Node.js application that provides a professional chat interface for Cognigy.AI using Socket.IO. This client features a sleek, responsive design with real-time message exchange visualization.

![Demo Screenshot](https://api.dicebear.com/7.x/avataaars/svg?seed=demo) <!-- Placeholder for actual screenshot -->

## 🌟 Features

### Chat Interface (Left Sidebar)
- 💬 Modern chat bubble design with timestamps
- 👤 Dynamic user avatars using DiceBear API
- 🟢 Real-time online status indicators
- ⌨️ Intuitive message input with send button
- 📜 Smooth-scrolling chat history
- ⚡ Real-time message delivery
- 🕒 Message timestamps

### JSON Exchange Monitor (Right Sidebar)
- 🔄 Live JSON message monitoring
- 📤 Outgoing message JSON preview
- 📥 Incoming message JSON display
- 🎨 Syntax-highlighted JSON formatting
- 🌙 Dark theme for better readability
- 📋 Easy-to-read message structure

### Design Elements
- 🎨 Vibrant, modern color scheme
- 📱 Fully responsive layout
- ✨ Smooth animations and transitions
- 🖌️ Custom scrollbar styling
- 🎯 Professional typography
- 🔲 Clean, minimalist interface

### Technical Features
- 🔌 Real-time WebSocket communication
- 🔒 Secure connection handling
- 🔄 Automatic reconnection
- ⚠️ Error handling with user feedback
- 📊 Message delivery status
- 🕐 Moment.js time formatting

## 🚀 Quick Start

### Prerequisites
- Node.js (v12 or higher)
- npm (Node Package Manager)
- A valid Cognigy endpoint URL and token

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lalitnayyar/cognigysocketio.git
   cd cognigysocketio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables:
   Create a `.env` file with:
   ```env
   COGNIGY_ENDPOINT=wss://endpoint-amna.cognigy.cloud
   URL_TOKEN=your_url_token
   SESSION_ID=your_session_id
   USER_ID=your_user_id
   PORT=3000
   ```

4. Start the application:
   ```bash
   npm start
   ```

5. Open your browser:
   Navigate to `http://localhost:3000`

## 💻 Usage Guide

### Chat Interface

1. **Sending Messages**
   - Type your message in the input field
   - Press Enter or click the send button
   - Messages appear instantly with timestamps

2. **Viewing Message History**
   - Scroll through previous messages
   - Messages are color-coded (blue for sent, gray for received)
   - Each message shows sender avatar and timestamp

3. **Connection Status**
   - Green dot indicates active connection
   - Automatic reconnection on disconnection
   - Status messages for connection events

### JSON Monitor

1. **Viewing JSON Exchange**
   - Toggle between "Outgoing" and "Incoming" panels
   - Real-time updates as messages are sent/received
   - Formatted JSON for easy reading

2. **Message Structure**
   ```javascript
   // Outgoing Message Format
   {
     "URLToken": "your_token",
     "sessionId": "session_id",
     "userId": "user_id",
     "passthroughIP": "127.0.0.1",
     "resetFlow": false,
     "text": "Your message",
     "data": {}
   }

   // Incoming Message Format
   {
     "type": "output",
     "data": {
       "text": "Bot response",
       "data": {}
     }
   }
   ```

## 🛠️ Customization

### Styling
- Edit `public/styles.css` to modify:
  - Color scheme (CSS variables)
  - Layout dimensions
  - Animation timings
  - Typography

### Avatar Configuration
- Modify avatar settings in `public/app.js`:
  ```javascript
  // Change avatar style or seed
  avatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=custom'
  ```

### Message Display
- Customize message formatting in `createMessageElement` function
- Modify timestamp format using Moment.js options

## 🔧 Advanced Configuration

### Environment Variables
- `COGNIGY_ENDPOINT`: WebSocket endpoint URL
- `URL_TOKEN`: Authentication token
- `SESSION_ID`: Session identifier
- `USER_ID`: User identifier
- `PORT`: Server port (default: 3000)

### WebSocket Options
```javascript
const socket = io(endpoint, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  // Add custom options here
});
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open-source and available under the MIT License.

## 🆘 Support

For issues and feature requests:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

## 🔄 Updates

Stay tuned for updates:
- Enhanced UI components
- Additional customization options
- Performance improvements
- New features and integrations
