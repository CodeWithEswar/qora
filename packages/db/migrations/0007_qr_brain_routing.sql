-- ==============================================================================
-- NXTQR — Cloudflare D1 Migration 0007
-- Version: 0007_qr_brain_routing.sql
-- Dedicated QR Brain Draft and Conditions Persistence
-- ==============================================================================

-- 1. Add routing_json to qr_drafts for decoupled working draft rules
ALTER TABLE qr_drafts ADD COLUMN routing_json TEXT;

-- 2. Add conditions_json and destination_id directly to qr_rules for atomic relational storage
ALTER TABLE qr_rules ADD COLUMN conditions_json TEXT;
ALTER TABLE qr_rules ADD COLUMN destination_id TEXT;
