# Previous Results

28 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

## 29. 홈 브랜드명에 SUITE Bold 적용

# 작업 결과

- 정적 HTML 시안의 홈 상단 `봉화 지기`에만 SUITE Bold를 적용했다.
- 공식 SUITE 저장소의 `SUITE-Bold.woff2`와 OFL 1.1 라이선스를 `public/prototype/`에 포함했다. CSS는 로컬 상대 경로로 폰트를 읽는다.

## 검증

- 폰트 파일이 WOFF2 형식임을 확인했고, 로컬 서버에서 HTML·CSS·폰트가 HTTP 200으로 제공됐다.
- Safari에서 홈 화면과 브랜드명 표시를 확인했다.
- `npm run check` 통과: 타입 검사, 테스트 14개, 문서 링크 검사. `git diff --check` 통과.

## 남은 사항과 다음 행동

- 이번 변경은 HTML 시안의 브랜드명에만 적용됐다. Expo 앱의 글꼴 적용은 별도 작업이 필요하다.

## 30. 홈 글꼴 복원과 회색 텍스트 검은색 적용

# 작업 결과

- 홈 브랜드명에 적용했던 SUITE Bold를 제거하고 이전 시스템 글꼴과 굵기로 복원했다. 사용하지 않는 폰트 파일과 라이선스 사본도 제거했다.
- HTML 시안의 회색 글씨를 검은색으로 바꿨다. 홈 카드·재난 목록, 긴급 대응, 대피로, 프로필 미선택 태그·도움말, 기본 수칙, 지도 지명을 포함한다.
- 경보의 빨간색, 선택 상태와 음성 안내의 파란색, 119 버튼의 흰 글씨는 그대로 유지했다. 모바일 화면 기획서에 이 표시 규칙을 기록했다.

# 검증

- Safari에서 홈·프로필·긴급 대응·기본 수칙 화면의 글꼴과 글씨 색을 확인했다.
- `npm run check`: 타입 검사, 14개 테스트, 문서 링크 검사 통과.
- CSS·SVG 색상 규칙을 검색해 회색 텍스트 지정이 남지 않은 것을 확인했다.

# 남은 위험과 다음 행동

- 이번 변경은 정적 HTML 시안에만 적용된다. Expo 앱 화면에도 같은 표현이 필요해지면 별도 작업에서 반영한다.
- 작업 전부터 수정된 이전 Loom 기록 파일은 이 작업에서 변경하거나 커밋하지 않는다.
