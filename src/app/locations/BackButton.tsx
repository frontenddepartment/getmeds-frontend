'use client';

/**
 * The way back to wherever opened this page — almost always a business card's
 * "Our locations" button. history.back() returns there with the card already
 * loaded; someone who landed here directly (shared link, bookmark) has no
 * history to go back to, so they get the homepage instead.
 */
export default function BackButton() {
  return (
    <button
      type="button"
      className="back"
      aria-label="Go back"
      onClick={() => {
        if (window.history.length > 1) window.history.back();
        else window.location.href = '/';
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" />
      </svg>
    </button>
  );
}
