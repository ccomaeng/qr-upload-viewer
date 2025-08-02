# 🔧 GitHub 저장소 설정

## 1. GitHub에서 새 저장소 생성

1. **GitHub 웹사이트 접속**: https://github.com
2. **로그인** 후 우상단 "+" 버튼 → "New repository" 클릭
3. **저장소 설정**:
   - **Repository name**: `qr-upload-viewer`
   - **Description**: `QR 코드 기반 이미지 업로드 및 뷰어 시스템`
   - **Visibility**: Public 또는 Private (선택)
   - **Initialize**: ❌ README, .gitignore, license 추가하지 마세요 (이미 있음)

4. **"Create repository"** 클릭

## 2. 로컬 저장소를 GitHub에 연결

GitHub에서 새 저장소를 만든 후, 다음 명령어를 실행하세요:

```bash
cd /Users/yujineom/qr-upload-viewer

# GitHub 저장소를 원격 저장소로 추가 (YOUR_USERNAME을 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/qr-upload-viewer.git

# 기본 브랜치를 main으로 설정
git branch -M main

# GitHub에 업로드
git push -u origin main
```

## 3. SSH 사용 시 (옵션)

SSH 키가 설정되어 있다면:

```bash
git remote add origin git@github.com:YOUR_USERNAME/qr-upload-viewer.git
git push -u origin main
```

## 4. 업로드 확인

성공하면 GitHub 저장소에서 다음을 확인할 수 있습니다:
- 45개 파일 업로드 완료
- README.md가 저장소 메인 페이지에 표시
- 배포 설정 파일들 확인 가능

## 5. 다음 단계

GitHub 업로드가 완료되면:
1. **Railway**: https://railway.app 에서 이 저장소 연결
2. **Vercel**: https://vercel.com 에서 이 저장소 연결

---

## ⚠️ 중요 사항

- **환경변수 보안**: `.env` 파일은 `.gitignore`에 포함되어 있어 업로드되지 않습니다
- **민감정보 제거**: 업로드된 이미지와 데이터베이스 파일은 `.gitignore`로 제외됩니다
- **프로덕션 준비**: 모든 배포 설정이 포함되어 있어 바로 배포 가능합니다

## 🎯 현재 상태

✅ Git 저장소 초기화 완료  
✅ 모든 소스 코드 커밋 완료  
⏳ GitHub 원격 저장소 연결 대기  
⏳ Railway/Vercel 배포 대기