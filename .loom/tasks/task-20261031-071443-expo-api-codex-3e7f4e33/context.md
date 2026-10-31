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

- Title: 앱 MVP 개발 기반과 Codex 인계
- Goal: React Native Expo TypeScript 앱 시작 틀과 서버 계약 연결 계층, 모의 자료, 2D 지도 및 실시간 안내 기반, 초보 개발자용 Codex 지침과 docs를 제공한다. 3D는 MVP에서 제외한다.
- Branch: main
- Task count: `1`

## Task

- Title: Expo 앱 실행 틀과 실시간 API 연동 및 Codex 개발 지침 작성
- Description: 사용자의 직접 요청에 따라 1대 컴퓨터의 Codex에서 이미지 기반 화면 개발을 시작할 수 있는 앱 기반을 구축한다. 기존 API와 실제 서버 미구현을 구분하고 서버 제공 대화, 대응 단계 갱신, 2D 경로, 단말 TTS와 백그라운드 제약을 코드와 문서로 인계한다.
- Expected output: 실행 가능한 Expo TypeScript 앱, 모의 및 실제 API 어댑터, 화면 기본 틀, 실시간 갱신과 TTS 및 2D 지도 연결, AGENTS 지침, docs와 테스트 결과
- Done condition: 의존성 설치와 타입 검사 및 핵심 동작 테스트와 번들 검사가 통과하고 기존 명세 및 확장 필요사항을 추적하며 로컬 커밋과 Loom 완료 기록을 남긴다.
- In scope: 앱 레포 기본 구성; 기존 API 읽기 및 명세 사본; 모의 화면; 실시간 업데이트 및 수명주기; 2D 지도; 단말 TTS; 앱 에이전트 작업 지침; 문서와 검증
- Out of scope: 서버 배포와 정책 확정; 실제 긴급 신고; 계정 생성 및 유료 신청; 원격 push; 3D 구현; 백그라운드 영구실행 보장
- Validation hint: TypeScript; Expo 의존성 및 config; 핵심 상태와 경로 유효성 및 API 요청 테스트; Android 번들; 문서 링크; Loom strict
- Required docs: -
- Memory refs: -
- Document outputs: `docs/README.md`, `docs/01-start-here.md`, `docs/02-api-integration.md`, `docs/03-realtime-background.md`, `docs/04-map-tts.md`, `docs/05-codex-workflow.md`, `docs/06-server-handoff.md`
- Document output exceptions: -
- Source proposal: `-`
- Status: PENDING
- Assigned agent: foreground

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

## Context References

No explicit context references recorded for this job.

## Required Documents and Memory

No task-level required docs or memory refs recorded.

## Verified Team Policies

No verified Team Policy Snapshot is active.

## Active Workflow Memory

No active workflow memory recorded.
