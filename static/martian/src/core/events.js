// A tiny event bus, so systems can react to things (a footstep, a landing) without importing
// each other. emit(name, data) / on(name, fn).
const subs = new Map();
export function on(name, fn) { if (!subs.has(name)) subs.set(name, []); subs.get(name).push(fn); return () => off(name, fn); }
export function off(name, fn) { const l = subs.get(name); if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); } }
export function emit(name, data) { const l = subs.get(name); if (l) for (const fn of l.slice()) fn(data); }
