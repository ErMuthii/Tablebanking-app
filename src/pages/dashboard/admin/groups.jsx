import React, { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { 
  Users, 
  Plus, 
  Search, 
  Calendar,
  Trash2,
  Eye,
  UserCheck,
  Filter,
  MoreHorizontal
} from "lucide-react";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("groups")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });
    if (!error) setGroups(data);
    setLoading(false);
  };

  const fetchMembers = async (groupId) => {
    const { data, error } = await supabase
      .from("group_members")
      .select("*, profiles(full_name, email)")
      .eq("group_id", groupId);
    if (!error) setMembers(data);
  };

  const handleDelete = async (groupId) => {
    await supabase.from("groups").delete().eq("id", groupId);
    fetchGroups();
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#1F5A3D]/10 p-3 rounded-xl">
                <Users className="h-6 w-6 text-[#1F5A3D]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Groups Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and monitor all table banking groups
                </p>
              </div>
            </div>
            <Button className="bg-[#1F5A3D] hover:bg-[#1F5A3D]/90 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <Card className="bg-gradient-to-r from-[#1F5A3D] to-emerald-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">
                      Total Groups
                    </p>
                    <p className="text-3xl font-bold">{groups.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Active Groups</p>
                    <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {groups.filter(g => new Date(g.created_at).getMonth() === new Date().getMonth()).length}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Growth Rate</p>
                    <p className="text-2xl font-bold text-gray-900">+12%</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Filter className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 bg-white/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900">
                All Groups ({filteredGroups.length})
              </CardTitle>
              
              {/* Search Bar */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]/20"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F5A3D]"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">Group Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Created Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No groups found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGroups.map((group, index) => (
                      <TableRow 
                        key={group.id} 
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#1F5A3D] to-emerald-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                              {group.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{group.name}</p>
                              <p className="text-sm text-gray-500">Group #{index + 1}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(group.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            {/* View Members Dialog */}
                            <Dialog >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#1F5A3D]/20 text-[#1F5A3D] hover:bg-[#1F5A3D]/5 hover:border-[#1F5A3D]/40"
                                  onClick={() => {
                                    setSelectedGroup(group);
                                    fetchMembers(group.id);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Members
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl bg-gray-200">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-semibold text-gray-900">
                                    Members of {selectedGroup?.name}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Manage and view all members in this group
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="mt-6">
                                  {members.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                      <p className="font-medium">No members found</p>
                                      <p className="text-sm">This group doesn't have any members yet.</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                      {members.map((member) => (
                                        <div
                                          key={member.id}
                                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#1F5A3D]/20 transition-colors"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#1F5A3D] to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                              {member.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                              <p className="font-semibold text-gray-900">
                                                {member.profiles?.full_name || 'Unknown User'}
                                              </p>
                                              <p className="text-sm text-gray-600">
                                                {member.profiles?.email}
                                              </p>
                                            </div>
                                          </div>
                                          <Badge className={getStatusColor(member.status)}>
                                            {member.status || 'Active'}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Delete Confirmation Dialog */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-red-600">
                                    Delete Group
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{group.name}"? 
                                    This action cannot be undone and will remove all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(group.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Group
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Groups;