# 점검과 조치

초기 카메라만 지정하면 후속 위치를 반영하지 않아 ref의 animateRegionTo를 사용했다. Naver Region은 남서쪽 좌표 기준이며 polygon은 닫힌 시계방향으로 생성했다. 리뷰에서 만료된 위치의 관련성 문구가 남을 수 있어 usable과 유효 위치 조건을 함께 적용했다. simulation을 위치 출처로 단정하지 않고 공유한 위치라고 표시한다. Secret은 복사하지 않았다.
