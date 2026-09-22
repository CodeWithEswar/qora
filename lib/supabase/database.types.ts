export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          metadata_json: Json | null
          organization_id: string
          resource_id: string
          resource_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata_json?: Json | null
          organization_id: string
          resource_id: string
          resource_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata_json?: Json | null
          organization_id?: string
          resource_id?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          key_hash: string
          last_used_at: string | null
          name: string
          organization_id: string
          prefix: string
          scopes: Json
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash: string
          last_used_at?: string | null
          name: string
          organization_id: string
          prefix: string
          scopes?: Json
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          prefix?: string
          scopes?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_decisions: {
        Row: {
          approval_request_id: string
          created_at: string
          decision: string
          decision_note: string | null
          id: string
          reason_code: string | null
          reviewer_id: string
          reviewer_membership_id: string | null
        }
        Insert: {
          approval_request_id: string
          created_at?: string
          decision: string
          decision_note?: string | null
          id?: string
          reason_code?: string | null
          reviewer_id: string
          reviewer_membership_id?: string | null
        }
        Update: {
          approval_request_id?: string
          created_at?: string
          decision?: string
          decision_note?: string | null
          id?: string
          reason_code?: string | null
          reviewer_id?: string
          reviewer_membership_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_decisions_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_decisions_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_decisions_reviewer_membership_id_fkey"
            columns: ["reviewer_membership_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_requests: {
        Row: {
          affected_entity_id: string
          affected_entity_ref: string | null
          affected_entity_type: string
          assigned_membership_id: string | null
          assigned_team_id: string | null
          base_revision_number: number | null
          change_topology: Json
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decided_membership_id: string | null
          decision_note: string | null
          description: string | null
          evidence_items: Json
          execution_applied_at: string | null
          execution_error: string | null
          execution_status: string
          expires_at: string | null
          id: string
          impact_summary: Json
          organization_id: string | null
          public_id: string | null
          qr_id: string | null
          reason: string | null
          request_snapshot: Json
          requested_by: string
          review_policy: string
          status: string
          target_revision_id: string | null
          target_revision_number: number | null
          target_version_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          affected_entity_id?: string
          affected_entity_ref?: string | null
          affected_entity_type?: string
          assigned_membership_id?: string | null
          assigned_team_id?: string | null
          base_revision_number?: number | null
          change_topology?: Json
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decided_membership_id?: string | null
          decision_note?: string | null
          description?: string | null
          evidence_items?: Json
          execution_applied_at?: string | null
          execution_error?: string | null
          execution_status?: string
          expires_at?: string | null
          id?: string
          impact_summary?: Json
          organization_id?: string | null
          public_id?: string | null
          qr_id?: string | null
          reason?: string | null
          request_snapshot?: Json
          requested_by: string
          review_policy?: string
          status?: string
          target_revision_id?: string | null
          target_revision_number?: number | null
          target_version_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Update: {
          affected_entity_id?: string
          affected_entity_ref?: string | null
          affected_entity_type?: string
          assigned_membership_id?: string | null
          assigned_team_id?: string | null
          base_revision_number?: number | null
          change_topology?: Json
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decided_membership_id?: string | null
          decision_note?: string | null
          description?: string | null
          evidence_items?: Json
          execution_applied_at?: string | null
          execution_error?: string | null
          execution_status?: string
          expires_at?: string | null
          id?: string
          impact_summary?: Json
          organization_id?: string | null
          public_id?: string | null
          qr_id?: string | null
          reason?: string | null
          request_snapshot?: Json
          requested_by?: string
          review_policy?: string
          status?: string
          target_revision_id?: string | null
          target_revision_number?: number | null
          target_version_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_assigned_membership_id_fkey"
            columns: ["assigned_membership_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_decided_membership_id_fkey"
            columns: ["decided_membership_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_target_version_id_fkey"
            columns: ["target_version_id"]
            isOneToOne: false
            referencedRelation: "qr_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_snapshot: Json | null
          actor_type: string
          authorization_context: Json | null
          category: string
          changes: Json | null
          correlation_id: string | null
          created_at: string
          id: string
          ip_hash: string | null
          metadata_json: Json | null
          organization_id: string
          request_id: string | null
          resource_id: string | null
          resource_type: string
          result: string
          source: string
          target_id: string | null
          target_snapshot: Json | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_snapshot?: Json | null
          actor_type?: string
          authorization_context?: Json | null
          category?: string
          changes?: Json | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          metadata_json?: Json | null
          organization_id: string
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string
          result?: string
          source?: string
          target_id?: string | null
          target_snapshot?: Json | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_snapshot?: Json | null
          actor_type?: string
          authorization_context?: Json | null
          category?: string
          changes?: Json | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          metadata_json?: Json | null
          organization_id?: string
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string
          result?: string
          source?: string
          target_id?: string | null
          target_snapshot?: Json | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_versions: {
        Row: {
          brand_kit_id: string
          change_summary: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          organization_id: string
          snapshot_json: Json
          version_number: number
        }
        Insert: {
          brand_kit_id: string
          change_summary?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          organization_id: string
          snapshot_json: Json
          version_number: number
        }
        Update: {
          brand_kit_id?: string
          change_summary?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          organization_id?: string
          snapshot_json?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_versions_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kits: {
        Row: {
          archived_at: string | null
          colors_json: Json
          created_at: string
          created_by: string | null
          description: string | null
          governance_json: Json
          guidelines_json: Json
          id: string
          is_default: boolean
          legacy_id: string | null
          locked_by_admin: boolean
          logo_url: string | null
          logos_json: Json
          name: string
          organization_id: string
          palette_json: Json
          primary_color: string
          published_revision: number
          qr_presets_json: Json
          slug: string
          status: string
          typography_json: Json
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          colors_json?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          governance_json?: Json
          guidelines_json?: Json
          id?: string
          is_default?: boolean
          legacy_id?: string | null
          locked_by_admin?: boolean
          logo_url?: string | null
          logos_json?: Json
          name: string
          organization_id: string
          palette_json?: Json
          primary_color?: string
          published_revision?: number
          qr_presets_json?: Json
          slug: string
          status?: string
          typography_json?: Json
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          colors_json?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          governance_json?: Json
          guidelines_json?: Json
          id?: string
          is_default?: boolean
          legacy_id?: string | null
          locked_by_admin?: boolean
          logo_url?: string | null
          logos_json?: Json
          name?: string
          organization_id?: string
          palette_json?: Json
          primary_color?: string
          published_revision?: number
          qr_presets_json?: Json
          slug?: string
          status?: string
          typography_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_kits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_qr_batch_rows: {
        Row: {
          batch_id: string
          created_at: string
          error_code: string | null
          error_message: string | null
          execution_status: string
          id: string
          normalized_payload: Json
          organization_id: string
          qr_id: string | null
          source_row_number: number
          updated_at: string
          validation_errors: Json
          validation_status: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          execution_status?: string
          id?: string
          normalized_payload: Json
          organization_id: string
          qr_id?: string | null
          source_row_number: number
          updated_at?: string
          validation_errors?: Json
          validation_status?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          execution_status?: string
          id?: string
          normalized_payload?: Json
          organization_id?: string
          qr_id?: string | null
          source_row_number?: number
          updated_at?: string
          validation_errors?: Json
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_qr_batch_rows_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "bulk_qr_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_qr_batch_rows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_qr_batch_rows_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_qr_batches: {
        Row: {
          blocked_rows: number
          campaign_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          created_rows: number
          creation_mode: string
          design_json: Json
          failed_rows: number
          folder_id: string | null
          id: string
          manifest_json: Json
          name: string
          organization_id: string
          processed_rows: number
          ready_rows: number
          source_type: string
          started_at: string | null
          status: string
          total_rows: number
          updated_at: string
          warning_rows: number
        }
        Insert: {
          blocked_rows?: number
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          created_rows?: number
          creation_mode?: string
          design_json?: Json
          failed_rows?: number
          folder_id?: string | null
          id?: string
          manifest_json?: Json
          name: string
          organization_id: string
          processed_rows?: number
          ready_rows?: number
          source_type: string
          started_at?: string | null
          status?: string
          total_rows?: number
          updated_at?: string
          warning_rows?: number
        }
        Update: {
          blocked_rows?: number
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          created_rows?: number
          creation_mode?: string
          design_json?: Json
          failed_rows?: number
          folder_id?: string | null
          id?: string
          manifest_json?: Json
          name?: string
          organization_id?: string
          processed_rows?: number
          ready_rows?: number
          source_type?: string
          started_at?: string | null
          status?: string
          total_rows?: number
          updated_at?: string
          warning_rows?: number
        }
        Relationships: [
          {
            foreignKeyName: "bulk_qr_batches_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_qr_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_qr_batches_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_qr_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_qr_codes: {
        Row: {
          campaign_id: string
          created_at: string
          qr_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          qr_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          qr_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_qr_codes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_qr_codes_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          archived_at: string | null
          brand_kit_id: string | null
          budget_inr: number | null
          budget_minor: number | null
          created_at: string
          created_by: string | null
          custom_domain_id: string | null
          description: string | null
          emoji: string | null
          end_date: string | null
          id: string
          legacy_id: string | null
          name: string
          organization_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          brand_kit_id?: string | null
          budget_inr?: number | null
          budget_minor?: number | null
          created_at?: string
          created_by?: string | null
          custom_domain_id?: string | null
          description?: string | null
          emoji?: string | null
          end_date?: string | null
          id?: string
          legacy_id?: string | null
          name: string
          organization_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          brand_kit_id?: string | null
          budget_inr?: number | null
          budget_minor?: number | null
          created_at?: string
          created_by?: string | null
          custom_domain_id?: string | null
          description?: string | null
          emoji?: string | null
          end_date?: string | null
          id?: string
          legacy_id?: string | null
          name?: string
          organization_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_custom_domain_id_fkey"
            columns: ["custom_domain_id"]
            isOneToOne: false
            referencedRelation: "custom_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_threads: {
        Row: {
          context_id: string
          context_metadata: Json | null
          context_ref: string
          context_state: string | null
          context_title: string
          context_type: string
          created_at: string
          created_by: string
          id: string
          last_activity_at: string
          organization_id: string
          public_id: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          state: string
          title: string
          updated_at: string
        }
        Insert: {
          context_id: string
          context_metadata?: Json | null
          context_ref: string
          context_state?: string | null
          context_title: string
          context_type: string
          created_at?: string
          created_by: string
          id?: string
          last_activity_at?: string
          organization_id: string
          public_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          state?: string
          title: string
          updated_at?: string
        }
        Update: {
          context_id?: string
          context_metadata?: Json | null
          context_ref?: string
          context_state?: string | null
          context_title?: string
          context_type?: string
          created_at?: string
          created_by?: string
          id?: string
          last_activity_at?: string
          organization_id?: string
          public_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          state?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_threads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_threads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_threads_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_attachments: {
        Row: {
          comment_id: string
          created_at: string
          file_type: string
          id: string
          mime_type: string
          name: string
          size_bytes: number
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          file_type?: string
          id?: string
          mime_type?: string
          name: string
          size_bytes?: number
          storage_path: string
          uploaded_by: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          file_type?: string
          id?: string
          mime_type?: string
          name?: string
          size_bytes?: number
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_attachments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_mentions: {
        Row: {
          comment_id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          user_id: string
        }
        Update: {
          comment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_mentions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_mentions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_references: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          referenced_id: string
          referenced_ref: string
          referenced_state: string | null
          referenced_title: string
          referenced_type: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          referenced_id: string
          referenced_ref: string
          referenced_state?: string | null
          referenced_title: string
          referenced_type: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          referenced_id?: string
          referenced_ref?: string
          referenced_state?: string | null
          referenced_title?: string
          referenced_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_references_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body_format: string
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          metadata: Json
          organization_id: string
          parent_comment_id: string | null
          public_id: string | null
          resolved: boolean
          resource_id: string | null
          resource_type: string | null
          thread_id: string | null
        }
        Insert: {
          author_id: string
          body_format?: string
          content: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          parent_comment_id?: string | null
          public_id?: string | null
          resolved?: boolean
          resource_id?: string | null
          resource_type?: string | null
          thread_id?: string | null
        }
        Update: {
          author_id?: string
          body_format?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          parent_comment_id?: string | null
          public_id?: string | null
          resolved?: boolean
          resource_id?: string | null
          resource_type?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "collaboration_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_events: {
        Row: {
          created_at: string
          currency: string | null
          event_name: string
          event_value: number | null
          id: string
          metadata_json: Json | null
          organization_id: string
          qr_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          event_name: string
          event_value?: number | null
          id?: string
          metadata_json?: Json | null
          organization_id: string
          qr_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          event_name?: string
          event_value?: number | null
          id?: string
          metadata_json?: Json | null
          organization_id?: string
          qr_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversion_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_events_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_domains: {
        Row: {
          activated_at: string | null
          archived_at: string | null
          certificate_status: string
          created_at: string
          created_by: string | null
          domain: string
          hostname: string | null
          id: string
          is_primary: boolean
          last_checked_at: string | null
          organization_id: string
          routing_status: string
          ssl_active: boolean
          status: string
          updated_at: string
          verification_method: string
          verification_records_json: Json
          verification_status: string
          verification_token: string
          verified_at: string | null
        }
        Insert: {
          activated_at?: string | null
          archived_at?: string | null
          certificate_status?: string
          created_at?: string
          created_by?: string | null
          domain: string
          hostname?: string | null
          id?: string
          is_primary?: boolean
          last_checked_at?: string | null
          organization_id: string
          routing_status?: string
          ssl_active?: boolean
          status?: string
          updated_at?: string
          verification_method?: string
          verification_records_json?: Json
          verification_status?: string
          verification_token: string
          verified_at?: string | null
        }
        Update: {
          activated_at?: string | null
          archived_at?: string | null
          certificate_status?: string
          created_at?: string
          created_by?: string | null
          domain?: string
          hostname?: string | null
          id?: string
          is_primary?: boolean
          last_checked_at?: string | null
          organization_id?: string
          routing_status?: string
          ssl_active?: boolean
          status?: string
          updated_at?: string
          verification_method?: string
          verification_records_json?: Json
          verification_status?: string
          verification_token?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_verification_attempts: {
        Row: {
          attempted_at: string
          details_json: Json
          domain_id: string
          id: string
          method: string
          organization_id: string
          status: string
        }
        Insert: {
          attempted_at?: string
          details_json?: Json
          domain_id: string
          id?: string
          method?: string
          organization_id: string
          status: string
        }
        Update: {
          attempted_at?: string
          details_json?: Json
          domain_id?: string
          id?: string
          method?: string
          organization_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "domain_verification_attempts_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "custom_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_verification_attempts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          boolean_allowed: boolean
          current_usage: number
          feature_key: string
          id: string
          numeric_limit: number
          organization_id: string
          reset_period: string | null
          updated_at: string
        }
        Insert: {
          boolean_allowed?: boolean
          current_usage?: number
          feature_key: string
          id?: string
          numeric_limit?: number
          organization_id: string
          reset_period?: string | null
          updated_at?: string
        }
        Update: {
          boolean_allowed?: boolean
          current_usage?: number
          feature_key?: string
          id?: string
          numeric_limit?: number
          organization_id?: string
          reset_period?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_assignments: {
        Row: {
          created_at: string
          experiment_id: string
          id: string
          scanner_token_hash: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          experiment_id: string
          id?: string
          scanner_token_hash: string
          variant_id: string
        }
        Update: {
          created_at?: string
          experiment_id?: string
          id?: string
          scanner_token_hash?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_assignments_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "experiment_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_variants: {
        Row: {
          conversions: number
          destination_url: string
          experiment_id: string
          id: string
          name: string
          total_scans: number
          traffic_weight: number
        }
        Insert: {
          conversions?: number
          destination_url: string
          experiment_id: string
          id?: string
          name: string
          total_scans?: number
          traffic_weight?: number
        }
        Update: {
          conversions?: number
          destination_url?: string
          experiment_id?: string
          id?: string
          name?: string
          total_scans?: number
          traffic_weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "experiment_variants_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          legacy_id: string | null
          name: string
          qr_id: string
          start_time: string | null
          status: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          legacy_id?: string | null
          name: string
          qr_id: string
          start_time?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          legacy_id?: string | null
          name?: string
          qr_id?: string
          start_time?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      fallback_policies: {
        Row: {
          auto_switch: boolean
          backup_url: string
          created_at: string
          failure_threshold: number
          id: string
          monitor_id: string | null
          notify_emails: Json
          organization_id: string | null
          qr_id: string | null
          updated_at: string
        }
        Insert: {
          auto_switch?: boolean
          backup_url: string
          created_at?: string
          failure_threshold?: number
          id?: string
          monitor_id?: string | null
          notify_emails?: Json
          organization_id?: string | null
          qr_id?: string | null
          updated_at?: string
        }
        Update: {
          auto_switch?: boolean
          backup_url?: string
          created_at?: string
          failure_threshold?: number
          id?: string
          monitor_id?: string | null
          notify_emails?: Json
          organization_id?: string | null
          qr_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fallback_policies_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "guardian_monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallback_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallback_policies_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: true
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      file_assets: {
        Row: {
          archived_at: string | null
          bucket: string
          category: string
          checksum: string | null
          created_at: string
          deleted_at: string | null
          display_name: string
          duration_ms: number | null
          file_extension: string | null
          file_name: string
          height: number | null
          id: string
          legacy_id: string | null
          mime_type: string
          object_path: string
          organization_id: string
          size_bytes: number
          status: string
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          archived_at?: string | null
          bucket: string
          category?: string
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          duration_ms?: number | null
          file_extension?: string | null
          file_name: string
          height?: number | null
          id?: string
          legacy_id?: string | null
          mime_type: string
          object_path: string
          organization_id: string
          size_bytes: number
          status?: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          archived_at?: string | null
          bucket?: string
          category?: string
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          duration_ms?: number | null
          file_extension?: string | null
          file_name?: string
          height?: number | null
          id?: string
          legacy_id?: string | null
          mime_type?: string
          object_path?: string
          organization_id?: string
          size_bytes?: number
          status?: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "file_assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      file_usages: {
        Row: {
          created_at: string
          file_id: string
          id: string
          organization_id: string
          resource_id: string
          resource_name: string
          resource_type: string
          usage_role: string
        }
        Insert: {
          created_at?: string
          file_id: string
          id?: string
          organization_id: string
          resource_id: string
          resource_name: string
          resource_type: string
          usage_role: string
        }
        Update: {
          created_at?: string
          file_id?: string
          id?: string
          organization_id?: string
          resource_id?: string
          resource_name?: string
          resource_type?: string
          usage_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_usages_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "file_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_usages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          accent_key: string | null
          archived_at: string | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          emoji: string | null
          id: string
          legacy_id: string | null
          name: string
          organization_id: string
          parent_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accent_key?: string | null
          archived_at?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          legacy_id?: string | null
          name: string
          organization_id: string
          parent_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accent_key?: string | null
          archived_at?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          legacy_id?: string | null
          name?: string
          organization_id?: string
          parent_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_incidents: {
        Row: {
          failure_reason: string
          fallback_triggered: boolean
          id: string
          monitor_id: string | null
          organization_id: string | null
          qr_id: string | null
          resolved_at: string | null
          started_at: string
          status: string
          timeline_events_json: Json
          triggering_observation_id: string | null
        }
        Insert: {
          failure_reason: string
          fallback_triggered?: boolean
          id?: string
          monitor_id?: string | null
          organization_id?: string | null
          qr_id?: string | null
          resolved_at?: string | null
          started_at?: string
          status: string
          timeline_events_json?: Json
          triggering_observation_id?: string | null
        }
        Update: {
          failure_reason?: string
          fallback_triggered?: boolean
          id?: string
          monitor_id?: string | null
          organization_id?: string | null
          qr_id?: string | null
          resolved_at?: string | null
          started_at?: string
          status?: string
          timeline_events_json?: Json
          triggering_observation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardian_incidents_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "guardian_monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_incidents_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_incidents_triggering_observation_id_fkey"
            columns: ["triggering_observation_id"]
            isOneToOne: false
            referencedRelation: "guardian_observations"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_monitors: {
        Row: {
          check_interval_sec: number
          checked_at: string
          checked_url: string | null
          consecutive_failures: number
          consecutive_successes: number
          created_at: string
          created_by: string | null
          current_health: string
          destination_url: string | null
          failure_reason: string | null
          failure_threshold: number
          http_status: number | null
          id: string
          last_checked_at: string | null
          last_state_changed_at: string | null
          name: string | null
          organization_id: string | null
          qr_id: string | null
          recovery_threshold: number
          response_time_ms: number | null
          status: string
          timeout_ms: number
          tls_valid: boolean
          updated_at: string
        }
        Insert: {
          check_interval_sec?: number
          checked_at?: string
          checked_url?: string | null
          consecutive_failures?: number
          consecutive_successes?: number
          created_at?: string
          created_by?: string | null
          current_health?: string
          destination_url?: string | null
          failure_reason?: string | null
          failure_threshold?: number
          http_status?: number | null
          id?: string
          last_checked_at?: string | null
          last_state_changed_at?: string | null
          name?: string | null
          organization_id?: string | null
          qr_id?: string | null
          recovery_threshold?: number
          response_time_ms?: number | null
          status: string
          timeout_ms?: number
          tls_valid?: boolean
          updated_at?: string
        }
        Update: {
          check_interval_sec?: number
          checked_at?: string
          checked_url?: string | null
          consecutive_failures?: number
          consecutive_successes?: number
          created_at?: string
          created_by?: string | null
          current_health?: string
          destination_url?: string | null
          failure_reason?: string | null
          failure_threshold?: number
          http_status?: number | null
          id?: string
          last_checked_at?: string | null
          last_state_changed_at?: string | null
          name?: string | null
          organization_id?: string | null
          qr_id?: string | null
          recovery_threshold?: number
          response_time_ms?: number | null
          status?: string
          timeout_ms?: number
          tls_valid?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardian_monitors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_monitors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_monitors_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_observations: {
        Row: {
          checked_url: string
          duration_ms: number
          failure_reason: string | null
          http_status: number | null
          id: string
          monitor_id: string | null
          observed_at: string
          organization_id: string
          qr_id: string | null
          result: string
          tls_valid: boolean
        }
        Insert: {
          checked_url: string
          duration_ms: number
          failure_reason?: string | null
          http_status?: number | null
          id?: string
          monitor_id?: string | null
          observed_at?: string
          organization_id: string
          qr_id?: string | null
          result: string
          tls_valid?: boolean
        }
        Update: {
          checked_url?: string
          duration_ms?: number
          failure_reason?: string | null
          http_status?: number | null
          id?: string
          monitor_id?: string | null
          observed_at?: string
          organization_id?: string
          qr_id?: string | null
          result?: string
          tls_valid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "guardian_observations_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "guardian_monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_observations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_observations_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          organization_id: string
          role_id: string
          status: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          organization_id: string
          role_id: string
          status?: string
          token_hash: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          organization_id?: string
          role_id?: string
          status?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_drafts: {
        Row: {
          document: Json
          draft_version: number
          organization_id: string
          page_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          document?: Json
          draft_version?: number
          organization_id: string
          page_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          document?: Json
          draft_version?: number
          organization_id?: string
          page_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_drafts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_drafts_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: true
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_drafts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_events: {
        Row: {
          action_id: string | null
          action_type: string | null
          browser_name: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          landing_page_id: string
          organization_id: string
          os_name: string | null
          qr_id: string | null
          referrer: string | null
          version_id: string | null
        }
        Insert: {
          action_id?: string | null
          action_type?: string | null
          browser_name?: string | null
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          landing_page_id: string
          organization_id: string
          os_name?: string | null
          qr_id?: string | null
          referrer?: string | null
          version_id?: string | null
        }
        Update: {
          action_id?: string | null
          action_type?: string | null
          browser_name?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          landing_page_id?: string
          organization_id?: string
          os_name?: string | null
          qr_id?: string | null
          referrer?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_events_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_events_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_events_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "landing_page_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_qr_codes: {
        Row: {
          created_at: string
          landing_page_id: string
          qr_id: string
        }
        Insert: {
          created_at?: string
          landing_page_id: string
          qr_id: string
        }
        Update: {
          created_at?: string
          landing_page_id?: string
          qr_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_qr_codes_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_qr_codes_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_versions: {
        Row: {
          change_summary: string
          created_at: string
          created_by: string | null
          document: Json
          id: string
          organization_id: string
          page_id: string
          version_number: number
        }
        Insert: {
          change_summary?: string
          created_at?: string
          created_by?: string | null
          document: Json
          id?: string
          organization_id: string
          page_id: string
          version_number: number
        }
        Update: {
          change_summary?: string
          created_at?: string
          created_by?: string | null
          document?: Json
          id?: string
          organization_id?: string
          page_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_versions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          archived_at: string | null
          brand_kit_id: string | null
          created_at: string
          created_by: string | null
          custom_domain_id: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          published_at: string | null
          published_by: string | null
          published_version_id: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          brand_kit_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_domain_id?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          published_at?: string | null
          published_by?: string | null
          published_version_id?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          brand_kit_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_domain_id?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          published_at?: string | null
          published_by?: string | null
          published_version_id?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_pages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_pages_custom_domain_id_fkey"
            columns: ["custom_domain_id"]
            isOneToOne: false
            referencedRelation: "custom_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_pages_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_pages_published_version_id_fkey"
            columns: ["published_version_id"]
            isOneToOne: false
            referencedRelation: "landing_page_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      member_roles: {
        Row: {
          membership_id: string
          role_id: string
        }
        Insert: {
          membership_id: string
          role_id: string
        }
        Update: {
          membership_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_roles_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          id: string
          joined_at: string
          legacy_id: string | null
          organization_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          legacy_id?: string | null
          organization_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          legacy_id?: string | null
          organization_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          collaboration_policy_json: Json
          created_at: string
          default_brand_kit_id: string | null
          description: string
          locale: string
          notification_preferences_json: Json
          organization_id: string
          qr_defaults_json: Json
          timezone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          collaboration_policy_json?: Json
          created_at?: string
          default_brand_kit_id?: string | null
          description?: string
          locale?: string
          notification_preferences_json?: Json
          organization_id: string
          qr_defaults_json?: Json
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          collaboration_policy_json?: Json
          created_at?: string
          default_brand_kit_id?: string | null
          description?: string
          locale?: string
          notification_preferences_json?: Json
          organization_id?: string
          qr_defaults_json?: Json
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_default_brand_kit_id_fkey"
            columns: ["default_brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          archived_at: string | null
          billing_plan: string
          created_at: string
          created_by: string | null
          id: string
          legacy_id: string | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          billing_plan?: string
          created_at?: string
          created_by?: string | null
          id?: string
          legacy_id?: string | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          billing_plan?: string
          created_at?: string
          created_by?: string | null
          id?: string
          legacy_id?: string | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_minor: number
          cashfree_order_id: string
          created_at: string
          currency: string
          id: string
          organization_id: string
          payment_method: string | null
          raw_payload_json: Json | null
          signature_verified: boolean
          status: string
        }
        Insert: {
          amount_minor: number
          cashfree_order_id: string
          created_at?: string
          currency?: string
          id?: string
          organization_id: string
          payment_method?: string | null
          raw_payload_json?: Json | null
          signature_verified?: boolean
          status: string
        }
        Update: {
          amount_minor?: number
          cashfree_order_id?: string
          created_at?: string
          currency?: string
          id?: string
          organization_id?: string
          payment_method?: string | null
          raw_payload_json?: Json | null
          signature_verified?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          code: string
          description: string
          id: string
        }
        Insert: {
          category: string
          code: string
          description: string
          id?: string
        }
        Update: {
          category?: string
          code?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      plan_features: {
        Row: {
          boolean_allowed: boolean
          feature_key: string
          numeric_limit: number | null
          plan_id: string
        }
        Insert: {
          boolean_allowed?: boolean
          feature_key: string
          numeric_limit?: number | null
          plan_id: string
        }
        Update: {
          boolean_allowed?: boolean
          feature_key?: string
          numeric_limit?: number | null
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          annual_price_minor: number
          created_at: string
          id: string
          monthly_price_minor: number
          name: string
          tier_level: number
        }
        Insert: {
          annual_price_minor?: number
          created_at?: string
          id: string
          monthly_price_minor?: number
          name: string
          tier_level: number
        }
        Update: {
          annual_price_minor?: number
          created_at?: string
          id?: string
          monthly_price_minor?: number
          name?: string
          tier_level?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          legacy_id: string | null
          locale: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email: string
          id: string
          legacy_id?: string | null
          locale?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          legacy_id?: string | null
          locale?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          archived_at: string | null
          brand_kit_id: string | null
          brand_version_number: number | null
          created_at: string
          custom_domain_id: string | null
          folder_id: string | null
          id: string
          is_dynamic: boolean
          legacy_id: string | null
          name: string
          organization_id: string
          owner_id: string | null
          published_revision: number
          qr_type: string
          slug: string
          status: string
          template_id: string | null
          template_version_number: number | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          brand_kit_id?: string | null
          brand_version_number?: number | null
          created_at?: string
          custom_domain_id?: string | null
          folder_id?: string | null
          id?: string
          is_dynamic?: boolean
          legacy_id?: string | null
          name: string
          organization_id: string
          owner_id?: string | null
          published_revision?: number
          qr_type?: string
          slug: string
          status?: string
          template_id?: string | null
          template_version_number?: number | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          brand_kit_id?: string | null
          brand_version_number?: number | null
          created_at?: string
          custom_domain_id?: string | null
          folder_id?: string | null
          id?: string
          is_dynamic?: boolean
          legacy_id?: string | null
          name?: string
          organization_id?: string
          owner_id?: string | null
          published_revision?: number
          qr_type?: string
          slug?: string
          status?: string
          template_id?: string | null
          template_version_number?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_custom_domain_id_fkey"
            columns: ["custom_domain_id"]
            isOneToOne: false
            referencedRelation: "custom_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "qr_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_drafts: {
        Row: {
          content_json: Json
          design_json: Json
          destination_json: Json | null
          draft_version: number
          organization_id: string
          qr_id: string
          routing_json: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_json?: Json
          design_json?: Json
          destination_json?: Json | null
          draft_version?: number
          organization_id: string
          qr_id: string
          routing_json?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_json?: Json
          design_json?: Json
          destination_json?: Json | null
          draft_version?: number
          organization_id?: string
          qr_id?: string
          routing_json?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_drafts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_drafts_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: true
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_drafts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_resolution_snapshots: {
        Row: {
          published_at: string
          qr_id: string
          revision: number
          slug: string
          snapshot_json: Json
        }
        Insert: {
          published_at?: string
          qr_id: string
          revision: number
          slug: string
          snapshot_json: Json
        }
        Update: {
          published_at?: string
          qr_id?: string
          revision?: number
          slug?: string
          snapshot_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "qr_resolution_snapshots_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: true
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_rule_conditions: {
        Row: {
          condition_type: string
          created_at: string
          id: string
          operator: string
          rule_id: string
          value_json: Json
        }
        Insert: {
          condition_type: string
          created_at?: string
          id?: string
          operator: string
          rule_id: string
          value_json: Json
        }
        Update: {
          condition_type?: string
          created_at?: string
          id?: string
          operator?: string
          rule_id?: string
          value_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "qr_rule_conditions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "qr_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_rules: {
        Row: {
          action_type: string
          conditions_json: Json
          created_at: string
          destination_id: string | null
          destination_url: string
          id: string
          is_active: boolean
          legacy_id: string | null
          match_type: string
          name: string
          priority: number
          qr_id: string
        }
        Insert: {
          action_type?: string
          conditions_json?: Json
          created_at?: string
          destination_id?: string | null
          destination_url: string
          id?: string
          is_active?: boolean
          legacy_id?: string | null
          match_type?: string
          name: string
          priority?: number
          qr_id: string
        }
        Update: {
          action_type?: string
          conditions_json?: Json
          created_at?: string
          destination_id?: string | null
          destination_url?: string
          id?: string
          is_active?: boolean
          legacy_id?: string | null
          match_type?: string
          name?: string
          priority?: number
          qr_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_rules_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_template_versions: {
        Row: {
          change_summary: string | null
          created_at: string
          created_by: string | null
          design_json: Json
          id: string
          organization_id: string
          scanability_score: number
          scanability_status: string
          template_id: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          design_json?: Json
          id?: string
          organization_id: string
          scanability_score?: number
          scanability_status?: string
          template_id: string
          version: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          design_json?: Json
          id?: string
          organization_id?: string
          scanability_score?: number
          scanability_status?: string
          template_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "qr_template_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_template_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "qr_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_templates: {
        Row: {
          archived_at: string | null
          brand_kit_id: string | null
          compatibility: Json
          created_at: string
          created_by: string | null
          current_version: number
          description: string | null
          design_json: Json
          id: string
          is_brand_locked: boolean
          locked_fields: Json
          name: string
          organization_id: string
          scanability_score: number
          scanability_status: string
          scope: string
          status: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          archived_at?: string | null
          brand_kit_id?: string | null
          compatibility?: Json
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string | null
          design_json?: Json
          id?: string
          is_brand_locked?: boolean
          locked_fields?: Json
          name: string
          organization_id: string
          scanability_score?: number
          scanability_status?: string
          scope?: string
          status?: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          archived_at?: string | null
          brand_kit_id?: string | null
          compatibility?: Json
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string | null
          design_json?: Json
          id?: string
          is_brand_locked?: boolean
          locked_fields?: Json
          name?: string
          organization_id?: string
          scanability_score?: number
          scanability_status?: string
          scope?: string
          status?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "qr_templates_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_versions: {
        Row: {
          change_summary: string
          content_json: Json
          created_at: string
          created_by: string | null
          design_json: Json
          destination_json: Json | null
          id: string
          legacy_id: string | null
          qr_id: string
          routing_json: Json | null
          version_number: number
        }
        Insert: {
          change_summary?: string
          content_json?: Json
          created_at?: string
          created_by?: string | null
          design_json?: Json
          destination_json?: Json | null
          id?: string
          legacy_id?: string | null
          qr_id: string
          routing_json?: Json | null
          version_number: number
        }
        Update: {
          change_summary?: string
          content_json?: Json
          created_at?: string
          created_by?: string | null
          design_json?: Json
          destination_json?: Json | null
          id?: string
          legacy_id?: string | null
          qr_id?: string
          routing_json?: Json | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "qr_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_versions_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      report_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_size_bytes: number | null
          filters_json: Json
          format: string
          id: string
          name: string
          organization_id: string
          range_from: string
          range_to: string
          requested_by: string | null
          status: string
          storage_path: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_size_bytes?: number | null
          filters_json?: Json
          format?: string
          id?: string
          name: string
          organization_id: string
          range_from: string
          range_to: string
          requested_by?: string | null
          status?: string
          storage_path?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_size_bytes?: number | null
          filters_json?: Json
          format?: string
          id?: string
          name?: string
          organization_id?: string
          range_from?: string
          range_to?: string
          requested_by?: string | null
          status?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_jobs_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          legacy_id: string | null
          name: string
          organization_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          legacy_id?: string | null
          name: string
          organization_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          legacy_id?: string | null
          name?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_events_hourly: {
        Row: {
          browser_name: string | null
          country_code: string | null
          destination_url: string | null
          device_type: string | null
          hour_bucket: string
          id: string
          organization_id: string
          os_name: string | null
          qr_id: string
          referrer: string | null
          region: string | null
          rule_id: string | null
          total_scans: number
          traffic_quality: string | null
          unique_scans: number
        }
        Insert: {
          browser_name?: string | null
          country_code?: string | null
          destination_url?: string | null
          device_type?: string | null
          hour_bucket: string
          id?: string
          organization_id: string
          os_name?: string | null
          qr_id: string
          referrer?: string | null
          region?: string | null
          rule_id?: string | null
          total_scans?: number
          traffic_quality?: string | null
          unique_scans?: number
        }
        Update: {
          browser_name?: string | null
          country_code?: string | null
          destination_url?: string | null
          device_type?: string | null
          hour_bucket?: string
          id?: string
          organization_id?: string
          os_name?: string | null
          qr_id?: string
          referrer?: string | null
          region?: string | null
          rule_id?: string | null
          total_scans?: number
          traffic_quality?: string | null
          unique_scans?: number
        }
        Relationships: [
          {
            foreignKeyName: "scan_events_hourly_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_events_hourly_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_events_hourly_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "qr_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cashfree_subscription_id: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          legacy_id: string | null
          organization_id: string
          plan_id: string
          status: string
          updated_at: string
        }
        Insert: {
          cashfree_subscription_id?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          legacy_id?: string | null
          organization_id: string
          plan_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          cashfree_subscription_id?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          legacy_id?: string | null
          organization_id?: string
          plan_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          joined_at: string
          membership_id: string
          team_id: string
        }
        Insert: {
          joined_at?: string
          membership_id: string
          team_id: string
        }
        Update: {
          joined_at?: string
          membership_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_resource_assignments: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          relationship_type: string
          resource_id: string
          resource_type: string
          team_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          relationship_type?: string
          resource_id: string
          resource_type: string
          team_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          relationship_type?: string
          resource_id?: string
          resource_type?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_resource_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_resource_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_resource_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          access_domains: Json
          archived_at: string | null
          created_at: string
          description: string | null
          id: string
          lead_membership_id: string | null
          legacy_id: string | null
          name: string
          organization_id: string
          state: string
          updated_at: string
        }
        Insert: {
          access_domains?: Json
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_membership_id?: string | null
          legacy_id?: string | null
          name: string
          organization_id: string
          state?: string
          updated_at?: string
        }
        Update: {
          access_domains?: Json
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_membership_id?: string | null
          legacy_id?: string | null
          name?: string
          organization_id?: string
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_lead_membership_id_fkey"
            columns: ["lead_membership_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_read_states: {
        Row: {
          last_read_at: string
          thread_id: string
          user_id: string
        }
        Insert: {
          last_read_at?: string
          thread_id: string
          user_id: string
        }
        Update: {
          last_read_at?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_read_states_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "collaboration_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_read_states_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number
          created_at: string
          endpoint_id: string
          event_type: string
          http_status: number | null
          id: string
          next_retry_at: string | null
          payload_json: Json
          response_ms: number | null
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          endpoint_id: string
          event_type: string
          http_status?: number | null
          id?: string
          next_retry_at?: string | null
          payload_json: Json
          response_ms?: number | null
        }
        Update: {
          attempt_count?: number
          created_at?: string
          endpoint_id?: string
          event_type?: string
          http_status?: number | null
          id?: string
          next_retry_at?: string | null
          payload_json?: Json
          response_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          events: Json
          id: string
          organization_id: string
          secret_hash: string
          status: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: Json
          id?: string
          organization_id: string
          secret_hash: string
          status?: string
          url: string
        }
        Update: {
          created_at?: string
          events?: Json
          id?: string
          organization_id?: string
          secret_hash?: string
          status?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_org_permission: {
        Args: { req_perm: string; target_org_id: string }
        Returns: boolean
      }
      is_org_member: { Args: { target_org_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
