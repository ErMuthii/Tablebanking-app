import { supabase } from "@/SupabaseClient";

// Calculate how much a member can borrow based on their contributions and outstanding loans
export async function getAvailableLoanableAmount(groupMemberId) {
  // Sum all contributions
  const { data: contributions } = await supabase
    .from("contributions")
    .select("amount")
    .eq("group_member_id", groupMemberId);
  const totalContributions = (contributions || []).reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );

  // Subtract all outstanding principal (loans not repaid)
  const { data: loans } = await supabase
    .from("loans")
    .select("amount, status")
    .eq("group_member_id", groupMemberId)
    .in("status", ["pending", "approved"]);
  const outstandingPrincipal = (loans || []).reduce(
    (sum, l) => sum + Number(l.amount),
    0
  );

  return totalContributions - outstandingPrincipal;
}

// Calculate how much a guarantor can guarantee for others
export async function getGuarantorCapacity(guarantorId) {
  // Sum all contributions
  const { data: contributions } = await supabase
    .from("contributions")
    .select("amount")
    .eq("group_member_id", guarantorId);
  const totalContributions = (contributions || []).reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );

  // Subtract all outstanding principal
  const { data: loans } = await supabase
    .from("loans")
    .select("amount, status")
    .eq("group_member_id", guarantorId)
    .in("status", ["pending", "approved"]);
  const outstandingPrincipal = (loans || []).reduce(
    (sum, l) => sum + Number(l.amount),
    0
  );

  // Subtract all active guarantees
  const { data: guarantees } = await supabase
    .from("loan_guarantors")
    .select("amount_guaranteed, loan_id")
    .eq("guarantor_id", guarantorId);
  let guaranteed = 0;
  for (const g of guarantees || []) {
    const { data: loan } = await supabase
      .from("loans")
      .select("status")
      .eq("id", g.loan_id)
      .single();
    if (loan && loan.status !== "repaid") {
      guaranteed += Number(g.amount_guaranteed);
    }
  }

  return totalContributions - outstandingPrincipal - guaranteed;
}
