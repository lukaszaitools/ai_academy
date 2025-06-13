import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Send } from 'lucide-react';
import { gsap } from 'gsap';
import './style.css';
import { ChatScreen } from './components/ChatScreen';

function App() {
  const [idea, setIdea] = useState('');
  const [currentScreen, setCurrentScreen] = useState('form');
  const submitButtonRef = useRef(null);
  const inputRef = useRef(null);
  const cursorLightRef = useRef(null);
  const placeholders = [
    "Aplikacja do medytacji dla psów",
    "Inteligentna lodówka dla roślin",
    "Społecznościówka dla chomików",
    "AI do komponowania muzyki dla kotów",
    "Marketplace dla wymyślonych historii"
  ];

  // Efekt śledzenia kursora
  useEffect(() => {
    const cursor = cursorLightRef.current;
    if (!cursor) return;

    const onMouseMove = (e) => {
      const { clientX, clientY } = e;
      gsap.to(cursor, {
        x: clientX,
        y: clientY,
        duration: 0.5,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  // Animacja placeholdera
  useEffect(() => {
    if (!inputRef.current) return;
    
    const animatePlaceholder = async () => {
      const input = inputRef.current;
      if (!input) return;

      for (const placeholder of placeholders) {
        input.placeholder = "";
        
        for (let i = 0; i < placeholder.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          input.placeholder = placeholder.slice(0, i + 1);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        for (let i = placeholder.length; i >= 0; i--) {
          await new Promise(resolve => setTimeout(resolve, 50));
          input.placeholder = placeholder.slice(0, i);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      animatePlaceholder();
    };

    animatePlaceholder();
  }, []);

  // Animacja przycisku
  useEffect(() => {
    if (submitButtonRef.current) {
      const button = submitButtonRef.current;
      const tl = gsap.timeline({ paused: true });
      tl.to(button, { scale: 1.05, duration: 0.2, ease: 'power1.out' });

      const playAnim = () => tl.play();
      const reverseAnim = () => tl.reverse();

      button.addEventListener('mouseenter', playAnim);
      button.addEventListener('mouseleave', reverseAnim);

      return () => {
        button.removeEventListener('mouseenter', playAnim);
        button.removeEventListener('mouseleave', reverseAnim);
        tl.kill();
      };
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!idea.trim()) return;
    setCurrentScreen('chat');
  };

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden">
      {/* Efekt śledzenia kursora */}
      <div 
        ref={cursorLightRef}
        className="pointer-events-none fixed w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl"
        style={{
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'plus-lighter'
        }}
      />

      {/* Główny kontener */}
      <div className="h-full flex items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
        {currentScreen === 'form' ? (
          <div id="form-container" className="w-full max-w-md p-8 bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl">
            <h1 className="text-4xl font-bold text-center text-purple-400 mb-3">Witaj!</h1>
            <p className="text-gray-300 text-center mb-8 text-lg">Podziel się swoim genialnym pomysłem na biznes, a pomogę Ci wygenerować wzór prezentacji.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="businessIdea" className="block text-sm font-medium text-purple-300 mb-1">
                  Twój pomysł:
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  id="businessIdea"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400 transition-colors duration-150"
                  required
                />
              </div>
              <button
                type="submit"
                ref={submitButtonRef}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
              >
                <Send size={20} className="mr-2" />
                Prześlij
              </button>
            </form>
          </div>
        ) : (
          <ChatScreen businessIdea={idea} />
        )}
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Fatal error: Root element with ID "root" not found in the DOM.');
} 