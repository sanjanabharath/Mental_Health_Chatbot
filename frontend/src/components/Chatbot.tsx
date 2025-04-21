import { useState, useEffect, useRef } from "react";
import {
  Send,
  FileText,
  User,
  ArrowLeft,
  ExternalLink,
  Shield,
  Brain,
  Heart,
  MessageCircle,
  CheckCircle2,
  Moon,
  Sun,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

// CSS classes for glass effect
const glassEffectClass =
  "backdrop-blur-md bg-white/30 border border-white/20 shadow-lg";

export default function MentalHealthChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content:
        "Hi, I'm your mental health assistant powered by MindfulAI. How are you feeling today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    feelingToday: "",
    sleepQuality: "",
    stressLevel: "",
    lastCheckIn: new Date().toLocaleDateString(),
    nextFollowUp: "",
  });
  const [resources, setResources] = useState({
    crisis: [],
    self_help: [],
    professional: [],
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Backend API URL - update this to your Flask server address
  const API_URL = "http://localhost:5000";

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input field when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch resources when the resources panel is opened
  useEffect(() => {
    if (showResources) {
      axios
        .get(`${API_URL}/api/resources`)
        .then((response) => {
          setResources(response.data);
        })
        .catch((error) => {
          console.error("Error fetching resources:", error);
        });
    }
  }, [showResources]);

  // Fetch user profile on initial load
  useEffect(() => {
    axios
      .get(`${API_URL}/api/profile`)
      .then((response) => {
        if (response.data) {
          setUserInfo((prevInfo) => ({
            ...prevInfo,
            ...response.data,
          }));
        }
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
      });
  }, []);

  // Handle send message and bot response
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessageId = messages.length + 1;
    const updatedMessages = [
      ...messages,
      { id: userMessageId, content: input, sender: "user" },
    ];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Call Flask backend API
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: input,
        history: messages.slice(-5), // Send last 5 messages for context
      });

      const data = response.data;

      // Add bot response from API
      setMessages([
        ...updatedMessages,
        { id: userMessageId + 1, content: data.message, sender: "bot" },
      ]);

      // Update user profile with any extracted information
      if (
        data.profile_updates &&
        Object.keys(data.profile_updates).length > 0
      ) {
        const updatedInfo = {
          ...userInfo,
          ...data.profile_updates,
          lastCheckIn: new Date().toLocaleDateString(),
        };

        setUserInfo(updatedInfo);

        // Send updated profile to backend
        axios
          .post(`${API_URL}/api/profile`, updatedInfo)
          .catch((error) => console.error("Error updating profile:", error));
      }

      // Schedule a follow-up
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 7);
      setUserInfo((prev) => ({
        ...prev,
        nextFollowUp: followUpDate.toLocaleDateString(),
      }));
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      // Add error message
      setMessages([
        ...updatedMessages,
        {
          id: userMessageId + 1,
          content: "I'm having trouble connecting. Please try again later.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle input submission on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-pulse opacity-20">
          <Sun className="h-24 w-24 text-green-300" />
        </div>
        <div className="absolute bottom-20 right-10 animate-pulse opacity-20">
          <Moon className="h-16 w-16 text-emerald-300" />
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-6 w-6" />
            <h1 className="text-xl font-bold">MindfulAI</h1>
          </Link>
          <div className="flex gap-4">
            <button
              onClick={() => setShowResources(!showResources)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-md transition-all duration-300"
            >
              <FileText size={16} />
              <span className="hidden md:inline">Resources</span>
            </button>
            <button
              onClick={() => setShowUserProfile(!showUserProfile)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-md transition-all duration-300"
            >
              <User size={16} />
              <span className="hidden md:inline">Profile</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden pt-4 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col ${glassEffectClass} rounded-2xl`}>
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 max-w-3/4 ${
                  message.sender === "user" ? "ml-auto" : "mr-auto"
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-none shadow-md"
                      : "bg-white/70 text-gray-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  {message.content.split("\n\n").map((paragraph, idx) => (
                    <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex mb-4">
                <div className="bg-white/70 text-gray-800 p-3 rounded-lg rounded-bl-none shadow-sm">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-white/20">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="flex-1 border border-white/30 bg-white/50 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim()}
                className={`p-3 rounded-full transition-all duration-300 ${
                  input.trim()
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Sidebar */}
        {showUserProfile && (
          <div
            className={`w-64 md:w-80 ${glassEffectClass} ml-4 rounded-2xl p-4 overflow-y-auto animate-fade-in`}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <User size={20} className="text-green-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Your Profile
                </h2>
              </div>
              <button
                onClick={() => setShowUserProfile(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="border-b border-white/30 pb-4">
                <h3 className="font-medium text-green-600 mb-2">Name</h3>
                <p className="text-gray-800">
                  {userInfo.name || "Not provided"}
                </p>
              </div>

              <div className="border-b border-white/30 pb-4">
                <h3 className="font-medium text-green-600 mb-2">
                  Recent Feeling
                </h3>
                <p className="text-gray-700 text-sm">
                  {userInfo.feelingToday || "Not recorded"}
                </p>
              </div>

              <div className="border-b border-white/30 pb-4">
                <h3 className="font-medium text-green-600 mb-2">
                  Sleep Quality
                </h3>
                <p className="text-gray-700 text-sm">
                  {userInfo.sleepQuality || "Not recorded"}
                </p>
              </div>

              <div className="border-b border-white/30 pb-4">
                <h3 className="font-medium text-green-600 mb-2">
                  Stress Level
                </h3>
                <p className="text-gray-700 text-sm">
                  {userInfo.stressLevel || "Not recorded"}
                </p>
              </div>

              <div className="border-b border-white/30 pb-4">
                <h3 className="font-medium text-green-600 mb-2">
                  Check-in History
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Check-in:</span>
                  <span className="text-gray-800 font-medium">
                    {userInfo.lastCheckIn}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Next Follow-up:</span>
                  <span className="text-gray-800 font-medium">
                    {userInfo.nextFollowUp || "Not scheduled"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => {
                    const followUpDate = new Date();
                    followUpDate.setDate(followUpDate.getDate() + 7);
                    const updatedInfo = {
                      ...userInfo,
                      nextFollowUp: followUpDate.toLocaleDateString(),
                    };
                    setUserInfo(updatedInfo);
                    axios
                      .post(`${API_URL}/api/profile`, updatedInfo)
                      .catch((error) =>
                        console.error("Error scheduling follow-up:", error)
                      );
                  }}
                >
                  Schedule Follow-up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resources Sidebar */}
        {showResources && (
          <div
            className={`w-64 md:w-80 ${glassEffectClass} ml-4 rounded-2xl p-4 overflow-y-auto animate-fade-in`}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <FileText size={20} className="text-green-600" />
                <h2 className="text-lg font-bold text-gray-800">Resources</h2>
              </div>
              <button
                onClick={() => setShowResources(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-3 bg-white/40 border border-white/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain size={16} className="text-green-600" />
                  <p className="text-sm font-medium text-gray-800">
                    Powered by Mistral LLM with RAG
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  This assistant uses advanced AI to provide evidence-based
                  mental health information and personalized support.
                </p>
              </div>

              <div className="border-b border-white/30 pb-4">
                <h3 className="font-medium text-green-600 mb-3 flex items-center">
                  <Shield size={16} className="mr-2" />
                  Crisis Resources
                </h3>
                <ul className="space-y-2">
                  {resources.crisis && resources.crisis.length > 0 ? (
                    resources.crisis.map((resource, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 bg-white/40 p-2 rounded-lg hover:bg-white/60 transition-colors"
                      >
                        <ExternalLink size={14} className="text-green-600" />
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-800 hover:text-green-700 text-sm"
                        >
                          {resource.name}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center gap-2 bg-white/40 p-2 rounded-lg hover:bg-white/60 transition-colors">
                      <ExternalLink size={14} className="text-green-600" />
                      <a
                        href="#"
                        className="text-gray-800 hover:text-green-700 text-sm"
                      >
                        988 Suicide & Crisis Lifeline
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-b border-white/30 pb-4">
                <h3 className="font-medium text-green-600 mb-3 flex items-center">
                  <Heart size={16} className="mr-2" />
                  Self-Help Resources
                </h3>
                <ul className="space-y-2">
                  {resources.self_help && resources.self_help.length > 0 ? (
                    resources.self_help.map((resource, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 bg-white/40 p-2 rounded-lg hover:bg-white/60 transition-colors"
                      >
                        <CheckCircle2 size={14} className="text-green-600" />
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-800 hover:text-green-700 text-sm"
                        >
                          {resource.name}
                        </a>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-center gap-2 bg-white/40 p-2 rounded-lg hover:bg-white/60 transition-colors">
                        <CheckCircle2 size={14} className="text-green-600" />
                        <a
                          href="#"
                          className="text-gray-800 hover:text-green-700 text-sm"
                        >
                          Anxiety Management Techniques
                        </a>
                      </li>
                      <li className="flex items-center gap-2 bg-white/40 p-2 rounded-lg hover:bg-white/60 transition-colors">
                        <CheckCircle2 size={14} className="text-green-600" />
                        <a
                          href="#"
                          className="text-gray-800 hover:text-green-700 text-sm"
                        >
                          Depression Self-Care Strategies
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="border-b border-white/30 pb-4">
                <h3 className="font-medium text-green-600 mb-3 flex items-center">
                  <MessageCircle size={16} className="mr-2" />
                  Professional Help
                </h3>
                <ul className="space-y-2">
                  {resources.professional &&
                  resources.professional.length > 0 ? (
                    resources.professional.map((resource, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 bg-white/40 p-2 rounded-lg hover:bg-white/60 transition-colors"
                      >
                        <ExternalLink size={14} className="text-green-600" />
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-800 hover:text-green-700 text-sm"
                        >
                          {resource.name}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center gap-2 bg-white/40 p-2 rounded-lg hover:bg-white/60 transition-colors">
                      <ExternalLink size={14} className="text-green-600" />
                      <a
                        href="#"
                        className="text-gray-800 hover:text-green-700 text-sm"
                      >
                        Find a Therapist
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex items-center justify-center pt-2">
                <div className="inline-flex items-center space-x-2 bg-white/40 px-4 py-2 rounded-full">
                  <Shield size={14} className="text-green-600" />
                  <span className="text-gray-700 text-sm">
                    Your privacy is protected
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
