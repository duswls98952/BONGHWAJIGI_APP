# Previous Results

50 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

## 51. 로딩 화면 고정 미리보기 주소 추가

# 작업 결과

- `public/prototype/index.html#loading`으로 직접 열면 자동 홈 전환 없이 로딩 화면을 계속 볼 수 있게 했다. 로고의 색 애니메이션은 계속 동작한다.
- 주소 해시 없이 처음 열면 기존과 같이 약 2.6초 뒤 `#home`으로 전환한다. `#home` 등 직접 화면 진입도 유지했다.
- README와 모바일 화면 기획서에 고정 미리보기 주소를 설명했다.

## 검증

- Chrome 가상 시간 5초 캡처에서 `#loading`은 로딩 화면을 유지하고 해시 없는 주소는 홈 화면으로 전환하는 것을 확인했다.
- `node --check public/prototype/app.js`, `npm run check`(타입 검사·테스트 14개·문서 링크 검사), `git diff --check` 통과.

## 남은 사항과 다음 행동

- 시안의 로딩 시간은 실제 서버 준비 상태와 연결되지 않은 2.6초 시연값이다. 일반 사용자는 주소 끝에 `#loading`을 붙여 애니메이션을 살펴볼 수 있다.

## 52. 로딩 원형 문양 원본과 앞뒤 레이어 적용

# 작업 결과

- 로딩 화면의 근사 SVG 원형을 저장된 정부상징 원형 문양 PNG 원본으로 교체했다. `public/prototype/government-symbol.png`는 참고 PNG와 SHA-256이 같다.
- 원본 문양은 글씨 뒤에 놓고, 같은 PNG에서 빨간 부분만 SVG 색상 필터로 분리한 레이어를 글씨 앞에 놓았다. 글씨를 크게 조정하고 밝은 윤곽 효과를 더해 남색 영역 위에서도 읽히게 했다.
- 모바일 화면 기획서에 원본 사용과 앞뒤 배치를 반영했다. `#loading` 고정 미리보기와 일반 주소의 홈 전환은 유지했다.

## 검증

- 두 PNG의 SHA-256: `08b895677a1336c19ecbfbb7057a0caddfc5aaa7baf75005cc6e298a81c60e8c`로 일치.
- Chrome 캡처: `#loading`은 가상 시간 5초 후에도 로딩 화면이며 원형·글씨가 보인다. 해시 없는 주소는 5초 후 홈 화면이다.
- `node --check public/prototype/app.js`, `npm run check`(타입 검사·테스트 14개·문서 링크 검사), `git diff --check` 통과.

## 남은 사항

- HTML 시안 변경이다. Expo 네이티브 시작 화면에는 별도 적용이 필요하다.
