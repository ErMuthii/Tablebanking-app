import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FiUsers,
  FiDollarSign,
  FiCreditCard,
  FiBell,
  FiCopy,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiUserPlus,
  FiEdit3,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiUserCheck,
  FiFileText,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { CreateGroup } from "@/components/CreateGroup";
import { useSession } from "@/hooks/useSession";

const SkeletonPulse = ({ className }) => (
  <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />
);

const MetricCardSkeleton = () => (
  <Card className="shadow-lg border-0 bg-white">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <SkeletonPulse className="h-12 w-12 rounded-xl" />
          <div>
            <SkeletonPulse className="h-4 w-24 mb-2" />
            <SkeletonPulse className="h-6 w-32" />
          </div>
        </div>
        <SkeletonPulse className="h-6 w-16 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

const ActivityItemSkeleton = () => (
  <div className="flex items-start gap-3 p-4">
    <div className="flex-shrink-0">
      <SkeletonPulse className="w-10 h-10 rounded-full" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <SkeletonPulse className="h-4 w-1/3" />
        <SkeletonPulse className="h-5 w-20" />
      </div>
      <SkeletonPulse className="h-4 w-4/5 mb-2" />
      <SkeletonPulse className="h-3 w-1/4" />
    </div>
  </div>
);

const GroupHomeSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 w-full">
          <div>
            <SkeletonPulse className="h-8 w-64 mb-2" />
            <SkeletonPulse className="h-4 w-48 mb-2" />
            <SkeletonPulse className="h-4 w-56" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SkeletonPulse className="h-10 w-24 rounded-lg" />
          <SkeletonPulse className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Invite Code Skeleton */}
      <Card className="shadow-lg border-2 border-dashed border-gray-200 bg-gray-50">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <SkeletonPulse className="h-4 w-32 mb-2" />
            <SkeletonPulse className="h-8 w-48" />
          </div>
          <SkeletonPulse className="h-9 w-24 rounded-md" />
        </CardContent>
      </Card>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Skeleton */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <SkeletonPulse className="h-6 w-32" />
                <SkeletonPulse className="h-8 w-20" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <ActivityItemSkeleton key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Quick Actions Skeleton */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <SkeletonPulse className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <SkeletonPulse className="h-12 w-full rounded-lg" />
              <SkeletonPulse className="h-12 w-full rounded-lg" />
              <SkeletonPulse className="h-12 w-full rounded-lg" />
            </CardContent>
          </Card>

          {/* Alerts Skeleton */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <SkeletonPulse className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <SkeletonPulse className="h-16 w-full rounded-lg" />
              <SkeletonPulse className="h-16 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const MetricCard = React.memo(({ metric }) => {
  const { title, value, currency, trend, icon: Icon, subtitle } = metric;

  const formatValue = (val) => {
    if (typeof val === "number") {
      return currency
        ? `${currency} ${val.toLocaleString()}`
        : val.toLocaleString();
    }
    return val;
  };

  const TrendIcon = trend?.direction === "up" ? FiTrendingUp : FiTrendingDown;
  const trendColor =
    trend?.direction === "up" ? "text-emerald-600" : "text-red-600";
  const trendBg = trend?.direction === "up" ? "bg-emerald-100" : "bg-red-100";

  return (
    <Card className="transition-all duration-300 hover:shadow-xl hover:scale-[1.02] shadow-lg border border-gray-200 bg-white flex flex-col justify-between">
      <CardContent className="p-4 min-h-[130px] flex flex-col justify-between">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <Icon className="w-6 h-6 text-[#1F5A3D]" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 truncate max-w-[130px]">
              {title}
            </h3>
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full ${trendBg} w-fit`}
            >
              <TrendIcon className={`w-3 h-3 ${trendColor}`} />
              <span className={`text-xs font-semibold ${trendColor}`}>
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className="pl-16 mt-1">
          <p className="text-xl font-bold text-gray-900 break-words">
            {formatValue(value)}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});


const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "contribution":
        return <FiDollarSign className="w-4 h-4 text-emerald-600" />;
      case "loan_request":
        return <FiFileText className="w-4 h-4 text-orange-600" />;
      case "loan_approved":
        return <FiCheckCircle className="w-4 h-4 text-green-600" />;
      case "new_member":
        return <FiUserPlus className="w-4 h-4 text-blue-600" />;
      default:
        return <FiBell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityBadge = (type) => {
    switch (type) {
      case "contribution":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 border-emerald-200"
          >
            Contribution
          </Badge>
        );
      case "loan_request":
        return (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-700 border-orange-200"
          >
            Loan Request
          </Badge>
        );
      case "loan_approved":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 border-green-200"
          >
            Approved
          </Badge>
        );
      case "new_member":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 border-blue-200"
          >
            New Member
          </Badge>
        );
      default:
        return <Badge variant="secondary">Activity</Badge>;
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-700">
            {activity.user
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-900">{activity.user}</p>
          {activity.status === "approved" && (
            <Badge className="bg-green-100 text-green-800">Approved</Badge>
          )}
          {activity.status === "declined" && (
            <Badge className="bg-red-100 text-red-800">Declined</Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
        <p className="text-xs text-gray-500">{activity.time}</p>
      </div>
    </div>
  );
};

const QuickActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
}) => {
  const baseClasses =
    "flex items-center gap-3 p-4 rounded-lg transition-all duration-200 w-full text-left";
  const variantClasses =
    variant === "primary"
      ? "bg-[#1F5A3D] text-white hover:bg-[#164A33] shadow-md hover:shadow-lg"
      : "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md";

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

const AlertCard = ({ alert }) => {
  const getAlertStyles = (type) => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          icon: "text-yellow-600",
          iconBg: "bg-yellow-100",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: "text-blue-600",
          iconBg: "bg-blue-100",
        };
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          icon: "text-green-600",
          iconBg: "bg-green-100",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: "text-gray-600",
          iconBg: "bg-gray-100",
        };
    }
  };

  const styles = getAlertStyles(alert.type);
  const Icon =
    alert.type === "warning"
      ? FiAlertTriangle
      : alert.type === "info"
      ? FiBell
      : FiCheckCircle;

  return (
    <div className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${styles.iconBg}`}>
          <Icon className={`w-4 h-4 ${styles.icon}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {alert.title}
          </p>
          <p className="text-xs text-gray-600">{alert.description}</p>
        </div>
      </div>
    </div>
  );
};

const GroupHome = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useSession();
  const [group, setGroup] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [activities, setActivities] = useState([]);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (data?.full_name) setFullName(data.full_name);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("User not authenticated.");

        // Check if user has a group
        const { data: groupData, error: groupError } = await supabase
          .from("groups")
          .select("*")
          .eq("created_by", user.id)
          .single();

        if (groupError || !groupData) {
          if (groupError && groupError.code !== "PGRST116") {
            // PGRST116 means no rows found, which is okay for a new leader
            throw new Error("Could not fetch group data.");
          }
          // No group found, so we don't set an error, just leave group as null
          setGroup(null);
          setLoading(false);
          return;
        }

        setGroup(groupData);

        // --- Fetch other data only if group exists ---
        const today = new Date();
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        const formattedDate = today.toLocaleDateString("en-US", options);

        // 5. Fetch stats
        const { data: members, error: membersError } = await supabase
          .from("group_members")
          .select("id")
          .eq("group_id", groupData.id);

        if (membersError) throw membersError;
        const memberIds = members.map((m) => m.id);

        const { data: contributions, error: contributionsError } =
          await supabase
            .from("contributions")
            .select("amount, date_contributed")
            .in("group_member_id", memberIds);

        if (contributionsError) throw contributionsError;

        const totalContributions = contributions.reduce(
          (acc, c) => acc + c.amount,
          0
        );
        const contributionThisMonth = contributions
          .filter(
            (c) =>
              new Date(c.date_contributed).getMonth() === new Date().getMonth()
          )
          .reduce((acc, c) => acc + c.amount, 0);

        const { data: loans, error: loansError } = await supabase
          .from("loans")
          .select("amount, status")
          .in("group_member_id", memberIds);

        if (loansError) throw loansError;

        const pendingLoanRequests = loans.filter(
          (l) => l.status === "pending"
        ).length;
        const outstandingLoans = loans
          .filter((l) => l.status === "approved")
          .reduce((acc, l) => acc + l.amount, 0);
        const activeLoans = loans.filter((l) => l.status === "approved").length;

        // TODO: Fetch next recipient

        setStats({
          totalContributions,
          contributionThisMonth,
          pendingLoanRequests,
          outstandingLoans,
          activeLoans,
          nextRecipient: "Mary Johnson", // Placeholder
        });

        // 6. Fetch recent activity
        const { data: contributionActivity, error: contributionActivityError } =
          await supabase
            .from("contributions")
            .select("*, group_members(profiles(full_name))")
            .in("group_member_id", memberIds)
            .order("date_contributed", { ascending: false })
            .limit(5);

        if (contributionActivityError) throw contributionActivityError;

        const { data: loanActivity, error: loanActivityError } = await supabase
          .from("loans")
          .select("*, group_members(profiles(full_name))")
          .in("group_member_id", memberIds)
          .order("requested_at", { ascending: false })
          .limit(5);

        if (loanActivityError) throw loanActivityError;

        const mappedContributions = contributionActivity.map((a) => ({
          id: a.id,
          user: a.group_members.profiles.full_name,
          type: "contribution",
          description: `Made ${a.type} contribution KSh ${a.amount}`,
          time: new Date(a.date_contributed).toLocaleDateString(),
        }));

        const mappedLoans = loanActivity.map((a) => ({
          id: a.id,
          user: a.group_members.profiles.full_name,
          type:
            a.status === "pending"
              ? "loan_request"
              : a.status === "approved"
              ? "loan_approved"
              : a.status === "declined"
              ? "loan_declined"
              : "loan_other",
          description: `Loan for ${a.purpose} KSh ${a.amount} was ${a.status}`,
          status: a.status,
          time: new Date(a.requested_at).toLocaleDateString(),
        }));

        const combinedActivity = [...mappedContributions, ...mappedLoans]
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 5);

        setRecentActivity(combinedActivity);

        // 7. Fetch alerts
        const newAlerts = [];
        if (pendingLoanRequests > 0) {
          newAlerts.push({
            id: 1,
            type: "warning",
            title: `${pendingLoanRequests} loan application(s) pending review`,
            description: "Please review and approve/reject",
          });
        }

        const { data: meetings, error: meetingsError } = await supabase
          .from("meetings")
          .select("title, meeting_date, location, starts_at")
          .eq("group_id", groupData.id)
          .gte("meeting_date", new Date().toISOString())
          .order("meeting_date", { ascending: true })
          .limit(1);

        if (meetingsError) throw meetingsError;

        if (meetings.length > 0) {
          const meeting = meetings[0];
          const meetingDate = new Date(meeting.meeting_date).toLocaleDateString(
            "en-US",
            { weekday: "long", year: "numeric", month: "long", day: "numeric" }
          );
          const meetingTime = new Date(meeting.starts_at).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
          );

          newAlerts.push({
            id: 2,
            type: "info",
            title: `Meeting scheduled: ${meeting.title}`,
            description: `${meetingDate} at ${meetingTime} - ${meeting.location}`,
          });
        }

        setAlerts(newAlerts);

        // --- End of data fetching ---
        setLoading(false);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleCopyInviteCode = () => {
    if (group && group.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      // toast.success("Invite code copied to clipboard!");
    }
  };

  if (loading || userLoading) {
    return <GroupHomeSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <FiAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            An Error Occurred
          </h2>
          <p className="text-gray-600">{error.message}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-6 bg-[#1F5A3D] hover:bg-[#1A4C32] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!group) {
    return <CreateGroup onGroupCreated={() => window.location.reload()} />;
  }

  const dashboardMetrics = [
    {
      id: "contributions",
      title: "Total Contributions",
      value: stats.totalContributions,
      currency: "KSh",
      subtitle: `KSh ${stats.contributionThisMonth.toLocaleString()} this month`,
      icon: FiDollarSign,
      trend: { direction: "up", value: "12" },
    },
    {
      id: "pending",
      title: "Pending Loan Requests",
      value: stats.pendingLoanRequests,
      subtitle: "Require your approval",
      icon: FiClock,
    },
    {
      id: "loans",
      title: "Outstanding Loans",
      value: stats.outstandingLoans,
      currency: "KSh",
      subtitle: `${stats.activeLoans} active loans`,
      icon: FiCreditCard,
      trend: { direction: "down", value: "5" },
    },
    {
      id: "merry-go-round",
      title: "Next Merry-Go-Round",
      value: stats.nextRecipient,
      subtitle: "This month's recipient",
      icon: FiUsers,
    },
  ];

  const formattedDate = new Date(group.created_at).toLocaleDateString();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Welcome back, {fullName || "User"}!
            </h1>
            <p className="text-gray-600">
              Managing{" "}
              <span className="text-[#1F5A3D] font-semibold">{group.name}</span>
            </p>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium">
            Group Leader
          </div>
          <div className="w-10 h-10 bg-[#1F5A3D] text-white rounded-full flex items-center justify-center font-bold">
            {user.user_metadata?.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "U"}
          </div>
        </div>
      </div>

      {/* Invite Code Card */}
      {group.invite_code && (
        <Card className="shadow-lg border-2 border-dashed border-emerald-300 bg-gradient-to-r from-emerald-50 to-emerald-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Group Invite Code
              </p>
              <p className="text-2xl font-bold tracking-widest text-[#1F5A3D]">
                {group.invite_code}
              </p>
            </div>
            <Button
              onClick={handleCopyInviteCode}
              variant="ghost"
              className="hover:bg-emerald-200 text-[#1F5A3D] border border-emerald-300"
              size="sm"
            >
              <FiCopy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Recent Activity
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#1F5A3D] hover:bg-[#1F5A3D]/10"
                >
                  View All →
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QuickActionButton
                icon={FiUsers}
                label="Manage Members"
                variant="primary"
                onClick={() => navigate("/dashboard/leader/membership")}
              />
              <QuickActionButton
                icon={FiDollarSign}
                label="Record Contribution"
                onClick={() => {}}
              />
              <QuickActionButton
                icon={FiCalendar}
                label="Schedule Meeting"
                onClick={() => navigate("/dashboard/leader/meetings")}
              />
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GroupHome;
