import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.CHAT_PORT ?? 3001);
const AI_ENABLED = (process.env.CHAT_AI_ENABLED ?? 'true').toLowerCase() !== 'false';
const AI_NAME = process.env.CHAT_AI_NAME ?? 'Tro ly AI';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '.data');
const STORE_FILE = path.join(DATA_DIR, 'chat-store.json');

// conversationId -> { id, tenantId, tenantName, messages[], lastMessage, lastTime, unread }
const conversations = new Map();

// ws -> { userId, userName, role: 'ADMIN' | 'TENANT', conversationId? }
const clients = new Map();

let saveTimer = null;

const nowIso = () => new Date().toISOString();

const ensureStoreDir = async () => {
  if (!fs.existsSync(DATA_DIR)) {
    await fsp.mkdir(DATA_DIR, { recursive: true });
  }
};

const sanitizeText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const listConversations = () =>
  Array.from(conversations.values())
    .map((conv) => ({
      id: conv.id,
      tenantId: conv.tenantId,
      tenantName: conv.tenantName,
      lastMessage: conv.lastMessage,
      lastTime: conv.lastTime,
      unread: conv.unread,
      online: Array.from(clients.values()).some((c) => c.role === 'TENANT' && c.userId === conv.tenantId),
    }))
    .sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());

const scheduleSave = () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await ensureStoreDir();
      const data = {
        conversations: Array.from(conversations.values()),
        savedAt: nowIso(),
      };
      await fsp.writeFile(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to persist chat store:', err);
    }
  }, 300);
};

const loadStore = async () => {
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const raw = await fsp.readFile(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.conversations) ? parsed.conversations : [];

    for (const conv of items) {
      if (!conv?.id || !conv?.tenantId) continue;
      conversations.set(conv.id, {
        id: conv.id,
        tenantId: conv.tenantId,
        tenantName: conv.tenantName || 'Tenant',
        messages: Array.isArray(conv.messages) ? conv.messages.slice(-500) : [],
        lastMessage: conv.lastMessage || '',
        lastTime: conv.lastTime || nowIso(),
        unread: Number.isFinite(conv.unread) ? conv.unread : 0,
      });
    }

    console.log(`Loaded ${conversations.size} conversations from store`);
  } catch (err) {
    console.error('Failed to load chat store:', err);
  }
};

const send = (ws, payload) => {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(payload));
  }
};

const sendConversationsToAdmins = () => {
  const items = listConversations();
  for (const [ws, client] of clients.entries()) {
    if (client.role === 'ADMIN') {
      send(ws, { type: 'conversations', items });
    }
  }
};

const broadcastToConversation = (conversationId, message, excludeWs = null) => {
  for (const [ws, client] of clients.entries()) {
    if (client.conversationId === conversationId && ws !== excludeWs) {
      send(ws, message);
    }
  }
};

const upsertConversationForTenant = (tenantId, tenantName) => {
  let conv = Array.from(conversations.values()).find((c) => c.tenantId === tenantId);

  if (!conv) {
    const id = randomUUID();
    conv = {
      id,
      tenantId,
      tenantName,
      messages: [],
      lastMessage: '',
      lastTime: nowIso(),
      unread: 0,
    };
    conversations.set(id, conv);
    scheduleSave();
  }

  if (tenantName && conv.tenantName !== tenantName) {
    conv.tenantName = tenantName;
    scheduleSave();
  }

  return conv;
};

const makeAiReply = (text) => {
  const lower = text.toLowerCase();

  if (/(mat\s*dien|khong\s*co\s*dien|dien\s*yeu|mất\s*điện|điện\s*yếu)/i.test(lower)) {
    return 'Da nhan thong tin su co dien. Ban thu kiem tra aptomat trong phong, neu van loi thi admin se tao phieu bao tri uu tien trong it phut toi.';
  }
  if (/(nuoc|roi\s*nuoc|ro\s*ri|mất\s*nước|nước\s*yếu)/i.test(lower)) {
    return 'Da ghi nhan van de nuoc. Ban vui long mo ta them vi tri su co (nha tam, bep, bon rua) de bo phan ky thuat xu ly nhanh hon.';
  }
  if (/(hoa\s*don|invoice|tien\s*phong|thanh\s*toan|tiền\s*phòng)/i.test(lower)) {
    return 'Ban co the xem muc Hoa don de kiem tra so tien va han thanh toan. Neu can doi so cong to, admin se phan hoi lai trong khung chat nay.';
  }
  if (/(hop\s*dong|gia\s*han|ket\s*thuc|hợp\s*đồng|gia\s*hạn)/i.test(lower)) {
    return 'Da nhan yeu cau ve hop dong. Admin se lien he de ho tro gia han/cham dut theo dieu khoan hien tai trong hop dong cua ban.';
  }
  if (/(xin\s*chao|hello|hi|chao|alo|ad\s*oi|admin)/i.test(lower)) {
    return 'Xin chao! Toi la tro ly tu dong. Ban cu mo ta van de can ho tro, admin se tiep nhan va phan hoi som.';
  }

  return 'Tro ly da nhan tin nhan cua ban. Admin se phan hoi som. Neu gap su co khan cap, ban hay ghi ro phong va muc do uu tien (cao/trung binh/thap).';
};

const pushMessage = ({ conv, senderId, senderName, senderRole, text, clientMessageId = null }) => {
  const message = {
    id: randomUUID(),
    conversationId: conv.id,
    senderId,
    senderName,
    senderRole,
    text,
    clientMessageId,
    timestamp: nowIso(),
  };

  conv.messages.push(message);
  if (conv.messages.length > 500) {
    conv.messages = conv.messages.slice(-500);
  }
  conv.lastMessage = text;
  conv.lastTime = message.timestamp;

  scheduleSave();

  return message;
};

const scheduleAiReply = (conv, tenantText) => {
  if (!AI_ENABLED) return;

  setTimeout(() => {
    const latest = conversations.get(conv.id);
    if (!latest) return;

    // Do not spam AI if admin just replied very recently.
    const adminRecent = [...latest.messages]
      .reverse()
      .find((m) => m.senderRole === 'ADMIN');

    if (adminRecent) {
      const diff = Date.now() - new Date(adminRecent.timestamp).getTime();
      if (diff < 25000) {
        return;
      }
    }

    const aiText = makeAiReply(tenantText);
    const aiMessage = pushMessage({
      conv: latest,
      senderId: 'ai-assistant',
      senderName: AI_NAME,
      senderRole: 'AI',
      text: aiText,
    });

    broadcastToConversation(latest.id, {
      type: 'message',
      message: aiMessage,
    });

    sendConversationsToAdmins();
  }, 1200);
};

// --- HTTP server (health only) ---
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'chat-ws',
        aiEnabled: AI_ENABLED,
        conversations: conversations.size,
      }),
    );
    return;
  }

  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (rawData) => {
    try {
      const payload = Buffer.isBuffer(rawData) ? rawData.toString('utf8') : String(rawData);
      const data = JSON.parse(payload);

      switch (data.type) {
        case 'auth': {
          const userId = sanitizeText(data.userId);
          const userName = sanitizeText(data.userName) || 'User';
          const role = data.role === 'ADMIN' ? 'ADMIN' : 'TENANT';

          const clientInfo = { userId, userName, role, conversationId: null };
          clients.set(ws, clientInfo);

          if (role === 'ADMIN') {
            send(ws, { type: 'conversations', items: listConversations() });
          } else {
            const conv = upsertConversationForTenant(userId, userName);
            clientInfo.conversationId = conv.id;

            send(ws, {
              type: 'history',
              conversationId: conv.id,
              messages: conv.messages,
            });

            sendConversationsToAdmins();
          }
          break;
        }

        case 'join': {
          const client = clients.get(ws);
          if (!client || client.role !== 'ADMIN') break;

          const conversationId = sanitizeText(data.conversationId);
          const conv = conversations.get(conversationId);
          if (!conv) break;

          client.conversationId = conversationId;
          conv.unread = 0;

          send(ws, {
            type: 'history',
            conversationId,
            messages: conv.messages,
          });

          sendConversationsToAdmins();
          scheduleSave();
          break;
        }

        case 'message': {
          const client = clients.get(ws);
          if (!client) break;

          const text = sanitizeText(data.text);
          if (!text) break;

          const conversationId =
            client.role === 'TENANT'
              ? client.conversationId
              : sanitizeText(data.conversationId || client.conversationId);

          if (!conversationId) break;

          const conv = conversations.get(conversationId);
          if (!conv) break;

          const message = pushMessage({
            conv,
            senderId: client.userId,
            senderName: client.userName,
            senderRole: client.role,
            text,
            clientMessageId: sanitizeText(data.clientMessageId || ''),
          });

          if (client.role === 'TENANT') {
            conv.unread += 1;
          }

          if (client.role === 'ADMIN') {
            conv.unread = 0;
          }

          broadcastToConversation(conversationId, {
            type: 'message',
            message,
          });

          sendConversationsToAdmins();

          if (client.role === 'TENANT') {
            scheduleAiReply(conv, text);
          }

          break;
        }

        case 'typing': {
          const client = clients.get(ws);
          if (!client) break;

          const conversationId =
            client.role === 'TENANT'
              ? client.conversationId
              : sanitizeText(data.conversationId || client.conversationId);

          if (!conversationId) break;

          broadcastToConversation(
            conversationId,
            {
              type: 'typing',
              conversationId,
              fromRole: client.role,
            },
            ws,
          );

          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('Error processing ws payload:', err);
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    clients.delete(ws);

    if (client?.role === 'TENANT') {
      sendConversationsToAdmins();
    }
  });
});

// Heartbeat for dead connections
const heartbeatTimer = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

await loadStore();

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
  console.log(`AI auto reply: ${AI_ENABLED ? 'enabled' : 'disabled'}`);
});

const shutdown = async () => {
  clearInterval(heartbeatTimer);
  if (saveTimer) clearTimeout(saveTimer);

  try {
    await ensureStoreDir();
    const data = {
      conversations: Array.from(conversations.values()),
      savedAt: nowIso(),
    };
    await fsp.writeFile(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to flush chat store on shutdown:', err);
  }

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
