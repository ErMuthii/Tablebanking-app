// src/pages/dashboard/member/MyContributions.jsx
import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiPlusCircle } from "react-icons/fi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const contributionHistory = [
  { id: 1, date: "2025-06-01", amount: 2500, status: "Completed" },
  { id: 2, date: "2025-05-01", amount: 2000, status: "Completed" },
  { id: 3, date: "2025-04-01", amount: 1800, status: "Completed" },
];

const MyContributions = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ phone: "", amount: "" });

  const total = contributionHistory.reduce((acc, item) => acc + item.amount, 0);
  const goal = 10000;
  const groupTotal = 40000;
  const share = ((total / groupTotal) * 100).toFixed(1);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Processing payment via Daraja:", formData);
    setDialogOpen(false);
  };

  return (
    <div className={`relative ${dialogOpen ? 'backdrop-blur-2xl transition-all duration-300' : ''} p-6 space-y-6 bg-gradient-to-br from-white to-gray-50 min-h-screen`}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">My Contributions</h1>
        <p className="text-sm text-gray-500">Track and manage your savings contributions</p>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Contributed</p>
            <p className="text-xl font-bold text-green-700">KES {total.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Your Share</p>
            <p className="text-xl font-bold text-green-700">{share}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Savings Goal</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#1F5A3D] to-emerald-600"
                style={{ width: `${(total / goal) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">KES {total.toLocaleString()} / {goal.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Contribution History Table */}
      <Card className="border border-gray-200 shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Contribution History</h2>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-[#1F5A3D] to-emerald-600 text-white hover:from-[#174C30] hover:to-emerald-700"
            >
              <FiPlusCircle className="w-4 h-4 mr-2" />
              New Contribution
            </Button>
          </div>
          <DataTable
            columns={[
              { name: "#", selector: (_, i) => i + 1, width: "60px" },
              { name: "Date", selector: row => row.date },
              { name: "Amount (KES)", selector: row => row.amount.toLocaleString() },
              { name: "Status", selector: row => row.status },
            ]}
            data={contributionHistory}
            pagination
            highlightOnHover
            noHeader
            customStyles={{
              headCells: {
                style: { backgroundColor: "#f9fafb", fontWeight: 600, fontSize: "14px" },
              },
              rows: { style: { minHeight: "48px" } },
            }}
          />
        </CardContent>
      </Card>

      {/* Popup Form Dialog */}
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

export default MyContributions;
