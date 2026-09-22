export interface UploadResponse {
  slug: string;
  url: string;
  qrCode: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
  expiresAt: string;
}

export interface DropInfoResponse {
  slug: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  expiresAt: string;
}

export interface ApiError {
  status: number;
  title: string;
  detail: string;
}
