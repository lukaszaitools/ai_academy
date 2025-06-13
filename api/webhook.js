export default async function handler(req, res) {
  // Obsługa CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Obsługa preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Tylko dla metody POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Przekazujemy żądanie do n8n
    const response = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // Pobieramy odpowiedź
    const data = await response.json();

    // Zwracamy odpowiedź do frontendu
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      message: 'Error forwarding request to n8n',
      error: error.message 
    });
  }
} 