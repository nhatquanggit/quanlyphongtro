import { useState, useRef, useEffect, useCallback } from 'react';
import './AdminChat.css';
import type { Language } from '../translations';

/* ── Types ─────────────────────────────────── */
interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'ADMIN' | 'TENANT' | 'AI';
  text: string;
  timestamp: string;
  clientMessageId?: string;
}

interface Conversation {
  id: string;
  tenantId: string;
  tenantName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
}

interface AdminChatProps {
  lang: Language;
  userId: string;
  userName: string;
}

const WS_URL = import.meta.env.VITE_WS_URL ?? (() => {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.hostname || 'localhost';
  const port = 3001;
  return `${proto}://${host}:${port}`;
})();

const AVATAR_COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(iso: string, lang: Language) {
  const d = new Date(iso);
  return d.toLocaleTimeString(lang === 'vn' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string, lang: Language) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return lang === 'vn' ? 'Hôm nay' : 'Today';
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return lang === 'vn' ? 'Hôm qua' : 'Yesterday';
  return d.toLocaleDateString(lang === 'vn' ? 'vi-VN' : 'en-US', { day: '2-digit', month: 'short' });
}

/* ── Component ─────────────────────────────── */
const AdminChat: React.FC<AdminChatProps> = ({ lang, userId, userName }) => {
  const isVn = lang === 'vn';

  /* State */
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [isTyping, setIsTyping] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reconnectDelay = useRef(1000);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Scroll to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── WebSocket Connect ── */
  const connectRef = useRef<() => void>(() => {});
  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) return;

    setWsStatus('connecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
      reconnectDelay.current = 1000;
      // Authenticate
      ws.send(JSON.stringify({ type: 'auth', userId, userName, role: 'ADMIN' }));
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);

        switch (data.type) {
          case 'conversations':
            setConversations(data.items ?? []);
            break;

          case 'history':
            setMessages(data.messages ?? []);
            break;

          case 'message': {
            const msg: ChatMessage = data.message ?? data;
            if (activeConvId === msg.conversationId) {
              setMessages((prev) => {
                const withAck = msg.clientMessageId
                  ? prev.filter((m) => m.id !== `tmp-${msg.clientMessageId}`)
                  : prev;
                if (withAck.some((m) => m.id === msg.id)) return withAck;
                return [...withAck, msg];
              });
            }
            break;
          }

          case 'newConversation': {
            const conv: Conversation = data.conversation ?? data;
            setConversations(prev => [conv, ...prev.filter(c => c.id !== conv.id)]);
            break;
          }

          case 'typing':
            if (data.conversationId === activeConvId && data.fromRole !== 'ADMIN') {
              setIsTyping(true);
              setTimeout(() => setIsTyping(false), 2000);
            }
            break;

          case 'userStatus':
            setConversations(prev => prev.map(c => c.tenantId === data.userId ? { ...c, online: data.online } : c));
            break;
        }
      } catch { /* ignore parse errors */ }
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
      wsRef.current = null;
      // Auto-reconnect with exponential backoff
      reconnectTimer.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 15000);
        connectRef.current();
      }, reconnectDelay.current);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [userId, userName, activeConvId]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  /* Connect on mount */
  useEffect(() => {
    const timer = setTimeout(() => {
      connectRef.current();
    }, 0);
    return () => {
      clearTimeout(timer);
      clearTimeout(reconnectTimer.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  /* ── Join a conversation ── */
  const handleSelectConversation = (convId: string) => {
    setActiveConvId(convId);
    setMessages([]);
    // Mark read
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread: 0 } : c));
    // Request history
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'join', conversationId: convId }));
    }
  };

  /* ── Send message ── */
  const handleSend = () => {
    if (!inputText.trim() || !activeConvId) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const clientMessageId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      wsRef.current.send(JSON.stringify({
        type: 'message',
        conversationId: activeConvId,
        text: inputText.trim(),
        clientMessageId,
      }));
      // Optimistic update
      const optimistic: ChatMessage = {
        id: `tmp-${clientMessageId}`,
        conversationId: activeConvId,
        senderId: userId,
        senderName: userName,
        senderRole: 'ADMIN',
        text: inputText.trim(),
        timestamp: new Date().toISOString(),
        clientMessageId,
      };
      setMessages(prev => [...prev, optimistic]);
      setConversations(prev =>
        prev.map(c => c.id === activeConvId ? { ...c, lastMessage: optimistic.text, lastTime: optimistic.timestamp } : c)
      );
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Filter conversations ── */
  const filtered = conversations.filter(c =>
    c.tenantName.toLowerCase().includes(searchText.toLowerCase())
  );

  const activeConv = conversations.find(c => c.id === activeConvId);

  /* ── Render ── */
  return (
    <div className="admin-chat">
      {/* ─── Left Panel ─── */}
      <div className="admin-chat__sidebar">
        <div className="admin-chat__sidebar-header">
          <div className="admin-chat__sidebar-title">
            {isVn ? '💬 Tin nhắn' : '💬 Messages'}
          </div>
          <div className="admin-chat__sidebar-subtitle">
            {isVn
              ? `${conversations.length} cuộc hội thoại`
              : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
          </div>
        </div>

        {/* Status bar */}
        <div className={`admin-chat__status-bar admin-chat__status-bar--${wsStatus}`}>
          {wsStatus === 'connected' && (isVn ? '🟢 Đã kết nối' : '🟢 Connected')}
          {wsStatus === 'connecting' && (isVn ? '🟡 Đang kết nối...' : '🟡 Connecting...')}
          {wsStatus === 'disconnected' && (isVn ? '🔴 Mất kết nối — đang thử lại' : '🔴 Disconnected — retrying')}
        </div>

        <div className="admin-chat__search">
          <input
            type="text"
            placeholder={isVn ? 'Tìm theo tên khách...' : 'Search by name...'}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        <div className="admin-chat__conv-list">
          {filtered.length === 0 ? (
            <div className="admin-chat__empty-sidebar">
              <div className="admin-chat__empty-sidebar-icon">💬</div>
              <div>{isVn ? 'Chưa có cuộc hội thoại nào' : 'No conversations yet'}</div>
            </div>
          ) : (
            filtered.map(conv => (
              <div
                key={conv.id}
                className={`admin-chat__conv-item ${activeConvId === conv.id ? 'admin-chat__conv-item--active' : ''}`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <div
                  className={`admin-chat__conv-avatar ${conv.online ? 'admin-chat__conv-avatar--online' : ''}`}
                  style={{ background: avatarColor(conv.tenantId) }}
                >
                  {initials(conv.tenantName)}
                </div>
                <div className="admin-chat__conv-info">
                  <div className="admin-chat__conv-name">{conv.tenantName}</div>
                  <div className="admin-chat__conv-last">{conv.lastMessage}</div>
                </div>
                <div className="admin-chat__conv-meta">
                  <span className="admin-chat__conv-time">
                    {conv.lastTime ? formatDate(conv.lastTime, lang) : ''}
                  </span>
                  {conv.unread > 0 && (
                    <span className="admin-chat__conv-badge">{conv.unread}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="admin-chat__main">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="admin-chat__chat-header">
              <div className="admin-chat__chat-avatar" style={{ background: avatarColor(activeConv.tenantId) }}>
                {initials(activeConv.tenantName)}
              </div>
              <div className="admin-chat__chat-user-info">
                <div className="admin-chat__chat-user-name">{activeConv.tenantName}</div>
                <div className="admin-chat__chat-user-status">
                  <span className={`status-dot ${activeConv.online ? 'status-dot--online' : 'status-dot--offline'}`} />
                  {activeConv.online
                    ? (isVn ? 'Đang trực tuyến' : 'Online')
                    : (isVn ? 'Ngoại tuyến' : 'Offline')}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="admin-chat__messages">
              {messages.map((msg, idx) => {
                const isAdmin = msg.senderRole === 'ADMIN';
                const isAi = msg.senderRole === 'AI';
                const showDate = idx === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[idx - 1].timestamp).toDateString();
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="admin-chat__date-sep">
                        {formatDate(msg.timestamp, lang)}
                      </div>
                    )}
                    <div className={`admin-chat__msg ${isAdmin ? 'admin-chat__msg--admin' : isAi ? 'admin-chat__msg--ai' : 'admin-chat__msg--tenant'}`}>
                      <div
                        className="admin-chat__msg-avatar"
                        style={{ background: isAdmin ? '#667eea' : isAi ? '#0ea5e9' : avatarColor(msg.senderId) }}
                      >
                        {isAdmin ? '👤' : isAi ? 'AI' : initials(msg.senderName)}
                      </div>
                      <div className="admin-chat__msg-body">
                        <div className="admin-chat__msg-text">{msg.text}</div>
                        <div className="admin-chat__msg-time">{formatTime(msg.timestamp, lang)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="admin-chat__typing">
                  <span /><span /><span />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="admin-chat__input-area">
              <input
                className="admin-chat__input"
                type="text"
                placeholder={isVn ? 'Nhập tin nhắn trả lời...' : 'Type your reply...'}
                value={inputText}
                onChange={e => {
                  setInputText(e.target.value);
                  if (wsRef.current?.readyState === WebSocket.OPEN && activeConvId && !typingTimerRef.current) {
                    wsRef.current.send(JSON.stringify({ type: 'typing', conversationId: activeConvId }));
                  }
                  if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
                  typingTimerRef.current = setTimeout(() => {
                    typingTimerRef.current = null;
                  }, 900);
                }}
                onKeyDown={handleKeyDown}
              />
              <button
                className="admin-chat__send-btn"
                onClick={handleSend}
                disabled={!inputText.trim()}
                aria-label={isVn ? 'Gửi' : 'Send'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="admin-chat__empty">
            <div className="admin-chat__empty-icon">💬</div>
            <h3>{isVn ? 'Chọn cuộc hội thoại' : 'Select a conversation'}</h3>
            <p>{isVn ? 'Chọn một khách thuê bên trái để bắt đầu trò chuyện' : 'Choose a tenant from the list to start chatting'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
