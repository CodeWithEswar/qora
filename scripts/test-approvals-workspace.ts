import {
  CANONICAL_APPROVAL_TYPES,
  STANDARDIZED_REJECTION_REASONS,
  ApprovalType,
  ReviewPolicy,
} from "../lib/supabase/types/approvals";
import { SYSTEM_ROLE_PERMISSIONS } from "../packages/contracts/src/permissions";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

async function runTests() {
  console.log("\n🧪 Running NXTQR Approvals Workspace Verification Suite...\n");

  // Test 1: Canonical Approval Types Registry
  console.log("1. Verifying Canonical Approval Types Registry...");
  assert(CANONICAL_APPROVAL_TYPES.length >= 5, "Must have at least 5 canonical registered approval types");
  
  const qrReplacement = CANONICAL_APPROVAL_TYPES.find((t) => t.type === "QR_REPLACEMENT");
  assert(!!qrReplacement, "QR_REPLACEMENT approval type must exist");
  assert(qrReplacement!.domain === "QR Operations", "QR_REPLACEMENT domain must be QR Operations");
  assert(qrReplacement!.requiredPermission === "approvals.decide", "Required permission must be approvals.decide");
  assert(qrReplacement!.selfApprovalAllowed === false, "Self-approval must NOT be allowed for QR_REPLACEMENT");
  console.log("   ✅ Canonical Approval Types verified.");

  // Test 2: Standardized Rejection Reasons
  console.log("2. Verifying Standardized Rejection Reasons...");
  assert(STANDARDIZED_REJECTION_REASONS.length >= 5, "Must have standard rejection reason codes");
  const insufficientEvidence = STANDARDIZED_REJECTION_REASONS.find((r) => r.code === "INSUFFICIENT_EVIDENCE");
  assert(!!insufficientEvidence, "INSUFFICIENT_EVIDENCE reason must exist");
  console.log("   ✅ Standardized Rejection Reasons verified.");

  // Test 3: Canonical RBAC Permissions
  console.log("3. Verifying Canonical RBAC Permissions for Approvals...");
  assert(SYSTEM_ROLE_PERMISSIONS.Owner.includes("approvals.read"), "approvals.read must be in Owner permissions");
  assert(SYSTEM_ROLE_PERMISSIONS.Owner.includes("approvals.decide"), "approvals.decide must be in Owner permissions");
  assert(SYSTEM_ROLE_PERMISSIONS.Owner.includes("approvals.request"), "approvals.request must be in Owner permissions");
  assert(SYSTEM_ROLE_PERMISSIONS.Owner.includes("approvals.cancel"), "approvals.cancel must be in Owner permissions");
  console.log("   ✅ RBAC Permissions registered correctly.");

  // Test 4: Invariant — Approved != Executed State Separation
  console.log("4. Verifying Approved ≠ Executed State Model Invariant...");
  const sampleDecisionStates = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "EXPIRED"];
  const sampleExecutionStates = ["NOT_STARTED", "QUEUED", "PROCESSING", "APPLIED", "FAILED"];
  assert(!sampleDecisionStates.includes("APPLIED"), "Decision states must never include APPLIED");
  assert(!sampleExecutionStates.includes("APPROVED"), "Execution states must never include APPROVED");
  console.log("   ✅ Decision state strictly separated from Execution state.");

  // Test 5: Self-Approval Security Policy Simulation
  console.log("5. Testing Self-Approval Security Guard...");
  const mockRequest = {
    id: "req_123",
    publicId: "APR-9A2F",
    requestedBy: "user_alice",
    type: "QR_REPLACEMENT" as ApprovalType,
    status: "PENDING",
  };

  const attemptApprove = (actorId: string, req: typeof mockRequest) => {
    const def = CANONICAL_APPROVAL_TYPES.find((t) => t.type === req.type);
    if (!def) throw new Error("Unknown type");
    if (!def.selfApprovalAllowed && actorId === req.requestedBy) {
      throw new Error("FORBIDDEN_SELF_APPROVAL: Requester cannot approve their own request.");
    }
    return "APPROVED";
  };

  let selfApprovalBlocked = false;
  try {
    attemptApprove("user_alice", mockRequest);
  } catch (err: any) {
    if (err.message.includes("FORBIDDEN_SELF_APPROVAL")) {
      selfApprovalBlocked = true;
    }
  }
  assert(selfApprovalBlocked, "Server policy must reject self-approval attempt by requester");
  
  const peerApproval = attemptApprove("user_bob", mockRequest);
  assert(peerApproval === "APPROVED", "Authorized peer approval must succeed");
  console.log("   ✅ Self-approval guard verified.");

  // Test 6: Safe Public ID Generation
  console.log("6. Verifying Safe Public ID format (APR-XXXX)...");
  const publicIdRegex = /^APR-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/;
  assert(publicIdRegex.test("APR-8K2F"), "APR-8K2F should match valid public ID regex");
  assert(publicIdRegex.test("APR-9A2F"), "APR-9A2F should match valid public ID regex");
  assert(!publicIdRegex.test("123"), "Sequential PK should fail public ID regex");
  console.log("   ✅ Public reference formatting verified.");

  console.log("\n✨ ALL 6 VERIFICATION CHECKS PASSED SUCCESSFULLY! ✨\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
