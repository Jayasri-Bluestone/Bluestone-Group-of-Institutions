/**
 * Parses a database date string as IST (+05:30).
 * @param {string} dateString 
 * @returns {Date}
 */
export const parseAsIST = (dateString) => {
  if (!dateString) return new Date(NaN);
  
  // If it's already a Date object, return it.
  if (dateString instanceof Date) return dateString;

  let str = String(dateString);
  
  // If it has Z or an offset, new Date() will handle it correctly.
  if (str.includes('Z') || /[+-]\d{2}:?\d{2}$/.test(str)) {
    return new Date(str);
  }

  // If it's a naive string (no Z, no offset), treat it as IST.
  // We append the IST offset so that the browser parses it accurately regardless of local settings.
  return new Date(str.replace(' ', 'T') + "+05:30");
};

export const formatToLocalDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = parseAsIST(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).replace(',', '');
};

export const formatToLocalDate = (dateString) => {
  if (!dateString) return "-";
  const date = parseAsIST(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
