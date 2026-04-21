// tiny, zero-dep helpers
export function relativeTime(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export const MODALITIES = [
  { id: 'general', label: 'General', abbr: 'GEN' },
  { id: 'chest_xray', label: 'Chest X-ray', abbr: 'CXR' },
  { id: 'brain_mri', label: 'Brain MRI', abbr: 'MRI' },
  { id: 'ct_abdomen', label: 'CT Abdomen/Pelvis', abbr: 'CT' },
  { id: 'msk', label: 'Musculoskeletal', abbr: 'MSK' },
];

export function modalityLabel(id) {
  return MODALITIES.find((m) => m.id === id)?.label || 'General';
}

export function modalityAbbr(id) {
  return MODALITIES.find((m) => m.id === id)?.abbr || 'GEN';
}

// Render a very small subset of markdown for reports
export function renderReport(md) {
  if (!md) return '';
  const lines = md.split('\n');
  let html = '';
  let inList = false;
  const closeList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      continue;
    }
    const hm = /^(#{2,4})\s+(.*)$/.exec(line);
    if (hm) {
      closeList();
      const level = hm[1].length;
      html += `<h${level}>${inline(hm[2])}</h${level}>`;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`;
      continue;
    }
    closeList();
    html += `<p>${inline(line)}</p>`;
  }
  closeList();
  return html;
}

function inline(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}
