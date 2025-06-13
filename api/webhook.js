export default async function handler(req, res) {
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