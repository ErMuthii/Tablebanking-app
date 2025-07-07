import React, { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoanApplicationForm from "../../LoanApplicationForm";
import { toast } from "sonner";
import { useSession } from "../../../hooks/useSession";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import RepaymentDialog from "@/components/ui/RepaymentDialog";

const Loans = () => {
  const { user } = useSession();
  const [loans, setLoans] = useState([]);
  const [myLoans, setMyLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupId, setGroupId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingLoanId, setUpdatingLoanId] = useState(null);
  const [loanPool, setLoanPool] = useState(null);
  const [approvedSum, setApprovedSum] = useState(null);
  const [poolLoading, setPoolLoading] = useState(false);
  const [poolBreakdown, setPoolBreakdown] = useState({
    pool: 0,
    totalContributions: 0,
    totalRepayments: 0,
    outstandingPrincipal: 0,
  });
  const [repayOpen, setRepayOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [balances, setBalances] = useState({});
  const [showPaymentForm, setShowPaymentForm] = useState(false);
const [phone, setPhone] = useState("");
const [amountToPay, setAmountToPay] = useState("");
const [loadingPayment, setLoadingPayment] = useState(false);

const fetchLoanPoolBreakdown = async (groupId) => {
  const { data: pool, error: poolError } = await supabase.rpc("get_group_loan_pool", {
    group_id: groupId,
  });
  if (poolError) console.error("RPC Error (get_group_loan_pool):", poolError);

  const { data: contrib, error: contribError } = await supabase
    .from("contributions")
    .select("amount")
    .eq("group_id", groupId);
  if (contribError) console.error("Error fetching contributions:", contribError);

  const { data: loanIdsData, error: loanIdError } = await supabase
    .from("loans")
    .select("id")
    .eq("group_id", groupId);
  const loanIds = loanIdsData?.map((l) => l.id) || [];
  if (loanIdError) console.error("Error fetching loan IDs:", loanIdError);

  const { data: repayments, error: repayError } = await supabase
    .from("loan_payments")
    .select("amount, loan_id")
    .in("loan_id", loanIds);
  if (repayError) console.error("Error fetching repayments:", repayError);

  const { data: loans, error: loansError } = await supabase
    .from("loans")
    .select("amount, status")
    .eq("group_id", groupId)
    .in("status", ["pending", "approved"]);
  if (loansError) console.error("Error fetching loans for principal:", loansError);

  const totalContributions = (contrib || []).reduce((sum, c) => sum + Number(c.amount), 0);
  const totalRepayments = (repayments || []).reduce((sum, r) => sum + Number(r.amount), 0);
  const outstandingPrincipal = (loans || []).reduce((sum, l) => sum + Number(l.amount), 0);

  return {
    pool: pool || 0,
    totalContributions,
    totalRepayments,
    outstandingPrincipal,
  };
};


  const fetchMyLoans = async () => {
    if (!user || !groupId) return;
    const { data: myMemberRecords } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("member_id", user.id);

    const myMemberIds = myMemberRecords?.map((r) => r.id) || [];

    const { data: myLoanData, error } = await supabase
      .from("loans")
      .select("id, amount, purpose, status, requested_at")
      .in("group_member_id", myMemberIds)
      .order("requested_at", { ascending: false });

    if (!error && myLoanData) {
      setMyLoans(myLoanData);
    } else {
      console.error("Failed to fetch leader's own loans", error);
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

  useEffect(() => {
  if (user) {
    fetchGroupIdForUser();
  }
}, [user]);


const fetchGroupIdForUser = async () => {
  if (!user) return;

  // Try to get group where user is the creator
  const { data: createdGroups, error: createdError } = await supabase
    .from("groups")
    .select("id")
    .eq("created_by", user.id);

  if (createdGroups && createdGroups.length > 0) {
    setGroupId(createdGroups[0].id);
    return;
  }

  // If not a creator, get group_id from group_members table
  const { data: memberGroups, error: memberError } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("member_id", user.id);

  if (memberGroups && memberGroups.length > 0) {
    setGroupId(memberGroups[0].group_id);
    return;
  }

  toast.error("No group found for this user.");
};


  useEffect(() => {
    if (user) {
      fetchMyLoansWithBalance();
    }
  }, [user]);

  const fetchMyLoansWithBalance = async () => {
  if (!user || !groupId) return;

  // Step 1: Get all group_member.id(s) for this user
  const { data: myMemberRecords } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("member_id", user.id);

  const myMemberIds = myMemberRecords?.map((r) => r.id) || [];

  // Step 2: Get all loans for these group_member.id(s)
  const { data: loanData, error } = await supabase
    .from("loans")
    .select("id, amount, purpose, status, requested_at")
    .in("group_member_id", myMemberIds)
    .order("requested_at", { ascending: false });

  if (error || !loanData) {
    console.error("Failed to fetch loans", error);
    return;
  }

  // Step 3: For each loan, calculate total paid from loan_payments
  const loansWithBalance = await Promise.all(
    loanData.map(async (loan) => {
      const { data: payments } = await supabase
        .from("loan_payments")
        .select("amount")
        .eq("loan_id", loan.id)
        .eq("type", "principal");

      const totalPaid = (payments || []).reduce(
        (sum, payment) => sum + parseFloat(payment.amount),
        0
      );

      return {
        ...loan,
        balance: parseFloat(loan.amount) - totalPaid,
      };
    })
  );

  setMyLoans(loansWithBalance);
};


useEffect(() => {
  const fetchPoolStats = async () => {
    if (!groupId) return;
    setPoolLoading(true);
    const breakdown = await fetchLoanPoolBreakdown(groupId);
    setLoanPool(breakdown.pool);
    setApprovedSum(null);
    setPoolBreakdown(breakdown);
    setPoolLoading(false);
  };

  if (groupId) {
    fetchPoolStats();
    fetchMyLoans();
  }
}, [groupId]);

useEffect(() => {
  if (groupId) {
    fetchLoans();
    fetchMyLoansWithBalance();
    // Optional: fetch other stats here too if needed
  }
}, [groupId]);

const fetchLoans = async () => {
  if (!user || !groupId) return;

  setLoading(true);
  try {
    const { data, error } = await supabase
      .from("loans")
      .select(`
        id,
        amount,
        purpose,
        status,
        requested_at,
        group_members!inner(id, group_id, profiles(full_name))
      `)
      .eq("group_members.group_id", groupId)
      .order("requested_at", { ascending: false });

    if (error) {
      toast.error("Failed to load group loans");
      console.error("Loan fetch error:", error);
    } else {
      setLoans(data);
      fetchBalances(data);
    }
  } catch (err) {
    console.error("Unexpected error fetching loans:", err);
    toast.error("An unexpected error occurred.");
  } finally {
    setLoading(false);
  }
};



  const updateLoanStatus = async (
    loanId,
    status,
    memberName,
    loanAmount,
    loanGroupId
  ) => {
    setUpdatingLoanId(loanId);
    try {
      if (status === "approved") {
        const breakdown = await fetchLoanPoolBreakdown(loanGroupId);
        if (loanAmount > breakdown.pool) {
          toast.error(
            `Cannot approve this loan. Only KES ${breakdown.pool.toLocaleString()} is available in the pool.`
          );
          setUpdatingLoanId(null);
          return;
        }
      }
      const { error } = await supabase
        .from("loans")
        .update({ status })
        .eq("id", loanId);
      if (error) {
        toast.error(`Failed to ${status} loan`);
      } else {
        setLoans((prev) =>
          prev.map((loan) => (loan.id === loanId ? { ...loan, status } : loan))
        );
        toast.success(`${memberName}'s loan has been ${status}`);
        fetchMyLoans();
        const stats = await fetchLoanPoolBreakdown(groupId);
        setPoolBreakdown(stats);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error updating loan:", error);
    } finally {
      setUpdatingLoanId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.group_members?.profiles?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || loan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: loans.length,
    pending: loans.filter((l) => l.status === "pending").length,
    approved: loans.filter((l) => l.status === "approved").length,
    declined: loans.filter((l) => l.status === "declined").length,
    totalAmount: loans.reduce(
      (sum, loan) => sum + (parseFloat(loan.amount) || 0),
      0
    ),
    approvedAmount: loans
      .filter((l) => l.status === "approved")
      .reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0),
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <CreditCard className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No loan applications found
      </h3>
      <p className="text-gray-500 mb-4">
        {searchTerm || statusFilter !== "all"
          ? "No loans match your current filters. Try adjusting your search or filter criteria."
          : "No loan applications have been submitted yet."}
      </p>
      {(searchTerm || statusFilter !== "all") && (
        <div className="flex gap-2 justify-center">
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="border-[#1F5A3D] text-[#1F5A3D] hover:bg-[#1F5A3D] hover:text-white"
            >
              Clear search
            </Button>
          )}
          {statusFilter !== "all" && (
            <Button
              variant="outline"
              onClick={() => setStatusFilter("all")}
              className="border-[#1F5A3D] text-[#1F5A3D] hover:bg-[#1F5A3D] hover:text-white"
            >
              Clear filter
            </Button>
          )}
        </div>
      )}
    </div>
  );

    const handleLoanPayment = async () => {
  if (!phone || !amountToPay || !selectedLoan) {
    toast.error("Please enter phone number and amount.");
    return;
  }

  setLoadingPayment(true);

  try {
    const response = await fetch("http://localhost:4000/stk-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phone.startsWith("254") ? phone : "254" + phone.slice(1),
        amount: parseFloat(amountToPay),
        accountReference: `LoanRepayment-${selectedLoan.id}`, // IMPORTANT!
        transactionDesc: `Repayment for loan ${selectedLoan.id}`,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to initiate STK push");
    }

    toast.success("STK Push sent. Please complete the payment on your phone.");
    setShowPaymentForm(false);
    setAmountToPay("");
    setPhone("");
  } catch (err) {
    console.error("STK Push Error:", err);
    toast.error("Payment failed. Please try again.");
  } finally {
    setLoadingPayment(false);
  }
};

    

  return (
<div className="min-h-screen rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-6">
  <div className="max-w-7xl mx-auto">
    {/* Header Section */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#1F5A3D] rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1F5A3D]">
              Loan Management
            </h1>
          </div>
          <p className="text-gray-600">
            Review and manage loan applications from your group members
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1F5A3D] hover:bg-[#1F5A3D]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Apply for Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-white">
            <LoanApplicationForm
              groupId={groupId}
              onSuccess={() => {
                fetchLoans();
                setIsDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>

    {/* Loan Pool Stats Card */}
    <div className="mb-8">
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1F5A3D]">
                  Loan Pool
                </h2>
                <div className="text-sm font-semibold text-gray-700">
                  Available:{" "}
                  {poolLoading
                    ? "..."
                    : `KES ${poolBreakdown.pool.toLocaleString()}`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">
                Pool Utilization
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-emerald-600">
                  {(() => {
                    const total =
                      poolBreakdown.totalContributions +
                      poolBreakdown.totalRepayments;
                    const utilization =
                      total > 0
                        ? Math.min(
                            (poolBreakdown.outstandingPrincipal / total) *
                              100,
                            100
                          )
                        : 0;
                    return `${utilization.toFixed(1)}%`;
                  })()}
                </div>
                <div className="bg-gray-200 h-2 w-16 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{
                      width: `${(() => {
                        const total =
                          poolBreakdown.totalContributions +
                          poolBreakdown.totalRepayments;
                        return total > 0
                          ? Math.min(
                              (poolBreakdown.outstandingPrincipal / total) *
                                100,
                              100
                            )
                          : 0;
                      })()}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Compact Stats Row */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Contributions</div>
              <div className="text-sm font-semibold text-gray-900">
                KES {poolBreakdown.totalContributions.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Repayments</div>
              <div className="text-sm font-semibold text-gray-900">
                KES {poolBreakdown.totalRepayments.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Outstanding</div>
              <div className="text-sm font-semibold text-gray-900">
                KES {poolBreakdown.outstandingPrincipal.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Applications
              </p>
              <p className="text-2xl font-bold text-[#1F5A3D]">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-[#1F5A3D]/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-[#1F5A3D]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Review
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Approved Loans
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Disbursed
              </p>
              <p className="text-2xl font-bold text-[#1F5A3D]">
                {formatCurrency(stats.approvedAmount).replace(
                  "KES",
                  "KES "
                )}
              </p>
            </div>
            <div className="p-3 bg-[#1F5A3D]/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-[#1F5A3D]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Main Content Card */}
    <div className="mb-6">
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100 bg-white/50">
        <CardTitle className="text-xl font-semibold text-[#1F5A3D]">
          My Loan Applications
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {myLoans.length === 0 ? (
          <div className="text-gray-600 py-4">You have not applied for any loans yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700 py-4">Amount</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Purpose</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myLoans.map((loan, index) => (
                <TableRow key={loan.id}>
                  <TableCell className="align-middle">
  <div className="flex flex-col gap-1">
    <span className="text-base font-medium text-gray-900">
      KES {parseFloat(loan.amount).toLocaleString()}
    </span>
    <span className="text-sm text-gray-500">
      Balance: KES {parseFloat(loan.balance).toLocaleString()}
    </span>

    {loan.status === "approved" && parseFloat(loan.balance) > 0 && (
      <Button
        variant="outline"
        size="sm"
        className="mt-2 w-max border-green-600 text-green-700 hover:bg-green-100"
        onClick={() => {
          setSelectedLoan(loan);
          setShowPaymentForm(true);
        }}
      >
        Make Payment
      </Button>
    )}
  </div>
</TableCell>



                  <TableCell>{loan.purpose}</TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  <TableCell>{new Date(loan.requested_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              
            </TableBody>
          </Table>
        )}
        <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
  <DialogContent className="bg-white"> {/* <- solid white bg */}
    <DialogHeader>
      <DialogTitle>Pay Loan</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Input
        type="tel"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Enter amount to pay"
        value={amountToPay}
        onChange={(e) => setAmountToPay(e.target.value)}
      />
      <Button
        onClick={handleLoanPayment}
        disabled={loadingPayment}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
      >
        {loadingPayment ? "Processing..." : "Pay Now"}
      </Button>
    </div>
  </DialogContent>
</Dialog>


      </CardContent>
    </Card>
    </div>

    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100 bg-white/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="mb-6">
            <CardTitle className="text-xl font-semibold text-[#1F5A3D]">
              Loan Applications
            </CardTitle>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by member or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-gray-200 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-gray-200 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <LoadingSkeleton />
        ) : filteredLoans.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Applicant
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Balance
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Purpose
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">
                    Date Applied
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan, index) => (
                  <TableRow
                    key={loan.id}
                    className="border-gray-100 hover:bg-gray-50/50 transition-colors duration-200"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.5s ease-out forwards",
                    }}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#1F5A3D] rounded-full flex items-center justify-center text-white font-medium">
                          {loan.group_members?.profiles?.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {loan.group_members?.profiles?.full_name ||
                              "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">Member</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(loan.amount)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <span className="font-medium text-gray-800">
                        {balances[loan.id] !== undefined
                          ? formatCurrency(balances[loan.id])
                          : "..."}
                      </span>
                    </TableCell>

                    <TableCell className="py-4">
                      <p
                        className="text-gray-700 max-w-xs truncate"
                        title={loan.purpose}
                      >
                        {loan.purpose}
                      </p>
                    </TableCell>

                    <TableCell className="py-4">
                      {getStatusBadge(loan.status)}
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(loan.requested_at).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-right">
                      {loan.status === "approved" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-gray-600 text-white mr-2"
                            onClick={() =>
                              updateLoanStatus(
                                loan.id,
                                "declined",
                                loan.group_members?.profiles?.full_name ||
                                  "",
                                loan.amount,
                                loan.group_members?.group_id
                              )
                            }
                            disabled={updatingLoanId === loan.id}
                          >
                            Decline
                          </Button>
                          {/* Approve button for declined/approved loans */}
                          <Button
                            size="sm"
                            className="bg-green-600 text-white"
                            onClick={() =>
                              updateLoanStatus(
                                loan.id,
                                "pending",
                                loan.group_members?.profiles?.full_name || "",
                                loan.amount,
                                loan.group_members?.group_id
                              )
                            }
                            disabled={updatingLoanId === loan.id}
                          >
                            Mark as Pending
                          </Button>
                        </>
                      )}
                      {loan.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 text-white mr-2"
                            onClick={() =>
                              updateLoanStatus(
                                loan.id,
                                "approved",
                                loan.group_members?.profiles?.full_name ||
                                  "",
                                loan.amount,
                                loan.group_members?.group_id
                              )
                            }
                            disabled={updatingLoanId === loan.id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 text-white"
                            onClick={() =>
                              updateLoanStatus(
                                loan.id,
                                "declined",
                                loan.group_members?.profiles?.full_name ||
                                  "",
                                loan.amount,
                                loan.group_members?.group_id
                              )
                            }
                            disabled={updatingLoanId === loan.id}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {loan.status === "declined" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 text-white"
                            onClick={() =>
                              updateLoanStatus(
                                loan.id,
                                "approved",
                                loan.group_members?.profiles?.full_name ||
                                  "",
                                loan.amount,
                                loan.group_members?.group_id
                              )
                            }
                            disabled={updatingLoanId === loan.id}
                          >
                            Approve
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <RepaymentDialog
              open={repayOpen}
              onOpenChange={setRepayOpen}
              loan={selectedLoan}
              onSuccess={fetchLoans}
              userRole="leader"
            />
          </div>
        )}
      </CardContent>
    </Card>
  </div>

  <style jsx>{`
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `}</style>
</div>
  );
};

export default Loans;
