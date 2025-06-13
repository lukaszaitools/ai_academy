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
    // Get the content from the request body, handling different possible formats
    let content;
    
    if (typeof req.body === 'string') {
      // If body is a string, try to parse it as JSON
      try {
        const parsedBody = JSON.parse(req.body);
        content = parsedBody.content || parsedBody.message || parsedBody;
      } catch (e) {
        content = req.body;
      }
    } else if (typeof req.body === 'object') {
      // If body is an object, try to get content from various possible fields
      content = req.body.content || req.body.message || req.body.output || JSON.stringify(req.body);
    } else {
      content = String(req.body);
    }

    // Ensure content is a string
    if (typeof content !== 'string') {
      content = JSON.stringify(content);
    }

    // Forward to n8n webhook with proper formatting
    const response = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        timestamp: new Date().toISOString()
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 