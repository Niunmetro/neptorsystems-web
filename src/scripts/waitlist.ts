/* Neptor Systems — waitlist form submit.
   Progressive enhancement: without JS the form does a normal POST to the endpoint.
   With JS it posts in the background and shows an inline status, staying on the page. */

function ajaxUrl(action: string) {
  // FormSubmit exposes a JSON endpoint under /ajax/; other providers accept
  // the same URL with an Accept: application/json header.
  return action.includes('formsubmit.co/') && !action.includes('/ajax/')
    ? action.replace('formsubmit.co/', 'formsubmit.co/ajax/')
    : action;
}

function init() {
  const form = document.querySelector<HTMLFormElement>('form[data-waitlist="on"]');
  if (!form) return;
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!status || !btn) return;

  const show = (msg: string, ok: boolean) => {
    status.textContent = msg;
    status.style.display = 'block';
    status.style.color = ok ? 'var(--aqua-700)' : 'var(--status-alert)';
  };

  form.addEventListener('submit', async (e) => {
    if (!form.reportValidity()) return;      // let native validation speak first
    e.preventDefault();
    const label = btn.textContent || '';
    btn.disabled = true;
    show(form.dataset.sending || '…', true);

    try {
      const res = await fetch(ajaxUrl(form.action), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      show(form.dataset.ok || 'OK', true);
      btn.style.display = 'none';            // done: nothing left to click
    } catch {
      show(form.dataset.err || 'Error', false);
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
