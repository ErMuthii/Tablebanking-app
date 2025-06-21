import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSession } from "./hooks/useSession";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

import Layout from "./components/Layout";
import MemberDashboard from "./pages/dashboard/member/MemberDashboard";
import GroupLeaderDashboard from "./pages/dashboard/groupLeader/GroupLeaderDashboard";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";
import Groups from "./pages/dashboard/admin/groups";
import AdminHome from "./pages/dashboard/admin/AdminHome";
import GroupHome from "./pages/dashboard/groupLeader/GroupHome";
import MemberHome from "./pages/dashboard/member/MemberHome";
import Membership from "./pages/dashboard/groupLeader/Membership";
import Loans from "./pages/dashboard/groupLeader/Loans";

export default function App() {
  const { session, role } = useSession();

  // Show a loading spinner while role is being fetched for a logged-in user
  if (session && role === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <BrowserRouter>
        <Routes>
          {/* Public (no session) */}
          {!session ? (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              {/* Redirect anything else back to landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              {/* Once logged in, if you hit `/` go straight to your dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard layout with nested, role-protected routes */}
              <Route path="/dashboard" element={<Layout />}>
                {/* Default `/dashboard` → send to correct subpath */}
                <Route
                  index
                  element={
                    role === "member" ? (
                      <Navigate to="member" replace />
                    ) : role === "group_leader" ? (
                      <Navigate to="leader" replace />
                    ) : role === "admin" ? (
                      <Navigate to="admin" replace />
                    ) : (
                      <div>No role assigned</div>
                    )
                  }
                />

                {/* Member dashboard with nested routes */}
                <Route
                  path="member/*"
                  element={
                    role === "member" ? (
                      <MemberDashboard />
                    ) : (
                      <Navigate to="/dashboard" replace />
                    )
                  }
                >
                  <Route index element={<MemberHome />} />

                  {/* Add more member subpages here */}
                </Route>

                {/* Group leader dashboard with nested routes */}
                <Route
                  path="leader/*"
                  element={
                    role === "group_leader" ? (
                      <GroupLeaderDashboard />
                    ) : (
                      <Navigate to="/dashboard" replace />
                    )
                  }
                >
                  <Route index element={<GroupHome />} />
                  <Route path="membership" element={<Membership />} />
                  <Route path="loans" element={<Loans />} />

                  {/* Add more group leader subpages here */}
                </Route>

                {/* Admin dashboard with nested routes */}
                <Route
                  path="admin/*"
                  element={
                    role === "admin" ? (
                      <AdminDashboard />
                    ) : (
                      <Navigate to="/dashboard" replace />
                    )
                  }
                >
                  <Route index element={<AdminHome />} />
                  <Route path="groups" element={<Groups />} />
                  {/* Add more admin subpages here if needed */}
                </Route>
              </Route>

              {/* Catch-all for any other logged-in URL */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </div>
  );
}
