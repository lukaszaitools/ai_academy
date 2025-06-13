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

  try {
    // Log request details
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);

    // Handle initial request from frontend
    if (req.method === 'POST' && req.body.businessIdea) {
      console.log('Received initial request with business data');
      
      // Forward to n8n webhook
      const response = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        throw new Error('Failed to send data to n8n');
      }

      // Return accepted status to indicate processing started
      return res.status(202).json({
        status: 'processing',
        message: 'Your request is being processed'
      });
    }

    // Handle document URL update from n8n
    if (req.method === 'POST' && req.body.documentUrl) {
      console.log('Received document URL from n8n:', req.body.documentUrl);
      
      // Store the URL in some temporary storage or database
      // For now, we'll just return it immediately
      return res.status(200).json({
        status: 'completed',
        documentUrl: req.body.documentUrl
      });
    }

    // Handle status check request
    if (req.method === 'GET') {
      // Here you would typically check your storage/database for the document URL
      // For now, we'll just return processing status
      return res.status(200).json({
        status: 'processing',
        message: 'Still processing your request'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack
    });
  }
} 