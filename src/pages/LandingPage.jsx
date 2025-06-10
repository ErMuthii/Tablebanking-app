import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCardIcon,
  ArrowUpIcon,
  FingerPrintIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero */}
      <header className="py-20 px-6 text-center bg-gray-100">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Your Community<br />Financial Platform
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Join thousands of members managing savings, goals, and community
            investments through our secure platform.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Button
              size="lg"
              className="bg-[#1F5A3D] hover:bg-green-800 text-white"
              asChild
            >
              <a href="/login">Member Login</a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-[#1F5A3D] text-[#1F5A3D] hover:bg-green-50"
              asChild
            >
              <a href="/signup">Join TableBank</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="flex-1 py-16 px-6">
        <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Smart Savings */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-green-100 rounded-full">
                <CreditCardIcon className="w-8 h-8 text-[#1F5A3D]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Smart Savings
              </h3>
              <p className="text-gray-500 text-sm">
                Track your shares, deposits, and financial progress with
                intelligent insights.
              </p>
            </CardContent>
          </Card>

          {/* Goal Setting */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-yellow-100 rounded-full">
                <ArrowUpIcon className="w-8 h-8 text-[#D4A664]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Goal Setting
              </h3>
              <p className="text-gray-500 text-sm">
                Set and achieve financial goals with community support and
                tracking.
              </p>
            </CardContent>
          </Card>

          {/* Secure Meetings */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <FingerPrintIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Secure Meetings
              </h3>
              <p className="text-gray-500 text-sm">
                Conduct your group meetings with enhanced security and
                verification.
              </p>
            </CardContent>
          </Card>

          {/* Instant Reports */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-purple-100 rounded-full">
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Instant Reports
              </h3>
              <p className="text-gray-500 text-sm">
                Get real-time insights and reports on your group’s financial
                activities.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 bg-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-[#1F5A3D]">
            <CreditCardIcon className="w-6 h-6" />
            <span className="text-lg font-semibold">TableBank</span>
          </div>
          <p className="mt-4 md:mt-0 text-gray-500 text-sm">
            © 2025 TableBank. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
);
}
