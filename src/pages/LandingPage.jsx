import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BanknotesIcon,
  UserGroupIcon,
  ChartPieIcon,
  PlayCircleIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";

export default function LandingPage() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    toast.success("We’ll keep you posted with product updates!");
    setEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-green-50 text-gray-800">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-green-700 text-lg">
            <BanknotesIcon className="w-6 h-6" /> TableBank
          </Link>
          <nav className="hidden md:flex gap-6 text-sm">
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="hover:underline">Register</Link>
            <a href="#features" className="hover:underline">Features</a>
            <a href="#how-it-works" className="hover:underline">How it Works</a>
          </nav>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="md:hidden">
                <Bars3Icon className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-6 space-y-4">
              <Link to="/login">Login</Link>
              <Link to="/signup">Register</Link>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-green-800 text-white py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-green-900 to-green-600 opacity-80" />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <h1 className="text-5xl font-extrabold leading-tight">Empower Your Group With Table Banking</h1>
          <p className="mt-6 text-green-100 text-lg max-w-xl mx-auto">A smarter, transparent, and secure way to manage group savings, loans, and growth.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-green-800 font-semibold hover:bg-green-100 shadow" asChild>
              <Link to="/signup">Get Started <ChevronRightIcon className="w-5 h-5 ml-1" /></Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  <PlayCircleIcon className="w-5 h-5 mr-1" /> See How It Works
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 overflow-hidden">
                <iframe
                  title="Intro Video"
                  src="https://www.youtube.com/embed/VIDEO_ID"
                  className="w-full aspect-video"
                  allow="autoplay; encrypted-media"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-green-900 text-center mb-10">
            Why TableBank Stands Out
          </h2>
          <Tabs defaultValue="save">
            <TabsList className="mb-8 flex justify-center gap-4">
              <TabsTrigger value="save">Save</TabsTrigger>
              <TabsTrigger value="borrow">Borrow</TabsTrigger>
              <TabsTrigger value="grow">Grow</TabsTrigger>
            </TabsList>
            <TabsContent value="save">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-green-50 hover:bg-green-100 transition shadow-md">
                  <CardContent className="p-8">
                    <UserGroupIcon className="w-10 h-10 text-green-700 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Collective Deposits</h3>
                    <p className="text-gray-700">Track member contributions with full transparency.</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 hover:bg-green-100 transition shadow-md">
                  <CardContent className="p-8">
                    <ShieldCheckIcon className="w-10 h-10 text-green-700 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Secure & Verifiable</h3>
                    <p className="text-gray-700">Backed by Supabase with real-time updates and encryption.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="borrow">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-green-50 hover:bg-green-100 transition shadow-md">
                  <CardContent className="p-8">
                    <BanknotesIcon className="w-10 h-10 text-green-700 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Instant Loans</h3>
                    <p className="text-gray-700">No paperwork—members apply and receive funds instantly.</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 hover:bg-green-100 transition shadow-md">
                  <CardContent className="p-8">
                    <ChartPieIcon className="w-10 h-10 text-green-700 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Transparent Tracking</h3>
                    <p className="text-gray-700">Follow repayments, interest, and balances in real time.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="grow">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-green-50 hover:bg-green-100 transition shadow-md">
                  <CardContent className="p-8">
                    <ChartPieIcon className="w-10 h-10 text-green-700 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Group Insights</h3>
                    <p className="text-gray-700">Visualize progress, analyze impact, and export reports.</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 hover:bg-green-100 transition shadow-md">
                  <CardContent className="p-8">
                    <UserGroupIcon className="w-10 h-10 text-green-700 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Community Network</h3>
                    <p className="text-gray-700">Connect with similar groups and funding partners.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-green-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-8">How It Works</h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="step1">
              <AccordionTrigger>Step 1: Create or Join a Group</AccordionTrigger>
              <AccordionContent>Sign up and form a group or join an existing one to start saving.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="step2">
              <AccordionTrigger>Step 2: Start Saving</AccordionTrigger>
              <AccordionContent>Each member contributes to the group pool on a set schedule.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="step3">
              <AccordionTrigger>Step 3: Borrow and Grow</AccordionTrigger>
              <AccordionContent>Access funds, repay loans, and monitor growth using real-time tools.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-green-900 mb-10">What Users Are Saying</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((id) => (
              <Card key={id} className="p-6 shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-10 h-10 bg-green-200" />
                  <div className="text-left">
                    <p className="font-semibold">User {id}</p>
                    <p className="text-xs text-gray-500">Group Member</p>
                  </div>
                </div>
                <p>"TableBank made saving and borrowing simple. Our group thrives because of it!"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Image Placeholder */}
      <section className="py-20 px-6 bg-green-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-green-800 mb-6">Group Activities & Records</h2>
          <Card className="h-64 flex items-center justify-center text-gray-400 border-dashed border-2 border-green-300">
            {/* Replace this div with an <img> or Next/Image later */}
            <span>Image Placeholder</span>
          </Card>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-6 bg-green-700 text-white text-center">
        <div className="mx-auto max-w-xl">
          <h3 className="text-3xl font-semibold">Join Our Newsletter</h3>
          <p className="mt-2">Get updates, tips, and announcements right to your inbox.</p>
          <form className="mt-6 flex flex-col sm:flex-row items-center" onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="flex-1 rounded-l-md px-4 py-2 text-gray-900 focus:outline-none"
            />
            <Button type="submit" className="rounded-none sm:rounded-r-md mt-2 sm:mt-0">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BanknotesIcon className="w-6 h-6" />
            <span className="text-lg font-bold">TableBank</span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm">
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="hover:underline">Register</Link>
            <a href="#features" className="hover:underline">Features</a>
          </nav>
          <p className="text-xs">&copy; {new Date().getFullYear()} TableBank. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}