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

const Loans = () => {
  const { user } = useSession();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupId, setGroupId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingLoanId, setUpdatingLoanId] = useState(null);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: groups, error: groupError } = await supabase
        .from("groups")
        .select("id")
        .eq("created_by", user.id);

      if (groupError || !groups || groups.length === 0) {
        toast.error("No group found for this leader.");
        setLoading(false);
        return;
      }

      const group = groups[0];
      setGroupId(group.id);

      const { data, error } = await supabase
        .from("loans")
        .select(
          "id, amount, purpose, status, requested_at, group_members!inner(id, group_id, profiles(full_name))"
        )
        .eq("group_members.group_id", group.id)
        .order("requested_at", { ascending: false });

      if (error) {
        toast.error("Failed to load loans");
        console.error("Loan fetch error:", error);
      } else {
        setLoans(data);
      }
    } catch (e) {
      toast.error("An unexpected error occurred while fetching loans.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLoans();
    }
  }, [user]);

  const updateLoanStatus = async (loanId, status, memberName) => {
    setUpdatingLoanId(loanId);

    try {
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
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
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
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 bg-white/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
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
                          {loan.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    disabled={updatingLoanId === loan.id}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    {updatingLoanId === loan.id ? (
                                      <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-1">
                                        <ThumbsUp className="w-3 h-3" />
                                        <span>Approve</span>
                                      </div>
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center space-x-2 text-green-600">
                                      <CheckCircle className="w-5 h-5" />
                                      <span>Approve Loan</span>
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to approve the loan
                                      application from{" "}
                                      <span className="font-semibold">
                                        {
                                          loan.group_members?.profiles
                                            ?.full_name
                                        }
                                      </span>{" "}
                                      for {formatCurrency(loan.amount)}? This
                                      action will mark the loan as approved.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        updateLoanStatus(
                                          loan.id,
                                          "approved",
                                          loan.group_members?.profiles
                                            ?.full_name
                                        )
                                      }
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve Loan
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={updatingLoanId === loan.id}
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                  >
                                    <div className="flex items-center space-x-1">
                                      <ThumbsDown className="w-3 h-3" />
                                      <span>Decline</span>
                                    </div>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
                                      <XCircle className="w-5 h-5" />
                                      <span>Decline Loan</span>
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to decline the loan
                                      application from{" "}
                                      <span className="font-semibold">
                                        {
                                          loan.group_members?.profiles
                                            ?.full_name
                                        }
                                      </span>{" "}
                                      for {formatCurrency(loan.amount)}? This
                                      action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        updateLoanStatus(
                                          loan.id,
                                          "declined",
                                          loan.group_members?.profiles
                                            ?.full_name
                                        )
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Decline Loan
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">
                              {loan.status === "approved"
                                ? "Loan approved"
                                : "Loan declined"}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
