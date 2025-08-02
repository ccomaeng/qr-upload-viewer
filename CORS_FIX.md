# 🐛 QR 생성 오류 해결 방법

## 문제 상황
- 이미지 업로드는 성공
- QR 코드 생성 시 "Failed to fetch" 오류 발생

## 가능한 원인들

### 1. Vercel 환경변수 미적용
Vercel에서 환경변수가 빌드에 적용되지 않았을 가능성

### 2. CORS 설정 문제  
백엔드에서 Vercel 도메인을 허용하지 않을 가능성

### 3. API 엔드포인트 경로 문제
API 요청 경로가 잘못되었을 가능성

## 🔧 해결 방법

### 방법 1: Vercel 환경변수 재설정

1. **Vercel 대시보드** 접속
2. **프로젝트 선택** → **Settings** → **Environment Variables**
3. **다음 환경변수 추가/수정**:
```
REACT_APP_API_BASE_URL = https://qr-upload-viewer-backend.onrender.com
REACT_APP_API_URL = https://qr-upload-viewer-backend.onrender.com/api
```
4. **Redeploy** 실행

### 방법 2: 백엔드 CORS 설정 확인

현재 백엔드가 Vercel 도메인을 허용하는지 확인 필요

### 방법 3: 브라우저 개발자 도구 확인

1. **F12** 눌러서 개발자 도구 열기
2. **Network** 탭에서 API 요청 확인
3. **Console** 탭에서 오류 메시지 확인

## 🚀 즉시 해결책

가장 빠른 해결방법은 Vercel 환경변수 재설정입니다:

1. **Vercel 대시보드** → **Settings** → **Environment Variables**
2. **환경변수 추가**:
   - Name: `REACT_APP_API_BASE_URL`
   - Value: `https://qr-upload-viewer-backend.onrender.com`
3. **두 번째 환경변수 추가**:
   - Name: `REACT_APP_API_URL`  
   - Value: `https://qr-upload-viewer-backend.onrender.com/api`
4. **Deployments** → **Redeploy** 클릭

이렇게 하면 환경변수가 빌드에 적용되어 API 연결이 정상화됩니다.