import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/SupabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiCheck, FiX, FiPlusCircle, FiUser, FiHeart, FiClock } from "react-icons/fi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RequestHelpForm from "@/pages/RequestHelpForm";

const WelfareRequestCard = ({ request, onApprove, onReject, isLeader }) => {
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
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-[#1F5A3D] bg-gradient-to-br from-white to-green-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border-2 border-[#1F5A3D]/20">
            <AvatarImage src="" alt={request.requester_name} />
            <AvatarFallback className="bg-[#1F5A3D] text-white text-sm font-medium">
              {getInitials(request.requester_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
              {request.title}
            </CardTitle>
            <p className="text-sm text-[#1F5A3D] font-medium flex items-center gap-1 mt-1">
              <FiUser className="h-3 w-3" />
              {request.requester_name}
            </p>
          </div>
          {request.status === "pending" && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
              <FiClock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
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
              '--progress-background': '#1F5A3D',
            }}
          />
        </div>

        {/* Action Buttons */}
        {isLeader && request.status === "pending" ? (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onApprove(request.id)}
              className="flex-1 bg-[#1F5A3D] hover:bg-[#1F5A3D]/90 text-white"
              size="sm"
            >
              <FiCheck className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={() => onReject(request.id)}
              className="flex-1"
              variant="destructive"
              size="sm"
            >
              <FiX className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        ) : (
          <Button className="w-full bg-[#1F5A3D] hover:bg-[#1F5A3D]/90 text-white group-hover:shadow-md transition-all duration-300">
            <FiHeart className="mr-2 h-4 w-4" />
            Contribute
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const GroupLeaderWelfareFund = () => {
  const [activeRequests, setActiveRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const showDialog = location.pathname.endsWith("/request-help");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    const { data: active, error: activeError } = await supabase
      .from("welfare_requests_with_progress")
      .select("*")
      .eq("status", "active");

    if (activeError) {
      toast.error("Error fetching active requests: " + activeError.message);
    } else {
      setActiveRequests(active);
    }

    const { data: pending, error: pendingError } = await supabase
      .from("welfare_requests_with_progress")
      .select("*")
      .eq("status", "pending");

    if (pendingError) {
      toast.error("Error fetching pending requests: " + pendingError.message);
    } else {
      setPendingRequests(pending);
    }
    setLoading(false);
  };

  const fetchMembers = async () => {
    // Get current leader's group_id
    const { data: user } = await supabase.auth.getUser();
    const { data: groupMember } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("member_id", user.user.id)
      .single();
    if (!groupMember) return;
    // Fetch all group members with profile info
    const { data: membersData } = await supabase
      .from("group_members")
      .select("id, group_id, profiles(full_name, email)")
      .eq("group_id", groupMember.group_id);
    setMembers(
      (membersData || []).map((m) => ({
        id: m.id,
        group_id: m.group_id,
        profile_name: m.profiles?.full_name || m.profiles?.email || m.id,
      }))
    );
  };

  useEffect(() => {
    fetchRequests();
    fetchMembers();
  }, []);

  const handleApproval = async (id, status) => {
    const { error } = await supabase
      .from("welfare_requests")
      .update({ status, approved_at: new Date() })
      .eq("id", id);

    if (error) {
      toast.error(
        `Failed to ${status === "active" ? "approve" : "reject"} request: ${
          error.message
        }`
      );
    } else {
      toast.success(
        `Request ${status === "active" ? "approved" : "rejected"} successfully`
      );
      fetchRequests();
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welfare Fund Management
              </h1>
              <p className="text-gray-600 text-lg">
                Support members facing emergencies through voluntary contributions.
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
              <DialogContent className="bg-amber-50 max-w-2xl">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Request Emergency Help (On Behalf)
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  As a group leader, you can submit a welfare request for any member
                  in your group.
                </DialogDescription>
                <RequestHelpForm
                  mode="leader"
                  memberList={members}
                  onSuccess={handleFormSuccess}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-white shadow-sm border border-gray-200 p-1 h-auto">
            <TabsTrigger 
              value="active" 
              className="data-[state=active]:bg-[#1F5A3D] data-[state=active]:text-white px-6 py-3 text-base font-medium"
            >
              <FiHeart className="mr-2 h-4 w-4" />
              Active Requests
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:bg-[#1F5A3D] data-[state=active]:text-white px-6 py-3 text-base font-medium"
            >
              <FiClock className="mr-2 h-4 w-4" />
              Pending Approval
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 bg-amber-500 text-white">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F5A3D]"></div>
                <span className="ml-3 text-gray-600">Loading active requests...</span>
              </div>
            ) : activeRequests.length === 0 ? (
              <div className="text-center py-12">
                <FiHeart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active requests</h3>
                <p className="text-gray-600">There are currently no active welfare requests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRequests.map((request) => (
                  <WelfareRequestCard
                    key={request.id}
                    request={request}
                    isLeader={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F5A3D]"></div>
                <span className="ml-3 text-gray-600">Loading pending requests...</span>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <FiClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-600">All requests have been reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingRequests.map((request) => (
                  <WelfareRequestCard
                    key={request.id}
                    request={request}
                    isLeader={true}
                    onApprove={(id) => handleApproval(id, "active")}
                    onReject={(id) => handleApproval(id, "rejected")}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupLeaderWelfareFund;