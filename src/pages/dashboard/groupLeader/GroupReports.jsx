import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  FiBarChart2,
  FiDollarSign,
  FiCreditCard,
  FiUserCheck,
  FiTrendingUp,
  FiCalendar,
  FiFileText,
} from "react-icons/fi";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { supabase } from "@/SupabaseClient";

const REPORT_TYPES = [
  {
    key: "financial_summary",
    icon: <FiBarChart2 className="w-6 h-6 text-blue-600" />,
    title: "Financial Summary Report",
    desc: "Overview of group finances, contributions, and loans",
  },
  {
    key: "member_contributions",
    icon: <FiUserCheck className="w-6 h-6 text-green-600" />,
    title: "Member Contributions Analysis",
    desc: "Individual member contribution patterns and statistics",
  },
  {
    key: "loan_performance",
    icon: <FiCreditCard className="w-6 h-6 text-orange-600" />,
    title: "Loan Performance Report",
    desc: "Active loans, repayment status, and default analysis",
  },
  {
    key: "savings_growth",
    icon: <FiTrendingUp className="w-6 h-6 text-purple-600" />,
    title: "Savings Growth Analysis",
    desc: "Track group savings growth over time",
  },
  {
    key: "attendance",
    icon: <FiCalendar className="w-6 h-6 text-pink-600" />,
    title: "Meeting Attendance Report",
    desc: "Attendance trends and member participation",
  },
];

const MIN_DATE = "2024-08-01";
const today = new Date();
const nextMonth = new Date(
  today.getFullYear(),
  today.getMonth() + 1,
  today.getDate()
);

function formatDateInput(date) {
  return date.toISOString().split("T")[0];
}

// PDF component for Financial Summary
const pdfStyles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 18, marginBottom: 10, fontWeight: "bold" },
  date: { fontSize: 12, marginBottom: 10 },
  table: { display: "table", width: "auto", marginVertical: 10 },
  row: { flexDirection: "row" },
  cell: { width: "60%", border: "1pt solid #eee", padding: 6, fontSize: 12 },
  value: {
    width: "40%",
    border: "1pt solid #eee",
    padding: 6,
    fontSize: 12,
    textAlign: "right",
  },
});

const FinancialSummaryPDF = ({ summaryData, dateFrom, dateTo }) => (
  <Document>
    <Page style={pdfStyles.page}>
      <Text style={pdfStyles.title}>Financial Summary Report</Text>
      <Text style={pdfStyles.date}>
        Date Range: {dateFrom} to {dateTo}
      </Text>
      <View style={pdfStyles.table}>
        {summaryData.map((row, i) => (
          <View style={pdfStyles.row} key={i}>
            <Text style={pdfStyles.cell}>{row.label}</Text>
            <Text style={pdfStyles.value}>{row.value.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const MemberContributionsPDF = ({ data, dateFrom, dateTo }) => (
  <Document>
    <Page style={pdfStyles.page}>
      <Text style={pdfStyles.title}>Member Contributions Analysis</Text>
      <Text style={pdfStyles.date}>
        Date Range: {dateFrom} to {dateTo}
      </Text>
      <View style={pdfStyles.table}>
        <View style={[pdfStyles.row, pdfStyles.header]}>
          <Text style={pdfStyles.cell}>Member</Text>
          <Text style={pdfStyles.cell}>Total Contributed</Text>
          <Text style={pdfStyles.cell}># Contributions</Text>
          <Text style={pdfStyles.cell}>Average</Text>
        </View>
        {data.map((row, i) => (
          <View style={pdfStyles.row} key={i}>
            <Text style={pdfStyles.cell}>{row.member}</Text>
            <Text style={pdfStyles.cell}>{row.total.toLocaleString()}</Text>
            <Text style={pdfStyles.cell}>{row.count}</Text>
            <Text style={pdfStyles.cell}>{row.avg.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const LoanPerformancePDF = ({ data, dateFrom, dateTo }) => (
  <Document>
    <Page style={pdfStyles.page}>
      <Text style={pdfStyles.title}>Loan Performance Report</Text>
      <Text style={pdfStyles.date}>
        Date Range: {dateFrom} to {dateTo}
      </Text>
      <View style={pdfStyles.table}>
        <View style={[pdfStyles.row, pdfStyles.header]}>
          <Text style={pdfStyles.cell}>Member</Text>
          <Text style={pdfStyles.cell}>Amount</Text>
          <Text style={pdfStyles.cell}>Status</Text>
          <Text style={pdfStyles.cell}>Issued</Text>
          <Text style={pdfStyles.cell}>Outstanding</Text>
        </View>
        {data.map((row, i) => (
          <View style={pdfStyles.row} key={i}>
            <Text style={pdfStyles.cell}>{row.member}</Text>
            <Text style={pdfStyles.cell}>{row.amount.toLocaleString()}</Text>
            <Text style={pdfStyles.cell}>{row.status}</Text>
            <Text style={pdfStyles.cell}>{row.issued}</Text>
            <Text style={pdfStyles.cell}>
              {row.outstanding.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const SavingsGrowthPDF = ({ data, dateFrom, dateTo }) => (
  <Document>
    <Page style={pdfStyles.page}>
      <Text style={pdfStyles.title}>Savings Growth Analysis</Text>
      <Text style={pdfStyles.date}>
        Date Range: {dateFrom} to {dateTo}
      </Text>
      <View style={pdfStyles.table}>
        <View style={[pdfStyles.row, pdfStyles.header]}>
          <Text style={pdfStyles.cell}>Month</Text>
          <Text style={pdfStyles.cell}>Total Contributed</Text>
        </View>
        {data.map((row, i) => (
          <View style={pdfStyles.row} key={i}>
            <Text style={pdfStyles.cell}>{row.month}</Text>
            <Text style={pdfStyles.cell}>{row.total.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const AttendancePDF = ({ data, dateFrom, dateTo }) => (
  <Document>
    <Page style={pdfStyles.page}>
      <Text style={pdfStyles.title}>Meeting Attendance Report</Text>
      <Text style={pdfStyles.date}>
        Date Range: {dateFrom} to {dateTo}
      </Text>
      <View style={pdfStyles.table}>
        <View style={[pdfStyles.row, pdfStyles.header]}>
          <Text style={pdfStyles.cell}>Meeting Date</Text>
          <Text style={pdfStyles.cell}>Present</Text>
          <Text style={pdfStyles.cell}>Absent</Text>
        </View>
        {data.map((row, i) => (
          <View style={pdfStyles.row} key={i}>
            <Text style={pdfStyles.cell}>{row.date}</Text>
            <Text style={pdfStyles.cell}>{row.present}</Text>
            <Text style={pdfStyles.cell}>{row.absent}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const GroupReports = () => {
  const [selectedType, setSelectedType] = useState(REPORT_TYPES[0].key);
  const [dateFrom, setDateFrom] = useState(MIN_DATE);
  const [dateTo, setDateTo] = useState(formatDateInput(nextMonth));
  const [summaryData, setSummaryData] = useState([
    { label: "Total Contributions", value: 0 },
    { label: "Total Loans Issued", value: 0 },
    { label: "Outstanding Loan Balance", value: 0 },
  ]);
  const [memberContribData, setMemberContribData] = useState([]);
  const [loanPerfData, setLoanPerfData] = useState([]);
  const [savingsGrowthData, setSavingsGrowthData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef();

  const handleCardClick = (key) => setSelectedType(key);

  // Fetch group and member IDs
  const [groupId, setGroupId] = useState(null);
  const [memberIds, setMemberIds] = useState([]);
  useEffect(() => {
    const fetchGroup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: groupMember } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("member_id", user.id)
        .maybeSingle();
      if (!groupMember?.group_id) return;
      setGroupId(groupMember.group_id);
      const { data: members } = await supabase
        .from("group_members")
        .select("id, profiles(full_name)")
        .eq("group_id", groupMember.group_id);
      setMemberIds((members || []).map((m) => m.id));
    };
    fetchGroup();
  }, []);

  // Financial Summary
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!groupId || memberIds.length === 0) return;
        // Contributions
        const { data: contributions } = await supabase
          .from("contributions")
          .select("amount, date_contributed, group_member_id")
          .in("group_member_id", memberIds)
          .gte("date_contributed", dateFrom)
          .lte("date_contributed", dateTo);
        // Loans
        const { data: loans } = await supabase
          .from("loans")
          .select("amount, status, group_member_id, requested_at")
          .in("group_member_id", memberIds)
          .gte("requested_at", dateFrom)
          .lte("requested_at", dateTo);
        const totalContributions = (contributions || []).reduce(
          (sum, c) => sum + Number(c.amount),
          0
        );
        const totalLoansIssued = (loans || []).reduce(
          (sum, l) => sum + Number(l.amount),
          0
        );
        const outstandingLoanBalance = (loans || [])
          .filter((l) => l.status === "approved")
          .reduce((sum, l) => sum + Number(l.amount), 0);
        setSummaryData([
          { label: "Total Contributions", value: totalContributions },
          { label: "Total Loans Issued", value: totalLoansIssued },
          { label: "Outstanding Loan Balance", value: outstandingLoanBalance },
        ]);
      } catch (err) {
        setError(err.message || "Failed to load report data");
      }
      setLoading(false);
    };
    if (selectedType === "financial_summary" && groupId && memberIds.length > 0)
      fetchData();
  }, [dateFrom, dateTo, selectedType, groupId, memberIds]);

  // Member Contributions Analysis
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!groupId || memberIds.length === 0) return;
        const { data: members } = await supabase
          .from("group_members")
          .select("id, profiles(full_name)")
          .eq("group_id", groupId);
        const { data: contributions } = await supabase
          .from("contributions")
          .select("amount, group_member_id")
          .in("group_member_id", memberIds)
          .gte("date_contributed", dateFrom)
          .lte("date_contributed", dateTo);
        // Group by member
        const memberMap = {};
        (members || []).forEach((m) => {
          memberMap[m.id] = {
            member: m.profiles?.full_name || "Unknown",
            total: 0,
            count: 0,
          };
        });
        (contributions || []).forEach((c) => {
          if (memberMap[c.group_member_id]) {
            memberMap[c.group_member_id].total += Number(c.amount);
            memberMap[c.group_member_id].count += 1;
          }
        });
        const data = Object.values(memberMap).map((m) => ({
          ...m,
          avg: m.count > 0 ? Math.round(m.total / m.count) : 0,
        }));
        setMemberContribData(data);
      } catch (err) {
        setError(err.message || "Failed to load report data");
      }
      setLoading(false);
    };
    if (
      selectedType === "member_contributions" &&
      groupId &&
      memberIds.length > 0
    )
      fetchData();
  }, [dateFrom, dateTo, selectedType, groupId, memberIds]);

  // Loan Performance Report
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!groupId || memberIds.length === 0) return;
        const { data: members } = await supabase
          .from("group_members")
          .select("id, profiles(full_name)")
          .eq("group_id", groupId);
        const { data: loans } = await supabase
          .from("loans")
          .select("id, amount, status, group_member_id, requested_at")
          .in("group_member_id", memberIds)
          .gte("requested_at", dateFrom)
          .lte("requested_at", dateTo);
        const memberMap = {};
        (members || []).forEach((m) => {
          memberMap[m.id] = m.profiles?.full_name || "Unknown";
        });
        // For each loan, fetch repayments and calculate outstanding
        const data = [];
        for (const l of loans || []) {
          const { data: repayments } = await supabase
            .from("loan_payments")
            .select("amount")
            .eq("loan_id", l.id);
          const totalRepaid = (repayments || []).reduce(
            (sum, r) => sum + Number(r.amount),
            0
          );
          data.push({
            member: memberMap[l.group_member_id] || "Unknown",
            amount: Number(l.amount),
            status: l.status,
            issued: l.requested_at ? l.requested_at.split("T")[0] : "",
            outstanding: Number(l.amount) - totalRepaid,
          });
        }
        setLoanPerfData(data);
      } catch (err) {
        setError(err.message || "Failed to load report data");
      }
      setLoading(false);
    };
    if (selectedType === "loan_performance" && groupId && memberIds.length > 0)
      fetchData();
  }, [dateFrom, dateTo, selectedType, groupId, memberIds]);

  // Savings Growth Analysis
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!groupId || memberIds.length === 0) return;
        const { data: contributions } = await supabase
          .from("contributions")
          .select("amount, date_contributed, group_member_id")
          .in("group_member_id", memberIds)
          .gte("date_contributed", dateFrom)
          .lte("date_contributed", dateTo);
        // Group by month
        const monthMap = {};
        (contributions || []).forEach((c) => {
          const month = c.date_contributed?.slice(0, 7); // YYYY-MM
          if (!monthMap[month]) monthMap[month] = 0;
          monthMap[month] += Number(c.amount);
        });
        const data = Object.entries(monthMap).map(([month, total]) => ({
          month,
          total,
        }));
        setSavingsGrowthData(data);
      } catch (err) {
        setError(err.message || "Failed to load report data");
      }
      setLoading(false);
    };
    if (selectedType === "savings_growth" && groupId && memberIds.length > 0)
      fetchData();
  }, [dateFrom, dateTo, selectedType, groupId, memberIds]);

  // Meeting Attendance Report
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!groupId) return;
        const { data: meetings } = await supabase
          .from("meetings")
          .select("id, meeting_date")
          .eq("group_id", groupId)
          .gte("meeting_date", dateFrom)
          .lte("meeting_date", dateTo);
        const meetingIds = (meetings || []).map((m) => m.id);
        const { data: attendance } = await supabase
          .from("attendance")
          .select("meeting_id, status")
          .in("meeting_id", meetingIds);
        // For each meeting, count present/absent
        const data = (meetings || []).map((m) => {
          const records = (attendance || []).filter(
            (a) => a.meeting_id === m.id
          );
          const present = records.filter((a) => a.status === "present").length;
          const absent = records.filter((a) => a.status === "absent").length;
          return {
            date: m.meeting_date ? m.meeting_date.split("T")[0] : "",
            present,
            absent,
          };
        });
        setAttendanceData(data);
      } catch (err) {
        setError(err.message || "Failed to load report data");
      }
      setLoading(false);
    };
    if (selectedType === "attendance" && groupId) fetchData();
  }, [dateFrom, dateTo, selectedType, groupId]);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Reports Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Generate comprehensive reports for your table banking group
          </p>
        </div>

        {/* Generate New Report */}
        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="mb-4 font-semibold text-lg flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-gray-700" /> Generate New
              Report
            </div>
            <p className="text-gray-500 mb-4 text-sm">
              Select report type and date range to generate detailed analytics
              for your group
            </p>
            <form className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {REPORT_TYPES.map((rt) => (
                    <option key={rt.key} value={rt.key}>
                      {rt.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col md:flex-row gap-2 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    className="border rounded-md px-3 py-2 w-full"
                    value={dateFrom}
                    min={MIN_DATE}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    className="border rounded-md px-3 py-2 w-full"
                    value={dateTo}
                    min={MIN_DATE}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Financial Summary Report */}
        {selectedType === "financial_summary" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mt-6">
              <h2 className="text-xl font-bold text-gray-900">
                Financial Summary Report
              </h2>
              <PDFDownloadLink
                document={
                  <FinancialSummaryPDF
                    summaryData={summaryData}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                  />
                }
                fileName="financial-summary.pdf"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-semibold"
              >
                {({ loading }) =>
                  loading ? "Generating PDF..." : "Download PDF"
                }
              </PDFDownloadLink>
            </div>
            <div ref={reportRef} className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading report...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <>
                  <table className="w-full text-left border-t border-b">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Metric
                        </th>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Value (KSh)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2 px-4 text-gray-800">
                            {row.label}
                          </td>
                          <td className="py-2 px-4 text-gray-900 font-bold">
                            {row.value.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-sm text-gray-500 mt-4">
                    Date Range: {dateFrom} to {dateTo}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Member Contributions Analysis */}
        {selectedType === "member_contributions" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mt-6">
              <h2 className="text-xl font-bold text-gray-900">
                Member Contributions Analysis
              </h2>
              <PDFDownloadLink
                document={
                  <MemberContributionsPDF
                    data={memberContribData}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                  />
                }
                fileName="member-contributions.pdf"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-semibold"
              >
                {({ loading }) =>
                  loading ? "Generating PDF..." : "Download PDF"
                }
              </PDFDownloadLink>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading report...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <>
                  <table className="w-full text-left border-t border-b">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Member
                        </th>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Total Contributed
                        </th>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Contributions
                        </th>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Average
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberContribData.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2 px-4 text-gray-800">
                            {row.member}
                          </td>
                          <td className="py-2 px-4 text-gray-900 font-bold">
                            {row.total.toLocaleString()}
                          </td>
                          <td className="py-2 px-4 text-gray-900">
                            {row.count}
                          </td>
                          <td className="py-2 px-4 text-gray-900">
                            {row.avg.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-sm text-gray-500 mt-4">
                    Date Range: {dateFrom} to {dateTo}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Loan Performance Report */}
        {selectedType === "loan_performance" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mt-6">
              <h2 className="text-xl font-bold text-gray-900">
                Loan Performance Report
              </h2>
              <PDFDownloadLink
                document={
                  <LoanPerformancePDF
                    data={loanPerfData}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                  />
                }
                fileName="loan-performance.pdf"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-semibold"
              >
                {({ loading }) =>
                  loading ? "Generating PDF..." : "Download PDF"
                }
              </PDFDownloadLink>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading report...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <>
                  <table className="w-full text-left border-t border-b">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Member
                        </th>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Issued
                        </th>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Outstanding
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanPerfData.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2 px-4 text-gray-800">
                            {row.member}
                          </td>
                          <td className="py-2 px-4 text-gray-900 font-bold">
                            {row.amount.toLocaleString()}
                          </td>
                          <td className="py-2 px-4 text-gray-900">
                            {row.status}
                          </td>
                          <td className="py-2 px-4 text-gray-900">
                            {row.issued}
                          </td>
                          <td className="py-2 px-4 text-gray-900">
                            {row.outstanding.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-sm text-gray-500 mt-4">
                    Date Range: {dateFrom} to {dateTo}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Savings Growth Analysis */}
        {selectedType === "savings_growth" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mt-6">
              <h2 className="text-xl font-bold text-gray-900">
                Savings Growth Analysis
              </h2>
              <PDFDownloadLink
                document={
                  <SavingsGrowthPDF
                    data={savingsGrowthData}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                  />
                }
                fileName="savings-growth.pdf"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-semibold"
              >
                {({ loading }) =>
                  loading ? "Generating PDF..." : "Download PDF"
                }
              </PDFDownloadLink>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading report...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <>
                  <table className="w-full text-left border-t border-b">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Month
                        </th>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Total Contributed
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {savingsGrowthData.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2 px-4 text-gray-800">
                            {row.month}
                          </td>
                          <td className="py-2 px-4 text-gray-900 font-bold">
                            {row.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-sm text-gray-500 mt-4">
                    Date Range: {dateFrom} to {dateTo}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Meeting Attendance Report */}
        {selectedType === "attendance" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mt-6">
              <h2 className="text-xl font-bold text-gray-900">
                Meeting Attendance Report
              </h2>
              <PDFDownloadLink
                document={
                  <AttendancePDF
                    data={attendanceData}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                  />
                }
                fileName="attendance.pdf"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-semibold"
              >
                {({ loading }) =>
                  loading ? "Generating PDF..." : "Download PDF"
                }
              </PDFDownloadLink>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading report...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <>
                  <table className="w-full text-left border-t border-b">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Meeting Date
                        </th>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Present
                        </th>
                        <th className="py-2 px-4 font-semibold text-gray-700">
                          Absent
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2 px-4 text-gray-800">
                            {row.date}
                          </td>
                          <td className="py-2 px-4 text-gray-900 font-bold">
                            {row.present}
                          </td>
                          <td className="py-2 px-4 text-gray-900 font-bold">
                            {row.absent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-sm text-gray-500 mt-4">
                    Date Range: {dateFrom} to {dateTo}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Available Report Types */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Available Report Types
          </h2>
          <p className="text-gray-600 mb-5">
            Choose from various pre-built report templates
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {REPORT_TYPES.map((rt) => (
              <Card
                key={rt.key}
                className={`cursor-pointer transition-all border-2 ${
                  selectedType === rt.key
                    ? "border-[#1F5A3D] shadow-lg"
                    : "border-transparent hover:border-emerald-300"
                } group`}
                onClick={() => handleCardClick(rt.key)}
              >
                <CardContent className="p-5 flex flex-col gap-3 h-full">
                  <div className="flex items-center gap-3">
                    {rt.icon}
                    <span className="font-semibold text-gray-900 text-lg">
                      {rt.title}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm flex-1">{rt.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupReports;
