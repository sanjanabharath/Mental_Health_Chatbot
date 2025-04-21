import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Questions from "./pages/Questions";
import ChoosePersonality from "./pages/ChoosePersonality";
import Chat from "./pages/Chat";
import MentalHealthChatbot from "./components/Chatbot";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/start" element={<Questions />} />
          <Route path="/choose-personality" element={<ChoosePersonality />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/mental-health" element={<MentalHealthChatbot />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
