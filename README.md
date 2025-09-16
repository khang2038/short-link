# Winners Media - URL Shortener

Ứng dụng rút gọn link đơn giản, nhanh và mượt với giao diện hiện đại. Đăng nhập tài khoản mặc định, dán link và nhận link ngắn. Lưu trữ trong bộ nhớ (phục vụ demo/học tập).

## Tính năng
- Đăng nhập với tài khoản mặc định (có thể cấu hình qua biến môi trường)
- Rút gọn link với mã tự sinh hoặc tuỳ chọn
- Xem danh sách link đã rút gọn của bạn
- Giao diện đẹp, responsive, nhẹ

## Chạy cục bộ
Yêu cầu Node.js 18+.

```bash
npm install
npm run dev
```

Mở: http://localhost:3000

Tài khoản mặc định:
- Email: `admin@winners.media`
- Mật khẩu: `winners2025`

## Cấu hình (tuỳ chọn)
Thiết lập qua biến môi trường:

```bash
PORT=3000
DEFAULT_USER=admin@winners.media
DEFAULT_PASS=winners2025
SESSION_SECRET=your-secret
BASE_URL=http://localhost:3000
```

## Production
Chạy với:

```bash
npm start
```

Lưu ý: Dữ liệu lưu trong RAM (Map). Khởi động lại sẽ mất dữ liệu.

## Triển khai All-in-one trên Netlify

Dự án đã cấu hình để chạy frontend (thư mục `public`) và backend (Express) trên Netlify Functions.

1) Cài phụ thuộc serverless adapter (nếu chưa có):
```bash
npm install serverless-http
```

2) Kết nối repo với Netlify và thiết lập:
- Build command: `npm run build`
- Publish directory: `public`
- Functions directory: `netlify/functions`

3) Biến môi trường (tùy chọn):
- `DEFAULT_USER`, `DEFAULT_PASS`, `SESSION_SECRET`, `BASE_URL`

4) Sau khi deploy:
- API dùng đường dẫn `/api/*` (được proxy vào function `app`).
- Link rút gọn `/:code` được xử lý bởi function.
