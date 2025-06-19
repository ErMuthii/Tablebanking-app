import React from "react";
import { Outlet } from "react-router-dom";

const MemberDashboard = () => {
  return (
    <div className="pl-80">
      <Outlet />
    </div>
  );
};

export default MemberDashboard;
