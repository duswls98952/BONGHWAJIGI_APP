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
- Required branch: `HeoNey_dev`
- Dirty branch switch: `blocked`
- Commit policy: `manual`
- Include `.loom` metadata in Git: `yes`
- Read-only parallel execution: `allowed`
- Validation environment: `auto`
- Previous Task result limit: `2`
- Workspace required docs: -
- Loom fixed guardrails and verified Team required policies take precedence over this Workspace Policy.

## Job

- Title: PNG 기반 모바일 HTML 시안
- Goal: 사용자가 제공한 다섯 모바일 PNG의 화면 항목과 순서를 따라 독립 HTML 시안을 만들고 Expo 웹 개발 서버에서 확인한다. 기본 수칙은 재난별 공통 안내로, 맞춤 행동요령은 개인 상태 기반 예시로 분리한다.
- Branch: HeoNey_dev
- Task count: `46`

## Task

- Title: 홈 정적 태극색 로고와 시작 로딩 화면 추가
- Description: PNG 기반 모바일 HTML 시안에서 홈 봉화 지기 글자는 태극의 빨강·파랑이 섞인 정적 채움으로 바꾸고, 첫 실행 시 흰 배경 중앙의 더 큰 봉화 지기 글자 안에서만 색이 일렁이는 로딩 화면을 추가한다. 시안은 잠시 후 기존 홈으로 넘어가고 해시로 직접 진입한 화면은 유지한다.
- Expected output: public/prototype/index.html, style.css, app.js 및 모바일 화면 기획서 갱신과 Loom 기록
- Done condition: 홈 로고 색은 움직이지 않고 로딩 화면에는 중앙의 큰 글씨만 나타나며 글자 안 색이 움직인다. 첫 진입 후 홈으로 이동하고 직접 해시 진입은 보존되며 움직임 줄이기에서 애니메이션이 정지한다.
- In scope: public/prototype/index.html, public/prototype/style.css, public/prototype/app.js, docs/HeoNey/봉화지기_모바일_화면_기획서.md, Loom 기록
- Out of scope: 프로필·개인정보 동의 첫 설정 화면, Expo 앱 네이티브 스플래시, API 실제 로딩 상태, 기존 홈 내용
- Validation hint: Chrome 초기·3초 후·#home 화면, 직접 해시 진입, npm run check:docs, git diff --check, Loom validate
- Required docs: -
- Memory refs: -
- Document outputs: -
- Document output exceptions: -
- Source proposal: `-`
- Status: PENDING
- Assigned agent: codex

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
