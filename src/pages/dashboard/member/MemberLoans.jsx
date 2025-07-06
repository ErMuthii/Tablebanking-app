import React, { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { useSession } from "@/hooks/useSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  DollarSign,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import LoanApplicationForm from "../../LoanApplicationForm";
import RepaymentDialog from "@/components/ui/RepaymentDialog";

const MemberLoans = () => {
  const { user } = useSession();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupMemberId, setGroupMemberId] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [repayOpen, setRepayOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [balances, setBalances] = useState({});

  useEffect(() => {
    if (user?.id) {
      fetchGroupMemberId();
    }
  }, [user]);

  const fetchGroupMemberId = async () => {
    const { data, error } = await supabase
      .from("group_members")
      .select("id, group_id")
      .eq("member_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setGroupMemberId(data.id);
      setGroupId(data.group_id);
      fetchLoans(data.id);
    }
  };

  const fetchBalances = async (loansList) => {
    const newBalances = {};
    for (const loan of loansList) {
      const { data: payments } = await supabase
        .from("loan_payments")
        .select("amount, type")
        .eq("loan_id", loan.id)
        .eq("type", "principal");
      const paid = (payments || []).reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      newBalances[loan.id] = loan.amount - paid;
    }
    setBalances(newBalances);
  };

  const fetchLoans = async (memberId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("loans")
      .select("id, amount, purpose, status, requested_at, due_date")
      .eq("group_member_id", memberId)
      .order("requested_at", { ascending: false });

    if (!error && data) {
      setLoans(data);
      fetchBalances(data);
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "repaid":
        return <Badge className="bg-blue-100 text-blue-800">Repaid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#1F5A3D] rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F5A3D]">
                My Loan Applications
              </h1>
            </div>
            <p className="text-gray-600">
              View and track your submitted loan requests
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1F5A3D] hover:bg-[#1F5A3D]/90 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" /> Apply for Loan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-white">
              <DialogHeader>
                <DialogTitle>Loan Application</DialogTitle>
              </DialogHeader>
              <LoanApplicationForm
                groupId={groupId}
                groupMemberId={groupMemberId}
                onSuccess={() => {
                  fetchLoans(groupMemberId);
                  setIsDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-xl bg-white/80">
          <CardHeader className="border-b border-gray-100 bg-white/50">
            <CardTitle className="text-xl font-semibold text-[#1F5A3D]">
              My Loans
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
                ))}
              </div>
            ) : loans.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="mx-auto w-10 h-10 mb-2" />
                You have not applied for any loans yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-gray-800">
                              {formatCurrency(loan.amount)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-gray-800">
                            {balances[loan.id] !== undefined
                              ? formatCurrency(balances[loan.id])
                              : "..."}
                          </span>
                        </TableCell>
                        <TableCell>{loan.purpose || "—"}</TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell>
                          <span className="text-gray-600">
                            {new Date(loan.requested_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">
                            {new Date(loan.due_date).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {loan.status === "approved" && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 text-white"
                              onClick={() => {
                                setSelectedLoan(loan);
                                setRepayOpen(true);
                              }}
                            >
                              Repay
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <RepaymentDialog
              open={repayOpen}
              onOpenChange={setRepayOpen}
              loan={selectedLoan}
              onSuccess={() => fetchLoans(groupMemberId)}
              userRole="member"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberLoans;
