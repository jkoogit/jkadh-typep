/**
 * @file pdfMergeSplit.ts
 * @module PDFowers/MergeSplit
 * @description Type definitions and contracts for lossless PDF multi-merge, split, and XREF/Bookmark reconstruction engine.
 * @version 1.9.0
 */

export interface PdfBookmarkNode {
  id: string;
  title: string;
  targetPageIndex: number; // 0-based page index
  children?: PdfBookmarkNode[];
  isExpanded?: boolean;
  color?: string; // Hex color code e.g. '#1E293B'
  bold?: boolean;
  italic?: boolean;
}

export interface PdfDocumentInput {
  id: string;
  name: string;
  buffer: Uint8Array | Buffer;
  sizeBytes: number;
  pageCount?: number;
  bookmarksCount?: number;
  customTitle?: string;
}

export interface PdfMergeOptions {
  preserveBookmarks: boolean;
  generateBookmarkPerDocument?: boolean;
  customDocumentTitles?: string[];
  linearizeFastWebView?: boolean;
  compressionLevel?: 'NONE' | 'FAST' | 'HIGH';
  modelFallbackChain?: string[];
}

export interface PdfSplitRange {
  rangeId: string;
  startPage: number; // 1-based start page
  endPage: number;   // 1-based end page
  outputName?: string;
}

export interface PdfSplitOptions {
  splitMode: 'BY_PAGE_RANGES' | 'EXTRACT_EVERY_N_PAGES' | 'BURST_EACH_PAGE';
  ranges?: PdfSplitRange[];
  burstPageInterval?: number;
  preserveBookmarks?: boolean;
  modelFallbackChain?: string[];
}

export interface PdfSplitOutputItem {
  name: string;
  pageRange: string;
  pageCount: number;
  outputBuffer: Uint8Array;
  bookmarksCount: number;
}

export interface PdfMergeResult {
  taskId: string;
  success: boolean;
  outputBuffer: Uint8Array;
  totalPages: number;
  mergedDocumentsCount: number;
  bookmarksTree: PdfBookmarkNode[];
  processingTimeMs: number;
  memoryPeakMb: number;
  xrefEntriesCount: number;
  auditTrail: {
    engineVersion: string;
    modelUsed: string;
    fallbackTriggered: boolean;
    timestamp: string;
  };
}

export interface PdfSplitResult {
  taskId: string;
  success: boolean;
  splitOutputs: PdfSplitOutputItem[];
  totalCreatedFiles: number;
  processingTimeMs: number;
  auditTrail: {
    engineVersion: string;
    modelUsed: string;
    fallbackTriggered: boolean;
    timestamp: string;
  };
}

export interface PdfObjectEntry {
  objId: number;
  genId: number;
  byteOffset: number;
  inUse: boolean;
  rawContent?: string;
}

export interface PdfParsedMetadata {
  version: string;
  pageCount: number;
  hasOutlines: boolean;
  bookmarks: PdfBookmarkNode[];
  isEncrypted: boolean;
  isLinearized: boolean;
  objectEntries: PdfObjectEntry[];
  trailerInfo: {
    size: number;
    rootObjId?: number;
    infoObjId?: number;
  };
}
