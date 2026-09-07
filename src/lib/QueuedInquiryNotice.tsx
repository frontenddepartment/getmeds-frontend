import React, { useCallback, useEffect, useState } from 'react';
import { getApiUrl } from './api';
import { flushQueue, deleteQueued, INQUIRY_QUEUED_EVENT, type QueuedInquiry } from './offlineInquiry';

/**
 * QueuedInquiryNotice
 * ─────────────────────────────────────────────
 * Drops onto any page that carries an inquiry form. On mount, whenever the
 * connection returns, and whenever a submission is queued, it sends what it can
 * and then tells the visitor exactly where their inquiry stands.
 *
 * The telling is the point. An inquiry that vanishes into a queue and reappears
 * silently is worse than one that failed loudly, because the visitor never
 * learns whether Getmeds heard them. So the forms deliberately do NOT show their
 * success modal for a queued submission — this does the talking instead, and
 * only claims delivery once the server has actually accepted it.
 */
export function QueuedInquiryNotice() {
  const [sent, setSent] = useState(0);
  const [pending, setPending] = useState<QueuedInquiry[]>([]);
  const [waiting, setWaiting] = useState<QueuedInquiry[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const run = useCallback(async () => {
    const result = await flushQueue(getApiUrl());
    if (result.sent > 0) setSent((n) => n + result.sent);
    setPending(result.needsAttention);
    setWaiting(result.waiting);
    setDismissed(false); // a new development deserves to be seen again
  }, []);

  useEffect(() => {
    run();
    window.addEventListener('online', run);
    window.addEventListener(INQUIRY_QUEUED_EVENT, run);
    return () => {
      window.removeEventListener('online', run);
      window.removeEventListener(INQUIRY_QUEUED_EVENT, run);
    };
  }, [run]);

  const discard = async (id: string) => {
    await deleteQueued(id);
    setPending((list) => list.filter((q) => q.id !== id));
    setWaiting((list) => list.filter((q) => q.id !== id));
  };

  const nothingToSay = sent === 0 && pending.length === 0 && waiting.length === 0;
  if (dismissed || nothingToSay) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9998] px-4 pb-4 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.14)] border border-gray-100 p-4">
        {sent > 0 && (
          <p className="text-sm text-gray-700">
            <span className="font-semibold" style={{ color: '#61A644' }}>Sent.</span>{' '}
            {sent === 1 ? 'An inquiry you' : `${sent} inquiries you`} submitted while offline{' '}
            {sent === 1 ? 'has' : 'have'} now reached us.
          </p>
        )}

        {waiting.length > 0 && (
          <p className={`text-sm text-gray-700 ${sent > 0 ? 'mt-3 pt-3 border-t border-gray-100' : ''}`}>
            <span className="font-semibold" style={{ color: '#1D9FDA' }}>Saved on this device.</span>{' '}
            {waiting.length === 1 ? 'Your inquiry' : `${waiting.length} inquiries`} will be sent automatically as soon
            as you're back online — you can close the page.
          </p>
        )}

        {pending.map((item, i) => (
          <div key={item.id} className={sent > 0 || waiting.length > 0 || i > 0 ? 'mt-3 pt-3 border-t border-gray-100' : ''}>
            <p className="text-sm text-gray-700">
              An inquiry saved on this device still needs you
              {item.hadAttachments
                ? ' — your file was not kept on the device for privacy, so please attach it again.'
                : ' — the security check expired while you were offline.'}
            </p>
            <div className="mt-2.5 flex items-center gap-3">
              <a
                href={item.returnPath}
                className="text-white text-xs font-semibold rounded-full px-4 py-2"
                style={{ background: 'linear-gradient(135deg,#1D9FDA,#61A644)' }}
              >
                Finish it
              </a>
              <button
                type="button"
                onClick={() => discard(item.id)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Discard
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-3 text-xs text-gray-400 hover:text-gray-600"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
