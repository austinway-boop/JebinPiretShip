// Vercel serverless function for saving data
// Uses Vercel KV (Redis) for persistent cloud storage

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Load data from Vercel KV
  if (req.method === 'GET') {
    try {
      // Check if KV is configured
      if (process.env.KV_REST_API_URL) {
        const { kv } = await import('@vercel/kv');
        const data = await kv.get('alpha_fleet_data');
        
        if (data) {
          console.log('✅ Data loaded from Vercel KV');
          return res.status(200).json(data);
        }
      }
      
      // Return empty data if no KV or no data stored
      console.log('ℹ️ No data in KV, returning empty');
      return res.status(200).json({
        students: [],
        auditLog: [],
        lastUpdated: null
      });
    } catch (error) {
      console.error('❌ Error loading data:', error);
      // Return empty data on error (graceful fallback)
      return res.status(200).json({
        students: [],
        auditLog: [],
        lastUpdated: null
      });
    }
  }

  // POST: Save data to Vercel KV
  if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Validate data structure
      if (!data.students || !Array.isArray(data.students)) {
        return res.status(400).json({ error: 'Invalid data structure' });
      }
      
      // Try to save to Vercel KV if configured
      if (process.env.KV_REST_API_URL) {
        const { kv } = await import('@vercel/kv');
        await kv.set('alpha_fleet_data', data);
        console.log('✅ Data saved to Vercel KV:', data.students.length, 'students');
        
        return res.status(200).json({ 
          success: true, 
          message: 'Data saved successfully to Vercel KV',
          timestamp: new Date().toISOString(),
          kvEnabled: true,
          studentCount: data.students.length
        });
      } else {
        console.log('⚠️ KV not configured, localStorage only');
        return res.status(200).json({ 
          success: true, 
          message: 'KV not configured - using localStorage only',
          timestamp: new Date().toISOString(),
          kvEnabled: false
        });
      }
    } catch (error) {
      console.error('❌ Error saving data:', error);
      return res.status(500).json({ 
        error: 'Failed to save data',
        message: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

