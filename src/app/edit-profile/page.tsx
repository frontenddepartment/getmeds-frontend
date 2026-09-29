import type { Metadata } from 'next';
import EditProfileRedirect from './EditProfileRedirect';
import './edit-profile.css';

/**
 * edit-profile.html in the original is only a redirect to /profile#details
 * (the second profile editor that stood here was removed; the URL is kept
 * because older links still point at it). A server redirect() cannot carry
 * the #details fragment, so this does what the original shell did:
 * location.replace(), with the same fallback link. (next.config.ts could do
 * it as a redirect to /profile#details; that file is coordinator-owned.)
 */
export const metadata: Metadata = {
  title: { absolute: 'Edit Profile | Getmeds' },
  alternates: { canonical: '/profile' },
  robots: { index: false, follow: false },
};

export default function EditProfilePage() {
  return (
    <div className="gm-edit-profile">
      <EditProfileRedirect />
      <p>
        Taking you to <a href="/profile#details" style={{ color: '#1D9FDA' }}>your profile</a>&hellip;
      </p>
    </div>
  );
}
