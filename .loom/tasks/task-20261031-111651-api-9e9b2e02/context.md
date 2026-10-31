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

- Title: 모바일 화면 API 매칭 최신화
- Goal: 최신 모바일 화면 기획과 저장소의 OpenAPI 사본을 대조해 API 매칭 리스트를 갱신하고, 사전준비 추천 기능의 API 공백과 서버 인계 항목을 명확히 기록한다.
- Branch: HeoNey_dev
- Task count: `1`

## Task

- Title: 최신 화면 기준 API 매칭과 사전준비 공백 기록
- Description: 모바일 API 매칭 리스트를 현재 홈·긴급 대응·프로필·기본 수칙 기획과 맞추고, 사전준비 개인 추천을 제공할 API·프로필 필드 공백과 주변 재난 3개월·최대 3건 규칙의 계약 차이를 서버 인계 문서에 기록한다. 문서의 끊어진 참조를 현재 저장소 문서로 정리한다.
- Expected output: docs/HeoNey/모바일_화면_API_매칭_리스트.md, docs/06-server-handoff.md 및 Loom 기록
- Done condition: API 매칭 리스트의 명칭과 화면 구성은 최신 기획과 맞고, 사전준비 추천 공백을 기존 스키마 근거와 함께 명시하며, 2D 경로·재난 목록 계약 차이를 기록하고, 문서 내부 링크와 검증이 통과한다.
- In scope: docs/HeoNey/모바일_화면_API_매칭_리스트.md, docs/06-server-handoff.md, Loom 기록
- Out of scope: OpenAPI 원본·생성 타입, 앱 코드, HTML 시안, 새 API 경로·필드 확정
- Validation hint: 기획서·OpenAPI 대조, npm run check:docs, git diff --check, Loom task validate
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
