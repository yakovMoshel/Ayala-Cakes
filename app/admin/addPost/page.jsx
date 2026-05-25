import { redirect } from 'next/navigation';

export default function LegacyAddPostPage({ searchParams }) {
  if (searchParams?.id) {
    redirect(`/admin/posts/${searchParams.id}/edit`);
  }
  redirect('/admin/posts');
}
