/**
 * Sets container.innerHTML and re-executes any <script> tags inside it.
 * Browsers block scripts injected via innerHTML — this works around that.
 */
export function injectHTML(container: HTMLElement, html: string): void {
  container.innerHTML = html;
  container.querySelectorAll<HTMLScriptElement>('script').forEach(oldScript => {
    const newScript = document.createElement('script');
    Array.from(oldScript.attributes).forEach(attr =>
      newScript.setAttribute(attr.name, attr.value)
    );
    newScript.textContent = oldScript.textContent;
    oldScript.parentNode?.replaceChild(newScript, oldScript);
  });
}
