# QR Upload Viewer

QR 코드 기반 이미지 업로드 및 뷰어 시스템

## 📱 기능

- 이미지 업로드 및 QR 코드 생성
- QR 코드 스캔으로 이미지 조회
- 모바일 최적화 UI
- 다중 파일 업로드 지원

## 🚀 배포된 서비스

### 프로덕션 URL
- **Frontend**: https://qr-upload-viewer.vercel.app
- **Backend**: https://qr-upload-viewer-backend.up.railway.app

### 사용 방법
1. 프론트엔드 사이트에서 이미지 업로드
2. 생성된 QR 코드를 모바일로 스캔
3. 업로드된 이미지 확인

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
    ├── railway.toml         # Railway 배포 설정
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
MAX_FILE_SIZE=10485760
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
- **File Size Limits**: Configurable upload size restrictions
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
    "imageUrl": "http://localhost:3002/uploads/filename.jpg",
    "viewUrl": "http://localhost:3002/view/uuid-string",
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
- **Automatic Compression**: Images compressed before processing
- **Multi-algorithm Detection**: Multiple QR detection strategies for accuracy
- **Async Processing**: Non-blocking image processing with status polling

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

#### Railway/Render Deployment
- **Automatic deployment** from GitHub
- **Environment variable configuration**
- **Integrated monitoring and logging**

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
- **File upload failures**: Check file size and type restrictions
- **Processing timeouts**: Verify image quality and QR code clarity
- **Database errors**: Ensure proper permissions and storage space
- **QR code access issues**: Ensure frontend runs on port 3002 for mobile access
- **Mobile viewing problems**: Use newly generated QR codes with correct port configuration

### Getting Help
- 📚 Check the [documentation](docs/)
- 🐛 Report bugs via [GitHub Issues](issues/)
- 💬 Join our [Discord community](discord-link)
- 📧 Email support: support@qr-viewer-pro.com

---

**Built with ❤️ using React, Node.js, and modern web technologies**