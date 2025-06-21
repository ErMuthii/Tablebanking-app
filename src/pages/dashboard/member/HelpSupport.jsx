import React from "react";

export default function HelpSupport() {
  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-4">Help & Support</h2>
      <p className="text-muted-foreground text-sm">
        Reach out to us if you’re experiencing issues or have questions.
      </p>

      <ul className="space-y-2 text-sm">
        <li><strong>Phone:</strong> +254 712 345678</li>
        <li><strong>Email:</strong> support@tablebank.co.ke</li>
        <li><strong>Office Hours:</strong> Mon–Fri, 9:00 AM to 5:00 PM</li>
      </ul>
    </div>
  );
}
