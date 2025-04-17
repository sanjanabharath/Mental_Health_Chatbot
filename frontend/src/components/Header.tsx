import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="fixed w-full z-50">
      <nav className="glass-effect mx-4 mt-4 rounded-full shadow-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <Brain className="h-8 w-8 text-green-600 transition-transform group-hover:scale-110 duration-300" />
            <span className="text-xl font-bold text-gray-800">MindfulAI</span>
          </Link>
          <div className="flex space-x-6">
            <Link to="/start" className="text-gray-600 hover:text-green-600 transition-colors">Get Started</Link>
            <Link to="/about" className="text-gray-600 hover:text-green-600 transition-colors">About</Link>
            <Link to="/resources" className="text-gray-600 hover:text-green-600 transition-colors">Resources</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}