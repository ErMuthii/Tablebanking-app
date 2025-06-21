import React from "react";

export default function ProfileSettings() {
  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
      <p className="text-sm text-muted-foreground">
        Update your name, contact details, and preferences here.
      </p>
      {/* You can add more input fields as needed */}
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            placeholder="e.g. John Mwangi"
            className="w-full border p-2 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            placeholder="e.g. 0712 345678"
            className="w-full border p-2 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="e.g. john@example.com"
            className="w-full border p-2 rounded-md"
          />
        </div>
        <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
