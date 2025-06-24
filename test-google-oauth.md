# Hướng dẫn Test Google OAuth

## 1. Cấu hình Environment Variables

### Server (.env)
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/auth/google/callback

# Client Configuration
CLIENT_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
```

### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

## 2. Cấu hình Google OAuth Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable Google+ API
4. Tạo OAuth 2.0 credentials
5. Thêm authorized redirect URIs:
   - `http://localhost:5000/api/v1/auth/google/callback`
   - `http://localhost:3000` (cho development)

## 3. Test Steps

### Bước 1: Khởi động server
```bash
cd server
npm install
npm run dev
```

### Bước 2: Khởi động client
```bash
cd client
npm install
npm start
```

### Bước 3: Test OAuth Flow
1. Mở browser và truy cập `http://localhost:3000`
2. Click vào nút "Login with Google"
3. Popup sẽ mở và redirect đến Google
4. Đăng nhập với Google account
5. Kiểm tra console logs để debug

## 4. Debug Checklist

### Server Logs
- [ ] Google callback received
- [ ] Processing Google OAuth with code
- [ ] Successfully exchanged code for tokens
- [ ] Successfully retrieved Google user info
- [ ] Google OAuth completed successfully

### Client Logs
- [ ] Opening Google OAuth popup with URL
- [ ] Received message from popup
- [ ] Starting Google login
- [ ] Google login successful

### Common Issues
1. **Popup blocked**: Allow popups for localhost
2. **CORS error**: Check CORS configuration
3. **Invalid redirect URI**: Verify Google OAuth console settings
4. **Missing environment variables**: Check .env files
5. **Database connection**: Ensure MongoDB is running

## 5. Troubleshooting

### Error: "Popup was blocked"
- Allow popups for localhost:3000
- Check browser settings

### Error: "Failed to exchange Google code"
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Check GOOGLE_REDIRECT_URI matches Google Console
- Ensure Google+ API is enabled

### Error: "Failed to fetch user data"
- Check if cookies are being set properly
- Verify /auth/me endpoint is working
- Check CORS credentials setting

### Error: "Origin not allowed"
- Add localhost:5000 to allowed origins in client
- Check CORS configuration in server 