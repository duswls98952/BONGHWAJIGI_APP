# Troubleshooting

## 검토 필요

Codex CLI failed with exit code 1: WARNING: proceeding, even though we could not create PATH aliases: Operation not permitted (os error 1)

<details>
<summary>원본 오류 로그</summary>

```text
Codex CLI failed with exit code 1: WARNING: proceeding, even though we could not create PATH aliases: Operation not permitted (os error 1)
2026-10-31T15:03:08.845125Z  WARN codex_state::runtime: failed to open state db at /Users/heoney/.codex/state_5.sqlite: failed to open state DB at /Users/heoney/.codex/state_5.sqlite: error returned from database: (code: 8) attempt to write a readonly database
2026-10-31T15:03:08.846445Z  WARN codex_rollout::state_db: failed to initialize state runtime: failed to initialize state runtime at /Users/heoney/.codex: failed to open state DB at /Users/heoney/.codex/state_5.sqlite: error returned from database: (code: 8) attempt to write a readonly database: error returned from database: (code: 8) attempt to write a readonly database: (code: 8) attempt to write a readonly database
Reading prompt from stdin...
Error: failed to initialize in-process app-server client: Operation not permitted (os error 1)
```

</details>

## 원자성 복구

- Result: rolled back uncommitted task changes
- 작업 디렉터리에 되돌릴 새 변경이 없었습니다.

## 복구와 화면 확인 제한

- `loom task run --agent codex` 호환 경로가 읽기 전용 Codex 상태 DB와 프로세스 권한 문제로 실패했다. `loom task run <task-id> --session-agent codex`로 전면 작업 세션을 시작해 작업을 이어갔다.
- 로컬 HTTP 서버는 소켓 바인딩 권한 오류로 시작하지 못했고, 브라우저 호스트도 사용 불가 상태였다. Node 가상 DOM으로 네 해시의 제목·단계·복귀 링크를 확인했다. 실제 브라우저에서 작은 화면 배치를 확인하는 일이 남았다.
- 실패한 외부 실행의 승인 요청을 처리하는 과정에서 생성된 재실행 요청은 곧바로 취소했다. Loom 완료 보호 규칙은 이 취소 요청을 미해결 상태로 판정해 Task를 `REVIEW_REQUIRED`로 남겼다. 화면 변경과 검증 결과에는 영향이 없으며, 해당 요청의 workflow 정리는 별도 확인이 필요하다.

## DONE Guardrail

아래 필수 작업 기록이 부족해 `DONE` 대신 `REVIEW_REQUIRED`로 전환했습니다.

- unresolved approval request

Next action: 완료 계약을 증명하는 기록이 부족하거나 미해결 요청이 있어 검토가 필요합니다. result/decision/troubleshooting/log/event/artifact와 검증 근거를 보강하거나 요청을 해결한 뒤 다시 완료 처리하세요.

## DONE Guardrail

아래 필수 작업 기록이 부족해 `DONE` 대신 `REVIEW_REQUIRED`로 전환했습니다.

- unresolved cancellation request

Next action: 완료 계약을 증명하는 기록이 부족하거나 미해결 요청이 있어 검토가 필요합니다. result/decision/troubleshooting/log/event/artifact와 검증 근거를 보강하거나 요청을 해결한 뒤 다시 완료 처리하세요.
