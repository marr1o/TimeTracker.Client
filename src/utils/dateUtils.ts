/**
 * Форматирует Date в формат YYYY-MM-DD без проблем с часовыми поясами
 */
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Конвертирует дату из формата YYYY-MM-DD или Date в DD.MM.YYYY
 */
export const formatDateToBackend = (date: Date | string): string => {
  let d: Date;
  if (typeof date === 'string') {
    // Если строка в формате YYYY-MM-DD, парсим её напрямую без часового пояса
    const parts = date.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      d = new Date(year, month, day);
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Конвертирует дату из формата DD.MM.YYYY в YYYY-MM-DD
 */
export const parseDateFromBackend = (dateString: string): string => {
  const parts = dateString.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid date format. Expected DD.MM.YYYY');
  }
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Форматирует дату для отображения
 */
export const formatDateForDisplay = (dateString: string): string => {
  try {
    const isoDate = parseDateFromBackend(dateString);
    const date = new Date(isoDate);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

