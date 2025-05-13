
import { Table } from "lucide-react";

interface TempTableType {
  name: string;
  rowCount: number;
  columns: string[];
}

interface TempTablesPanelProps {
  tables: TempTableType[];
  onSelectTable?: (tableName: string) => void;
}

const TempTablesPanel = ({ tables, onSelectTable }: TempTablesPanelProps) => {
  return (
    <div>
      <h3 className="px-2 py-1 text-sm font-semibold text-slate-500 uppercase">Temporary Tables</h3>
      <div className="mt-1 space-y-1">
        {tables.map((table) => (
          <div 
            key={table.name}
            className="flex items-center justify-between py-1 px-2 rounded cursor-pointer text-sm hover:bg-slate-100"
            onClick={() => onSelectTable && onSelectTable(table.name)}
          >
            <div className="flex items-center">
              <Table size={14} className="mr-2 text-emerald-500" />
              {table.name}
            </div>
            <span className="text-xs text-slate-500">{table.rowCount} rows</span>
          </div>
        ))}
        
        {tables.length === 0 && (
          <div className="px-2 py-3 text-sm text-slate-500 text-center">
            No temporary tables yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TempTablesPanel;
