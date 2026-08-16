# 3. jkadh 리팩토링 표준 가이드라인 & 코드 품질 기준

> **"리팩토링은 기능 추가가 아니라, 테스트와 검증이 확보된 상태에서 소프트웨어의 내적 구조를 고도화하는 작업이다."**

---

## 3.1 리팩토링 및 코드 품질 고도화 원칙
jkadh 프레임워크는 7단계 라이프사이클의 Phase 6(코드 작성) 및 Phase 7(문서화 및 완료 검토) 단계에서 고품질의 엔터프라이즈 코드를 보장하기 위해 다음과 같은 엄격한 리팩토링 표준을 준수합니다.

---

## 3.2 리팩토링 4대 절대 원칙 (4 Core Pillars)

### 원칙 1: 기능 및 동작 불변 보장 (No Behavioral Drift)
* 리팩토링 전후 외부 관찰 가능한 동작(API 시그니처, 반환값, 상태 전이, 이벤트 방출)은 100% 동일해야 합니다.
* 리팩토링 도중 신규 기능을 추가하거나 기존 비즈니스 룰을 임의 변경하는 것은 엄격히 금지됩니다.

### 원칙 2: DRY (Don't Repeat Yourself) & 단일 책임 원칙 (SRP)
* 동일하거나 유사한 로직(예: 에러 파싱, 토큰 포맷팅, DB 쿼리 핸들러)은 순수 유틸리티 또는 커스텀 훅으로 추출합니다.
* 150줄을 초과하는 거대 함수(God Function)나 300줄을 초과하는 컴포넌트는 단일 책임을 갖는 하위 서브모듈로 분할합니다.

### 원칙 3: 엄격한 타입 시스템 & 런타임 Null 방어 (Strict Type Rigidity)
* `any`, `as unknown as T`, 암시적 타입 단언을 전면 배제합니다.
* 조건부 데이터는 **Discriminated Unions (구별된 유니온)**을 적용하여 런타임 타입 에러를 컴파일 타임에 포착합니다.
* 배열 탐색 시 `find()` 결과는 반드시 Optional Chaining(`?.`) 및 Nullish Coalescing(`??`) 기본값을 제공합니다.

### 원칙 4: 도메인 어휘 일관성 & 인지 부하 최소화 (Clean Lexicon)
* PDFowers 및 jkadh 표준 용어(예: `taskId`, `documentHash`, `phaseNumber`, `fallbackOrder`)를 통일하여 사용합니다.
* 매직 넘버(예: `4002`, `1000000`, `1450`)는 의미 있는 `const` 상수 객체 또는 `enum`으로 추출합니다.

---

## 3.3 코드 스멜 분류 및 표준 해결 전략 (Code Smell Catalogue)

| 번호 | 코드 스멜 (Code Smell) | 발생 원인 / 징후 | 표준 해결 전략 (Refactoring Fix) |
|---|---|---|---|
| **CS-01** | **God Component / Monolith** | 컴포넌트 1개에 UI 렌더링, API 호출, 상태 계산이 뒤섞임 | 뷰 프리젠터, 커스텀 훅, 서브 카드로 모듈화 분할 |
| **CS-02** | **Magic Literals / Numbers** | 하드코딩된 에러 코드, 색상 hex, 쿼터 제한값 | `STATUS_CODES`, `THEME_COLORS` 상수 모듈화 |
| **CS-03** | **Loose / Any Typing** | `Record<string, any>` 남발 및 비정형 payload | 엄격한 인터페이스 정의 및 Zod/JSON Schema 가드 |
| **CS-04** | **Unmemoized Computations** | 렌더링마다 대규모 배열 filter/reduce 반복 실행 | `useMemo`, `useCallback`, 파생 상태 메모이제이션 |
| **CS-05** | **Duplicated Error Handlers** | 각 API 호출마다 중복 작성된 try-catch 블록 | 중앙집중식 에러 인터셉터 및 Circuit Breaker Hook 추출 |

---

## 3.4 AI 리팩토링 프롬프트 표준 템플릿 (AI Refactoring Directive)

Claude 3.7 Sonnet 또는 ChatGPT Codex에 코드 개선 및 리팩토링을 요청할 때는 반드시 아래 지침을 시스템 프롬프트로 전달합니다:

```markdown
[시스템 리팩토링 지침]
당신은 jkadh 아키텍처 표준을 준수하는 시니어 소프트웨어 엔지니어입니다.
주어진 코드는 기획 및 인터페이스 설계 명세를 충족하는 구현체입니다.
당신의 임무는 다음 기준에 따라 코드를 리팩토링하고 고도화하는 것입니다:

1. [기능 불변성]: 기존 인터페이스, 반환 형태, 상태 전이 로직을 절대 변경하지 마십시오.
2. [타입 안전성]: any 타입을 제거하고 정확한 TypeScript 인터페이스를 선언하십시오.
3. [DRY]: 중복 계산을 useMemo로 캐싱하고 공통 헬퍼를 분리하십시오.
4. [가독성]: 복잡한 조건식은 명확한 서술형 불리언 변수로 추출하십시오.
5. [컴파일 검증]: tsc --noEmit 에러가 0건이어야 합니다.
```
