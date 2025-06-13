export default async function handler(req, res) {
  // Obsługa CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://ai-academy-vert.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Obsługa preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Tylko dla metody POST
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    // Przekazujemy żądanie do n8n
    const n8nResponse = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://ai-academy-vert.vercel.app',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body),
    });

    // Pobieramy odpowiedź
    const data = await n8nResponse.json();

    // Dodajemy nagłówki CORS do odpowiedzi
    res.setHeader('Access-Control-Allow-Origin', 'https://ai-academy-vert.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Zwracamy odpowiedź do frontendu
    res.status(n8nResponse.status).json(data);
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Dodajemy nagłówki CORS nawet w przypadku błędu
    res.setHeader('Access-Control-Allow-Origin', 'https://ai-academy-vert.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.status(500).json({ 
      message: 'Error forwarding request to n8n',
      error: error.message 
    });
  }
} 