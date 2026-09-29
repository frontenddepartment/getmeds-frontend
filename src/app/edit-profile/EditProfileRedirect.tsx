'use client';

import { useEffect } from 'react';

// replace() rather than assign() so the back button returns to wherever the
// visitor actually came from instead of bouncing them through here again.
export default function EditProfileRedirect() {
  useEffect(() => {
    window.location.replace('/profile#details');
  }, []);
  return null;
}
