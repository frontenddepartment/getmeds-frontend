import type { Metadata } from 'next'
import { ogImageForFolder } from '@/lib/seo'
import EmployeeVerificationClient from './EmployeeVerificationClient'

// employee-verification.html served the title/description/robots below; the page's
// setPageMeta() call then added canonical, Open Graph and Twitter tags on mount.
// Both are rendered statically here.
const title = 'Employee Verification Portal - Getmeds'
const description =
  'Verify whether someone contacting you is a genuine Getmeds Philippines employee before sharing personal information or making any payment.'
const image = ogImageForFolder()

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://getmeds.ph/employee-verification' },
  openGraph: {
    type: 'website',
    siteName: 'Getmeds Philippines',
    title,
    description,
    images: [{ url: image }],
    url: 'https://getmeds.ph/employee-verification',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [image],
  },
}

export default function EmployeeVerificationPage() {
  return <EmployeeVerificationClient />
}
