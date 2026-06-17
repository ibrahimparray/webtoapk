import { useState } from 'react';
import ConversionForm from './components/ConversionForm';
import ProgressLog from './components/ProgressLog';
import { submitBuild } from './services/api';
import type { BuildRequest, BuildStatus } from './types';

function App() {
  const [buildStatus, setBuildStatus] = useState<BuildStatus>({
    isBuilding: false,
    logs: [],
    downloadUrl: null,
    error: null
  });

  const handleBuildSubmit = async (request: BuildRequest) => {
    setBuildStatus({
      isBuilding: true,
      logs: ['🚀 Initiating APK build process...'],
      downloadUrl: null,
      error: null
    });

    try {
      await submitBuild(
        request,
        (message) => {
          setBuildStatus(prev => ({
            ...prev,
            logs: [...prev.logs, message]
          }));
        },
        (downloadUrl) => {
          setBuildStatus(prev => ({
            ...prev,
            isBuilding: false,
            logs: [...prev.logs, '✅ Build completed successfully!'],
            downloadUrl: downloadUrl
          }));
        },
        (message) => {
          setBuildStatus(prev => ({
            ...prev,
            isBuilding: false,
            logs: [...prev.logs, `❌ Error: ${message}`],
            error: message
          }));
        }
      );
    } catch (error) {
      setBuildStatus(prev => ({
        ...prev,
        isBuilding: false,
        logs: [...prev.logs, `❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const handleReset = () => {
    setBuildStatus({
      isBuilding: false,
      logs: [],
      downloadUrl: null,
      error: null
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Website to APK Converter</h1>
              <p className="text-sm text-gray-600 mt-1">Transform any HTTPS website into a native Android application</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ConversionForm 
              onSubmit={handleBuildSubmit} 
              isBuilding={buildStatus.isBuilding}
              onReset={handleReset}
              hasLogs={buildStatus.logs.length > 0}
            />
          </div>

          <div>
            <ProgressLog 
              logs={buildStatus.logs}
              isBuilding={buildStatus.isBuilding}
              downloadUrl={buildStatus.downloadUrl}
              error={buildStatus.error}
            />
          </div>
        </div>

        <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-start">
              <div className="bg-blue-100 text-blue-600 rounded-lg p-3 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Configure</h3>
              <p className="text-gray-600 text-sm">Enter your website URL, app name, and package identifier. Upload a custom icon if desired.</p>
            </div>
            <div className="flex flex-col items-start">
              <div className="bg-indigo-100 text-indigo-600 rounded-lg p-3 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Build</h3>
              <p className="text-gray-600 text-sm">Our backend generates a custom Android project and compiles it using Gradle into a release APK.</p>
            </div>
            <div className="flex flex-col items-start">
              <div className="bg-purple-100 text-purple-600 rounded-lg p-3 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Download</h3>
              <p className="text-gray-600 text-sm">Download your ready-to-install APK file and deploy it to any Android device or the Play Store.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Features Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Hardware-accelerated WebView with optimized performance</span>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Native file upload support with runtime permissions</span>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Intelligent back button navigation within web sessions</span>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>HTTPS-only enforcement for secure connections</span>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>DOM storage and JavaScript support enabled</span>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Full-screen immersive experience</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 text-sm">
            Built with ❤️ using React, Node.js, and Android Gradle
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
