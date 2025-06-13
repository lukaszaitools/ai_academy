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
    console.log('Received request body:', req.body);

    // Handle the input data in the most flexible way possible
    let messageContent;

    if (req.body === null || req.body === undefined) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    // If the body is a string, use it directly
    if (typeof req.body === 'string') {
      messageContent = req.body;
    }
    // If it's an object, try to extract the content
    else if (typeof req.body === 'object') {
      // If it's an array, join it
      if (Array.isArray(req.body)) {
        messageContent = req.body.join(' ');
      }
      // If it has a data property that's a string, use that
      else if (typeof req.body.data === 'string') {
        messageContent = req.body.data;
      }
      // If it has any of these properties, use the first one found
      else {
        messageContent = req.body.output || req.body.content || req.body.message || req.body.text;
        
        // If we still don't have content, stringify the entire body
        if (messageContent === undefined) {
          messageContent = JSON.stringify(req.body);
        }
      }
    }
    // For any other type, convert to string
    else {
      messageContent = String(req.body);
    }

    // Ensure we have some content
    if (!messageContent) {
      return res.status(400).json({ error: 'No content could be extracted from the request' });
    }

    console.log('Processed message content:', messageContent);

    // Forward to n8n webhook
    const response = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: messageContent,
        timestamp: new Date().toISOString()
      }),
    });

    const data = await response.json();
    console.log('n8n response:', data);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack 
    });
  }
} 