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
- Task count: `32`

## Task

- Title: 오늘의 행동요령 참고 이미지 스타일 적용
- Description: 홈의 오늘의 행동요령 제목을 첨부 이미지의 혜택 알리미 제목처럼 단정한 영역으로 만들되 화살표와 나의 혜택 요소는 넣지 않는다. 아래 두 카드의 세로 배치와 문구·아이콘은 유지하고 카드 테두리를 제거해 연분홍 채움으로 바꾼다. 기존에 같은 규격을 쓰는 나의 사전준비 카드도 동일하게 맞춘다.
- Expected output: public/prototype/index.html, public/prototype/style.css, docs/HeoNey/봉화지기_모바일_화면_기획서.md 및 Loom 작업 기록
- Done condition: 홈의 오늘의 행동요령은 참고 이미지 느낌의 제목 영역을 갖고 화살표·나의 혜택 요소가 없으며 카드 배치와 내용은 유지된다. 행동요령·사전준비 카드의 외곽선이 없고 연분홍 배경이며 시안과 문서 검사가 통과한다.
- In scope: 홈 오늘의 행동요령 및 공통 카드의 HTML·CSS, 모바일 화면 기획서, 새 Loom 작업 기록
- Out of scope: 다른 화면, 카드 내용·아이콘·순서, API, Expo 앱, 배포
- Validation hint: 브라우저 홈 화면 확인, CSS·HTML 검색, git diff --check, npm run check:docs, Loom task validate
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
