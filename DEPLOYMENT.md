# 배포 가이드 (Deployment Guide)

## 🚀 자동 배포 설정

### 1. 프론트엔드 (Vercel)

#### Vercel CLI 설치 및 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# 프론트엔드 폴더로 이동
cd frontend

# Vercel에 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### GitHub 연동 자동 배포
1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 설정:
   - **Framework Preset**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

#### 환경변수 설정
Vercel Dashboard > Settings > Environment Variables:
```
REACT_APP_API_BASE_URL=https://qr-upload-viewer-backend.up.railway.app
REACT_APP_API_URL=https://qr-upload-viewer-backend.up.railway.app/api
```

### 2. 백엔드 (Railway)

#### Railway CLI 설치 및 배포
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 백엔드 폴더로 이동
cd backend

# Railway 프로젝트 초기화
railway init

# 배포
railway up
```

#### GitHub 연동 자동 배포
1. [Railway Dashboard](https://railway.app/dashboard)에 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 저장소 연결 후 배포 설정:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### 환경변수 설정
Railway Dashboard > Variables:
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://qr-upload-viewer.vercel.app
CORS_ORIGIN=https://qr-upload-viewer.vercel.app
DATABASE_URL=./data/qr_viewer.db
MAX_FILE_SIZE=20971520
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
QR_ERROR_CORRECTION=M
QR_MARGIN=1
QR_WIDTH=256
```

## 🔧 수동 배포 단계별 가이드

### 단계 1: 백엔드 배포 (Railway)

1. **Railway 프로젝트 생성**
   ```bash
   cd backend
   railway init qr-upload-viewer-backend
   ```

2. **환경변수 설정**
   ```bash
   # .env.production 파일의 내용을 Railway Variables에 추가
   railway variables set NODE_ENV=production
   railway variables set FRONTEND_URL=https://qr-upload-viewer.vercel.app
   # ... 다른 환경변수들
   ```

3. **배포 실행**
   ```bash
   railway up
   ```

4. **배포 URL 확인**
   ```bash
   railway status
   # 생성된 URL을 메모: https://qr-upload-viewer-backend.up.railway.app
   ```

### 단계 2: 프론트엔드 배포 (Vercel)

1. **환경변수 업데이트**
   ```bash
   cd frontend
   # .env 파일 수정 (Railway에서 받은 백엔드 URL 사용)
   echo "REACT_APP_API_BASE_URL=https://qr-upload-viewer-backend.up.railway.app" > .env
   ```

2. **Vercel 배포**
   ```bash
   vercel
   # 첫 배포 시 프로젝트 설정
   # ? Set up and deploy "~/qr-upload-viewer/frontend"? Y
   # ? Which scope? (개인 계정 선택)
   # ? Link to existing project? N
   # ? What's your project's name? qr-upload-viewer
   # ? In which directory is your code located? ./
   ```

3. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

### 단계 3: 배포 검증

1. **백엔드 Health Check**
   ```bash
   curl https://qr-upload-viewer-backend.up.railway.app/health
   ```

2. **프론트엔드 접속 확인**
   - https://qr-upload-viewer.vercel.app 접속
   - 이미지 업로드 테스트
   - QR 코드 생성 테스트

3. **전체 기능 테스트**
   - 파일 업로드
   - QR 코드 생성
   - 모바일에서 QR 코드 스캔
   - 이미지 조회 확인

## 🔄 지속적 배포 (CI/CD)

### GitHub Actions (옵션)

`.github/workflows/deploy.yml` 파일 생성:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: railway-app/railway-deploy@main
        with:
          service: backend
          token: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          working-directory: ./frontend
```

## 🐛 배포 문제 해결

### 백엔드 문제
```bash
# Railway 로그 확인
railway logs

# 서비스 재시작
railway restart

# 환경변수 확인
railway variables
```

### 프론트엔드 문제
```bash
# Vercel 로그 확인
vercel logs

# 빌드 재실행
vercel --force

# 환경변수 확인
vercel env list
```

### 일반적인 문제들

1. **CORS 오류**
   - Railway 환경변수에서 `CORS_ORIGIN` 확인
   - Vercel URL이 정확한지 확인

2. **환경변수 미적용**
   - `REACT_APP_` 접두사 확인
   - 배포 후 환경변수 변경 시 재배포 필요

3. **Database 경로 오류**
   - Railway에서 영구 스토리지 설정 확인
   - `DATABASE_URL` 경로 확인

## 📊 배포 후 모니터링

### Railway 모니터링
- Dashboard에서 CPU/Memory 사용량 확인
- 로그 모니터링
- 에러율 추적

### Vercel 모니터링
- Analytics 대시보드 확인
- Performance metrics 모니터링
- 에러 로그 추적

### 사용자 피드백
- 실제 QR 코드 스캔 테스트
- 다양한 디바이스에서 테스트
- 네트워크 환경별 테스트

## 🔐 보안 설정

### Railway
- 환경변수 암호화
- Private networking 활성화
- 로그 민감정보 필터링

### Vercel
- HTTPS 강제 설정
- Security headers 적용
- Environment variables 암호화

## 📈 성능 최적화

### Railway
- 인스턴스 사양 조정
- 데이터베이스 최적화
- 캐싱 구현

### Vercel
- Edge functions 활용
- CDN 최적화
- 이미지 최적화 설정