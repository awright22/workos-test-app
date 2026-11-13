// What a screenshot review measures by eye, measured in the page: text set under 11 px (capitals under 13: a
// line of capitals is as tall as its capitals, seven tenths of its size), a figure run into its unit, touch targets
// under 44 px (a slider's handle and a switch included, and anything drawn as a button), controls that reach outside
// the safe area, text cut off by its box, text printed over other text, and content cut by the edge of the box or
// dialog it is in, or by the screen.
// `auditInPage` runs inside the browser (pass it to page.evaluate with the safe-area insets); it must not
// refer to anything outside itself.

/**
 * @param {number[]} safe  [top, right, bottom, left] safe-area insets in px
 * @returns {{ text: string[], targets: string[], outside: string[], cut: string[], over: string[], clipped: string[] }} one line per offender
 */
export function auditInPage(safe) {
  const [st, sr, sb, sl] = safe || [0, 0, 0, 0];
  const root = document.getElementById('mg-root');
  const W = window.innerWidth, H = window.innerHeight;
  const styleOf = (n) => getComputedStyle(n);
  /** Shown at all: not display:none, hidden or transparent anywhere up the tree, and with a box. */
  const shown = (n) => {
    // (visibility is inherited and a child can turn it back on: the thing's own computed value is the truth)
    if (styleOf(n).visibility === 'hidden') return false;
    for (let a = n; a && a !== document.body; a = a.parentElement) {
      const cs = styleOf(a);
      if (cs.display === 'none' || +cs.opacity < 0.05) return false;
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
  const out = { text: [], targets: [], outside: [], cut: [], over: [], clipped: [] };

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
    const cs = styleOf(p), size = parseFloat(cs.fontSize), said = t.nodeValue.trim();
    if (size < 10.95) out.text.push(`${size.toFixed(1)}px  ${name(p)}  “${said.slice(0, 28)}”`);
    // A label in capitals has no ascenders or descenders: what the eye measures is the capitals' height, seven tenths
    // of the type's size. At 11 px that is under 8 px of letter, and a reviewer reads it as 9 px type. Capitals are
    // therefore held to 13 px (9 px of letter). A lone letter or figure is not a label (a key cap, a count).
    else if (size < 12.95 && (said.match(/[A-Za-z]/g) || []).length >= 2 && (cs.textTransform === 'uppercase' || !/[a-z]/.test(said)))
      out.text.push(`capitals at ${size.toFixed(1)}px  ${name(p)}  “${said.slice(0, 28)}”`);
    // a figure and its unit are written apart, everywhere the same way ("28 L", not "28L")
    if (/\d(L|km|m)\b/.test(said) && !/\d(L|km|m)\b[-/]/.test(said)) out.text.push(`a figure run into its unit  ${name(p)}  “${said.slice(0, 28)}”`);
  }

  // ---- things a thumb presses: 44 px each way (a switch is pressed by its row), and inside the safe area
  /**
   * The size the style sheets give a slider's handle. It is a pseudo-element, which the page cannot measure, so the
   * rules that style it are read instead: those whose selector, less the pseudo-element, matches the slider, the more
   * specific and the later winning; and the value they give is resolved to pixels on a probe beside the slider.
   */
  const thumbSize = (input) => {
    const found = { width: null, height: null };
    const weigh = (sel) => (sel.match(/#/g) || []).length * 10000 + (sel.match(/\.|\[|:(?!:)/g) || []).length * 100 + (sel.match(/(^|[\s>+~])[a-z]/gi) || []).length;
    let order = 0;
    const visit = (rules) => {
      for (const rule of rules) {
        if (rule.cssRules && rule.media) { if (matchMedia(rule.media.mediaText).matches) visit(rule.cssRules); continue; }
        if (!rule.selectorText || !/::-webkit-slider-thumb/.test(rule.selectorText)) continue;
        for (const sel of rule.selectorText.split(',')) {
          if (!/::-webkit-slider-thumb\s*$/.test(sel)) continue;
          // (a state such as :hover or :active is not how it stands at rest)
          const base = sel.replace(/::-webkit-slider-thumb\s*$/, '').trim();
          if (/:(hover|active|focus)/.test(base)) continue;
          let hit = false;
          try { hit = input.matches(base || '*'); } catch (e) { hit = false; }
          if (!hit) continue;
          for (const prop of ['width', 'height']) {
            const val = rule.style.getPropertyValue(prop);
            if (!val) continue;
            const rank = (rule.style.getPropertyPriority(prop) ? 1e9 : 0) + weigh(base) * 1000 + (++order);
            if (!found[prop] || rank >= found[prop].rank) found[prop] = { val, rank };
          }
        }
      }
    };
    for (const sheet of document.styleSheets) { try { visit(sheet.cssRules); } catch (e) { /* a sheet from elsewhere */ } }
    const probe = document.createElement('i'), ics = styleOf(input);
    probe.style.cssText = 'position:absolute;visibility:hidden;display:block;padding:0;border:0;box-sizing:border-box';
    for (const prop of ['width', 'height']) {
      if (!found[prop]) continue;
      for (const v of found[prop].val.match(/--[\w-]+/g) || []) probe.style.setProperty(v, ics.getPropertyValue(v));
      probe.style.setProperty(prop, found[prop].val);
    }
    input.parentElement.appendChild(probe);
    const r = probe.getBoundingClientRect();
    probe.remove();
    return found.width && found.height ? { w: r.width, h: r.height } : null;
  };
  const SEL = 'button, [role="button"], [role="tab"], [role="radio"], [role="switch"], input[type="range"]';
  for (const n of root.querySelectorAll(SEL)) {
    if (n.disabled || !shown(n) || styleOf(n).pointerEvents === 'none') continue;
    const hitNode = n.classList.contains('mg-switch') ? (n.closest('.set-row') || n) : n;
    const r = hitNode.getBoundingClientRect();
    const v = visiblePart(hitNode);
    if (!onScreen(v) || v.right - v.left < 1 || v.bottom - v.top < 1) continue;      // scrolled out of its list: reachable by scrolling
    if (r.width < 43.5 || r.height < 43.5) out.targets.push(`${Math.round(r.width)}x${Math.round(r.height)}  ${name(n)}  “${words(n)}”`);
    // (what is pressed is the row, but what is seen is the switch: it is a thumb high as well. And a slider is worked
    //  by its handle, which is a thumb each way: the fifth review measured handles 44 by 32 and switches 56 by 32 on
    //  rows that passed here.)
    if (hitNode !== n) { const own = n.getBoundingClientRect(); if (own.height < 43.5 || own.width < 43.5) out.targets.push(`${Math.round(own.width)}x${Math.round(own.height)}  the switch itself: ${name(n)}  “${words(n)}”`); }
    if (n.matches('input[type="range"]')) { const th = thumbSize(n); if (!th || th.w < 43.5 || th.h < 43.5) out.targets.push(`${th ? Math.round(th.w) + 'x' + Math.round(th.h) : 'unmeasured'}  the handle of ${name(n)}  “${words(n)}”`); }
    // cut by the edge of a scrolling row (a tab off the side) or outside the safe area
    const cutX = v.left > r.left + 1 || v.right < r.right - 1;
    if (cutX || r.left < sl - 0.5 || r.right > W - sr + 0.5 || r.top < st - 0.5 || (r.bottom > H - sb + 0.5 && v.bottom > H - sb + 0.5))
      out.outside.push(`[${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.right)},${Math.round(r.bottom)}]  ${name(n)}  “${words(n)}”`);
  }

  // ---- anything drawn as a button is one: a ring or a frame round a single glyph, smaller than a thumb, with
  //      nothing larger round it that is itself a button. (A "?" in an 18 px ring under the suit's dial was the only
  //      sign that the panel it stood on could be pressed.) Key caps, a legend's swatches and a card's emblem are not.
  for (const n of root.querySelectorAll('span, i, b, em, div')) {
    if (n.closest('button, [role="tab"], [role="radio"], [role="switch"], .map-legend, .mg-kbd, .toast .ti, .ring, svg, #mg-boot, .sr, .badge, .chip, .diff')) continue;
    const said = n.textContent.trim();
    if (said.length > 2 || (!said && !n.querySelector(':scope > svg'))) continue;
    if (n.children.length > 1 || !shown(n)) continue;
    const cs = styleOf(n);
    if (!['Top', 'Right', 'Bottom', 'Left'].every((e) => cs['border' + e + 'Style'] === 'solid' && parseFloat(cs['border' + e + 'Width']) >= 1 && !/, 0\)$|transparent/.test(cs['border' + e + 'Color']))) continue;
    const r = n.getBoundingClientRect();
    if (r.width < 12 || r.height < 12 || (r.width >= 43.5 && r.height >= 43.5)) continue;
    if (parseFloat(cs.borderTopLeftRadius) < Math.min(r.width, r.height) * 0.2) continue;
    if (!onScreen(visiblePart(n))) continue;
    out.targets.push(`${Math.round(r.width)}x${Math.round(r.height)}  drawn as a button: ${name(n)}  “${said}”`);
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

  // ---- every line of text on the screen, as the box it is drawn in (the part its scrolling regions leave showing)
  /** The layer a thing is drawn in: text in one layer is laid out against the rest of that layer. The HUD, the toasts and the touch controls are one. */
  const layerOf = (n) => { let a = n; while (a.parentElement && a.parentElement !== root) a = a.parentElement; return /^mg-(hud|toast|touch)$/.test(a.id) ? 'play' : (a.id || a.className); };
  /** The block a text node's line belongs to: lines of one paragraph are set by the browser and are not compared with each other. */
  const blockOf = (n) => { for (let a = n; a && a !== root; a = a.parentElement) if (styleOf(a).display !== 'inline') return a; return root; };
  /** The box that clips a thing: its scrolling and clipping ancestors, and itself where it clips its own text. */
  const clipOf = (p) => {
    let box = { left: 0, top: 0, right: W, bottom: H };
    for (let a = p; a && a !== root; a = a.parentElement) {
      const cs = styleOf(a);
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowY + cs.overflowX)) {
        const c = a.getBoundingClientRect();
        box = { left: Math.max(box.left, c.left), top: Math.max(box.top, c.top), right: Math.min(box.right, c.right), bottom: Math.min(box.bottom, c.bottom) };
      }
    }
    return box;
  };
  const lines = [];
  const perParent = new Map();
  const range = document.createRange();
  const tw2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (tw2.nextNode()) {
    const t = tw2.currentNode;
    if (!t.nodeValue.trim()) continue;
    const p = t.parentElement;
    if (!p || p.closest('sub, sup, .sr, canvas, svg, #mg-boot, #mg-rotate, [aria-hidden="true"]')) continue;
    let info = perParent.get(p);
    if (!info) { info = { shown: shown(p) }; if (info.shown) { info.clip = clipOf(p); info.layer = layerOf(p); info.block = blockOf(p); } perParent.set(p, info); }
    if (!info.shown) continue;
    range.selectNodeContents(t);
    for (const r of range.getClientRects()) {
      if (r.width < 2 || r.height < 4) continue;
      const c = info.clip;
      const v = { left: Math.max(r.left, c.left), top: Math.max(r.top, c.top), right: Math.min(r.right, c.right), bottom: Math.min(r.bottom, c.bottom) };
      if (v.right - v.left < 2 || v.bottom - v.top < 3) continue;                 // scrolled out of its list, or clipped away
      lines.push({ full: r, v, p, t, layer: info.layer, block: info.block });
    }
  }
  const said = (l) => l.t.nodeValue.replace(/\s+/g, ' ').trim().slice(0, 26);

  // ---- text printed over other text (rows of a list that run into each other; a badge on top of a name)
  const pairs = new Set();
  for (let i = 0; i < lines.length; i++) {
    const a = lines[i];
    for (let j = i + 1; j < lines.length; j++) {
      const b = lines[j];
      if (a.layer !== b.layer || a.block === b.block) continue;
      const iw = Math.min(a.v.right, b.v.right) - Math.max(a.v.left, b.v.left);
      const ih = Math.min(a.v.bottom, b.v.bottom) - Math.max(a.v.top, b.v.top);
      if (iw < 3 || ih < 0.4 * Math.min(a.v.bottom - a.v.top, b.v.bottom - b.v.top)) continue;
      const key = name(a.p) + '|' + name(b.p) + '|' + said(a) + '|' + said(b);
      if (pairs.has(key)) continue;
      pairs.add(key);
      out.over.push(`“${said(a)}” (${name(a.p)}) and “${said(b)}” (${name(b.p)}) share [${Math.round(Math.max(a.v.left, b.v.left))},${Math.round(Math.max(a.v.top, b.v.top))} ${Math.round(iw)}x${Math.round(ih)}]`);
    }
  }

  // ---- a badge, a chip or a button drawn over text that is not its own (its frame and icon can cover a word
  //      where its own lettering does not touch it)
  for (const n of root.querySelectorAll('.badge, .chip, .mg-btn')) {
    if (!shown(n)) continue;
    const r = n.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const layer = layerOf(n);
    for (const l of lines) {
      if (l.layer !== layer || n.contains(l.p) || l.p.contains(n)) continue;
      const iw = Math.min(r.right, l.v.right) - Math.max(r.left, l.v.left), ih = Math.min(r.bottom, l.v.bottom) - Math.max(r.top, l.v.top);
      if (iw < 3 || ih < 0.4 * (l.v.bottom - l.v.top)) continue;
      const key = name(n) + '|' + name(l.p) + '|' + said(l);
      if (pairs.has(key)) continue;
      pairs.add(key);
      out.over.push(`“${said(l)}” (${name(l.p)}) is under ${name(n)} “${words(n)}”`);
    }
  }

  // ---- text cut by the edge of the box it is in or by the screen: a line that is partly showing and partly not
  //      (a line sliced through by a card's edge; a word hanging off the side of its button). Text that a scrolling
  //      region has scrolled out of sight is not this: a scrolling region says there is more with its cue (below).
  const BOXES = '.card, .rcp, .dlg, .toast, .choice, .stat, .inv-row, .mg-btn, .badge, .chip, .menu-item, .diff, .set-row, .obj, .mg-line, .row, #mg-prompt, .tabs button, .col-bar, .pane-hd, .map-info, .map-status, .scr-hd';
  const cutSeen = new Set();
  for (const l of lines) {
    const f = l.full;
    const off = f.left < -1 || f.right > W + 1 || f.top < -1 || f.bottom > H + 1;
    const box = l.p.closest(BOXES);
    let outBox = false;
    // (up and down, a line's box is its type's full height, a third of it empty over the capitals and under the
    //  baseline: a tight row may let that empty part hang out of it and still hold every letter)
    if (box) {
      const r = box.getBoundingClientRect(), slack = Math.max(1.5, 0.34 * parseFloat(styleOf(l.p).fontSize));
      outBox = f.left < r.left - 1.5 || f.right > r.right + 1.5 || f.top < r.top - slack || f.bottom > r.bottom + slack;
    }
    // sliced: more than a sliver of the line is hidden by a clipping ancestor that does not scroll
    let sliced = false;
    const hidX = (f.right - f.left) - (l.v.right - l.v.left), hidY = (f.bottom - f.top) - (l.v.bottom - l.v.top);
    if (hidX > 2 || hidY > 2) {
      for (let a = l.p; a && a !== root; a = a.parentElement) {
        const cs = styleOf(a);
        // (each way on its own: a list that scrolls down and clips sideways cuts nothing by its foot)
        const clipX = /(hidden|clip)/.test(cs.overflowX), clipY = /(hidden|clip)/.test(cs.overflowY);
        if (!clipX && !clipY) continue;
        if (cs.textOverflow === 'ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none')) continue;      // reported as "cut" above
        const c = a.getBoundingClientRect();
        if ((clipX && (f.left < c.left - 1 || f.right > c.right + 1)) || (clipY && (f.top < c.top - 1 || f.bottom > c.bottom + 1))) { sliced = name(a); break; }
      }
    }
    if (!off && !outBox && !sliced) continue;
    const key = name(l.p) + said(l);
    if (cutSeen.has(key)) continue;
    cutSeen.add(key);
    out.clipped.push(`${off ? 'off the screen' : sliced ? 'cut by ' + sliced : 'outside its ' + name(box)}: “${said(l)}” (${name(l.p)})`);
  }

  // ---- a box that clips and does not scroll, with more in it than it shows
  const DECOR = '#mg-root, .map-wrap, .tk, .fl, .strip, #mg-compass, #mg-compass *, .ring, canvas, svg, svg *, .sr, #mg-boot, #mg-boot *, #mg-flash, #mg-joy, #mg-joy *, .prog, .prog *';
  for (const n of root.querySelectorAll('*')) {
    if (n.matches(DECOR) || !n.firstElementChild && !n.textContent.trim()) continue;
    const cs = styleOf(n);
    const clipY = /(hidden|clip)/.test(cs.overflowY), clipX = /(hidden|clip)/.test(cs.overflowX);
    if (!clipY && !clipX) continue;
    if (cs.textOverflow === 'ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none')) continue;          // reported as "cut" above
    if (!n.textContent.trim() || !shown(n)) continue;
    const more = (clipY && n.scrollHeight > n.clientHeight + 2) || (clipX && n.scrollWidth > n.clientWidth + 2);
    if (more) out.clipped.push(`holds more than it shows (${n.scrollWidth}x${n.scrollHeight} in ${n.clientWidth}x${n.clientHeight}): ${name(n)}  “${n.textContent.replace(/\s+/g, ' ').trim().slice(0, 30)}”`);
  }

  // ---- a scrolling region with more below says so (the "More" cue), and one that is at its end does not
  for (const n of root.querySelectorAll('.mg-scroll')) {
    if (!shown(n)) continue;
    const below = n.scrollHeight - n.clientHeight - n.scrollTop > 12;
    const cue = n.querySelector(':scope > .more-cue');
    const cueShown = !!cue && getComputedStyle(cue).visibility === 'visible';
    if (below && !cueShown) out.clipped.push(`scrolls with nothing to say so: ${name(n)}`);
  }
  return out;
}

/**
 * True once nothing on the page is part-way through a finite animation or transition. Runs in the browser: wait
 * for it before measuring, or a dialog still fading in is measured as not there at all. (An animation's clock only
 * moves when a frame is drawn, and software rendering under load draws one a second.)
 */
export function settledInPage() {
  return document.getAnimations().every((a) => {
    if (a.playState !== 'running') return true;
    const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
    return !!t && !isFinite(t.endTime);
  });
}

/** Offender lines from an audit, as one list (for a test's detail), most serious kinds first. */
export function auditLines(a) {
  return [...(a.over || []).map((x) => 'over: ' + x), ...(a.clipped || []).map((x) => 'clipped: ' + x), ...a.outside.map((x) => 'outside: ' + x), ...a.cut.map((x) => 'cut: ' + x),
    ...a.targets.map((x) => 'target: ' + x), ...a.text.map((x) => 'text: ' + x)];
}
