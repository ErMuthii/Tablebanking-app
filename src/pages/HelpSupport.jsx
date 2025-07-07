import React from "react";

export default function HelpSupport() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Help & Support</h2>
            <p className="text-sm text-gray-500">
              Reach out to us if you’re experiencing issues or have any questions.
            </p>
          </div>

          <ul className="space-y-4 text-sm text-gray-700 px-2">
            <li>
              <strong className="text-gray-900">Phone:</strong>{" "}
              <span className="text-gray-600">+254 777 777777</span>
            </li>
            <li>
              <strong className="text-gray-900">Email:</strong>{" "}
              <span className="text-gray-600">support@chamapro.co.ke</span>
            </li>
            <li>
              <strong className="text-gray-900">Office Hours:</strong>{" "}
              <span className="text-gray-600">Mon–Fri, 9:00 AM – 5:00 PM</span>
            </li>
          </ul>

          <div className="mt-8 text-center text-sm text-gray-400">
            We aim to respond within 24 hours.
          </div>
        </div>
      </div>
    </div>
  );
}
