import {
  HomeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  HeartIcon,
  UsersIcon,
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export const sidebarConfig = {
member: [
  { label: "Home", path: "/dashboard/member", icon: HomeIcon },
  {
    label: "My Contributions",
    path: "/dashboard/member/contributions",
    icon: CurrencyDollarIcon,
  },
  {
    label: "Loans",
    path: "/dashboard/member/loans",
    icon: CurrencyDollarIcon,
  },
  {
    label: "Merry-Go-Round",
    path: "/dashboard/member/merrygo",
    icon: ArrowPathIcon,
  },
  {
    label: "Welfare Fund",
    path: "/dashboard/member/welfare",
    icon: HeartIcon,
  },
  {
    label: "Meetings",
    path: "/dashboard/member/meetings",
    icon: CalendarDaysIcon,
  },
  {
    label: "Group Info",
    path: "/dashboard/member/group-info",
    icon: UsersIcon,
  },
],

  group_leader: [
    // start with everything a member sees…
    ...[
      { label: "Home", path: "/dashboard/leader", icon: HomeIcon },
      {
        label: "Meetings",
        path: "/dashboard/leader/meetings",
        icon: CalendarDaysIcon,
      },
      {
        label: "Loans",
        path: "/dashboard/leader/loans",
        icon: CurrencyDollarIcon,
      },
      {
        label: "MerryGoRound",
        path: "/dashboard/leader/merrygo",
        icon: ArrowPathIcon,
      },
      { label: "Welfare", path: "/dashboard/leader/welfare", icon: HeartIcon },
    ],
    // …plus leader-only links
    {
      label: "Membership",
      path: "/dashboard/leader/membership",
      icon: UsersIcon,
    },
    { label: "Reports", path: "/dashboard/leader/reports", icon: ChartBarIcon },
  ],

  admin: [
    { label: "Home", path: "/dashboard/admin", icon: HomeIcon },
    {
      label: "Manage Groups",
      path: "/dashboard/admin/groups",
      icon: UserGroupIcon,
    },
    { label: "Reports", path: "/dashboard/admin/reports", icon: ChartBarIcon },
  ],
};
