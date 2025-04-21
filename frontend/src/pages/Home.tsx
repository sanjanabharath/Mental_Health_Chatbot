import {
  MessageCircle,
  Brain,
  Heart,
  Shield,
  ArrowRight,
  Sun,
  Moon,
  Cloud,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Floating Background Elements */}
      <Header />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-float opacity-20">
          <Sun className="h-24 w-24 text-green-300" />
        </div>
        <div
          className="absolute bottom-20 right-10 animate-float opacity-20"
          style={{ animationDelay: "2s" }}
        >
          <Moon className="h-16 w-16 text-emerald-300" />
        </div>
        <div
          className="absolute top-1/2 left-1/4 animate-float opacity-20"
          style={{ animationDelay: "1s" }}
        >
          <Cloud className="h-20 w-20 text-teal-300" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 relative">
        {/* Hero Section */}
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl mb-6">
            You're Not Alone.
            <br />
            <span className="text-green-600">Let's Talk.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Your private AI companion for emotional support, mindfulness, and
            daily check-ins. We're here to listen, support, and guide you on
            your journey to better mental health.
          </p>
          <Link
            to="/mental-health"
            className="mt-8 inline-flex items-center px-8 py-3 rounded-full font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* How It Works */}
        <div
          className="mt-32 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "Chat Privately",
                description:
                  "Connect with your AI companion in a safe, anonymous space",
              },
              {
                icon: Brain,
                title: "Get Support",
                description:
                  "Receive personalized guidance and emotional support",
              },
              {
                icon: Heart,
                title: "Track Progress",
                description:
                  "Monitor your emotional well-being and growth over time",
              },
              {
                icon: Shield,
                title: "Stay Connected",
                description:
                  "Regular check-ins and gentle reminders to support your journey",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="glass-effect p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <item.icon className="h-12 w-12 text-green-600 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2 text-center">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-center">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div
          className="mt-32 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="glass-effect rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Features That Care
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Smart conversations with emotional intelligence",
                "Personalized daily check-ins",
                "Mood tracking and journaling",
                "Goal setting and reminders",
                "Mindfulness exercises",
                "Crisis resources and support",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-white/50 group hover:bg-white/70 transition-colors duration-300"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 group-hover:text-green-600 transition-colors" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div
          className="mt-32 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Others Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              "It felt like someone actually cared how I was feeling today.",
              "The daily check-ins have become an essential part of my mental health routine.",
              "A judgment-free space where I can be completely honest about my feelings.",
            ].map((quote, index) => (
              <div
                key={index}
                className="glass-effect p-6 rounded-xl shadow-sm"
              >
                <p className="text-gray-600 italic">"{quote}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Badge */}
        <div
          className="mt-32 text-center animate-fade-in"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="inline-flex items-center space-x-2 glass-effect px-6 py-3 rounded-full">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-gray-700 font-medium">
              Your privacy and security are our top priority
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
