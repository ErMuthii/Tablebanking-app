import React, { useState, useEffect } from "react";
import { supabase } from "@/SupabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FiPlusCircle,
  FiHeart,
  FiUsers,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RequestHelpForm from "@/pages/RequestHelpForm";

const WelfareRequestCard = ({ request }) => {
  // Truncate description to 3 lines
  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-[#1F5A3D] bg-gradient-to-br from-white to-green-50/20 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border-2 border-[#1F5A3D]/20 shrink-0">
            <AvatarImage src="" alt={request.requester_name} />
            <AvatarFallback className="bg-[#1F5A3D] text-white text-sm font-medium">
              {getInitials(request.requester_name || "Anonymous")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
              {request.title}
            </CardTitle>
            <p className="text-sm text-[#1F5A3D] font-medium flex items-center gap-1">
              <FiUser className="h-3 w-3" />
              {request.requester_name || "Anonymous"}
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200 shrink-0"
          >
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {truncateText(request.description)}
        </p>

        {/* Amount Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="font-semibold text-[#1F5A3D]">
                KSh {request.total_contributed?.toLocaleString() || 0}
              </span>
              <span className="text-gray-500 mx-1">of</span>
              <span className="font-medium text-gray-900">
                KSh {request.amount_requested?.toLocaleString() || 0}
              </span>
            </div>
            <Badge
              variant="outline"
              className="bg-[#1F5A3D]/10 text-[#1F5A3D] border-[#1F5A3D]/20 font-semibold"
            >
              {(request.progress_percentage || 0).toFixed(0)}%
            </Badge>
          </div>

          <Progress
            value={request.progress_percentage || 0}
            className="h-2 bg-gray-200"
            style={{
              "--progress-background": "#1F5A3D",
            }}
          />
        </div>

        {/* Contribute Button */}
        <Button className="w-full bg-[#1F5A3D] hover:bg-[#1F5A3D]/90 text-white group-hover:shadow-lg transition-all duration-300 font-medium">
          <FiHeart className="mr-2 h-4 w-4" />
          Contribute Now
        </Button>
      </CardContent>
    </Card>
  );
};

const StatsCard = ({
  icon: Icon,
  title,
  value,
  description,
  color = "bg-[#1F5A3D]",
}) => (
  <Card className="bg-gradient-to-br from-white to-green-50/30 border-0 shadow-md hover:shadow-lg transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className={`${color} p-3 rounded-xl`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const MemberWelfareFund = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalContributed: 0,
    activeRequests: 0,
  });

  useEffect(() => {
    fetchWelfareRequests();
    // eslint-disable-next-line
  }, []);

  const fetchWelfareRequests = async () => {
    setLoading(true);
    // Get current user's group_id
    const { data: user } = await supabase.auth.getUser();
    const { data: groupMember, error: gmError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("member_id", user.user.id)
      .single();
    if (gmError || !groupMember) {
      toast.error("Could not find your group membership.");
      setRequests([]);
      setLoading(false);
      return;
    }
    // Fetch all active requests for this group
    const { data, error } = await supabase
      .from("welfare_requests_with_progress")
      .select("*")
      .eq("status", "active")
      .eq("group_id", groupMember.group_id);
    if (error) {
      toast.error("Error fetching requests: " + error.message);
    } else {
      setRequests(data || []);

      // Calculate stats
      const totalContributed = (data || []).reduce(
        (sum, req) => sum + (req.total_contributed || 0),
        0
      );
      setStats({
        totalRequests: (data || []).length,
        totalContributed,
        activeRequests: (data || []).length,
      });
    }
    setLoading(false);
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchWelfareRequests();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welfare Fund
              </h1>
              <p className="text-gray-600 text-lg">
                Support members facing emergencies through voluntary
                contributions.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-[#1F5A3D] hover:bg-[#1F5A3D]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FiPlusCircle className="mr-2 h-5 w-5" />
                  Request Help
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Request Emergency Help
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Fill out the form below to request welfare assistance from
                  your group.
                </DialogDescription>
                <RequestHelpForm mode="member" onSuccess={handleFormSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={FiUsers}
            title="Active Requests"
            value={stats.activeRequests}
            description="Currently seeking support"
          />
          <StatsCard
            icon={FiHeart}
            title="Total Contributed"
            value={`KSh ${stats.totalContributed.toLocaleString()}`}
            description="Community support raised"
            color="bg-rose-500"
          />
          <StatsCard
            icon={FiTrendingUp}
            title="Total Requests"
            value={stats.totalRequests}
            description="All active campaigns"
            color="bg-blue-500"
          />
        </div>

        {/* Requests Section */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F5A3D] mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">
                Loading welfare requests...
              </p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FiHeart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Active Requests
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                There are currently no active welfare requests in your group. Be
                the first to create one if you need emergency assistance.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1F5A3D] hover:bg-[#1F5A3D]/90 text-white">
                    <FiPlusCircle className="mr-2 h-4 w-4" />
                    Create Request
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Active Requests ({requests.length})
              </h2>
              <p className="text-sm text-gray-600">
                Click on any request to contribute and help your community
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <WelfareRequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberWelfareFund;
