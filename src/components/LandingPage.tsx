import type { Language } from '../translations';
import './LandingPage.css';

interface LandingPageProps {
  lang: Language;
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ lang, onLoginClick, onSignUpClick }) => {
  const isVn = lang === 'vn';

  const content = {
    brand: 'Property Pro',
    heroBadge: isVn ? 'GIẢI PHÁP CHO CHỦ TRỌ' : 'THE PLATFORM FOR ROOM RENTALS',
    heroTitle: isVn
      ? 'Quản lý khu trọ\nchuyên nghiệp & tự động'
      : 'Manage your rental\nbusiness with confidence',
    heroSubtitle: isVn
      ? 'Tập trung vào khách thuê, để hệ thống lo phần còn lại. Quản lý phòng, hợp đồng, hóa đơn và báo cáo trên một màn hình trực quan.'
      : 'Streamline room bookings, tenant tracking and invoicing in one place. Purpose‑built for modern landlords and boarding house owners.',
    heroPrimary: isVn ? 'Bắt đầu dùng miễn phí' : 'Start your free trial',
    heroSecondary: isVn ? 'Xem demo' : 'Watch demo',
    trustedBy: isVn ? 'Được tin dùng bởi hơn 2.000 chủ trọ' : 'Trusted by 2,000+ landlords',
    featuresTitle: isVn ? 'Mọi thứ bạn cần để phát triển' : 'Everything you need to grow',
    featuresSubtitle: isVn
      ? 'Tối ưu vận hành khu trọ, giảm sai sót thủ công và theo dõi tình hình kinh doanh theo thời gian thực.'
      : 'Run a healthier rental portfolio with less admin and more clarity.',
    pricingTitle: isVn ? 'Gói giá linh hoạt, minh bạch' : 'Simple, transparent pricing',
    pricingSubtitle: isVn
      ? 'Chỉ trả tiền khi bạn đã sẵn sàng mở rộng. Miễn phí trong giai đoạn làm quen.'
      : 'Only pay when you are ready to scale. Free while you learn the product.',
    ctaTitle: isVn ? 'Tham gia cùng 10.000+ chủ trọ đang phát triển' : 'Join thousands of growing landlords',
    ctaSubtitle: isVn
      ? 'Bắt đầu dùng thử ngay hôm nay. Không cần thẻ tín dụng, có thể hủy bất cứ lúc nào.'
      : 'Start your free trial today. No credit card required. Cancel anytime.',
  };

  const heroTitleLines = content.heroTitle.split('\n');

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <div className="landing-logo">
            <div className="landing-logo-mark">PP</div>
            <div className="landing-logo-text">
              <span className="landing-logo-brand">{content.brand}</span>
              <span className="landing-logo-sub">
                {isVn ? 'Property Management Suite' : 'Property Management Suite'}
              </span>
            </div>
          </div>

          <nav className="landing-nav">
            <a href="#features">{isVn ? 'Tính năng' : 'Features'}</a>
            <a href="#pricing">{isVn ? 'Gói giá' : 'Pricing'}</a>
            <a href="#testimonials">{isVn ? 'Khách hàng' : 'Testimonials'}</a>
          </nav>

          <div className="landing-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={onLoginClick}
            >
              {isVn ? 'Đăng nhập' : 'Log in'}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={onSignUpClick}
            >
              {isVn ? 'Dùng thử miễn phí' : 'Get started'}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-left">
              <span className="hero-badge">{content.heroBadge}</span>
              <h1 className="hero-title">
                {heroTitleLines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </h1>
              <p className="hero-subtitle">{content.heroSubtitle}</p>

              <div className="hero-actions">
                <button
                  type="button"
                  className="btn-primary hero-cta"
                  onClick={onSignUpClick}
                >
                  {content.heroPrimary}
                </button>
                <button type="button" className="btn-secondary">
                  {content.heroSecondary}
                </button>
              </div>

              <div className="hero-meta">
                <div className="hero-avatars">
                  <div className="avatar avatar-1" />
                  <div className="avatar avatar-2" />
                  <div className="avatar avatar-3" />
                </div>
                <span className="hero-trusted">{content.trustedBy}</span>
              </div>
            </div>

            <div className="landing-hero-right">
              <div className="hero-card">
                <div className="hero-card-header">
                  <span className="hero-card-title">
                    {isVn ? 'Hiệu suất khu trọ' : 'Portfolio performance'}
                  </span>
                  <span className="hero-card-tag">
                    {isVn ? 'Tháng này' : 'This month'}
                  </span>
                </div>
                <div className="hero-metrics">
                  <div className="hero-metric">
                    <span className="metric-label">
                      {isVn ? 'Tỉ lệ lấp đầy' : 'Occupancy rate'}
                    </span>
                    <span className="metric-value">96%</span>
                    <span className="metric-trend positive">+4.2%</span>
                  </div>
                  <div className="hero-metric">
                    <span className="metric-label">
                      {isVn ? 'Doanh thu' : 'Revenue'}
                    </span>
                    <span className="metric-value">₫325M</span>
                    <span className="metric-trend positive">+18%</span>
                  </div>
                  <div className="hero-metric">
                    <span className="metric-label">
                      {isVn ? 'Hóa đơn chưa thu' : 'Outstanding invoices'}
                    </span>
                    <span className="metric-value">₫12M</span>
                    <span className="metric-trend neutral">
                      {isVn ? 'ổn định' : 'steady'}
                    </span>
                  </div>
                </div>
                <div className="hero-chart">
                  <div className="hero-chart-line" />
                  <div className="hero-chart-pills">
                    <span>{isVn ? 'Thuê phòng' : 'Bookings'}</span>
                    <span>{isVn ? 'Doanh thu' : 'Revenue'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="landing-section">
          <div className="landing-container">
            <div className="section-header">
              <h2>{content.featuresTitle}</h2>
              <p>{content.featuresSubtitle}</p>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <h3>{isVn ? 'Quản lý phòng & sơ đồ' : 'Room management'}</h3>
                <p>
                  {isVn
                    ? 'Xem nhanh số phòng trống, đã thuê, tình trạng dọn phòng và giá thuê cho từng loại phòng.'
                    : 'See occupancy, pricing and room status at a glance across every floor.'}
                </p>
              </div>
              <div className="feature-card">
                <h3>{isVn ? 'Theo dõi khách thuê' : 'Tenant tracking'}</h3>
                <p>
                  {isVn
                    ? 'Lưu trữ hợp đồng, lịch sử thanh toán và nhắc nợ tự động cho từng khách thuê.'
                    : 'Keep contracts, payment history and reminders together for every tenant.'}
                </p>
              </div>
              <div className="feature-card">
                <h3>{isVn ? 'Tự động hóa hóa đơn' : 'Automated invoicing'}</h3>
                <p>
                  {isVn
                    ? 'Tạo hóa đơn định kỳ, tính điện nước, gửi nhắc nợ qua một vài cú nhấp chuột.'
                    : 'Generate recurring invoices, utilities and reminders in a few clicks.'}
                </p>
              </div>
              <div className="feature-card">
                <h3>{isVn ? 'Báo cáo & phân tích' : 'Reports & analytics'}</h3>
                <p>
                  {isVn
                    ? 'Nắm bắt doanh thu, chi phí, công nợ và tỉ lệ lấp đầy theo thời gian thực.'
                    : 'Understand revenue, expenses and occupancy in real time.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="landing-section landing-pricing">
          <div className="landing-container">
            <div className="section-header">
              <h2>{content.pricingTitle}</h2>
              <p>{content.pricingSubtitle}</p>
            </div>
            <div className="pricing-grid">
              <div className="pricing-card">
                <span className="pricing-badge">
                  {isVn ? 'Bắt đầu' : 'Starter'}
                </span>
                <h3>Free</h3>
                <p className="pricing-sub">
                  {isVn
                    ? 'Quản lý tối đa 20 phòng — phù hợp cho nhà trọ nhỏ.'
                    : 'Up to 20 rooms — perfect for small portfolios.'}
                </p>
                <ul>
                  <li>{isVn ? 'Quản lý phòng cơ bản' : 'Core room management'}</li>
                  <li>{isVn ? 'Quản lý khách thuê' : 'Tenant directory'}</li>
                  <li>{isVn ? 'Báo cáo tổng quan' : 'Summary reports'}</li>
                </ul>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={onSignUpClick}
                >
                  {isVn ? 'Dùng miễn phí' : 'Get started'}
                </button>
              </div>

              <div className="pricing-card pricing-card-featured">
                <span className="pricing-pill">
                  {isVn ? 'Phổ biến nhất' : 'Most popular'}
                </span>
                <span className="pricing-badge">
                  {isVn ? 'Chuyên nghiệp' : 'Professional'}
                </span>
                <h3>
                  ₫{isVn ? '499.000' : '499k'}
                  <span className="pricing-cycle">
                    /{isVn ? 'tháng' : 'month'}
                  </span>
                </h3>
                <p className="pricing-sub">
                  {isVn
                    ? 'Quản lý toàn bộ khu trọ với tự động hóa hóa đơn và nhắc nợ.'
                    : 'Complete automation for growing portfolios.'}
                </p>
                <ul>
                  <li>
                    {isVn ? 'Số phòng không giới hạn' : 'Unlimited rooms'}
                  </li>
                  <li>
                    {isVn ? 'Hóa đơn & nhắc nợ tự động' : 'Automated invoicing & reminders'}
                  </li>
                  <li>
                    {isVn ? 'Báo cáo chi tiết' : 'Detailed financial reports'}
                  </li>
                  <li>
                    {isVn ? 'Hỗ trợ ưu tiên' : 'Priority support'}
                  </li>
                </ul>
                <button
                  type="button"
                  className="btn-primary btn-full"
                  onClick={onSignUpClick}
                >
                  {isVn ? 'Chọn gói này' : 'Choose plan'}
                </button>
              </div>

              <div className="pricing-card">
                <span className="pricing-badge">
                  {isVn ? 'Doanh nghiệp' : 'Enterprise'}
                </span>
                <h3>{isVn ? 'Liên hệ' : 'Contact us'}</h3>
                <p className="pricing-sub">
                  {isVn
                    ? 'Tùy chỉnh theo hệ thống chuỗi phòng trọ, nhiều chi nhánh.'
                    : 'Custom solutions for large operators and chains.'}
                </p>
                <ul>
                  <li>{isVn ? 'Triển khai & đào tạo' : 'Onboarding & training'}</li>
                  <li>{isVn ? 'Tích hợp hệ thống' : 'System integrations'}</li>
                  <li>{isVn ? 'Chuyên gia tư vấn' : 'Dedicated success team'}</li>
                </ul>
                <button type="button" className="btn-outline">
                  {isVn ? 'Liên hệ tư vấn' : 'Talk to sales'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="landing-section landing-testimonials">
          <div className="landing-container">
            <div className="testimonials-grid">
              <div className="testimonial-intro">
                <h2>{isVn ? 'Được chủ trọ tin tưởng' : 'Trusted by landlords everywhere'}</h2>
                <p>
                  {isVn
                    ? 'Từ dãy trọ 20 phòng đến khu phức hợp hàng trăm phòng, Property Pro giúp chủ trọ kiểm soát kinh doanh tốt hơn.'
                    : 'From small boarding houses to multi‑building portfolios, Property Pro keeps operations on track.'}
                </p>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-text">
                  {isVn
                    ? '“Tôi tiết kiệm được hơn 5 giờ mỗi tuần vì không phải ghi chép sổ sách thủ công.”'
                    : '"I save 5+ hours every week no longer chasing spreadsheets and paper notes."'}
                </p>
                <p className="testimonial-author">
                  {isVn ? 'Anh Hưng — Chủ 3 dãy trọ tại TP.HCM' : 'Hung, 3‑building landlord in Ho Chi Minh City'}
                </p>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-text">
                  {isVn
                    ? '“Hóa đơn, công nợ và lịch sử khách thuê đều rõ ràng. Nhắc nợ cũng chuyên nghiệp hơn hẳn.”'
                    : '"Invoices, debt and tenant history are all in one place. Collections feel much more professional."'}
                </p>
                <p className="testimonial-author">
                  {isVn ? 'Chị Lan — Kinh doanh khu trọ gia đình' : 'Lan, family‑run boarding house owner'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-cta">
          <div className="landing-container cta-inner">
            <div>
              <h2>{content.ctaTitle}</h2>
              <p>{content.ctaSubtitle}</p>
            </div>
            <div className="cta-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={onSignUpClick}
              >
                {isVn ? 'Bắt đầu ngay' : 'Get started now'}
              </button>
              <button type="button" className="btn-secondary">
                {isVn ? 'Yêu cầu demo' : 'Request demo'}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">PP</span>
            <span className="footer-copy">
              © {new Date().getFullYear()} Property Pro.{' '}
              {isVn ? 'Mọi quyền được bảo lưu.' : 'All rights reserved.'}
            </span>
          </div>
          <div className="footer-links">
            <a href="#features">{isVn ? 'Tính năng' : 'Features'}</a>
            <a href="#pricing">{isVn ? 'Gói giá' : 'Pricing'}</a>
            <a href="#testimonials">{isVn ? 'Khách hàng' : 'Customers'}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

