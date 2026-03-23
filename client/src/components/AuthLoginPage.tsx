import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Language } from '../translations';
import './LoginPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`;
const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`;

interface LoginUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  avatar: string | null;
}

export interface LoginApiResponse {
  message: string;
  user: LoginUser;
  accessToken: string;
  refreshToken: string;
}

interface AuthLoginPageProps {
  lang: Language;
  onLoginSuccess: (payload: LoginApiResponse) => void;
  onBackToLanding?: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthLoginPage: React.FC<AuthLoginPageProps> = ({
  lang,
  onLoginSuccess,
  onBackToLanding,
  initialMode = 'login',
}) => {
  const isVn = lang === 'vn';
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'signup') {
        // Validate password match
        if (password !== confirmPassword) {
          throw new Error(isVn ? 'Mật khẩu không khớp' : 'Passwords do not match');
        }

        // Call register API
        const res = await fetch(REGISTER_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email, 
            password, 
            fullName 
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          // Handle validation errors from backend
          if (data && Array.isArray(data.message)) {
            throw new Error(data.message.join(', '));
          }
          const msg =
            (data && (data.message || data.error)) ||
            (isVn ? 'Đăng ký thất bại, vui lòng thử lại.' : 'Registration failed, please try again.');
          throw new Error(msg);
        }

        const data = (await res.json()) as LoginApiResponse;

        // Save tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        onLoginSuccess(data);
      } else {
        // Login flow
        const res = await fetch(LOGIN_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const msg =
            (data && (data.message || data.error)) ||
            (isVn ? 'Đăng nhập thất bại, vui lòng thử lại.' : 'Login failed, please try again.');
          throw new Error(msg);
        }

        const data = (await res.json()) as LoginApiResponse;

        // Save tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        onLoginSuccess(data);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : isVn
            ? 'Có lỗi xảy ra, vui lòng thử lại.'
            : 'Something went wrong, please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-card">
          <div className="login-left">
            <div className="login-left-inner">
              <div className="login-header-row">
                <div className="login-brand">
                  <div className="login-logo-mark">PP</div>
                  <div className="login-brand-text">
                    <span className="login-brand-title">Property Pro</span>
                    <span className="login-brand-sub">
                      {isVn ? 'Property Management Suite' : 'Property Management Suite'}
                    </span>
                  </div>
                </div>
                {onBackToLanding && (
                  <button
                    type="button"
                    className="login-link-muted"
                    onClick={onBackToLanding}
                  >
                    {isVn ? '← Trang giới thiệu' : '← Back to site'}
                  </button>
                )}
              </div>

              <div className="login-tabs">
                <button
                  type="button"
                  className={`login-tab ${activeTab === 'login' ? 'login-tab--active' : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  {isVn ? 'Đăng nhập' : 'Login'}
                </button>
                <button
                  type="button"
                  className={`login-tab ${activeTab === 'signup' ? 'login-tab--active' : 'login-tab--ghost'}`}
                  onClick={() => setActiveTab('signup')}
                >
                  {isVn ? 'Đăng ký' : 'Sign Up'}
                </button>
              </div>

              <div className="login-copy">
                {activeTab === 'login' ? (
                  <>
                    <h1>{isVn ? 'Chào mừng trở lại' : 'Welcome back'}</h1>
                    <p>
                      {isVn
                        ? 'Quản lý bất động sản cho thuê của bạn một cách dễ dàng.'
                        : 'Manage your rental properties with ease.'}
                    </p>
                  </>
                ) : (
                  <>
                    <h1>{isVn ? 'Tạo tài khoản mới' : 'Create your account'}</h1>
                    <p>
                      {isVn
                        ? 'Bắt đầu dùng thử miễn phí, không cần thẻ tín dụng.'
                        : 'Start your free trial — no credit card needed.'}
                    </p>
                  </>
                )}
              </div>

              <div className="login-social-row">
                <button type="button" className="login-social-btn">
                  <span>G</span>
                  <span>Google</span>
                </button>
                <button type="button" className="login-social-btn">
                  <span>f</span>
                  <span>Facebook</span>
                </button>
              </div>

              <div className="login-divider">
                <span className="login-divider-line" />
                <span className="login-divider-label">
                  {activeTab === 'login'
                    ? (isVn ? 'HOẶC ĐĂNG NHẬP BẰNG EMAIL' : 'OR EMAIL LOGIN')
                    : (isVn ? 'HOẶC ĐĂNG KÝ BẰNG EMAIL' : 'OR EMAIL SIGN UP')}
                </span>
                <span className="login-divider-line" />
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                {activeTab === 'login' ? (
                  <>
                    <label className="login-field">
                      <span className="login-label">
                        {isVn ? 'Địa chỉ Email' : 'Email Address'}
                      </span>
                      <input
                        type="email"
                        placeholder={isVn ? 'ten@congty.com' : 'name@company.com'}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </label>

                    <label className="login-field">
                      <span className="login-label">
                        {isVn ? 'Mật khẩu' : 'Password'}
                      </span>
                      <div className="login-password-wrapper">
                        <input
                          type="password"
                          placeholder="••••••••"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="login-password-toggle"
                          aria-label={isVn ? 'Hiện mật khẩu' : 'Show password'}
                        >
                          👁
                        </button>
                      </div>
                    </label>

                    <div className="login-helpers">
                      <label className="login-remember">
                        <input type="checkbox" defaultChecked />
                        <span>{isVn ? 'Ghi nhớ tôi' : 'Remember me'}</span>
                      </label>
                      <button type="button" className="login-link">
                        {isVn ? 'Quên mật khẩu?' : 'Forgot password?'}
                      </button>
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                      {loading
                        ? isVn ? 'Đang đăng nhập...' : 'Signing in...'
                        : isVn ? 'Đăng nhập vào Bảng điều khiển' : 'Log in to Dashboard'}
                    </button>
                  </>
                ) : (
                  <>
                    <label className="login-field">
                      <span className="login-label">
                        {isVn ? 'Họ và tên' : 'Full Name'}
                      </span>
                      <input
                        type="text"
                        placeholder={isVn ? 'Nguyen Van A' : 'Nguyen Van A'}
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </label>

                    <label className="login-field">
                      <span className="login-label">
                        {isVn ? 'Địa chỉ Email' : 'Email Address'}
                      </span>
                      <input
                        type="email"
                        placeholder={isVn ? 'ten@congty.com' : 'name@company.com'}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </label>

                    <label className="login-field">
                      <span className="login-label">
                        {isVn ? 'Mật khẩu' : 'Password'}
                      </span>
                      <div className="login-password-wrapper">
                        <input 
                          type="password" 
                          placeholder="••••••••" 
                          required 
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <span className="login-hint">
                        {isVn ? 'Tối thiểu 6 ký tự' : 'Minimum 6 characters'}
                      </span>
                    </label>

                    <label className="login-field">
                      <span className="login-label">
                        {isVn ? 'Nhập lại mật khẩu' : 'Confirm Password'}
                      </span>
                      <div className="login-password-wrapper">
                        <input 
                          type="password" 
                          placeholder="••••••••" 
                          required 
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </label>

                    <div className="login-helpers">
                      <label className="login-remember">
                        <input type="checkbox" required />
                        <span>
                          {isVn
                            ? 'Tôi đồng ý với Điều khoản & Chính sách bảo mật'
                            : 'I agree to the Terms & Privacy Policy'}
                        </span>
                      </label>
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                      {loading
                        ? isVn ? 'Đang tạo tài khoản...' : 'Creating account...'
                        : isVn ? 'Tạo tài khoản & vào Bảng điều khiển' : 'Create account & go to Dashboard'}
                    </button>
                  </>
                )}
              </form>

              <div className="login-footer-text">
                <span>{isVn ? 'Cần hỗ trợ?' : 'Need help?'}</span>
                <button type="button" className="login-link">
                  {isVn ? 'Liên hệ bộ phận hỗ trợ' : 'Contact Support'}
                </button>
              </div>
            </div>
          </div>

          <div className="login-right">
            <div className="login-image" />
            <div className="login-floating-card">
              <div className="login-floating-header">
                <span className="login-status-pill">
                  {isVn ? 'Được tin dùng bởi 5.000+ quản lý' : 'Trusted by 5,000+ managers'}
                </span>
              </div>
              <div className="login-floating-body">
                <h2>
                  {isVn
                    ? 'Quản lý khu trọ dễ dàng hơn'
                    : 'Effortless property management'}
                </h2>
                <p>
                  {isVn
                    ? 'Tự động thu tiền thuê, xử lý yêu cầu bảo trì và xem báo cáo tài chính trong một nền tảng duy nhất.'
                    : 'Automate rent collection, maintenance and reporting from one simple workspace.'}
                </p>
                <div className="login-metrics-row">
                  <div>
                    <div className="login-metric-label">99.9% {isVn ? 'Uptime' : 'uptime'}</div>
                    <div className="login-metric-value">99.9%</div>
                  </div>
                  <div>
                    <div className="login-metric-label">24/7 {isVn ? 'Hỗ trợ' : 'support'}</div>
                    <div className="login-metric-value">24/7</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {error && <div className="login-error-banner">{error}</div>}
    </div>
  );
};

export default AuthLoginPage;

