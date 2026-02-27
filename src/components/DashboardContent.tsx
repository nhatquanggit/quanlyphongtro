import React, { useState, useEffect, useRef } from 'react';
import './DashboardContent.css';
import { translations } from '../translations';
import type { Language } from '../translations';
import { 
  DoorOpen, 
  Users, 
  ClipboardList, 
  FileText, 
  ArrowUpRight,
  Wrench,
  AlertTriangle,
  Droplets,
  Zap,
  ChevronRight,
  DollarSign,
  User,
  Home,
  Upload,
  X
} from 'lucide-react';

const iconSize = 24;

interface DashboardProps {
  lang: Language;
  onNavigate: (page: string) => void;
}

const DashboardContent: React.FC<DashboardProps> = ({ lang, onNavigate }) => {
  const tDash = translations[lang].dashboard;
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHoveringBanner, setIsHoveringBanner] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 10;
  const SLIDE_INTERVAL = 3000; // 3 seconds

  // Load banner images from localStorage on mount
  useEffect(() => {
    const savedBanners = localStorage.getItem('dashboardBannerImages');
    if (savedBanners) {
      try {
        const parsed = JSON.parse(savedBanners);
        setBannerImages(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse banner images', e);
      }
    }
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    if (bannerImages.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [bannerImages.length, isPaused]);

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - bannerImages.length;
    if (remainingSlots <= 0) {
      alert(lang === 'vn' ? `Đã đạt giới hạn ${MAX_IMAGES} ảnh!` : `Maximum ${MAX_IMAGES} images reached!`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newImages: string[] = [];
    let processed = 0;

    filesToProcess.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(lang === 'vn' ? `File ${file.name} không phải hình ảnh!` : `File ${file.name} is not an image!`);
        processed++;
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(lang === 'vn' ? `File ${file.name} quá lớn (>5MB)!` : `File ${file.name} is too large (>5MB)!`);
        processed++;
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        processed++;

        if (processed === filesToProcess.length) {
          const updatedImages = [...bannerImages, ...newImages];
          setBannerImages(updatedImages);
          localStorage.setItem('dashboardBannerImages', JSON.stringify(updatedImages));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const updated = bannerImages.filter((_, i) => i !== index);
    setBannerImages(updated);
    localStorage.setItem('dashboardBannerImages', JSON.stringify(updated));
    
    // Adjust current slide if needed
    if (currentSlide >= updated.length && updated.length > 0) {
      setCurrentSlide(updated.length - 1);
    } else if (updated.length === 0) {
      setCurrentSlide(0);
    }
  };

  const handleRemoveAllImages = () => {
    setBannerImages([]);
    localStorage.removeItem('dashboardBannerImages');
    setCurrentSlide(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const currentBannerImage = bannerImages[currentSlide];

  return (
    <div className="dashboard-grid">
      {/* KPI Row - Operational Focus */}
      <div className="dashboard-kpi-row">
        {/* Card 1: Rooms */}
        <div className="kpi-card kpi-modern" onClick={() => onNavigate('room-management')}>
          <div className="kpi-top-row">
            <div className="kpi-icon-box-modern kpi-blue">
              <DoorOpen size={iconSize} />
            </div>
            <div className="kpi-trend-badge positive">
              45/50
            </div>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">{tDash.totalRooms}</div>
            <div className="kpi-sub-text">
              <span className="text-success">5 {tDash.available}</span> • 45 {tDash.occupied}
            </div>
          </div>
        </div>

        {/* Card 2: Tenants */}
        <div className="kpi-card kpi-modern" onClick={() => onNavigate('tenants')}>
          <div className="kpi-top-row">
            <div className="kpi-icon-box-modern kpi-green">
              <Users size={iconSize} />
            </div>
            <div className="kpi-trend-badge positive">
              +3 <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">{tDash.totalTenants}</div>
            <div className="kpi-sub-text">
              48 {tDash.active} • <span className="text-warning">2 {tDash.expiringSoon}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Requests */}
        <div className="kpi-card kpi-modern" onClick={() => onNavigate('maintenance')}>
          <div className="kpi-top-row">
            <div className="kpi-icon-box-modern kpi-orange">
              <ClipboardList size={iconSize} />
            </div>
            {/* Show badge only if there are requests */}
            <div className="kpi-trend-badge negative">
              3
            </div>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">{tDash.pendingRequests}</div>
            <div className="kpi-sub-text">
              2 High Priority
            </div>
          </div>
        </div>

        {/* Card 4: Unpaid Invoices */}
        <div className="kpi-card kpi-modern" onClick={() => onNavigate('invoices')}>
          <div className="kpi-top-row">
            <div className="kpi-icon-box-modern kpi-red">
              <FileText size={iconSize} />
            </div>
            <div className="kpi-trend-badge negative">
              5
            </div>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">{tDash.unpaidInvoices}</div>
            <div className="kpi-sub-text">
              $1,200.00 {tDash.outstanding}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Banner - Carousel */}
        <div 
          className="dashboard-banner banner-carousel"
          style={currentBannerImage ? {
            backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.3) 100%), url(${currentBannerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
          onMouseEnter={() => { setIsHoveringBanner(true); setIsPaused(true); }}
          onMouseLeave={() => { setIsHoveringBanner(false); setIsPaused(false); }}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            multiple
            onChange={handleBannerUpload}
            style={{ display: 'none' }}
          />
          
          <div className="banner-content">
            <h1 className="banner-title">{tDash.welcome}</h1>
            <p className="banner-subtitle">{tDash.welcomeSub}</p>
            
            {/* Image counter */}
            {bannerImages.length > 0 && (
              <div className="banner-counter">
                {currentSlide + 1} / {bannerImages.length}
              </div>
            )}
          </div>
          
          <div className="banner-decoration">
            <div className="banner-icon-circle">
              <Home size={40} />
            </div>
          </div>
          
          {/* Upload/Remove buttons */}
          <div className={`banner-controls ${isHoveringBanner ? 'visible' : ''}`}>
            {bannerImages.length < MAX_IMAGES && (
              <button 
                className="banner-control-btn upload-btn"
                onClick={triggerFileInput}
                title={lang === 'vn' ? `Thêm ảnh (${bannerImages.length}/${MAX_IMAGES})` : `Add image (${bannerImages.length}/${MAX_IMAGES})`}
              >
                <Upload size={18} />
                <span>{lang === 'vn' ? `Thêm (${bannerImages.length}/${MAX_IMAGES})` : `Add (${bannerImages.length}/${MAX_IMAGES})`}</span>
              </button>
            )}
            {bannerImages.length > 0 && (
              <button 
                className="banner-control-btn remove-btn"
                onClick={handleRemoveAllImages}
                title={lang === 'vn' ? 'Xóa tất cả ảnh' : 'Remove all images'}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Navigation arrows */}
          {bannerImages.length > 1 && (
            <>
              <button 
                className="banner-arrow banner-arrow-left"
                onClick={prevSlide}
                title={lang === 'vn' ? 'Ảnh trước' : 'Previous'}
              >
                <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} />
              </button>
              <button 
                className="banner-arrow banner-arrow-right"
                onClick={nextSlide}
                title={lang === 'vn' ? 'Ảnh sau' : 'Next'}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Navigation dots */}
          {bannerImages.length > 1 && (
            <div className="banner-dots">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  className={`banner-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  title={`${lang === 'vn' ? 'Ảnh' : 'Image'} ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnails preview */}
          {bannerImages.length > 0 && isHoveringBanner && (
            <div className="banner-thumbnails">
              {bannerImages.map((img, index) => (
                <div
                  key={index}
                  className={`banner-thumbnail ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  style={{ backgroundImage: `url(${img})` }}
                >
                  <button
                    className="thumbnail-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    title={lang === 'vn' ? 'Xóa ảnh này' : 'Remove this image'}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Main Content Row (Alerts & Activity) */}
      <div className="dashboard-main-row">
        <div className="dashboard-alerts-col">
          <div className="alerts-header-row">
            <span className="alerts-title">
              <AlertTriangle size={20} strokeWidth={2} className="alerts-warning-icon" />
              {lang === 'vn' ? 'Thông báo bảo trì khẩn cấp' : lang === 'zh' ? '紧急维修通知' : 'Urgent Maintenance Alerts'}
            </span>
            <button className="alerts-link-btn" onClick={() => onNavigate('maintenance')}>
              {lang === 'vn' ? 'Xem tất cả' : lang === 'zh' ? '查看全部' : 'View All Tickets'}
            </button>
          </div>
          <div className="alert-card alert-critical" onClick={() => onNavigate('maintenance')}>
            <div className="alert-icon-circle"><Droplets size={22} strokeWidth={2} /></div>
            <div className="alert-info">
              <div className="alert-title">{lang === 'vn' ? 'Vỡ ống nước - Phòng 302' : lang === 'zh' ? '爆管 - 302室' : 'Burst Pipe - Room 302'}</div>
              <div className="alert-meta">{lang === 'vn' ? 'Báo cáo bởi Jane Smith • 15 phút trước' : lang === 'zh' ? 'Jane Smith 报告 • 15 分钟前' : 'Reported by Jane Smith • 15 mins ago'}</div>
            </div>
            <div className="alert-action">
              <ChevronRight size={18} />
            </div>
          </div>

          <div className="alert-card alert-warning" onClick={() => onNavigate('maintenance')}>
            <div className="alert-icon-circle"><Zap size={22} strokeWidth={2} /></div>
            <div className="alert-info">
              <div className="alert-title">{lang === 'vn' ? 'Mất điện cục bộ - Tầng 2' : lang === 'zh' ? '局部停电 - 2楼' : 'Power Outage - Floor 2'}</div>
              <div className="alert-meta">{lang === 'vn' ? 'Báo cáo tự động • 1 giờ trước' : lang === 'zh' ? '自动报告 • 1 小时前' : 'Automated Report • 1 hr ago'}</div>
            </div>
            <div className="alert-action">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>

        <div className="dashboard-activity-col">
          <div className="activity-header">
            <h3>{lang === 'vn' ? 'Hoạt động gần đây' : lang === 'zh' ? '最近活动' : 'Recent Activity'}</h3>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon payment"><DollarSign size={16} /></div>
              <div className="activity-content">
                <div className="activity-text">
                  <strong>John Doe</strong> {lang === 'vn' ? 'đã thanh toán hóa đơn tháng 10' : 'paid October Invoice'}
                </div>
                <div className="activity-time">2 mins ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon new-tenant"><User size={16} /></div>
              <div className="activity-content">
                <div className="activity-text">
                  {lang === 'vn' ? 'Khách mới' : 'New tenant'} <strong>Sarah Connor</strong> {lang === 'vn' ? 'đã nhận phòng 101' : 'checked in Room 101'}
                </div>
                <div className="activity-time">2 hours ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon maintenance"><Wrench size={16} /></div>
              <div className="activity-content">
                <div className="activity-text">
                  {lang === 'vn' ? 'Bảo trì máy lạnh phòng 205 hoàn tất' : 'AC maintenance in Room 205 completed'}
                </div>
                <div className="activity-time">5 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
