// What a screenshot review measures by eye, measured in the page: text set under 11 px, touch targets
// under 44 px, controls that reach outside the safe area, and text cut off by its box.
// `auditInPage` runs inside the browser (pass it to page.evaluate with the safe-area insets); it must not
// refer to anything outside itself.

/**
 * @param {number[]} safe  [top, right, bottom, left] safe-area insets in px
 * @returns {{ text: string[], targets: string[], outside: string[], cut: string[] }} one line per offender
 */
export function auditInPage(safe) {
  const [st, sr, sb, sl] = safe || [0, 0, 0, 0];
  const root = document.getElementById('mg-root');
  const W = window.innerWidth, H = window.innerHeight;
  const styleOf = (n) => getComputedStyle(n);
  /** Shown at all: not display:none, hidden or transparent anywhere up the tree, and with a box. */
  const shown = (n) => {
    for (let a = n; a && a !== document.body; a = a.parentElement) {
      const cs = styleOf(a);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false;
    }
    const r = n.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const onScreen = (r) => r.right > 0 && r.bottom > 0 && r.left < W && r.top < H;
  /** The part of a box left showing by the scrolling regions it sits in. */
  const visiblePart = (n) => {
    let r = n.getBoundingClientRect();
    let box = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    for (let a = n.parentElement; a && a !== root; a = a.parentElement) {
      const cs = styleOf(a);
      if (/(auto|scroll|hidden)/.test(cs.overflowY + cs.overflowX)) {
        const c = a.getBoundingClientRect();
        box = { left: Math.max(box.left, c.left), top: Math.max(box.top, c.top), right: Math.min(box.right, c.right), bottom: Math.min(box.bottom, c.bottom) };
      }
    }
    return box;
  };
  const name = (n) => {
    const parts = [];
    for (let a = n; a && a !== root && parts.length < 4; a = a.parentElement) parts.unshift(a.id ? '#' + a.id : a.tagName.toLowerCase() + (a.classList.length ? '.' + [...a.classList].slice(0, 2).join('.') : ''));
    return parts.join(' ');
  };
  const words = (n) => (n.getAttribute('aria-label') || n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 28);
  const out = { text: [], targets: [], outside: [], cut: [] };

  // ---- text under 11 px (a subscript 2, and text for screen readers only, are not reading text)
  const seen = new Set();
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (tw.nextNode()) {
    const t = tw.currentNode;
    if (!t.nodeValue.trim()) continue;
    const p = t.parentElement;
    if (!p || seen.has(p) || p.closest('sub, .sr, canvas, #mg-boot')) continue;
    seen.add(p);
    if (!shown(p)) continue;
    const v = visiblePart(p);
    if (v.right - v.left < 1 || v.bottom - v.top < 1 || !onScreen(v)) continue;
    const size = parseFloat(styleOf(p).fontSize);
    if (size < 10.95) out.text.push(`${size.toFixed(1)}px  ${name(p)}  “${t.nodeValue.trim().slice(0, 28)}”`);
  }

  // ---- things a thumb presses: 44 px each way (a switch is pressed by its row), and inside the safe area
  const SEL = 'button, [role="tab"], [role="radio"], [role="switch"], input[type="range"]';
  for (const n of root.querySelectorAll(SEL)) {
    if (n.disabled || !shown(n)) continue;
    const hitNode = n.classList.contains('mg-switch') ? (n.closest('.set-row') || n) : n;
    const r = hitNode.getBoundingClientRect();
    const v = visiblePart(hitNode);
    if (!onScreen(v) || v.right - v.left < 1 || v.bottom - v.top < 1) continue;      // scrolled out of its list: reachable by scrolling
    if (r.width < 43.5 || r.height < 43.5) out.targets.push(`${Math.round(r.width)}x${Math.round(r.height)}  ${name(n)}  “${words(n)}”`);
    // cut by the edge of a scrolling row (a tab off the side) or outside the safe area
    const cutX = v.left > r.left + 1 || v.right < r.right - 1;
    if (cutX || r.left < sl - 0.5 || r.right > W - sr + 0.5 || r.top < st - 0.5 || (r.bottom > H - sb + 0.5 && v.bottom > H - sb + 0.5))
      out.outside.push(`[${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.right)},${Math.round(r.bottom)}]  ${name(n)}  “${words(n)}”`);
  }

  // ---- a dialog's own buttons (Begin, Cancel, Done, Start the day) are on the screen without scrolling for them
  for (const n of root.querySelectorAll('#mg-panel .btns button, #mg-panel .sheet-ft button, #mg-panel .comms-ft button, #mg-panel .wake, #mg-panel .diff .go')) {
    if (!shown(n)) continue;
    const r = n.getBoundingClientRect(), v = visiblePart(n);
    if (v.bottom - v.top < r.height - 1 || r.bottom > H - sb + 0.5) out.outside.push(`below the fold: ${name(n)}  “${words(n)}”`);
  }

  // ---- text cut off by its own box (an ellipsis, a clamped line, a clipped tab)
  for (const n of root.querySelectorAll('*')) {
    if (!n.firstChild || n.closest('canvas, svg, .sr, #mg-boot')) continue;
    const cs = styleOf(n);
    const clipsX = cs.textOverflow === 'ellipsis' || (cs.overflowX === 'hidden' && cs.whiteSpace === 'nowrap');
    const clamps = cs.webkitLineClamp && cs.webkitLineClamp !== 'none';
    if (!clipsX && !clamps) continue;
    if (!n.textContent.trim() || !shown(n)) continue;
    if ((clipsX && n.scrollWidth > n.clientWidth + 1) || (clamps && n.scrollHeight > n.clientHeight + 2)) out.cut.push(`${name(n)}  “${n.textContent.trim().slice(0, 40)}”`);
  }
  return out;
}

/** Offender lines from an audit, as one list (for a test's detail), most serious kinds first. */
export function auditLines(a) {
  return [...a.outside.map((x) => 'outside: ' + x), ...a.cut.map((x) => 'cut: ' + x), ...a.targets.map((x) => 'target: ' + x), ...a.text.map((x) => 'text: ' + x)];
}
