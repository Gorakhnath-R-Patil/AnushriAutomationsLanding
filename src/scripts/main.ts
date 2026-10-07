// Progressive enhancement only: the page is fully readable and usable without this script.
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Reveal on scroll ── */
const revealIO = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
$$('.reveal').forEach((el) => revealIO.observe(el));

/* ── Stat counters ── */
const counterIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    counterIO.unobserve(e.target);
    const el = e.target as HTMLElement;
    const end = Number(el.dataset.count);
    const prefix = el.dataset.prefix ?? '';
    const suffix = el.dataset.suffix ?? '';
    if (reduceMotion) continue;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = `${prefix}${Math.round(end * (1 - Math.pow(1 - p, 3)))}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}, { threshold: 0.6 });
$$('[data-count]').forEach((el) => counterIO.observe(el));

/* ── Mobile nav ── */
const menuBtn = $<HTMLButtonElement>('.menu-btn');
const mobileNav = $('#mobile-nav');
const setMenu = (open: boolean) => {
  menuBtn?.setAttribute('aria-expanded', String(open));
  mobileNav?.classList.toggle('is-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
};
menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
mobileNav?.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
window.matchMedia('(min-width: 1000px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

/* ── Active nav link ── */
const navLinks = $$<HTMLAnchorElement>('.nav a');
const sectionIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
  }
}, { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach((a) => { const s = $(a.getAttribute('href')!); if (s) sectionIO.observe(s); });

/* ── Floating WhatsApp button follows the section being read ── */
const fab = $<HTMLAnchorElement>('.fab');
if (fab) {
  const setMsg = (msg: string) => { fab.href = `https://wa.me/${fab.dataset.waNumber}?text=${encodeURIComponent(msg)}`; };
  const waIO = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) setMsg((e.target as HTMLElement).dataset.waMsg ?? fab.dataset.waDefault ?? '');
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-wa-msg]').forEach((s) => waIO.observe(s));
}

/* ── Hero automation chain ── */
const flow = $('#flow');
if (flow) {
  const nodes = $$<HTMLButtonElement>('.flow__node', flow);
  const tag = $('[data-readout-tag]', flow)!;
  const text = $('[data-readout-text]', flow)!;
  const link = $<HTMLAnchorElement>('[data-readout-link]', flow)!;
  let current = 0;
  let timer: number | undefined;
  const select = (i: number) => {
    current = i;
    nodes.forEach((n, idx) => { n.classList.toggle('is-active', idx === i); n.setAttribute('aria-pressed', String(idx === i)); });
    const n = nodes[i];
    tag.textContent = `Stage 0${i + 1} · ${n.querySelector('.flow__label')?.textContent}`;
    text.textContent = n.dataset.caption ?? '';
    link.href = `#${n.dataset.service}`;
    link.firstChild!.textContent = `View ${n.dataset.serviceTitle} `;
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = undefined; } };
  const start = () => { if (!reduceMotion && !timer) timer = window.setInterval(() => select((current + 1) % nodes.length), 2600); };
  nodes.forEach((n, i) => {
    n.addEventListener('click', () => { stop(); select(i); });
    n.addEventListener('mouseenter', () => { stop(); select(i); });
    n.addEventListener('focus', () => { stop(); select(i); });
  });
  select(0);
  start();
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : undefined));
}

/* ── Service cards: tap/click to expand, request buttons preselect the form ── */
$$('.service__toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.service')!;
    const open = card.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
});
$$<HTMLAnchorElement>('a[data-service]').forEach((a) => {
  a.addEventListener('click', () => {
    const sel = $<HTMLSelectElement>('#q-type');
    if (sel && a.dataset.service) sel.value = a.dataset.service;
  });
});

/* ── Technology tabs ── */
const tabsWrap = $('[data-tabs]');
if (tabsWrap) {
  const tabs = $$<HTMLButtonElement>('[role=tab]', tabsWrap);
  const panels = $$('[data-panel]');
  const show = (i: number, focus = false) => {
    tabs.forEach((t, idx) => { t.setAttribute('aria-selected', String(idx === i)); t.tabIndex = idx === i ? 0 : -1; });
    panels.forEach((p, idx) => { p.hidden = idx !== i; });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show((i - 1 + tabs.length) % tabs.length, true); }
    });
  });
  show(0);
  panels.forEach((p) => p.classList.add('is-in'));
}

/* ── Process steps light up in sequence ── */
const stepList = $('[data-steps]');
if (stepList) {
  const items = $$('.step', stepList);
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    items.forEach((s, i) => setTimeout(() => s.classList.add('is-lit'), reduceMotion ? 0 : i * 350));
  }, { threshold: 0.25 });
  io.observe(stepList);
}

/* ── Reviews carousel ── */
$$('[data-carousel]').forEach((c) => {
  const track = $('.carousel__track', c)!;
  const prev = $<HTMLButtonElement>('[data-prev]', c)!;
  const next = $<HTMLButtonElement>('[data-next]', c)!;
  const step = () => (track.firstElementChild as HTMLElement).offsetWidth + 18;
  const update = () => {
    prev.disabled = track.scrollLeft < 8;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  update();
});

/* ── Project detail modal ── */
$$('[data-project]').forEach((card) => {
  const dlg = $<HTMLDialogElement>(`#project-${card.dataset.project}`);
  if (!dlg) return;
  card.addEventListener('click', () => dlg.showModal());
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || (e.target as HTMLElement).closest('[data-close]')) dlg.close();
  });
});

/* ── Map: load only on request ── */
const map = $('[data-map]');
$('[data-map-load]')?.addEventListener('click', () => {
  if (!map) return;
  const f = document.createElement('iframe');
  f.src = map.dataset.src!;
  f.title = map.dataset.title ?? 'Map';
  f.loading = 'lazy';
  f.referrerPolicy = 'no-referrer';
  map.replaceChildren(f);
});

/* ── Quote form ── */
const form = $<HTMLFormElement>('[data-quote-form]');
if (form) {
  const status = $('[data-status]', form)!;
  const submitBtn = $<HTMLButtonElement>('[data-submit]', form)!;
  const rules: Record<string, (v: string) => string> = {
    name: (v) => (v.trim().length < 2 ? 'Please enter your name.' : ''),
    phone: (v) => (/^\+?[0-9][0-9\s-]{7,16}$/.test(v.trim()) ? '' : 'Please enter a valid phone number, for example +91 97655 87045.'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.'),
    details: (v) => (v.trim().length < 10 ? 'Please describe your requirement in a few words (at least 10 characters).' : ''),
  };
  const field = (n: string) => form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement;
  const check = (n: string) => {
    const el = field(n);
    const msg = rules[n](el.value);
    $(`#e-${n}`, form)!.textContent = msg;
    el.setAttribute('aria-invalid', String(Boolean(msg)));
    return !msg;
  };
  Object.keys(rules).forEach((n) => {
    field(n).addEventListener('blur', () => check(n));
    field(n).addEventListener('input', () => { if (field(n).getAttribute('aria-invalid') === 'true') check(n); });
  });
  const validate = () => {
    const bad = Object.keys(rules).filter((n) => !check(n));
    if (bad.length) { field(bad[0]).focus(); return false; }
    return true;
  };
  const say = (kind: 'ok' | 'bad', html: string) => {
    status.hidden = false;
    status.className = `full form__status ${kind}`;
    status.innerHTML = html;
  };
  const value = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).value.trim();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.hidden = true;
    if (!validate()) return;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      say('ok', '<strong>Enquiry sent.</strong> We have received your details and will get in touch.');
    } catch {
      say('bad', `We could not send your enquiry from this page. Please use <strong>Send via WhatsApp</strong>, call <a href="tel:${form.dataset.tel}">${form.dataset.phone}</a> or email <a href="mailto:${form.dataset.email}">${form.dataset.email}</a>.`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Enquiry';
    }
  });

  $('[data-wa-send]', form)?.addEventListener('click', () => {
    if (!validate()) return;
    const lines = [
      `Hello ${form.dataset.company}, I would like to enquire about ${value('requirement_type')}.`,
      `Name: ${value('name')}`,
      value('company') ? `Company: ${value('company')}` : '',
      `Phone: ${value('phone')}`,
      `Email: ${value('email')}`,
      value('system') ? `PLC / Robot / System: ${value('system')}` : '',
      `Details: ${value('details')}`,
    ].filter(Boolean);
    window.open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
}
