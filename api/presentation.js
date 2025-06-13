// Store presentation status in memory (will be reset on deployment)
let presentationStatus = new Map();

export const config = {
  runtime: 'edge',
};

async function handlePost(req) {
  const data = await req.json();
  
  // If this is a callback from n8n with the document URL
  if (data.documentUrl) {
    const presentationId = data.presentationId;
    if (presentationId) {
      presentationStatus.set(presentationId, {
        status: 'completed',
        documentUrl: data.documentUrl
      });
      return new Response(JSON.stringify({ message: 'Status updated' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    return new Response(JSON.stringify({ error: 'No presentation ID provided' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // If this is an initial request from frontend
  try {
    // Generate a unique ID for this presentation
    const presentationId = Date.now().toString();
    
    // Store initial status
    presentationStatus.set(presentationId, {
      status: 'processing',
      documentUrl: null
    });

    // Send to n8n with presentationId
    const n8nResponse = await fetch('https://lukai.app.n8n.cloud/webhook-test/a713d6ed-70ed-4eb5-9ff1-1147fe2f4274', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        presentationId,
        callbackUrl: 'https://week4-aicourse.vercel.app/api/presentation'
      })
    });

    if (!n8nResponse.ok) {
      throw new Error('Failed to send data to n8n');
    }

    return new Response(JSON.stringify({ 
      message: 'Processing started',
      presentationId 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function handleGet(req) {
  const url = new URL(req.url);
  const presentationId = url.searchParams.get('id');
  
  if (!presentationId) {
    return new Response(JSON.stringify({ error: 'No presentation ID provided' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const status = presentationStatus.get(presentationId) || {
    status: 'not_found',
    documentUrl: null
  };

  return new Response(JSON.stringify(status), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      }
    });
  }

  if (req.method === 'POST') {
    return handlePost(req);
  }

  if (req.method === 'GET') {
    return handleGet(req);
  }

  return new Response('Method not allowed', { status: 405 });
} 