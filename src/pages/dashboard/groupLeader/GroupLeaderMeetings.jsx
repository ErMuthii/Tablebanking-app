import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  PlusCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  Users,
  Eye,
  Edit,
  Trash2,
  CalendarDays
} from "lucide-react";

const GroupLeaderMeetings = () => {
  const { user } = useSession();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    location: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const fetchMeetings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("id")
        .eq("created_by", user.id)
        .single();

      if (groupError) throw groupError;

      const { data, error } = await supabase
        .from("meetings")
        .select(
          "id, location, starts_at, ends_at, created_by, profiles(full_name)"
        )
        .eq("group_id", groupData.id)
        .order("starts_at", { ascending: false });

      if (error) throw error;
      setMeetings(data);
    } catch (error) {
      toast.error("Failed to fetch meetings.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [user]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewMeeting((prev) => ({ ...prev, [id]: value }));
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (
      !newMeeting.location ||
      !newMeeting.date ||
      !newMeeting.startTime ||
      !newMeeting.endTime
    ) {
      toast.error("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("id")
        .eq("created_by", user.id)
        .single();

      if (groupError) throw groupError;

      const starts_at = new Date(
        `${newMeeting.date}T${newMeeting.startTime}`
      ).toISOString();
      const ends_at = new Date(
        `${newMeeting.date}T${newMeeting.endTime}`
      ).toISOString();

      const { error } = await supabase.from("meetings").insert({
        group_id: groupData.id,
        location: newMeeting.location,
        starts_at,
        ends_at,
        created_by: user.id,
      });

      if (error) throw error;
      toast.success("Meeting scheduled successfully!");
      setOpen(false);
      fetchMeetings(); // Refresh list
      setNewMeeting({ location: "", date: "", startTime: "", endTime: "" });
    } catch (error) {
      toast.error("Failed to schedule meeting.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMeetingStatus = (startsAt, endsAt) => {
    const now = new Date();
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'completed';
  };

  const getStatusBadge = (status) => {
    const variants = {
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
      ongoing: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    
    const labels = {
      upcoming: 'Upcoming',
      ongoing: 'Live',
      completed: 'Completed'
    };

    return (
      <Badge className={`${variants[status]} font-medium border`}>
        {labels[status]}
      </Badge>
    );
  };

  const upcomingMeetingsCount = meetings.filter(
    (m) => new Date(m.starts_at) > new Date()
  ).length;
  
  const ongoingMeetingsCount = meetings.filter(
    (m) => {
      const now = new Date();
      const start = new Date(m.starts_at);
      const end = new Date(m.ends_at);
      return now >= start && now <= end;
    }
  ).length;
  
  const pastMeetingsCount = meetings.length - upcomingMeetingsCount - ongoingMeetingsCount;

  return (
    <div className="min-h-screen rounded-lg bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header Section */}
        <div className="text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="p-3 bg-gradient-to-br from-[#1F5A3D] to-[#2d7c52] rounded-xl shadow-lg">
                  <CalendarDays className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1F5A3D] to-[#2d7c52] bg-clip-text text-transparent">
                    Group Meetings
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Schedule and manage your group meetings effortlessly
                  </p>
                </div>
              </div>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#1F5A3D] to-[#2d7c52] hover:from-[#1F5A3D]/90 hover:to-[#2d7c52]/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Schedule New Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-[#1F5A3D]">Schedule New Meeting</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Fill in the details to schedule a new meeting for your group.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleScheduleMeeting} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">Meeting Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="location"
                        value={newMeeting.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Community Hall, Room 101"
                        className="pl-10 border-gray-200 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium text-gray-700">Meeting Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="date"
                        type="date"
                        value={newMeeting.date}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-200 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">Start Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="startTime"
                          type="time"
                          value={newMeeting.startTime}
                          onChange={handleInputChange}
                          className="pl-10 border-gray-200 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">End Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="endTime"
                          type="time"
                          value={newMeeting.endTime}
                          onChange={handleInputChange}
                          className="pl-10 border-gray-200 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-[#1F5A3D] hover:bg-[#1F5A3D]/90"
                    >
                      {loading ? "Scheduling..." : "Schedule Meeting"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                  <p className="text-3xl font-bold text-[#1F5A3D]">{loading ? "..." : meetings.length}</p>
                  <p className="text-xs text-gray-500">All time</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#1F5A3D]/10 to-[#1F5A3D]/5 rounded-xl">
                  <Calendar className="w-6 h-6 text-[#1F5A3D]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-3xl font-bold text-blue-600">{loading ? "..." : upcomingMeetingsCount}</p>
                  <p className="text-xs text-gray-500">Scheduled</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Live Now</p>
                  <p className="text-3xl font-bold text-green-600">{loading ? "..." : ongoingMeetingsCount}</p>
                  <p className="text-xs text-gray-500">In progress</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-xl">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-600">{loading ? "..." : pastMeetingsCount}</p>
                  <p className="text-xs text-gray-500">Past events</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Card */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-[#1F5A3D] mb-1">
                  Scheduled Meetings
                </CardTitle>
                <p className="text-gray-600">Manage and track all your group meetings</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Meeting Details</TableHead>
                    <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                    <TableHead className="font-semibold text-gray-700">Organizer</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-[#1F5A3D] border-t-transparent rounded-full animate-spin"></div>
                          Loading meetings...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : meetings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#1F5A3D]/10 to-[#1F5A3D]/5 rounded-full flex items-center justify-center mx-auto">
                            <CalendarDays className="w-8 h-8 text-[#1F5A3D]/50" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-800">No meetings scheduled</h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                              Get started by scheduling your first group meeting. Your team is waiting!
                            </p>
                          </div>
                          <Button 
                            onClick={() => setOpen(true)}
                            className="bg-gradient-to-r from-[#1F5A3D] to-[#2d7c52] hover:from-[#1F5A3D]/90 hover:to-[#2d7c52]/90"
                          >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Schedule Your First Meeting
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    meetings.map((meeting) => {
                      const status = getMeetingStatus(meeting.starts_at, meeting.ends_at);
                      return (
                        <TableRow 
                          key={meeting.id} 
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors duration-150"
                        >
                          <TableCell className="py-4">
                            {getStatusBadge(status)}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{meeting.location}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {meeting.starts_at ? format(new Date(meeting.starts_at), "PPP") : "N/A"}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {meeting.starts_at ? format(new Date(meeting.starts_at), "p") : ""}{" "}
                                {meeting.ends_at ? `- ${format(new Date(meeting.ends_at), "p")}` : ""}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="font-medium text-gray-900">
                              {meeting.profiles?.full_name || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-[#1F5A3D]/10 hover:text-[#1F5A3D]"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                title="Edit Meeting"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                title="Delete Meeting"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupLeaderMeetings;