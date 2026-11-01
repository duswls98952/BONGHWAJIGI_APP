# 목업 기반 앱 구현 기록

2026-11-01 KST. Loom Task `task-20261031-154046-expo-4e0177fb` 산출물이다. [목업·API 차이 점검](08-live-integration-audit.md)을 바탕으로 HTML 시안을 Expo Router 화면과 현재 서버0.2 계약에 연결했다. 실제 서버 배포·실기기 인수·APK 결과는 후속 통합 검증 기록에서 확정한다.

## 화면 구현

| 화면 | 현재 구현 |
| --- | --- |
| 초기 로딩 | 저장 세션 복원 상태; 고정 지연 후 성공 화면으로 넘어가지 않음 |
| 온보딩 | 필수·선택 건강 정보 동의, 프로필 입력, 설치 세션·단말·프로필 저장 후 진입 |
| 홈 | 브랜드, 2D 도식, 위치 상태, 공식 원문, 서버 수칙·준비 카드, 주변 자료 |
| 긴급 대응 | 3단계 색상/제목, 공식 원문·개인 정책 분리, 지역 도식, 최신 발화, 상태 저장, 행동 |
| 내정보 | 실제 API 조회·저장·충돌 안내·삭제, 위치 공유/삭제, 알림 권한 요청, 로그아웃 |
| 산불 수칙 | 서버 기본 수칙·회피 목록·출처 |
| 대피로 | 2D 도식과 경로 미제공 안내; 검증되지 않은 경로선 없음 |
| 119 준비 | 기기 내 수정 가능한 초안·전화 화면 확인·문자 작성 화면; 자동 발신 없음 |

시안의 예시 지역·다른 재난·기상·날짜는 LIVE 기본값으로 넣지 않았다. 앱 브랜드에는 시스템 글꼴을 사용한다. mock 버튼은 테스트 서버 합성 응답을 재생하며 앱 자체 위험도 계산을 하지 않는다.

## 주요 파일과 계약

| 위치 | 역할 |
| --- | --- |
| app/_layout.tsx, app/*.tsx | 현재 Provider·화면 라우팅·알림 선택 |
| src/mvp/Runtime.tsx | 세션 복원, 전경 갱신 루프, 입력 버전, 변경 후 재조회 |
| src/mvp/session.ts | origin별 저장, 단일 refresh, 로그아웃/갱신 경쟁 방지 |
| src/mvp/core.ts | snapshot·revision·유효기간·입력 버전 검사 |
| src/api/client.ts, http.ts | API 호출·인증·versioned envelope·오류·취소 |
| src/api/mvp-generated.ts | 현재 OpenAPI 생성 타입 |
| src/mvp/mock.ts | 테스트 서버 합성0.2 응답 재생 |
| src/mvp/Home.tsx, Emergency.tsx, Profile.tsx, Rules.tsx | 목업 디자인과 데이터·저장·오류 상태 연결 |
| src/mvp/Map.tsx, Route.tsx, Support.tsx | 2D 도식·경로 미제공·기기 신고 준비 |
| src/platform/ | 설치 ID, SecureStore, 위치, 알림, 단말 TTS |

이전 src/runtime, src/core, src/api/generated.ts 일부는 기존 검사와 이력 때문에 남아 있다. 현재 화면은 src/mvp 경로를 사용한다. 이전0.1 로그인 미구현·after 쿼리·voice-turns·3D 경로 설명을 현재 상태로 적용하지 않는다.

## 일관성 조건

실제 예측은 연결하지 않았다. unavailable/null을 유지하고 대응 단계는 personal_response만 표시한다. 공식 등급은 별도 원문 카드에 표시한다.

세션 갱신은 동시에 한 번만 실행하며 로그아웃·새 계정 연결 중 늦게 도착한 refresh가 이전 토큰을 복원하지 못하도록 한다. HTTP 개발 예외는 명시적으로 켠 loopback 주소로 제한한다.

정책 ID·revision·생성시각·만료·입력 버전을 검사한다. 수락한 프로필·위치·상태보다 오래된 입력으로 만든 행동은 보류한다. 긴급 화면 대상이 바뀌면 이전 사건의 미저장 상태를 재사용하지 않고 다른 경보 원문도 섞지 않는다.

mock은 상태 저장 시 정책 입력 버전을 올리고 시연 단계가 바뀌어도 context revision을 되돌리지 않는다. FCM 파서는 잘못된 타입을 revision0으로 강제 변환하지 않는다. mock에서 실제 GPS·전화·문자를 사용하지 않는다.

## 자동 검사 근거

Node **24.22.2** 환경에서 다음 명령을 실행했다.

```sh
npm run check
```

- TypeScript 검사 통과.
- 전체 **40개 테스트 통과**: 기존14개와 신규 MVP26개.
- 문서 링크 검사 통과. 이번 문서 갱신 후 14개 문서 파일의 링크를 확인했다.
- loom validate --strict 통과. workflow 결과·완료 기록과 커밋은 통제 에이전트가 함께 정리한다.

신규 테스트는 `tests/mvp-session.test.ts`, `mvp-snapshot.test.ts`, `mvp-http.test.ts`, `mvp-mock.test.ts`, `mvp-push.test.ts`다. refresh 동시 실행·로그아웃 경쟁·origin 변경, ID/revision/만료/입력 버전, 0.2 envelope·loopback HTTP, mock3단계·프로필 충돌·현재 상태·cursor, FCM payload를 검사한다.

후속 읽기 검토로 쓰기 응답의 세션 변경 검사, 원격 로그아웃 실패 후 로컬 삭제 경로, 경보 ID 일치 검사, 긴급 화면 대상별 초기화를 보완했다. React 화면·native 동작은 단위 테스트40개만으로 검증됐다고 취급하지 않는다.

FCM 공식 경보의 내부 ID·사용자 공개 ID 불일치는 서버 커밋 `dcbc62e`에서 보완했다. delivery worker가 발송용 ID를 인증된 API와 동일한 사용자별 HMAC opaque ID로 변환하며 서버 회귀검사 93개가 통과했다. 실제 Firebase 전달 검증은 포함하지 않는다.

## 남은 검증 경계

이 문서 작성 시점에는 실제 휴대폰 설치·TTS·GPS·서버 갱신 성공을 여기서 확정하지 않는다. 브라우저 화면, Android/Web JS 번들, native APK 빌드, 실제 단말 검사는 서로 다른 증거다. 완료 항목과 APK 경로는 [검증 기록](07-validation.md)에 추가한다.

이 문서의 초기 구현 이후 Android 0.2.1에서 [네이버 지도 연결](11-naver-map-integration.md)을 추가했다. Firebase는 미준비다. 실제 대피 경로는 unavailable이며 3D·실제 예측·서버 음성·STT·정식 본인인증·계정 탈퇴는 제공하지 않는다. 내부 시연 동의 문구는 정식 공개 서비스의 약관·개인정보 처리방침 확정으로 해석하지 않는다. 남은 연결은 [통합 인계](06-server-handoff.md)를 따른다.
