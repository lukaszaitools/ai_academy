const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://lukai.app.n8n.cloud',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['X-Requested-With', 'Content-Type', 'Accept']
}));

// Endpoint dla prezentacji
app.post('/api/presentation', (req, res) => {
  try {
    const { content, status } = req.body;

    // Sprawdź czy wymagane pola są obecne
    if (!content) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Content is required' 
      });
    }

    // Zwróć sukces
    return res.status(200).json({ 
      success: true,
      message: 'Presentation data received successfully',
      data: { content, status: status || 'completed' }
    });

  } catch (error) {
    console.error('Error processing presentation data:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Domyślna trasa
app.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Port z zmiennej środowiskowej lub domyślny 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 