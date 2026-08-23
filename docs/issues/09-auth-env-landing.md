# [이슈 #09] 환경별 로그인 분기 처리(로컬 자동로그인/배포 비로그인 메인) 및 화면/메뉴 네비게이션 구조 개편

## 1. 개요 및 배경
- **태스크 ID**: `PLAT-AUTH-UI-09` (`WRK-AUTH-ENV-01`)
- **담당자/책임자**: 조정국 (`mem-jkoo` / `SUPER_ADMIN`, Platform Architecture Lab)
- **목표**: 
  1. 환경별(로컬 샌드박스 vs 배포 환경) 로그인 진입 분기 처리 및 안정화 전까지 심플·정갈한 비로그인 메인 화면 제공
  2. Google Material Design 3 (M3) Generative AI 가이드라인을 준수한 화면/메뉴 네비게이션 구조 전면 개편
  3. AS-IS 클래식 올인원 화면을 마지막 메뉴로 완전 보존(Dual-Track)하여 무중단 마이그레이션 지원
  4. 모바일 반응형(Navigation Drawer/Rail) 대응 및 텍스트 오버플로우 방지, 뚜렷한 버튼/링크 시각적 위계 확립

---

## 2. 3대 핵심 시나리오 (Test & Verification Contracts)

### ① 정상 시나리오 (Happy Path)
- **로컬 샌드박스 진입**: 개발 편의성을 위해 조정국(`mem-jkoo`, `SUPER_ADMIN`) 계정으로 즉시 자동 로그인.
- **배포 환경 진입**: 불필요한 홍보 문구를 배제한 정갈한 비로그인 M3 로그인 카드 렌더링 ➔ [조정국 1-Click 인증] 또는 [이메일 로그인] 후 대시보드 진입.
- **네비게이션 전환**:
  - 좌측 사이드바: 5대 메인 메뉴(메인 대시보드 / 서비스 개발 / 기능 관리 / 표준 문서 / AS-IS 클래식 콘솔)
  - `서비스 개발` 및 `기능 관리` 내부의 서브탭 원클릭 전환
  - 상단 헤더: 실시간 활성 세션 상태 요약 배지, 테마 토글(라이트/다크), 프로필/로그아웃 및 로컬 비로그인 프리뷰 스위치.

### ② 예외 경계 시나리오 (Edge Bounds)
- 모바일 해상도(<768px)에서 사이드바가 햄버거 오버레이 Drawer로 자동 축소되고, 모든 텍스트 라벨이 `truncate` 또는 단일 라인으로 넘침 없이 안전 렌더링.
- 비로그인 상태에서 보호된 메뉴 직접 렌더링 시도시 로그인 모달로 안전하게 인터셉트.

### ③ 오류 복구 시나리오 (Error Recovery)
- 잘못된 로그인 입력 시 M3 Error Tonal 피드백 및 재시도 유도.
- 서브탭 전환 중 상태 유실 방지 및 세션 스토리지 기반 테마/인증 상태 보존.

---

## 3. 변경 대상 파일 목록
- `src/services/envService.ts` (환경 감지 및 인증 상태 유틸리티)
- `src/components/Sidebar.tsx` (M3 반응형 좌측 사이드바 및 모바일 Drawer)
- `src/components/Header.tsx` (M3 상단 세션 현황 요약 및 액션 바)
- `src/components/PublicLandingView.tsx` (정갈한 M3 비로그인 접속 뷰)
- `src/components/MainDashboardView.tsx` (TO-BE 메인 대시보드)
- `src/components/ServiceDevWorkspace.tsx` (서비스 개발 서브탭 통합 뷰)
- `src/components/AdminConfigWorkspace.tsx` (기능 관리 서브탭 통합 뷰)
- `src/components/ClassicConsoleView.tsx` (AS-IS 10대 탭 완전 보존 뷰)
- `src/App.tsx` (최상위 레이아웃 및 뷰 라우팅 리팩토링)
