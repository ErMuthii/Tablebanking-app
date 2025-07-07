import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiUserCheck,
  FiDollarSign,
  FiLayers,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";
import { supabase } from "@/SupabaseClient";

const AdminHome = () => {
  const [stats, setStats] = useState({
    groups: null,
    members: null,
    leaders: null,
    savings: null,
    savingsThisMonth: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total groups
        const { count: groups, error: groupsError } = await supabase
          .from("groups")
          .select("id", { count: "exact", head: true });
        // Total members
        const { count: members, error: membersError } = await supabase
          .from("group_members")
          .select("id", { count: "exact", head: true });
        // Group leaders
        const { count: leaders, error: leadersError } = await supabase
          .from("group_members")
          .select("id", { count: "exact", head: true })
          .eq("role", "group_leader");
        // Total savings
        const { data: savingsData, error: savingsError } = await supabase
          .from("contributions")
          .select("amount");
        const savings = (savingsData || []).reduce(
          (sum, c) => sum + Number(c.amount),
          0
        );
        // Savings this month
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-01`;
        const { data: monthSavingsData } = await supabase
          .from("contributions")
          .select("amount")
          .gte("date_contributed", monthStart);
        const savingsThisMonth = (monthSavingsData || []).reduce(
          (sum, c) => sum + Number(c.amount),
          0
        );
        setStats({
          groups,
          members,
          leaders,
          savings,
          savingsThisMonth,
          loading: false,
          error: null,
        });
      } catch (err) {
        setStats((s) => ({
          ...s,
          loading: false,
          error: err.message || "Failed to load stats",
        }));
      }
    };
    fetchStats();
  }, []);

  const cardClass =
    "bg-white rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-100 min-h-[120px]";
  const labelClass = "text-gray-500 text-sm flex items-center gap-2";
  const valueClass = "text-3xl font-bold text-gray-900";
  const subClass = "text-xs text-gray-400 mt-1";

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            System-wide summary and analytics
          </p>
        </div>
        {stats.loading ? (
          <div className="text-center py-12 text-gray-400">
            Loading dashboard...
          </div>
        ) : stats.error ? (
          <div className="text-center py-12 text-red-500">{stats.error}</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className={cardClass}>
                <span className={labelClass}>
                  <FiLayers /> Total Groups
                </span>
                <span className={valueClass}>{stats.groups}</span>
                <span className={subClass}>+N/A from last month</span>
              </div>
              <div className={cardClass}>
                <span className={labelClass}>
                  <FiUsers /> Total Members
                </span>
                <span className={valueClass}>{stats.members}</span>
                <span className={subClass}>+N/A from last month</span>
              </div>
              <div className={cardClass}>
                <span className={labelClass}>
                  <FiUserCheck /> Group Leaders
                </span>
                <span className={valueClass}>{stats.leaders}</span>
                <span className={subClass}>One per group</span>
              </div>
              <div className={cardClass}>
                <span className={labelClass}>
                  <FiDollarSign /> Total Savings
                </span>
                <span className={valueClass}>
                  KSh {stats.savings.toLocaleString()}
                </span>
                <span className={subClass}>
                  +KSh {stats.savingsThisMonth.toLocaleString()} this month
                </span>
              </div>
            </div>
            {/* System Growth Chart Placeholder */}
            <div className="bg-white rounded-xl shadow p-6 mt-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                System Growth
              </h2>
              <p className="text-gray-500 mb-4">Groups and members over time</p>
              <div className="h-48 flex items-center justify-center text-gray-300">
                [Chart Placeholder]
              </div>
            </div>
            {/* Top Performing Groups Placeholder */}
            <div className="bg-white rounded-xl shadow p-6 mt-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Top Performing Groups
              </h2>
              <p className="text-gray-500 mb-4">
                Groups with highest savings and activity
              </p>
              <div className="h-48 flex items-center justify-center text-gray-300">
                [Bar Chart Placeholder]
              </div>
            </div>
            {/* System Alerts Placeholder */}
            <div className="bg-white rounded-xl shadow p-6 mt-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                System Alerts
              </h2>
              <p className="text-gray-500 mb-4">Recent system notifications</p>
              <div className="space-y-2">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded flex items-center gap-2 text-yellow-800">
                  <FiAlertCircle className="w-5 h-5" /> 5 groups approaching
                  loan limits{" "}
                  <span className="ml-auto text-xs text-gray-400">
                    2 hours ago
                  </span>
                </div>
                <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded flex items-center gap-2 text-green-800">
                  <FiTrendingUp className="w-5 h-5" /> New high: {stats.members}{" "}
                  total members{" "}
                  <span className="ml-auto text-xs text-gray-400">
                    1 day ago
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
