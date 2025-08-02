# 🚀 Render 배포 가이드

## 1단계: Render 백엔드 배포

### 📋 Render 배포 방법:

1. **Render 접속**: https://render.com
2. **GitHub로 로그인** 또는 계정 생성
3. **"New +"** 버튼 → **"Web Service"** 클릭
4. **"Connect a repository"** → **"Connect account"**으로 GitHub 연결
5. **저장소 선택**: `ccomaeng/qr-upload-viewer` 찾아서 **"Connect"**

### ⚙️ 서비스 설정:

```
Name: qr-upload-viewer-backend
Root Directory: backend
Environment: Node
Region: Oregon (US West)
Branch: main
Build Command: npm install
Start Command: npm start
```

### 🔧 고급 설정:

**Plan**: Free ($0/month)
**Auto-Deploy**: Yes (GitHub 푸시 시 자동 배포)

### 환경변수는 자동으로 설정됩니다 (render.yaml 파일 사용)

---

## 2단계: 배포 완료 및 URL 확인

### ✅ 배포 과정:
1. **빌드 시작**: "Building..." 상태
2. **배포 중**: "Deploying..." 상태  
3. **완료**: "Live" 상태 (녹색)

### 📍 URL 확인:
- 배포 완료 후 Render가 제공하는 URL 복사
- 형식: `https://qr-upload-viewer-backend.onrender.com`
- Health Check: `[URL]/health` 접속하여 응답 확인

---

## 3단계: Vercel 프론트엔드 배포

### 📋 Vercel 배포 방법:

1. **Vercel 접속**: https://vercel.com
2. **GitHub로 로그인**
3. **"New Project"** → **"Import Git Repository"**
4. **저장소 선택**: `ccomaeng/qr-upload-viewer`

### ⚙️ 프로젝트 설정:

```
Framework Preset: React
Root Directory: frontend
Build Command: npm run build (자동 감지)
Output Directory: build (자동 감지)
Install Command: npm install (자동 감지)
```

### 🔧 환경변수 설정:

**Environment Variables** 섹션에서 추가:

```bash
REACT_APP_API_BASE_URL = [Render에서_받은_백엔드_URL]
REACT_APP_API_URL = [Render에서_받은_백엔드_URL]/api
```

**예시:**
```bash
REACT_APP_API_BASE_URL = https://qr-upload-viewer-backend.onrender.com
REACT_APP_API_URL = https://qr-upload-viewer-backend.onrender.com/api
```

---

## 4단계: 최종 테스트

### 🧪 테스트 체크리스트:

1. **백엔드 Health Check**:
   ```bash
   curl https://[render-url]/health
   ```

2. **프론트엔드 접속**: Vercel URL 접속

3. **전체 기능 테스트**:
   - ✅ 이미지 업로드
   - ✅ QR 코드 생성  
   - ✅ 모바일 QR 스캔
   - ✅ 이미지 뷰어 작동

---

## 📋 빠른 배포 체크리스트

### Render 백엔드:
- [ ] Render.com 가입/로그인
- [ ] New Web Service 생성
- [ ] GitHub 저장소 연결 (`ccomaeng/qr-upload-viewer`)
- [ ] Root Directory: `backend` 설정
- [ ] 빌드 완료 대기 (5-10분)
- [ ] 생성된 URL 복사
- [ ] `/health` 엔드포인트 테스트

### Vercel 프론트엔드:
- [ ] Vercel.com 가입/로그인  
- [ ] New Project 생성
- [ ] 같은 GitHub 저장소 연결
- [ ] Root Directory: `frontend` 설정
- [ ] 환경변수에 Render URL 입력
- [ ] 배포 완료 대기 (3-5분)
- [ ] 생성된 URL에서 전체 기능 테스트

---

## 🎯 예상 소요 시간

- **Render 백엔드**: 10-15분
- **Vercel 프론트엔드**: 5-10분
- **총 소요 시간**: 20-25분

## 🐛 문제 해결

### Render 빌드 실패 시:
- Logs 탭에서 오류 확인
- `backend` 디렉토리 경로 재확인
- Node.js 버전 호환성 확인

### CORS 오류 시:
- 환경변수에 정확한 Vercel URL 설정
- 브라우저 개발자 도구에서 네트워크 탭 확인

---

## 🎉 배포 완료 후

성공적으로 배포되면:
- **무료로 운영** (Render 750시간/월, Vercel 무제한)
- **자동 배포** (GitHub 푸시 시 자동 업데이트)
- **SSL 인증서** 자동 적용
- **커스텀 도메인** 연결 가능

이제 Render에서 백엔드 배포를 시작해보세요! 🚀