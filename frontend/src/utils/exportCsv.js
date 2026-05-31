// src/utils/exportCsv.js
// RFC 4180-compliant CSV export utility.
// No external CSV libraries are used.
//
// Escaping rules applied:
//   - Every field is wrapped in double-quotes.
//   - Internal double-quote characters are escaped by doubling: " → ""
//   - Commas and newlines inside fields are safe because they are inside quotes.
//   - A UTF-8 BOM (\uFEFF) is prepended so Microsoft Excel opens the file correctly.
//
// Blob cleanup rules applied:
//   - URL.createObjectURL() is called once.
//   - URL.revokeObjectURL() is called immediately after click (same synchronous tick).
//   - The temporary <a> element is removed from the DOM immediately after click.
//   - No object URL or DOM element is leaked.

/**
 * Wraps a single CSV field value in double-quotes and escapes internal quotes.
 *
 * @param {string | number | null | undefined} value
 * @returns {string} quoted and escaped CSV field
 */
function escapeCsvField(value) {
  // Coerce to string; treat null/undefined as empty string.
  const str = value == null ? '' : String(value);
  // Escape internal double-quotes by doubling them (RFC 4180 §2.7).
  const escaped = str.replace(/"/g, '""');
  // Wrap in double-quotes.
  return `"${escaped}"`;
}

/**
 * Converts an array of row arrays into a CRLF-delimited CSV string.
 * Each cell is individually escaped.
 *
 * @param {Array<Array<string | number | null>>} rows  — first row should be headers
 * @returns {string}  complete CSV body (no BOM — added by the caller)
 */
function buildCsvString(rows) {
  return rows
    .map((row) => row.map(escapeCsvField).join(','))
    .join('\r\n');
}

/**
 * Exports an array of complaint objects as a downloaded CSV file.
 *
 * Columns exported (in order):
 *   ID, Title, Description, Category, Priority, Status,
 *   Department, Admin Note, Student Name, Student Email, Date Submitted
 *
 * @param {Array<Object>} complaints — the currently visible/filtered complaints
 * @param {string} [filename] — optional filename override (without extension)
 */
export function exportComplaintsCsv(complaints, filename) {
  const safeFilename = filename
    ? `${filename}.csv`
    : `complaints-${new Date().toISOString().slice(0, 10)}.csv`;

  const headers = [
    'ID',
    'Title',
    'Description',
    'Category',
    'Priority',
    'Status',
    'Department',
    'Admin Note',
    'Student Name',
    'Student Email',
    'Date Submitted'
  ];

  const dataRows = complaints.map((c) => [
    c.id,
    c.title,
    c.description,
    c.category,
    c.priority,
    c.status,
    c.department || '',
    c.adminNote || '',
    c.user?.name || '',
    c.user?.email || '',
    c.createdAt || ''
  ]);

  const csvBody = buildCsvString([headers, ...dataRows]);

  // Prepend UTF-8 BOM for correct Excel rendering of special characters.
  const csvWithBom = '\uFEFF' + csvBody;

  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element, trigger the download, then clean up.
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  a.setAttribute('aria-hidden', 'true');
  document.body.appendChild(a);

  a.click();

  // Revoke the object URL and remove the anchor immediately after click —
  // both happen in the same synchronous tick so no memory or DOM leak occurs.
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
