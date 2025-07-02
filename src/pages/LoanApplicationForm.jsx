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
} from "lucide-react";

const LoanApplicationForm = ({ groupId, onSuccess }) => {
  const { user } = useSession();
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupMemberId, setGroupMemberId] = useState(null);
  const [membershipLoading, setMembershipLoading] = useState(true);

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

  const handleSubmit = async () => {
    if (!groupMemberId) {
      toast.error("Your group membership could not be verified.");
      return;
    }

    if (!amount || !purpose) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);

    const requestedAt = new Date();
    const dueDate = new Date(requestedAt);
    dueDate.setDate(dueDate.getDate() + 32);

    const { error } = await supabase.from("loans").insert([
      {
        group_member_id: groupMemberId,
        group_id: groupId,
        amount: parseFloat(amount),
        purpose,
        status: "pending",
        requested_at: requestedAt.toISOString(),
        due_date: dueDate.toISOString(),
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Loan insert error:", error.message);
      toast.error("Loan request failed.");
    } else {
      toast.success("Loan application submitted!");
      setAmount("");
      setPurpose("");
      if (onSuccess) {
        onSuccess();
      }
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
                <strong>Terms:</strong> Loan due in 32 days. Interest and repayment per group policy.
              </AlertDescription>
            </Alert>

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
              disabled={loading || !amount || !purpose}
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
