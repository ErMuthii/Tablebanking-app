import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCreditCard,
  FiCalendar,
  FiUsers,
  FiTarget,
  FiActivity,
  FiPlus,
  FiEye,
  FiDownload,
  FiSend,
} from "react-icons/fi";

// Sample data with more realistic financial group context
const savingsData = [
  { month: "Jan", contributions: 2000, interest: 120, target: 2500 },
  { month: "Feb", contributions: 2500, interest: 180, target: 2500 },
  { month: "Mar", contributions: 3000, interest: 240, target: 2500 },
  { month: "Apr", contributions: 4000, interest: 320, target: 2500 },
  { month: "May", contributions: 5000, interest: 420, target: 2500 },
  { month: "Jun", contributions: 5500, interest: 480, target: 2500 },
];

const transactions = [
  { id: 1, type: "Monthly Contribution", amount: "KES 2,500", date: "2025-06-01", status: "completed" },
  { id: 2, type: "Loan Repayment", amount: "KES 800", date: "2025-06-10", status: "completed" },
  { id: 3, type: "Emergency Fund", amount: "KES 200", date: "2025-06-15", status: "pending" },
];

// Enhanced dashboard metrics with trend data
const dashboardMetrics = [
  {
    id: 'contributions',
    title: 'Total Contributions',
    value: 18000,
    currency: 'KES',
    trend: { value: 12.5, direction: 'up' },
    icon: FiDollarSign,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    progress: { current: 18000, target: 25000 },
    actions: [
      { label: 'Add Contribution', icon: FiPlus, action: 'contribute' },
      { label: 'View History', icon: FiEye, action: 'view' }
    ]
  },
  {
    id: 'loans',
    title: 'Active Loans',
    value: 5000,
    currency: 'KES',
    trend: { value: 8.2, direction: 'down' },
    icon: FiCreditCard,
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    progress: { current: 5000, target: 15000, label: 'Available Credit' },
    actions: [
      { label: 'Apply for Loan', icon: FiPlus, action: 'loan' },
      { label: 'Repay', icon: FiSend, action: 'repay' }
    ]
  },
  {
    id: 'savings',
    title: 'Savings Rate',
    value: 85,
    suffix: '%',
    trend: { value: 5.3, direction: 'up' },
    icon: FiTarget,
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50',
    progress: { current: 85, target: 100 },
    actions: [
      { label: 'Set Goal', icon: FiTarget, action: 'goal' },
      { label: 'View Breakdown', icon: FiActivity, action: 'breakdown' }
    ]
  },
  {
    id: 'attendance',
    title: 'Meeting Attendance',
    value: 92,
    suffix: '%',
    trend: { value: 3.1, direction: 'up' },
    icon: FiUsers,
    gradient: 'from-orange-500 to-red-600',
    bgGradient: 'from-orange-50 to-red-50',
    progress: { current: 11, target: 12, label: 'Meetings Attended' },
    actions: [
      { label: 'Next Meeting', icon: FiCalendar, action: 'meeting' },
      { label: 'View Schedule', icon: FiEye, action: 'schedule' }
    ]
  },
  {
    id: 'nextMeeting',
    title: 'Next Meeting',
    value: '25th June, 2025',
    subtitle: 'In 6 days',
    icon: FiCalendar,
    gradient: 'from-teal-500 to-cyan-600',
    bgGradient: 'from-teal-50 to-cyan-50',
    actions: [
      { label: 'Add to Calendar', icon: FiPlus, action: 'calendar' },
      { label: 'View Agenda', icon: FiEye, action: 'agenda' }
    ]
  },
  {
    id: 'loanUtilization',
    title: 'Loan Utilization',
    value: 33,
    suffix: '%',
    trend: { value: 2.1, direction: 'down' },
    icon: FiActivity,
    gradient: 'from-indigo-500 to-purple-600',
    bgGradient: 'from-indigo-50 to-purple-50',
    progress: { current: 5000, target: 15000, label: 'of available credit' },
    actions: [
      { label: 'Loan Calculator', icon: FiActivity, action: 'calculator' },
      { label: 'Terms', icon: FiEye, action: 'terms' }
    ]
  }
];

// Metric Card Component
const MetricCard = React.memo(({ metric, onAction }) => {
  const {
    title,
    value,
    currency,
    suffix,
    subtitle,
    trend,
    icon: Icon,
    gradient,
    bgGradient,
    progress,
    actions
  } = metric;

  const [isHovered, setIsHovered] = useState(false);

  const formatValue = (val) => {
    if (currency) {
      return `${currency} ${val.toLocaleString()}`;
    }
    return typeof val === 'number' ? val.toLocaleString() : val;
  };

  const TrendIcon = trend?.direction === 'up' ? FiTrendingUp : FiTrendingDown;
  const trendColor = trend?.direction === 'up' ? 'text-emerald-600' : 'text-red-600';
  const trendBg = trend?.direction === 'up' ? 'bg-emerald-100' : 'bg-red-100';

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer group ${
        isHovered ? 'shadow-2xl' : 'shadow-lg'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-50`} />
      <CardContent className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              {trend && (
                <div className={`flex items-center gap-1 mt-1 px-2 py-1 rounded-full ${trendBg} w-fit`}>
                  <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                  <span className={`text-xs font-semibold ${trendColor}`}>
                    {trend.value}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Value */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900">
            {formatValue(value)}{suffix}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Progress Bar */}
        {progress && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{progress.label || 'Progress'}</span>
              <span>{progress.current.toLocaleString()} / {progress.target.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                style={{
                  width: `${Math.min((progress.current / progress.target) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={`flex gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          {actions?.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="flex-1 h-8 text-xs hover:bg-white/80 transition-colors"
              onClick={() => onAction?.(metric.id, action.action)}
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

const MemberHome = () => {
  const [message, setMessage] = useState('');

  // Memoized calculations for performance
  const chartData = useMemo(() => savingsData, []);
  const recentTransactions = useMemo(() => transactions.slice(0, 3), []);

  const handleAction = (metricId, action) => {
    console.log(`Action: ${action} for metric: ${metricId}`);
    // Handle different actions here
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, Jeremy! 👋
            </h1>
            <p className="text-gray-600">
              Here's your financial overview for this month
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Button variant="outline" size="sm">
              <FiDownload className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
        {dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            onAction={handleAction}
          />
        ))}
      </div>

      {/* Chart Section */}
      <Card className="shadow-xl border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Savings Growth</h2>
              <p className="text-gray-600 text-sm">Track your contribution progress over time</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#1F5A3D] rounded-full"></div>
                <span className="text-gray-600">Contributions</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="w-3 h-3 bg-[#10B981] rounded-full"></div>
                <span className="text-gray-600">Interest</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="contributions"
                stroke="#1F5A3D"
                strokeWidth={3}
                dot={{ fill: '#1F5A3D', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#1F5A3D' }}
              />
              <Line
                type="monotone"
                dataKey="interest"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Group Leader */}
        <Card className="shadow-xl border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#1F5A3D]/10 rounded-lg">
                <FiSend className="w-5 h-5 text-[#1F5A3D]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Message Group Leader</h3>
                <p className="text-sm text-gray-600">Send a message to your group administrator</p>
              </div>
            </div>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <Input
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#1F5A3D] to-emerald-600 text-white hover:from-[#174C30] hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={!message.trim()}
              >
                <FiSend className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="shadow-xl border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FiActivity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <p className="text-sm text-gray-600">Your latest financial activities</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <FiEye className="w-4 h-4 mr-1" />
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      txn.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{txn.type}</p>
                      <p className="text-xs text-gray-500">{txn.date}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-[#1F5A3D]">
                    {txn.amount}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberHome;