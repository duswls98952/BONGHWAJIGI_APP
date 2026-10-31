# 점검과 조치

초기 카메라만 지정하면 후속 위치를 반영하지 않아 ref의 animateRegionTo를 사용했다. Naver Region은 남서쪽 좌표 기준이며 polygon은 닫힌 시계방향으로 생성했다. 리뷰에서 만료된 위치의 관련성 문구가 남을 수 있어 usable과 유효 위치 조건을 함께 적용했다. simulation을 위치 출처로 단정하지 않고 공유한 위치라고 표시한다. Secret은 복사하지 않았다.

최초 단말 확인에서 지도만 보이고 마커가 없었다. 화면은 현재 위치 미확인 전국 보기였으며 사용자가 합성 위치를 저장하자 마커와 카메라 이동이 나타났다. 서버에서 위치 revision2·fresh와 정책 반영 완료를 대조했고 경보 상세 붉은 영역은 사용자 확인으로 검증했다. 유효기간5분은 유지했다. 단말 로그에 native 초기화가 있어도 타일 성공으로 간주하지 않고 실제 지도 화면을 확인했다.

## DONE Guardrail

아래 필수 작업 기록이 부족해 `DONE` 대신 `REVIEW_REQUIRED`로 전환했습니다.

- validation evidence

Next action: 완료 계약을 증명하는 기록이 부족하거나 미해결 요청이 있어 검토가 필요합니다. result/decision/troubleshooting/log/event/artifact와 검증 근거를 보강하거나 요청을 해결한 뒤 다시 완료 처리하세요.
