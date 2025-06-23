// src/pages/dashboard/groupLeader/GroupLeaderMerryGo.jsx
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { supabase } from "@/SupabaseClient";
import { useSession } from "@/hooks/useSession";
import { Card, CardContent } from "@/components/ui/card";

const columns = [
  { name: "#", selector: (_, i) => i + 1, width: "60px" },
  { name: "Month", selector: row => row.month, sortable: true },
  { name: "Recipient", selector: row => row.recipient, sortable: true },
];

const GroupLeaderMerryGo = () => {
  const { user } = useSession();
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchSchedule();
    }
  }, [user]);

  const fetchSchedule = async () => {
    // Step 1: Get the group_id of the current user from group_members
    const { data: groupMemberData, error: gmError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("member_id", user.id)
      .single();

    if (gmError || !groupMemberData) {
      console.error("Failed to fetch group_id for user", gmError);
      return;
    }

    const groupId = groupMemberData.group_id;

    // Step 2: Get all members in the same group ordered by joined_at
    const { data: membersData, error: membersError } = await supabase
      .from("group_members")
      .select("member_id")
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true });

    if (membersError || !membersData) {
      console.error("Failed to fetch group members", membersError);
      return;
    }

    const memberIds = membersData.map(m => m.member_id);

    // Step 3: Get member profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", memberIds);

    if (profilesError || !profilesData) {
      console.error("Failed to fetch profiles", profilesError);
      return;
    }

    const nameMap = Object.fromEntries(
      profilesData.map(profile => [profile.id, profile.full_name])
    );

    // Step 4: Build schedule (next N months based on member order)
    const now = new Date();
    const scheduleList = membersData.map((member, index) => {
      const scheduledMonth = new Date(now.getFullYear(), now.getMonth() + index, 1);
      return {
        month: scheduledMonth.toLocaleString("default", { month: "long", year: "numeric" }),
        recipient: nameMap[member.member_id] || "Unknown",
      };
    });

    setSchedule(scheduleList);
  };

  const topTen = schedule.slice(0, 10);
  const overflow = schedule.slice(10);

  return (
    <div className="p-6 space-y-8 bg-white min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Merry-Go-Round Schedule</h1>
        <p className="text-sm text-gray-500 mb-4">
          Showing members in order of distribution
        </p>
      </div>

      <Card className="border border-gray-200 shadow">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Upcoming 10 Recipients</h2>
          <DataTable
            columns={columns}
            data={topTen}
            noHeader
            highlightOnHover
            pagination={false}
          />
        </CardContent>
      </Card>

      {overflow.length > 0 && (
        <Card className="border border-gray-200 shadow">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">More Recipients</h2>
            <DataTable
              columns={columns}
              data={overflow}
              noHeader
              highlightOnHover
              pagination={false}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GroupLeaderMerryGo;