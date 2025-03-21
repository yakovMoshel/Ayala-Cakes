import AdminWrapper from '@/components/AdminWrapper';

export default function AdminPage({ children }) {
  return (
    <AdminWrapper>
      {children}
    </AdminWrapper>
  );
}
