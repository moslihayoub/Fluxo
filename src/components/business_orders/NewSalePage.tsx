'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import OrderDialog from './OrderDialog';

export default function NewSalePage() {
  const setActiveView = useStore((s) => s.setActiveView);
  const router = useRouter();

  const handleClose = () => {
    // Return to business orders view after completing or cancelling
    setActiveView('business_orders');
    router.push('/');
  };

  // Render the OrderDialog directly as a full-page form
  return <OrderDialog isOpen={true} onClose={handleClose} order={null} />;
}
