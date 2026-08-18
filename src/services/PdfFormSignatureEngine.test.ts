/**
 * Comprehensive 3-Scenario Unit Tests for [PDF-FORM-07]
 * 1. Happy Path: AcroForm & PAdES Digital Signature
 * 2. Error Recovery: Heuristic Visual Field Inference & Fallback
 * 3. Edge Bounds: Empty Buffer & Extreme Bound Safety
 */

import { PdfFormSignatureEngine } from './PdfFormSignatureEngine';
import { PdfFormExtractOptions } from '../types/pdfForm';

export async function runPdfFormSignatureTests(): Promise<{
  allPassed: boolean;
  totalTests: number;
  passedTests: number;
  results: { scenario: string; passed: boolean; details: string }[];
}> {
  const engine = PdfFormSignatureEngine.getInstance();
  const results: { scenario: string; passed: boolean; details: string }[] = [];

  // Scenario 1: Happy Path - AcroForm & PAdES Signature Extraction
  try {
    const dummyAcroPdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]); // %PDF-1.7
    const result = await engine.extractFormAndSignatures(dummyAcroPdf);

    const hasFields = result.fields.length === 5;
    const hasSignature = result.signatures.length === 1;
    const isPadesValid = engine.verifySignatureIntegrity(result.signatures[0]).isValid;

    const passed = hasFields && hasSignature && isPadesValid && result.formType === 'ACROFORM';
    results.push({
      scenario: '1. Happy Path (AcroForm & PAdES Signature Extraction)',
      passed,
      details: `Extracted ${result.fields.length} fields, ${result.signatures.length} signature (PAdES Valid: ${isPadesValid})`
    });
  } catch (err: any) {
    results.push({
      scenario: '1. Happy Path',
      passed: false,
      details: err?.message || String(err)
    });
  }

  // Scenario 2: Error Recovery - Inferred Visual Fields & Fallback
  try {
    const nonAcroPdf = new Uint8Array([0x00, 0x01, 0x02]); // Non-standard PDF stream
    const options: PdfFormExtractOptions = {
      inferScanForms: true,
      modelFallbackChain: ['claude-3-7-sonnet', 'gpt-4o-codex', 'gemini-3-7-flash']
    };
    const result = await engine.extractFormAndSignatures(nonAcroPdf, options);

    const passed = result.totalFields > 0 && (result.formType === 'INFERRED' || result.formType === 'NONE');
    results.push({
      scenario: '2. Error Recovery (Heuristic Box/Underline Inference & Fallback Chain)',
      passed,
      details: `Fallback Type: ${result.formType}, Fields: ${result.totalFields}, Triggered: ${result.auditTrail.fallbackTriggered}`
    });
  } catch (err: any) {
    results.push({
      scenario: '2. Error Recovery',
      passed: false,
      details: err?.message || String(err)
    });
  }

  // Scenario 3: Edge Bounds - Empty Buffer & Zero-Length Payload Safety
  try {
    const emptyPdf = new Uint8Array(0);
    const result = await engine.extractFormAndSignatures(emptyPdf);

    const passed = result.totalFields === 0 && result.signatureCount === 0 && result.formType === 'NONE';
    results.push({
      scenario: '3. Edge Bounds (Empty Buffer & Zero Payload Safety)',
      passed,
      details: `Handled safely without crash. Total Fields: ${result.totalFields}, Type: ${result.formType}`
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
