/**
 * NXTQR — Type-Safe HTTP API Client
 * Wraps fetch with typed request/response contracts from @nxtqr/contracts.
 */

import {
  ApiSuccessResponse,
  ApiCollectionResponse,
  QrResponseV1,
  CreateQrRequestV1,
  UpdateQrMetadataRequestV1,
  PublishQrRequestV1,
  ReplaceQrRulesRequestV1,
  QrAnalyticsResponseV1,
  ShareLinkResponseV1,
  CreateShareLinkRequestV1,
  CampaignResponseV1,
  CreateCampaignRequestV1,
  ExperimentResponseV1,
  CreateExperimentRequestV1,
  ReportJobCreatedResponseV1,
  ReportStatusResponseV1,
  CreateReportRequestV1,
  WebhookEndpointResponseV1,
  WebhookEndpointCreatedResponseV1,
  CreateWebhookEndpointRequestV1,
} from "@nxtqr/contracts";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public requestId?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorPayload = data?.error;
    throw new ApiClientError(
      errorPayload?.message || `HTTP ${response.status} error`,
      response.status,
      errorPayload?.code || "HTTP_ERROR",
      errorPayload?.requestId || response.headers.get("x-request-id") || undefined,
      errorPayload?.details
    );
  }

  return data as T;
}

export const nxtqrApi = {
  // QRs
  getQrs: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) query.set(k, String(v));
      });
    }
    const qs = query.toString();
    return request<ApiCollectionResponse<QrResponseV1>>(`/api/v1/qrs${qs ? `?${qs}` : ""}`);
  },

  getQrById: (id: string) => {
    return request<ApiSuccessResponse<QrResponseV1>>(`/api/v1/qrs/${id}`);
  },

  createQr: (payload: CreateQrRequestV1, idempotencyKey?: string) => {
    return request<ApiSuccessResponse<QrResponseV1>>("/api/v1/qrs", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
    });
  },

  updateQrMetadata: (id: string, payload: UpdateQrMetadataRequestV1) => {
    return request<ApiSuccessResponse<QrResponseV1>>(`/api/v1/qrs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  publishQr: (id: string, payload?: PublishQrRequestV1) => {
    return request<ApiSuccessResponse<QrResponseV1>>(`/api/v1/qrs/${id}/publish`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
  },

  replaceQrRules: (id: string, payload: ReplaceQrRulesRequestV1) => {
    return request<ApiSuccessResponse<{ qrId: string; ruleCount: number }>>(`/api/v1/qrs/${id}/rules`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getQrAnalytics: (id: string, params?: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) query.set(k, v);
      });
    }
    const qs = query.toString();
    return request<ApiSuccessResponse<QrAnalyticsResponseV1>>(`/api/v1/qrs/${id}/analytics${qs ? `?${qs}` : ""}`);
  },

  createShareLink: (id: string, payload: CreateShareLinkRequestV1, idempotencyKey?: string) => {
    return request<ApiSuccessResponse<ShareLinkResponseV1>>(`/api/v1/qrs/${id}/share-links`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
    });
  },

  // Campaigns
  getCampaigns: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) query.set(k, String(v));
      });
    }
    const qs = query.toString();
    return request<ApiCollectionResponse<CampaignResponseV1>>(`/api/v1/campaigns${qs ? `?${qs}` : ""}`);
  },

  createCampaign: (payload: CreateCampaignRequestV1) => {
    return request<ApiSuccessResponse<CampaignResponseV1>>("/api/v1/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Experiments
  getExperiments: () => {
    return request<ApiCollectionResponse<ExperimentResponseV1>>("/api/v1/experiments");
  },

  createExperiment: (payload: CreateExperimentRequestV1) => {
    return request<ApiSuccessResponse<ExperimentResponseV1>>("/api/v1/experiments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Reports
  createReport: (payload: CreateReportRequestV1, idempotencyKey?: string) => {
    return request<ApiSuccessResponse<ReportJobCreatedResponseV1>>("/api/v1/reports", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
    });
  },

  getReportStatus: (id: string) => {
    return request<ApiSuccessResponse<ReportStatusResponseV1>>(`/api/v1/reports/${id}`);
  },

  // Webhooks
  getWebhooks: () => {
    return request<ApiCollectionResponse<WebhookEndpointResponseV1>>("/api/v1/webhooks");
  },

  createWebhook: (payload: CreateWebhookEndpointRequestV1) => {
    return request<ApiSuccessResponse<WebhookEndpointCreatedResponseV1>>("/api/v1/webhooks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
