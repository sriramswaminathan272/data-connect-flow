
import { useState } from "react";
import { Button } from "@/components/ui/button";
import DatabaseConnector, { ConnectorType } from "@/components/DatabaseConnector";
import DatabaseWorkspace from "@/components/DatabaseWorkspace";

const Index = () => {
  const [showConnector, setShowConnector] = useState(false);
  const [connectedDatabase, setConnectedDatabase] = useState<ConnectorType | null>(null);

  const handleConnected = (connector: ConnectorType) => {
    setShowConnector(false);
    setConnectedDatabase(connector);
  };

  const handleDisconnect = () => {
    setConnectedDatabase(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {!connectedDatabase ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900">Data Connection Hub</h1>
            <p className="mt-2 text-slate-600">Connect to your data sources and start analyzing</p>
          </header>

          {!showConnector ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="text-center max-w-md mx-auto">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Connect to your data</h2>
                <p className="text-slate-600 mb-8">
                  Integrate with databases, cloud storage, or local files to visualize and analyze your data.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => setShowConnector(true)} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Connect to Data
                </Button>
              </div>
            </div>
          ) : (
            <DatabaseConnector 
              onClose={() => setShowConnector(false)}
              onConnected={handleConnected} 
            />
          )}
        </div>
      ) : (
        <div className="h-screen flex flex-col">
          <DatabaseWorkspace 
            connector={connectedDatabase} 
            onDisconnect={handleDisconnect} 
          />
        </div>
      )}
    </div>
  );
};

export default Index;
