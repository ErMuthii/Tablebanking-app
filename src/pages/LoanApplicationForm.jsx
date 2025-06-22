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
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-none border-0">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-[#1F5A3D]/10">
              <DollarSign className="h-7 w-7 text-[#1F5A3D]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#1F5A3D] mb-1">
            Loan Application
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Submit your loan request with the details below
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Amount Field */}
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4 text-[#1F5A3D]" />
                Loan Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter the amount you need"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-11 text-base border-2 border-gray-200 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]/20 transition-all duration-200"
                min="1"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the exact amount you wish to borrow
              </p>
            </div>

            {/* Purpose Field */}
            <div className="space-y-2">
              <Label
                htmlFor="purpose"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <FileText className="h-4 w-4 text-[#1F5A3D]" />
                Purpose of Loan
              </Label>
              <Textarea
                id="purpose"
                placeholder="Describe how you plan to use this loan..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                className="min-h-[100px] text-base border-2 border-gray-200 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]/20 transition-all duration-200 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a clear explanation for your loan request
              </p>
            </div>

            {/* Loan Terms Info */}
            <Alert className="border-[#1F5A3D]/20 bg-[#1F5A3D]/5">
              <Clock className="h-4 w-4 text-[#1F5A3D]" />
              <AlertDescription className="text-[#1F5A3D]">
                <strong>Loan Terms:</strong> Your loan will be due 32 days from
                approval date. Interest rates and repayment schedule will be
                determined by group policies.
              </AlertDescription>
            </Alert>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-[#1F5A3D] text-[#1F5A3D] bg-[#1F5A3D]/5"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Member Verified
              </Badge>
              <Badge
                variant="outline"
                className="border-orange-500 text-orange-700 bg-orange-50"
              >
                <Clock className="h-3 w-3 mr-1" />
                Pending Review
              </Badge>
            </div>

            <Separator />

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !amount || !purpose}
              className="w-full h-11 text-base font-semibold bg-[#1F5A3D] hover:bg-[#1F5A3D]/90 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Submit Loan Application</span>
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
