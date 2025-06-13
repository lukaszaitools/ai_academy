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
    // Log request details
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);

    // Get document URL or ID
    let documentUrl = '';
    
    if (!req.body) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'Request body is required',
        receivedBody: req.body 
      });
    }

    // Handle different possible formats of the document URL/ID
    if (req.body.documentUrl) {
      documentUrl = req.body.documentUrl;
    } else if (req.body.documentId) {
      documentUrl = `https://docs.google.com/document/d/${req.body.documentId}/edit`;
    } else if (typeof req.body === 'string') {
      // Check if it's a full URL or just an ID
      if (req.body.startsWith('http')) {
        documentUrl = req.body;
      } else {
        documentUrl = `https://docs.google.com/document/d/${req.body}/edit`;
      }
    } else {
      return res.status(400).json({ 
        error: 'Invalid request', 
        message: 'Request must contain documentUrl, documentId, or a string with the document ID/URL',
        receivedBody: req.body 
      });
    }

    // Ensure the URL is properly formatted
    if (!documentUrl.startsWith('https://docs.google.com/')) {
      documentUrl = `https://docs.google.com/document/d/${documentUrl}/edit`;
    }

    // Ensure the URL ends with /edit
    if (!documentUrl.endsWith('/edit')) {
      documentUrl = documentUrl + (documentUrl.endsWith('/') ? 'edit' : '/edit');
    }

    console.log('Processed document URL:', documentUrl);

    // Forward to n8n webhook
    const response = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentUrl,
        timestamp: new Date().toISOString()
      }),
    });

    const data = await response.json();
    console.log('n8n response:', data);
    
    // Return success with the document URL
    return res.status(200).json({
      success: true,
      documentUrl,
      message: 'Document URL received successfully'
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack
    });
  }
} 