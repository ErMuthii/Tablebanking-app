import React, { useState, useEffect } from "react";
import { supabase } from "@/SupabaseClient";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Check,
  X,
  Minus,
  Fingerprint,
  Send,
  Clock,
  UserCheck,
  UserX,
  Users,
  TrendingUp,
  Search,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const attendanceStatuses = [
  { value: "present", label: "Present", color: "bg-emerald-100 text-emerald-700 border-emerald-200", activeColor: "bg-emerald-500 text-white" },
  { value: "absent", label: "Absent", color: "bg-red-100 text-red-700 border-red-200", activeColor: "bg-red-500 text-white" },
  { value: "late", label: "Late", color: "bg-amber-100 text-amber-700 border-amber-200", activeColor: "bg-amber-500 text-white" },
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-700 border-gray-200", activeColor: "bg-gray-500 text-white" },
];

const AttendancePage = () => {
  const { user } = useSession();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [attendance, setAttendance] = useState({});
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("manual");

  useEffect(() => {
    // Fetch group members associated with the group leader
    const fetchMembers = async () => {
      if (!user) return;
      setLoading(true);
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("id")
        .eq("created_by", user.id)
        .single();
      if (groupError || !groupData) {
        toast.error("Could not find your group.");
        setLoading(false);
        return;
      }
      const { data: memberData, error: memberError } = await supabase
        .from("group_members")
        .select("id, member_id, profiles(id, full_name)")
        .eq("group_id", groupData.id);
      if (memberError) {
        toast.error("Failed to load group members.");
      } else {
        setMembers(memberData);
      }
      setLoading(false);
    };
    fetchMembers();
  }, [user]);

  // Stats calculation (mocked for now)
  const totalMembers = members.length;
  const present = Object.values(attendance).filter(
    (s) => s === "present"
  ).length;
  const absent = Object.values(attendance).filter((s) => s === "absent").length;
  const late = Object.values(attendance).filter((s) => s === "late").length;
  const attendanceRate = totalMembers
    ? Math.round((present / totalMembers) * 100)
    : 0;

  // Filtered members
  const filteredMembers = members.filter((m) =>
    m.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Status change
  const setMemberStatus = (memberId, status) => {
    setAttendance((prev) => ({ ...prev, [memberId]: status }));
  };

  // Save attendance to Supabase
  const handleSaveAttendance = async () => {
    if (!selectedDate) {
      toast.error("Please select a date.");
      return;
    }
    if (Object.keys(attendance).length === 0) {
      toast.error("Please mark attendance for at least one member.");
      return;
    }
    setLoading(true);
    try {
      // 1. Get group id
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("id")
        .eq("created_by", user.id)
        .single();
      if (groupError || !groupData) {
        toast.error("Could not find your group.");
        setLoading(false);
        return;
      }
      // 2. Check if meeting exists for this date
      const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .select("id")
        .eq("group_id", groupData.id)
        .eq("meeting_date", format(selectedDate, "yyyy-MM-dd"))
        .maybeSingle();
      let meetingId = meeting?.id;
      if (!meetingId) {
        // Create meeting
        const { data: newMeeting, error: createMeetingError } = await supabase
          .from("meetings")
          .insert({
            group_id: groupData.id,
            meeting_date: format(selectedDate, "yyyy-MM-dd"),
            created_by: user.id,
          })
          .select()
          .single();
        if (createMeetingError || !newMeeting) {
          toast.error("Failed to create meeting record.");
          setLoading(false);
          return;
        }
        meetingId = newMeeting.id;
      }
      // 3. Upsert attendance records
      const attendanceRows = Object.entries(attendance)
        .filter(([_, status]) => status !== "pending")
        .map(([memberId, status]) => ({
          meeting_id: meetingId,
          member_id: memberId,
          status,
          marked_by: user.id,
        }));
      if (attendanceRows.length === 0) {
        toast.error("No attendance to save.");
        setLoading(false);
        return;
      }
      const { error: attendanceError } = await supabase
        .from("attendance")
        .upsert(attendanceRows, { onConflict: ["meeting_id", "member_id"] });
      if (attendanceError) {
        toast.error("Failed to save attendance.");
      } else {
        toast.success("Attendance saved!");
      }
    } catch (err) {
      toast.error("Unexpected error saving attendance.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Attendance Management
            </h1>
            <p className="text-gray-600">
              Track member attendance for your table banking group
            </p>
          </div>
          
          {/* Enhanced Date Picker */}
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCalendar((v) => !v)}
              className="min-w-[180px] h-11 bg-white border-gray-300 hover:border-[#1F5A3D] hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Clock className="w-5 h-5 mr-2 text-[#1F5A3D]" />
              <span className="font-medium text-gray-900">
                {selectedDate
                  ? format(selectedDate, "dd/MM/yyyy")
                  : "Pick a date"}
              </span>
              <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
            </Button>
            {showCalendar && (
              <div className="absolute right-0 z-10 mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setShowCalendar(false);
                  }}
                  initialFocus
                  className="p-3"
                />
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Total Members</div>
                <div className="text-2xl font-bold text-gray-900">{totalMembers}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <UserCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Present</div>
                <div className="text-2xl font-bold text-emerald-600">{present}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-red-50 rounded-lg">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Absent</div>
                <div className="text-2xl font-bold text-red-600">{absent}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-amber-50 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Late</div>
                <div className="text-2xl font-bold text-amber-600">{late}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#1F5A3D] to-[#2d7a56] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-white/90">Attendance Rate</div>
                <div className="text-2xl font-bold text-white">{attendanceRate}%</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Card with Tabs */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Mark Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="mb-6 w-full bg-gray-100 p-1">
                <TabsTrigger 
                  value="manual" 
                  className="flex-1 data-[state=active]:bg-[#1F5A3D] data-[state=active]:text-white font-medium"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger 
                  value="fingerprint" 
                  className="flex-1 data-[state=active]:bg-[#1F5A3D] data-[state=active]:text-white font-medium"
                >
                  <Fingerprint className="w-4 h-4 mr-2" />
                  Fingerprint
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-6">
                {/* Enhanced Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]"
                  />
                </div>

                {/* Enhanced Member List */}
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                  {filteredMembers.length === 0 ? (
                    <div className="text-gray-500 text-center py-12">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium">No members found</p>
                      <p className="text-sm">Try adjusting your search terms</p>
                    </div>
                  ) : (
                    filteredMembers.map((member) => {
                      const status = attendance[member.id] || "pending";
                      const initials = member.profiles?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?";
                      
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-4 hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#1F5A3D] text-white flex items-center justify-center font-semibold text-lg">
                              {initials}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-lg">
                                {member.profiles?.full_name || "Unknown"}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {attendanceStatuses.map((s) => (
                              <Button
                                key={s.value}
                                type="button"
                                size="sm"
                                variant="outline"
                                className={`rounded-lg px-4 py-2 font-medium transition-all ${
                                  status === s.value
                                    ? s.activeColor + " border-transparent shadow-sm"
                                    : s.color + " border hover:bg-opacity-80"
                                }`}
                                onClick={() =>
                                  setMemberStatus(member.id, s.value)
                                }
                              >
                                {s.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Enhanced Save Button */}
                <Button
                  type="button"
                  className="w-full h-12 bg-[#1F5A3D] hover:bg-[#2d7a56] text-white font-semibold text-lg shadow-sm transition-colors"
                  onClick={handleSaveAttendance}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Save Attendance
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="fingerprint">
                <div className="flex flex-col items-center justify-center py-16 px-8">
                  <div className="p-6 bg-gray-50 rounded-full mb-6">
                    <Fingerprint className="w-16 h-16 text-[#1F5A3D]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to Scan
                  </h3>
                  <p className="text-gray-600 mb-8 text-center max-w-md">
                    Place your finger on the scanner to mark attendance automatically
                  </p>
                  <Button size="lg" className="bg-[#1F5A3D] hover:bg-[#2d7a56] text-white h-12 px-8">
                    <Fingerprint className="w-5 h-5 mr-2" />
                    Start Scan
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendancePage;