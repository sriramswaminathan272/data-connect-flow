
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Database, Cloud, CloudUpload, FileSpreadsheet, FileText, DatabaseBackup } from "lucide-react";
import ConnectorForm from "./ConnectorForm";

export interface ConnectorType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface DatabaseConnectorProps {
  onClose: () => void;
  onConnected?: (connector: ConnectorType) => void;
}

const DatabaseConnector = ({ onClose, onConnected }: DatabaseConnectorProps) => {
  const [selectedConnector, setSelectedConnector] = useState<ConnectorType | null>(null);

  const connectors: ConnectorType[] = [
    {
      id: "redshift",
      name: "Amazon Redshift",
      icon: "database",
      description: "Connect to Amazon Redshift data warehouse"
    },
    {
      id: "snowflake",
      name: "Snowflake",
      icon: "cloud",
      description: "Connect to Snowflake cloud data platform"
    },
    {
      id: "mysql",
      name: "MySQL",
      icon: "database-backup",
      description: "Connect to MySQL database"
    },
    {
      id: "s3",
      name: "Amazon S3",
      icon: "cloud-upload",
      description: "Connect to Amazon S3 bucket"
    },
    {
      id: "excel",
      name: "Excel Files",
      icon: "file-spreadsheet",
      description: "Connect to Excel spreadsheets"
    },
    {
      id: "csv",
      name: "CSV Files",
      icon: "file-text",
      description: "Connect to CSV text files"
    }
  ];

  const handleConnectorSelect = (connector: ConnectorType) => {
    setSelectedConnector(connector);
  };

  const handleCancel = () => {
    setSelectedConnector(null);
  };

  const handleConnected = (connector: ConnectorType) => {
    if (onConnected) {
      onConnected(connector);
    }
  };

  return (
    <Card className="relative p-6 bg-white shadow-md rounded-lg">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <X size={20} />
      </button>

      {selectedConnector ? (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-800">
              Connect to {selectedConnector.name}
            </h2>
            <p className="text-slate-600 mt-1">
              Enter your connection details below
            </p>
          </div>
          <ConnectorForm 
            connector={selectedConnector} 
            onCancel={handleCancel}
            onConnected={() => handleConnected(selectedConnector)}
          />
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-800">
              Choose a data source
            </h2>
            <p className="text-slate-600 mt-1">
              Select the type of data you want to connect to
            </p>
          </div>

          <Tabs defaultValue="databases">
            <TabsList className="w-full mb-6 grid grid-cols-3">
              <TabsTrigger value="databases">Databases</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="cloud">Cloud Storage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="databases" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {connectors
                  .filter(c => ["redshift", "snowflake", "mysql"].includes(c.id))
                  .map(connector => (
                    <ConnectorCard
                      key={connector.id}
                      connector={connector}
                      onSelect={handleConnectorSelect}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="files" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {connectors
                  .filter(c => ["excel", "csv"].includes(c.id))
                  .map(connector => (
                    <ConnectorCard
                      key={connector.id}
                      connector={connector}
                      onSelect={handleConnectorSelect}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="cloud" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {connectors
                  .filter(c => ["s3"].includes(c.id))
                  .map(connector => (
                    <ConnectorCard
                      key={connector.id}
                      connector={connector}
                      onSelect={handleConnectorSelect}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  );
};

interface ConnectorCardProps {
  connector: ConnectorType;
  onSelect: (connector: ConnectorType) => void;
}

const ConnectorCard = ({ connector, onSelect }: ConnectorCardProps) => {
  // Render appropriate icon based on connector type
  const renderIcon = () => {
    switch (connector.icon) {
      case 'database':
        return <Database className="mr-3 text-blue-600" />;
      case 'database-backup':
        return <DatabaseBackup className="mr-3 text-blue-600" />;
      case 'cloud':
        return <Cloud className="mr-3 text-blue-600" />;
      case 'cloud-upload':
        return <CloudUpload className="mr-3 text-blue-600" />;
      case 'file-spreadsheet':
        return <FileSpreadsheet className="mr-3 text-blue-600" />;
      case 'file-text':
        return <FileText className="mr-3 text-blue-600" />;
      default:
        return <Database className="mr-3 text-blue-600" />;
    }
  };
  
  return (
    <div
      className="p-4 border rounded-lg transition-colors hover:bg-slate-50 cursor-pointer"
      onClick={() => onSelect(connector)}
    >
      <div className="flex items-center mb-2">
        {renderIcon()}
        <h3 className="font-medium text-slate-800">{connector.name}</h3>
      </div>
      <p className="text-sm text-slate-600">{connector.description}</p>
    </div>
  );
};

export default DatabaseConnector;
