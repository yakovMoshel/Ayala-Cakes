const TIME_ZONE = 'Asia/Jerusalem';

export const METRIC_RANGES = [
  { id: 'all', label: 'כל הזמן' },
  { id: 'today', label: 'היום' },
  { id: 'week', label: '7 ימים' },
  { id: 'lastWeek', label: 'שבוע שעבר' },
  { id: 'month', label: '30 ימים' },
  { id: 'lastMonth', label: 'חודש שעבר' },
  { id: 'year', label: 'שנה אחרונה' },
  { id: 'lastYear', label: 'שנה שעברה' },
];

const RANGE_IDS = new Set(METRIC_RANGES.map((range) => range.id));

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function getZonedParts(date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
  });
  const parts = Object.fromEntries(
    fmt
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: WEEKDAY_INDEX[parts.weekday] ?? 0,
  };
}

function offsetAt(instant) {
  const parts = getZonedParts(instant);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return asUtc - instant.getTime();
}

function matchesWallTime(instant, year, month, day, hour, minute, second) {
  const parts = getZonedParts(instant);
  return (
    parts.year === year &&
    parts.month === month &&
    parts.day === day &&
    parts.hour === hour &&
    parts.minute === minute &&
    parts.second === second
  );
}

/** UTC instant for a wall-clock time in Asia/Jerusalem. */
function zonedWallTimeToUtc(year, month, day, hour, minute, second) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  let result = new Date(utcGuess.getTime() - offsetAt(utcGuess));
  if (matchesWallTime(result, year, month, day, hour, minute, second)) return result;

  result = new Date(utcGuess.getTime() - offsetAt(result));
  return result;
}

function addCalendarDays(year, month, day, delta) {
  const utc = new Date(Date.UTC(year, month - 1, day + delta));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

function rollingStart(now, days) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * @returns {{ id: string, start: Date | null, end: Date | null } | null}
 * `end` is exclusive. Null start/end means unbounded.
 */
export function resolveMetricsRange(rangeId, now = new Date()) {
  const id = rangeId || 'all';
  if (!RANGE_IDS.has(id)) return null;
  if (id === 'all') return { id, start: null, end: null };

  const parts = getZonedParts(now);
  const startOfToday = zonedWallTimeToUtc(parts.year, parts.month, parts.day, 0, 0, 0);

  if (id === 'today') return { id, start: startOfToday, end: null };
  if (id === 'week') return { id, start: rollingStart(now, 7), end: null };
  if (id === 'month') return { id, start: rollingStart(now, 30), end: null };
  if (id === 'year') return { id, start: rollingStart(now, 365), end: null };

  if (id === 'lastWeek') {
    const startOfThisWeek = addCalendarDays(parts.year, parts.month, parts.day, -parts.weekday);
    const startOfLastWeek = addCalendarDays(
      startOfThisWeek.year,
      startOfThisWeek.month,
      startOfThisWeek.day,
      -7
    );
    return {
      id,
      start: zonedWallTimeToUtc(startOfLastWeek.year, startOfLastWeek.month, startOfLastWeek.day, 0, 0, 0),
      end: zonedWallTimeToUtc(startOfThisWeek.year, startOfThisWeek.month, startOfThisWeek.day, 0, 0, 0),
    };
  }

  if (id === 'lastMonth') {
    const prevYear = parts.month === 1 ? parts.year - 1 : parts.year;
    const prevMonth = parts.month === 1 ? 12 : parts.month - 1;
    return {
      id,
      start: zonedWallTimeToUtc(prevYear, prevMonth, 1, 0, 0, 0),
      end: zonedWallTimeToUtc(parts.year, parts.month, 1, 0, 0, 0),
    };
  }

  return {
    id,
    start: zonedWallTimeToUtc(parts.year - 1, 1, 1, 0, 0, 0),
    end: zonedWallTimeToUtc(parts.year, 1, 1, 0, 0, 0),
  };
}
