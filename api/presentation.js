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
    console.log('Raw request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Content type:', req.headers['content-type']);

    // Handle the input data in the most flexible way possible
    let messageContent;

    if (req.body === null || req.body === undefined) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    // If the body is a string, try to parse it as JSON first
    if (typeof req.body === 'string') {
      try {
        const parsedBody = JSON.parse(req.body);
        console.log('Parsed string body:', parsedBody);
        messageContent = parsedBody.data || parsedBody.output || parsedBody;
      } catch (e) {
        console.log('Failed to parse string body as JSON, using raw string');
        messageContent = req.body;
      }
    }
    // If it's an object, try to extract the content
    else if (typeof req.body === 'object') {
      console.log('Body is an object:', req.body);
      if (Array.isArray(req.body)) {
        messageContent = req.body.join(' ');
      }
      // Try to get content from various possible fields
      else {
        messageContent = req.body.data || req.body.output || req.body.content || req.body.message || req.body.text;
        
        // If we still don't have content, stringify the entire body
        if (messageContent === undefined) {
          console.log('No specific field found, using entire body');
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
      console.log('No content could be extracted');
      return res.status(400).json({ error: 'No content could be extracted from the request' });
    }

    console.log('Final message content:', messageContent);

    // Forward to n8n webhook
    const webhookBody = {
      data: messageContent,
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
      stack: error.stack 
    });
  }
} 