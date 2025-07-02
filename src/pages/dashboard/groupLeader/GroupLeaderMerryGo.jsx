import React, { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { Calendar, Users, TrendingUp, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const GroupLeaderMerryGo = () => {
  const { user } = useSession();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [groupInfo, setGroupInfo] = useState(null);

  const generateSchedule = (members) => {
    const result = [];
    const startDate = new Date(2025, 5); // June 2025

    for (let i = 0; i < members.length; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      result.push({
        member: members[i].profiles.full_name,
        month: date.toLocaleString("default", { month: "long", year: "numeric" }),
        order: i + 1,
      });
    }

    return result;
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        if (!user?.id) return;

        // Step 1: Get group_id of the logged-in user
        const { data: groupInfo, error: groupError } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("member_id", user.id)
          .maybeSingle();

        if (groupError || !groupInfo?.group_id) {
          console.error("Group fetch error:", groupError);
          toast.error("Failed to fetch group ID.");
          return;
        }

        setGroupInfo(groupInfo);

        // Step 2: Get members of that group, ordered by join date
        const { data: groupMembers, error: membersError } = await supabase
          .from("group_members")
          .select("id, joined_at, profiles(full_name)")
          .eq("group_id", groupInfo.group_id)
          .eq("status", "active") // Optional filter
          .order("joined_at", { ascending: true });

        if (membersError || !groupMembers) {
          console.error("Members fetch error:", membersError);
          toast.error("Failed to fetch group members.");
          return;
        }

        const scheduleData = generateSchedule(groupMembers);
        setSchedule(scheduleData);
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("Unexpected error while loading schedule.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user]);

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const visibleSchedule = schedule.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(schedule.length / ITEMS_PER_PAGE);

  const stats = {
    totalMembers: schedule.length,
    currentMonth: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    completedRounds: 0, // You can calculate this based on your business logic
    nextRecipient: schedule.length > 0 ? schedule[0].member : "N/A",
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Calendar className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No schedule available
      </h3>
      <p className="text-gray-500 mb-4">
        No active members found in this group to generate a merry-go-round schedule.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#1F5A3D] rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-[#1F5A3D]">
                  Merry-Go-Round Schedule
                </h1>
              </div>
              <p className="text-gray-600">
                View the monthly contribution and payout schedule for your group
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Members
                  </p>
                  <p className="text-2xl font-bold text-[#1F5A3D]">
                    {stats.totalMembers}
                  </p>
                </div>
                <div className="p-3 bg-[#1F5A3D]/10 rounded-lg">
                  <Users className="w-6 h-6 text-[#1F5A3D]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Current Month
                  </p>
                  <p className="text-lg font-bold text-yellow-600">
                    {stats.currentMonth}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completed Rounds
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completedRounds}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Next Recipient
                  </p>
                  <p className="text-lg font-bold text-[#1F5A3D] truncate">
                    {stats.nextRecipient}
                  </p>
                </div>
                <div className="p-3 bg-[#1F5A3D]/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-[#1F5A3D]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 bg-white/50">
            <CardTitle className="text-xl font-semibold text-[#1F5A3D] flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Overview
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <LoadingSkeleton />
            ) : schedule.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Order
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Month
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Recipient
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleSchedule.map((item, index) => (
                      <TableRow
                        key={index}
                        className="border-gray-100 hover:bg-gray-50/50 transition-colors duration-200"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: "fadeInUp 0.5s ease-out forwards",
                        }}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-[#1F5A3D] rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {item.order}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {item.month}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#1F5A3D] rounded-full flex items-center justify-center text-white font-medium">
                              {item.member?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.member || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-500">Group Member</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                      disabled={currentPage === 0}
                      variant="outline"
                      className="border-[#1F5A3D] text-[#1F5A3D] hover:bg-[#1F5A3D] hover:text-white"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    
                    <span className="text-sm text-gray-600 font-medium">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                      disabled={currentPage + 1 === totalPages}
                      variant="outline"
                      className="border-[#1F5A3D] text-[#1F5A3D] hover:bg-[#1F5A3D] hover:text-white"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default GroupLeaderMerryGo;