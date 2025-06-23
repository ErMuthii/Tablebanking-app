import React, { useEffect, useState } from "react";
import { supabase } from "@/SupabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useSession } from "@/hooks/useSession";
import { Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

const GroupLeaderMerryGo = () => {
  const { user } = useSession();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateSchedule = (members) => {
    const result = [];
    const startDate = new Date(2025, 5); // June 2025

    for (let i = 0; i < members.length; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      result.push({
        member: members[i].profiles.full_name,
        month: date.toLocaleString("default", { month: "long", year: "numeric" }),
      });
    }

    return result;
  };

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        if (!user) return;

        const { data: groupMembers, error } = await supabase
          .from("group_members")
          .select("id, created_at, profiles(full_name), group_id")
          .eq("group_id", (await supabase
            .from("group_members")
            .select("group_id")
            .eq("member_id", user.id)
            .single()).data.group_id)
          .order("created_at", { ascending: true });

        if (error) {
          toast.error("Failed to fetch group members");
          return;
        }

        const scheduleData = generateSchedule(groupMembers);
        setSchedule(scheduleData);
      } catch (err) {
        console.error(err);
        toast.error("Unexpected error loading schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user]);

  return (
    <div className="p-6">
      <Card className="shadow-lg border border-gray-100">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle className="text-[#1F5A3D] text-2xl flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#1F5A3D]" />
            Merry-Go-Round Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#1F5A3D]" />
              <span className="ml-2 text-[#1F5A3D] font-medium">Loading schedule...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-green-50">
                  <TableHead className="text-[#1F5A3D] font-semibold">Month</TableHead>
                  <TableHead className="text-[#1F5A3D] font-semibold">Recipient</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.month}</TableCell>
                    <TableCell>{item.member}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupLeaderMerryGo;
