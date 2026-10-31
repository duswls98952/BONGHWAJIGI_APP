# Previous Results

6 older recorded result(s) were omitted. Promote durable context to Job Notes or explicit Context References.

## 7. 홈 지도 아래 위치 표시 배치

# 결과

HTML 홈에서 위치 아이콘과 `서울특별시 구로구 구로동` 문구를 「우리 동네는 지금?」 지도 바로 아래로 옮겼다. 주변 소식 조회 반경 버튼과 `GPS` 문구는 제거했다. 지도 안의 내 위치 표시는 유지했다.

검증: HTML 파서로 홈 요소 순서가 제목 → 지도 → 주소 행인지 확인하고 조회 반경 및 `GPS`가 홈에 없는지 검사해 통과했다. Safari에서 지도 아래 주소 배치와 제거 항목을 확인했다. `git diff --check`가 통과했다.

남은 위험: 실제 모바일 기기에서는 확인하지 않았다. 다음 행동: 홈 화면에서 지도 아래 주소 배치를 확인한다.

## 8. 홈 봉화 지기 제목 크기 확대

# 결과

HTML 홈 상단의 `봉화 지기` 제목 크기를 23px에서 27px로 키웠다.

검증: CSS 값 검사와 `git diff --check`가 통과했다. Safari에서 제목이 커진 상태로 표시되고 오른쪽 `프로필` 링크와 겹치지 않는 것을 확인했다.

남은 위험: 실제 모바일 기기에서는 확인하지 않았다. 다음 행동: 홈 화면에서 제목 크기를 확인한다.
