import React from 'react';

interface ImportPanelProps {
  isImporting: boolean;
  importCount: number;
  importError: string | null;
  importDone: boolean;
  onImport: () => void;
}

const ImportPanel: React.FC<ImportPanelProps> = ({
  isImporting,
  importCount,
  importError,
  importDone,
  onImport
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">LeetCode Question Retriever</h1>
        
        <div className="bg-yellow-100 p-4 rounded mb-6 text-yellow-800 border border-yellow-400">
          <p className="font-bold text-lg mb-2">Database Setup Required</p>
          <p>Your database is empty. You need to import LeetCode questions before you can use the application.</p>
        </div>
        
        {!importDone ? (
          <div className="text-center">
            <button
              onClick={onImport}
              disabled={isImporting}
              className="bg-blue-600 text-white px-6 py-3 rounded font-semibold mb-4 disabled:opacity-50 hover:bg-blue-700 transition"
            >
              {isImporting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </span>
              ) : 'Import LeetCode Questions'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              This will import free LeetCode questions from a JSON file. This operation is only needed once.
            </p>
          </div>
        ) : (
          <div className="bg-green-100 p-4 rounded mb-6 text-green-800 border border-green-400">
            <p className="font-medium">Import Complete!</p>
            <p>Successfully imported {importCount} questions to Firestore.</p>
            <p className="mt-2">Refresh the page to start using the application.</p>
            <div className="text-center mt-4">
              <button 
                onClick={() => window.location.reload()}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}
        
        {importError && (
          <div className="bg-red-100 p-4 rounded text-red-800 border border-red-400 mt-4">
            {importError}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportPanel; 