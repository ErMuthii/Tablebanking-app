// src/pages/dashboard/member/MyContributions.jsx
import React from "react";
import DataTable from "react-data-table-component";
import { FiBarChart2, FiTrendingUp, FiTarget, FiCalendar } from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";

const contributions = [
  { id: 1, date: "2025-06-01", amount: "KES 2,500", method: "MPESA", status: "completed" },
  { id: 2, date: "2025-05-01", amount: "KES 2,000", method: "MPESA", status: "completed" },
  { id: 3, date: "2025-04-01", amount: "KES 2,500", method: "MPESA", status: "completed" },
];

const columns = [
  { name: "#", selector: (_, i) => i + 1, sortable: true, width: "60px" },
  { name: "Date", selector: row => row.date, sortable: true },
  { name: "Amount", selector: row => row.amount, sortable: true },
  { name: "Method", selector: row => row.method, sortable: true },
  { name: "Status", selector: row => row.status, sortable: true },
];

const MyContributions = () => {
  const { user } = useSession();
  const totalContributions = 7000;
  const groupTotal = 28000;
  const goal = 10000;
  const percentage = Math.round((totalContributions / groupTotal) * 100);
  const goalProgress = Math.min((totalContributions / goal) * 100, 100);

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-white to-gray-100 min-h-screen">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">My Contributions</h2>
        <p className="text-sm text-gray-600 mt-1">Summary of your personal savings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <FiBarChart2 className="text-[#1F5A3D] w-5 h-5" />
              <h3 className="font-medium text-gray-700">Total Contributed</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800">KES {totalContributions.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <FiTrendingUp className="text-[#1F5A3D] w-5 h-5" />
              <h3 className="font-medium text-gray-700">Share of Group Savings</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800">{percentage}%</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <FiTarget className="text-[#1F5A3D] w-5 h-5" />
              <h3 className="font-medium text-gray-700">Savings Goal</h3>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#1F5A3D] to-emerald-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">KES {totalContributions} / {goal}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-[#1F5A3D] w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-800">Contribution History</h3>
            </div>
            <Button variant="outline" className="text-sm">Export</Button>
          </div>
          <DataTable
            columns={columns}
            data={contributions}
            pagination
            highlightOnHover
            responsive
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: "#f9fafb",
                  fontWeight: 600,
                },
              },
              rows: { style: { minHeight: "52px" } },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MyContributions;
