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
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    if (user?.id) fetchGroupId();
  }, [user]);

  useEffect(() => {
    if (groupId) fetchMyContributions();
  }, [groupId]);

  const fetchGroupId = async () => {
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("member_id", user.id)
      .maybeSingle();
    if (!error && data) setGroupId(data.group_id);
    else console.error("Failed to fetch group_id", error);
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
        date: new Date(c.date_contributed).toLocaleDateString(),
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
  setLoadingPayment(true);

  try {
    const groupMemberId = await getMyGroupMemberId();
    if (!groupMemberId) {
      alert("⚠️ Failed to fetch your group member ID.");
      setLoadingPayment(false);
      return;
    }

    // Ensure phone number is in the format 2547XXXXXXXX (no +, no spaces)
    let phone = formData.phone.replace(/[^0-9]/g, "");
    if (phone.startsWith("0")) {
      phone = "254" + phone.slice(1);
    } else if (phone.startsWith("254")) {
      // already correct
    } else if (phone.startsWith("7")) {
      phone = "254" + phone;
    } else if (phone.startsWith("+254")) {
      phone = phone.slice(1);
    } else {
      alert("❌ Invalid phone number format. Please use 07XXXXXXXX or 2547XXXXXXXX.");
      setLoadingPayment(false);
      return;
    }

    const payload = {
      phone,
      amount: parseFloat(formData.amount),
      type: "contribution",
      group_member_id: groupMemberId,
      accountReference: `Contribution-${groupMemberId}`,
      transactionDesc: "Monthly group contribution",
    };

    let res;
    try {
      res = await fetch("http://localhost:4000/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (networkErr) {
      alert("❌ Could not reach payment server. Please check your connection or try again later.");
      setLoadingPayment(false);
      return;
    }

    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      alert("❌ Invalid response from payment server.");
      setLoadingPayment(false);
      return;
    }

    if (data.ResponseCode === "0") {
      const { error: insertError } = await supabase.from("contributions").insert({
        group_member_id: groupMemberId,
        amount: payload.amount,
        type: "monthly",
        date_contributed: new Date().toISOString().split("T")[0],
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        alert("❌ Payment went through but failed to save record.");
      } else {
        alert("🎉 Contribution recorded successfully!");
        setDialogOpen(false);
        setFormData({ phone: "", amount: "" });
        fetchMyContributions();
      }
    } else {
      console.error("STK Push backend error:", data);
      alert("❌ STK Push failed. Check your phone number and try again.");
    }
  } catch (err) {
    console.error("STK Push error:", err.message);
    alert("❌ Error sending STK Push. Please try again.");
  } finally {
    setLoadingPayment(false);
  }
};



  const myColumns = [
    {
      name: "#",
      selector: (row) => row.id,
      width: "70px",
      cell: (row) => (
        <span className="text-slate-600 font-medium">#{row.id}</span>
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

  const totalContributions = myContributions.reduce(
    (sum, c) => sum + c.amount,
    0
  );
  const contributionCount = myContributions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
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
                    disabled={loadingPayment}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-semibold"
                  >
                    {loadingPayment ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Processing...
                      </div>
                    ) : (
                      "Process Payment"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loadingPayment}
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

export default MemberContributions;