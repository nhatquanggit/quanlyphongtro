import { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBox.css';
import type { Language } from '../translations';
import { CHAT_WS_URL } from '../api/realtime';

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

interface ChatBoxProps {
  lang: Language;
  userId: string;
  userName: string;
}

/* ── Component ─────────────────────────────── */
const ChatBox: React.FC<ChatBoxProps> = ({ lang, userId, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [unreadCount, setUnreadCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reconnectDelay = useRef(1000);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVn = lang === 'vn';

  /* ── Scroll to bottom ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Focus input when opened ── */
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  /* ── WebSocket Connection ── */
  const connectRef = useRef<() => void>(() => {});
  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) return;

    setWsStatus('connecting');
    const ws = new WebSocket(CHAT_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
      reconnectDelay.current = 1000;
      // Authenticate
      ws.send(JSON.stringify({ type: 'auth', userId, userName, role: 'TENANT' }));
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);

        switch (data.type) {
          case 'history':
            setMessages(data.messages ?? []);
            break;

          case 'message': {
            const msg: ChatMessage = data.message ?? data;
            setMessages(prev => {
              const withAck = msg.clientMessageId
                ? prev.filter((m) => m.id !== `tmp-${msg.clientMessageId}`)
                : prev;
              if (withAck.some((m) => m.id === msg.id)) return withAck;
              return [...withAck, msg];
            });
            if (!isOpen && msg.senderId !== userId && msg.senderRole !== 'TENANT') {
              setUnreadCount(prev => prev + 1);
            }
            break;
          }

          case 'typing':
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 2000);
            break;
        }
      } catch { /* ignore parse errors */ }
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
      wsRef.current = null;
      reconnectTimer.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 15000);
        connectRef.current();
      }, reconnectDelay.current);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [userId, userName, isOpen]);

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

  /* ── Send message ── */
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const clientMessageId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      wsRef.current.send(JSON.stringify({
        type: 'message',
        text: inputText.trim(),
        clientMessageId,
      }));
      // Optimistic update
      const optimistic: ChatMessage = {
        id: `tmp-${clientMessageId}`,
        conversationId: '',
        senderId: userId,
        senderName: userName,
        senderRole: 'TENANT',
        text: inputText.trim(),
        timestamp: new Date().toISOString(),
        clientMessageId,
      };
      setMessages(prev => [...prev, optimistic]);
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) setUnreadCount(0);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(isVn ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbox-window">
          {/* Header */}
          <div className="chatbox-header">
            <div className="chatbox-header-info">
              <div className="chatbox-avatar">
                <span className="chatbox-avatar-icon">👤</span>
                <span className={`chatbox-status-dot ${wsStatus === 'connected' ? '' : 'chatbox-status-dot--offline'}`} />
              </div>
              <div className="chatbox-header-text">
                <div className="chatbox-title">
                  {isVn ? 'Chat với Admin' : 'Chat with Admin'}
                </div>
                <div className="chatbox-subtitle">
                  {wsStatus === 'connected'
                    ? (isVn ? 'Đang trực tuyến' : 'Online')
                    : wsStatus === 'connecting'
                      ? (isVn ? 'Đang kết nối...' : 'Connecting...')
                      : (isVn ? 'Mất kết nối' : 'Disconnected')}
                </div>
              </div>
            </div>
            <button className="chatbox-close-btn" onClick={toggleChat} aria-label={isVn ? 'Đóng chat' : 'Close chat'}>
              ✕
            </button>
          </div>

          {/* Connection Status */}
          {wsStatus === 'disconnected' && (
            <div className="chatbox-status-bar chatbox-status-bar--disconnected">
              {isVn ? '⚠️ Mất kết nối — đang thử kết nối lại...' : '⚠️ Disconnected — reconnecting...'}
            </div>
          )}

          {/* Messages */}
          <div className="chatbox-messages">
            {messages.length === 0 && wsStatus === 'connected' && (
              <div className="chatbox-message chatbox-message-ai">
                <div className="chatbox-message-avatar">👤</div>
                <div className="chatbox-message-content">
                  <div className="chatbox-message-text">
                    {isVn
                      ? 'Xin chào! Bạn cần hỗ trợ gì? Hãy gửi tin nhắn cho admin.'
                      : 'Hello! How can we help you? Send a message to the admin.'}
                  </div>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbox-message ${
                  message.senderRole === 'TENANT' ? 'chatbox-message-user' : 'chatbox-message-ai'
                }`}
              >
                {message.senderRole === 'ADMIN' && (
                  <div className="chatbox-message-avatar">👤</div>
                )}
                <div className="chatbox-message-content">
                  <div className="chatbox-message-text">{message.text}</div>
                  <div className="chatbox-message-time">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chatbox-message chatbox-message-ai">
                <div className="chatbox-message-avatar">👤</div>
                <div className="chatbox-message-content">
                  <div className="chatbox-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbox-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chatbox-input"
              placeholder={isVn ? 'Nhập tin nhắn...' : 'Type your message...'}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (wsRef.current?.readyState === WebSocket.OPEN && !typingTimerRef.current) {
                  wsRef.current.send(JSON.stringify({ type: 'typing' }));
                }
                if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
                typingTimerRef.current = setTimeout(() => {
                  typingTimerRef.current = null;
                }, 900);
              }}
              onKeyDown={handleKeyPress}
              disabled={wsStatus !== 'connected'}
            />
            <button
              className="chatbox-send-btn"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || wsStatus !== 'connected'}
              aria-label={isVn ? 'Gửi tin nhắn' : 'Send message'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className={`chatbox-float-btn ${isOpen ? 'chatbox-float-btn-open' : ''}`}
        onClick={toggleChat}
        aria-label={isVn ? 'Mở chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {unreadCount > 0 && (
              <span className="chatbox-notification-badge">{unreadCount}</span>
            )}
          </>
        )}
      </button>
    </>
  );
};

export default ChatBox;
