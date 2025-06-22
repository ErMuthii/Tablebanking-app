import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const dummyRequests = [
  { id: 1, amount: 5000, reason: "Medical bills", status: "Approved" },
  { id: 2, amount: 3000, reason: "Car accident", status: "Pending" },
];

export default function WelfareFund() {
  const [formData, setFormData] = useState({ amount: "", reason: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send formData to Supabase
    alert("Request submitted!");
    setFormData({ amount: "", reason: "" });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Welfare Fund</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Apply for Emergency Loan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md w-full bg-white backdrop-blur-lg rounded-xl p-6 shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                New Emergency Loan Request
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium mb-1"
                >
                  Amount (KES)
                </label>
                <Input
                  id="amount"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium mb-1"
                >
                  Reason
                </label>
                <Textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Describe the emergency"
                  className="resize-none"
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-2">
                Submit Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 max-h-[400px] overflow-y-auto pr-2">
        {dummyRequests.map((req) => (
          <Card key={req.id} className="shadow-sm border rounded-md">
            <CardContent className="p-4 space-y-2 text-sm">
              <p>
                <strong>Amount:</strong> KES {req.amount}
              </p>
              <p>
                <strong>Reason:</strong> {req.reason}
              </p>
              <Badge
                variant={
                  req.status === "Approved"
                    ? "success"
                    : req.status === "Rejected"
                    ? "destructive"
                    : "outline"
                }
              >
                {req.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
