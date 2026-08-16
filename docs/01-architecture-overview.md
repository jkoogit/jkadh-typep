# 1. jkadh 아키텍처 표준 개요 및 비전

## 1.1 jkadh 프레임워크란?
**jkadh (Jin-Kyu Architecture & Development Harness)**는 대규모 언어 모델(LLM)과 에이전틱(Agentic) AI 코딩 환경에서 발생하는 고유한 한계점—**환각(Hallucination), 스펙 드리프트(Specification Drift), 불완전한 예외 처리, 비결정론적 코드 생성, 토큰 쿼터 고갈**—을 공학적으로 통제하기 위해 설계된 엔터프라이즈 아키텍처 거버넌스 표준입니다.

## 1.2 핵심 문제의식 및 프로젝트 타깃
* **대상 프로젝트**: **PDFowers** (대규모 문서 지능화, 고해상도 OCR, 복합 표 추출, DRM 워터마크, AES-256 암호화 및 무손실 분할/병합 파이프라인)
* **인프라 제약**: 스테이징/운영(stg/prd) 분리 없는 **단일 개발 데이터베이스 (`jkadhp_dev`, PostgreSQL 16.2)** 환경
* **핵심 해결 과제**:
  1. 사전 토큰 계산 오차 및 비정형 출력 시 실시간 무중단 핫스왑 Fallback 체인 구축
  2. 단순 프롬프트 바이브코딩의 모호성을 제거하는 7단계 Phase Gatekeeper 규칙 강제
  3. 팀 공용 AI 계정 풀(OpenAI, Anthropic, Google, Manus)의 RBAC 권한 격리 및 토큰 비용 통제
  4. 단일 개발 DB 환경에서의 작업 노드별 트랜잭션 격리 및 스키마 충돌 방지

---

## 1.3 4대 아키텍처 원칙 (Core Architectural Pillars)

```
+-----------------------------------------------------------------------------------+
|                           jkadh 4대 아키텍처 원칙                                  |
+-----------------------------------------------------------------------------------+
| 1. Zero-Drift Specification   : 기획(3대 시나리오) -> 설계(JSON Schema) -> 구현 검증 |
| 2. Circuit Breaker Fallback    : 429/503/Quota 초과 시 300ms 내 저비용/고용량 모델 핫스왑 |
| 3. Transactional Isolation    : jkadhp_dev 단일 DB 내 Savepoint 기반 마이그레이션 격리  |
| 4. Continuous Quality Gate    : 단계별 게이트키퍼 통과 및 엄격한 정적 검증(TypeScript)   |
+-----------------------------------------------------------------------------------+
```

### 1. Zero-Drift Specification (무결점 명세 추적)
모든 개발 작업은 자연어 요구사항을 기획 단계에서 3대 시나리오(Happy Path, Error Recovery, Edge-case Bounds)로 구조화하고, 설계 단계에서 JSON Schema Draft-07 계약으로 고정합니다. 구현 코드는 이 Schema에 대해 컴파일 시점 및 런타임 샌드박스에서 100% 정합성을 검증받습니다.

### 2. Circuit Breaker Fallback (선제적 장애 핫스왑)
특정 AI Provider의 API 호출이 429 RateLimit, 503 Service Unavailable, 타임아웃, 토큰 쿼터 고갈 등으로 실패할 경우, 300ms 이내에 차순위 모델(Claude -> Codex -> Gemini Flash)로 자동 핫스왑되어 개발 파이프라인의 중단을 방지합니다.

### 3. Transactional Isolation in Single DB (단일 DB 트랜잭션 격리)
`stg`/`prd`가 없는 단일 개발 DB(`jkadhp_dev`) 환경에서 각 작업 노드는 고유 Task ID 기반의 DB Savepoint 및 트랜잭션 롤백 하네스를 적용하여 스키마 마이그레이션 충돌이나 데이터 오염을 완벽히 방지합니다.

### 4. Continuous Quality Gate (연속 품질 게이트)
단순한 코드 생성이 아닌, 7단계 전 공정에서 프로그래밍된 Gatekeeper 규칙(의존성 무결성, 3대 시나리오 완비, JSON Schema 적합성, 테스트 통과, 린트/컴파일 무오류)을 통과해야만 다음 단계로 전진합니다.
