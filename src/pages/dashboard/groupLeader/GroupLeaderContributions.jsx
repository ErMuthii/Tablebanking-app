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
    const { data, error } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("member_id", user.id);

    return data?.map((d) => d.id) || [];
  };

  const fetchMyContributions = async () => {
    const memberIds = await getMyGroupMemberIds();

    const { data, error } = await supabase
      .from("contributions")
      .select("id, amount, type, date_contributed")
      .in("group_member_id", memberIds)
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

  const fetchGroupContributions = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("contributions")
      .select(`
        id,
        amount,
        type,
        date_contributed,
        group_members (
          group_id,
          profiles (
            full_name
          )
        )
      `)
      .eq("group_members.group_id", groupId)
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
    } else {
      console.error("Error fetching contributions:", error);
    }

    setLoading(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [groupMemberId] = await getMyGroupMemberIds();
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
      fetchGroupContributions();
    }
  };

  const groupColumns = [
    { name: "#", selector: (row) => row.id, width: "60px" },
    { name: "Contributor", selector: (row) => row.contributor, sortable: true },
    { name: "Amount (KES)", selector: (row) => row.amount.toLocaleString(), sortable: true },
    { name: "Type", selector: (row) => row.type, sortable: true },
    { name: "Date", selector: (row) => row.date, sortable: true },
  ];

  const myColumns = [
    { name: "#", selector: (row) => row.id, width: "60px" },
    { name: "Amount (KES)", selector: (row) => row.amount.toLocaleString(), sortable: true },
    { name: "Type", selector: (row) => row.type, sortable: true },
    { name: "Date", selector: (row) => row.date, sortable: true },
  ];

  const visibleData = showAll ? groupContributions : groupContributions.slice(0, 10);

  return (
    <div className="p-6 space-y-10 bg-white rounded-2xl shadow border border-gray-200 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Contributions Overview</h1>
        <p className="text-sm text-gray-500">Track your own contributions and those of your group</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex justify-between items-center">
          My Contributions
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

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Group Contributions</h2>
        <Card className="border border-gray-200 shadow">
          <CardContent className="p-6">
            <DataTable
              columns={groupColumns}
              data={visibleData}
              progressPending={loading}
              highlightOnHover
              responsive
              pagination={false}
              noDataComponent={<div className="py-6 text-gray-600">No group contributions found.</div>}
              customStyles={{
                headCells: {
                  style: { backgroundColor: "#f9fafb", fontWeight: 600, fontSize: "14px" },
                },
                rows: { style: { minHeight: "48px" } },
              }}
            />
            {groupContributions.length > 10 && (
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={() => setShowAll(!showAll)}
                  variant="ghost"
                  className="text-green-700 hover:text-green-900"
                >
                  {showAll ? "View Less" : "View More"}
                </Button>
              </div>
            )}
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

export default GroupLeaderContributions;
