# Previous Results

51 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

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

## 53. 로딩 원형 제거와 정부색 글자 물결 적용

# 작업 결과

- 로딩 화면에서 원형 문양과 앞뒤 레이어를 제거하고 `봉화지기` 글자만 중앙에 표시했다. 사용하지 않는 시안용 PNG 복사본도 삭제했다. 문서의 원형 참고 이미지는 참고 자료로 보관한다.
- 글자 전체를 정부청색 `#003764`과 정부적색 `#e4032e`의 움직이는 그라데이션으로 채웠다. 움직임 줄이기 설정에서는 색 이동을 멈춘다.
- 모바일 화면 기획서를 현재 시안에 맞췄다. 홈 로고와 `#loading` 고정 미리보기, 일반 주소의 홈 전환은 유지했다.

## 검증

- Chrome `#loading` 1초·5초 캡처: 원형 없이 글자만 표시되며 두 색의 배치가 달라진다.
- Chrome 일반 주소 5초 캡처: 홈으로 전환되고 홈 로고는 유지된다.
- Chrome 움직임 줄이기 설정 1초·5초 캡처: 화면 이미지가 동일하다.
- `node --check public/prototype/app.js`, `npm run check`(타입 검사·테스트 14개·문서 링크 검사), `git diff --check` 통과.

## 남은 사항과 다음 행동

- 이 변경은 HTML 시안이다. Expo 네이티브 시작 화면에 적용할 때 같은 색과 움직임을 별도로 구현해야 한다.
