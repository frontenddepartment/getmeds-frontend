import { Metadata } from 'next';
import CartClient from './CartClient';

export const metadata: Metadata = {
  title: { absolute: 'Your Request List | Getmeds' },
  description: 'Products you have saved to request a quote from Getmeds. Held on this device only.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <CartClient />;
}
