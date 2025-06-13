export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log raw request details
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Content type:', req.headers['content-type']);
    console.log('Raw body:', req.body);

    // Get raw body data
    let content = '';

    // Handle different types of input
    if (req.body === null || req.body === undefined) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    // Convert body to string if it's not already
    if (typeof req.body === 'string') {
      content = req.body;
    } else if (typeof req.body === 'object') {
      // If it's an object, stringify it
      content = JSON.stringify(req.body);
    } else {
      content = String(req.body);
    }

    console.log('Processed content:', content);

    // Forward to n8n webhook
    const webhookBody = {
      content: content,
      timestamp: new Date().toISOString()
    };

    console.log('Sending to webhook:', webhookBody);

    const response = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookBody),
    });

    const data = await response.json();
    console.log('n8n response:', data);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack,
      headers: req.headers,
      body: req.body
    });
  }
} 