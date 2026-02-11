import './Table.scss';

interface TableProps {
  columns: { key: string; label: string }[];
  data: Record<string, any>[];
  renderCell?: (key: string, value: any, row: Record<string, any>) => React.ReactNode;
}

export function Table({ columns, data, renderCell }: TableProps) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {renderCell
                      ? renderCell(col.key, row[col.key], row)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
