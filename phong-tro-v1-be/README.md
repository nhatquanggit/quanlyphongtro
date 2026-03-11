# Hệ Thống Quản Lý Phòng Trọ - Backend API

Backend RESTful API cho hệ thống quản lý phòng trọ, xây dựng với NestJS, PostgreSQL, và Prisma.

## 🚀 Tech Stack

- **Framework**: NestJS 10+
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Refresh Tokens
- **Validation**: class-validator
- **Security**: bcrypt, rate limiting

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm hoặc yarn

## ⚙️ Installation

1. Clone repository:
```bash
git clone <repository-url>
cd phong-tro-v1-be
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn
```

4. Setup database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

## 🏃 Running the App

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

Server sẽ chạy tại: `http://localhost:3000/api`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Đăng xuất

### Properties Endpoints
- `GET /api/properties` - Danh sách properties
- `GET /api/properties/:id` - Chi tiết property
- `POST /api/properties` - Tạo property mới
- `PUT /api/properties/:id` - Cập nhật property
- `DELETE /api/properties/:id` - Xóa property

### Rooms Endpoints
- `GET /api/rooms` - Danh sách phòng
- `GET /api/rooms/:id` - Chi tiết phòng
- `POST /api/rooms` - Tạo phòng mới
- `PUT /api/rooms/:id` - Cập nhật phòng
- `DELETE /api/rooms/:id` - Xóa phòng

### Tenants Endpoints (Coming soon)
### Contracts Endpoints (Coming soon)
### Invoices Endpoints (Coming soon)
### Payments Endpoints (Coming soon)
### Dashboard Endpoints (Coming soon)

## 🗄️ Database Schema

### Main Models:
- **Users** - Quản lý người dùng và authentication
- **Properties** - Tòa nhà/Cơ sở
- **Rooms** - Phòng trọ
- **Tenants** - Khách thuê
- **Contracts** - Hợp đồng
- **Invoices** - Hóa đơn
- **Payments** - Thanh toán
- **Maintenance** - Bảo trì
- **Expenses** - Chi phí
- **Reports** - Báo cáo

Xem chi tiết schema tại: `prisma/schema.prisma`

## 🔐 Authentication

API sử dụng JWT Bearer tokens. Thêm token vào header:

```
Authorization: Bearer <your-access-token>
```

Access token có thời hạn 1 ngày. Sử dụng refresh token để lấy access token mới.

## 🛠️ Development

```bash
# Prisma commands
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio

# Code quality
npm run format          # Format code với Prettier
npm run lint           # Lint code với ESLint

# Testing
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests
```

## 📁 Project Structure

```
src/
├── common/              # Shared utilities
│   └── prisma/         # Prisma service
├── modules/            # Feature modules
│   ├── auth/          # Authentication
│   ├── properties/    # Properties management
│   ├── rooms/         # Rooms management
│   ├── tenants/       # Tenants management
│   ├── contracts/     # Contracts management
│   ├── invoices/      # Invoices management
│   ├── payments/      # Payments management
│   ├── maintenance/   # Maintenance requests
│   ├── expenses/      # Expenses tracking
│   ├── dashboard/     # Dashboard analytics
│   ├── reports/       # Reports generation
│   ├── banners/       # Banner management
│   ├── notifications/ # Notifications
│   ├── files/         # File uploads
│   └── settings/      # Settings management
├── app.module.ts      # Root module
└── main.ts           # Application entry point
```

## 🔒 Security Features

- Password hashing với bcrypt (12 rounds)
- JWT authentication với refresh tokens
- Role-based access control (ADMIN, MANAGER, STAFF)
- Request validation
- Rate limiting
- CORS configuration

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License

## 👥 Contact

For any questions, please contact: [your-email]
