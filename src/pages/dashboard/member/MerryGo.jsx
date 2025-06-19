// src/pages/dashboard/member/MerryGo.jsx
import React from "react";
import DataTable from "react-data-table-component";
import { FiUsers, FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";

const merryGoData = [];

const columns = [
  { name: "#", selector: (_, i) => i + 1, sortable: true, width: "60px" },
  { name: "Status", selector: row => row.status, sortable: true },
  { name: "Members", selector: row => row.members, sortable: true },
  { name: "Start", selector: row => row.startDate, sortable: true },
  { name: "End", selector: row => row.endDate, sortable: true },
  { name: "Added On", selector: row => row.createdAt, sortable: true },
  {
    name: "Actions",
    cell: () => (
      <div className="flex gap-2">
        <Button size="icon" className="bg-[#1F5A3D] hover:bg-emerald-700 text-white">
          <FiRefreshCw className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];

const MerryGo = () => {
  const { user } = useSession();

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-white to-gray-100 min-h-screen">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          {user?.email?.split("@")[0] || "Member"}'s Merry-Go-Rounds
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Overview of your group’s rotating credit rounds
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Rounds</h3>
        <DataTable
          columns={columns}
          data={merryGoData}
          pagination
          highlightOnHover
          responsive
          noDataComponent={
            <div className="text-center py-10 text-gray-600">
              <p className="text-lg mb-1">😔 No rounds found.</p>
              <p className="text-sm max-w-md mx-auto">
                By pooling our resources, we create a source of credit that rotates among the members,
                allowing us to access funds when needed.
              </p>
            </div>
          }
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
    </div>
  );
};

export default MerryGo;
