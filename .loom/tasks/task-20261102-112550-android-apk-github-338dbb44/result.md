# 결과

기존 실기기 검증 APK 0.4.0을 앱 저장소 `v0.4.0-mvp` prerelease로 게시했다. APK와 SHA256SUMS.txt 두 파일의 업로드와 재다운로드 무결성을 확인했다.

- 릴리스: https://github.com/duswls98952/BONGHWAJIGI_APP/releases/tag/v0.4.0-mvp
- APK: https://github.com/duswls98952/BONGHWAJIGI_APP/releases/download/v0.4.0-mvp/bonghwajigi-0.4.0-private-arm64.apk
- 문서: docs/20-github-apk-release.md
- 근거: docs/validation/github-apk-release.json

## 실행한 검증

- APK SHA256·66104750bytes가 기존 빌드 보고서와 일치: 통과.
- apksigner verify exit 0, v2 서명·16KB 정렬·non-debuggable 확인: 통과.
- 비밀정보 정적 검사: 개인키·서버 토큰·서명 비밀번호 내장 흔적 미발견.
- gh release create/view/download 및 태그 API 조회 exit 0. 게시 상태와 에셋2개, 빌드커밋74b4b65b95e2a59c2bc91518c2f677b11ce47b2c 확인: 통과.
- 재다운로드 APK SHA256과 체크섬 원본 일치: 통과.
- npm run check:docs exit 0, 25개 문서 링크 검사 통과.
- loom validate --strict exit 0, 82개 Task 정합성 통과.
- git diff --check exit 0 통과.

## 다음 행동과 조건

릴리스 링크에서 APK를 받을 수 있다. Tailscale 접근이 필요하며 서버 가동에 따라 기능이 제한될 수 있다. 사용자의 추가 지시에 따라 서버에 접속하거나 재시작하지 않았다. 앱 코드는 바꾸지 않았고 기존 APK를 그대로 게시했다.
