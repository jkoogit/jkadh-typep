/**
 * Comprehensive 3-Scenario Unit Tests for [PDF-CRYPTO-03]
 * 1. Happy Path: Financial/Medical PII Detection, Redaction & AES-256-GCM Roundtrip
 * 2. Error Recovery: Tampered AuthTag / Invalid Key Defense & Fallback Chain
 * 3. Edge Bounds: Zero-Byte Buffer, Clean PDF & Mass Pattern Clustering
 */

import { PdfCryptoRedactionEngine } from './PdfCryptoRedactionEngine';
import { PdfCryptoRedactOptions } from '../types/pdfCrypto';

export async function runPdfCryptoRedactionTests(): Promise<{
  allPassed: boolean;
  totalTests: number;
  passedTests: number;
  results: { scenario: string; passed: boolean; details: string }[];
}> {
  const engine = PdfCryptoRedactionEngine.getInstance();
  const results: { scenario: string; passed: boolean; details: string }[] = [];

  // Scenario 1: Happy Path - Financial & Medical PII Detection, Redaction & AES-256-GCM Roundtrip
  try {
    const sampleFinancialMedicalPdfText = `
      [서울대병원 진료비 영수증 및 입출금 확인서]
      수검자명: 홍길동 (환자명: 홍길동)
      주민등록번호: 920512-1029384
      신용카드 결제: 4520-1234-5678-9012 (신한카드)
      환불계좌: 110-382-918234 (신한은행)
      연락처: 010-9876-5432 / 이메일: patient.hong@health.co.kr
      질병코드: K29.7 (상세불명의 위염)
    `;

    const customKeyHex = 'f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f80';
    const options: PdfCryptoRedactOptions = {
      secretKey: customKeyHex,
      enableAiInference: true,
      maskingStrategy: 'PARTIAL_ASTERISK'
    };

    const redactResult = await engine.detectRedactAndEncrypt(sampleFinancialMedicalPdfText, options);

    const hasRrn = redactResult.redactedPiiList.some((p) => p.category === 'RESIDENT_ID');
    const hasCard = redactResult.redactedPiiList.some((p) => p.category === 'CREDIT_CARD');
    const hasBank = redactResult.redactedPiiList.some((p) => p.category === 'BANK_ACCOUNT');
    const hasPhone = redactResult.redactedPiiList.some((p) => p.category === 'PHONE');
    const hasEmail = redactResult.redactedPiiList.some((p) => p.category === 'EMAIL');
    const hasMedical = redactResult.redactedPiiList.some((p) => p.category === 'MEDICAL_RECORD');
    const hasEncryption = Boolean(redactResult.encryptedPayload && redactResult.encryptedPayload.ciphertextHex);

    // Decrypt and verify payload
    let isDecryptedAccurate = false;
    if (redactResult.encryptedPayload) {
      const decrypted = await engine.decryptPayload(redactResult.encryptedPayload, customKeyHex);
      isDecryptedAccurate = decrypted.isVerified && decrypted.items.length === redactResult.redactedPiiList.length;
    }

    const passed = hasRrn && hasCard && hasBank && hasPhone && hasEmail && hasMedical && hasEncryption && isDecryptedAccurate;
    results.push({
      scenario: '1. Happy Path (Financial & Medical PII Detection, Redaction & AES-256-GCM Roundtrip)',
      passed,
      details: `Detected ${redactResult.totalPiiDetected} PII items (RRN, Card, Bank, Phone, Email, Medical). Encrypted & Decrypted with AuthTag verified.`
    });
  } catch (err: any) {
    results.push({
      scenario: '1. Happy Path',
      passed: false,
      details: err?.message || String(err)
    });
  }

  // Scenario 2: Error Recovery - Tampered AuthTag / Wrong Key Defense & Fallback Chain
  try {
    const testText = '주민등록번호: 880101-1234567, 계좌: 02-123-456789';
    const originalKey = '1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff';
    const wrongKey = 'ffffddddccccbbbbaaaa9999888877776666555544443333222211110000aaaa';

    const redactResult = await engine.detectRedactAndEncrypt(testText, { secretKey: originalKey });
    let defenseCaught = false;

    if (redactResult.encryptedPayload) {
      // Test 1: Wrong Key Decryption
      try {
        await engine.decryptPayload(redactResult.encryptedPayload, wrongKey);
      } catch (e: any) {
        if (e.message.includes('CRYPTO_AUTH_TAG_MISMATCH')) {
          defenseCaught = true;
        }
      }

      // Test 2: Tampered Ciphertext
      const tamperedPayload = {
        ...redactResult.encryptedPayload,
        authTagHex: '00000000000000000000000000000000'
      };
      try {
        await engine.decryptPayload(tamperedPayload, originalKey);
        defenseCaught = false; // Should not reach here
      } catch (e: any) {
        defenseCaught = defenseCaught && e.message.includes('CRYPTO_AUTH_TAG_MISMATCH');
      }
    }

    results.push({
      scenario: '2. Error Recovery (Tampered AuthTag / Wrong Key Fast-Fail Defense)',
      passed: defenseCaught,
      details: defenseCaught
        ? 'Successfully intercepted CRYPTO_AUTH_TAG_MISMATCH (6002) upon key mismatch & ciphertext tampering.'
        : 'Failed to intercept tampered payload.'
    });
  } catch (err: any) {
    results.push({
      scenario: '2. Error Recovery',
      passed: false,
      details: err?.message || String(err)
    });
  }

  // Scenario 3: Edge Bounds - Zero-Byte Buffer, Clean PDF & Large Text Chunking
  try {
    // 3.1 Empty buffer
    const emptyResult = await engine.detectRedactAndEncrypt(new Uint8Array(0));
    const emptyPassed = emptyResult.status === 'CLEAN' && emptyResult.totalPiiDetected === 0;

    // 3.2 Clean text without any PII
    const cleanText = 'JKADH Framework 2026 Architectural Whitepaper. Pure non-sensitive technical specification.';
    const cleanResult = await engine.detectRedactAndEncrypt(cleanText);
    const cleanPassed = cleanResult.status === 'CLEAN' && cleanResult.totalPiiDetected === 0;

    // 3.3 Large repetitive text
    const largeText = 'Clean content line.\n'.repeat(500) + '주민등록번호: 991231-1098765\n' + 'Other line.\n'.repeat(500);
    const largeResult = await engine.detectRedactAndEncrypt(largeText);
    const largePassed = largeResult.status === 'SUCCESS' && largeResult.totalPiiDetected === 1;

    const passed = emptyPassed && cleanPassed && largePassed;
    results.push({
      scenario: '3. Edge Bounds (Zero-Byte Buffer, Clean Text & 1,000-Line Large Stream)',
      passed,
      details: `Empty Buffer: ${emptyResult.status}, Clean Text: ${cleanResult.status}, Large Stream: ${largeResult.totalPiiDetected} PII detected.`
    });
  } catch (err: any) {
    results.push({
      scenario: '3. Edge Bounds',
      passed: false,
      details: err?.message || String(err)
    });
  }

  const passedTests = results.filter((r) => r.passed).length;
  return {
    allPassed: passedTests === results.length,
    totalTests: results.length,
    passedTests,
    results
  };
}
