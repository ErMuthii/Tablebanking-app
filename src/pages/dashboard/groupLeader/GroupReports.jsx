import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { FiBarChart2, FiDollarSign, FiCreditCard } from "react-icons/fi";

const GroupReports = () => {
  const [tab, setTab] = useState("contributions");

  // Placeholder data
  const contributions = [
    { member: "Alice Kimani", month: "June 2024", amount: 2000 },
    { member: "John Otieno", month: "June 2024", amount: 2000 },
    { member: "Mary Wambui", month: "June 2024", amount: 2000 },
  ];
  const loans = [
    { member: "Alice Kimani", amount: 5000, status: "Active", due: "Aug 2024" },
    { member: "John Otieno", amount: 3000, status: "Active", due: "Sep 2024" },
  ];

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <FiBarChart2 className="w-7 h-7 text-[#1F5A3D]" />
          <h1 className="text-2xl font-bold text-gray-900">Group Reports</h1>
        </div>
        <p className="text-gray-600 mb-6">
          View detailed reports on group contributions, loans, and more. Use the
          tabs below to switch between report types.
        </p>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger
              value="contributions"
              className="flex items-center gap-2"
            >
              <FiDollarSign /> Contributions
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex items-center gap-2">
              <FiCreditCard /> Loans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contributions">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Monthly Contributions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount (KSh)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.member}</TableCell>
                        <TableCell>{row.month}</TableCell>
                        <TableCell>{row.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loans">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Active Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Amount (KSh)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.member}</TableCell>
                        <TableCell>{row.amount.toLocaleString()}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.due}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupReports;
