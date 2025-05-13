
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash } from "lucide-react";

interface QueryExampleManagerProps {
  examples: string[];
  onAdd: (example: string) => void;
  onDelete?: (index: number) => void;
}

const QueryExampleManager = ({ 
  examples, 
  onAdd, 
  onDelete 
}: QueryExampleManagerProps) => {
  const [newExample, setNewExample] = useState("");
  
  const handleAddExample = () => {
    if (newExample.trim()) {
      onAdd(newExample);
      setNewExample("");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4 bg-slate-50">
        <Label htmlFor="new-example" className="block mb-2">Add a new example query:</Label>
        <Textarea 
          id="new-example"
          value={newExample}
          onChange={(e) => setNewExample(e.target.value)}
          placeholder="-- Example: Find top customers by revenue
SELECT c.customer_id, c.name, SUM(o.total) as total_spent
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name
ORDER BY total_spent DESC
LIMIT 10;"
          className="w-full h-40 font-mono text-sm mb-3"
        />
        <Button 
          onClick={handleAddExample}
          className="gap-1"
          disabled={!newExample.trim()}
        >
          <Save size={16} />
          Save Example
        </Button>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-md font-medium">Saved Examples:</h3>
        {examples.map((example, index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">Example #{index + 1}</h4>
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => onDelete(index)}
                >
                  <Trash size={16} />
                </Button>
              )}
            </div>
            <pre className="bg-slate-50 p-3 rounded border text-sm font-mono overflow-auto max-h-[200px]">
              {example}
            </pre>
          </Card>
        ))}
        
        {examples.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>No examples added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryExampleManager;
