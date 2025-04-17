import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import type { UserAnswers } from '../types';
import { ArrowRight } from 'lucide-react';

export default function Questions() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [answer, setAnswer] = useState('');

  const handleNext = () => {
    if (!answer.trim()) return;

    const newAnswers = { ...answers, [questions[currentQuestion].id]: answer };
    setAnswers(newAnswers);
    setAnswer('');

    if (currentQuestion === questions.length - 1) {
      localStorage.setItem('userAnswers', JSON.stringify(newAnswers));
      navigate('/choose-personality');
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-32">
      <div className="max-w-2xl mx-auto px-4">
        <div className="glass-effect rounded-2xl shadow-lg p-8 animate-fade-in">
          <div className="mb-8">
            <div className="w-full bg-gray-200/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-right mt-2 text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            {questions[currentQuestion].text}
          </h2>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            rows={4}
            placeholder="Type your answer here..."
          ></textarea>

          <button
            onClick={handleNext}
            className="mt-6 w-full inline-flex items-center justify-center px-8 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next Question'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}