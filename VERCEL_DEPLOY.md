# 🚀 Vercel 프론트엔드 배포 - 단계별 가이드

## ✅ 백엔드 완료 상태
- **Render 백엔드**: https://qr-upload-viewer-backend.onrender.com
- **Health Check**: ✅ 정상 작동 확인

---

## 1단계: Vercel 웹사이트 접속 및 로그인

### 🌐 Vercel 접속
1. **브라우저에서 접속**: https://vercel.com
2. **메인 페이지** 확인 - "Develop. Preview. Ship." 문구

### 👤 로그인 (GitHub 연동 추천)
1. **우상단 "Login"** 버튼 클릭
2. **GitHub로 로그인** 선택 (추천)
   - "Continue with GitHub" 버튼 클릭
   - GitHub 로그인 (기존 계정 사용)
   - Vercel 권한 승인 ("Authorize Vercel")

### ✅ 로그인 완료 확인
- Vercel 대시보드 페이지 표시
- "Overview", "Projects" 등 탭 표시

---

## 2단계: 새 프로젝트 생성

### 🆕 프로젝트 생성 시작
1. **대시보드에서 "New Project"** 버튼 클릭
2. **"Import Git Repository"** 섹션 확인

### 🔗 GitHub 저장소 선택
1. **저장소 목록**에서 `ccomaeng/qr-upload-viewer` 찾기
2. **저장소 옆 "Import"** 버튼 클릭

---

## 3단계: 프로젝트 설정 구성

### ⚙️ 기본 설정
```
Framework Preset: React (자동 감지)
Root Directory: frontend
```

### 📁 Build 설정 (자동 감지됨)
```
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### 🔧 Environment Variables (중요!)
**"Environment Variables" 섹션에서 추가**:

```bash
REACT_APP_API_BASE_URL = https://qr-upload-viewer-backend.onrender.com
REACT_APP_API_URL = https://qr-upload-viewer-backend.onrender.com/api
```

**환경변수 추가 방법**:
1. "Environment Variables" 섹션 펼치기
2. Name: `REACT_APP_API_BASE_URL`
3. Value: `https://qr-upload-viewer-backend.onrender.com`
4. "Add" 버튼 클릭
5. 두 번째 환경변수도 동일하게 추가

---

## 4단계: 배포 시작

### 🎬 프로젝트 생성
1. **모든 설정 확인**
2. **"Deploy"** 버튼 클릭
3. **배포 페이지로 이동** - 실시간 로그 표시

### 📊 배포 과정 모니터링 (3-5분)
**1단계: Building** (2-3분)
```
Running "npm run build"
Creating an optimized production build...
The build folder is ready to be deployed.
```

**2단계: Deploying** (1-2분)
```
Uploading build outputs...
Deployment completed
```

### ✅ 배포 완료 확인
- **상태**: "Ready" (녹색 표시)
- **URL 생성**: `https://qr-upload-viewer-[random].vercel.app`
- **Visit** 버튼으로 사이트 접속 가능

---

## 5단계: 배포 검증

### 🔍 프론트엔드 접속 테스트
1. **생성된 URL 클릭** 또는 "Visit" 버튼
2. **메인 페이지 로딩** 확인
3. **"QR Upload Viewer"** 제목 표시 확인

### 🧪 기능 테스트
1. **이미지 업로드 테스트**:
   - 파일 선택 또는 드래그 앤 드롭
   - 업로드 진행 상태 확인
   
2. **QR 코드 생성 확인**:
   - 업로드 완료 후 QR 코드 이미지 생성
   - QR 코드 다운로드 버튼 확인

### 📱 모바일 테스트 (중요!)
1. **QR 코드를 휴대폰으로 스캔**
2. **이미지 뷰어 페이지** 정상 표시 확인
3. **이미지 로드** 및 **다운로드 기능** 확인

---

## 6단계: 도메인 설정 (옵션)

### 🌐 커스텀 도메인 연결
1. **프로젝트 Settings** → **Domains** 탭
2. **"Add Domain"** → 원하는 도메인 입력
3. **DNS 설정** 안내에 따라 도메인 연결

### 📋 기본 도메인 사용
- Vercel 제공 도메인 그대로 사용 가능
- `https://qr-upload-viewer-[random].vercel.app`

---

## 🎉 최종 완료 확인

### ✅ 전체 시스템 체크리스트

**백엔드 (Render)**:
- [ ] https://qr-upload-viewer-backend.onrender.com/health 응답 확인
- [ ] API 엔드포인트 정상 작동

**프론트엔드 (Vercel)**:
- [ ] 메인 페이지 정상 로딩
- [ ] 이미지 업로드 기능 작동
- [ ] QR 코드 생성 기능 작동

**전체 워크플로우**:
- [ ] 데스크톱에서 이미지 업로드
- [ ] QR 코드 생성 확인
- [ ] 모바일에서 QR 코드 스캔
- [ ] 모바일에서 이미지 정상 표시

### 🎯 성공 시 결과

**프론트엔드 URL**: `https://qr-upload-viewer-[random].vercel.app`
**백엔드 URL**: `https://qr-upload-viewer-backend.onrender.com`

**주요 기능**:
- ✅ 무료 호스팅 (Vercel 무제한, Render 750시간/월)
- ✅ 자동 HTTPS 인증서
- ✅ GitHub 푸시 시 자동 재배포
- ✅ 모바일 최적화된 QR 코드 뷰어

---

## 🐛 문제 해결

### ❌ 빌드 실패
**증상**: "Build failed" 오류
**해결**:
1. Root Directory가 `frontend`인지 확인
2. 환경변수 정확히 입력했는지 확인
3. GitHub 저장소 최신 상태인지 확인

### ❌ API 연결 오류
**증상**: 이미지 업로드 실패
**해결**:
1. 환경변수에 백엔드 URL 정확히 입력
2. CORS 오류 시 백엔드 환경변수 재확인
3. 브라우저 개발자 도구에서 네트워크 탭 확인

### ❌ QR 코드 스캔 실패
**증상**: 모바일에서 이미지 안 보임
**해결**:
1. QR 코드가 올바른 URL을 가리키는지 확인
2. `view.html` 페이지가 정상 작동하는지 확인
3. 모바일 네트워크 환경 확인

---

## 📞 배포 진행 상황 보고

진행하시면서 각 단계별로 상황을 알려주세요:

1. **Vercel 로그인 완료** → "Vercel 로그인했어요"
2. **프로젝트 생성 시작** → "프로젝트 설정 중이에요"
3. **환경변수 입력 완료** → "환경변수 설정했어요"
4. **배포 시작** → "배포 진행 중이에요"
5. **배포 완료** → "배포 완료, URL: [받은URL]"
6. **기능 테스트** → "모든 기능 정상 작동해요" 또는 문제 상황

이제 Vercel에서 프론트엔드 배포를 시작해보세요! 🚀