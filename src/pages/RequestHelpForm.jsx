import React, { useState } from "react";
import { supabase } from "@/SupabaseClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
      toast.success("Welfare request submitted!");
      setForm({ title: "", description: "", amount: "", member: "" });
      if (onSuccess) onSuccess();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "leader" && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Member
          </label>
          <select
            name="member"
            value={form.member}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">-- Select --</option>
            {memberList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.profile_name || m.name || m.email || m.id}
              </option>
            ))}
          </select>
        </div>
      )}
      <Input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleInputChange}
        required
        maxLength={60}
      />
      <Textarea
        name="description"
        placeholder="Describe your emergency..."
        value={form.description}
        onChange={handleInputChange}
        required
        maxLength={300}
      />
      <Input
        name="amount"
        type="number"
        min="1"
        step="any"
        placeholder="Amount Requested (KSh)"
        value={form.amount}
        onChange={handleInputChange}
        required
      />
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );
};

export default RequestHelpForm;
