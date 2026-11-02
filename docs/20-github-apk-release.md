# GitHub APK 릴리스

2026-11-02 KST. 사용자의 요청에 따라 기존 실기기 검증 APK를 앱 저장소에 게시했다.

- [릴리스 페이지](https://github.com/duswls98952/BONGHWAJIGI_APP/releases/tag/v0.4.0-mvp)
- [APK 다운로드](https://github.com/duswls98952/BONGHWAJIGI_APP/releases/download/v0.4.0-mvp/bonghwajigi-0.4.0-private-arm64.apk)
- [SHA256SUMS.txt](https://github.com/duswls98952/BONGHWAJIGI_APP/releases/download/v0.4.0-mvp/SHA256SUMS.txt)

태그는 `v0.4.0-mvp`, 공개 상태는 prerelease다. 버전 0.4.0 / versionCode 6이며 `com.bonghwajigi.app`, Android 7.0(API 24) 이상, arm64-v8a 기기를 지원한다. 크기는 66,104,750bytes다. 태그는 실제 빌드 소스 `74b4b65b95e2a59c2bc91518c2f677b11ce47b2c`를 가리킨다.

## 설치와 연결

Android 휴대폰에서 APK를 내려받아 설치한다. 기존 앱과 같은 서명이며 JS가 내장되어 Expo·Metro 개발 서버나 USB 연결은 필요하지 않다. 앱의 서버 기능에는 해당 Tailscale 사설망과 서버 접근 권한이 필요하다.

사용자는 GPU 서버가 중지됐을 가능성을 알리고 앱만 게시하도록 요청했다. 이번 작업에서 일반·GPU 서버에 접속하거나 상태를 검증·변경하지 않았다. GPU가 중지된 경우 새 AI 분석·대화 생성이 제한될 수 있음을 릴리스에 명시했다. Firebase 원격 푸시는 아직 미연결이며 참고 경로는 실제 통행 가능성을 보장하지 않는다.

## 검증

- 원본 APK 해시·크기와 기존 빌드 보고서 일치.
- `apksigner verify` exit 0, 고유 내부 release v2 서명 유효. non-debuggable·cleartext=false·16KB 정렬 검사 통과.
- 정적 검사에서 서버 토큰·개인키·서명 비밀번호 내장 흔적 미발견. 공개 지도 Client ID와 사설망 주소는 설정대로 포함.
- GitHub 릴리스 게시 상태·태그 대상 커밋·에셋 2개 업로드 완료 확인.
- 실제 릴리스 APK와 체크섬을 다시 다운로드해 원본과 동일함을 확인.

APK SHA256: `7b7f44d5f39de3c540e14bae65ea17f1cea907fcde39aa3336ec747376a4fec7`.

[검증 기록](validation/github-apk-release.json). APK·체크섬만 첨부했고 키·계정 설정·로컬 빌드 보고서는 업로드하지 않았다.
