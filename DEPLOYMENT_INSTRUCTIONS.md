# 🚀 배포 완료 안내

## 배포 준비 완료

모든 배포 설정이 완료되었습니다! 다음 단계를 따라 서비스를 배포하세요.

### 1. Railway 백엔드 배포

**브라우저에서 Railway 수동 배포:**

1. **Railway 웹사이트 접속**: https://railway.app
2. **GitHub로 로그인** 후 "New Project" 클릭
3. **"Deploy from GitHub repo"** 선택
4. **저장소 연결** 후 다음 설정:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. **환경변수 설정** (Variables 탭):
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://qr-upload-viewer.vercel.app
   CORS_ORIGIN=https://qr-upload-viewer.vercel.app
   DATABASE_URL=./data/qr_viewer.db
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   QR_ERROR_CORRECTION=M
   QR_MARGIN=1
   QR_WIDTH=256
   ```

6. **배포 완료 후 URL 복사** (예: `https://qr-upload-viewer-backend.up.railway.app`)

### 2. 프론트엔드 환경변수 업데이트

백엔드 URL이 확정되면 프론트엔드 환경변수를 업데이트하세요:

```bash
cd frontend
echo "REACT_APP_API_BASE_URL=https://[YOUR-RAILWAY-URL]" > .env
```

### 3. Vercel 프론트엔드 배포

**브라우저에서 Vercel 수동 배포:**

1. **Vercel 웹사이트 접속**: https://vercel.com
2. **GitHub로 로그인** 후 "New Project" 클릭
3. **저장소 연결** 후 다음 설정:
   - **Framework Preset**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **환경변수 설정** (Settings > Environment Variables):
   ```
   REACT_APP_API_BASE_URL=https://[YOUR-RAILWAY-URL]
   REACT_APP_API_URL=https://[YOUR-RAILWAY-URL]/api
   ```

5. **배포 완료**

### 4. CLI를 통한 배포 (옵션)

터미널에서 배포하려면:

```bash
# Railway 로그인 (브라우저 팝업)
railway login

# 백엔드 배포
cd backend
railway init
railway up

# Vercel 배포  
cd ../frontend
vercel
vercel --prod
```

## 🧪 배포 검증

배포 완료 후 다음을 확인하세요:

1. **백엔드 Health Check**:
   ```bash
   curl https://[YOUR-RAILWAY-URL]/health
   ```

2. **프론트엔드 접속**:
   - https://[YOUR-VERCEL-URL] 접속
   - 이미지 업로드 테스트

3. **QR 코드 기능**:
   - 이미지 업로드 후 QR 생성
   - 모바일에서 QR 코드 스캔
   - 이미지 정상 표시 확인

## 📋 체크리스트

- [ ] Railway 백엔드 배포 완료
- [ ] 백엔드 Health Check 통과
- [ ] 프론트엔드 환경변수 업데이트
- [ ] Vercel 프론트엔드 배포 완료
- [ ] 이미지 업로드 기능 테스트
- [ ] QR 코드 생성 기능 테스트
- [ ] 모바일 QR 스캔 테스트
- [ ] 이미지 뷰어 페이지 테스트

## 🐛 문제 해결

**CORS 오류 발생 시:**
- Railway 환경변수에서 `CORS_ORIGIN` 확인
- Vercel URL이 정확한지 확인

**이미지 로드 오류 시:**
- 프론트엔드 환경변수의 백엔드 URL 확인
- Railway 배포 상태 확인

**QR 코드 스캔 시 이미지 안 보임:**
- QR 코드의 URL이 올바른지 확인
- `view.html` 페이지가 정상 작동하는지 확인

## 📞 지원

배포 중 문제가 발생하면:
1. Railway/Vercel 대시보드에서 로그 확인
2. 환경변수 설정 재확인
3. 배포 가이드 문서 참조: `DEPLOYMENT.md`

배포가 성공하면 QR 코드 기반 이미지 공유 서비스가 완전히 작동합니다! 🎉