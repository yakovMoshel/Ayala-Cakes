import { connectToMongo } from '@/server/DL/connectToMongo';
import AddCategoryForm from '@/Components/AddCategoryForm';

export default async function CategoriesAdminPage() {
  await connectToMongo();
  return (
    <div>
      <h1>ניהול קטגוריות</h1>
      <AddCategoryForm />
    </div>
  );
}


