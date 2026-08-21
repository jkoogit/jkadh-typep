# [Issue #18] 플랫폼 전역 감사 로그(JSON Audit Trail) 뷰어 및 이벤트 타임라인 시각화

- **이슈 번호**: #18 (GitHub Issue #15)
- **관련 태스크 ID**: `PLAT-AUDIT-10` (`WRK-AUDIT-01`)
- **담당자**: 조정국 (mem-jkoo / SUPER_ADMIN)
- **작업 브랜치**: `task/global-audit-trail-timeline`
- **타겟 브랜치**: `dev`
- **등록 일시**: 2026-08-21T01:56:00+09:00
- **상태**: IN_PROGRESS

---

## 1. 이슈 개요 및 배경 (Background & Requirements)

### 1.1 배경 및 목적
- JKADH AI DevPlatform 내 보안(API Key Vault/Auth), AI 모델 라우팅 변경, DDL 스키마 마이그레이션, 하네스 6대 라이프사이클 및 팀원 권한 변경 등 모든 주요 작업에 대해 생성되는 **JSON Audit Trail(6대 감사 컬럼)**을 직관적이고 인터랙티브하게 모니터링할 수 있는 전역 감사 뷰어가 필요함.
- 감사 로그의 전/후 변경 상태(`before_state`, `after_state`)를 육안으로 신속하게 대조할 수 있는 2계층 수납 표준 준수 모달(고정 헤더/푸터 및 본문 독립 스크롤)과 초슬림 6px 다크 스크롤바가 필요함.

### 1.2 주요 목표 및 개발 범위
1. **전역 감사 로그 타임라인 & 이벤트 뷰어 (`GlobalAuditTrailView.tsx`)**:
   - 이벤트 카테고리별(보안, AI 모델, 스키마, 라이프사이클, 사용자 권한) 필터 및 텍스트 실시간 검색.
   - 6대 공통 감사 컬럼(`reg_sys_cd`, `reg_user_id`, `reg_dt`, `mod_sys_cd`, `mod_user_id`, `mod_dt`) 및 IP/세션 ID 시각화.
   - 시간순 인터랙티브 타임라인 및 상태(성공/실패/경고) 인디케이터.
2. **JSON Diff 2계층 상세 모달 뷰어**:
   - 변경 전/후 JSON 데이터의 추가(+), 삭제(-), 변경(~) 블록 하이라이팅.
   - 상단 헤더 및 하단 푸터 고정 (`flex-1 overflow-y-auto`) 및 GitHub Dark 테마 초슬림 6px 스크롤바 적용.
3. **거버넌스 3대 시나리오 테스트 및 AST 린트 무결성 확보**:
   - 필수 정상, 오류 복구, 예외 경계 시나리오 검증 및 `tsc --noEmit` 0 에러 유지.

---

## 2. 3대 시나리오 기획 및 인터페이스 계약

- **필수 정상 (Happy Path)**:
  - 카테고리/상태별 필터 선택 시 일치하는 감사 로그 즉시 렌더링
  - 로그 항목 클릭 시 JSON Diff 모달이 팝업되고 `before_state`와 `after_state`의 차이점이 직관적으로 구분되어 표시됨
- **오류 복구 (Error Recovery)**:
  - 잘못된 JSON 페이로드 또는 `null` 상태 유입 시 Safe Fallback 뷰어 가동 및 에러 메시지 안내
- **예외 경계 (Edge Bounds)**:
  - 수천 건의 대량 로그 유입 시 페이징/가상화 버퍼링을 통해 렌더링 성능 유지 및 텍스트 선택성(`user-select: text`) 100% 보장
