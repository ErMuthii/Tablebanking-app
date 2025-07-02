import React, { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { useSession } from "@/hooks/useSession";
import DataTable from "react-data-table-component";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  CreditCard,
  TrendingUp,
  Users,
  Calendar,
  Crown,
  Eye,
  EyeOff,
  BarChart3,
} from "lucide-react";

const GroupLeaderContributions = () => {
  const { user } = useSession();
  const [groupId, setGroupId] = useState(null);
  const [myContributions, setMyContributions] = useState([]);
  const [groupContributions, setGroupContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ phone: "", amount: "" });

  useEffect(() => {
    if (user?.id) {
      fetchGroupId();
    }
  }, [user]);

  useEffect(() => {
    if (groupId) {
      fetchGroupContributions();
      fetchMyContributions();
    }
  }, [groupId]);

  const fetchGroupId = async () => {
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("member_id", user.id)
      .eq("role", "group_leader")
      .maybeSingle();

    if (!error && data) {
      setGroupId(data.group_id);
    } else {
      console.error("Failed to fetch group_id", error);
    }
  };

  const getMyGroupMemberIds = async () => {
    const { data } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("member_id", user.id);

    return data?.map((d) => d.id) || [];
  };

  const fetchMyContributions = async () => {
    const memberIds = await getMyGroupMemberIds();

    const { data } = await supabase
      .from("contributions")
      .select("id, amount, type, date_contributed")
      .in("group_member_id", memberIds)
      .order("date_contributed", { ascending: false });

    if (data) {
      const formatted = data.map((c, i) => ({
        id: i + 1,
        amount: c.amount,
        type: c.type,
        date: c.date_contributed,
      }));
      setMyContributions(formatted);
    }
  };

  const fetchGroupContributions = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("contributions")
      .select(
        `
        id,
        amount,
        type,
        date_contributed,
        group_member_id,
        group_id,
        group_members (
          profiles (
            full_name
          )
        )
      `
      )
      .eq("group_id", groupId)
      .order("date_contributed", { ascending: false });

    if (!error && data) {
      const formatted = data.map((entry, i) => ({
        id: i + 1,
        contributor: entry.group_members?.profiles?.full_name || "Unknown",
        amount: entry.amount,
        type: entry.type,
        date: entry.date_contributed,
      }));
      setGroupContributions(formatted);
    }

    setLoading(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone.replace(/[^0-9]/g, "").replace(/^0/, "254"),
          amount: formData.amount,
        }),
      });

      const data = await res.json();

      if (data.ResponseCode === "0") {
        alert("STK Push sent. Enter your M-Pesa PIN to complete the payment.");
        setDialogOpen(false);
        setFormData({ phone: "", amount: "" });
      } else {
        console.error("STK Push failed", data);
        alert("STK Push failed. Please check the number and try again.");
      }
    } catch (err) {
      console.error("STK request error:", err);
      alert("Something went wrong while sending the STK Push.");
    }
  };

  const groupColumns = [
    {
      name: "#",
      selector: (row) => row.id,
      width: "70px",
      cell: (row) => (
        <span className="text-slate-600 font-medium">#{row.id}</span>
      ),
    },
    {
      name: "Contributor",
      selector: (row) => row.contributor,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {row.contributor.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-slate-700">{row.contributor}</span>
        </div>
      ),
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-emerald-700">
          KES {row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.type}
        </span>
      ),
    },
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
      cell: (row) => (
        <span className="text-slate-600 flex items-center gap-1">
          <Calendar className="h-3 w-3 text-emerald-600" />
          {row.date}
        </span>
      ),
    },
  ];

  const myColumns = [
    {
      name: "#",
      selector: (row) => row.id,
      width: "70px",
      cell: (row) => (
        <span className="text-slate-600 font-medium">{row.id}</span>
      ),
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-emerald-700">
          KES {row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.type}
        </span>
      ),
    },
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
      cell: (row) => (
        <span className="text-slate-600 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {row.date}
        </span>
      ),
    },
  ];

  const visibleData = showAll
    ? groupContributions
    : groupContributions.slice(0, 10);

  // Calculate statistics
  const myTotalContributions = myContributions.reduce(
    (sum, contrib) => sum + contrib.amount,
    0
  );
  const groupTotalContributions = groupContributions.reduce(
    (sum, contrib) => sum + contrib.amount,
    0
  );
  const uniqueContributors = new Set(
    groupContributions.map((c) => c.contributor)
  ).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Contributions Overview
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Track your own contributions and monitor your group's financial
            activity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* My Total */}
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">
                    My Total
                  </p>
                  <p className="text-2xl font-bold text-white">
                    KES {myTotalContributions.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group Total */}
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">
                    Group Total
                  </p>
                  <p className="text-2xl font-bold text-white">
                    KES {groupTotalContributions.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contributors */}
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">
                    Contributors
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {uniqueContributors}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Contributions Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-emerald-600" />
                    My Contributions
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Your personal contribution history
                  </p>
                </div>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2 h-auto"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Contribution
                </Button>
              </div>
            </div>

            <div className="p-6">
              <DataTable
                columns={myColumns}
                data={myContributions}
                highlightOnHover
                responsive
                pagination={myContributions.length > 10}
                paginationPerPage={10}
                noDataComponent={
                  <div className="py-12 text-center">
                    <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">
                      No contributions yet
                    </p>
                    <p className="text-slate-500 text-sm">
                      Start by making your first contribution
                    </p>
                  </div>
                }
                customStyles={{
                  headCells: {
                    style: {
                      backgroundColor: "#f8fafc",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#334155",
                      borderBottom: "2px solid #e2e8f0",
                      minHeight: "48px",
                    },
                  },
                  rows: {
                    style: {
                      minHeight: "56px",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                      },
                    },
                  },
                  pagination: {
                    style: {
                      backgroundColor: "#f8fafc",
                      borderTop: "1px solid #e2e8f0",
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Group Contributions Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                    Group Contributions
                  </h2>

                  <p className="text-slate-600 mt-1">
                    All contributions from group members
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="h-4 w-4" />
                  {groupContributions.length} total contributions
                </div>
              </div>
            </div>

            <div className="p-6">
              <DataTable
                columns={groupColumns}
                data={visibleData}
                progressPending={loading}
                highlightOnHover
                responsive
                pagination={false}
                noDataComponent={
                  <div className="py-12 text-center">
                    <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">
                      No group contributions found
                    </p>
                    <p className="text-slate-500 text-sm">
                      Group contributions will appear here once members start
                      contributing
                    </p>
                  </div>
                }
                customStyles={{
                  headCells: {
                    style: {
                      backgroundColor: "#f8fafc",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#334155",
                      borderBottom: "2px solid #e2e8f0",
                      minHeight: "48px",
                    },
                  },
                  rows: {
                    style: {
                      minHeight: "56px",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                      },
                    },
                  },
                }}
              />

              {groupContributions.length > 10 && (
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => setShowAll(!showAll)}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2"
                  >
                    {showAll ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 text-emerald-600" />
                        Show All ({groupContributions.length})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contribution Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <DialogHeader className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center text-slate-800">
                Make Contribution
              </DialogTitle>
              <p className="text-center text-slate-600">
                Add a new contribution to your group
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="e.g., +254 700 000 000"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount (KES)
                  </label>
                  <Input
                    type="text"
                    name="amount"
                    placeholder="e.g., 5000"
                    value={formData.amount}
                    onChange={handleFormChange}
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <DialogFooter>
                <div className="flex flex-col gap-3 w-full">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-semibold"
                  >
                    Process Payment
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GroupLeaderContributions;
