"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nxtqrApi } from "@/lib/api/client";
import {
  CreateQrRequestV1,
  UpdateQrMetadataRequestV1,
  PublishQrRequestV1,
  ReplaceQrRulesRequestV1,
  CreateShareLinkRequestV1,
  CreateCampaignRequestV1,
  CreateReportRequestV1,
  CreateWebhookEndpointRequestV1,
} from "@nxtqr/contracts";

/**
 * Hierarchical Query Keys for TanStack Query
 */
export const apiQueryKeys = {
  qrs: {
    all: ["qrs"] as const,
    list: (filters?: Record<string, unknown>) => ["qrs", "list", filters] as const,
    detail: (id: string) => ["qrs", "detail", id] as const,
    analytics: (id: string, params?: Record<string, unknown>) => ["qrs", "analytics", id, params] as const,
  },
  campaigns: {
    all: ["campaigns"] as const,
    list: (filters?: Record<string, unknown>) => ["campaigns", "list", filters] as const,
  },
  experiments: {
    all: ["experiments"] as const,
  },
  reports: {
    all: ["reports"] as const,
    status: (id: string) => ["reports", "status", id] as const,
  },
  webhooks: {
    all: ["webhooks"] as const,
  },
};

/**
 * Hook to query QR code collection
 */
export function useQrsQuery(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: apiQueryKeys.qrs.list(params),
    queryFn: () => nxtqrApi.getQrs(params),
  });
}

/**
 * Hook to query a single QR code by ID
 */
export function useQrQuery(id: string) {
  return useQuery({
    queryKey: apiQueryKeys.qrs.detail(id),
    queryFn: () => nxtqrApi.getQrById(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to query QR analytics
 */
export function useQrAnalyticsQuery(id: string, params?: Record<string, string | undefined>) {
  return useQuery({
    queryKey: apiQueryKeys.qrs.analytics(id, params),
    queryFn: () => nxtqrApi.getQrAnalytics(id, params),
    enabled: Boolean(id),
  });
}

/**
 * Hook to mutate/create a new QR code
 */
export function useCreateQrMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: CreateQrRequestV1; idempotencyKey?: string }) =>
      nxtqrApi.createQr(payload, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.qrs.all });
    },
  });
}

/**
 * Hook to update QR metadata
 */
export function useUpdateQrMetadataMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateQrMetadataRequestV1) => nxtqrApi.updateQrMetadata(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.qrs.detail(id) });
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.qrs.all });
    },
  });
}

/**
 * Hook to publish a QR code
 */
export function usePublishQrMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: PublishQrRequestV1) => nxtqrApi.publishQr(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.qrs.detail(id) });
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.qrs.all });
    },
  });
}

/**
 * Hook to replace QR routing rules
 */
export function useReplaceQrRulesMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReplaceQrRulesRequestV1) => nxtqrApi.replaceQrRules(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.qrs.detail(id) });
    },
  });
}

/**
 * Hook to create a share link
 */
export function useCreateShareLinkMutation(qrId: string) {
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: CreateShareLinkRequestV1; idempotencyKey?: string }) =>
      nxtqrApi.createShareLink(qrId, payload, idempotencyKey),
  });
}

/**
 * Hook to query campaigns
 */
export function useCampaignsQuery(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: apiQueryKeys.campaigns.list(params),
    queryFn: () => nxtqrApi.getCampaigns(params),
  });
}

/**
 * Hook to create a campaign
 */
export function useCreateCampaignMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignRequestV1) => nxtqrApi.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.campaigns.all });
    },
  });
}

/**
 * Hook to create an asynchronous report
 */
export function useCreateReportMutation() {
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: CreateReportRequestV1; idempotencyKey?: string }) =>
      nxtqrApi.createReport(payload, idempotencyKey),
  });
}

/**
 * Hook to poll report generation status
 */
export function useReportStatusQuery(jobId: string, enabled = true) {
  return useQuery({
    queryKey: apiQueryKeys.reports.status(jobId),
    queryFn: () => nxtqrApi.getReportStatus(jobId),
    enabled: Boolean(jobId) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === "completed" || status === "failed") {
        return false;
      }
      return 3000; // Poll every 3 seconds while processing
    },
  });
}

/**
 * Hook to query configured webhooks
 */
export function useWebhooksQuery() {
  return useQuery({
    queryKey: apiQueryKeys.webhooks.all,
    queryFn: () => nxtqrApi.getWebhooks(),
  });
}

/**
 * Hook to register a webhook
 */
export function useCreateWebhookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWebhookEndpointRequestV1) => nxtqrApi.createWebhook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.webhooks.all });
    },
  });
}
