
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { ConnectorType } from "./DatabaseConnector";
import { toast } from "sonner";

interface ConnectorFormProps {
  connector: ConnectorType;
  onCancel: () => void;
  onConnected: () => void;
}

const ConnectorForm = ({ connector, onCancel, onConnected }: ConnectorFormProps) => {
  const [formData, setFormData] = useState({
    server: "",
    port: connector.id === "redshift" ? "5439" : connector.id === "mysql" ? "3306" : "",
    database: "",
    username: "",
    password: "",
    requireSSL: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    
    // Simulate connection attempt
    setTimeout(() => {
      setIsConnecting(false);
      
      // For demo purposes, let's say Redshift and Snowflake connect successfully
      if (connector.id === "redshift" || connector.id === "snowflake") {
        toast.success(`Successfully connected to ${connector.name}`);
        onConnected();
      } else {
        toast.error(`Failed to connect to ${connector.name}. Please check your credentials.`);
      }
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="general">
        <TabsList className="w-full mb-6 justify-start border-b rounded-none">
          <TabsTrigger value="general" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
            General
          </TabsTrigger>
          <TabsTrigger value="initial-sql" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
            Initial SQL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="server">Server</Label>
              <Input
                id="server"
                name="server"
                value={formData.server}
                onChange={handleChange}
                placeholder={
                  connector.id === "redshift"
                    ? "redshift.example.com"
                    : connector.id === "snowflake"
                    ? "organization.snowflakecomputing.com"
                    : "server address"
                }
                required
              />
            </div>
            
            <div>
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                name="port"
                value={formData.port}
                onChange={handleChange}
                placeholder="Port number"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="database">Database</Label>
              <Input
                id="database"
                name="database"
                value={formData.database}
                onChange={handleChange}
                placeholder="Database name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Optional"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="requireSSL" 
                name="requireSSL"
                checked={formData.requireSSL}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, requireSSL: checked === true })
                }
              />
              <label
                htmlFor="requireSSL"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Require SSL
              </label>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="initial-sql">
          <div className="space-y-6">
            <p className="text-sm text-slate-600">
              Optionally enter SQL commands to run when connecting to the database.
            </p>
            <textarea 
              className="w-full h-32 p-3 border rounded-md font-mono text-sm" 
              placeholder="-- Enter SQL commands here"
            />
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Connect
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConnectorForm;
