// src/pages/dashboard/member/Loans.jsx
import React from "react";
import DataTable from "react-data-table-component";
import { FiEye, FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";

const loanData = [];

const columns = [
  { name: "#", selector: (_, i) => i + 1, sortable: true, width: "60px" },
  { name: "Loan No", selector: row => row.loanNumber, sortable: true },
  { name: "Amount", selector: row => row.amount, sortable: true },
  { name: "Due On", selector: row => row.dueDate, sortable: true },
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

const GroupMemberLoans = () => {
  const { user } = useSession();

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-white to-gray-100 min-h-screen">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{user?.email?.split("@")[0] || "Member"}'s Loans</h2>
        <p className="text-sm text-gray-600 mt-1">
          View your active and past loan activity
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Loan Records</h3>
          <div className="flex items-center gap-3">
            <select className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-700">
              <option>Active</option>
              <option>Repaid</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={loanData}
          pagination
          highlightOnHover
          responsive
          noDataComponent={
            <div className="text-center text-sm text-gray-500 py-4">
              <p className="mb-1">😔 No members with loans.</p>
              <p>'Loans are a great way to build credit, increase cash flow, and gain capital.'</p>
            </div>
          }
          customStyles={{
            rows: { style: { minHeight: "56px" } },
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

export default GroupMemberLoans;
