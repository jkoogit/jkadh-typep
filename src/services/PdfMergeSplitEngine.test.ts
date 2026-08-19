/**
 * @file PdfMergeSplitEngine.test.ts
 * @module PDFowers/MergeSplit
 * @description Comprehensive 3-Scenario Unit Tests for [PDF-MERGE-06]
 * 1. Happy Path: Lossless Multi-PDF Merge with Bookmark Hierarchy Re-indexing & Range Split
 * 2. Error Recovery: Corrupted Header / Encrypted Stream Defense (5002) & Range Auto-Clamping
 * 3. Edge Bounds: Zero-Byte Buffer, Single-Page Burst, Deep Bookmark Nesting & High Page Chunks
 * @version 1.9.0
 */

import { PdfMergeSplitEngine } from './PdfMergeSplitEngine';
import { PdfBookmarkNode, PdfDocumentInput } from '../types/pdfMergeSplit';

export async function runPdfMergeSplitTests(): Promise<{
  allPassed: boolean;
  totalTests: number;
  passedTests: number;
  results: { scenario: string; passed: boolean; details: string }[];
}> {
  const engine = new PdfMergeSplitEngine();
  const results: { scenario: string; passed: boolean; details: string }[] = [];

  // Scenario 1: Happy Path - Lossless Multi-PDF Merge with Bookmark Preservation & Range Split
  try {
    // 1.1 Create 2 sample documents with bookmarks
    const doc1Bookmarks: PdfBookmarkNode[] = [
      { id: 'bm1-1', title: 'Chapter 1: Architecture Overview', targetPageIndex: 0 },
      { id: 'bm1-2', title: 'Chapter 2: Governance Loops', targetPageIndex: 2 },
    ];
    const doc1Buffer = engine.generateSyntheticSamplePdf('Document 1 - Architecture', 3, doc1Bookmarks);

    const doc2Bookmarks: PdfBookmarkNode[] = [
      { id: 'bm2-1', title: 'Section A: Security Vault', targetPageIndex: 0 },
      { id: 'bm2-2', title: 'Section B: API Quotas', targetPageIndex: 1 },
    ];
    const doc2Buffer = engine.generateSyntheticSamplePdf('Document 2 - Operations', 2, doc2Bookmarks);

    const inputs: PdfDocumentInput[] = [
      { id: 'doc-1', name: 'Arch_Doc.pdf', buffer: doc1Buffer, sizeBytes: doc1Buffer.length, pageCount: 3 },
      { id: 'doc-2', name: 'Ops_Doc.pdf', buffer: doc2Buffer, sizeBytes: doc2Buffer.length, pageCount: 2 },
    ];

    // Merge execution
    const mergeResult = await engine.mergeDocuments(inputs, {
      preserveBookmarks: true,
      generateBookmarkPerDocument: true,
    });

    const mergePassed =
      mergeResult.success &&
      mergeResult.totalPages === 5 &&
      mergeResult.mergedDocumentsCount === 2 &&
      mergeResult.bookmarksTree.length === 2 &&
      mergeResult.bookmarksTree[1].children?.[0].targetPageIndex === 3; // Doc 2 Section A remapped from 0 -> 3

    // 1.2 Split execution on merged result
    const splitInput: PdfDocumentInput = {
      id: 'doc-merged',
      name: 'Consolidated.pdf',
      buffer: mergeResult.outputBuffer,
      sizeBytes: mergeResult.outputBuffer.length,
      pageCount: mergeResult.totalPages,
    };

    const splitResult = await engine.splitDocument(splitInput, {
      splitMode: 'BY_PAGE_RANGES',
      ranges: [
        { rangeId: 'r1', startPage: 1, endPage: 2, outputName: 'Part_1.pdf' },
        { rangeId: 'r2', startPage: 4, endPage: 5, outputName: 'Part_2.pdf' },
      ],
      preserveBookmarks: true,
    });

    const splitPassed =
      splitResult.success &&
      splitResult.totalCreatedFiles === 2 &&
      splitResult.splitOutputs[0].pageCount === 2 &&
      splitResult.splitOutputs[1].pageCount === 2;

    const passed = mergePassed && splitPassed;
    results.push({
      scenario: '1. Happy Path (Multi-PDF Merge + Bookmark Remapping & Page Range Split)',
      passed,
      details: `Merged 2 docs (3p + 2p = ${mergeResult.totalPages}p). Bookmarks remapped (Doc2 targetPageIndex: ${mergeResult.bookmarksTree[1]?.children?.[0]?.targetPageIndex}). Split into 2 slices (${splitResult.splitOutputs.map((s) => s.pageRange).join(', ')}).`,
    });
  } catch (err: any) {
    results.push({
      scenario: '1. Happy Path',
      passed: false,
      details: err?.message || String(err),
    });
  }

  // Scenario 2: Error Recovery - Corrupt Header / Encrypted Stream Defense (5002) & Range Auto-Clamping
  try {
    // 2.1 Corrupt buffer (missing %PDF-)
    const corruptBuffer = Buffer.from('NOT_A_VALID_PDF_STREAM_CONTENT_HEADER', 'utf-8');
    let corruptCaught = false;
    try {
      engine.parsePdfStructure(corruptBuffer);
    } catch (e: any) {
      corruptCaught = e.message.includes('5002') || e.message.includes('PDF_MERGE_CORRUPT_OR_ENCRYPTED');
    }

    // 2.2 Encrypted stream defense
    const encryptedSimBuffer = Buffer.from('%PDF-1.7\n1 0 obj << /Type /Catalog /Encrypt 2 0 R >> endobj\nxref\n0 1\ntrailer << /Size 1 >>\nstartxref\n100\n%%EOF', 'utf-8');
    let encryptedCaught = false;
    try {
      engine.parsePdfStructure(encryptedSimBuffer);
    } catch (e: any) {
      encryptedCaught = e.message.includes('5002') || e.message.includes('encrypted');
    }

    // 2.3 Out-of-bounds split range auto-clamping
    const validSample = engine.generateSyntheticSamplePdf('Test Document', 4);
    const clampDoc: PdfDocumentInput = {
      id: 'clamp-doc',
      name: 'Test.pdf',
      buffer: validSample,
      sizeBytes: validSample.length,
    };
    const clampResult = await engine.splitDocument(clampDoc, {
      splitMode: 'BY_PAGE_RANGES',
      ranges: [{ rangeId: 'r-clamp', startPage: 1, endPage: 999 }], // Exceeds 4 pages
    });

    const clampPassed = clampResult.splitOutputs[0].pageCount === 4 && clampResult.splitOutputs[0].pageRange === '1-4';

    const passed = corruptCaught && encryptedCaught && clampPassed;
    results.push({
      scenario: '2. Error Recovery (Corrupt/Encrypted Stream Defense & Page Range Auto-Clamping)',
      passed,
      details: `Corrupted Stream Intercepted: ${corruptCaught}, Encrypted Stream Intercepted: ${encryptedCaught}, Out-of-Bounds Range Clamped: ${clampResult.splitOutputs[0]?.pageRange}.`,
    });
  } catch (err: any) {
    results.push({
      scenario: '2. Error Recovery',
      passed: false,
      details: err?.message || String(err),
    });
  }

  // Scenario 3: Edge Bounds - Zero-Byte Buffer, Single-Page Burst, Deep Bookmark Nesting
  try {
    // 3.1 Empty buffer check
    let emptyCaught = false;
    try {
      engine.parsePdfStructure(new Uint8Array(0));
    } catch (e: any) {
      emptyCaught = e.message.includes('5001') || e.message.includes('PDF_EMPTY_BUFFER');
    }

    // 3.2 Burst mode (split each page into 1-page PDF)
    const threePagePdf = engine.generateSyntheticSamplePdf('Burst Sample', 3);
    const burstInput: PdfDocumentInput = {
      id: 'burst-doc',
      name: 'BurstSample.pdf',
      buffer: threePagePdf,
      sizeBytes: threePagePdf.length,
    };
    const burstResult = await engine.splitDocument(burstInput, {
      splitMode: 'BURST_EACH_PAGE',
    });
    const burstPassed = burstResult.totalCreatedFiles === 3 && burstResult.splitOutputs.every((o) => o.pageCount === 1);

    // 3.3 Deep nested bookmark tree preservation
    const deepBookmarks: PdfBookmarkNode[] = [
      {
        id: 'b1',
        title: 'Level 1: Foundation',
        targetPageIndex: 0,
        children: [
          {
            id: 'b1-1',
            title: 'Level 2: Core Subsystem',
            targetPageIndex: 1,
            children: [
              {
                id: 'b1-1-1',
                title: 'Level 3: Deep Leaf Node',
                targetPageIndex: 2,
              },
            ],
          },
        ],
      },
    ];
    const deepPdf = engine.generateSyntheticSamplePdf('Deep Bookmarks Document', 3, deepBookmarks);
    const deepInput: PdfDocumentInput = {
      id: 'deep-doc',
      name: 'Deep.pdf',
      buffer: deepPdf,
      sizeBytes: deepPdf.length,
    };
    const deepMergeResult = await engine.mergeDocuments([deepInput], {
      preserveBookmarks: true,
      generateBookmarkPerDocument: false,
    });
    const deepPassed =
      deepMergeResult.bookmarksTree[0]?.children?.[0]?.children?.[0]?.title === 'Level 3: Deep Leaf Node';

    const passed = emptyCaught && burstPassed && deepPassed;
    results.push({
      scenario: '3. Edge Bounds (Zero-Byte Fast-Fail, 1-Page Burst & 3-Level Deep Bookmark Hierarchy)',
      passed,
      details: `Empty Buffer Intercepted: ${emptyCaught}, 3-Page Burst Count: ${burstResult.totalCreatedFiles}, Deep Bookmark Title: "${deepMergeResult.bookmarksTree[0]?.children?.[0]?.children?.[0]?.title}".`,
    });
  } catch (err: any) {
    results.push({
      scenario: '3. Edge Bounds',
      passed: false,
      details: err?.message || String(err),
    });
  }

  const passedTests = results.filter((r) => r.passed).length;
  return {
    allPassed: passedTests === results.length,
    totalTests: results.length,
    passedTests,
    results,
  };
}
