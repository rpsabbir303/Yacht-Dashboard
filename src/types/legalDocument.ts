/**
 * Legal document types — Terms & Conditions and Privacy Policy
 * managed per user role (crew / owner) by Super Admins.
 *
 *  documentType  → terms | privacy
 *  userRole      → crew  | owner
 *  status        → draft | published
 */

export type LegalDocumentType = "terms" | "privacy";
export type LegalUserRole = "crew" | "owner";
export type LegalDocumentStatus = "draft" | "published";

/** Identity of a document — composite of (documentType, userRole). */
export type LegalDocumentId =
  | "crew-terms"
  | "crew-privacy"
  | "owner-terms"
  | "owner-privacy";

/** A single immutable version snapshot in a document's history. */
export interface LegalDocumentVersion {
  /** Surrogate id for the version record (e.g. "crew-terms-v1.1"). */
  id: string;
  documentId: LegalDocumentId;
  version: string;
  /** HTML content captured at the moment this version was saved/published. */
  content: string;
  status: LegalDocumentStatus;
  createdAt: string;
  /** Display name of the admin who created the snapshot. */
  createdBy: string;
  note?: string;
}

/** A managed legal document. */
export interface LegalDocument {
  id: LegalDocumentId;
  documentType: LegalDocumentType;
  userRole: LegalUserRole;
  title: string;
  /** Sanitised HTML produced by the rich-text editor. */
  content: string;
  status: LegalDocumentStatus;
  /** Semantic version (1.0, 1.1, 2.0 …). Auto-bumped on publish. */
  version: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  publishedAt?: string;
}

/* -------------------- Request payloads ------------------------- */

export interface CreateLegalDocumentRequest {
  documentType: LegalDocumentType;
  userRole: LegalUserRole;
  title: string;
  content: string;
}

export interface UpdateLegalDocumentRequest {
  id: LegalDocumentId;
  title?: string;
  content?: string;
  /** When true the update is treated as an auto-save (no toast, no version bump). */
  silent?: boolean;
}

export interface PublishLegalDocumentRequest {
  id: LegalDocumentId;
  /** Optional explicit version override (else: minor bump). */
  version?: string;
  note?: string;
}

export interface RestoreLegalDocumentVersionRequest {
  documentId: LegalDocumentId;
  versionId: string;
}

/* -------------------- Helpers ----------------------------------- */

/** Compose the LegalDocumentId from its parts. */
export const composeLegalDocumentId = (
  documentType: LegalDocumentType,
  userRole: LegalUserRole,
): LegalDocumentId => `${userRole}-${documentType}` as LegalDocumentId;
