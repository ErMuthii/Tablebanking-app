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
    { name: "#", selector: (row) => row.id, width: "60px" },
    { name: "Amount (KES)", selector: (row) => row.amount.toLocaleString(), sortable: true },
    { name: "Type", selector: (row) => row.type, sortable: true },
    { name: "Date", selector: (row) => row.date, sortable: true },
  ];

  return (
    <div className="p-6 space-y-10 bg-white rounded-2xl shadow border border-gray-200 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Contributions</h1>
        <p className="text-sm text-gray-500">Track and manage your contributions to the group</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex justify-between items-center">
          Contribution History
          <Button onClick={() => setDialogOpen(true)} className="bg-[#1F5A3D] text-white hover:bg-[#174C30]">
            + New Contribution
          </Button>
        </h2>
        <Card className="border border-gray-200 shadow">
          <CardContent className="p-6">
            <DataTable
              columns={myColumns}
              data={myContributions}
              highlightOnHover
              responsive
              pagination={false}
              noDataComponent={<div className="py-6 text-gray-600">You have not made any contributions yet.</div>}
              customStyles={{
                headCells: {
                  style: { backgroundColor: "#f9fafb", fontWeight: 600, fontSize: "14px" },
                },
                rows: { style: { minHeight: "48px" } },
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm mx-auto bg-white rounded-lg shadow-xl z-50">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Make Contribution</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleFormChange}
              required
            />
            <Input
              type="text"
              name="amount"
              placeholder="Amount (KES)"
              value={formData.amount}
              onChange={handleFormChange}
              required
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#1F5A3D] to-emerald-600 text-white hover:from-[#174C30] hover:to-emerald-700"
              >
                Process Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberContributions;
