// app/setup/page.tsx

'use client';

import React from 'react';
import Header from '../components/UI/Header';

const API_INFO = [
  {
    name: 'YouTube Data API v3',
    howTo: 'Google Cloud Console → Enable API → Create API Key',
    limits: '10,000 quota units/day',
    link: 'https://console.cloud.google.com',
    envVar: 'YOUTUBE_API_KEY',
    color: '#FF0000',
  },
  {
    name: 'Twitch Helix API',
    howTo: 'Twitch Dev Console → Register App → Get Client ID + Secret',
    limits: 'Unlimited (rate limited to 800/min)',
    link: 'https://dev.twitch.tv/console',
    envVar: 'TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET',
    color: '#9146FF',
  },
  {
    name: 'Kick API',
    howTo: 'No key needed (unofficial)',
    limits: 'Unlimited (be respectful)',
    link: 'https://kick.com',
    envVar: 'N/A',
    color: '#53FC18',
  },
  {
    name: 'Facebook Graph API',
    howTo: 'Meta for Developers → Create App → Get Token',
    limits: '200 calls/hour',
    link: 'https://developers.facebook.com',
    envVar: 'FACEBOOK_ACCESS_TOKEN',
    color: '#1877F2',
  },
  {
    name: 'ip-api.com',
    howTo: 'No key needed',
    limits: '45 requests/min',
    link: 'http://ip-api.com',
    envVar: 'N/A',
    color: '#00D1FF',
  },
];

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header stats={[]} totalStreams={0} />
      
      <main className="max-w-5xl mx-auto pt-24 pb-12 px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            API Configuration Guide
          </h1>
          <p className="text-gray-400 text-lg">
            Follow these steps to obtain the necessary API keys for StreamGlobe to function correctly.
          </p>
        </div>

        <div className="grid gap-6">
          {API_INFO.map((api) => (
            <div 
              key={api.name}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-3 h-12 rounded-full" 
                    style={{ backgroundColor: api.color }}
                  />
                  <div>
                    <h2 className="text-xl font-bold">{api.name}</h2>
                    <p className="text-sm text-gray-500 font-mono mt-1">
                      {api.envVar !== 'N/A' ? `Required Var: ${api.envVar}` : 'No configuration required'}
                    </p>
                  </div>
                </div>
                
                <a 
                  href={api.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm font-semibold transition-colors text-center"
                >
                  Go to Console
                </a>
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-bold">How to Obtain</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {api.howTo}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-bold">Limits & Quota</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {api.limits}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-blue-900/10 border border-blue-500/20 rounded-3xl">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-300">
            <li>Open <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> in the root directory.</li>
            <li>Fill in the placeholders with the keys you obtained.</li>
            <li>Restart the development server.</li>
            <li>Run the refresh cron job manually by visiting <code className="bg-gray-800 px-2 py-1 rounded">/api/cron/refresh</code> (Requires <code className="bg-gray-800 px-2 py-1 rounded">CRON_SECRET</code> header).</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
