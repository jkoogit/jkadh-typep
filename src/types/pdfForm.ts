/**
 * PDF Form & Digital Signature Types (ISO 32000-1 / PAdES Standard)
 * Task: [PDF-FORM-07]
 */

export type PdfFormFieldType = 'TEXT' | 'CHECKBOX' | 'RADIO' | 'CHOICE' | 'SIGNATURE';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface PdfFormField {
  id: string;
  name: string;
  type: PdfFormFieldType;
  boundingBox: BoundingBox;
  defaultValue?: string | boolean;
  value?: string | boolean;
  isRequired: boolean;
  isReadOnly: boolean;
  options?: string[]; // For CHOICE/RADIO
  mappingTag?: string; // e.g., 'user_name', 'resident_id'
}

export interface PdfSignatureSpec {
  id: string;
  signerName: string;
  reason: string;
  location: string;
  contactInfo?: string;
  timestamp: string;
  visualRect: BoundingBox;
  certThumbprint: string;
  hashAlgorithm: 'SHA-256' | 'SHA-512';
  isValid: boolean;
  signedAt: string;
}

export interface PdfFormExtractOptions {
  inferScanForms?: boolean; // Heuristic box/underline detection if AcroForm is absent
  detectSignatures?: boolean;
  targetPages?: number[];
  modelFallbackChain?: ('claude-3-7-sonnet' | 'gpt-4o-codex' | 'gemini-3-7-flash')[];
}

export interface PdfFormExtractResult {
  taskId: string;
  totalFields: number;
  formType: 'ACROFORM' | 'XFA' | 'INFERRED' | 'HYBRID' | 'NONE';
  fields: PdfFormField[];
  signatureCount: number;
  signatures: PdfSignatureSpec[];
  processingTimeMs: number;
  auditTrail: {
    engineVersion: string;
    modelUsed: string;
    fallbackTriggered: boolean;
  };
}

export interface FormErrorResult {
  errorCode: string;
  errorMessage: string;
  recoverable: boolean;
  fallbackStrategyUsed: string;
}
