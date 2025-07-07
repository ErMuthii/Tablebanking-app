// src/pages/dashboard/member/Meetings.jsx
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FiEye } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/SupabaseClient";
import { toast } from "sonner";
import { format } from "date-fns";

const Meetings = () => {
  const { user } = useSession();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const fetchFullName = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (data && data.full_name) setFullName(data.full_name);
    };
    fetchFullName();
  }, [user]);

  useEffect(() => {
    const fetchMeetingsAndAttendance = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // 1. Get the user's group
        const { data: memberData, error: memberError } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("member_id", user.id)
          .single();

        if (memberError || !memberData) {
          toast.error("You don't seem to be part of any group.");
          setLoading(false);
          return;
        }

        const groupId = memberData.group_id;

        // 2. Get all meetings for that group
        const { data: meetingsData, error: meetingsError } = await supabase
          .from("meetings")
          .select("id, location, starts_at, ends_at, profiles(full_name)")
          .eq("group_id", groupId)
          .order("starts_at", { ascending: false });

        if (meetingsError) throw meetingsError;

        // 3. Get user's attendance for those meetings
        const meetingIds = meetingsData.map((m) => m.id);
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select("meeting_id, status")
          .in("meeting_id", meetingIds)
          .eq("member_id", user.id);

        if (attendanceError) throw attendanceError;

        const attendanceMap = new Map(
          attendanceData.map((a) => [a.meeting_id, a.status])
        );

        const combinedData = meetingsData.map((meeting) => ({
          ...meeting,
          status: attendanceMap.get(meeting.id) || null,
          upcoming: new Date(meeting.starts_at) > new Date(),
        }));

        setMeetings(combinedData);
      } catch (error) {
        toast.error("Failed to load meeting data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingsAndAttendance();
  }, [user]);

  const columns = [
    { name: "Location", selector: (row) => row.location, sortable: true },
    {
      name: "Date",
      selector: (row) => format(new Date(row.starts_at), "PPP"),
      sortable: true,
    },
    {
      name: "Time",
      selector: (row) =>
        `${format(new Date(row.starts_at), "p")} - ${format(
          new Date(row.ends_at),
          "p"
        )}`,
      sortable: true,
    },
    {
      name: "Scheduled By",
      selector: (row) => row.profiles.full_name,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => {
        if (row.upcoming)
          return <span className="text-blue-500 italic">Upcoming</span>;
        const status = row.status || "pending";
        const statusClass =
          status === "present"
            ? "text-green-600 font-medium"
            : status === "absent"
            ? "text-red-500 font-medium"
            : status === "late"
            ? "text-yellow-600 font-medium"
            : "text-gray-500 italic";
        return <span className={statusClass}>{status}</span>;
      },
    },
  ];

  const upcoming = meetings.filter((m) => m.upcoming);
  const past = meetings.filter((m) => !m.upcoming);

  const statusClass = (status) => {
    return status === "present"
      ? "text-green-600 font-medium"
      : status === "absent"
      ? "text-red-500 font-medium"
      : status === "late"
      ? "text-yellow-600 font-medium"
      : "text-gray-500 italic";
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-white to-gray-100 min-h-screen">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Hello {fullName || user?.email?.split("@")[0] || "Member"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Your participation history and upcoming meetings
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          All Meetings
        </h3>
        <DataTable
          columns={columns}
          data={meetings}
          pagination
          highlightOnHover
          responsive
          progressPending={loading}
          customStyles={{
            rows: {
              style: { minHeight: "56px" },
            },
            headCells: {
              style: {
                backgroundColor: "#f9fafb",
                color: "#1F2937",
                fontWeight: 600,
              },
            },
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1F5A3D] mb-3">
            Upcoming Meetings
          </h3>
          <ul className="divide-y divide-gray-200">
            {upcoming.map((m) => (
              <li key={m.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{m.location}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(m.starts_at), "PPP p")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Past Meetings */}
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1F5A3D] mb-3">
            Past Meetings
          </h3>
          <ul className="divide-y divide-gray-200">
            {past.map((m) => (
              <li key={m.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{m.location}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(m.starts_at), "PPP p")}
                  </p>
                </div>
                <span className={statusClass(m.status)}>
                  {m.status || "pending"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Meetings;
