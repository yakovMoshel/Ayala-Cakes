import AdminWrapper from '@/Components/AdminWrapper';

// Wraps all /admin pages with the admin shell (sidebar + header)
export default function AdminLayout({ children }) {
  return <AdminWrapper>{children}</AdminWrapper>;
}


