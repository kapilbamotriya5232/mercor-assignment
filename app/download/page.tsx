'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export default function DownloadPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    
    const downloadUrl = 'https://drive.google.com/file/d/1f8fiSOd-TKS3MIgZ7sCUuIYZDJoRUYqn/view?usp=sharing';
    
    window.open(downloadUrl, '_blank');
    
    setTimeout(() => {
      setDownloading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-blue-600 text-white p-8 text-center">
            <div className="text-6xl mb-4">🍎</div>
            <h2 className="text-3xl font-bold mb-2">Download Mercor</h2>
            <p className="text-blue-100">for macOS</p>
          </div>
          <div className="p-8">
            <div className="text-center">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center justify-center w-full px-8 py-4 text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Download className="w-6 h-6 mr-3" />
                Download Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
