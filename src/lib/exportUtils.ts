export function exportToCSV(filename: string, headers: string[], data: any[][]) {
  const processCell = (cell: any) => {
    let cellStr = cell === null || cell === undefined ? '' : String(cell);
    // Escape double quotes
    cellStr = cellStr.replace(/"/g, '""');
    // Enclose in quotes if it contains comma, newline or quotes
    if (cellStr.search(/("|,|\n)/g) >= 0) {
      cellStr = `"${cellStr}"`;
    }
    return cellStr;
  };

  const csvContent = [
    headers.map(processCell).join(','),
    ...data.map(row => row.map(processCell).join(','))
  ].join('\n');

  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for UTF-8 Excel support
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
