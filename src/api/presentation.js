export default function handler(req, res) {
  // Sprawdź czy metoda to POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Pobierz dane z body
    const { content, status } = req.body;

    // Sprawdź czy wymagane pola są obecne
    if (!content || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Both content and status are required' 
      });
    }

    // Zwróć sukces
    return res.status(200).json({ 
      success: true,
      message: 'Presentation data received successfully',
      data: { content, status }
    });

  } catch (error) {
    console.error('Error processing presentation data:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
} 