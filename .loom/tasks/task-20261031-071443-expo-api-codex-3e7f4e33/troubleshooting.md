# 문제 해결 및 잔여 항목

1. 기본 Node 25는 Expo 58 지원 조합이 아니므로 임시 경로의 Node 24.22.2로 검증했다. 시스템 Node는 변경하지 않고 .nvmrc/engines에 24를 명시했다.
2. OpenAPI 생성기의 TypeScript 5 peer와 앱 TypeScript 6 충돌은 tools/api-generator의 별도 잠금 파일로 분리했다. force 설치는 사용하지 않았다.
3. sandbox에서 tsx 직접 실행의 IPC 오류는 node --import tsx --test로 해결했다. TS6의 Node 테스트 타입은 tsconfig에 명시했다.
4. main에서 task run이 workspace develop 정책으로 실패한 후 develop을 생성해 정상 시작했다.
5. 웹 확인에서 disabled query의 queryFn 누락 경고를 수정했다. 네이버 다각형 winding 변환, 수락된 입력 버전 검사, TTS 화면 focus 검사도 보완했다.
6. npm audit은 Expo 개발/빌드 전이 의존성 13개를 보고했다. 강제 수정안의 Expo 51 downgrade를 적용하지 않고 잔여 항목으로 기록했다.
7. 실제 서버·인증·네이티브 지도·푸시 자격 증명은 이번 범위 밖이며 모의 성공으로 대체 검증하지 않았다. 실제 119 연락은 하지 않았다.
