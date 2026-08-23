/**
 * PDF Personal Identifiable Information (PII) Redaction & AES-256 Crypto Types
 * Specification for [PDF-CRYPTO-03]
 */

import { BoundingBox } from './pdfForm';

export type PiiCategory =
  | 'RESIDENT_ID'        // 한국 주민등록번호 (예: 900101-1234567)
  | 'FOREIGNER_ID'       // 외국인등록번호
  | 'BANK_ACCOUNT'       // 금융기관 계좌번호
  | 'CREDIT_CARD'        // 신용/체크카드 번호 (16자리)
  | 'PHONE'              // 휴대전화 및 일반 전화번호
  | 'EMAIL'              // 전자우편 주소
  | 'MEDICAL_RECORD'     // 의료 진단코드/환자 식별번호/처방 내역
  | 'PASSPORT'           // 여권번호 (M12345678)
  | 'DRIVER_LICENSE';    // 운전면허번호

export type MaskingStrategy =
  | 'PARTIAL_ASTERISK'   // 부분 별표 마스킹 (예: 900101-1******)
  | 'FULL_BLACKOUT'      // 완전 시각적 블랙아웃 (████████)
  | 'CATEGORY_TOKEN'     // 토큰 치환 (예: [REDACTED_RESIDENT_ID])
  | 'PSEUDONYMIZE';      // 가명화 해시 처리

export interface PiiDetectionMatch {
  id: string;
  category: PiiCategory;
  originalValue: string;
  maskedValue: string;
  confidence: number; // 0.0 ~ 1.0
  page: number;
  boundingBox?: BoundingBox;
  isAiInferred?: boolean;
  checksumValid?: boolean;
  metadata?: Record<string, any>;
}

export interface EncryptedPayload {
  algorithm: 'AES-256-GCM';
  keyId: string;
  ivHex: string;         // 12-byte IV (24 hex chars)
  authTagHex: string;    // 16-byte Auth Tag (32 hex chars)
  ciphertextHex: string; // AES-GCM Encrypted payload in hex
  encryptedAt: string;
  itemCount: number;
}

export interface DecryptedPayload {
  keyId: string;
  decryptedAt: string;
  items: PiiDetectionMatch[];
  isVerified: boolean;
}

export interface PdfCryptoRedactOptions {
  detectCategories?: PiiCategory[];
  maskingStrategy?: MaskingStrategy;
  maskingChar?: string;
  secretKey?: string; // 32-byte AES-256 key in hex or utf-8
  enableAiInference?: boolean;
  modelFallbackChain?: string[];
  preserveLastDigits?: number;
}

export interface PdfCryptoRedactResult {
  taskId: string;
  documentHash: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'CLEAN';
  totalPiiDetected: number;
  redactedPiiList: PiiDetectionMatch[];
  encryptedPayload?: EncryptedPayload;
  visualRedactionBoxCount: number;
  processingTimeMs: number;
  auditTrail: {
    engineVersion: string;
    modelUsed: string;
    fallbackTriggered: boolean;
    fipsCompliance: 'FIPS-140-2-AES-GCM';
  };
}
