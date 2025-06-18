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
      <header className={`sticky top-0 z-50 transition-all duration-300 ease-in-out ${scrolled ? "bg-green-800 text-white shadow-md" : "bg-white text-green-800 shadow-sm"}`}>
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className={`flex items-center gap-2 transition-all duration-300 ${scrolled ? "scale-90" : "scale-100"}`}>
            <Link to="/" className="flex items-center gap-2 font-bold">
              <BanknotesIcon className="w-6 h-6" />
              <span className="text-lg">TableBank</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6 text-sm">
            <Link to="/login" className={`hover:underline transition-colors duration-200 ${scrolled ? "text-white" : "text-green-800"}`}>Login</Link>
            <Link to="/signup" className={`hover:underline transition-colors duration-200 ${scrolled ? "text-white" : "text-green-800"}`}>Register</Link>
            <a href="#features" className={`hover:underline transition-colors duration-200 ${scrolled ? "text-white" : "text-green-800"}`}>Features</a>
            <a href="#how-it-works" className={`hover:underline transition-colors duration-200 ${scrolled ? "text-white" : "text-green-800"}`}>How it Works</a>
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
<section className="relative bg-green-800 text-white py-28 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-tr from-green-900 to-green-600 opacity-80" />
  <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
    
    {/* Left side: Text content */}
    <div className="text-center md:text-left">
      <h1 className="text-5xl font-extrabold leading-tight mb-4">
        Empower Your Group<br />with Table Banking
      </h1>
      <p className="mt-4 text-green-100 text-lg max-w-xl">
        A smarter, transparent, and secure way to manage group savings, loans, and growth.
      </p>
      <div className="mt-8 flex flex-wrap md:justify-start justify-center gap-4">
        <Button
          size="lg"
          className="bg-white text-green-800 font-semibold hover:bg-green-100 shadow"
          asChild
        >
          <Link to="/signup">
            Get Started <ChevronRightIcon className="w-5 h-5 ml-1" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="text-white border border-white/30 hover:bg-white/10"
          disabled
        >
          Learn More
        </Button>
      </div>
    </div>

    {/* Right side: Placeholder for image/carousel */}
    <div className="hidden md:flex justify-center items-center">
      <div className="w-full h-64 rounded-xl bg-green-200 bg-opacity-20 flex items-center justify-center text-white border border-white/30 text-sm italic">
        Image or Slideshow Placeholder
      </div>
    </div>
  </div>
</section>


      {/* Features */}
<section id="features" className="py-20 px-6 bg-green-50">
  <div className="mx-auto max-w-6xl">
    <p className="text-center text-green-600 mb-2 text-sm uppercase tracking-wider">
      Built for Savings Groups
    </p>
    <h2 className="text-4xl font-bold text-green-900 text-center mb-10">
      Why TableBank Stands Out
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
          <p className="text-gray-700">No paperwork—members apply and receive funds instantly.</p>
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
</section>

{/* HOW IT WORKS */}
<section id="how-it-works" className="py-24 px-6 bg-green-100">
  <div className="max-w-4xl mx-auto">
    <h2 className="text-4xl font-bold text-center text-green-800 mb-4">
      How It Works
    </h2>
    <p className="text-center text-green-700 mb-10 text-base">
      A 3-step journey to smarter group savings and lending
    </p>

    <Accordion type="single" collapsible className="space-y-6">
      {/* Step 1 */}
      <AccordionItem value="step1" className="rounded-xl bg-white shadow-md p-6 border border-green-200">
        <AccordionTrigger className="text-xl font-semibold">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-700 text-white text-lg flex items-center justify-center">
              1
            </div>
            <span>Create or Join a Group</span>
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
            <span>Start Saving</span>
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
            <span>Borrow and Grow</span>
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