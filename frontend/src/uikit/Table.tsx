import React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <table className="w-full bg-[#FFFFFF] shadow-lg rounded-lg border border-[#E5E7EB]">
      <thead>
        <tr className="bg-[#1F2937] text-white">
          {headers.map((header, index) => (
            <th key={index} className="p-3 text-center">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

interface TableRowProps {
  children: React.ReactNode;
}

const TableRow: React.FC<TableRowProps> = ({ children }) => {
  return (
    <tr className="border-b border-[#E5E7EB] hover:bg-[#F3F4F6]">{children}</tr>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  style?:any;
}

const TableCell: React.FC<TableCellProps> = ({ children,style = {} }) => {
  return <td className="p-3 text-center text-[#1E293B]" style={style}>{children}</td>;
};

export { Table, TableRow, TableCell };
