import {
  AIAccount,
  ArchitecturalProposalCase,
  DatabaseTableMeta,
  DocumentationSection,
  ExecutionMetric,
  LifecyclePhase,
  ModelMeta,
  TaskGraphNode,
  TeamMember,
} from '../types';

export const INITIAL_MODELS: ModelMeta[] = [
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet (Thinking)',
    provider: 'ANTHROPIC',
    version: '20250219-v1.0',
    contextWindow: 200000,
    inputPricePerMillion: 3.0,
    outputPricePerMillion: 15.0,
    reasoningTier: 'HIGH',
    codeScore: 96,
    avgLatencyMs: 1450,
    recommendedPhases: [1, 3, 4], // Review, Planning, Architecture
    primaryCapabilities: ['Multi-scenario edge planning', 'Complex AST Architecture', 'Long-context Task Graph'],
    fallbackOrder: ['gpt-4o-codex', 'gemini-3-7-flash', 'manus-operator'],
    tokenEstimationDifficulty: 'APPROXIMATE',
    description: '최상위 복잡도 기획 및 아키텍처 설계, 비기능 요구사항과 예외 시나리오 추출에 최적화된 모델',
    isAvailable: true,
  },
  {
    id: 'gpt-4o-codex',
    name: 'ChatGPT Codex (o3-mini / GPT-4o)',
    provider: 'OPENAI',
    version: '2025-01-preview',
    contextWindow: 128000,
    inputPricePerMillion: 2.5,
    outputPricePerMillion: 10.0,
    reasoningTier: 'HIGH',
    codeScore: 94,
    avgLatencyMs: 980,
    recommendedPhases: [5, 6], // Test design, Code generation
    primaryCapabilities: ['Strict Typed Code Generation', 'Unit/Integration Test Harness', 'Error recovery logic'],
    fallbackOrder: ['claude-3-7-sonnet', 'gemini-3-7-flash', 'manus-operator'],
    tokenEstimationDifficulty: 'EXACT',
    description: '고속 코드 생성 및 TypeScript/Python 인터페이스 구현, 단위 테스트 케이스 작성 전문 모델',
    isAvailable: true,
  },
  {
    id: 'gemini-3-7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'GOOGLE',
    version: 'gemini-3.7-flash',
    contextWindow: 1000000,
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.6,
    reasoningTier: 'MEDIUM',
    codeScore: 91,
    avgLatencyMs: 420,
    recommendedPhases: [1, 2, 7], // Target review, Selection, Documentation & Graph Sync
    primaryCapabilities: ['Massive 1M Context Window', 'Real-time JSON Spec Validation', 'Documentation & Graph Sync'],
    fallbackOrder: ['gpt-4o-codex', 'claude-3-7-sonnet', 'manus-operator'],
    tokenEstimationDifficulty: 'EXACT',
    description: '초저지연, 대용량 컨텍스트 처리 및 작업그래프 현행화, 실시간 명세 스키마 검증 전담 모델',
    isAvailable: true,
  },
  {
    id: 'manus-operator',
    name: 'Manus Autonomous Operator',
    provider: 'MANUS',
    version: 'v2.1-agentic',
    contextWindow: 64000,
    inputPricePerMillion: 5.0,
    outputPricePerMillion: 25.0,
    reasoningTier: 'MAX',
    codeScore: 93,
    avgLatencyMs: 3800,
    recommendedPhases: [2, 5, 6], // Complex integration test & End-to-end orchestration
    primaryCapabilities: ['Autonomous Browser / Sandbox Runner', 'Multi-step Error Self-healing', 'Tool execution'],
    fallbackOrder: ['claude-3-7-sonnet', 'gpt-4o-codex', 'gemini-3-7-flash'],
    tokenEstimationDifficulty: 'HEURISTIC',
    description: '환경 샌드박스에서 E2E 테스트 실행, 빌드 에러 자동 수정 및 자율적 복구 작업을 수행하는 에이전트',
    isAvailable: true,
  },
];

export const INITIAL_AI_ACCOUNTS: AIAccount[] = [
  {
    id: 'acc-openai-prd',
    provider: 'OPENAI',
    accountName: 'OpenAI Enterprise (JKADH Team)',
    apiKeyMasked: 'sk-proj-****************************4A9B',
    totalTokenQuota: 10000000,
    usedTokens: 4230000,
    remainingTokens: 5770000,
    costMonthlyLimitUSD: 500,
    currentCostUSD: 211.5,
    status: 'HEALTHY',
    errorCount24h: 1,
    tier: 'Enterprise',
    primaryFallbackModelId: 'claude-3-7-sonnet',
  },
  {
    id: 'acc-anthropic-dev',
    provider: 'ANTHROPIC',
    accountName: 'Anthropic Claude Scale Tier',
    apiKeyMasked: 'sk-ant-api03-**********************7F12',
    totalTokenQuota: 8000000,
    usedTokens: 6890000,
    remainingTokens: 1110000,
    costMonthlyLimitUSD: 400,
    currentCostUSD: 344.5,
    status: 'WARNING',
    errorCount24h: 4,
    tier: 'Tier-4',
    primaryFallbackModelId: 'gpt-4o-codex',
  },
  {
    id: 'acc-google-cloud',
    provider: 'GOOGLE',
    accountName: 'Google Gemini Pro Account (jkadhp_dev)',
    apiKeyMasked: 'AIzaSy****************************88dE',
    totalTokenQuota: 25000000,
    usedTokens: 5410000,
    remainingTokens: 19590000,
    costMonthlyLimitUSD: 300,
    currentCostUSD: 48.7,
    status: 'HEALTHY',
    errorCount24h: 0,
    tier: 'PayAsYouGo',
    primaryFallbackModelId: 'gpt-4o-codex',
  },
  {
    id: 'acc-manus-agent',
    provider: 'MANUS',
    accountName: 'Manus Agent Operator Cluster',
    apiKeyMasked: 'mns-live-**************************01C9',
    totalTokenQuota: 3000000,
    usedTokens: 2790000,
    remainingTokens: 210000,
    costMonthlyLimitUSD: 250,
    currentCostUSD: 232.5,
    status: 'WARNING',
    errorCount24h: 7,
    tier: 'Developer',
    primaryFallbackModelId: 'claude-3-7-sonnet',
  },
];

export const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'mem-jkoo',
    name: '구진규 (Lead Architect)',
    email: 'jkoogit@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'ADMIN',
    allowedModels: ['claude-3-7-sonnet', 'gpt-4o-codex', 'gemini-3-7-flash', 'manus-operator'],
    dailyTokenLimit: 2000000,
    tokensUsedToday: 485000,
    monthlyBudgetUSD: 250,
    costUsedUSD: 62.4,
    status: 'ACTIVE',
    department: 'Platform Architecture Lab',
    lastActive: '1분 전',
  },
  {
    id: 'mem-minji',
    name: '김민지 (Core Engineer)',
    email: 'minji.kim@team.io',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    role: 'ENGINEER',
    allowedModels: ['gpt-4o-codex', 'gemini-3-7-flash'],
    dailyTokenLimit: 1000000,
    tokensUsedToday: 820000,
    monthlyBudgetUSD: 150,
    costUsedUSD: 88.0,
    status: 'ACTIVE',
    department: 'PDFowers Service Team',
    lastActive: '8분 전',
  },
  {
    id: 'mem-junho',
    name: '박준호 (AI Spec Reviewer)',
    email: 'junho.park@team.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    role: 'REVIEWER',
    allowedModels: ['claude-3-7-sonnet', 'gemini-3-7-flash'],
    dailyTokenLimit: 800000,
    tokensUsedToday: 210000,
    monthlyBudgetUSD: 100,
    costUsedUSD: 31.5,
    status: 'ACTIVE',
    department: 'QA & Governance',
    lastActive: '24분 전',
  },
  {
    id: 'mem-daewon',
    name: '이대원 (Security & Auditor)',
    email: 'daewon.lee@team.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    role: 'AUDITOR',
    allowedModels: ['gemini-3-7-flash'],
    dailyTokenLimit: 500000,
    tokensUsedToday: 45000,
    monthlyBudgetUSD: 50,
    costUsedUSD: 4.2,
    status: 'ACTIVE',
    department: 'Security & Compliance',
    lastActive: '2시간 전',
  },
];

export const INITIAL_7_PHASES_TEMPLATE: LifecyclePhase[] = [
  {
    phaseNumber: 1,
    code: 'PHASE_1_TARGET_REVIEW',
    nameKr: '1. 작업대상 검토 (작업그래프 분석)',
    nameEn: 'Work Target Review & Task Graph',
    description: 'PDFowers 모듈간 의존성, 영향 반경, 입력/출력 포맷 및 레거시 제약사항을 작업그래프로 정량 분석',
    assignedModelId: 'gemini-3-7-flash',
    fallbackModelId: 'claude-3-7-sonnet',
    status: 'COMPLETED',
    completionCriteria: [
      {
        id: 'c1-1',
        description: '의존성 작업 노드(DAG) 및 순환 참조 부재 검증',
        requiredRule: 'rule: no_cyclic_dependencies && all_upstream_nodes_resolved',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: 'AST 분석 결과 상위 노드 PDF_STREAM_CORE 연결 완료 (순환 없음)',
      },
      {
        id: 'c1-2',
        description: '변경 영향 모듈 명세 및 인터페이스 호환성 식별',
        requiredRule: 'rule: affected_modules_count >= 1 && api_signature_diff_checked',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: '영향 모듈 3개(OCR, TableExtract, PDFCrypto) 식별 완료',
      },
    ],
    inputArtifacts: ['PDFowers Repository Structure', 'jkadhp_dev Schema Definition', 'RFC-204 Specification'],
    outputArtifacts: ['Dependency Graph JSON', 'Impact Radius Matrix', 'Target State Definition'],
    executionLogs: [
      {
        timestamp: '2026-08-15 11:20:00',
        level: 'SUCCESS',
        message: '작업 그래프 분석 완료: 8개 노드, 12개 엣지 정합성 확인',
        modelUsed: 'gemini-3-7-flash',
        tokensConsumed: 12400,
      },
    ],
  },
  {
    phaseNumber: 2,
    code: 'PHASE_2_TASK_SELECTION',
    nameKr: '2. 작업 선정 및 우선순위화',
    nameEn: 'Task Selection & Prioritization',
    description: '비즈니스 가치(ROI), 기술적 복잡도, 토큰 소모량, 실패 위험도를 다축 평가하여 Sprint 작업 큐에 등록',
    assignedModelId: 'gemini-3-7-flash',
    fallbackModelId: 'claude-3-7-sonnet',
    status: 'COMPLETED',
    completionCriteria: [
      {
        id: 'c2-1',
        description: '복잡도 점수(1~10) 및 리스크 등급(LOW/MED/HIGH/CRITICAL) 산출',
        requiredRule: 'rule: complexity_score_present && risk_assessment_validated',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: '복잡도 7.5/10, 리스크 MEDIUM, 예상 토큰 45,000 산정',
      },
      {
        id: 'c2-2',
        description: '담당자 RBAC 모델 권한 매핑 및 토큰 일일 쿼터 잔여량 검증',
        requiredRule: 'rule: assignee_has_model_permission && daily_quota_headroom > estimated_tokens',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: '구진규 (Admin) 배정 완료, 일일 한도 여유 1,515,000 토큰 확인',
      },
    ],
    inputArtifacts: ['Target State Definition', 'Team Token Quota Status', 'Sprint Goal Metrics'],
    outputArtifacts: ['Task Selection Card', 'Resource Allocation Sheet', 'Risk Mitigation Plan'],
    executionLogs: [
      {
        timestamp: '2026-08-15 11:24:12',
        level: 'SUCCESS',
        message: '작업 선정 완료: [PDF-OCR-04] 고해상도 다국어 OCR 추출 엔진 고도화',
        modelUsed: 'gemini-3-7-flash',
        tokensConsumed: 8600,
      },
    ],
  },
  {
    phaseNumber: 3,
    code: 'PHASE_3_TASK_PLANNING',
    nameKr: '3. 작업 기획 (정상 / 오류 / 예외 시나리오)',
    nameEn: 'Task Planning & 3-Scenario Matrix',
    description: 'Happy Path(정상), Error Recovery(오류), Edge-case Bounds(예외) 시나리오를 엄밀하게 정의하여 오작동 통제',
    assignedModelId: 'claude-3-7-sonnet',
    fallbackModelId: 'gpt-4o-codex',
    status: 'COMPLETED',
    scenarios: [
      {
        type: 'NORMAL',
        title: '표준 고해상도 PDF 문서 OCR 및 구조화 JSON 추출',
        condition: 'PDF 파일 크기 50MB 이하, 300DPI 이상 표준 스캔 문서',
        inputState: 'Valid Multi-page PDF binary stream with mixed text & raster images',
        expectedBehavior: '각 페이지별 바운딩 박스 좌표, 텍스트 신뢰도(Confidence > 0.90), 레이아웃 블록 분할 완료',
        fallbackOrRecovery: '200ms 내 레이아웃 캐시 적용 및 분할 청크 비동기 전송',
        verified: true,
      },
      {
        type: 'ERROR',
        title: '손상된 PDF 스트림, 비밀번호 암호화 또는 비트맵 깨짐 오류',
        condition: 'PDF 헤더 손상(%PDF- 미포함) 또는 AES-256 암호화 잠금 상태',
        inputState: 'Corrupted byte buffer / Encrypted stream without user key',
        expectedBehavior: 'Fast-Fail 발생 즉시 `PDF_CORRUPT_OR_ENCRYPTED(4002)` 에러 코드 반환 및 손상 바이트 오프셋 로깅',
        fallbackOrRecovery: 'Tesseract 예외 복구 시도 대신 사용자에게 암호 입력 프롬프트 및 손상 복구 권고 JSON 발행',
        verified: true,
      },
      {
        type: 'EXCEPTION',
        title: '대용량(1000+ 페이지) 및 메모리 한계 / AI 토큰 오버플로우',
        condition: '페이지 수 > 1000, 파일 크기 > 500MB 또는 토큰 예측치 초과',
        inputState: 'Extreme scale bulk legal documents archive',
        expectedBehavior: '스트림 파이프라인으로 전환, 50페이지 단위 자동 가상 청킹 및 워커 큐 분산 처리',
        fallbackOrRecovery: '토큰 부족 감지 시 Claude -> Gemini 3.7 Flash(1M Context)로 자동 폴백 전환',
        verified: true,
      },
    ],
    completionCriteria: [
      {
        id: 'c3-1',
        description: '3대 시나리오(Normal, Error, Exception) 전수 작성 및 상호 배타성 검증',
        requiredRule: 'rule: scenarios.has_all(["NORMAL", "ERROR", "EXCEPTION"]) && error_recovery_defined',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: '정상 1건, 오류 1건, 예외 1건 시나리오 명세 및 복구 로직 검증 통과',
      },
      {
        id: 'c3-2',
        description: '오류 코드 체계(4000번대) 및 Fallback 전환 트리거 조건 확정',
        requiredRule: 'rule: error_codes_standardized && fallback_trigger_mapped',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: 'PDF_ERR_4001 ~ 4009 에러 코드 매핑 완료',
      },
    ],
    inputArtifacts: ['Task Selection Card', 'PDFowers Domain Rules', 'Scenario Matrix Standard'],
    outputArtifacts: ['Scenario Specification Doc', 'State Transition Table', 'Fallback Ruleset JSON'],
    executionLogs: [
      {
        timestamp: '2026-08-15 11:28:40',
        level: 'SUCCESS',
        message: '3단계 기획 완료: 3대 시나리오 수립 및 예외 복구 트리거 룰 체인 구성',
        modelUsed: 'claude-3-7-sonnet',
        tokensConsumed: 18900,
      },
    ],
  },
  {
    phaseNumber: 4,
    code: 'PHASE_4_TASK_DESIGN',
    nameKr: '4. 작업 설계 (아키텍처 및 인터페이스 명세)',
    nameEn: 'Task Architecture & Interface Design',
    description: 'TypeScript 인터페이스, REST/gRPC API 명세, jkadhp_dev DB 스키마 DDL 및 상태 머신 다이어그램 생성',
    assignedModelId: 'claude-3-7-sonnet',
    fallbackModelId: 'gpt-4o-codex',
    status: 'COMPLETED',
    specJsonSchema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PdfOcrTaskContract",
  "type": "object",
  "required": ["taskId", "documentHash", "options", "engineConfig"],
  "properties": {
    "taskId": { "type": "string", "format": "uuid" },
    "documentHash": { "type": "string", "pattern": "^sha256:[a-f0-9]{64}$" },
    "options": {
      "type": "object",
      "required": ["targetLanguages", "extractTables", "confidenceThreshold"],
      "properties": {
        "targetLanguages": { "type": "array", "items": { "type": "string" } },
        "extractTables": { "type": "boolean" },
        "confidenceThreshold": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
      }
    },
    "engineConfig": {
      "type": "object",
      "required": ["primaryModel", "fallbackChain", "maxConcurrency"],
      "properties": {
        "primaryModel": { "type": "string" },
        "fallbackChain": { "type": "array", "items": { "type": "string" } },
        "maxConcurrency": { "type": "integer", "minimum": 1, "maximum": 16 }
      }
    }
  }
}`,
    completionCriteria: [
      {
        id: 'c4-1',
        description: 'TypeScript 타입 안전성 및 JSON Schema Draft-07 유효성 검증',
        requiredRule: 'rule: json_schema_valid && no_any_types && strict_null_checks',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: 'JSON Schema 검증 완료, 엄격 타입 체커 무결성 확인',
      },
      {
        id: 'c4-2',
        description: 'jkadhp_dev DB 테이블(pdf_ocr_jobs, ocr_bounding_boxes) DDL 명세 작성',
        requiredRule: 'rule: ddl_syntax_valid_for_postgres && foreign_keys_indexed',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: 'PostgreSQL 16 호환 DDL 생성 및 인덱스(idx_ocr_doc_hash) 배치 완료',
      },
    ],
    inputArtifacts: ['Scenario Specification Doc', 'jkadhp_dev ERD', 'REST API Guideline'],
    outputArtifacts: ['Contract Interface TS', 'Postgres Migration SQL', 'Sequence Diagram'],
    executionLogs: [
      {
        timestamp: '2026-08-15 11:33:15',
        level: 'SUCCESS',
        message: '아키텍처 설계 완료: 계약 스키마 및 jkadhp_dev DDL 작성',
        modelUsed: 'claude-3-7-sonnet',
        tokensConsumed: 16500,
      },
    ],
  },
  {
    phaseNumber: 5,
    code: 'PHASE_5_TEST_DESIGN',
    nameKr: '5. 테스트 설계 (단위 / 통합 / 예외 검증)',
    nameEn: 'Test Design & Failure Injection Matrix',
    description: '3대 시나리오를 100% 커버하는 테스트 스위트 설계, Mock 금지 원칙 기반 실환경 검증 케이스 수립',
    assignedModelId: 'gpt-4o-codex',
    fallbackModelId: 'manus-operator',
    status: 'COMPLETED',
    completionCriteria: [
      {
        id: 'c5-1',
        description: '정상/오류/예외 시나리오 1:1 매핑 테스트 케이스 작성 (Coverage > 95%)',
        requiredRule: 'rule: all_scenarios_have_test_cases && edge_cases_tested',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: '총 14개 테스트 케이스(Normal: 6, Error: 5, Edge: 3) 도출 완료',
      },
      {
        id: 'c5-2',
        description: '토큰 소진 및 타임아웃 상황 가상 주입(Failure Injection) 테스트 통과 기준 설정',
        requiredRule: 'rule: fallback_circuit_breaker_test_defined',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: 'Fallback 전환 레이턴시 < 500ms, 상태 유실율 0% 기준 수립',
      },
    ],
    inputArtifacts: ['Contract Interface TS', 'Scenario Specification Doc', 'Test Harness Template'],
    outputArtifacts: ['Test Suite Plan', 'Failure Injection Matrix', 'Mockless Fixture Definitions'],
    executionLogs: [
      {
        timestamp: '2026-08-15 11:38:00',
        level: 'SUCCESS',
        message: '테스트 설계 완료: 14개 테스트 벡터 및 폴백 주입 시나리오 검증기 정의',
        modelUsed: 'gpt-4o-codex',
        tokensConsumed: 14200,
      },
    ],
  },
  {
    phaseNumber: 6,
    code: 'PHASE_6_CODE_GENERATION',
    nameKr: '6. 코드 작성 (구현 및 실시간 샌드박스 검증)',
    nameEn: 'Code Generation & Execution Verification',
    description: '명세 기반 고신뢰도 TypeScript/Node.js 코드 생성, 린트 및 AST 정적 분석, 런타임 샌드박스 테스트 통과',
    assignedModelId: 'gpt-4o-codex',
    fallbackModelId: 'claude-3-7-sonnet',
    status: 'IN_PROGRESS',
    generatedOutput: `/**
 * @file PdfOcrEngine.ts
 * @module PDFowers/OCR
 * @architecture JKADH AI Development Platform
 * @database jkadhp_dev
 */

import { EventEmitter } from 'events';

export interface OcrBoundingBox {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  confidence: number;
}

export interface OcrJobResult {
  taskId: string;
  documentHash: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  totalPages: number;
  processedPages: number;
  boxes: OcrBoundingBox[];
  processingTimeMs: number;
  modelUsed: string;
  fallbackTriggered: boolean;
  warnings?: string[];
}

export class PdfOcrEngine extends EventEmitter {
  private primaryModel: string;
  private fallbackModels: string[];
  private maxConcurrency: number;

  constructor(config: { primaryModel: string; fallbackModels: string[]; maxConcurrency?: number }) {
    super();
    this.primaryModel = config.primaryModel;
    this.fallbackModels = config.fallbackModels;
    this.maxConcurrency = config.maxConcurrency || 4;
  }

  public async executeOcr(
    taskId: string,
    documentHash: string,
    pdfBuffer: Buffer,
    options: { targetLanguages: string[]; extractTables: boolean; confidenceThreshold: number }
  ): Promise<OcrJobResult> {
    const startTime = Date.now();
    this.emit('start', { taskId, documentHash, timestamp: startTime });

    // Step 1: Pre-flight Binary Validation (Error Scenario 1)
    if (!pdfBuffer || pdfBuffer.length < 32 || pdfBuffer.subarray(0, 4).toString() !== '%PDF') {
      throw new Error('PDF_CORRUPT_OR_ENCRYPTED (4002): Invalid PDF stream magic bytes');
    }

    // Step 2: Model Execution with Dynamic Fallback Guard
    let currentModel = this.primaryModel;
    let fallbackOccurred = false;
    let boxes: OcrBoundingBox[] = [];

    try {
      boxes = await this.invokeModelOcr(currentModel, pdfBuffer, options);
    } catch (primaryError) {
      console.warn(\`Primary model \${currentModel} failed: \${primaryError}. Initiating fallback sequence...\`);
      fallbackOccurred = true;

      for (const fallbackModel of this.fallbackModels) {
        try {
          this.emit('fallback_attempt', { from: currentModel, to: fallbackModel, taskId });
          boxes = await this.invokeModelOcr(fallbackModel, pdfBuffer, options);
          currentModel = fallbackModel;
          break;
        } catch (fallbackError) {
          console.error(\`Fallback model \${fallbackModel} failed: \${fallbackError}\`);
        }
      }

      if (boxes.length === 0) {
        throw new Error('ALL_OCR_MODELS_EXHAUSTED (5003): Failed across primary and all fallback models');
      }
    }

    // Step 3: Filter by confidence threshold
    const filteredBoxes = boxes.filter((b) => b.confidence >= options.confidenceThreshold);

    const result: OcrJobResult = {
      taskId,
      documentHash,
      status: 'SUCCESS',
      totalPages: 1,
      processedPages: 1,
      boxes: filteredBoxes,
      processingTimeMs: Date.now() - startTime,
      modelUsed: currentModel,
      fallbackTriggered: fallbackOccurred,
    };

    this.emit('complete', result);
    return result;
  }

  private async invokeModelOcr(model: string, buffer: Buffer, options: any): Promise<OcrBoundingBox[]> {
    // Simulated engine parser logic
    return [
      {
        id: 'box-1',
        pageNumber: 1,
        x: 48,
        y: 120,
        width: 520,
        height: 64,
        text: 'PDFowers Intelligent Document Processing Pipeline Contract',
        confidence: 0.98,
      },
      {
        id: 'box-2',
        pageNumber: 1,
        x: 48,
        y: 190,
        width: 520,
        height: 180,
        text: 'Automated 7-Phase Vibe Coding verification passed with zero hallucination guarantee.',
        confidence: 0.95,
      },
    ];
  }
}`,
    completionCriteria: [
      {
        id: 'c6-1',
        description: 'TypeScript 컴파일 및 린트 0개 오류 통과',
        requiredRule: 'rule: tsc_no_emit_passed && eslint_errors == 0',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: '컴파일 성공 (에러 0, 경고 0)',
      },
      {
        id: 'c6-2',
        description: '자동 폴백 에러 핸들러 및 시나리오 3종 방어 코드 포함',
        requiredRule: 'rule: fallback_try_catch_implemented && magic_bytes_checked',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: 'Pre-flight 바이너리 검사 및 다단계 체인 폴백 로직 포함 확인',
      },
    ],
    inputArtifacts: ['Contract Interface TS', 'Test Suite Plan', 'jkadhp_dev Connection Hook'],
    outputArtifacts: ['PdfOcrEngine.ts', 'Compiled ES Module', 'Execution Benchmark Report'],
    executionLogs: [
      {
        timestamp: '2026-08-15 11:42:10',
        level: 'INFO',
        message: '코드 생성 완료: 다단계 폴백 엔진 및 바이너리 방어 로직 탑재',
        modelUsed: 'gpt-4o-codex',
        tokensConsumed: 22100,
      },
    ],
  },
  {
    phaseNumber: 7,
    code: 'PHASE_7_DOCUMENTATION_AND_GRAPH_SYNC',
    nameKr: '7. 문서 작성 및 작업그래프 현행화',
    nameEn: 'Work Review, Backlog & Task Graph Synchronization',
    description: '작업 리뷰 요약, 미처리 백로그 생성, jkadhp_dev DB 및 상위 작업그래프에 진행 상태 자동 동기화',
    assignedModelId: 'gemini-3-7-flash',
    fallbackModelId: 'claude-3-7-sonnet',
    status: 'IN_PROGRESS',
    completionCriteria: [
      {
        id: 'c7-1',
        description: '작업 완료 리뷰 보고서 생성 및 설계 대비 구현 일치율 100% 검증',
        requiredRule: 'rule: work_review_report_generated && spec_drift_score == 0',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: '기획 명세 대비 구현 드리프트 0% 확인',
      },
      {
        id: 'c7-2',
        description: '미처리 작업(Backlog) 식별 및 작업그래프(Task Graph) 노드 상태 자동 현행화',
        requiredRule: 'rule: pending_tasks_registered && task_graph_synced_to_db',
        isAutomated: true,
        status: 'PASSED',
        verificationLog: '후속 작업 [PDF-TABLE-05], [PDF-CRYPTO-02] 의존성 해제 및 DB 반영 완료',
      },
    ],
    inputArtifacts: ['PdfOcrEngine.ts', 'Execution Benchmark Report', 'Previous Task Graph State'],
    outputArtifacts: ['Release Notes MD', 'Updated Task Graph DAG', 'Pending Backlog Tickets'],
    executionLogs: [
      {
        timestamp: '2026-08-15 11:45:00',
        level: 'INFO',
        message: '작업그래프 동기화 대기 중: 7단계 최종 검증 진행',
        modelUsed: 'gemini-3-7-flash',
        tokensConsumed: 9500,
      },
    ],
  },
];

export const INITIAL_TASK_GRAPH: TaskGraphNode[] = [
  {
    id: 'node-stream-core',
    code: 'PDF-CORE-01',
    title: 'PDF 스트림 파서 & 가상 메모리 매퍼',
    module: 'CONVERT',
    complexity: 'HIGH',
    estimatedTokens: 38000,
    status: 'DONE',
    dependencies: [],
    assignedTo: 'mem-jkoo',
    currentPhase: 7,
    riskLevel: 'LOW',
    description: '대용량 PDF 문서의 메모리 절약형 청크 스트림 파싱 및 바이트 매핑 코어',
    phases: INITIAL_7_PHASES_TEMPLATE,
    gitBranch: 'feature/pdf-stream-core',
    specValidationScore: 100,
    derivedFromTaskId: undefined,
    derivedFromTaskCode: 'Root Base',
    addedAt: '2026-08-10 09:00 (프로젝트 킥오프 WBS)',
    addedReason: '전체 PDFowers 파이프라인의 필수 기반 엔진 구축',
    targetMilestone: 'v1.0-alpha',
  },
  {
    id: 'node-ocr-engine',
    code: 'PDF-OCR-04',
    title: '다국어 고해상도 OCR & 레이아웃 좌표 추출',
    module: 'OCR',
    complexity: 'HIGH',
    estimatedTokens: 45000,
    status: 'DONE',
    dependencies: ['node-stream-core'],
    assignedTo: 'mem-jkoo',
    currentPhase: 7,
    riskLevel: 'MEDIUM',
    description: 'Tesseract & Vision AI 하이브리드 엔진 기반 텍스트 블록 바운딩 박스 정밀 추출',
    phases: INITIAL_7_PHASES_TEMPLATE,
    gitBranch: 'feature/pdf-ocr-hybrid',
    specValidationScore: 100,
    derivedFromTaskId: 'node-stream-core',
    derivedFromTaskCode: 'PDF-CORE-01',
    addedAt: '2026-08-11 14:00 (스트림 파서 프로토타입 완료 후 착수)',
    addedReason: '스캔된 비텍스트 PDF 내 활자 인식을 위한 핵심 AI 모델 통합',
    targetMilestone: 'v1.0-beta',
  },
  {
    id: 'node-watermark',
    code: 'PDF-WATERMARK-02',
    title: '동적 벡터 워터마크 및 DRM 스탬프 엔진',
    module: 'WATERMARK',
    complexity: 'LOW',
    estimatedTokens: 18000,
    status: 'DONE',
    dependencies: ['node-stream-core'],
    assignedTo: 'mem-minji',
    currentPhase: 7,
    riskLevel: 'LOW',
    description: '사용자 ID/타임스탬프 기반 반투명 회전 워터마크 고속 오버레이 렌더러',
    phases: INITIAL_7_PHASES_TEMPLATE,
    gitBranch: 'feature/pdf-watermark-stamp',
    specValidationScore: 100,
    derivedFromTaskId: 'node-stream-core',
    derivedFromTaskCode: 'PDF-CORE-01',
    addedAt: '2026-08-12 10:30 (렌더링 레이어 분기)',
    addedReason: '문서 무단 유출 방지 및 사용자 워터마크 보안 요구사항 대응',
    targetMilestone: 'v1.0-beta',
  },
  {
    id: 'node-table-extract',
    code: 'PDF-TABLE-05',
    title: 'PDF 비구조화 표(Table) 감지 및 Excel 변환',
    module: 'TABLE_EXTRACT',
    complexity: 'MEDIUM',
    estimatedTokens: 32000,
    status: 'PLANNED',
    dependencies: ['node-ocr-engine'],
    assignedTo: 'mem-minji',
    currentPhase: 3,
    riskLevel: 'MEDIUM',
    description: '경계선이 없는 표와 복합 행/열 병합 셀 자동 감지 및 구조화 CSV/Excel 추출',
    phases: INITIAL_7_PHASES_TEMPLATE,
    gitBranch: 'feature/pdf-table-detect',
    specValidationScore: 88,
    derivedFromTaskId: 'node-ocr-engine',
    derivedFromTaskCode: 'PDF-OCR-04',
    addedAt: '2026-08-15 11:30 (PDF-OCR-04 Phase 6 검토 중 분기)',
    addedReason: '스캔 표 내부 셀 좌표 및 계층 구조 파싱을 위해 OCR 노드에서 파생 발굴',
    targetMilestone: 'v1.1-rc1',
  },
  {
    id: 'node-crypto-redact',
    code: 'PDF-CRYPTO-03',
    title: '개인정보(PII) 마스킹 & AES-256 암호화 보안',
    module: 'SECURITY',
    complexity: 'HIGH',
    estimatedTokens: 42000,
    status: 'ANALYSIS',
    dependencies: ['node-ocr-engine'],
    assignedTo: 'mem-daewon',
    currentPhase: 2,
    riskLevel: 'CRITICAL',
    description: '주민번호/계좌번호/이름 정규식+AI 마스킹 및 FIPS-140-2 표준 암호화 처리',
    phases: INITIAL_7_PHASES_TEMPLATE,
    gitBranch: 'feature/pdf-pii-redaction',
    specValidationScore: 82,
    derivedFromTaskId: 'node-ocr-engine',
    derivedFromTaskCode: 'PDF-OCR-04',
    addedAt: '2026-08-14 16:00 (보안 컴플라이언스 감사 회의)',
    addedReason: '금융/의료 PDF 내 민감 개인정보(PII) 자동 비식별화 규제 준수 요구',
    targetMilestone: 'v1.1-rc1',
  },
  {
    id: 'node-merge-split',
    code: 'PDF-MERGE-06',
    title: '무손실 PDF 다중 병합/분할 및 북마크 보존',
    module: 'MERGE_SPLIT',
    complexity: 'LOW',
    estimatedTokens: 15000,
    status: 'BACKLOG',
    dependencies: ['node-stream-core'],
    assignedTo: 'mem-junho',
    currentPhase: 1,
    riskLevel: 'LOW',
    description: '수백 개 PDF 파일의 비동기 병합, 아웃라인 및 상호 참조 테이블(XREF) 재구축',
    phases: INITIAL_7_PHASES_TEMPLATE,
    gitBranch: 'feature/pdf-batch-merger',
    specValidationScore: 75,
    derivedFromTaskId: 'node-stream-core',
    derivedFromTaskCode: 'PDF-CORE-01',
    addedAt: '2026-08-10 11:00 (초기 로드맵 WBS)',
    addedReason: '대용량 보고서 및 분할 PDF 병합 편의 기능 제공',
    targetMilestone: 'v1.2',
  },
  {
    id: 'node-form-fill',
    code: 'PDF-FORM-07',
    title: '대화형 PDF 폼(AcroForm/XFA) 필드 자동 인식 및 서명',
    module: 'CONVERT',
    complexity: 'MEDIUM',
    estimatedTokens: 28000,
    status: 'BACKLOG',
    dependencies: ['node-table-extract'],
    assignedTo: 'mem-minji',
    currentPhase: 1,
    riskLevel: 'MEDIUM',
    description: '공공/기업 신청서 양식의 체크박스/서명란 자동 매핑 및 전자 서명 주입 엔진',
    phases: INITIAL_7_PHASES_TEMPLATE,
    gitBranch: 'feature/pdf-form-automation',
    specValidationScore: 70,
    derivedFromTaskId: 'node-table-extract',
    derivedFromTaskCode: 'PDF-TABLE-05',
    addedAt: '2026-08-15 11:45 (PDF-TABLE-05 표 기획 회의 파생)',
    addedReason: '비정형 표 감지 엔진 확장으로 전자 신청서 양식 자동화 요구 도출',
    targetMilestone: 'v1.2',
  },
];

export const INITIAL_ARCHITECTURAL_PROPOSALS: ArchitecturalProposalCase[] = [
  {
    id: 'prop-1',
    category: 'Model Token & Fallback Routing',
    title: '토큰 계산 오차 및 비정형 스트림 시 장애 방어: 3계층 Proactive Fallback 패턴',
    problemStatement: '사전 토큰 계산(BPE Tokenizer 등)은 모델 버전별(o3 vs Claude vs Gemini) 내부 압축률과 Thinking 토큰량 차이로 인해 15~35%의 오차가 발생하며, 런타임에 불시 429 RateLimit/QuotaExceeded를 유발함.',
    empiricalCase: '사례: 2024년 대규모 RAG 플랫폼 구축 시 입력 프롬프트는 8,000 토큰으로 예측되었으나 모델 내부 사고(Thinking) 토큰이 14,000 토큰을 차지하여 컨텍스트 윈도우 초과 에러가 발생, 전체 워크플로우가 중단됨.',
    recommendedSolution: '1. 사전 Heuristic 토큰 추정(여유율 20% 마진 적용) 2. HTTP 에러 인터셉터에서 429/503/TokenExceeded 즉각 가로채기 3. 사전 정의된 Fallback Chain(Claude 3.7 -> ChatGPT Codex -> Gemini 3.7 Flash)으로 실시간 핫 스왑(Hot-swap) 실행.',
    benefit: '파이프라인 중단율 99.4% 감소, 실시간 무중단 페일오버 보장 및 팀 계정 한도 도달 시 자동 저비용 모델로 안전 전환.',
    riskMitigation: '상태 유실 방지를 위해 이전 모델의 중간 요약(Intermediate AST)을 컨텍스트로 압축하여 다음 모델에 주입.',
    specRuleLogic: 'EXEC_RULE: if (response.status in [429, 500, 503] || tokens_remaining < task.min_tokens) { route_to(model.fallbackOrder[0]) }',
  },
  {
    id: 'prop-2',
    category: 'Vibe Coding Governance',
    title: '바이브코딩의 모호성 제거: 7단계 Phase Gatekeeper & JSON Schema Contract',
    problemStatement: '단순 프롬프트 기반 바이브코딩은 "알아서 잘 만들어줘" 식의 환각(Hallucination), 모호한 시나리오 누락, 타입 불일치, 테스트 없는 코드 배포로 인해 프로덕션 신뢰성이 급격히 저하됨.',
    empiricalCase: '사례: 오픈소스 PDF 파서 개발 중 예외 시나리오(손상된 PDF 스트림)가 기획 단계에서 생략되어, 파일 업로드 시 Node.js 이벤트 루프가 블로킹되는 치명적 메모리 릭 발생.',
    recommendedSolution: '모든 작업을 7단계(검토->선정->기획->설계->테스트->코드->문서)로 분할하고, 각 단계마다 프로그래밍된 "완료 조건(Gatekeeper Rules)"을 강제. 특히 3단계 기획에서 Normal/Error/Exception 3종 시나리오 명세를 필수로 요구.',
    benefit: '환각 코드 생성율 0% 수렴, 테스트 커버리지 95% 이상 자동 보장, 명세 드리프트(Specification Drift) 원천 차단.',
    riskMitigation: 'Gatekeeper 검증이 통과되지 않으면 다음 단계 코드 생성 AI 호출 자체를 백엔드에서 물리적으로 차단.',
    specRuleLogic: 'GATE_RULE: assert(phase.scenarios.has("NORMAL") && phase.scenarios.has("ERROR") && phase.scenarios.has("EXCEPTION"))',
  },
  {
    id: 'prop-3',
    category: 'Database & Environment',
    title: '단일 개발 DB(jkadhp_dev)의 격리 및 스키마 현행화: Transactional Migration Pattern',
    problemStatement: 'stg/prd 없이 단일 dev DB(`jkadhp_dev`)만 사용하는 환경에서 다수의 팀원과 AI 에이전트가 동시 개발 시 스키마 충돌, 불완전 마이그레이션, 테스트 데이터 오염이 발생할 수 있음.',
    empiricalCase: '사례: 2명의 엔지니어가 각자 생성한 AI 코드를 동시 실행하여 `pdf_jobs` 테이블 컬럼 타입이 덮어씌워져 다른 개발자의 테스트가 전부 실패함.',
    recommendedSolution: '1. `jkadhp_dev` 내에 `schema_migrations` 테이블과 낙관적 락(Optimistic Lock) 적용 2. AI가 생성한 DDL 변경사항은 4단계(작업 설계)에서 AST 유효성 검사 후 임시 네임스페이스 트랜잭션으로 드라이런(Dry-run) 검증 3. 모든 DB 변경 로그를 `audit_records`에 기록.',
    benefit: '단일 dev DB 환경에서도 완벽한 작업 격리, 롤백 가능성 확보, 팀원 간 동시 작업 충돌 0건 달성.',
    riskMitigation: '각 Task별 고유 ID(`task_uuid`)를 기반으로 파티셔닝된 레코드 격리 제공.',
    specRuleLogic: 'DB_RULE: execute_with_savepoint("SAVEPOINT task_migration; ... ROLLBACK TO SAVEPOINT on_error;")',
  },
  {
    id: 'prop-4',
    category: 'Target Project Analysis',
    title: 'PDFowers 프로젝트 고도화를 위한 분산 파이프라인 아키텍처 제안',
    problemStatement: 'PDFowers는 OCR, 표 추출, 워터마크, 암호화 등 CPU/GPU 집약적 작업이 혼재되어 모놀리식 실행 시 메모리 오버헤드가 큼.',
    empiricalCase: '사례: 500페이지 분량의 스캔 문서를 단일 스레드로 처리하다가 OOM(Out Of Memory) 크래시가 발생하여 서버가 재부팅됨.',
    recommendedSolution: '1단계에서 도출한 작업그래프를 기반으로 `PDF-CORE-01(스트림 파서)`를 상위 모듈로 두고, OCR/테이블/워터마크를 가상 워커로 분산 처리하도록 아키텍처 인터페이스를 모듈화.',
    benefit: '메모리 점유율 70% 감소, 대용량 PDF 문서 병렬 처리 속도 3.8배 향상.',
    riskMitigation: '페이지 단위 스트림 청킹과 백프레셔(Backpressure) 제어 메커니즘을 6단계 코드 생성 시 기본 탑재.',
    specRuleLogic: 'ARCH_RULE: stream_pipe(pdfBuffer).chunk(pageSize: 50).pipe(workerPool)',
  },
];

export const INITIAL_DB_TABLES: DatabaseTableMeta[] = [
  {
    tableName: 'ai_accounts',
    description: '팀 공용 및 부서별 AI 제공업체(OpenAI, Anthropic, Google, Manus) 계정 및 토큰 쿼터 관리',
    rowCount: 4,
    sizeKb: 32,
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPrimary: true, description: '계정 고유 식별자' },
      { name: 'provider', type: 'VARCHAR(32)', description: 'AI 제공업체 (OPENAI/ANTHROPIC/GOOGLE/MANUS)' },
      { name: 'account_name', type: 'VARCHAR(128)', description: '계정 표시 이름' },
      { name: 'api_key_hash', type: 'VARCHAR(256)', description: '암호화된 API 키 해시' },
      { name: 'total_token_quota', type: 'BIGINT', description: '월간 총 토큰 한도' },
      { name: 'used_tokens', type: 'BIGINT', description: '현재 누적 사용 토큰' },
      { name: 'remaining_tokens', type: 'BIGINT', description: '남은 토큰 잔여량' },
      { name: 'cost_limit_usd', type: 'NUMERIC(10,2)', description: '월간 예산 상한선 (USD)' },
      { name: 'current_cost_usd', type: 'NUMERIC(10,2)', description: '현재 누적 비용 (USD)' },
      { name: 'status', type: 'VARCHAR(32)', description: '계정 상태 (HEALTHY/WARNING/EXHAUSTED)' },
    ],
    sampleRecords: [
      { id: 'acc-openai-prd', provider: 'OPENAI', account_name: 'OpenAI Enterprise', total_tokens: 10000000, used: 4230000, remaining: 5770000, cost_usd: 211.5 },
      { id: 'acc-anthropic-dev', provider: 'ANTHROPIC', account_name: 'Anthropic Claude Scale', total_tokens: 8000000, used: 6890000, remaining: 1110000, cost_usd: 344.5 },
      { id: 'acc-google-cloud', provider: 'GOOGLE', account_name: 'Google Gemini Pro (jkadhp_dev)', total_tokens: 25000000, used: 5410000, remaining: 19590000, cost_usd: 48.7 },
    ],
  },
  {
    tableName: 'team_members',
    description: 'JKADH 팀원 정보, RBAC 권한 등급, 모델 화이트리스트 및 일일 토큰 캡',
    rowCount: 4,
    sizeKb: 24,
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPrimary: true, description: '멤버 고유 식별자' },
      { name: 'name', type: 'VARCHAR(64)', description: '이름 및 직책' },
      { name: 'email', type: 'VARCHAR(128)', description: '업무 이메일' },
      { name: 'role', type: 'VARCHAR(32)', description: 'RBAC 역할 (ADMIN/ARCHITECT/ENGINEER/REVIEWER/AUDITOR)' },
      { name: 'allowed_models', type: 'JSONB', description: '사용 허가된 AI 모델 ID 목록' },
      { name: 'daily_token_limit', type: 'BIGINT', description: '1인 일일 토큰 상한선' },
      { name: 'tokens_used_today', type: 'BIGINT', description: '금일 사용한 토큰 수' },
      { name: 'status', type: 'VARCHAR(32)', description: '계정 활성 상태 (ACTIVE/SUSPENDED)' },
    ],
    sampleRecords: [
      { id: 'mem-jkoo', name: '구진규', email: 'jkoogit@gmail.com', role: 'ADMIN', daily_limit: 2000000, used_today: 485000 },
      { id: 'mem-minji', name: '김민지', email: 'minji.kim@team.io', role: 'ENGINEER', daily_limit: 1000000, used_today: 820000 },
      { id: 'mem-junho', name: '박준호', email: 'junho.park@team.io', role: 'REVIEWER', daily_limit: 800000, used_today: 210000 },
    ],
  },
  {
    tableName: 'task_nodes',
    description: 'PDFowers 프로젝트 대상 작업그래프 노드 및 7단계 라이프사이클 상태 저장소',
    rowCount: 6,
    sizeKb: 64,
    columns: [
      { name: 'id', type: 'VARCHAR(64)', isPrimary: true, description: '작업 노드 ID' },
      { name: 'code', type: 'VARCHAR(32)', description: '작업 코드 (예: PDF-OCR-04)' },
      { name: 'title', type: 'VARCHAR(256)', description: '작업 명칭' },
      { name: 'module', type: 'VARCHAR(64)', description: '서브시스템 모듈' },
      { name: 'complexity', type: 'VARCHAR(16)', description: '복잡도 등급' },
      { name: 'status', type: 'VARCHAR(32)', description: '현재 진행 상태' },
      { name: 'current_phase', type: 'INT', description: '현재 활성 라이프사이클 단계 (1~7)' },
      { name: 'dependencies', type: 'JSONB', description: '선행 의존 노드 ID 배열' },
      { name: 'spec_validation_score', type: 'INT', description: '명세 및 게이트키퍼 준수 점수 (0-100)' },
    ],
    sampleRecords: [
      { id: 'node-stream-core', code: 'PDF-CORE-01', title: 'PDF 스트림 파서', module: 'CONVERT', status: 'DONE', phase: 7, score: 100 },
      { id: 'node-ocr-engine', code: 'PDF-OCR-04', title: '다국어 고해상도 OCR', module: 'OCR', status: 'DEVELOPING', phase: 6, score: 94 },
      { id: 'node-table-extract', code: 'PDF-TABLE-05', title: '비구조화 표 감지', module: 'TABLE_EXTRACT', status: 'PLANNED', phase: 3, score: 88 },
    ],
  },
  {
    tableName: 'execution_metrics',
    description: 'AI 모델 호출, 토큰 소비량, 응답 지연 시간, Fallback 트리거 및 에러 감사 로그',
    rowCount: 148,
    sizeKb: 112,
    columns: [
      { name: 'id', type: 'BIGSERIAL', isPrimary: true, description: '로그 고유 일련번호' },
      { name: 'timestamp', type: 'TIMESTAMPTZ', description: '발생 시각' },
      { name: 'task_code', type: 'VARCHAR(32)', description: '관련 작업 코드' },
      { name: 'user_id', type: 'VARCHAR(64)', description: '호출 사용자 식별자' },
      { name: 'model_used', type: 'VARCHAR(64)', description: '실제 응답을 처리한 AI 모델' },
      { name: 'tokens_consumed', type: 'INT', description: '소비된 토큰 총량' },
      { name: 'cost_usd', type: 'NUMERIC(8,4)', description: '발생 비용' },
      { name: 'latency_ms', type: 'INT', description: '응답 지연 시간 (ms)' },
      { name: 'status', type: 'VARCHAR(32)', description: '실행 결과 (SUCCESS/FALLBACK/ERROR)' },
    ],
    sampleRecords: [
      { id: 101, timestamp: '2026-08-15 11:42:10', task_code: 'PDF-OCR-04', user: 'mem-jkoo', model: 'gpt-4o-codex', tokens: 22100, latency: 1120, status: 'SUCCESS' },
      { id: 102, timestamp: '2026-08-15 11:38:00', task_code: 'PDF-OCR-04', user: 'mem-jkoo', model: 'gpt-4o-codex', tokens: 14200, latency: 980, status: 'SUCCESS' },
      { id: 103, timestamp: '2026-08-15 11:33:15', task_code: 'PDF-OCR-04', user: 'mem-jkoo', model: 'claude-3-7-sonnet', tokens: 16500, latency: 1540, status: 'SUCCESS' },
      { id: 104, timestamp: '2026-08-15 11:28:40', task_code: 'PDF-OCR-04', user: 'mem-jkoo', model: 'claude-3-7-sonnet', tokens: 18900, latency: 1620, status: 'SUCCESS' },
      { id: 105, timestamp: '2026-08-15 11:24:12', task_code: 'PDF-OCR-04', user: 'mem-jkoo', model: 'gemini-3-7-flash', tokens: 8600, latency: 410, status: 'SUCCESS' },
    ],
  },
];

export const INITIAL_METRICS_CHART_DATA: ExecutionMetric[] = [
  { timestamp: '06:00', tokens: 12000, costUSD: 0.18, latencyMs: 450, model: 'gemini-3-7-flash', status: 'SUCCESS', taskCode: 'PDF-CORE-01', userId: 'mem-jkoo' },
  { timestamp: '07:00', tokens: 28000, costUSD: 0.42, latencyMs: 510, model: 'gemini-3-7-flash', status: 'SUCCESS', taskCode: 'PDF-CORE-01', userId: 'mem-jkoo' },
  { timestamp: '08:00', tokens: 45000, costUSD: 1.12, latencyMs: 1250, model: 'claude-3-7-sonnet', status: 'SUCCESS', taskCode: 'PDF-OCR-04', userId: 'mem-jkoo' },
  { timestamp: '09:00', tokens: 62000, costUSD: 1.55, latencyMs: 1420, model: 'claude-3-7-sonnet', status: 'SUCCESS', taskCode: 'PDF-OCR-04', userId: 'mem-minji' },
  { timestamp: '10:00', tokens: 91000, costUSD: 2.27, latencyMs: 1680, model: 'gpt-4o-codex', status: 'FALLBACK', taskCode: 'PDF-OCR-04', userId: 'mem-jkoo' },
  { timestamp: '11:00', tokens: 114000, costUSD: 2.85, latencyMs: 980, model: 'gpt-4o-codex', status: 'SUCCESS', taskCode: 'PDF-OCR-04', userId: 'mem-jkoo' },
  { timestamp: '12:00', tokens: 78000, costUSD: 1.95, latencyMs: 820, model: 'gemini-3-7-flash', status: 'SUCCESS', taskCode: 'PDF-TABLE-05', userId: 'mem-minji' },
  { timestamp: '13:00', tokens: 84000, costUSD: 2.10, latencyMs: 1100, model: 'claude-3-7-sonnet', status: 'SUCCESS', taskCode: 'PDF-WATERMARK-02', userId: 'mem-junho' },
];

export const INITIAL_DOCUMENTATION_SECTIONS: DocumentationSection[] = [
  {
    id: 'doc-jkadh-overview',
    category: 'METHODOLOGY',
    titleKr: 'jkadh 아키텍처 개요 및 프로젝트 비전',
    titleEn: 'jkadh Architecture Standard & Project Vision',
    summary: 'AI Vibe Coding의 무결성과 재현성을 보장하는 엔터프라이즈 거버넌스 프레임워크와 PDFowers 고도화 목표',
    tags: ['jkadh', 'Architecture', 'Overview', 'PDFowers', 'Governance'],
    lastUpdated: '2026-08-15',
    contentMarkdown: `# 1. jkadh 아키텍처 표준 개요 및 비전

## 1.1 jkadh 프레임워크란?
**jkadh (Jin-Kyu Architecture & Development Harness)**는 대규모 언어 모델(LLM)과 에이전틱(Agentic) AI 코딩 환경에서 발생하는 고유한 한계점—**환각(Hallucination), 스펙 드리프트(Specification Drift), 불완전한 예외 처리, 비결정론적 코드 생성, 토큰 쿼터 고갈**—을 공학적으로 통제하기 위해 설계된 엔터프라이즈 아키텍처 거버넌스 표준입니다.

## 1.2 핵심 문제의식 및 프로젝트 타깃
* **대상 프로젝트**: **PDFowers** (대규모 문서 지능화, 고해상도 OCR, 복합 표 추출, DRM 워터마크, AES-256 암호화 및 무손실 분할/병합 파이프라인)
* **인프라 제약**: 스테이징/운영(stg/prd) 분리 없는 **단일 개발 데이터베이스 (\`jkadhp_dev\`, PostgreSQL 16.2)** 환경
* **핵심 해결 과제**:
  1. 사전 토큰 계산 오차 및 비정형 출력 시 실시간 무중단 핫스왑 Fallback 체인 구축
  2. 단순 프롬프트 바이브코딩의 모호성을 제거하는 7단계 Phase Gatekeeper 규칙 강제
  3. 팀 공용 AI 계정 풀(OpenAI, Anthropic, Google, Manus)의 RBAC 권한 격리 및 토큰 비용 통제
  4. 단일 개발 DB 환경에서의 작업 노드별 트랜잭션 격리 및 스키마 충돌 방지

---

## 1.3 4대 아키텍처 원칙 (Core Architectural Pillars)
\`\`\`
+-----------------------------------------------------------------------------------+
|                           jkadh 4대 아키텍처 원칙                                  |
+-----------------------------------------------------------------------------------+
| 1. Zero-Drift Specification   : 기획(3대 시나리오) -> 설계(JSON Schema) -> 구현 검증 |
| 2. Circuit Breaker Fallback    : 429/503/Quota 초과 시 300ms 내 저비용/고용량 모델 핫스왑 |
| 3. Transactional Isolation    : jkadhp_dev 단일 DB 내 Savepoint 기반 마이그레이션 격리  |
| 4. Continuous Quality Gate    : 단계별 게이트키퍼 통과 및 엄격한 정적 검증(TypeScript)   |
+-----------------------------------------------------------------------------------+
\`\`\`
`,
  },
  {
    id: 'doc-7phase-lifecycle',
    category: 'LIFECYCLE',
    titleKr: '7단계 엔드투엔드 딜리버리 라이프사이클',
    titleEn: '7-Phase End-to-End Delivery Pipeline',
    summary: '작업 검토부터 기획, 설계, 테스트 설계, 코드 생성 및 작업그래프 현행화까지 이어지는 표준 7단계 공정',
    tags: ['7-Phase', 'Lifecycle', 'Pipeline', 'Gatekeeper', 'Delivery', 'Task Graph'],
    lastUpdated: '2026-08-15',
    contentMarkdown: `# 2. 7단계 엔드투엔드 딜리버리 라이프사이클

jkadh 표준은 모든 소프트웨어 작업 노드를 다음 **7단계 공정**으로 분할하여 순차 집행하며, 각 단계마다 프로그래밍된 Gatekeeper 자동 검증을 통과해야만 다음 단계로 전진(Advance)합니다.

---

### Phase 1: 작업대상 검토 (Work Target Review)
* **목적**: 대상 코드베이스(PDFowers)의 모듈 간 의존성 DAG, 영향 반경, 입력/출력 인터페이스 분석
* **전담 모델**: \`Gemini 3.7 Flash\` (대용량 컨텍스트 1M 분석)
* **산출물**: Dependency Graph JSON, Impact Radius Matrix
* **Gatekeeper Rule**: \`no_cyclic_dependencies && all_upstream_nodes_resolved\`

### Phase 2: 작업 선정 및 우선순위화 (Task Selection & Prioritization)
* **목적**: 비즈니스 ROI, 복잡도(1~10), 토큰 예측량, 실패 위험도를 종합 산정하여 Sprint 작업 큐 배정
* **전담 모델**: \`Gemini 3.7 Flash\` / \`Claude 3.7 Sonnet\`
* **산출물**: Task Selection Card, Resource Allocation Sheet
* **Gatekeeper Rule**: \`assignee_has_model_permission && daily_quota_headroom > estimated_tokens\`

### Phase 3: 작업목표 / 세부명세 / 3대 시나리오 정의 (Task Planning)
* **목적**: **Happy Path (정상)**, **Error Recovery (오류)**, **Edge-case Bounds (예외)** 3대 시나리오 전수 작성
* **전담 모델**: \`Claude 3.7 Sonnet (Thinking)\`
* **산출물**: Scenario Specification Doc, State Transition Table, Fallback Ruleset JSON
* **Gatekeeper Rule**: \`scenarios.has_all(["NORMAL", "ERROR", "EXCEPTION"]) && error_recovery_defined\`

### Phase 4: 아키텍처 및 인터페이스 설계 (Architecture & Interface Design)
* **목적**: TypeScript 엄격 인터페이스, JSON Schema Draft-07 계약, \`jkadhp_dev\` PostgreSQL DDL 정의
* **전담 모델**: \`Claude 3.7 Sonnet\`
* **산출물**: Contract Interface TS, Postgres Migration SQL, Sequence Diagram
* **Gatekeeper Rule**: \`json_schema_valid && no_any_types && strict_null_checks\`

### Phase 5: 테스트 스위트 및 하네스 설계 (Test Suite & Failure Injection Design)
* **목적**: 3대 시나리오를 1:1 매핑하는 테스트 벡터 수립, 429 Quota 고갈 및 타임아웃 장애 주입 케이스 설계
* **전담 모델**: \`ChatGPT Codex\` / \`Manus Operator\`
* **산출물**: Test Suite Plan, Failure Injection Matrix, Mockless Fixture Definitions
* **Gatekeeper Rule**: \`all_scenarios_have_test_cases && fallback_circuit_breaker_test_defined\`

### Phase 6: 코드 작성 및 1차 구현 (Code Generation & Sandbox Execution)
* **목적**: 설계 명세 기반 고신뢰도 TypeScript 구현, 린트/컴파일 검증, 런타임 샌드박스 실행
* **전담 모델**: \`ChatGPT Codex\` / \`Claude 3.7 Sonnet\`
* **산출물**: Source Code (\`PdfOcrEngine.ts\`), Compiled ES Module, Execution Benchmark
* **Gatekeeper Rule**: \`tsc_no_emit_passed && eslint_errors == 0 && fallback_try_catch_implemented\`

### Phase 7: 문서 작성 및 작업그래프 현행화 (Work Review, Backlog & Task Graph Synchronization)
* **목적**: 작업 결과 리뷰 보고서 생성, 기획 명세 대비 구현 드리프트(Drift) 0% 검증, 미처리 작업(Backlog) 식별 및 상위 작업그래프/DB 실시간 동기화
* **전담 모델**: \`Gemini 3.7 Flash\` / \`Claude 3.7 Sonnet\`
* **산출물**: Release Notes MD, Updated Task Graph DAG, Pending Backlog Tickets
* **Gatekeeper Rule**: \`work_review_report_generated && spec_drift_score == 0 && task_graph_synced_to_db\`
`,
  },
  {
    id: 'doc-refactoring-standard',
    category: 'REFACTORING',
    titleKr: '리팩토링 표준 가이드라인 & 코드 품질 기준',
    titleEn: 'Refactoring Standards, Checklist & AI Directives',
    summary: '엔터프라이즈 코드 품질을 위한 4대 리팩토링 원칙, 코드 스멜 카탈로그 및 AI 프롬프트 지침',
    tags: ['Refactoring', 'Code Quality', 'Clean Code', 'TypeScript', 'DRY', 'Performance'],
    lastUpdated: '2026-08-15',
    contentMarkdown: `# 3. jkadh 리팩토링 표준 가이드라인 & 코드 품질 기준

> **"리팩토링은 기능 추가가 아니라, 테스트와 검증이 확보된 상태에서 소프트웨어의 내적 구조를 고도화하는 작업이다."**

---

## 3.1 리팩토링 및 코드 품질 고도화 원칙
jkadh 프레임워크는 7단계 라이프사이클의 Phase 6(코드 작성) 및 Phase 7(문서화 및 완료 검토) 단계에서 고품질의 엔터프라이즈 코드를 보장하기 위해 다음과 같은 엄격한 리팩토링 표준을 준수합니다.

---

## 3.2 리팩토링 4대 절대 원칙 (4 Core Pillars)

### 원칙 1: 기능 및 동작 불변 보장 (No Behavioral Drift)
* 리팩토링 전후 외부 관찰 가능한 동작(API 시그니처, 반환값, 상태 전이, 이벤트 방출)은 100% 동일해야 합니다.
* 리팩토링 도중 신규 기능을 추가하거나 기존 비즈니스 룰을 임의 변경하는 것은 금지됩니다.

### 원칙 2: DRY (Don't Repeat Yourself) & 단일 책임 원칙 (SRP)
* 동일하거나 유사한 로직(예: 에러 파싱, 토큰 포맷팅, DB 쿼리 핸들러)은 순수 유틸리티 또는 커스텀 훅으로 추출합니다.
* 150줄을 초과하는 거대 함수(God Function)나 300줄을 초과하는 컴포넌트는 단일 책임을 갖는 하위 서브컴포넌트로 분할합니다.

### 원칙 3: 엄격한 타입 시스템 & 런타임 Null 방어 (Strict Type Rigidity)
* \`any\`, \`as unknown as T\`, 암시적 타입 단언을 전면 배제합니다.
* 조건부 데이터는 **Discriminated Unions (구별된 유니온)**을 적용하여 런타임 타입 에러를 컴파일 타임에 포착합니다.
* 배열 탐색 시 \`find()\` 결과는 반드시 Optional Chaining(\`?.\`) 및 Nullish Coalescing(\`??\`) 기본값을 제공합니다.

### 원칙 4: 도메인 어휘 일관성 & 인지 부하 최소화 (Clean Lexicon)
* PDFowers 및 jkadh 표준 용어(예: \`taskId\`, \`documentHash\`, \`phaseNumber\`, \`fallbackOrder\`)를 통일하여 사용합니다.
* 매직 넘버(예: \`4002\`, \`1000000\`, \`1450\`)는 의미 있는 \`const\` 상수 객체 또는 \`enum\`으로 추출합니다.

---

## 3.3 코드 스멜 분류 및 표준 해결 전략 (Code Smell Catalogue)

| 번호 | 코드 스멜 (Code Smell) | 발생 원인 / 징후 | 표준 해결 전략 (Refactoring Fix) |
|---|---|---|---|
| **CS-01** | **God Component / Monolith** | 컴포넌트 1개에 UI 렌더링, API 호출, 상태 계산이 뒤섞임 | 뷰 프리젠터, 커스텀 훅, 서브 카드로 모듈화 분할 |
| **CS-02** | **Magic Literals / Numbers** | 하드코딩된 에러 코드, 색상 hex, 쿼터 제한값 | \`STATUS_CODES\`, \`THEME_COLORS\` 상수 모듈화 |
| **CS-03** | **Loose / Any Typing** | \`Record<string, any>\` 남발 및 비정형 payload | 엄격한 인터페이스 정의 및 Zod/JSON Schema 가드 |
| **CS-04** | **Unmemoized Computations** | 렌더링마다 대규모 배열 filter/reduce 반복 실행 | \`useMemo\`, \`useCallback\`, 파생 상태 메모이제이션 |
| **CS-05** | **Duplicated Error Handlers** | 각 API 호출마다 중복 작성된 try-catch 블록 | 중앙집중식 에러 인터셉터 및 Circuit Breaker Hook 추출 |

---

## 3.4 AI 리팩토링 프롬프트 표준 템플릿 (AI Refactoring Directive)

Claude 3.7 Sonnet 또는 ChatGPT Codex에 코드 개선을 요청할 때는 반드시 아래 지침을 시스템 프롬프트로 전달합니다:

\`\`\`markdown
[시스템 리팩토링 지침]
당신은 jkadh 아키텍처 표준을 준수하는 시니어 소프트웨어 엔지니어입니다.
주어진 코드는 기획 및 인터페이스 설계 명세를 충족하는 구현체입니다.
당신의 임무는 다음 기준에 따라 코드를 리팩토링하고 고도화하는 것입니다:

1. [기능 불변성]: 기존 인터페이스, 반환 형태, 상태 전이 로직을 절대 변경하지 마십시오.
2. [타입 안전성]: any 타입을 제거하고 정확한 TypeScript 인터페이스를 선언하십시오.
3. [DRY]: 중복 계산을 useMemo로 캐싱하고 공통 헬퍼를 분리하십시오.
4. [가독성]: 복잡한 조건식은 명확한 서술형 불리언 변수로 추출하십시오.
5. [컴파일 검증]: tsc --noEmit 에러가 0건이어야 합니다.
\`\`\`
`,
  },
  {
    id: 'doc-model-governance',
    category: 'MODELS',
    titleKr: 'AI 모델 메타정보 매트릭스 & 핫스왑 Fallback 라우팅',
    titleEn: 'AI Model Metadata Matrix & Proactive Fallback Chains',
    summary: 'Claude 3.7, Codex, Gemini 3.7 Flash, Manus Operator의 최적 공정 배정 및 서킷 브레이커 전환 메커니즘',
    tags: ['AI Models', 'Fallback', 'Circuit Breaker', 'Token Pricing', 'Claude', 'Codex', 'Gemini'],
    lastUpdated: '2026-08-15',
    contentMarkdown: `# 4. AI 모델 거버넌스 및 Fallback 라우팅 매트릭스

## 4.1 모델별 공정 최적화 매트릭스

| 모델명 | 제공업체 | Context | 1M 토큰당 비용 (In/Out) | 추천 단계 (Phase) | 핵심 역량 |
|---|---|---|---|---|---|
| **Claude 3.7 Sonnet** | Anthropic | 200K | $3.0 / $15.0 | **Phase 1, 3, 4, 7** | 기획, 3대 시나리오 추출, AST 아키텍처 설계, 코드 리뷰 |
| **ChatGPT Codex** | OpenAI | 128K | $2.5 / $10.0 | **Phase 5, 6** | 엄격한 타입 코드 생성, 단위 테스트 하네스, 버그 픽스 |
| **Gemini 3.7 Flash** | Google | 1M | $0.15 / $0.60 | **Phase 1, 2, 7** | 100만 컨텍스트 초저지연 분석, JSON Spec 실시간 검증 |
| **Manus Operator** | Manus | 64K | $5.0 / $25.0 | **Phase 2, 5** | 자율 브라우저/샌드박스 실행, E2E 통합 테스트, 자동 치유 |

---

## 4.2 Proactive Fallback 라우팅 메커니즘 (3-Tier Circuit Breaker)
\`\`\`
[Primary Model 요청] (예: Claude 3.7 Sonnet)
        |
        +---> [HTTP 200 OK] ------> [Gatekeeper JSON Schema 검증] ---> 정상 완료
        |
        +---> [HTTP 429 Quota / 503 / Timeout 감지]
                    |
                    v
          [Circuit Breaker 인터셉터 작동 (<150ms)]
                    |
                    v
          [1차 Fallback 전환: ChatGPT Codex]
                    |
                    +---> [성공 시 복구 로그 기록]
                    |
                    +---> [실패 시 2차 Fallback: Gemini 3.7 Flash (1M Window)]
\`\`\`
`,
  },
  {
    id: 'doc-account-rbac',
    category: 'RBAC',
    titleKr: '팀 공용 AI 계정 풀링 & RBAC 권한/토큰 한도 제어 정책',
    titleEn: 'Shared AI Account Pooling & Token Quota Governance',
    summary: 'OpenAI, Anthropic, Google, Manus 공용 계정 풀과 역할(Role) 기반 토큰 예산 및 모델 접근 통제',
    tags: ['Team', 'RBAC', 'Account Pool', 'Token Quota', 'Security'],
    lastUpdated: '2026-08-15',
    contentMarkdown: `# 5. 팀 공용 AI 계정 풀 및 RBAC 거버넌스

## 5.1 RBAC 권한 매트릭스 (Role-Based Access Control)

| 역할 (Role) | 대상 인원 예시 | 접근 가능 모델 | 일일 토큰 캡 | 월간 예산 상한 | 권한 범위 |
|---|---|---|---|---|---|
| **ADMIN** | 구진규 (Lead) | 전 모델 (Claude, Codex, Gemini, Manus) | 2,000,000 | $250 | 계정 풀 관리, 쿼터 리셋, 멤버 권한 승격, DB 쿼리 실행 |
| **ARCHITECT** | 시니어 아키텍트 | Claude 3.7, ChatGPT Codex, Gemini 3.7 | 1,500,000 | $200 | 기획, 아키텍처 설계, 게이트키퍼 룰 설정 |
| **ENGINEER** | 김민지, 엔지니어 | ChatGPT Codex, Gemini 3.7 Flash | 1,000,000 | $150 | 코드 작성, 테스트 스위트 실행, 로컬 구현 |
| **REVIEWER** | 박준호, 코드 리뷰어 | Claude 3.7, ChatGPT Codex | 800,000 | $100 | PR 리뷰, AST 정적 분석, 3대 시나리오 검토 |
| **AUDITOR** | 정대원, 보안/컴플라이언스 | Gemini 3.7 Flash | 500,000 | $50 | 토큰 감사 로그 조회, PII 마스킹 정책 준수 확인 |
`,
  },
  {
    id: 'doc-database-architecture',
    category: 'DATABASE',
    titleKr: 'jkadhp_dev PostgreSQL 단일 개발 데이터베이스 아키텍처',
    titleEn: 'jkadhp_dev PostgreSQL Architecture & DDL Schema',
    summary: 'stg/prd 없는 단일 개발 DB 환경에서 트랜잭션 격리, 마이그레이션 및 감사 로그 스키마 명세',
    tags: ['PostgreSQL', 'jkadhp_dev', 'Database', 'Schema', 'DDL', 'Migrations'],
    lastUpdated: '2026-08-15',
    contentMarkdown: `# 6. jkadhp_dev PostgreSQL 데이터베이스 아키텍처

## 6.1 단일 개발 DB 환경 격리 원칙
* **데이터베이스명**: \`jkadhp_dev\` (PostgreSQL 16.2)
* **스키마 네임스페이스**: \`public\`
* **동시성 제어**: Task 고유 ID 기반 Savepoint 격리 및 마이그레이션 락 메커니즘 적용

## 6.2 핵심 테이블 DDL 요약
* \`ai_accounts\`: AI Provider 계정 풀 및 잔여 토큰/비용 현황
* \`team_members\`: RBAC 역할, 모델 화이트리스트 및 일일 토큰 캡
* \`task_nodes\`: PDFowers 작업그래프 및 7단계 라이프사이클 상태
* \`execution_metrics\`: AI 호출 레이턴시, 소비 토큰, Fallback 발생 내역
* \`model_execution_logs\`: AI 모델 실행 및 감사 로그
`,
  },
  {
    id: 'doc-runbook-troubleshoot',
    category: 'RUNBOOK',
    titleKr: '운영 런북 & 장애 시나리오 복구 가이드',
    titleEn: 'Operational Runbook & Chaos Recovery Playbook',
    summary: '429 Quota 고갈, 503 Provider 다운, Spec Drift 발생 시 단계별 비상 대응 절차',
    tags: ['Runbook', 'Troubleshooting', 'Disaster Recovery', '429 Quota', 'Operations'],
    lastUpdated: '2026-08-15',
    contentMarkdown: `# 7. 운영 런북 및 장애 복구 가이드

## 7.1 시나리오 1: 429 Token Quota Exhaustion 발생 시
1. 서킷 브레이커가 자동으로 차순위 모델(\`gemini-3-7-flash\`)로 핫스왑 라우팅
2. 관리자(ADMIN)는 **팀 & 계정 관리** 탭에서 대상 계정의 [토큰 쿼터 리셋] 버튼 클릭
3. 팀원 토큰 소진 시 일일 한도를 일시 증액(\`dailyTokenLimit\`) 처리

## 7.2 시나리오 2: 코드 생성 및 검증 중 회귀(Regression) / Gatekeeper 실패 시
1. Gatekeeper Validator가 즉시 다음 단계 전진을 차단하고 트랜잭션 롤백
2. Phase 4 아키텍처 명세 및 Phase 5 테스트 벡터 스냅샷으로 코드베이스 롤백
3. Fallback 모델(Claude 3.7 Sonnet 또는 Codex)로 프롬프트에 실패 로그를 주입하여 재작성 집행
`,
  },
  {
    id: 'doc-task-graph-management',
    category: 'TASK_GRAPH',
    titleKr: '작업그래프(Task Graph DAG) 관리 및 2계층 파생·누적 이력 체계',
    titleEn: 'Task Graph Dual-DAG: Pending Derived Backlog & Bottom-up History',
    summary: '상단 미진행 파생 백로그 그래프와 하단 상향 누적 작업이력 그래프로 구성된 2계층 작업그래프 및 파생/추가시점 관리 체계',
    tags: ['Task Graph', 'Dual-DAG', 'Pending Backlog', 'Derivation', 'Added Timestamp', 'Bottom-Up', 'Savepoint'],
    lastUpdated: '2026-08-15',
    contentMarkdown: `# 8. 작업그래프(Task Graph DAG) 관리 및 2계층 파생·누적 이력 체계

## 8.1 2계층 작업그래프(Dual-Graph) 아키텍처 개요

**jkadh 작업그래프**는 프로젝트 진행 중 도출되는 신규 파생 요구사항과 기존 구현 이력을 명확히 구분하여 관리하기 위해 **상단 '미진행 파생 백로그 그래프'**와 **하단 '상향 누적(Bottom-up) 작업 이력 그래프'**의 **2계층 듀얼 그래프(Dual-Graph)** 구조를 채택합니다.

\`\`\`
┌──────────────────────────────────────────────────────────────────────────┐
│ [상단] 미진행 작업 및 파생 백로그 그래프 (Pending & Derived Graph)          │
│  - 선행 작업 진행 중 도출된 파생 요구사항 (표 추출, 폼 자동화, PII 마스킹) │
│  - 파생 원천 노드 (Ancestry), 추가 시점 (Timestamp), 추가 사유 명시       │
│  - 선행 작업 완료 시 즉시 개발 단계로 자동 승급 대기                     │
└──────────────────────────────────────────────────────────────────────────┘
                                   ▲
                         (선후행 의존성 연결 & 승급)
                                   │
┌──────────────────────────────────────────────────────────────────────────┐
│ [하단] 진행 및 완료 작업 이력 그래프 (Active & History DAG - Bottom Up)    │
│  - 맨 위(Head): 현재 실시간 개발·동기화 중인 최신 작업 (PDF-OCR-04)        │
│  - 중간: 검증 및 완료된 기능 브랜치 (PDF-WATERMARK-02, PDF-RENDER-02)    │
│  - 맨 아래(Base): 프로젝트 초기 기반 작업 (PDF-CORE-01)                  │
└──────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 8.2 2계층 작업그래프 ASCII 다이어그램 (Dual-Graph Log)

\`\`\`text
================================================================================
[상단 1영역] 미진행 작업 및 파생 백로그 그래프 (PENDING & DERIVED TASKS)
================================================================================
*   (TASK-07) [BACKLOG] PDF-FORM-07: 대화형 PDF 폼(AcroForm/XFA) 필드 자동 인식 및 서명
│   ├── 파생 원천: PDF-TABLE-05 (비정형 표 감지 엔진 확장으로 신청서 폼 자동화 요구 도출)
│   ├── 추가 시점: 2026-08-15 11:45 (PDF-TABLE-05 표 기획 회의 중 분기)
│   └── 목표 릴리즈: v1.2 / 담당: 김민지
│
*   (TASK-06) [PLANNED] PDF-TABLE-05: PDF 비구조화 표(Table) AI 감지 및 Excel 변환
│   ├── 파생 원천: PDF-OCR-04 (스캔 표 내부 셀 좌표 및 계층 구조 파싱 요구 도출)
│   ├── 추가 시점: 2026-08-15 11:30 (PDF-OCR-04 Phase 6 검토 중 분기)
│   └── 선행 해제: PDF-OCR-04 (DONE 전이 시 DEVELOPING 자동 승급)
│
*   (TASK-04) [ANALYSIS] PDF-CRYPTO-03: 개인정보(PII) 마스킹 & AES-256 암호화 보안
│   ├── 파생 원천: PDF-OCR-04 (금융/의료 PDF 내 민감 개인정보 자동 비식별화 규제)
│   ├── 추가 시점: 2026-08-14 16:00 (보안 컴플라이언스 감사 회의)
│   └── 선행 해제: PDF-OCR-04 / 담당: 이대원
│
*   (TASK-05) [BACKLOG] PDF-MERGE-06: 무손실 PDF 다중 병합/분할 및 북마크 보존
    ├── 파생 원천: PDF-CORE-01 (기반 스트림 파서 연계)
    ├── 추가 시점: 2026-08-10 11:00 (초기 로드맵 WBS)
    └── 목표 릴리즈: v1.2 / 담당: 박준호

--------------------------------------------------------------------------------
▲ [의존성 전이 경계: 선행 작업 완료 시 상단 백로그로 자동 트리거 발송]
--------------------------------------------------------------------------------

================================================================================
[하단 2영역] 진행 및 완료 작업 이력 그래프 (BOTTOM-UP WORK HISTORY DAG)
================================================================================
▲ [최신 완료 및 승급 작업 (Head)]
│
*   (TASK-03) [DONE: Phase 7] PDF-OCR-04: 다국어 고해상도 OCR & 레이아웃 좌표 추출 ⭐️
|\  ├── 의존: PDF-CORE-01 (스트림 파서)
| | ├── 회복: Claude 3.7 ➔ 429 시 Gemini 3.7 Flash 핫스왑 검증 통과 (100점)
| | └── 완료: 7단계 문서화 및 작업그래프 DB 실시간 동기화 완료 (승급 완료)
| |
* | (TASK-02) [DONE: Phase 7] PDF-WATERMARK-02: 동적 벡터 워터마크 및 DRM 스탬프 엔진
|/  ├── 의존: PDF-CORE-01
|   └── 완료: Skia 래스터 기반 반투명 회전 렌더러 검증 완료 (100% Pass)
|
*   (TASK-01) [DONE: Phase 7] PDF-RENDER-02: Skia 기반 고해상도 PDF 래스터라이저 엔진
|   ├── 의존: PDF-CORE-01
|   └── 완료: 300DPI 텍스트 셰이딩 및 벡터 래스터라이징 검증 완료
|
*   (TASK-00) [DONE: Foundation Base] PDF-CORE-01: PDF 토큰 스트림 파서 & 가상 메모리 매퍼
    ├── 의존: None (루트 기반 작업)
    ├── 추가 시점: 2026-08-10 09:00 (프로젝트 킥오프 WBS)
    └── 완료: 복합 압축 스트림(FlateDecode) 파싱 및 청크 스트림 분할 안정화
▼ [프로젝트 초기 기반 작업 (Foundation Base)]
\`\`\`

---

## 8.3 미진행 및 파생 작업 명세표 (Pending Tasks & Lineage)

| 작업 코드 | 작업명 | 상태 | 파생 원천 (Ancestry) | 추가 시점 (Timestamp) | 추가 배경 및 사유 | 목표 마일스톤 |
|---|---|---|---|---|---|---|
| **\`PDF-FORM-07\`** | 대화형 PDF 폼 자동인식 & 서명 | \`BACKLOG\` | \`PDF-TABLE-05\` | 2026-08-15 11:45 | 표 감지 파서 확장으로 전자 신청서 양식 자동 완성 요구 도출 | \`v1.2\` |
| **\`PDF-TABLE-05\`** | 비구조화 표 AI 감지 및 Excel 변환 | \`DEVELOPING\` | \`PDF-OCR-04\` | 2026-08-15 11:30 | 선행 \`PDF-OCR-04\` 완료로 의존성 잠금 해제 ➔ 착수 승급 | \`v1.1-rc1\` |
| **\`PDF-CRYPTO-03\`**| 개인정보(PII) 마스킹 & AES-256 | \`ANALYSIS\` | \`PDF-OCR-04\` | 2026-08-14 16:00 | 금융/의료 PDF 내 민감 개인정보(PII) 자동 비식별화 규제 준수 | \`v1.1-rc1\` |
| **\`PDF-MERGE-06\`** | 무손실 PDF 다중 병합/분할 | \`BACKLOG\` | \`PDF-CORE-01\` | 2026-08-10 11:00 | 대용량 분할 PDF의 비동기 병합 및 북마크 XREF 재구성 편의 기능 | \`v1.2\` |

---

## 8.4 진행 및 완료 작업 이력 명세표 (Active & History Tasks)

| 작업 코드 | 작업명 | 모듈 | 선행 의존 노드 | 상태 | 현재 단계 | 담당 / 모델 |
|---|---|---|---|---|---|---|
| **\`PDF-OCR-04\`** | 다국어 고해상도 OCR & 레이아웃 좌표 | OCR | \`PDF-CORE-01\` | **\`DONE\`** | **Phase 7 (검증·동기화 완료)** | 구진규 / Claude ➔ Gemini |
| **\`PDF-WATERMARK-02\`**| 동적 벡터 워터마크 및 DRM 스탬프 | Watermark | \`PDF-CORE-01\` | **\`DONE\`** | Phase 7 (검증 완료) | 김민지 / Codex |
| **\`PDF-RENDER-02\`** | Skia 기반 고해상도 PDF 래스터라이저 | Rendering | \`PDF-CORE-01\` | **\`DONE\`** | Phase 7 (완료) | 김민지 / Codex |
| **\`PDF-CORE-01\`** | PDF 스트림 파서 & 가상 메모리 매퍼 | Core Engine | None (Root Base) | **\`DONE\`** | Phase 7 (완료) | 구진규 / Claude 3.7 |

---

## 8.5 jkadh 고도화 작업관리 방안 제안 (Work Management Innovations)

2계층 듀얼 작업그래프 구조와 파생 추적성을 극대화하기 위한 **4대 고도화 방안**:

### 1. 파생 태스크-원천 태스크 간 컨텍스트 자동 상속 (Lineage Context Inheritance)
- **개념**: 파생 태스크(\`PDF-TABLE-05\`)가 생성될 때, 원천 태스크(\`PDF-OCR-04\`)의 Phase 4 아키텍처 JSON 스키마 및 Phase 5 테스트 픽스처를 자동으로 상속 복제.
- **효과**: 신규 파생 작업 기획 시 0부터 문서를 작성할 필요 없이 상위 노드의 인터페이스 정합성을 100% 보장.

### 2. 태스크 브랜치-DB 세이브포인트 1:1 바인딩 (Branch-Savepoint Coupling)
- **개념**: Git 브랜치(\`feature/pdf-ocr\`)가 생성될 때 \`jkadhp_dev\` DB에 해당 태스크 전용 Transaction Savepoint(\`SP_TASK_PDF_OCR_04\`)를 자동 발급.
- **효과**: 개발 또는 검증 실패 시 Git 커밋 롤백과 DB 롤백이 원클릭으로 동기화되어 개발 DB 오염 방지.

### 3. DAG 의존성 기반 자동 백로그 잠금 해제 (Event-Driven Promotion)
- **개념**: 하단 이력의 상위 노드(\`PDF-OCR-04\`)가 \`DONE\` 상태로 전이되면, 상단 미진행 그래프의 자식 노드(\`PDF-TABLE-05\`)에 Webhook 이벤트를 발행.
- **효과**: 후속 작업의 상태가 \`PLANNED\`에서 \`DEVELOPING\`으로 자동 전환되며 전담 AI 모델에 시나리오 생성 프롬프트 자동 디스패치.

### 4. 작업 단위별 토큰·비용 소모량 실시간 누적 메트릭 (Token Consumption Tracking)
- **개념**: 그래프 각 노드 우측에 실시간 누적 소모 토큰(\`Tokens: 45.2k ($0.18)\`)을 태깅.
- **효과**: 태스크별 실제 ROI를 정량 측정하고, 예산 초과 위험 시 조기에 저비용 모델(Gemini Flash)로 핫스왑 라우팅.
`,
  },
  {
    id: 'doc-harness-architecture-comparison',
    category: 'HARNESS',
    titleKr: '개발 하네스 점검 및 기존 jkadh 대비 비교 분석',
    titleEn: 'Harness Architecture Evolution & Comparative Analysis',
    summary: '세션시작, 태스크시작/처리/정리/승급, 세션종료, 루프 등 7대 핵심 하네스 영역별 기존 jkadh 대비 유지·개선·현행화 심층 비교',
    tags: ['Harness', 'Architecture', 'Comparison', 'Session', 'Lifecycle', 'Circuit Breaker', 'Self-Healing'],
    lastUpdated: '2026-08-15',
    contentMarkdown: `# 9. 개발 하네스 점검 및 기존 jkadh 대비 비교 분석 (Harness Architecture & Evolution)

## 9.1 개요
본 문서는 기존 **Classic jkadh 프레임워크**의 하네스 아키텍처를 면밀히 분석하고, 이번 **JKADH AI DevPlatform (PDFowers)** 프로젝트에서 계승(Maintained), 개선(Improved), 신규 현행화(Modernized)한 하네스 제어 메커니즘을 7대 생애주기 영역별로 비교 분석하여 정리한 공식 레퍼런스입니다.

---

## 9.2 7대 핵심 하네스 라이프사이클 비교 매트릭스

| 하네스 영역 (Harness Stage) | 기존 Classic jkadh 방식 | 현행 JKADH AI DevPlatform (PDFowers) 개선점 | 진화 분류 |
|---|---|---|---|
| **1. 세션시작 (Session Start)** | 로컬 환경 변수(\`.env\`) 로드 및 단일 API 키 인증 | **멀티 Provider 계정 풀링, RBAC 기반 팀원 토큰 쿼터(Soft/Hard Cap) 및 모델 헬스체크 자동 초기화** | **대폭 개선 (Enhanced)** |
| **2. 태스크시작 (Task Start)** | 로컬 파일시스템의 JSON 태스크 정의서 단순 로드 | **작업그래프(Task DAG) 선행 의존성 해제 검증, 3대 시나리오(Happy/Error/Edge) 템플릿 강제 주입** | **체계화 (Standardized)** |
| **3. 태스크처리 (Task Process)** | 단일 LLM에 거대 프롬프트 일괄 전달 후 코드 수신 | **7단계 분할 공정, 모델별 전담 배정(Claude 기획/설계, Codex 코드, Gemini 검증), 3-Tier Circuit Breaker (<150ms 핫스왑)** | **핵심 고도화 (Core Innovation)** |
| **4. 태스크정리 (Task Cleanup)** | 런타임 종료 후 임시 디렉토리 단순 삭제 | **\`jkadhp_dev\` 단일 DB Savepoint 롤백, AST 정적 검증(\`tsc --noEmit\`), 메모리/토큰 소비 감사 로그 영속화** | **격리 강화 (Hardened)** |
| **5. 태스크승급 (Task Advance)** | 개발자의 수동 승인 또는 단순 exit code 0 확인 | **Phase별 Gatekeeper 자동 검증 룰(JSON Schema Draft-07, 스펙 드리프트 0% 점수) 통과 시에만 자동 승급** | **무결성 강제 (Zero-Drift)** |
| **6. 세션종료 (Session Terminate)** | CLI 프로세스 단순 종료 | **일일/월간 토큰 소비 집계, 잔여 예산 갱신, 후속 백로그 티켓 자동 발굴 및 PostgreSQL 상태 동기화** | **거버넌스 통합 (Governance)** |
| **7. 루프관련 (Loop & Resilience)** | 고정 횟수 단순 재시도 (Linear Retry Loop) | **429/503 즉시 회피형 지능형 Fallback 체인, 스펙 드리프트 자가 치유(Self-Healing) 피드백 루프** | **지능화 (Self-Healing)** |

---

## 9.3 영역별 상세 하네스 분석

### 1. 세션시작 하네스 (Session Start Harness)
* **기존 jkadh**:
  * 단일 개발자가 개인 API 키를 \`.env\`에 설정하고 단일 세션으로 구동.
  * 팀 단위 예산 통제나 모델별 쿼터 분기 기능 부재.
* **현행 개선점**:
  * **중앙 집중형 AI 계정 풀**: Anthropic, OpenAI, Google, Manus 4개 Provider 계정의 실시간 잔여 쿼터와 지연시간을 헬스체크.
  * **RBAC 토큰 가드**: 팀원 역할(\`ADMIN\`, \`ARCHITECT\`, \`ENGINEER\`, \`REVIEWER\`, \`AUDITOR\`)에 따라 일일 토큰 캡(500K ~ 2M) 및 모델 화이트리스트 자동 적용.

### 2. 태스크시작 하네스 (Task Start Harness)
* **기존 jkadh**:
  * 독립된 태스크 파일을 읽어 바로 프롬프트 생성에 진입하여 선후행 작업 간의 인터페이스 충돌 위험 존재.
* **현행 개선점**:
  * **DAG 의존성 가드**: \`PDF-PARSER-01\` 등 상위 노드가 \`DONE\` 상태가 아니면 하위 노드(\`PDF-OCR-04\`)의 착수를 차단.
  * **3대 시나리오 템플릿 의무화**: 정상(Happy Path), 오류 복구(Error Recovery), 극단 경계값(Edge-case Bounds) 시나리오 입력 필드를 강제 주입.

### 3. 태스크처리 하네스 (Task Processing Harness)
* **기존 jkadh**:
  * 단일 모델(예: GPT-4)에 기획부터 코드 작성까지 한 번에 요청하여 긴 컨텍스트에서 환각 및 세부 요구사항 누락(Drift) 빈발.
  * 429 Quota 에러 발생 시 Exponential Backoff로 수 분간 전체 파이프라인 정체.
* **현행 개선점**:
  * **7단계 공정 분할 (Phase 1~7)**: 모델의 고유 특기에 따라 기획/설계는 Claude 3.7 Sonnet, 코드 작성은 ChatGPT Codex, 대량 검증/현행화는 Gemini 3.7 Flash로 특화 배정.
  * **Proactive Circuit Breaker**: 429/503 에러 또는 15초 이상 지연 발생 시 150ms 내에 차순위 모델로 무중단 핫스왑 실행.

### 4. 태스크정리 하네스 (Task Cleanup & Teardown Harness)
* **기존 jkadh**:
  * 빌드 후 생성된 임시 파일(\`.tmp\`)을 삭제하는 수준에 그쳐, 단일 DB 환경에서 이전 테스트 데이터가 남아 오염 유발.
* **현행 개선점**:
  * **Savepoint 트랜잭션 롤백**: \`jkadhp_dev\` 단일 개발 DB에서 작업 노드별 Savepoint를 생성하여, 검증 실패 시 작업 이전 상태로 완벽 롤백.
  * **실행 메트릭 영속화**: 소비 토큰, 소요 시간, 비용(USD), Fallback 이력을 \`model_execution_logs\` 테이블에 자동 기록.

### 5. 태스크승급 하네스 (Task Advancement & Promotion Harness)
* **기존 jkadh**:
  * Phase 간 승급이 개발자의 육안 확인이나 모호한 프롬프트 판단에 의존.
* **현행 개선점**:
  * **프로그래머블 Gatekeeper Engine**:
    * Phase 1: \`no_cyclic_dependencies\`
    * Phase 3: \`scenarios.has_all(["NORMAL", "ERROR", "EXCEPTION"])\`
    * Phase 4: \`json_schema_valid && no_any_types\`
    * Phase 6: \`tsc_no_emit_passed && eslint_errors == 0\`
    * Phase 7: \`spec_drift_score == 0 && task_graph_synced_to_db\`
  * 룰 미충족 시 다음 단계 UI 버튼이 비활성화되며 사유를 실시간 로깅.

### 6. 세션종료 하네스 (Session Termination Harness)
* **기존 jkadh**:
  * 프로세스 종료 시 작업 결과가 개별 파일로만 남아 상위 관리자나 팀원이 진행 상황을 파악하기 어려움.
* **현행 개선점**:
  * **종합 거버넌스 리포트 생성**: 세션 동안 소비된 총 토큰, 비용, 모델별 분담률 자동 산출.
  * **작업그래프 및 백로그 DB 동기화**: 미해결 과제를 후속 백로그 티켓으로 발행하고, \`jkadhp_dev\` DB \`task_nodes\` 레코드에 반영.

### 7. 루프관련 하네스 (Loop & Resilience Harness)
* **기존 jkadh**:
  * \`for (i=0; i<3; i++)\` 식의 동일 모델 재시도 루프를 사용하여 Quota 고갈 시 모든 재시도가 연속 실패.
* **현행 개선점**:
  * **지능형 자가 치유(Self-Healing) 피드백 루프**: 컴파일 에러나 린트 오류 발생 시 에러 AST를 캡처하여 Fallback 모델의 프롬프트에 자동 주입해 1회 내에 즉시 수정.
  * **멀티 티어 Fallback 체인**: \`Claude 3.7 ➔ Codex ➔ Gemini 3.7 Flash\` 순으로 지연 없이 계단식 하향 전환.

---

## 9.4 요약 및 실무 적용 권고사항
이번 프로젝트에서 현행화된 하네스는 **"인간 개발자의 개입을 최소화하면서도, AI의 비결정론적 한계를 결정론적 게이트키퍼와 단일 DB 트랜잭션으로 통제"**하는 데 초점을 맞추고 있습니다. 모든 엔지니어와 에이전트는 본 하네스 규격을 준수하여 작업을 집행해야 합니다.
`,
  },
];

