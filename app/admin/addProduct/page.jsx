import { redirect } from 'next/navigation';

export default function LegacyAddProductPage() {
  redirect('/admin/products');
}
