# 🐛 QR 생성 문제 디버깅 가이드

## 현재 상황
- 서버: 정상 실행 중 (방금 재배포됨)
- 업로드: 정상 작동
- QR 생성: 실패 가능성

## 🔍 즉시 확인 사항

### 1. 브라우저 개발자 도구 확인
```
F12 → Network 탭 → QR 생성 시도 → 오류 확인
```

### 2. 서버 로그 확인
백엔드 콘솔에서 QR 생성 요청 시 나타나는 오류 메시지

### 3. API 엔드포인트 직접 테스트
```bash
# 1. Health Check
curl https://qr-upload-viewer-backend.onrender.com/health

# 2. 업로드 후 받은 uploadId로 QR 생성 테스트
curl -X POST https://qr-upload-viewer-backend.onrender.com/api/generate-qr/{uploadId}
```

## 🚨 가능한 원인들

### 1. 환경변수 미적용
새 배포에서 환경변수가 제대로 적용되지 않았을 가능성

### 2. 파일 경로 문제
20MB 업데이트 과정에서 파일 경로 설정 이슈

### 3. 메모리 부족
대용량 파일 처리 시 서버 메모리 부족

### 4. CORS 이슈
프론트엔드-백엔드 간 통신 문제

## 🔧 즉시 해결 방법

### 방법 1: 서버 강제 재시작
Render 대시보드에서 Manual Deploy 실행

### 방법 2: 환경변수 재확인
Render 환경변수 설정 확인:
- `MAX_FILE_SIZE=20971520`
- `FRONTEND_URL=https://qr-upload-viewer.vercel.app`

### 방법 3: 캐시 클리어
브라우저 캐시 및 Vercel 캐시 클리어

## 📞 즉시 연락 필요사항

만약 계속 실패하면 다음 정보 제공:
1. 브라우저 개발자 도구 Network 탭 스크린샷
2. 업로드한 파일 크기와 형식
3. 정확한 오류 메시지
4. 언제부터 문제가 시작되었는지

## 🎯 임시 우회 방법

QR 생성이 계속 실패하는 경우:
1. **작은 파일**로 테스트 (1-2MB)
2. **다른 이미지 형식** 시도 (JPEG → PNG)
3. **브라우저 새로고침** 후 재시도
4. **다른 브라우저**에서 테스트