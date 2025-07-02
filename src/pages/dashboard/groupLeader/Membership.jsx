import React, { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useSession } from "../../../hooks/useSession";
import {
  Search,
  Users,
  Trash2,
  UserMinus,
  Mail,
  Crown,
  AlertTriangle,
  Plus,
} from "lucide-react";
import InviteMemberDialog from "@/pages/InviteMemberDialog";

const Membership = () => {
  const { user } = useSession();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [group, setGroup] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          toast.error("User not authenticated");
          return;
        }

        const { data: groups, error: groupError } = await supabase
          .from("groups")
          .select("id, name")
          .eq("created_by", user.id);
        if (groupError || !groups || groups.length === 0) {
          toast.error("No group found for this user.");
          return;
        }

        const group = groups[0];

        const { data: memberData, error: memberError } = await supabase
          .from("group_members")
          .select(
            "id, member_id, status, joined_at, profiles(full_name, email)"
          )
          .eq("group_id", group.id)
          .order("joined_at", { ascending: false });

        if (memberError) {
          toast.error("Failed to load members");
        } else {
          setMembers(memberData || []);
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    const fetchGroup = async () => {
      const { data: groups } = await supabase
        .from("groups")
        .select("*")
        .eq("created_by", user.id)
        .single();
      setGroup(groups);
    };
    if (user) fetchGroup();
  }, [user]);

  const handleDelete = async (id, memberName) => {
    setDeletingId(id);

    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Failed to remove member");
      } else {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        toast.success(`${memberName} has been removed from the group`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error deleting member:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = (status || "active").toLowerCase();

    switch (statusLower) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-300">
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-300">
            Pending
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            className="bg-red-100 text-red-900 hover:bg-red-300"
            variant="secondary"
          >
            Inactive
          </Badge>
        );
      default:
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Active
          </Badge>
        );
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Users className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No members found
      </h3>
      <p className="text-gray-500 mb-4">
        {searchTerm
          ? `No members match "${searchTerm}". Try adjusting your search.`
          : "Your group doesn't have any members yet."}
      </p>
      {searchTerm && (
        <Button
          variant="outline"
          onClick={() => setSearchTerm("")}
          className="border-[#1F5A3D] text-[#1F5A3D] hover:bg-[#1F5A3D] hover:text-white"
        >
          Clear search
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#1F5A3D] rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F5A3D]">
                Group Members
              </h1>
            </div>
            <p className="text-gray-600">
              Manage your group members and their access permissions
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Members
                  </p>
                  <p className="text-2xl font-bold text-[#1F5A3D]">
                    {loading ? "..." : members.length}
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
                    Active Members
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {loading
                      ? "..."
                      : members.filter(
                          (m) =>
                            (m.status || "active").toLowerCase() === "active"
                        ).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Crown className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Members
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {loading
                      ? "..."
                      : members.filter(
                          (m) => (m.status || "").toLowerCase() === "pending"
                        ).length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 bg-white/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-[#1F5A3D]">
              Member Management
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]"
                />
              </div>
              {group && user && (
                <InviteMemberDialog
                  group={group}
                  user={user}
                  trigger={
                    <Button className="ml-2 flex items-center gap-2 bg-[#1F5A3D] text-white hover:bg-[#17432e] transition-colors duration-200">
                      <Plus className="w-4 h-4" />
                      Invite Member
                    </Button>
                  }
                />
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredMembers.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Member
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Contact
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member, index) => (
                      <TableRow
                        key={member.id}
                        className="border-gray-100 hover:bg-gray-50/50 transition-colors duration-200"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: "fadeInUp 0.5s ease-out forwards",
                        }}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#1F5A3D] rounded-full flex items-center justify-center text-white font-medium">
                              {member.profiles?.full_name
                                ?.charAt(0)
                                ?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.profiles?.full_name || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Member since{" "}
                                {new Date(
                                  member.joined_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {member.profiles?.email || "No email"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          {getStatusBadge(member.status)}
                        </TableCell>

                        <TableCell className="py-4 text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={deletingId === member.id}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                              >
                                {deletingId === member.id ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                                    <span>Removing...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <UserMinus className="w-4 h-4" />
                                    <span>Remove</span>
                                  </div>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-md bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
                                  <Trash2 className="w-5 h-5" />
                                  <span>Remove Member</span>
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                  Are you sure you want to remove{" "}
                                  <span className="font-semibold text-gray-900">
                                    {member.profiles?.full_name ||
                                      "this member"}
                                  </span>{" "}
                                  from the group? This action cannot be undone
                                  and they will lose access to all group
                                  resources.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel className="border-gray-200 hover:bg-gray-50">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDelete(
                                      member.id,
                                      member.profiles?.full_name
                                    )
                                  }
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove Member
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

export default Membership;
