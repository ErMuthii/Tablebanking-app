import React, { useState, useEffect } from "react";
import { supabase } from "@/SupabaseClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSession } from "../hooks/useSession";
import {
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserPlus,
  Users,
} from "lucide-react";
import {
  getAvailableLoanableAmount,
  getGuarantorCapacity,
} from "@/lib/loanValidation";

const MAX_GUARANTORS = 3;

const EDGE_FUNCTION_URL =
  "https://haiwteyfxsxoekzkoeqx.supabase.co/functions/v1/apply-loan";

const LoanApplicationForm = ({ groupId, onSuccess }) => {
  const { user } = useSession();
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupMemberId, setGroupMemberId] = useState(null);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [availableLoan, setAvailableLoan] = useState(null);
  const [shortfall, setShortfall] = useState(0);
  const [guarantors, setGuarantors] = useState([]); // [{ id, name, amount, capacity }]
  const [guarantorError, setGuarantorError] = useState("");
  const [groupMembers, setGroupMembers] = useState([]); // For selecting guarantors

  useEffect(() => {
    const fetchGroupMemberId = async () => {
      if (!user || !groupId) {
        setMembershipLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("group_members")
        .select("id")
        .eq("member_id", user.id)
        .eq("group_id", groupId)
        .single();
      setMembershipLoading(false);
      if (error) {
        toast.error("You do not appear to be a member of this group.");
      } else if (data) {
        setGroupMemberId(data.id);
      }
    };
    fetchGroupMemberId();
  }, [user, groupId]);

  // Fetch available loanable amount
  useEffect(() => {
    if (groupMemberId) {
      getAvailableLoanableAmount(groupMemberId).then(setAvailableLoan);
    }
  }, [groupMemberId]);

  // Fetch group members for guarantor selection
  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId || !groupMemberId) return;
      const { data } = await supabase
        .from("group_members")
        .select("id, profiles(full_name)")
        .eq("group_id", groupId);
      // Exclude self
      setGroupMembers((data || []).filter((m) => m.id !== groupMemberId));
    };
    fetchMembers();
  }, [groupId, groupMemberId]);

  // Calculate shortfall
  useEffect(() => {
    if (!amount || availableLoan === null) {
      setShortfall(0);
      return;
    }
    const s = Math.max(0, parseFloat(amount) - availableLoan);
    setShortfall(s);
    if (s === 0) setGuarantors([]);
  }, [amount, availableLoan]);

  // Validate guarantors
  useEffect(() => {
    if (shortfall === 0) {
      setGuarantorError("");
      return;
    }
    let total = 0;
    let error = "";
    for (const g of guarantors) {
      if (!g.amount || isNaN(g.amount) || g.amount <= 0) {
        error = "Each guarantee must be a positive number.";
        break;
      }
      if (g.amount > g.capacity) {
        error = `${g.name} cannot guarantee more than their available capacity.`;
        break;
      }
      total += Number(g.amount);
    }
    if (!error && total < shortfall) {
      error = `Total guarantees must cover the shortfall (KES ${shortfall.toLocaleString()}).`;
    }
    setGuarantorError(error);
  }, [guarantors, shortfall]);

  // Handle adding a new guarantor
  const addGuarantor = async (memberId) => {
    if (guarantors.length >= MAX_GUARANTORS) return;
    if (guarantors.some((g) => g.id === memberId)) return;
    const member = groupMembers.find((m) => m.id === memberId);
    if (!member) return;
    const name = member.profiles?.full_name || "Unknown";
    const capacity = await getGuarantorCapacity(memberId);
    setGuarantors((prev) => [
      ...prev,
      { id: memberId, name, amount: "", capacity },
    ]);
  };

  // Handle guarantee amount change
  const updateGuarantorAmount = (idx, value) => {
    setGuarantors((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, amount: value } : g))
    );
  };

  // Remove a guarantor
  const removeGuarantor = (idx) => {
    setGuarantors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!groupMemberId) {
      toast.error("Your group membership could not be verified.");
      return;
    }
    if (!amount || !purpose) {
      toast.error("All fields are required.");
      return;
    }
    if (shortfall > 0) {
      if (guarantors.length === 0) {
        toast.error(
          "You must add at least one guarantor to cover the shortfall."
        );
        return;
      }
      if (guarantorError) {
        toast.error(guarantorError);
        return;
      }
    }
    setLoading(true);
    // Prepare payload for edge function
    const payload = {
      applicant_id: groupMemberId,
      group_id: groupId,
      amount: parseFloat(amount),
      purpose,
      guarantors:
        shortfall > 0
          ? guarantors.map((g) => ({
              guarantor_id: g.id,
              amount_guaranteed: Number(g.amount),
              guarantor_name: g.name,
            }))
          : [],
    };
    try {
      // Get the current user's access token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        setLoading(false);
        toast.error("You must be logged in to apply for a loan.");
        return;
      }
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok || data.error) {
        toast.error(data.error || "Loan request failed.");
        return;
      }
      toast.success("Loan application submitted!");
      setAmount("");
      setPurpose("");
      setGuarantors([]);
      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      setLoading(false);
      toast.error("Network or server error. Please try again.");
    }
  };

  if (membershipLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2 text-[#1F5A3D]">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg font-medium">Verifying membership...</span>
        </div>
      </div>
    );
  }

  if (!groupMemberId) {
    return (
      <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              You must be a verified member of this group to apply for a loan.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <Card className="shadow-none border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-[#1F5A3D]/10">
              <DollarSign className="h-6 w-6 text-[#1F5A3D]" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-[#1F5A3D] mb-0.5">
            Loan Application
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Submit your loan request below
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="space-y-3">
            {/* Available loanable amount */}
            {availableLoan !== null && (
              <div className="text-xs text-emerald-700 mb-1">
                You can borrow up to <b>KES {availableLoan.toLocaleString()}</b>{" "}
                without guarantors.
              </div>
            )}
            {/* Amount Field */}
            <div className="space-y-1">
              <Label
                htmlFor="amount"
                className="text-xs font-semibold text-gray-700 flex items-center gap-1"
              >
                <DollarSign className="h-3 w-3 text-[#1F5A3D]" />
                Loan Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-9 text-sm border-2 border-gray-200 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]/20"
                min="1"
                step="0.01"
              />
            </div>

            {/* Purpose Field */}
            <div className="space-y-1">
              <Label
                htmlFor="purpose"
                className="text-xs font-semibold text-gray-700 flex items-center gap-1"
              >
                <FileText className="h-3 w-3 text-[#1F5A3D]" />
                Purpose
              </Label>
              <Textarea
                id="purpose"
                placeholder="Loan purpose..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                className="min-h-[60px] text-sm border-2 border-gray-200 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]/20 resize-none"
              />
            </div>

            {/* Loan Terms Info */}
            <Alert className="border-[#1F5A3D]/20 bg-[#1F5A3D]/5 py-1 px-2">
              <Clock className="h-3 w-3 text-[#1F5A3D]" />
              <AlertDescription className="text-xs text-[#1F5A3D]">
                <strong>Terms:</strong> 
                <ul className="list-disc  ml-4 space-y-0.5">
                  <li>
                    You can borrow up to your available limit{" "}
                    <b>without guarantors</b>.
                  </li>
                  <li>
                    If you need more, add up to <b>3 guarantors</b> to cover the
                    shortfall.
                  </li>
                  <li>
                    <b>Repayment:</b> 3 months &mdash; <b>Month 1 & 2:</b> 10%
                    interest only, <b>Month 3:</b> full principal + 10%
                    interest.
                  </li>
                  
                </ul>
              </AlertDescription>
            </Alert>

            {/* Guarantor UI */}
            {shortfall > 0 && (
              <div className="mt-4 p-2 border rounded bg-orange-50">
                <div className="font-semibold text-orange-700 mb-1 text-sm">
                  You need guarantors to cover a shortfall of{" "}
                  <b>KES {shortfall.toLocaleString()}</b>
                </div>
                <div className="mb-1 text-xs text-gray-700">
                  Add up to {MAX_GUARANTORS} guarantors. Each must have enough
                  available capacity.
                </div>
                {/* Scrollable list of selected guarantors */}
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                  {guarantors.map((g, idx) => (
                    <div
                      key={`guarantor-${g.id}`}
                      className="flex items-center gap-1 py-1 px-1 bg-white/60 rounded"
                    >
                      <Users className="w-3 h-3 text-emerald-700" />
                      <span className="font-medium text-gray-800 text-xs truncate max-w-[80px]">
                        {g.name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        (Cap: KES {g.capacity.toLocaleString()})
                      </span>
                      <Input
                        type="number"
                        min="1"
                        max={g.capacity}
                        value={g.amount}
                        onChange={(e) =>
                          updateGuarantorAmount(idx, e.target.value)
                        }
                        className="w-16 h-7 text-xs border-gray-200 px-1"
                        placeholder="Guarantee"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-100"
                        onClick={() => removeGuarantor(idx)}
                        aria-label="Remove guarantor"
                      >
                        <span className="sr-only">Remove</span>×
                      </Button>
                    </div>
                  ))}
                </div>
                {/* Scrollable list of addable group members */}
                {guarantors.length < MAX_GUARANTORS && (
                  <div className="mt-1 flex gap-1 flex-wrap max-h-20 overflow-y-auto">
                    {groupMembers
                      .filter((m) => !guarantors.some((g) => g.id === m.id))
                      .map((m) => (
                        <Button
                          key={`addable-${m.id}`}
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-1 text-[11px] border-emerald-300 text-emerald-700 min-w-[70px]"
                          onClick={() => addGuarantor(m.id)}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          {m.profiles?.full_name || "Unknown"}
                        </Button>
                      ))}
                  </div>
                )}
                {guarantorError && (
                  <div className="mt-1 text-xs text-red-600 font-medium">
                    {guarantorError}
                  </div>
                )}
              </div>
            )}

            {/* Status Badges */}
            <div className="flex flex-wrap gap-1">
              <Badge
                variant="outline"
                className="border-[#1F5A3D] text-[#1F5A3D] bg-[#1F5A3D]/5 text-xs px-2 py-0.5"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Member Verified
              </Badge>
              <Badge
                variant="outline"
                className="border-orange-500 text-orange-700 bg-orange-50 text-xs px-2 py-0.5"
              >
                <Clock className="h-3 w-3 mr-1" />
                Pending Review
              </Badge>
            </div>

            <Separator className="my-1" />

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                !amount ||
                !purpose ||
                (shortfall > 0 && (guarantors.length === 0 || !!guarantorError))
              }
              className="w-full h-9 text-sm font-semibold bg-[#1F5A3D] hover:bg-[#1F5A3D]/90 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Submit</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanApplicationForm;
