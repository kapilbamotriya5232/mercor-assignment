'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Monitor, CheckCircle, Loader2, Info, ArrowRight } from 'lucide-react';

export default function DownloadPage() {
  const router = useRouter();
  const [os, setOs] = useState<'mac' | 'windows' | 'linux' | 'unknown'>('unknown');
  const [downloading, setDownloading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Detect OS
    const platform = window.navigator.platform.toLowerCase();
    if (platform.includes('mac')) {
      setOs('mac');
    } else if (platform.includes('win')) {
      setOs('windows');
    } else if (platform.includes('linux')) {
      setOs('linux');
    } else {
      setOs('unknown');
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleDownload = () => {
    setDownloading(true);
    
    // In production, this would be the actual download link
    // For now, we'll simulate a download
    const downloadUrl = process.env.NEXT_PUBLIC_DESKTOP_APP_URL || '/downloads/mercor-desktop.dmg';
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'mercor-desktop.dmg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset downloading state after 3 seconds
    setTimeout(() => {
      setDownloading(false);
    }, 3000);
  };

  const getOsSpecificContent = () => {
    switch (os) {
      case 'mac':
        return {
          title: 'Download for macOS',
          subtitle: 'Compatible with macOS 10.15 (Catalina) or later',
          fileName: 'mercor-desktop.dmg',
          icon: '🍎',
          instructions: [
            'Download the .dmg file',
            'Open the downloaded file',
            'Drag Mercor to your Applications folder',
            'Launch Mercor from Applications',
            'Grant necessary permissions when prompted',
          ],
        };
      case 'windows':
        return {
          title: 'Download for Windows',
          subtitle: 'Compatible with Windows 10 or later',
          fileName: 'mercor-desktop.exe',
          icon: '🪟',
          instructions: [
            'Download the installer',
            'Run the downloaded .exe file',
            'Follow the installation wizard',
            'Launch Mercor from the Start menu',
          ],
        };
      case 'linux':
        return {
          title: 'Download for Linux',
          subtitle: 'Available as AppImage',
          fileName: 'mercor-desktop.AppImage',
          icon: '🐧',
          instructions: [
            'Download the AppImage file',
            'Make it executable: chmod +x mercor-desktop.AppImage',
            'Run the application',
          ],
        };
      default:
        return {
          title: 'Select Your Platform',
          subtitle: 'Choose your operating system below',
          fileName: 'mercor-desktop',
          icon: '💻',
          instructions: [],
        };
    }
  };

  const osContent = getOsSpecificContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Mercor Time Tracker</h1>
          <p className="text-xl text-gray-600">Track your time, boost your productivity</p>
        </div>

        {/* Main Download Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-blue-600 text-white p-8 text-center">
              <div className="text-6xl mb-4">{osContent.icon}</div>
              <h2 className="text-3xl font-bold mb-2">{osContent.title}</h2>
              <p className="text-blue-100">{osContent.subtitle}</p>
            </div>

            <div className="p-8">
              {/* Download Button */}
              <div className="text-center mb-8">
                <button
                  onClick={handleDownload}
                  disabled={downloading || os === 'unknown'}
                  className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6 mr-3" />
                      Download {osContent.fileName}
                    </>
                  )}
                </button>
                
                {os === 'unknown' && (
                  <p className="mt-4 text-sm text-gray-500">
                    Please select your operating system manually below
                  </p>
                )}
              </div>

              {/* Installation Instructions */}
              {osContent.instructions.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Installation Instructions</h3>
                  <ol className="space-y-3">
                    {osContent.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="ml-3 text-gray-700">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Platform Selector */}
              <div className="border-t pt-6">
                <p className="text-sm text-gray-600 mb-4">Download for a different platform:</p>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setOs('mac')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      os === 'mac'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🍎</div>
                    <div className="font-medium">macOS</div>
                  </button>
                  <button
                    onClick={() => setOs('windows')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      os === 'windows'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🪟</div>
                    <div className="font-medium">Windows</div>
                  </button>
                  <button
                    onClick={() => setOs('linux')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      os === 'linux'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🐧</div>
                    <div className="font-medium">Linux</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <CheckCircle className="w-10 h-10 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Time Tracking</h3>
              <p className="text-gray-600">Start and stop timers with a single click. Track time across multiple projects.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <Monitor className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Screenshots</h3>
              <p className="text-gray-600">Automatic screenshots during work sessions for transparency and verification.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <Info className="w-10 h-10 text-purple-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Reports</h3>
              <p className="text-gray-600">View detailed reports of your tracked time and productivity metrics.</p>
            </div>
          </div>

          {/* System Requirements */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">System Requirements</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">macOS</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• macOS 10.15 or later</li>
                  <li>• 4GB RAM minimum</li>
                  <li>• 200MB disk space</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Windows</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Windows 10 or later</li>
                  <li>• 4GB RAM minimum</li>
                  <li>• 250MB disk space</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Linux</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ubuntu 20.04+ / similar</li>
                  <li>• 4GB RAM minimum</li>
                  <li>• 200MB disk space</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          {isAuthenticated && (
            <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Tracking?</h3>
              <p className="mb-6">Once you've installed the app, log in with your Mercor credentials to start tracking time.</p>
              <div className="inline-flex items-center text-lg">
                <span>Need help?</span>
                <ArrowRight className="w-5 h-5 ml-2" />
                <a href="mailto:support@mercor.com" className="ml-2 underline">
                  Contact Support
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
