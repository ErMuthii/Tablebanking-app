import React, { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { useSession } from "@/hooks/useSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Crown, Calendar, Hash, Info } from "lucide-react";

export default function GroupInfo() {
  const { user } = useSession();
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupInfo = async () => {
      setLoading(true);

      try {
        // Step 1: Get group_id for logged-in member
        const { data: membership, error: membershipError } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("member_id", user.id)
          .maybeSingle();

        if (membershipError || !membership?.group_id) {
          console.error("Error fetching group_id", membershipError);
          return;
        }

        const groupId = membership.group_id;

        // Step 2: Get group info
        const { data: group, error: groupError } = await supabase
          .from("groups")
          .select("name, created_at")
          .eq("id", groupId)
          .maybeSingle();

        if (groupError || !group) {
          console.error("Error fetching group info", groupError);
          return;
        }

        // Step 3: Get group leaders
        const { data: leaders, error: leadersError } = await supabase
          .from("group_members")
          .select("profiles(full_name)")
          .eq("group_id", groupId)
          .eq("role", "group_leader");

        if (leadersError) {
          console.error("Error fetching group leaders", leadersError);
          return;
        }

        // Step 4: Count total members
        const { count, error: countError } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", groupId);

        if (countError) {
          console.error("Error counting members", countError);
          return;
        }

        setGroupInfo({
          name: group.name,
          createdAt: group.created_at,
          totalMembers: count,
          leaders: leaders.map((l) => l.profiles?.full_name).filter(Boolean),
        });
      } catch (err) {
        console.error("Unexpected error", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchGroupInfo();
    }
  }, [user]);

  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Info className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Group information unavailable
      </h3>
      <p className="text-gray-500">
        Unable to fetch group details at this time.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#1F5A3D] rounded-lg">
              <Info className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1F5A3D]">
              Group Information
            </h1>
          </div>
          <p className="text-gray-600">
            View details and statistics about your group
          </p>
        </div>

        {/* Main Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : !groupInfo ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <EmptyState />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Group Name Card */}
            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#1F5A3D]/10 rounded-lg">
                    <Users className="w-6 h-6 text-[#1F5A3D]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Group Name</p>
                  <p className="text-xl font-bold text-[#1F5A3D]">
                    {groupInfo.name}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Total Members Card */}
            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Hash className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {groupInfo.totalMembers}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Date Created Card */}
            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Date Created</p>
                  <p className="text-lg font-bold text-green-600">
                    {new Date(groupInfo.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Group Leaders Card */}
            <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Crown className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600">Group Leader(s)</p>
                  {groupInfo.leaders.length > 0 ? (
                    <div className="space-y-2">
                      {groupInfo.leaders.map((leader, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900">
                            {leader}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-lg font-medium text-gray-400 italic">
                      No leaders assigned
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
}