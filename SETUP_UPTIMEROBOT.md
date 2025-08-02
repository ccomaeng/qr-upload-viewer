# 🤖 UptimeRobot 설정 가이드

## 🎯 목적
Render 무료 플랜의 Sleep 모드를 방지하여 QR 코드 생성 오류 해결

## 📋 설정 단계

### 1단계: UptimeRobot 가입
1. https://uptimerobot.com 접속
2. **Sign Up** 클릭하여 무료 계정 생성
3. 이메일 인증 완료

### 2단계: Monitor 생성
1. **Dashboard** → **Add New Monitor** 클릭
2. 다음 정보 입력:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: QR Upload Viewer Backend
   - **URL**: `https://qr-upload-viewer-backend.onrender.com/health`
   - **Monitoring Interval**: 5 minutes
   - **Monitor Timeout**: 30 seconds
   - **HTTP Method**: GET

### 3단계: 알림 설정 (선택사항)
1. **Alert Contacts** 섹션에서 이메일 주소 추가
2. **Up/Down 알림** 활성화

### 4단계: 확인
- Monitor가 **Up** 상태로 표시되는지 확인
- 5분마다 자동으로 Health Check 실행됨

## ✅ 예상 결과

### Sleep 모드 방지
- 15분마다 Sleep 모드 → **Never Sleep**
- QR 생성 실패 → **항상 성공**
- 1-2분 대기시간 → **즉시 응답**

### 모니터링 혜택
- 서버 다운타임 실시간 알림
- 응답시간 통계
- 가동률 리포트

## 🔧 대안 방법

만약 UptimeRobot 설정이 어려우면:

### 방법 1: 브라우저 Keep-Alive
브라우저 개발자 도구(F12) → Console에서 실행:
```javascript
setInterval(() => {
  fetch('https://qr-upload-viewer-backend.onrender.com/health')
    .then(() => console.log('✅ Server pinged'))
    .catch(() => console.log('❌ Ping failed'));
}, 5 * 60 * 1000); // 5분마다
```

### 방법 2: 모바일 앱 사용
- **UptimeRobot 모바일 앱** 설치
- 앱에서 모니터링 설정

## 📱 즉시 테스트 방법

UptimeRobot 설정 후:
1. https://qr-upload-viewer.vercel.app 접속
2. 이미지 업로드
3. QR 코드 생성 (즉시 성공해야 함)
4. QR 코드로 이미지 보기 테스트

## 💡 추가 팁

- UptimeRobot 무료 플랜: **50개 모니터** 지원
- **가동률 99.9%** 목표 달성 가능
- **월간 리포트** 이메일로 자동 발송