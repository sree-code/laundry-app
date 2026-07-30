export function getDayType(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  if (day === 6) return 'saturday';
  if (day === 0) return 'sunday';
  return 'weekday';
}

export function formatMatchTitle(dateStr, dayType) {
  const d = new Date(dateStr + 'T12:00:00');
  const formatted = d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  if (dayType === 'holiday') return `Holiday Match — ${formatted}`;
  return formatted;
}

export function isValidMatchDay(dateStr, holidays = []) {
  const dayType = getDayType(dateStr);
  if (dayType === 'saturday' || dayType === 'sunday') return { valid: true, dayType };
  const holiday = holidays.find((h) => h.date === dateStr);
  if (holiday) return { valid: true, dayType: 'holiday', holidayName: holiday.name };
  return { valid: false, dayType: 'weekday' };
}

export const ROLES = ['wicket-keeper', 'batsman', 'bowler', 'all-rounder'];
