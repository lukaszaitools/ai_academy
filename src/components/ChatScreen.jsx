import React, { useState, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { LoadingScreen } from './LoadingScreen';

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
  const [presentationUrl, setPresentationUrl] = useState(null);

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
      console.log('Sending data:', userAnswers);
      const response = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors',
        body: JSON.stringify({
          businessIdea: userAnswers.businessIdea,
          targetAudience: userAnswers.answers[0],
          valueProposition: userAnswers.answers[1],
          revenueStreams: userAnswers.answers[2]
        })
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { message: responseText };
      }
      console.log('Parsed response:', responseData);

      if (!response.ok) {
        if (responseData.hint && responseData.hint.includes('test mode')) {
          throw new Error('Webhook jest w trybie testowym. Proszę aktywować webhook w n8n i spróbować ponownie.');
        }
        throw new Error(`Błąd serwera: ${responseData.message || 'Nieznany błąd'}`);
      }

      // Czekamy na odpowiedź z n8n
      let retries = 0;
      const maxRetries = 60; // maksymalnie 60 prób (5 minut)
      const checkInterval = 5000; // co 5 sekund

      while (retries < maxRetries) {
        if (responseData.status === 'completed' || responseData.presentationUrl) {
          // Mamy gotową prezentację
          setPresentationUrl(responseData.presentationUrl);
          setMessages(prev => [...prev, {
            type: 'agent',
            content: responseData.presentationUrl 
              ? `Świetnie! Twoja prezentacja jest gotowa. Możesz ją zobaczyć tutaj: ${responseData.presentationUrl}`
              : "Dziękuję za wszystkie odpowiedzi! Twoje dane zostały przesłane do analizy. Za chwilę otrzymasz gotową prezentację!"
          }]);
          break;
        } else if (responseData.status === 'error') {
          throw new Error('Wystąpił błąd podczas generowania prezentacji.');
        }

        // Czekamy 5 sekund przed kolejnym sprawdzeniem
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        
        // Sprawdzamy status
        const statusResponse = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274/status', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin
          },
          mode: 'cors'
        });

        if (!statusResponse.ok) {
          throw new Error('Nie można sprawdzić statusu generowania prezentacji.');
        }

        const statusData = await statusResponse.json();
        responseData = statusData;
        retries++;
      }

      if (retries >= maxRetries) {
        throw new Error('Przekroczono limit czasu oczekiwania na prezentację.');
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'agent',
        content: error.message || "Przepraszam, wystąpił błąd podczas przetwarzania danych. Spróbuj ponownie później."
      }]);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    
    setMessages(prev => [...prev, { type: 'user', content: userInput }]);
    setUserInput('');
  };

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
              {message.content}
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