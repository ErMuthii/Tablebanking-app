import React from "react";
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="pl-80">
      <Outlet />
    </div>
  );
};

export default AdminDashboard;
