// Vercel serverless function for data retrieval
// Uses Vercel KV (Redis) for persistent cloud storage

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Check if KV is configured
      if (process.env.KV_REST_API_URL) {
        const { kv } = await import('@vercel/kv');
        const data = await kv.get('alpha_fleet_data');
        
        if (data) {
          return res.status(200).json(data);
        }
      }
      
      // Return empty data structure if nothing found
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

  return res.status(405).json({ error: 'Method not allowed' });
}

