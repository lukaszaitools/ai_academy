export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://lukai.app.n8n.cloud');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST request
  if (req.method === 'POST') {
    try {
      const { content } = req.body;

      // Validate content
      if (!content) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Content is required'
        });
      }

      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Presentation data received successfully',
        data: { content }
      });

    } catch (error) {
      console.error('Error processing presentation data:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({
    error: 'Method not allowed',
    message: 'Only POST method is supported'
  });
} 