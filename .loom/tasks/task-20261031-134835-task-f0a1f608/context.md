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
- Task count: `51`

## Task

- Title: 로딩 화면 고정 미리보기 주소 추가
- Description: HTML 시안을 #loading 주소로 직접 열면 자동 전환 없이 로딩 화면과 색 애니메이션을 계속 볼 수 있게 한다. 해시 없는 일반 시작은 기존 약 2.6초 뒤 홈으로 전환한다. README와 모바일 화면 기획서에 미리보기 방법을 기록한다.
- Expected output: public/prototype/app.js, README.md, docs/HeoNey/봉화지기_모바일_화면_기획서.md, Loom 기록
- Done condition: public/prototype/index.html#loading을 5초 이상 열어도 로딩 화면이 유지된다. 해시 없는 index.html은 약 2.6초 후 #home으로 전환하고 #home 등 기존 직접 진입은 유지된다.
- In scope: public/prototype/app.js, README.md, docs/HeoNey/봉화지기_모바일_화면_기획서.md, Loom 기록
- Out of scope: 로고 디자인, 로딩 시간 변경, Expo 네이티브 시작 화면
- Validation hint: Chrome --virtual-time-budget=5000으로 public/prototype/index.html#loading 화면 유지와 해시 없는 index.html의 #home 전환을 각각 캡처·확인한다. npm run check:docs 및 git diff --check를 실행한다.
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
