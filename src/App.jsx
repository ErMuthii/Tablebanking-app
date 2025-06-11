
import { BrowserRouter,Routes,Route } from "react-router-dom"
import Login from "./pages/Login"
import LandingPage from "./pages/LandingPage"
import SignUp from "./pages/SignUp"
import AdminDashboard from "./pages/AdminDashboard"
import GroupLeaderDashboard from "./pages/GroupLeaderDashboard"
import MemberDashboard from "./pages/MemberDashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboards/admin" element={<AdminDashboard />} />
        <Route path="/dashboards/group-leader" element={<GroupLeaderDashboard />} />
        <Route path="/dashboards/member" element={<MemberDashboard />} />
       
      </Routes>

    </BrowserRouter>
   
  )
}

export default App
