export const exportToCsv = async (filename, columns, rows, options = {}) => {
  if (!Array.isArray(columns) || columns.length === 0) return;
  const safeRows = Array.isArray(rows) ? rows : [];

  const toCell = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => toCell(c.header)).join(",");
  const body = safeRows
    .map((row) =>
      columns
        .map((c) => {
          const raw = typeof c.accessor === "function" ? c.accessor(row) : row?.[c.accessor];
          return toCell(raw);
        })
        .join(",")
    )
    .join("\n");

  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const useSaveDialog = options.useSaveDialog !== false;

  if (useSaveDialog && typeof window !== "undefined" && window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename || "export.csv",
        types: [
          {
            description: "CSV file",
            accept: { "text/csv": [".csv"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err) {
      if (err && err.name === "AbortError") return false;
    }
  }

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename || "export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
};
