const Table = ({ columns, data, actions, onAction, loading, emptyMessage = 'No data found' }) => {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="table-header">{col.header}</th>
            ))}
            {actions && <th className="table-header text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={row.id || rowIdx} className="hover:bg-gray-50">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="table-cell">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {actions && (
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-2">
                      {actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => onAction && onAction(action.name, row)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            action.color === 'danger'
                              ? 'text-red-600 hover:bg-red-50'
                              : action.color === 'success'
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-primary-600 hover:bg-primary-50'
                          }`}
                          title={action.title}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;