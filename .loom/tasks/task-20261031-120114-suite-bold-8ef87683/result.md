# 작업 결과

- 정적 HTML 시안의 홈 상단 `봉화 지기`에만 SUITE Bold를 적용했다.
- 공식 SUITE 저장소의 `SUITE-Bold.woff2`와 OFL 1.1 라이선스를 `public/prototype/`에 포함했다. CSS는 로컬 상대 경로로 폰트를 읽는다.

## 검증

- 폰트 파일이 WOFF2 형식임을 확인했고, 로컬 서버에서 HTML·CSS·폰트가 HTTP 200으로 제공됐다.
- Safari에서 홈 화면과 브랜드명 표시를 확인했다.
- `npm run check` 통과: 타입 검사, 테스트 14개, 문서 링크 검사. `git diff --check` 통과.

## 남은 사항과 다음 행동

- 이번 변경은 HTML 시안의 브랜드명에만 적용됐다. Expo 앱의 글꼴 적용은 별도 작업이 필요하다.
