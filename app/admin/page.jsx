import AdminWrapper from "@/Components/AdminWrapper";

export default function AdminPage({ children }) {
  return (
    <AdminWrapper>
      {children}
    </AdminWrapper>
  );
}
