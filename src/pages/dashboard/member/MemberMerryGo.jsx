import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/SupabaseClient";

const MemberMerryGo = () => {
  const { user } = useSession();
  const [data, setData] = useState([]);
  const [percentage, setPercentage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: groupRow } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("member_id", user?.id)
        .single();

      const groupId = groupRow?.group_id;

      if (groupId) {
        const { data: merryRounds } = await supabase
          .from("merry_go_rounds")
          .select("month, year, amount, status, member_id, created_at")
          .eq("group_id", groupId)
          .eq("year", new Date().getFullYear())
          .order("month", { ascending: true });

        const { data: config } = await supabase
          .from("merry_go_config")
          .select("percentage")
          .eq("group_id", groupId)
          .single();

        const resolved = await Promise.all(
          merryRounds.map(async (entry) => {
            const { data: member } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", entry.member_id)
              .single();

            return {
              ...entry,
              members: member?.full_name,
              startDate: `1/${entry.month}/${entry.year}`,
              endDate: `28/${entry.month}/${entry.year}`,
            };
          })
        );

        setData(resolved);
        setPercentage(config?.percentage);
      }
    };

    fetchData();
  }, [user?.id]);

  const columns = [
    { name: "#", selector: (_, i) => i + 1, sortable: true, width: "60px" },
    { name: "Status", selector: row => row.status },
    { name: "Member", selector: row => row.members },
    { name: "Start", selector: row => row.startDate },
    { name: "End", selector: row => row.endDate },
    { name: "Added On", selector: row => new Date(row.created_at).toLocaleDateString() },
  ];

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-white to-gray-100">
      <h2 className="text-2xl font-semibold">Hello {user?.email?.split("@")[0] || "Member"}</h2>

      <div className="bg-white p-4 rounded-xl shadow border space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Merry-Go Rounds (This Year)</h3>
          {percentage !== null && (
            <span className="text-gray-600 text-sm">
              Group allocation: <strong>{percentage}%</strong> of total monthly contributions
            </span>
          )}
        </div>

        <div className="overflow-auto max-h-[500px]">
          <DataTable
            columns={columns}
            data={data}
            pagination
            highlightOnHover
            responsive
            noDataComponent={<div className="text-gray-600 py-6">No records found.</div>}
          />
        </div>
      </div>
    </div>
  );
};

export default MemberMerryGo;
