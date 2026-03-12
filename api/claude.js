// api/claude.js — Vercel Serverless Function
// This runs on the SERVER so your API key is NEVER exposed to users

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the API key from environment variable (set in Vercel dashboard)
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const { prompt, max_tokens = 1200 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    // Call Anthropic API from the server
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: errorData?.error?.message || 'Anthropic API error',
      });
    }

    const data = await response.json();

    // Return the text response
    return res.status(200).json({
      text: data.content?.[0]?.text || '',
    });

  } catch (error) {
    console.error('Claude API proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
