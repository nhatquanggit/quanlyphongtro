import http from 'node:http';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';

const PORT = 3001;

// --- Data Structures ---
// conversationId -> { id, tenantId, tenantName, messages[], lastMessage, lastTime, unread }
const conversations = new Map();

// ws -> { userId, userName, role: 'ADMIN' | 'TENANT', conversationId? }
const clients = new Map();

// --- Helper Functions ---
const broadcastToConversation = (conversationId, message, excludeWs = null) => {
    for (const [ws, client] of clients.entries()) {
        if (client.conversationId === conversationId && ws !== excludeWs) {
            if (ws.readyState === 1) { // OPEN
                ws.send(JSON.stringify(message));
            }
        }
    }
};

const broadcastToAdmins = (message) => {
    for (const [ws, client] of clients.entries()) {
        if (client.role === 'ADMIN') {
            if (ws.readyState === 1) {
                ws.send(JSON.stringify(message));
            }
        }
    }
};

const getConversationsList = () => {
    return Array.from(conversations.values()).map(conv => ({
        ...conv,
        online: Array.from(clients.values()).some(c => c.userId === conv.tenantId)
    }));
};

// --- HTTP Server ---
const server = http.createServer((req, res) => {
    // Basic CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', message: 'WebSocket Chat Server' }));
        return;
    }

    res.writeHead(404);
    res.end();
});

// --- WebSocket Server ---
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (rawData) => {
        try {
            const data = JSON.parse(rawData);
            const { type } = data;

            switch (type) {
                case 'auth':
                    handleAuth(ws, data);
                    break;
                case 'join':
                    handleJoin(ws, data);
                    break;
                case 'message':
                    handleMessage(ws, data);
                    break;
                case 'typing':
                    handleTyping(ws, data);
                    break;
                default:
                    console.log('Unknown message type:', type);
            }
        } catch (err) {
            console.error('Error processing message:', err);
        }
    });

    ws.on('close', () => {
        const client = clients.get(ws);
        if (client) {
            console.log(`User disconnected: ${client.userName} (${client.role})`);
            if (client.role === 'TENANT') {
                broadcastToAdmins({
                    type: 'userStatus',
                    userId: client.userId,
                    online: false
                });
            }
            clients.delete(ws);
        }
    });
});

// --- Protocol Handlers ---

function handleAuth(ws, { userId, userName, role }) {
    console.log(`User authenticated: ${userName} (${role})`);
    
    const clientInfo = { userId, userName, role };
    clients.set(ws, clientInfo);

    if (role === 'ADMIN') {
        ws.send(JSON.stringify({
            type: 'conversations',
            items: getConversationsList()
        }));
    } else if (role === 'TENANT') {
        // Find existing conversation or create new
        let conv = Array.from(conversations.values()).find(c => c.tenantId === userId);
        
        if (!conv) {
            const conversationId = randomUUID();
            conv = {
                id: conversationId,
                tenantId: userId,
                tenantName: userName,
                messages: [],
                lastMessage: '',
                lastTime: new Date().toISOString(),
                unread: 0
            };
            conversations.set(conversationId, conv);
        }

        clientInfo.conversationId = conv.id;
        
        ws.send(JSON.stringify({
            type: 'history',
            messages: conv.messages
        }));

        broadcastToAdmins({
            type: 'userStatus',
            userId,
            online: true
        });
    }
}

function handleJoin(ws, { conversationId }) {
    const client = clients.get(ws);
    if (client && client.role === 'ADMIN') {
        client.conversationId = conversationId;
        const conv = conversations.get(conversationId);
        
        if (conv) {
            ws.send(JSON.stringify({
                type: 'history',
                messages: conv.messages
            }));
        }
    }
}

function handleMessage(ws, { text, conversationId }) {
    const client = clients.get(ws);
    if (!client) return;

    const targetConvId = client.role === 'TENANT' ? client.conversationId : conversationId;
    const conv = conversations.get(targetConvId);

    if (!conv) return;

    const newMessage = {
        id: randomUUID(),
        conversationId: targetConvId,
        senderId: client.userId,
        senderName: client.userName,
        senderRole: client.role,
        text,
        timestamp: new Date().toISOString()
    };

    const isFirstMessage = conv.messages.length === 0;
    conv.messages.push(newMessage);
    conv.lastMessage = text;
    conv.lastTime = newMessage.timestamp;

    // Broadcast to recipients
    broadcastToConversation(targetConvId, {
        type: 'message',
        message: newMessage
    });

    if (client.role === 'TENANT' && isFirstMessage) {
        broadcastToAdmins({
            type: 'newConversation',
            conversation: {
                ...conv,
                online: true
            }
        });
    }
}

function handleTyping(ws, { conversationId }) {
    const client = clients.get(ws);
    if (!client) return;

    const targetConvId = client.role === 'TENANT' ? client.conversationId : conversationId;
    
    broadcastToConversation(targetConvId, {
        type: 'typing',
        conversationId: targetConvId
    }, ws);
}

// --- Cleanup Task ---
// Clean conversations with no messages after 1 hour
setInterval(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [id, conv] of conversations.entries()) {
        if (conv.messages.length === 0) {
            const lastTime = new Date(conv.lastTime).getTime();
            if (now - lastTime > oneHour) {
                console.log(`Cleaning up empty conversation: ${id}`);
                conversations.delete(id);
            }
        }
    }
}, 10 * 60 * 1000); // Check every 10 minutes

// --- Server Upgrade & Listen ---
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Chat Server running on http://localhost:${PORT}`);
});
