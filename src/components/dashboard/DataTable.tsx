import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const getCellValue = (row: T, accessor: Column<T>["accessorKey"]) => {
    if (typeof accessor === "function") {
      return accessor(row);
    }
    return row[accessor] as React.ReactNode;
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn("font-semibold text-foreground", column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer",
                  rowIndex % 2 === 0 ? "bg-transparent" : "bg-muted/30"
                )}
              >
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={column.className}>
                    {getCellValue(row, column.accessorKey)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
