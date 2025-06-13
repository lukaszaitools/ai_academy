export default async function handler(req, res) {
  // Obsługa CORS - używamy * zamiast konkretnego origin dla uproszczenia
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    // Tworzymy kontroler do przerwania fetch po określonym czasie
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 50000); // 50 sekund timeout

    try {
      // Używamy produkcyjnego webhooka zamiast testowego
      const response = await fetch('https://lukai.app.n8n.cloud/webhook/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body),
        signal: controller.signal
      });

      clearTimeout(timeout);

      // Sprawdzamy czy odpowiedź jest w formacie JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      // Zwracamy odpowiedź do frontendu
      res.status(response.status).json(data);
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError.name === 'AbortError') {
        res.status(504).json({ 
          message: 'Request timeout while connecting to n8n',
          error: 'Timeout after 50 seconds'
        });
      } else {
        throw fetchError;
      }
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      message: 'Error forwarding request to n8n',
      error: error.message 
    });
  }
} 