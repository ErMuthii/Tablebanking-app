// src/pages/dashboard/member/MemberContributions.jsx
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
import { PlusCircle, CreditCard, TrendingUp, Calendar } from "lucide-react";

const MemberContributions = () => {
  const { user } = useSession();
  const [groupId, setGroupId] = useState(null);
  const [myContributions, setMyContributions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ phone: "", amount: "" });

  useEffect(() => {
    if (user?.id) {
      fetchGroupId();
    }
  }, [user]);

  useEffect(() => {
    if (groupId) {
      fetchMyContributions();
    }
  }, [groupId]);

  const fetchGroupId = async () => {
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("member_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setGroupId(data.group_id);
    } else {
      console.error("Failed to fetch group_id", error);
    }
  };

  const getMyGroupMemberId = async () => {
    const { data, error } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("member_id", user.id)
      .maybeSingle();

    return data?.id || null;
  };

  const fetchMyContributions = async () => {
    const groupMemberId = await getMyGroupMemberId();
    if (!groupMemberId) return;

    const { data, error } = await supabase
      .from("contributions")
      .select("id, amount, type, date_contributed")
      .eq("group_member_id", groupMemberId)
      .order("date_contributed", { ascending: false });

    if (!error && data) {
      const formatted = data.map((c, i) => ({
        id: i + 1,
        amount: c.amount,
        type: c.type,
        date: c.date_contributed,
      }));
      setMyContributions(formatted);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const groupMemberId = await getMyGroupMemberId();
    if (!groupMemberId) return;

    const { error } = await supabase.from("contributions").insert([
      {
        group_member_id: groupMemberId,
        amount: Number(formData.amount),
        type: "monthly",
        date_contributed: new Date().toISOString().split("T")[0],
      },
    ]);

    if (!error) {
      setDialogOpen(false);
      setFormData({ phone: "", amount: "" });
      fetchMyContributions();
    }
  };

  const myColumns = [
    { 
      name: "#", 
      selector: (row) => row.id, 
      width: "70px",
      cell: (row) => (
        <span className="text-slate-600 font-medium">#{row.id}</span>
      )
    },
    { 
      name: "Amount", 
      selector: (row) => row.amount, 
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-emerald-700">
          KES {row.amount.toLocaleString()}
        </span>
      )
    },
    { 
      name: "Type", 
      selector: (row) => row.type, 
      sortable: true,
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.type}
        </span>
      )
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
      )
    },
  ];

  // Calculate totals
  const totalContributions = myContributions.reduce((sum, contrib) => sum + contrib.amount, 0);
  const contributionCount = myContributions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-4">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            My Contributions
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Track and manage your financial contributions to the group
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Contributed</p>
                  <p className="text-3xl font-bold text-white">
                    KES {totalContributions.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Contributions</p>
                  <p className="text-3xl font-bold text-white">{contributionCount}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contributions Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Contribution History</h2>
                  <p className="text-slate-600 mt-1">View all your past contributions and payments</p>
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
                pagination={contributionCount > 10}
                paginationPerPage={10}
                noDataComponent={
                  <div className="py-12 text-center">
                    <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">No contributions yet</p>
                    <p className="text-slate-500 text-sm">Start by making your first contribution to the group</p>
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
                      minHeight: "48px"
                    },
                  },
                  rows: { 
                    style: { 
                      minHeight: "56px",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                      }
                    } 
                  },
                  pagination: {
                    style: {
                      backgroundColor: "#f8fafc",
                      borderTop: "1px solid #e2e8f0",
                    }
                  }
                }}
              />
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
              
              <DialogFooter className="flex flex-col space-y-3">
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
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MemberContributions;