import React, { useState } from 'react';
import { CloudResource } from '../types';
import { analyzeInventory } from '../services/geminiService';
import { Bot, Send, Sparkles } from 'lucide-react';

interface AiAdvisorProps {
  resources: CloudResource[];
}

const AiAdvisor: React.FC<AiAdvisorProps> = ({ resources }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setAnswer('');
    
    const response = await analyzeInventory(resources, question);
    
    setAnswer(response);
    setIsLoading(false);
  };

  const suggestions = [
    "How can I reduce my total monthly cost?",
    "Are there any security risks in my inventory?",
    "Summarize my Azure resource usage.",
    "Which resources are missing tags?"
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">AI Infrastructure Advisor</h2>
            <p className="text-sm text-slate-600">Powered by Gemini models</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {answer ? (
          <div className="prose prose-slate max-w-none">
            <div className="flex items-start gap-4 mb-4">
              <div className="min-w-[32px] w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-600">YOU</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl rounded-tl-none text-slate-800">
                {question}
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="min-w-[32px] w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                 {/* Simple markdown rendering simulation */}
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {answer.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">
                      {line.startsWith('#') ? <span className="font-bold text-lg block mt-4 mb-2">{line.replace(/#/g, '')}</span> : 
                       line.startsWith('*') ? <li className="ml-4">{line.replace(/\*/g, '')}</li> : line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Bot className="w-12 h-12 mb-4 opacity-50" />
            <p className="mb-8">Ask me anything about your cloud inventory.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => { setQuestion(s); }}
                  className="text-left p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm text-slate-600"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask a question about your infrastructure..."
            className="flex-1 p-3 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            disabled={isLoading}
          />
          <button 
            onClick={handleAsk}
            disabled={isLoading || !question}
            className={`absolute right-2 p-2 rounded-lg transition-colors ${isLoading || !question ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAdvisor;
