import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Input } from "./input";
import { Button } from "./button";
import { supabase } from "@/SupabaseClient";
import { toast } from "sonner";

const RepaymentDialog = ({ open, onOpenChange, loan, onSuccess, userRole }) => {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("principal");
  const [loading, setLoading] = useState(false);

  if (!loan) return null;

  const handleRepay = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Enter a valid repayment amount.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("loan_payments").insert({
      loan_id: loan.id,
      amount: Number(amount),
      type,
      payment_date: new Date().toISOString().slice(0, 10),
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to record repayment.");
    } else {
      toast.success("Repayment recorded.");
      setAmount("");
      if (onSuccess) onSuccess();
      if (onOpenChange) onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle>
            {userRole === "leader" ? "Record Repayment" : "Repay Loan"}
          </DialogTitle>
        </DialogHeader>
        <div className="mb-2 text-sm text-gray-700">
          <div>
            <b>Loan Amount:</b> KES {Number(loan.amount).toLocaleString()}
          </div>
          <div>
            <b>Status:</b> {loan.status}
          </div>
        </div>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">
            Amount to Repay
          </label>
          <Input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="h-9 text-sm"
          />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded h-9 text-sm px-2"
          >
            <option value="principal">Principal</option>
            <option value="interest">Interest</option>
          </select>
        </div>
        <Button
          onClick={handleRepay}
          disabled={loading}
          className="w-full bg-[#1F5A3D] text-white font-semibold"
        >
          {loading
            ? "Processing..."
            : userRole === "leader"
            ? "Record Repayment"
            : "Repay"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RepaymentDialog;
