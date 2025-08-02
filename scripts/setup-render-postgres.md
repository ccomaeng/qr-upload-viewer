# Render PostgreSQL 설정 가이드

QR Upload Viewer에서 데이터 지속성을 위해 PostgreSQL 데이터베이스를 설정하는 단계별 가이드입니다.

## 🎯 목표
- ✅ 데이터 재배포 후에도 유지
- ✅ QR 코드 스캔 안정성 확보  
- ✅ 404 에러 완전 해결

## 📋 1단계: PostgreSQL 데이터베이스 생성

### Render 대시보드에서:

1. **Render 대시보드** 접속: https://dashboard.render.com
2. **"New +"** 버튼 클릭
3. **"PostgreSQL"** 선택
4. 다음 설정 입력:
   ```
   Name: qr-upload-viewer-db
   Database: qr_viewer
   User: qr_user
   Region: Oregon (US West) - 또는 가장 가까운 지역
   Plan: Free
   ```
5. **"Create Database"** 클릭

### 생성 완료 후:
- 데이터베이스 생성까지 약 2-3분 소요
- 생성 완료되면 연결 정보 확인 가능

## 🔗 2단계: 연결 정보 복사

데이터베이스 생성 완료 후, **Connect** 탭에서 다음 정보 복사:

### Internal Database URL (권장):
```
postgresql://qr_user:password@dpg-xxxxx-a/qr_viewer
```

### 또는 External Database URL:
```
postgresql://qr_user:password@dpg-xxxxx-a.oregon-postgres.render.com/qr_viewer
```

> ⚠️ **보안 주의**: 실제 비밀번호가 포함된 URL이므로 안전하게 보관하세요.

## ⚙️ 3단계: 백엔드 환경변수 설정

### Render 백엔드 서비스에서:

1. **백엔드 서비스** 선택 (qr-upload-viewer-backend)
2. **"Environment"** 탭 클릭
3. **"Add Environment Variable"** 클릭
4. 다음 환경변수 추가:

```bash
# 필수: PostgreSQL 연결 URL
DATABASE_URL=postgresql://qr_user:password@dpg-xxxxx-a/qr_viewer

# 필수: 운영 환경 설정
NODE_ENV=production

# 선택사항: 프론트엔드 URL (이미 설정된 경우 생략)
FRONTEND_URL=https://qr-upload-viewer.vercel.app
```

5. **"Save Changes"** 클릭

## 🚀 4단계: 자동 재배포

환경변수 저장 후:
- Render가 자동으로 백엔드 재배포 시작
- 약 2-5분 소요
- **Logs** 탭에서 배포 진행상황 확인

### 성공적인 배포 로그 예시:
```
🔧 Initializing database (PostgreSQL)
✅ Connected to PostgreSQL database
✅ PostgreSQL schema initialized successfully
🚀 QR Upload Viewer API running on port 10000
```

## ✅ 5단계: 연결 확인

### 헬스체크 확인:
브라우저에서 다음 URL 접속:
```
https://your-backend-url.onrender.com/health
```

### 예상 응답:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-02T10:30:00.000Z",
  "uptime": 120,
  "environment": "production"
}
```

## 🧪 6단계: 전체 시스템 테스트

1. **새 이미지 업로드**
2. **QR 코드 생성**
3. **QR 코드 스캔** (모바일)
4. **결과 확인**

### 테스트 시나리오:
- ✅ 업로드 → QR 생성 → 스캔 → 결과 표시
- ✅ 백엔드 재배포 → 기존 QR 스캔 → 결과 여전히 표시
- ✅ 404 에러 없음

## 🔧 문제 해결

### PostgreSQL 연결 실패:
1. **DATABASE_URL** 정확성 확인
2. **NODE_ENV=production** 설정 확인
3. Render 로그에서 연결 오류 확인

### 백엔드 로그 확인 방법:
1. Render 대시보드 → 백엔드 서비스
2. **"Logs"** 탭 클릭
3. 실시간 로그 모니터링

### 일반적인 오류와 해결:
```bash
# 연결 오류
❌ PostgreSQL connection failed: password authentication failed
→ DATABASE_URL의 비밀번호 확인

# 스키마 오류  
❌ relation "uploads" does not exist
→ 데이터베이스 초기화 대기 (최대 1분)

# 환경변수 오류
❌ Database configuration error
→ NODE_ENV=production 설정 확인
```

## 📊 성능 및 제한사항

### Render PostgreSQL Free Plan:
- **저장용량**: 1GB
- **연결수**: 97개 동시 연결
- **백업**: 7일 보관
- **지역**: 미국 서부/동부

### 예상 사용량:
- **업로드 1개**: ~1KB (메타데이터)
- **QR 결과 1개**: ~200B
- **1000개 업로드**: ~1.2MB
- **예상 한계**: 약 800,000개 업로드

## 🎉 완료!

PostgreSQL 설정이 완료되면:
- ✅ **데이터 지속성**: 재배포 후에도 QR 데이터 유지
- ✅ **404 에러 해결**: 존재하는 데이터에 대한 안정적 접근
- ✅ **시스템 안정성**: 프로덕션 급 데이터베이스 사용
- ✅ **확장성**: 수십만 개의 QR 코드 지원

### 다음 단계:
1. 프론트엔드 최신 에러 핸들링 배포
2. 전체 시스템 성능 모니터링  
3. 사용자 피드백 수집 및 개선

---

## 🆘 도움이 필요한 경우

설정 중 문제가 발생하면:
1. Render 로그 확인
2. 환경변수 재확인
3. 데이터베이스 상태 점검
4. 필요시 데이터베이스 재생성

이 가이드를 따라하면 QR Upload Viewer가 완전히 안정화됩니다! 🚀