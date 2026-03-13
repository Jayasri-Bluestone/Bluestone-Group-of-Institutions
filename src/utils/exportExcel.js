import * as XLSX from 'xlsx';

/**
 * Export data to an Excel (.xlsx) file with a "Save As" dialog if supported.
 * 
 * @param {string} filename - The name of the file to save (e.g., "leads.xlsx").
 * @param {Array} columns - Array of column definitions: { header: string, accessor: string | function }
 * @param {Array} rows - Array of data objects.
 */
export const exportToExcel = async (filename, columns, rows) => {
  if (!Array.isArray(columns) || columns.length === 0) return;
  const safeRows = Array.isArray(rows) ? rows : [];

  // Map data to a format json_to_sheet understands
  const worksheetData = safeRows.map((row) => {
    const item = {};
    columns.forEach((col) => {
      const raw = typeof col.accessor === "function" ? col.accessor(row) : row?.[col.accessor];
      item[col.header] = raw !== null && raw !== undefined ? raw : "";
    });
    return item;
  });

  // Create sheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  const safeFilename = filename.endsWith('.xlsx') ? filename : `${filename.split('.')[0]}.xlsx`;

  // Use File System Access API if available for "Save As" experience
  if (typeof window !== "undefined" && window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: safeFilename,
        types: [
          {
            description: "Excel file",
            accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
          },
        ],
      });
      
      const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      const writable = await handle.createWritable();
      await writable.write(buffer);
      await writable.close();
      return true;
    } catch (err) {
      if (err && err.name === "AbortError") return false;
      // Fallback on other errors
      console.error("Save File Picker error, falling back to legacy download:", err);
    }
  }

  // Fallback to traditional download
  XLSX.writeFile(workbook, safeFilename);
  return true;
};
