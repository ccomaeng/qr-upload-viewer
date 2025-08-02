# 🔄 Sleep 모드 해결 방법

## 무료 서비스 제약사항

### Render 무료 플랜
- **Sleep 시간**: 15분 비활성 후 자동 Sleep
- **깨어나는 시간**: 1-2분 소요
- **월 사용량**: 750시간 (약 31일)

## 🚀 해결 방법들

### 방법 1: 외부 Keep-Alive 서비스

**UptimeRobot** (무료):
1. https://uptimerobot.com 가입
2. Monitor 추가:
   - Type: HTTP(s)
   - URL: `https://qr-upload-viewer-backend.onrender.com/health`
   - Monitoring Interval: 5분
3. 자동으로 5분마다 Health Check → Sleep 방지

### 방법 2: GitHub Actions Keep-Alive

`.github/workflows/keep-alive.yml` 파일 생성:
```yaml
name: Keep Alive
on:
  schedule:
    - cron: '*/14 * * * *'  # 14분마다 실행
jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Keep server alive
        run: curl https://qr-upload-viewer-backend.onrender.com/health
```

### 방법 3: 프론트엔드에서 자동 핑

React 앱에서 주기적으로 Health Check:
```javascript
// 10분마다 백엔드 핑
setInterval(() => {
  fetch('https://qr-upload-viewer-backend.onrender.com/health')
    .catch(() => {}); // 에러 무시
}, 10 * 60 * 1000);
```

## 📱 사용자 경험 개선

### 현재 상황 알리기
업로드 실패 시 사용자에게 안내:
```
"서버가 절전 모드에서 깨어나는 중입니다. 
1-2분 후 다시 시도해주세요."
```

### 자동 재시도 로직
```javascript
const uploadWithRetry = async (file, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await uploadImage(file);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30초 대기
    }
  }
};
```

## 🎯 권장사항

**단기 해결책**: UptimeRobot 사용
- 5분마다 자동 핑
- 완전 무료
- 설정 간단

**장기 해결책**: 유료 플랜 고려
- Render Pro: $7/월
- 또는 다른 호스팅 서비스

## 🔧 현재 대응법

사용자가 업로드 실패를 경험할 때:
1. **1-2분 기다리기**
2. **Health Check 먼저 호출**: /health
3. **다시 업로드 시도**

이는 무료 호스팅의 일반적인 제약사항입니다.