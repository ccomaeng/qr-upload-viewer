# 🚀 Render 백엔드 배포 - 단계별 상세 가이드

## 📱 사전 준비
- 컴퓨터 브라우저 (Chrome, Safari, Firefox 등)
- GitHub 계정 (이미 저장소 있음: `ccomaeng/qr-upload-viewer`)

---

## 1단계: Render 웹사이트 접속 및 회원가입

### 🌐 Render 접속
1. **브라우저에서 접속**: https://render.com
2. **메인 페이지** 확인 - "Build, deploy and scale your apps with unparalleled ease" 문구

### 👤 계정 생성 (GitHub 연동 추천)
1. **우상단 "Get Started for Free"** 버튼 클릭
2. **GitHub로 로그인** 선택 (추천)
   - "Continue with GitHub" 버튼 클릭
   - GitHub 로그인 (기존 계정 사용)
   - Render 권한 승인 ("Authorize Render")
3. **또는 이메일로 가입**:
   - 이메일, 비밀번호 입력
   - 계정 확인 이메일 체크

### ✅ 가입 완료 확인
- Render 대시보드 페이지 표시
- 좌측에 "Services", "Databases" 등 메뉴 보임

---

## 2단계: 새 웹 서비스 생성

### 🆕 서비스 생성 시작
1. **대시보드에서 "New +"** 버튼 클릭 (우상단)
2. **드롭다운 메뉴**에서 **"Web Service"** 선택
3. **"Build and deploy from a Git repository"** 섹션 확인

### 🔗 GitHub 저장소 연결
1. **"Connect a repository"** 버튼 클릭
2. **GitHub 연결 확인**:
   - 이미 연결됨: 저장소 목록 표시
   - 미연결 시: "Connect account" 클릭 → GitHub 승인
3. **저장소 검색**:
   - 검색창에 `qr-upload-viewer` 입력
   - 또는 목록에서 `ccomaeng/qr-upload-viewer` 찾기
4. **저장소 옆 "Connect"** 버튼 클릭

---

## 3단계: 서비스 설정 구성

### ⚙️ 기본 정보 입력
```
Name: qr-upload-viewer-backend
```
*(변경 가능, 영문/숫자/하이픈만 사용)*

### 📁 환경 설정
```
Runtime: Node
Region: Oregon (US West) - 기본값
Branch: main - 기본값
Root Directory: backend
```

**❗ 중요**: Root Directory를 반드시 `backend`로 설정

### 🔨 빌드 설정
```
Build Command: npm install
Start Command: npm start
```

### 💰 요금제 선택
```
Instance Type: Free
```
- 월 750시간 무료 (약 31일)
- RAM: 512MB
- CPU: 0.1 CPU

---

## 4단계: 고급 설정 (옵션)

### 🔧 Environment Variables (환경변수)
**"Advanced" 섹션 확장 후 추가**:

```bash
NODE_ENV = production
PORT = 10000
FRONTEND_URL = https://qr-upload-viewer.vercel.app
CORS_ORIGIN = https://qr-upload-viewer.vercel.app
DATABASE_URL = ./data/qr_viewer.db
MAX_FILE_SIZE = 10485760
ALLOWED_FILE_TYPES = image/jpeg,image/png,image/gif,image/webp
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX = 100
```

**환경변수 추가 방법**:
1. "Add Environment Variable" 클릭
2. Key와 Value를 각각 입력
3. 모든 환경변수 반복 입력

### 🚀 Auto-Deploy 설정
```
Auto-Deploy: Yes (기본값)
```
- GitHub에 푸시할 때마다 자동 재배포

---

## 5단계: 배포 시작

### 🎬 서비스 생성
1. **모든 설정 확인**
2. **"Create Web Service"** 버튼 클릭
3. **배포 페이지로 이동** - 실시간 로그 표시

### 📊 배포 과정 모니터링
**1단계: Cloning repository** (30초)
```
==> Cloning repository
Cloning into '/opt/render/project/src'...
```

**2단계: Installing dependencies** (2-3분)
```
==> Running build command 'npm install'
npm install
added 245 packages in 45s
```

**3단계: Starting service** (1분)
```
==> Running start command 'npm start'
✅ Connected to SQLite database
🚀 QR Upload Viewer API running on port 10000
```

### ✅ 배포 완료 확인
- **상태**: "Live" (녹색 표시)
- **URL 생성**: `https://qr-upload-viewer-backend.onrender.com`
- **로그**: "QR Upload Viewer API running" 메시지

---

## 6단계: 배포 검증

### 🔍 Health Check 테스트
1. **생성된 URL 복사**
2. **새 브라우저 탭에서 접속**:
   ```
   https://[YOUR-SERVICE-NAME].onrender.com/health
   ```
3. **예상 응답**:
   ```json
   {
     "status": "OK",
     "message": "QR Upload Viewer API is running",
     "timestamp": "2025-08-02T..."
   }
   ```

### 🌐 서비스 URL 저장
- **백엔드 URL**: `https://[YOUR-SERVICE-NAME].onrender.com`
- **다음 단계를 위해 메모**

---

## 🐛 문제 해결 가이드

### ❌ 빌드 실패 시
**증상**: "Build failed" 메시지
**해결방법**:
1. Logs 탭에서 오류 메시지 확인
2. Root Directory가 `backend`인지 재확인
3. Build Command가 `npm install`인지 확인

### ❌ 시작 실패 시
**증상**: "Deploy failed" 또는 시작되지 않음
**해결방법**:
1. Start Command가 `npm start`인지 확인
2. PORT 환경변수가 `10000`인지 확인
3. package.json에 start 스크립트 존재 확인

### ❌ 연결 실패 시
**증상**: GitHub 저장소를 찾을 수 없음
**해결방법**:
1. GitHub 계정 연결 재확인
2. 저장소 이름 정확히 입력 (`ccomaeng/qr-upload-viewer`)
3. 저장소가 Public인지 확인

### ⏰ 배포 시간이 너무 오래 걸릴 때
**정상 소요시간**: 5-10분
**10분 초과 시**: 페이지 새로고침 또는 Render 지원팀 문의

---

## 📋 체크리스트

배포 전 확인사항:
- [ ] Render 계정 생성 완료
- [ ] GitHub 저장소 연결 확인
- [ ] Root Directory: `backend` 설정
- [ ] Build Command: `npm install` 설정
- [ ] Start Command: `npm start` 설정
- [ ] 환경변수 모두 입력

배포 후 확인사항:
- [ ] 상태가 "Live"로 표시
- [ ] 서비스 URL 생성 확인
- [ ] `/health` 엔드포인트 응답 확인
- [ ] 로그에 "API running" 메시지 확인

---

## 🎯 다음 단계

Render 백엔드 배포가 완료되면:
1. **생성된 백엔드 URL 복사**
2. **Vercel에서 프론트엔드 배포**
3. **전체 시스템 테스트**

배포 완료 후 상황을 알려주시면 다음 단계로 진행하겠습니다! 🚀