import React, { useState, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { LoadingScreen } from './LoadingScreen';
import { SuccessScreen } from './SuccessScreen';

export function ChatScreen({ businessIdea, onBack }) {
  const questions = [
    "Kto będzie Twoim głównym klientem? Opisz dokładnie swoją grupę docelową.",
    "Jaką konkretną wartość dostarczasz klientom? Co wyróżnia Twój pomysł?",
    "Jakie są przewidywane główne źródła przychodów w Twoim biznesie?"
  ];

  const [messages, setMessages] = useState([
    { 
      type: 'agent', 
      content: `Dziękuję za podzielenie się pomysłem: "${businessIdea}". ${questions[0]}`
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [userAnswers, setUserAnswers] = useState({
    businessIdea: businessIdea,
    answers: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].type === 'user') {
      const lastUserMessage = messages[messages.length - 1].content;
      setUserAnswers(prev => ({
        ...prev,
        answers: [...prev.answers, lastUserMessage]
      }));

      if (currentQuestion < questions.length) {
        setTimeout(() => {
          setMessages(prev => [...prev, { type: 'agent', content: questions[currentQuestion] }]);
          setCurrentQuestion(prev => prev + 1);
        }, 1000);
      } else if (currentQuestion === questions.length) {
        sendToN8N();
      }
    }
  }, [messages]);

  const sendToN8N = async () => {
    setIsLoading(true);
    setIsGenerating(true);
    try {
      // Sprawdzamy czy mamy wszystkie potrzebne dane
      console.log('Current userAnswers:', userAnswers);
      if (!userAnswers || !userAnswers.businessIdea || !userAnswers.answers) {
        throw new Error('Brak wymaganych danych do wysłania.');
      }

      const requestData = {
        businessIdea: userAnswers.businessIdea,
        targetAudience: userAnswers.answers[0],
        valueProposition: userAnswers.answers[1],
        revenueStreams: userAnswers.answers[2]
      };
      
      console.log('Preparing to send data to n8n:', requestData);
      
      const response = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('Got initial response from n8n:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      const responseText = await response.text();
      console.log('Initial response text:', responseText);

      if (!response.ok) {
        throw new Error(`Błąd podczas przetwarzania: ${response.status} ${responseText}`);
      }

      // Czekamy na faktyczne zakończenie workflow i URL dokumentu
      let retries = 0;
      const maxRetries = 60; // 5 minut (5s * 60)
      const pollInterval = 5000; // 5 sekund

      const pollForResult = async () => {
        if (retries >= maxRetries) {
          throw new Error('Przekroczono limit czasu oczekiwania na dokument.');
        }

        try {
          const pollResponse = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274/status', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (!pollResponse.ok) {
            throw new Error('Błąd podczas sprawdzania statusu.');
          }

          const pollData = await pollResponse.json();
          console.log('Poll response:', pollData);

          if (pollData.documentUrl) {
            console.log('Got document URL:', pollData.documentUrl);
            setDocumentUrl(pollData.documentUrl);
            setShowSuccess(true);
            return;
          }

          // Jeśli nie ma jeszcze URL, czekamy i próbujemy ponownie
          retries++;
          setTimeout(pollForResult, pollInterval);
        } catch (error) {
          console.error('Error during polling:', error);
          if (retries < maxRetries) {
            // Jeśli to tylko tymczasowy błąd, próbujemy dalej
            setTimeout(pollForResult, pollInterval);
          } else {
            throw error;
          }
        }
      };

      // Rozpoczynamy sprawdzanie statusu
      setTimeout(pollForResult, 2000);

    } catch (error) {
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        error
      });
      setMessages(prev => [...prev, {
        type: 'agent',
        content: error.message || "Przepraszam, wystąpił błąd podczas przetwarzania danych. Spróbuj ponownie później."
      }]);
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    
    setMessages(prev => [...prev, { type: 'user', content: userInput }]);
    setUserInput('');
  };

  if (showSuccess && documentUrl) {
    return <SuccessScreen documentUrl={documentUrl} />;
  }

  if (isGenerating) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl flex flex-col" style={{ height: '500px' }}>
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">
        <div className="bg-purple-600 p-2 rounded-lg">
          <Bot size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-purple-400">Asystent AI</h2>
          <p className="text-sm text-gray-400">Analiza Twojego pomysłu</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'agent' && (
              <div className="bg-purple-600 h-8 w-8 rounded-lg flex items-center justify-center mr-2">
                <Bot size={20} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-xl ${
                message.type === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-700 text-gray-100 rounded-bl-none'
              }`}
            >
              {typeof message.content === 'string' ? message.content : message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-full text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={isLoading ? "Przetwarzanie..." : "Napisz swoją odpowiedź..."}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
} 