// Vercel serverless function for data management
// Uses Vercel KV (Redis) for persistent storage

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Try to use Vercel KV if available
      if (process.env.KV_REST_API_URL) {
        const { kv } = await import('@vercel/kv');
        const data = await kv.get('alpha_fleet_data');
        
        if (data) {
          return res.status(200).json(data);
        }
      }
      
      // Return empty data if no KV or no data stored
      return res.status(200).json({
        students: [],
        auditLog: [],
        lastUpdated: null
      });
    } catch (error) {
      console.error('Error loading data:', error);
      return res.status(200).json({
        students: [],
        auditLog: [],
        lastUpdated: null
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Try to use Vercel KV if available
      if (process.env.KV_REST_API_URL) {
        const { kv } = await import('@vercel/kv');
        await kv.set('alpha_fleet_data', data);
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Data saved',
        kvEnabled: !!process.env.KV_REST_API_URL
      });
    } catch (error) {
      console.error('Error saving data:', error);
      return res.status(500).json({ error: 'Failed to save data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

