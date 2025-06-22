// src/pages/dashboard/member/Meetings.jsx
import React from "react";
import DataTable from "react-data-table-component";
import { FiEye } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";

const allMeetings = [
  {
    id: 1,
    location: "Meeting Point",
    startedAt: "04, Jun 2025 14:00",
    endedAt: "04, Jun 2025 14:57",
    writer: "Jeremy Kang’ethe",
    status: "present",
    upcoming: false,
  },
  {
    id: 2,
    location: "Market Center",
    startedAt: "28, Jun 2025 15:00",
    endedAt: "28, Jun 2025 16:30",
    writer: "Jeremy Kang’ethe",
    status: null,
    upcoming: true,
  },
  {
    id: 3,
    location: "Church Hall",
    startedAt: "10, May 2025 14:00",
    endedAt: "10, May 2025 15:00",
    writer: "Jeremy Kang’ethe",
    status: "absent",
    upcoming: false,
  },
];

const columns = [
  { name: "#", selector: (_, i) => i + 1, sortable: true, width: "60px" },
  { name: "Location", selector: row => row.location, sortable: true },
  { name: "Started At", selector: row => row.startedAt, sortable: true },
  { name: "Ended At", selector: row => row.endedAt, sortable: true },
  { name: "Writer", selector: row => row.writer, sortable: true },
  {
    name: "Actions",
    cell: () => (
      <div className="flex gap-2">
        <Button size="icon" className="bg-[#1F5A3D] hover:bg-emerald-700 text-white">
          <FiEye className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];

const Meetings = () => {
  const { user } = useSession();
  const upcoming = allMeetings.filter((m) => m.upcoming);
  const past = allMeetings.filter((m) => !m.upcoming);

  const statusClass = (status) => {
    return status === "present"
      ? "text-green-600 font-medium"
      : status === "absent"
      ? "text-red-500 font-medium"
      : "text-gray-500 italic";
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-white to-gray-100 min-h-screen">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Hello {user?.email?.split("@")[0] || "Member"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Your participation history and upcoming meetings
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">All Meetings</h3>
        <DataTable
          columns={columns}
          data={allMeetings}
          pagination
          highlightOnHover
          responsive
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
          <h3 className="text-lg font-semibold text-[#1F5A3D] mb-3">Upcoming Meetings</h3>
          <ul className="divide-y divide-gray-200">
            {upcoming.map((m) => (
              <li key={m.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{m.location}</p>
                  <p className="text-sm text-gray-500">{m.startedAt}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Past Meetings */}
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1F5A3D] mb-3">Past Meetings</h3>
          <ul className="divide-y divide-gray-200">
            {past.map((m) => (
              <li key={m.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{m.location}</p>
                  <p className="text-sm text-gray-500">{m.startedAt}</p>
                </div>
                <span className={statusClass(m.status)}>{m.status || "unknown"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Meetings;
