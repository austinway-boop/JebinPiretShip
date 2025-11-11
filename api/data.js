// Vercel serverless function for data management
// For production, this will use a database (we'll set up with Vercel Postgres)

const fs = require('fs');
const path = require('path');

// In-memory storage for Vercel (will be replaced with database)
let dataStore = {
  students: [],
  auditLog: [],
  lastUpdated: null
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Return current data
    // In production, fetch from database
    return res.status(200).json(dataStore);
  }

  if (req.method === 'POST') {
    // Save data
    const data = req.body;
    dataStore = data;
    // In production, save to database
    return res.status(200).json({ success: true, message: 'Data saved' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

