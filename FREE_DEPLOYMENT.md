# 🆓 무료 배포 옵션

Railway가 유료로 변경되어 무료 대안을 제시합니다.

## 🚀 추천 무료 배포 옵션

### 1. Render (추천) ⭐
- **백엔드**: 무료 플랜 제공 (월 750시간)
- **데이터베이스**: PostgreSQL 무료 제공
- **장점**: 안정적, GitHub 자동 배포, Docker 지원
- **단점**: 비활성 시 sleep (활성화까지 1-2분)

### 2. Vercel (프론트엔드) + Supabase (백엔드 대안)
- **프론트엔드**: Vercel (무료)
- **백엔드**: Supabase Edge Functions (무료)
- **데이터베이스**: Supabase PostgreSQL (무료)
- **파일 저장**: Supabase Storage (1GB 무료)

### 3. Netlify Functions + Vercel
- **프론트엔드**: Vercel (무료)
- **백엔드**: Netlify Functions (무료)
- **데이터베이스**: PlanetScale 또는 MongoDB Atlas (무료)

### 4. Heroku 대안들
- **Koyeb**: 무료 플랜 제공
- **Cyclic**: Node.js 특화, 무료
- **Deta**: 무료 (제한적)

## 🎯 가장 쉬운 옵션: Render 사용

### Render 배포 장점:
- ✅ Railway와 거의 동일한 방식
- ✅ GitHub 자동 배포
- ✅ 무료 PostgreSQL 데이터베이스
- ✅ 환경변수 설정 간단
- ✅ Docker 지원

### Render 배포 단계:

1. **Render 접속**: https://render.com
2. **GitHub로 로그인**
3. **"New Web Service"** 클릭
4. **저장소 연결**: `ccomaeng/qr-upload-viewer`
5. **설정**:
   - Name: `qr-upload-viewer-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

6. **환경변수 설정**:
```bash
NODE_ENV=production
FRONTEND_URL=https://qr-upload-viewer.vercel.app
CORS_ORIGIN=https://qr-upload-viewer.vercel.app
DATABASE_URL=./data/qr_viewer.db
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

## 🔄 SQLite → PostgreSQL 전환 (권장)

무료 배포를 위해 PostgreSQL로 전환하는 것이 좋습니다:

### 장점:
- ✅ Render/Supabase 무료 PostgreSQL 제공
- ✅ 더 안정적인 데이터 저장
- ✅ 스케일링 가능

### 전환 방법:
1. **Render PostgreSQL 생성** (무료)
2. **데이터베이스 코드 수정** (SQLite → PostgreSQL)
3. **환경변수 업데이트**

## 🚀 지금 추천하는 방법

### 옵션 A: Render (쉬움)
- Render에서 백엔드 배포
- Vercel에서 프론트엔드 배포
- SQLite 그대로 사용 (빠른 배포)

### 옵션 B: Vercel + Supabase (최신)
- Vercel에서 프론트엔드 배포
- Supabase로 백엔드 기능 구현
- 더 현대적이지만 코드 수정 필요

## 🤔 어떤 방법을 선택하시겠어요?

1. **Render 사용** → 기존 코드 그대로, 가장 쉬움
2. **Supabase 전환** → 더 현대적, 약간의 코드 수정 필요
3. **다른 옵션 검토** → 추가 무료 서비스 조사

선택해주시면 해당 방법으로 바로 진행하겠습니다! 🎯