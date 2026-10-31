# Context

## Loom 코드 계약

아래 항목은 Loom 코드에 고정된 runtime 동작 계약입니다. 관련 흐름을 바꾸기 전 `loom contract show <id>`로 확인합니다.

- `task-execution`: Task 실행 전 prompt/context/previous-results에 들어가는 입력 경계입니다. 명령: `loom contract show task-execution`. Source: `loom/application/context_pack.py`, `loom/application/team_policy.py`
- `done-guardrail`: Task를 DONE으로 인정하기 전에 필요한 산출물과 상태 전이를 검증하는 계약입니다. 명령: `loom contract show done-guardrail`. Source: `loom/application/services.py`

## Project Memory

# BONGHAWJIGI_APP

Loom 프로젝트 메모리 루트입니다.

이 파일은 `loom init`으로 생성되며 `loom analyze-repo`로 보강할 수 있습니다.

## Workspace Policy

- Output language: `ko`
- Agent provider: `claude`
- Agent model: `adapter-default`
- Reasoning effort: `high`
- Required branch: `develop`
- Dirty branch switch: `blocked`
- Commit policy: `manual`
- Include `.loom` metadata in Git: `yes`
- Read-only parallel execution: `allowed`
- Validation environment: `auto`
- Previous Task result limit: `2`
- Workspace required docs: -
- Loom fixed guardrails and verified Team required policies take precedence over this Workspace Policy.

## Job

- Title: 완성 목업의 앱 구현과 실서버 통합·APK 배포
- Goal: 사용자가 완성한 HTML 목업을 개발 서버에서 전 화면 확인하고 최신 서버 계약의 공백을 대조한다. Expo 앱에 화면과 동작을 구현해 실제 서버로 기능을 검증하고 설치 가능한 Android APK와 인수 자료를 제공한다. 배포 저장소는 앱 원격을 서브모듈로 고정한다. 기존 실제 예측 제외와 Firebase 미준비 조건은 유지한다.
- Branch: develop
- Task count: `8`

## Task

- Title: A 프로필 첫 9초 교체와 직접 선택 촬영 준비
- Description: 사용자가 A 확인본 첫 9초를 잘라내고 이동과 의사소통 영역을 직접 스크롤·선택하는 새 녹화를 준비하라고 요청했다.
- Expected output: 첫9초 제외 본편과 교체 촬영 준비 상태 및 기록
- Done condition: 기존 원본을 보존한 채 확인본 0~9초 제외 파일을 검증하고, 사용자 직접 선택 장면의 단말 연결과 녹화 준비를 확인한다.
- In scope: 영상 앞9초 제외; USB·미러 상태 확인; 사용자 직접 선택 촬영 준비; 사용자 준비 후 대체 장면 녹화
- Out of scope: 자동 프로필 선택; 서버 데이터 변경; B 촬영; 오프닝 및 분할 화면 제작; 실제GPS·119; 외부 업로드
- Validation hint: 정확한9초경계와79.7초 영상, 디코드, 단말 연결, Loom strict
- Required docs: -
- Memory refs: -
- Document outputs: `docs/15-scenario-a-profile-retake.md`
- Document output exceptions: -
- Source proposal: `-`
- Status: PENDING
- Assigned agent: -

## Advisor Source Prompt

No Advisor source prompt recorded for this Task.

## Inclusion Policy

- Mandatory execution files: `prompt.md`, `context.md`, and `previous-results.md`.
- Always included: project memory, current Job/Task metadata, and Job notes.
- Previous results: up to the latest 2 recorded results from earlier Tasks in this Job.
- Job context refs: explicit Job-scoped references selected by the controlling agent or user.
- Task required docs: mandatory Task-scoped documents; missing refs block validation and execution.
- Task memory refs: mandatory Task-scoped workflow memory references; missing or non-memory refs block validation and execution.
- Repository documents, validation documents, and skill rules: included only through explicit Job context refs, Task required docs, or Task memory refs.
- Verified Team Policy Snapshot: included before Active Memory; required policy cannot be overridden by lower-priority context.
- Active workflow memory with an `always` category is included automatically while its status is `ACTIVE`.
- `task_selected` and `reference_only` memory is included only through explicit Task memory refs.
- Consumed proposals, rejected proposals, resolved memory, superseded memory, and archived memory are excluded.
- Unreferenced repository files and results from other Jobs are not included.
- `AGENTS.md` and `CLAUDE.md` remain session-level controlling-agent entrypoints and are not treated as task context artifacts by default.

## Job Notes

# Notes

## 2026-10-31T18:54:09+00:00

목업 UI, STT→텍스트 대화→확인 기반 상태 반영, 합성 시연 경로 구현. 사용자의 추가 카드 대비·라운드 요청도 같은 UI 범위로 반영. npm run check 58 tests 및 문서 링크, web export 통과. 실서버 실제 Qwen smoke 통과. Android 빌드/실기기 QA 진행.

- Task: `task-20261031-182848-task-6374db8a`
- Tags: `progress`, `validation`
## 2026-10-31T19:10:25+00:00

0.3.0 단말 설치와 지도 경로선/목적지 마커 확인. 말하기 직후 취소 재현: 이미 허용된 마이크의 REQUEST_PERMISSIONS Activity가 매번 열림. 권한 조회 후 필요시에만 요청하도록 0.3.1/code5 수정. npm run check 62개 통과. 재빌드·실기기 재검증 진행.

- Task: `task-20261031-182848-task-6374db8a`
- Tags: `troubleshooting`, `validation`
## 2026-10-31T19:18:12+00:00

0.3.1 마이크 권한 재요청 수정본을 깨끗한 소스 c0b87ea2에서 빌드하고 Samsung Android15에 업데이트 설치했다. versionCode5와 RECORD_AUDIO 기존 허용을 확인했다. npm run check 62개 테스트 통과, 합성 지도 경로는 사용자 확인 완료. 음성 입력·상태 반영의 사용자 재검증을 기다리며 완료 상태로 전환하지 않는다.

- Task: `task-20261031-182848-task-6374db8a`
- Tags: `android`, `speech`, `verification`
## 2026-10-31T19:20:36+00:00

사용자가 0.3.1 음성 인식과 상태 반영 모두 정상임을 확인했다. 단말 로그의 기존 권한 재사용·온디바이스 인식 시작/종료와 CUA 인식문·계단 이용 어려움 제안 화면이 일치한다. 경로선/목적지 마커도 사용자와 CUA 확인 완료. 최종 검증 문서와 APK manifest를 기록하고 원격/서브모듈 고정을 마무리한다.

- Task: `task-20261031-182848-task-6374db8a`
- Tags: `android`, `speech`, `verification`
## 2026-10-31T20:12:09+00:00

0.4.0 지역행동요령·공통/개인준비·A/B확인상태·전경알림 구현과 실폰설치완료. 78tests/웹/Android검증,사용자가알림음1회·위급3·아이질문확인. 상세 docs/13-location-guidance-scenarios.md.

- Task: `task-20261031-193008-task-33cb114d`
- Tags: `filming`, `android`
## 2026-10-31T20:40:20+00:00

A 실제 폰 원본 6분18.8초·88.7초 확인본·36.7초 알림음 마이크 보충본을 로컬 저장했다. 실제 STT→Qwen 제안→명시 확인→아이 동반·위급3단계와 맞춤 안내를 사용자·서버·영상으로 확인했다. 본편은 TTS를 포함하고 시스템 알림음은 별도 보충본이다. 전체 디코드·19개 문서링크·Loom strict 통과, 모든 녹화 종료. 상세 docs/14-scenario-a-recording.md.

- Task: `task-20261031-202001-a-5f3e9a39`
- Tags: `recording`, `android`, `validation`

## Context References

No explicit context references recorded for this job.

## Required Documents and Memory

No task-level required docs or memory refs recorded.

## Verified Team Policies

No verified Team Policy Snapshot is active.

## Active Workflow Memory

No active workflow memory recorded.
