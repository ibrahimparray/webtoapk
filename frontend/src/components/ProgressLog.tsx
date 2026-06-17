import { useEffect, useRef } from 'react';

interface ProgressLogProps {
  logs: string[];
  isBuilding: boolean;
  downloadUrl: string | null;
  error: string | null;
}

const ProgressLog = ({ logs, isBuilding, downloadUrl, error }: ProgressLogProps) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Build Progress</h2>
          <p className="text-indigo-100 text-sm mt-1">Real-time compilation logs will appear here</p>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="bg-gray-100 rounded-full p-6 mb-6">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Build</h3>
          <p className="text-gray-500 max-w-md">
            Fill out the configuration form and click "Build APK" to start the compilation process. 
            You'll see detailed progress logs here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Build Progress</h2>
            <p className="text-indigo-100 text-sm mt-1">
              {isBuilding ? 'Compilation in progress...' : downloadUrl ? 'Build completed!' : 'Build finished'}
            </p>
          </div>
          {isBuilding && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="text-white text-sm font-medium">Processing</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-900 p-4 font-mono text-sm max-h-[500px]">
        <div className="space-y-2">
          {logs.map((log, index) => {
            const isError = log.includes('❌') || log.includes('Error') || log.includes('error:');
            const isSuccess = log.includes('✅') || log.includes('Success') || log.includes('completed');
            const isWarning = log.includes('⚠️') || log.includes('Warning');
            const isInfo = log.includes('ℹ️') || log.includes('Info');
            const isStep = log.match(/^\d+\./);

            let textColor = 'text-gray-300';
            if (isError) textColor = 'text-red-400';
            else if (isSuccess) textColor = 'text-green-400';
            else if (isWarning) textColor = 'text-yellow-400';
            else if (isInfo) textColor = 'text-blue-400';
            else if (isStep) textColor = 'text-purple-400';

            return (
              <div key={index} className={`${textColor} flex items-start space-x-2 leading-relaxed`}>
                <span className="text-gray-600 select-none flex-shrink-0">{String(index + 1).padStart(3, '0')}:</span>
                <span className="flex-1 break-all">{log}</span>
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        {isBuilding && (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animation-delay-200"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animation-delay-400"></div>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Building your APK...</p>
              <p className="text-xs text-gray-500 mt-1">This typically takes 1-2 minutes. Please don't close this window.</p>
            </div>
          </div>
        )}

        {downloadUrl && !isBuilding && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900">APK Built Successfully!</p>
                <p className="text-xs text-green-700 mt-1">Your Android application is ready for download.</p>
              </div>
            </div>
            <a
              href={downloadUrl}
              download
              className="block w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white text-center px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download APK</span>
            </a>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Next steps:</strong> Transfer the APK to your Android device and install it. 
                You may need to enable "Install from Unknown Sources" in your device settings.
              </p>
            </div>
          </div>
        )}

        {error && !isBuilding && !downloadUrl && (
          <div className="flex items-start space-x-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Build Failed</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
              <p className="text-xs text-red-600 mt-2">Check the logs above for details. Try adjusting your configuration and rebuild.</p>
            </div>
          </div>
        )}

        {!isBuilding && !downloadUrl && !error && (
          <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-3">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-600">Build process completed. Check logs for details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressLog;
