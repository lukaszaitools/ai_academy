export default async function handler(req, res) {
  // Obsługa CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://ai-academy-vert.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
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
    const response = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    // Pobieramy odpowiedź
    const data = await response.json();

    // Zwracamy odpowiedź do frontendu
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      message: 'Error forwarding request to n8n',
      error: error.message 
    });
  }
} 