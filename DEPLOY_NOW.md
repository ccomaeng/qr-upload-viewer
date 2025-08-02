# 🚀 지금 바로 배포하기

## 1단계: Railway 백엔드 배포

### 📋 Railway 배포 단계:

1. **Railway 접속**: https://railway.app
2. **GitHub로 로그인**
3. **"New Project"** 클릭
4. **"Deploy from GitHub repo"** 선택
5. **저장소 검색**: `ccomaeng/qr-upload-viewer` 선택
6. **루트 디렉토리 설정**: `backend` 입력
7. **배포 시작** (자동으로 package.json을 인식하여 빌드)

### 🔧 환경변수 설정 (Variables 탭):

배포 후 Variables 탭에서 다음을 추가:

```bash
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

### ✅ 배포 완료 확인:

1. **배포 성공**: Railway 대시보드에서 "Running" 상태 확인
2. **URL 복사**: 생성된 백엔드 URL (예: `https://qr-upload-viewer-backend.up.railway.app`)
3. **Health Check**: `[백엔드URL]/health` 접속하여 응답 확인

---

## 2단계: Vercel 프론트엔드 배포

Railway 배포가 완료되고 백엔드 URL을 받으면:

### 📋 Vercel 배포 단계:

1. **Vercel 접속**: https://vercel.com
2. **GitHub로 로그인**
3. **"New Project"** 클릭
4. **저장소 선택**: `ccomaeng/qr-upload-viewer`
5. **프레임워크 설정**:
   - Framework Preset: **React**
   - Root Directory: **frontend**
   - Build Command: **npm run build**
   - Output Directory: **build**

### 🔧 환경변수 설정 (Settings > Environment Variables):

```bash
REACT_APP_API_BASE_URL=[Railway에서_받은_백엔드_URL]
REACT_APP_API_URL=[Railway에서_받은_백엔드_URL]/api
```

예시:
```bash
REACT_APP_API_BASE_URL=https://qr-upload-viewer-backend.up.railway.app
REACT_APP_API_URL=https://qr-upload-viewer-backend.up.railway.app/api
```

### ✅ 배포 완료 확인:

1. **배포 성공**: Vercel 대시보드에서 "Ready" 상태 확인
2. **URL 확인**: 생성된 프론트엔드 URL (예: `https://qr-upload-viewer.vercel.app`)

---

## 3단계: 전체 기능 테스트

### 🧪 테스트 체크리스트:

1. **프론트엔드 접속**: Vercel URL 접속
2. **이미지 업로드**: 파일 선택하여 업로드
3. **QR 코드 생성**: 업로드 후 QR 코드 생성 확인
4. **모바일 테스트**: QR 코드를 모바일로 스캔
5. **이미지 뷰어**: 모바일에서 이미지 정상 표시 확인

### 🎯 성공 시 확인 사항:

- ✅ 이미지 업로드 성공
- ✅ QR 코드 생성 완료
- ✅ 모바일 QR 스캔으로 이미지 조회 가능
- ✅ 모든 기능 정상 작동

---

## 🐛 문제 발생 시:

### Railway 문제:
- **로그 확인**: Railway > Deployments > Logs
- **환경변수 재확인**: Variables 탭에서 모든 변수 확인
- **Health Check**: `/health` 엔드포인트 응답 확인

### Vercel 문제:
- **빌드 로그**: Vercel > Functions > Build Logs
- **환경변수 확인**: Settings > Environment Variables
- **재배포**: Deployments > Redeploy

### CORS 문제:
- Railway 환경변수에 정확한 Vercel URL 설정 확인
- 브라우저 개발자 도구에서 네트워크 오류 확인

---

## 📞 배포 진행 상황 보고

배포 진행하시면서 각 단계별로 상황을 알려주세요:

1. **Railway 배포 시작** → "Railway 배포 시작했어요"
2. **Railway 완료 + URL 획득** → "Railway 완료, URL: [받은URL]"
3. **Vercel 배포 시작** → "Vercel 배포 시작했어요"
4. **Vercel 완료** → "Vercel 완료, 테스트 해보겠어요"
5. **전체 테스트 결과** → "모든 기능 정상 작동해요" 또는 문제 상황

저는 진행 상황에 따라 추가 지원을 제공하겠습니다! 🚀