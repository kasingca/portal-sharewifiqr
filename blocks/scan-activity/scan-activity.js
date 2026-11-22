import screenContext from '../../scripts/app/context.js';
import { listCodes } from '../../scripts/app/api.js';
import {
  demoEndDate, demoStartDate, scanActivity, scanDateLabel, scanPeriodLabel,
} from '../../scripts/app/scan-activity.js';
import {
  esc, html, icon, number, readConfig,
} from '../../scripts/app/ui.js';

const PRESETS = [['8', 'Last 8 weeks'], ['4', 'Last 4 weeks'], ['month', 'Last month'], ['custom', 'Custom dates']];

function chart(points) {
  const ceiling = Math.max(4, Math.ceil(Math.max(...points.map((p) => p.count)) / 4) * 4);
  const plot = points.map(({ count }, index) => [
    points.length === 1 ? 360 : (index * 720) / (points.length - 1),
    160 - (count * 160) / ceiling,
  ]);
  const line = plot.map((point) => point.join(',')).join(' ');
  const label = points.map((p) => `${scanPeriodLabel(p.from, p.to)}: ${p.count} scans`).join('; ');
  return `<div class="chart-body">
      <div class="chart-axis">${[4, 3, 2, 1, 0].map((step) => `<span>${number.format((ceiling * step) / 4)}</span>`).join('')}</div>
      <svg viewBox="0 0 720 160" preserveAspectRatio="none" role="img" aria-label="${esc(label)}">
        <defs><linearGradient id="plot-fill" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#7761ed" stop-opacity=".22"/><stop offset="1" stop-color="#7761ed" stop-opacity="0"/></linearGradient></defs>
        ${[0, 40, 80, 120, 160].map((y) => `<line x1="0" x2="720" y1="${y}" y2="${y}" stroke="#eeedf4" stroke-dasharray="5 5"/>`).join('')}
        ${plot.length > 1 ? `<polygon points="0,160 ${line} 720,160" fill="url(#plot-fill)"/><polyline points="${line}" fill="none" stroke="#7057e8" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>` : ''}
        ${plot.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="#7057e8" stroke-width="2"><title>${esc(scanPeriodLabel(points[i].from, points[i].to))} · ${points[i].count} scans</title></circle>`).join('')}
      </svg>
    </div>
    <div class="chart-dates${points.length === 1 ? ' single-date' : ''}">${points.map((p) => `<span>${scanDateLabel(p.from)}</span>`).join('')}</div>`;
}

/**
 * scan-activity block: scans over time with a period picker.
 * Config: `scope | workspace | code` (code = the code in `?id=`).
 * @param {Element} block
 */
export default async function decorate(block) {
  const { scope = 'workspace' } = readConfig(block);
  const ctx = await screenContext();
  block.textContent = '';
  if (ctx.unavailable) return;
  const codes = scope === 'code' && ctx.code ? [ctx.code] : await listCodes(ctx.owner);
  const weeklyByCode = codes.map((code) => code.scans);
  const state = { preset: '8', start: demoStartDate, end: demoEndDate };

  const card = html(`<section class="card chart-card">
    <div class="card-heading scan-heading">
      <div><h2>Scan activity</h2><p>How often guests opened your Wi-Fi links</p></div>
      <label class="range"><span class="sr-only">Activity period</span><select>${PRESETS.map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select>${icon('chevron-down', 15)}</label>
    </div>
    <div class="date-filters scan-filters" role="group" aria-label="Scan date range" hidden>
      <label>From date<input type="date" name="start" value="${state.start}"></label>
      <label>To date<input type="date" name="end" value="${state.end}"></label>
    </div>
    <div class="scan-result"></div>
  </section>`);
  const result = card.querySelector('.scan-result');
  const filters = card.querySelector('.scan-filters');

  function update() {
    const {
      from, to, invalid, points, total,
    } = scanActivity(weeklyByCode, state.preset, state.start, state.end);
    filters.hidden = state.preset !== 'custom';
    if (invalid) {
      result.innerHTML = `<p class="scan-message" role="status">${state.start && state.end ? 'The end date must be on or after the start date.' : 'Enter a start and end date.'}</p>`;
      return;
    }
    result.innerHTML = `<div class="chart-value" aria-live="polite">${number.format(total)} <span>scans in this period</span></div>
      <p class="scan-period">${scanPeriodLabel(from, to)} · Demo activity through Nov 22, 2026</p>
      ${points.length ? chart(points) : '<p class="scan-message">No sample activity is available for these dates.</p>'}`;
  }

  card.querySelector('select').addEventListener('change', (event) => { state.preset = event.target.value; update(); });
  filters.addEventListener('change', (event) => { state[event.target.name] = event.target.value; update(); });
  update();
  block.append(card);
}
