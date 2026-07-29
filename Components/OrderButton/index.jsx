"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Button from '@/Components/Button';

const OrderPopup = dynamic(() => import('../OrderPopup'), { ssr: false });

export default function OrderButton({ item }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <Button fullWidth onClick={() => setShowForm(true)}>
        הזמנה
      </Button>
      {showForm && (
        <OrderPopup item={item} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
