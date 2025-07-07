import {
  FiHome,
  FiUsers,
  FiClipboard,
  FiTrendingUp,
  FiDollarSign,
  FiSettings,
  FiHelpCircle,
  FiCheckSquare,
  FiCalendar,
  FiBarChart2,
  FiInfo,
  FiHeart,
} from "react-icons/fi";

export const sidebarConfig = {
  member: [
    { title: "Home", path: "/dashboard/member", icon: FiHome },
    {
      title: "Meetings",
      path: "/dashboard/member/meetings",
      icon: FiCalendar,
    },
    { title: "Loans", path: "/dashboard/member/loans", icon: FiDollarSign },
    {
      title: "Merry-Go-Round",
      path: "/dashboard/member/merrygo",
      icon: FiClipboard,
    },
    {
      title: "My Contributions",
      path: "/dashboard/member/contributions",
      icon: FiTrendingUp,
    },
    {
      title: "Welfare Fund",
      path: "/dashboard/member/welfare",
      icon: FiHeart,
    },
    {
      title: "Group Information",
      path: "/dashboard/member/group-info",
      icon: FiInfo,
    },
    {
      title: "Profile Settings",
      path: "/dashboard/member/profile",
      icon: FiSettings,
      group: "account",
    },
    {
      title: "Help & Support",
      path: "/dashboard/member/help",
      icon: FiHelpCircle,
      group: "account",
    },
  ],
  group_leader: [
    { title: "Home", path: "/dashboard/leader", icon: FiHome },

    { title: "Meetings", path: "/dashboard/leader/meetings", icon: FiCalendar },
    { title: "Loans", path: "/dashboard/leader/loans", icon: FiDollarSign },

    {
      title: "Merry-Go-Round",
      path: "/dashboard/leader/merrygo",
      icon: FiClipboard,
    },
    {
      title: "Contributions",
      path: "/dashboard/leader/contributions",
      icon: FiTrendingUp,
    },
    {
      title: "Welfare Fund",
      path: "/dashboard/leader/welfare",
      icon: FiHeart,
    },
    {
      title: "Attendance",
      path: "/dashboard/leader/attendance",
      icon: FiCheckSquare,
    },
    {
      title: "Membership",
      path: "/dashboard/leader/membership",
      icon: FiUsers,
    },
    { title: "Reports", path: "/dashboard/leader/reports", icon: FiBarChart2 },
    
  ],
  admin: [
    { title: "Home", path: "/dashboard/admin", icon: FiHome },
    { title: "Groups", path: "/dashboard/admin/groups", icon: FiUsers },
    // { title: "Reports", path: "/dashboard/admin/reports", icon: FiBarChart2 },
  ],
};
