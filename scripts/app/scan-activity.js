/* Scan-activity series, ported verbatim from the source app (app/scan-activity.mjs). */
const day = 86_400_000;
const demoStart = Date.UTC(2026, 8, 28);
export const demoStartDate = '2026-09-28';
export const demoEndDate = '2026-11-22';

function dateAt(offset) {
  return new Date(demoStart + offset * day).toISOString().slice(0, 10);
}

export function scanActivity(weeklyByCode, preset, start, end) {
  const ranges = {
    8: [demoStartDate, demoEndDate],
    4: [dateAt(28), demoEndDate],
    month: ['2026-10-01', '2026-10-31'],
    custom: [start, end],
  };
  const [from, to] = ranges[preset];
  const invalid = !from || !to || from > to;
  const points = [];
  let total = 0;
  if (!invalid) {
    for (let week = 0; week < 8; week += 1) {
      const point = { count: 0 };
      for (let weekday = 0; weekday < 7; weekday += 1) {
        const date = dateAt(week * 7 + weekday);
        if (date >= from && date <= to) {
          weeklyByCode.forEach((weeks) => {
            const count = weeks[week];
            point.count += Math.floor(count / 7) + Number(weekday < count % 7);
          });
          point.from ??= date;
          point.to = date;
        }
      }
      if (point.from) {
        points.push(point);
        total += point.count;
      }
    }
  }
  return {
    from, to, invalid, points, total,
  };
}

const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function scanDateLabel(date) {
  const [, month, dayOfMonth] = date.split('-').map(Number);
  return `${shortMonths[month - 1]} ${dayOfMonth}`;
}

export function scanPeriodLabel(from, to) {
  const startYear = from.slice(0, 4);
  const endYear = to.slice(0, 4);
  const endLabel = `${scanDateLabel(to)}, ${endYear}`;
  if (from === to) return endLabel;
  const startLabel = startYear === endYear ? scanDateLabel(from) : `${scanDateLabel(from)}, ${startYear}`;
  return `${startLabel} – ${endLabel}`;
}
