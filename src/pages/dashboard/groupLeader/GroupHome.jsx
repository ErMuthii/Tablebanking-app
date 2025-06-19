import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";

const GroupHome = () => {
  const today = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString("en-US", options);

  return (
    <div className="p-8 bg-white min-h-screen rounded-lg pb-4 shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, Group Leader!
          </h1>
          <div className="text-gray-500">{formattedDate}</div>
        </div>
        {/* Placeholder for date range picker if needed later */}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-xl shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Member Contributions
            </CardTitle>
            {/* Icon placeholder if needed */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$150,450.00</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <FiArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Loans Outstanding
            </CardTitle>
            {/* Icon placeholder if needed */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$75,200.00</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <FiArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-500">-2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Loan Groups
            </CardTitle>
            {/* Icon placeholder if needed */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <FiArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+5%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Remaining content areas (charts, tables) can be added here later */}
    </div>
  );
};

export default GroupHome;
