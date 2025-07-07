import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSession } from "./hooks/useSession";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Layout and Dashboards
import Layout from "./components/Layout";
import MemberDashboard from "./pages/dashboard/member/MemberDashboard";
import GroupLeaderDashboard from "./pages/dashboard/groupLeader/GroupLeaderDashboard";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";

// Member Pages
import MemberHome from "./pages/dashboard/member/MemberHome";
import Meetings from "./pages/dashboard/member/Meetings";
import MemberLoans from "./pages/dashboard/member/MemberLoans";
import MemberMerryGo from "./pages/dashboard/member/MemberMerryGo";
import MyContributions from "./pages/dashboard/member/MemberContributions";
import WelfareFund from "./pages/dashboard/member/MemberWelfareFund";
import GroupInfo from "./pages/dashboard/member/GroupInfo";

// Group Leader Pages
import GroupHome from "./pages/dashboard/groupLeader/GroupHome";
import Membership from "./pages/dashboard/groupLeader/Membership";
import GroupLeaderLoans from "./pages/dashboard/groupLeader/GroupLeaderLoans";
import GroupLeaderMerryGo from "./pages/dashboard/groupLeader/GroupLeaderMerryGo";
import GroupLeaderContributions from "./pages/dashboard/groupLeader/GroupLeaderContributions";
import AttendancePage from "./pages/dashboard/groupLeader/Attendance";
import GroupLeaderMeetings from "./pages/dashboard/groupLeader/GroupLeaderMeetings";
import GroupLeaderWelfareFund from "./pages/dashboard/groupLeader/GroupLeaderWelfareFund";
import GroupReports from "./pages/dashboard/groupLeader/GroupReports";

// Admin Pages
import AdminHome from "./pages/dashboard/admin/AdminHome";
import Groups from "./pages/dashboard/admin/groups";

// Universal Page
import EditProfile from "./pages/EditProfile"; 
import HelpSupport from "./pages/HelpSupport";
import OAuthCallback from "./pages/OAuthCallback";


export default function App() {
  const { session, role } = useSession();

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
          {!session ? (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Layout />}>
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

                {/* 🔹 Member Dashboard Routes */}
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
                  <Route path="meetings" element={<Meetings />} />
                  <Route path="loans" element={<MemberLoans />} />
                  <Route path="merrygo" element={<MemberMerryGo />} />
                  <Route path="contributions" element={<MyContributions />} />
                  <Route path="welfare" element={<WelfareFund />} />
                  <Route path="group-info" element={<GroupInfo />} />
                  <Route path="help" element={<HelpSupport />} />
                </Route>

                {/* 🔹 Group Leader Dashboard Routes */}
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
                  <Route path="loans" element={<GroupLeaderLoans />} />
                  <Route path="attendance" element={<AttendancePage />} />
                  <Route path="meetings" element={<GroupLeaderMeetings />} />
                  <Route path="contributions" element={<GroupLeaderContributions />} />
                  <Route path="merrygo" element={<GroupLeaderMerryGo />} />
                  <Route path="welfare" element={<GroupLeaderWelfareFund />} />
                  <Route path="reports" element={<GroupReports />} />
                </Route>

                {/* 🔹 Admin Dashboard Routes */}
                {role === "admin" && (
                  <Route path="admin/*" element={<AdminDashboard />}>
                    <Route index element={<AdminHome />} />
                    <Route path="groups" element={<Groups />} />
                  </Route>
                )}
              </Route>

              {/* ✅ Universal Profile Route */}
              <Route path="/Edit" element={<EditProfile />} />
              <Route path="/help" element={<HelpSupport />} />
              

              <Route path="/oauth-callback" element={<OAuthCallback />} />
              



              {/* Redirect any unmatched routes to the dashboard */}

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </div>
  );
}
