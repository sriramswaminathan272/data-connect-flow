
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Trash, Upload } from "lucide-react";
import { toast } from "sonner";

interface DocumentationUploaderProps {
  documents: string[];
  onUpload: (files: FileList | null) => void;
  onDelete?: (docName: string) => void;
}

const DocumentationUploader = ({ 
  documents, 
  onUpload, 
  onDelete 
}: DocumentationUploaderProps) => {
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-slate-300 rounded-md p-8 text-center">
        <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
        <p className="mb-4 text-slate-600">Drag and drop files or click to upload</p>
        <input
          type="file"
          id="file-upload"
          multiple
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
        <Button 
          variant="outline"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          Upload Files
        </Button>
      </div>
      
      <div>
        <h3 className="text-md font-medium mb-4">Uploaded Documentation:</h3>
        
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center p-3 border rounded-md bg-slate-50">
                <FileText className="h-5 w-5 mr-3 text-blue-500" />
                <span className="flex-1">{doc}</span>
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => onDelete(doc)}
                  >
                    <Trash size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 border rounded-md">
            <p>No documentation uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationUploader;
