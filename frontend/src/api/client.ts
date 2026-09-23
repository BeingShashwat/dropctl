import type { UploadResponse, DropInfoResponse, ApiError } from "./types";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/drops`;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const error: ApiError = {
      status: response.status,
      title: body?.title ?? "Error",
      detail: body?.detail ?? response.statusText,
    };
    throw error;
  }
  return response.json() as Promise<T>;
}

export async function uploadFile(
  file: File,
  slug?: string,
  expiresInHours?: number,
  isBundle = false
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (slug) formData.append("slug", slug);
  if (expiresInHours !== undefined) {
    formData.append("expiresInHours", String(expiresInHours));
  }
  // The server defaults this to false; only send it when actually a bundle
  // so single-file requests look exactly like they did before.
  if (isBundle) formData.append("isBundle", "true");

  const response = await fetch(BASE_URL, {
    method: "POST",
    body: formData,
  });
  return handleResponse<UploadResponse>(response);
}

export async function getDropInfo(slug: string): Promise<DropInfoResponse> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(slug)}`);
  return handleResponse<DropInfoResponse>(response);
}

/** Fetches the raw stored bytes (needed client-side only for bundles). */
export async function fetchDropBlob(slug: string): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(slug)}/file`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const error: ApiError = {
      status: response.status,
      title: body?.title ?? "Error",
      detail: body?.detail ?? response.statusText,
    };
    throw error;
  }
  return response.blob();
}

export function getDownloadUrl(slug: string): string {
  return `${BASE_URL}/${encodeURIComponent(slug)}/file`;
}

export function getQrCodeUrl(slug: string): string {
  return `${BASE_URL}/${encodeURIComponent(slug)}/qr`;
}
