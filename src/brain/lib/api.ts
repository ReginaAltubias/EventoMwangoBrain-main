const configuredApiUrl =
  import.meta.env.VITE_API_URL ?? "https://ssgmea-mosap3.a2hosted.com/backend/public";
const API_URL = configuredApiUrl.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly responseBody?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(body: unknown): string | undefined {
  if (typeof body === "string") return body.trim() || undefined;
  if (typeof body !== "object" || body === null) return undefined;

  const record = body as Record<string, unknown>;
  if (typeof record.error === "string" && record.error.trim()) return record.error;
  if (typeof record.message === "string" && record.message.trim()) return record.message;
  return undefined;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  allowEmptyResponse = false,
): Promise<T> {
  if (!API_URL) {
    throw new Error("VITE_API_URL não pode estar vazio.");
  }

  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const hasFormDataBody =
    typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (init?.body !== undefined && !hasFormDataBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (response.status === 204) return undefined as T;

  const responseText = await response.text();
  let responseBody: unknown;
  if (responseText) {
    try {
      responseBody = JSON.parse(responseText) as unknown;
    } catch {
      if (response.ok) {
        throw new ApiError(
          `A API devolveu uma resposta inválida (HTTP ${response.status}).`,
          response.status,
          responseText,
        );
      }
      responseBody = responseText;
    }
  } else if (response.ok && !allowEmptyResponse) {
    throw new ApiError(
      `A API devolveu uma resposta vazia inesperada (HTTP ${response.status}).`,
      response.status,
    );
  }

  if (!response.ok) {
    const message =
      getErrorMessage(responseBody) ??
      `Erro ${response.status} ao comunicar com a API remota.`;
    throw new ApiError(message, response.status, responseBody);
  }

  return responseBody as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
  post: <T>(path: string, data?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "POST",
      body: data === undefined ? undefined : JSON.stringify(data),
    }),
  patch: <T>(path: string, data?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "PATCH",
      body: data === undefined ? undefined : JSON.stringify(data),
    }),
  put: <T>(path: string, data?: unknown, init?: RequestInit) =>
    request<T>(path, {
      ...init,
      method: "PUT",
      body: data === undefined ? undefined : JSON.stringify(data),
    }),
  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "DELETE" }, true),
};
