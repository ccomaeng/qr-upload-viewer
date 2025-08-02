# QR Upload Viewer

QR 코드 기반 이미지 업로드 및 뷰어 시스템

## 📱 기능

- 이미지 업로드 및 QR 코드 생성 (최대 20MB)
- QR 코드 스캔으로 이미지 조회
- 모바일 최적화 UI
- 다중 파일 업로드 지원
- 실시간 업로드 진행 상황 표시
- Sleep 모드 해결을 위한 자동 Keep-Alive 시스템

## 🚀 배포된 서비스

### 프로덕션 URL
- **Frontend**: https://qr-upload-viewer.vercel.app
- **Backend**: https://qr-upload-viewer-backend.onrender.com
- **Health Check**: https://qr-upload-viewer-backend.onrender.com/health

### 사용 방법
1. 프론트엔드 사이트에서 이미지 업로드 (최대 20MB)
2. "QR 코드 생성" 버튼 클릭
3. 생성된 QR 코드를 모바일로 스캔
4. 업로드된 이미지 확인

### ⚡ 빠른 시작
```bash
# 1. 클론 및 설치
git clone https://github.com/ccomaeng/qr-upload-viewer.git
cd qr-upload-viewer

# 2. 백엔드 실행
cd backend
npm install
cp .env.example .env  # 환경변수 설정
npm run dev

# 3. 프론트엔드 실행 (새 터미널)
cd frontend
npm install
npm start

# 4. 브라우저에서 테스트
open http://localhost:3000
```

## 🛠️ 기술 스택

### Frontend
- React 18
- Modern CSS with Flexbox/Grid
- Responsive Design
- PWA 지원

### Backend
- Node.js + Express
- SQLite 데이터베이스
- Multer 파일 업로드
- QRCode 생성 라이브러리

## 🏗️ 프로젝트 구조

```
qr-upload-viewer/
├── frontend/                 # React 프론트엔드
│   ├── public/
│   │   ├── view.html        # 정적 뷰어 페이지
│   │   └── test-*.html      # 테스트 페이지들
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   └── services/        # API 서비스
│   └── vercel.json          # Vercel 배포 설정
└── backend/                 # Node.js 백엔드
    ├── src/
    │   ├── routes/          # API 라우트
    │   ├── services/        # 비즈니스 로직
    │   └── database/        # 데이터베이스 설정
    ├── uploads/             # 업로드된 파일
    ├── Dockerfile           # Docker 설정
    └── .env.production      # 프로덕션 환경변수
```

## 🔧 로컬 개발

### 백엔드 실행
```bash
cd backend
npm install
npm run dev
```

### 프론트엔드 실행
```bash
cd frontend
npm install
npm start
```

## 📁 Project Structure

```
qr-upload-viewer/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Custom middleware
│   │   ├── database/       # Database setup and queries
│   │   └── utils/          # Utility functions
│   ├── uploads/            # File upload directory
│   ├── data/              # SQLite database storage
│   └── Dockerfile         # Backend container config
├── frontend/               # React client application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── QRUploadViewer.js    # Main upload interface
│   │   │   ├── ImageViewer.js       # Mobile image viewer
│   │   │   ├── ResultsPanel.js      # QR results display
│   │   │   └── UploadArea.js        # File upload component
│   │   ├── services/       # API service layer
│   │   └── App.js         # Main application with routing
│   ├── public/            # Static assets
│   └── Dockerfile         # Frontend container config
├── docker-compose.yml     # Multi-container orchestration
└── README.md              # This file
```

## 🔧 Configuration

### Backend Configuration (.env)
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3002
DATABASE_PATH=./data/qr_viewer.db
MAX_FILE_SIZE=20971520
UPLOAD_DIR=./uploads
CORS_ORIGIN=http://localhost:3002
```

### Frontend Configuration
- API URL configuration via REACT_APP_API_URL
- Build-time environment variables
- Progressive Web App (PWA) support

## 🛡️ Security Features

### Input Validation
- **File Type Validation**: Magic byte verification + MIME type checking
- **File Size Limits**: 20MB maximum upload size with client-side validation
- **Content Sanitization**: XSS prevention and input cleaning

### API Security
- **Rate Limiting**: Configurable request throttling
- **CORS Protection**: Strict origin validation
- **Security Headers**: Helmet.js security headers
- **Error Handling**: Secure error responses without information leakage

### Infrastructure Security
- **Non-root Containers**: Docker containers run as non-privileged users
- **Health Checks**: Application monitoring and automatic restarts
- **Data Cleanup**: Automated cleanup of sensitive uploaded files

## 📊 API Endpoints

### Core Endpoints
```
POST   /api/upload                    # Upload image for QR processing
GET    /api/results/{uploadId}        # Get processing results
GET    /api/uploads                   # List upload history
GET    /api/uploads/{uploadId}        # Get single upload details
POST   /api/generate-qr/{uploadId}    # Generate QR code for upload
GET    /api/qr/{uploadId}             # Get QR code information
DELETE /api/uploads/{uploadId}        # Delete upload and files
GET    /health                        # Health check endpoint
```

### Response Formats
```json
// Upload Response
{
  "success": true,
  "uploadId": "uuid-string",
  "status": "processing",
  "imageUrl": "/uploads/filename.jpg"
}

// Results Response
{
  "success": true,
  "uploadId": "uuid-string",
  "status": "completed",
  "qrCodes": [
    {
      "content": "https://example.com",
      "position": { "x": 100, "y": 50 },
      "confidence": 1.0
    }
  ]
}

// QR Generation Response
{
  "success": true,
  "uploadId": "uuid-string",
  "qrImagePath": "qr-codes/qr-uuid-timestamp.png",
  "qrImageUrl": "/uploads/qr-codes/qr-uuid-timestamp.png",
  "qrContent": {
    "type": "image_upload",
    "uploadId": "uuid-string",
    "imageUrl": "https://qr-upload-viewer-backend.onrender.com/uploads/filename.jpg",
    "viewUrl": "https://qr-upload-viewer.vercel.app/view.html?id=uuid-string",
    "originalName": "filename.jpg",
    "uploadTime": "2025-08-02 03:33:50",
    "generatedAt": "2025-08-02T03:41:58.087Z"
  }
}
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Run test suite
npm run test:coverage      # Run with coverage
npm run test:watch         # Watch mode
```

### Frontend Tests
```bash
cd frontend
npm test                   # Run React tests
npm run test:coverage     # Run with coverage
```

### Integration Tests
```bash
# Full application testing
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📈 Performance Optimization

### Image Processing
- **Large File Support**: Up to 20MB image uploads with efficient processing
- **Automatic Compression**: Images compressed before processing when needed
- **Multi-algorithm Detection**: Multiple QR detection strategies for accuracy
- **Async Processing**: Non-blocking image processing with real-time status updates
- **Sleep Mode Handling**: Automatic retry logic for server wake-up scenarios

### Frontend Performance
- **Code Splitting**: Dynamic imports for optimal bundle sizes
- **Image Optimization**: Responsive images and lazy loading
- **Caching Strategy**: Aggressive caching for static assets

### Database Performance
- **Connection Pooling**: Efficient database connections
- **Indexed Queries**: Optimized database indexes
- **Cleanup Jobs**: Automated database maintenance

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
```bash
# Set production environment variables
export NODE_ENV=production
export FRONTEND_URL=https://your-domain.com
export DATABASE_PATH=/app/data/qr_viewer.db
```

2. **Docker Production Build**
```bash
docker-compose --profile production up -d
```

3. **Nginx Configuration**
```bash
# Copy SSL certificates
cp ssl/* ./nginx/ssl/
# Update nginx configuration for your domain
```

### Cloud Deployment Options

#### AWS Deployment
- **Frontend**: Deploy to S3 + CloudFront
- **Backend**: Deploy to ECS or EC2
- **Database**: RDS for production database
- **Storage**: S3 for file uploads

#### Render Deployment
- **Automatic deployment** from GitHub
- **Environment variable configuration**
- **Integrated monitoring and logging**
- **Sleep mode prevention** with UptimeRobot

## 🛡️ Sleep 모드 해결책

### 문제 상황
Render 무료 플랜의 경우 15분 비활성 후 자동으로 Sleep 모드로 전환되어 QR 생성이 실패할 수 있습니다.

### 해결 방법

#### 1. UptimeRobot 설정 (권장)
1. **https://uptimerobot.com** 가입 (무료)
2. **새 모니터 추가**:
   - Type: HTTP(s)
   - URL: `https://qr-upload-viewer-backend.onrender.com/health`
   - Monitoring Interval: 5분
3. **효과**: 서버가 Sleep 모드로 전환되지 않음

#### 2. 사용자 안내
업로드 실패 시 사용자에게 안내 메시지:
```
"서버가 절전 모드에서 깨어나는 중입니다. 
1-2분 후 다시 시도해주세요."
```

### Keep-Alive 상태 확인
- **Health Check**: https://qr-upload-viewer-backend.onrender.com/health
- **서버 상태**: 응답 시간 < 1초 (정상), > 5초 (Sleep 모드)

## 🔍 Monitoring & Logging

### Health Checks
- Application health endpoints
- Database connectivity checks
- File system availability
- Memory and CPU monitoring

### Logging
- Structured logging with Winston
- Request/response logging
- Error tracking and alerting
- Performance metrics

### Metrics
- Upload success/failure rates
- Processing time statistics
- QR detection accuracy
- User engagement analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Ensure security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues
- **File upload failures**: Check file size (max 20MB) and type restrictions
- **QR generation failures**: Server may be in Sleep mode - wait 1-2 minutes and retry
- **Processing timeouts**: Verify image quality and QR code clarity
- **Database errors**: Ensure proper permissions and storage space
- **Mobile QR scanning issues**: Ensure QR codes are newly generated with correct URLs
- **Server Sleep mode**: Set up UptimeRobot monitoring to prevent automatic Sleep

### Getting Help
- 📚 Check the [documentation](docs/)
- 🐛 Report bugs via [GitHub Issues](issues/)
- 💬 Join our [Discord community](discord-link)
- 📧 Email support: support@qr-viewer-pro.com

---

**Built with ❤️ using React, Node.js, and modern web technologies**