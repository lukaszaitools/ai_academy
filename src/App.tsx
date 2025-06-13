import React, { useState } from 'react'

function App() {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted idea:', idea);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h2 className="text-4xl font-bold text-center mb-8">Twój Pomysł na Biznes</h2>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="mb-6">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Opisz swój pomysł na biznes..."
            className="w-full p-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            rows={6}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
        >
          Wyślij
        </button>
      </form>
    </div>
  )
}

export default App 