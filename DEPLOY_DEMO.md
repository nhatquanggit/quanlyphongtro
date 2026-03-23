# Deploy Demo

Phuong an nay dung 1 VPS chay Docker Compose cho toan bo he thong:

- `web`: frontend React + reverse proxy `/api`, `/uploads`, `/swagger`, `/ws`
- `api`: NestJS REST API
- `chat`: WebSocket chat server
- `db`: SQL Server

## 1. Chuan bi VPS

- Ubuntu 22.04 hoac 24.04
- Mo cong `80` tren firewall/security group
- Cai Docker va Docker Compose plugin

Lenh cai nhanh tren Ubuntu:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## 1.1 Gan domain nhatquang.building vao VPS

Tai nha cung cap domain (hoac Cloudflare DNS), tao ban ghi:

- `A` -> `@` tro den IP public cua VPS
- `A` -> `www` tro den IP public cua VPS (khuyen nghi)

Kiem tra DNS da tro dung:

```bash
nslookup nhatquang.building
nslookup www.nhatquang.building
```

## 2. Dua source len server

```bash
git clone <repo-url> phong-tro-v1
cd phong-tro-v1
cp .env.demo.example .env
```

Sua file `.env`:

- `APP_ORIGIN`: dat thanh `https://nhatquang.building`
- `MSSQL_SA_PASSWORD`: mat khau SQL Server manh
- `JWT_SECRET`, `JWT_REFRESH_SECRET`: chuoi bi mat moi

## 3. Build va chay demo

```bash
docker compose --env-file .env -f docker-compose.demo.yml up -d --build
```

Truy cap:

- Trang web: `http://nhatquang.building`
- Swagger: `http://nhatquang.building/swagger`

## 4. Nap schema database

Sau khi container `db` va `api` da len, chay:

```bash
docker compose --env-file .env -f docker-compose.demo.yml exec api npx prisma db push
```

Neu ban co script SQL goc va muon dung dung schema hien tai, co the import `server/sql/init.sql` vao SQL Server thay cho `prisma db push`.

## 5. Lenh quan trong

Xem log:

```bash
docker compose --env-file .env -f docker-compose.demo.yml logs -f web api chat db
```

Dung he thong:

```bash
docker compose --env-file .env -f docker-compose.demo.yml down
```

Dung he thong va xoa volume database:

```bash
docker compose --env-file .env -f docker-compose.demo.yml down -v
```

## 6. SSL va domain

Ban co 2 cach:

- Cach nhanh: dat Nginx Proxy Manager/Cloudflare phia truoc VPS
- Cach gon: thay container `web` bang Caddy/Nginx co SSL

### Cach nhanh nhat de co HTTPS cho nhatquang.building

Neu dung Cloudflare:

1. Bat Proxy (dam may mau cam) cho 2 ban ghi `@` va `www`.
2. SSL/TLS mode chon `Full` (hoac `Full (strict)` neu da co cert origin).
3. Bat `Always Use HTTPS`.

Neu khong dung Cloudflare, ban co the cap cert Let's Encrypt tren host (Nginx/Certbot) va reverse vao container `web` dang chay cong 80.

Neu ban muon, toi co the lam tiep bo file SSL + domain production.