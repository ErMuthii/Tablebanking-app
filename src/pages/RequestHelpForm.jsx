import React, { useState } from "react";
import { supabase } from "@/SupabaseClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FiUser,
  FiEdit3,
  FiDollarSign,
  FiAlertCircle,
  FiSend,
  FiLoader,
} from "react-icons/fi";
import { toast } from "sonner";

const RequestHelpForm = ({
  onSuccess,
  mode = "member",
  memberList = [],
  defaultValues = {},
}) => {
  const [form, setForm] = useState({
    title: defaultValues.title || "",
    description: defaultValues.description || "",
    amount: defaultValues.amount || "",
    member: defaultValues.member || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value) => {
    setForm({ ...form, member: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.amount ||
      isNaN(form.amount) ||
      Number(form.amount) <= 0
    ) {
      toast.error("Please fill all fields with valid values.");
      return;
    }
    setSubmitting(true);
    let groupMemberId, groupId;
    if (mode === "leader") {
      if (!form.member) {
        toast.error("Please select a member.");
        setSubmitting(false);
        return;
      }
      // member is group_member_id
      groupMemberId = form.member;
      const selected = memberList.find((m) => m.id === form.member);
      groupId = selected ? selected.group_id : null;
    } else {
      // member mode: get current user's group_member_id and group_id
      const { data: user } = await supabase.auth.getUser();
      const { data: groupMember, error: gmError } = await supabase
        .from("group_members")
        .select("id, group_id")
        .eq("member_id", user.user.id)
        .single();
      if (gmError) {
        toast.error("Could not find your group membership.");
        setSubmitting(false);
        return;
      }
      groupMemberId = groupMember.id;
      groupId = groupMember.group_id;
    }
    // Check group approval setting
    const { data: group } = await supabase
      .from("groups")
      .select("welfare_requires_approval")
      .eq("id", groupId)
      .single();
    const status = group?.welfare_requires_approval ? "pending" : "active";
    // Insert request
    const { error } = await supabase.from("welfare_requests").insert({
      requester_id: groupMemberId,
      group_id: groupId,
      title: form.title,
      description: form.description,
      amount_requested: form.amount,
      status,
    });
    if (error) {
      toast.error("Failed to submit request: " + error.message);
    } else {
      toast.success("Welfare request submitted successfully!");
      setForm({ title: "", description: "", amount: "", member: "" });
      if (onSuccess) onSuccess();
    }
    setSubmitting(false);
  };

  // Get initials for member avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get selected member details
  const selectedMember = memberList.find((m) => m.id === form.member);

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Member Selection for Leaders */}
        {mode === "leader" && (
          <Card className="border-l-4 border-l-[#1F5A3D] bg-gradient-to-r from-[#1F5A3D]/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[#1F5A3D]">
                <FiUser className="h-5 w-5" />
                Select Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label
                  htmlFor="member-select"
                  className="text-sm font-medium text-gray-700"
                >
                  Choose the member who needs assistance
                </Label>
                <Select value={form.member} onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full h-12 border-gray-300 focus:border-[#1F5A3D] focus:ring-[#1F5A3D]">
                    <SelectValue placeholder="-- Select a member --" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {memberList.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-3 py-1">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={member.profile_name} />
                            <AvatarFallback className="bg-[#1F5A3D] text-white text-xs">
                              {getInitials(
                                member.profile_name ||
                                  member.name ||
                                  member.email ||
                                  "U"
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {member.profile_name ||
                              member.name ||
                              member.email ||
                              member.id}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected Member Preview */}
                {selectedMember && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={selectedMember.profile_name} />
                        <AvatarFallback className="bg-[#1F5A3D] text-white">
                          {getInitials(selectedMember.profile_name || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedMember.profile_name ||
                            selectedMember.name ||
                            selectedMember.email}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          Selected Member
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request Details */}
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <FiEdit3 className="h-5 w-5" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title Input */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Emergency Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Medical Emergency, Family Crisis"
                value={form.title}
                onChange={handleInputChange}
                required
                maxLength={60}
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                {form.title.length}/60 characters
              </p>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Please describe the emergency situation and why assistance is needed..."
                value={form.description}
                onChange={handleInputChange}
                required
                maxLength={300}
                rows={3}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500">
                {form.description.length}/300 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Amount Request */}
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <FiDollarSign className="h-5 w-5" />
              Financial Assistance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-sm font-medium text-gray-700"
              >
                Amount Requested (KSh)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  KSh
                </span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="0"
                  value={form.amount}
                  onChange={handleInputChange}
                  required
                  className="h-12 pl-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FiAlertCircle className="h-3 w-3" />
                Enter the amount you need for this emergency
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-[#1F5A3D] hover:bg-[#1F5A3D]/90 text-white px-8 py-3 h-auto font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {submitting ? (
              <>
                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FiSend className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>
                  All requests are reviewed by group leadership before
                  activation
                </li>
                <li>Be honest and specific about your emergency situation</li>
                <li>
                  Contributions are voluntary and made by fellow group members
                </li>
                <li>You will be notified once your request is approved</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RequestHelpForm;
