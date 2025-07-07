import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import Lottie from "lottie-react";
import animationData from "@/assets/animations/index1.json"; // ✅ Importing Lottie animation
import { motion, AnimatePresence } from "framer-motion"; // ✅ Added for animations
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
  const [scrolled, setScrolled] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    toast.success("We’ll keep you posted with product updates!");
    setEmail("");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-green-50 text-gray-800">

      {/* Navbar */}

<header className="sticky top-0 z-50 bg-green-900 text-white shadow-md transition-all duration-300 ease-in-out">
  <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Link to="/" className="flex items-center gap-2 font-bold">
        <BanknotesIcon className="w-6 h-6" />
        <span className="text-lg font-bold">ChamaPro</span>
      </Link>
    </div>
    <nav className="hidden md:flex gap-6 text-sm">
      <Link to="/login" className="hover:underline transition-colors duration-200 text-white text-lg font-bold">Login</Link>
      <Link to="/signup" className="hover:underline transition-colors duration-200 text-white text-lg font-bold">Register</Link>
      <a href="#features" className="hover:underline transition-colors duration-200 text-white text-lg font-bold">Features</a>
      <a href="#how-it-works" className="hover:underline transition-colors duration-200 text-white text-lg font-bold">How it Works</a>
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
<section className="relative bg-gradient-to-br from-emerald-50 via-white to-green-50 text-green-800 py-9 overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-100 rounded-full opacity-30"></div>
  </div>
  
  <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
    
    {/* Left side: Text content */}
    <div className="text-center md:text-left space-y-6">
      <h1 className="text-2xl md:text-6xl font-extrabold leading-tight mb-2 bg-gradient-to-r from-green-800 to-emerald-600 bg-clip-text text-transparent">
        Empower Your Group with<br /> ChamaPro Table Banking
      </h1>
      <p className="text-green-700 text-xl max-w-2xl leading-relaxed mt-4 mx-auto md:mx-0">
        A smarter, transparent, and secure way to manage group savings, loans, and growth.
      </p>
      <div className="flex flex-wrap md:justify-start justify-center gap-4 pt-4">
  {/* Get Started */}
  <Button
    size="lg"
    className="bg-green-800 text-white font-semibold hover:bg-green-700 hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform"
    asChild
  >
    <Link to="/signup" className="flex items-center">
      Get Started <ChevronRightIcon className="w-5 h-5 ml-1" />
    </Link>
  </Button>

  {/* Learn More */}
  <Button
    size="lg"
    variant="outline"
    className="text-green-800 border-green-300 hover:border-green-400 hover:bg-green-50 hover:scale-105 transition-all duration-300 ease-in-out transform"
    asChild
  >
    <a href="#learn-more">Learn More</a>
  </Button>
</div>
    </div>

    {/* Right side: Lottie animation */}
    <div className="hidden md:flex justify-center items-center">
      <div className="relative">
        <Lottie
          animationData={animationData}
          loop
          autoplay
          className="w-full h-80 relative z-10"
        />
      </div>
    </div>
  </div>
</section>

{/* Transition element */}
<div className="h-4 bg-gradient-to-b from-green-50 to-slate-50"></div>

<section id="learn-more" className="bg-gradient-to-b from-slate-50 to-white py-24 px-6 md:px-16">
  <div className="max-w-6xl mx-auto">
    
    {/* Section Header */}
    <div className="text-center mb-16">
      <div className="inline-block mb-4">
        <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
          Understanding Table Banking
        </span>
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-6 leading-tight">
        What is Table Banking?
      </h2>
      <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-green-500 mx-auto mb-8"></div>
      <p className="text-gray-700 text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto">
  Table banking is a community-based system where members come together to save money and give out loans to each other. Instead of relying on a traditional bank, everything is managed within the group, right there during meetings. It’s simple, transparent, and built on trust among members.
</p>

    </div>

    {/* Feature Cards */}
    <div className="grid md:grid-cols-3 gap-8">
      <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-emerald-800 mb-4">Community First</h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          Members support each other through savings, loans, and joint investments all within the group.
        </p>
      </div>

      <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-emerald-800 mb-4">Accessible & Transparent</h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          Every contribution and loan is tracked openly. There's no middleman, making it highly trustworthy and inclusive.
        </p>
      </div>

      <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-emerald-800 mb-4">Financial Growth</h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          By pooling resources, members can access larger funds, invest in businesses, and uplift their economic status together.
        </p>
      </div>
    </div>
  </div>
</section>


      {/* Features */}
<section id="features" className="py-20 px-6 bg-green-50">
  <div className="mx-auto max-w-6xl">
    <p className="text-center text-green-600 mb-2 text-base uppercase tracking-wider">
      Built for Savings Groups
    </p>
    <h2 className="text-4xl font-bold text-green-900 text-center mb-10">
      Features
    </h2>

    <Tabs defaultValue="save">
      <TabsList className="mb-8 flex justify-center gap-4 w-fit mx-auto">
        <TabsTrigger value="save" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 font-medium px-4 py-2 rounded-md">
          Save
        </TabsTrigger>
        <TabsTrigger value="borrow" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 font-medium px-4 py-2 rounded-md">
          Borrow
        </TabsTrigger>
        <TabsTrigger value="grow" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 font-medium px-4 py-2 rounded-md">
          Grow
        </TabsTrigger>
      </TabsList>

      
{/* SAVE */}
<TabsContent value="save">
  <AnimatePresence mode="wait">
    <motion.div
      key="save"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="grid md:grid-cols-2 gap-8"
    >
      <Card className="transition-all hover:shadow-lg shadow-md bg-white">
        <CardContent className="p-8">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <UserGroupIcon className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Collective Deposits</h3>
          <p className="text-gray-700">Track member contributions with full transparency.</p>
        </CardContent>
      </Card>
      <Card className="transition-all hover:shadow-lg shadow-md bg-white">
        <CardContent className="p-8">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Secure & Verifiable</h3>
          <p className="text-gray-700">Backed by Supabase with real-time updates and encryption.</p>
        </CardContent>
      </Card>
    </motion.div>
  </AnimatePresence>
</TabsContent>

{/* BORROW */}
<TabsContent value="borrow">
  <AnimatePresence mode="wait">
    <motion.div
      key="borrow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="grid md:grid-cols-2 gap-8"
    >
      <Card className="transition-all hover:shadow-lg shadow-md bg-white">
        <CardContent className="p-8">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <BanknotesIcon className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Instant Loans</h3>
          <p className="text-gray-700">No paperwork, members apply and receive funds instantly.</p>
        </CardContent>
      </Card>
      <Card className="transition-all hover:shadow-lg shadow-md bg-white">
        <CardContent className="p-8">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <ChartPieIcon className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Transparent Tracking</h3>
          <p className="text-gray-700">Follow repayments, interest, and balances in real time.</p>
        </CardContent>
      </Card>
    </motion.div>
  </AnimatePresence>
</TabsContent>

{/* GROW */}
<TabsContent value="grow">
  <AnimatePresence mode="wait">
    <motion.div
      key="grow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="grid md:grid-cols-2 gap-8"
    >
      <Card className="transition-all hover:shadow-lg shadow-md bg-white">
        <CardContent className="p-8">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <ChartPieIcon className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Group Insights</h3>
          <p className="text-gray-700">Visualize progress, analyze impact, and export reports.</p>
        </CardContent>
      </Card>
      <Card className="transition-all hover:shadow-lg shadow-md bg-white">
        <CardContent className="p-8">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <UserGroupIcon className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Community Network</h3>
          <p className="text-gray-700">Connect with similar groups and funding partners.</p>
        </CardContent>
      </Card>
    </motion.div>
  </AnimatePresence>
</TabsContent>

    </Tabs>
  </div>
<div className="mt-12">
  <h3 className="text-2xl font-bold text-green-900 text-center mb-6">
    Why ChamaPro Stands Out
  </h3>
  <div className="grid md:grid-cols-2 gap-8">
    <Card className="bg-white transition-all hover:shadow-lg shadow-md min-h-[260px]">
      <CardContent className="p-8">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <ShieldCheckIcon className="w-6 h-6 text-green-700" />
        </div>
        <h4 className="text-xl font-semibold mb-2">Fingerprint Attendance</h4>
        <p className="text-gray-700">
          Our system integrates biometric authentication using a fingerprint sensor module,
          ensuring that member attendance is secure, accurate, and verifiable.
        </p>
      </CardContent>
    </Card>
    <Card className="bg-white transition-all hover:shadow-lg shadow-md min-h-[260px]">
      <CardContent className="p-8">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <UserGroupIcon className="w-6 h-6 text-green-700" />
        </div>
        <h4 className="text-xl font-semibold mb-2">Why It Matters</h4>
        <p className="text-gray-700">
          Fingerprint-based check-ins help prevent impersonation, reduce manual errors,
          and improve accountability in meetings and transactions, building trust across group members.
        </p>
      </CardContent>
    </Card>
  </div>
</div>


</section>

{/* HOW IT WORKS */}
<section id="how-it-works" className="py-24 px-6 bg-green-100">
  <div className="max-w-4xl mx-auto">
    <h2 className="text-4xl font-bold text-center text-green-800 mb-4">
      How It Works
    </h2>
    <p className="text-center text-green-700 mb-10 text-xl">
      A simple journey to smarter group savings and lending
    </p>

    <Accordion type="single" collapsible className="space-y-6">
      {/* Step 1 */}
      <AccordionItem value="step1" className="rounded-xl bg-white shadow-md p-6 border border-green-200">
        <AccordionTrigger className="text-xl font-semibold">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-700 text-white text-lg flex items-center justify-center">
              1
            </div>
            <span className="text-lg">Create or Join a Group</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="mt-2 text-gray-700 text-sm">
          Sign up and form a group or join an existing one to start saving.
        </AccordionContent>
      </AccordionItem>

      {/* Step 2 */}
      <AccordionItem value="step2" className="rounded-xl bg-white shadow-md p-6 border border-green-200">
        <AccordionTrigger className="text-xl font-semibold">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-700 text-white text-lg flex items-center justify-center">
              2
            </div>
            <span className="text-lg">Start Saving</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="mt-2 text-gray-700 text-sm">
          Each member contributes to the group pool on a set schedule.
        </AccordionContent>
      </AccordionItem>

      {/* Step 3 */}
      <AccordionItem value="step3" className="rounded-xl bg-white shadow-md p-6 border border-green-200">
        <AccordionTrigger className="text-xl font-semibold">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-700 text-white text-lg flex items-center justify-center">
              3
            </div>
            <span className="text-lg">Borrow and Grow</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="mt-2 text-gray-700 text-sm">
          Access funds, repay loans, and monitor growth using real-time tools.
        </AccordionContent>
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
                    <p className="text-xs text-gray-500">Group Leader</p>
                  </div>
                </div>
                <p>"ChamaPro made saving and borrowing simple. Our group thrives because of it!"</p>
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
            <span className="text-lg font-bold">ChamaPro</span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm">
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="hover:underline">Register</Link>
            <a href="#features" className="hover:underline">Features</a>
          </nav>
          <p className="text-xs">&copy; {new Date().getFullYear()} ChamaPro. All rights reserved.</p>
        </div>
      </footer>
      {/* Scroll To Top Button */}
{scrolled && (
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    className="fixed bottom-6 right-6 bg-green-700 text-white px-4 py-2 rounded-full shadow-md hover:bg-green-800 transition text-sm font-medium"
  >
    Back to Top
  </button>
)}
    </div>
  );
}