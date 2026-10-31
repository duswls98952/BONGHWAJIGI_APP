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
- Task count: `49`

## Task

- Title: 봉화 획별 색상과 지기 회색 로고 적용
- Description: 제공한 숫자 4 이미지처럼 봉화의 획을 정부청색·정부적색 계열로 분리해 홈과 로딩 로고에 적용하고 지기는 아주 어두운 회색으로 표시한다. 로딩에서 봉화 색의 움직임만 유지한다. 숫자 24 참고 이미지를 저장하고 기획서에 연결한다.
- Expected output: public/prototype/index.html, style.css, 숫자 24 참고 이미지, 모바일 화면 기획서, Loom 기록
- Done condition: 홈과 로딩에서 봉화의 서로 다른 획이 색으로 구분되고 지기는 어두운 회색으로 읽힌다. 홈은 정적이고 로딩의 봉화 색만 움직이며 기존 원형 문양·전환·움직임 줄이기가 유지된다. 숫자 24 참고 이미지를 저장소에서 열 수 있다.
- In scope: public/prototype/index.html, public/prototype/style.css, docs/HeoNey/assert, docs/HeoNey/봉화지기_모바일_화면_기획서.md, Loom 기록
- Out of scope: API, Expo 네이티브 로고, 다른 화면 디자인
- Validation hint: Chrome 홈·로딩 캡처와 중간 프레임 확인, 이미지 확인, npm run check:docs, git diff --check, Loom validate
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
