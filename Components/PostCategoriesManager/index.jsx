"use client";

import CategoryManager from '@/Components/CategoryManager';

export default function PostCategoriesManager() {
  return (
    <CategoryManager
      endpoint="/api/post-category"
      listVariant="list"
      autoSlug
      permissions={{ edit: true, delete: true }}
      labels={{
        createTitle: 'הוספת קטגוריית בלוג',
        listTitle: 'קטגוריות קיימות',
        emptyMessage: 'אין קטגוריות בלוג עדיין.',
        namePlaceholder: 'למשל: מתכונים, טיפים',
        slugPlaceholder: 'למשל: recipes',
        descriptionPlaceholder: 'תיאור קצר שיוצג לקוראים...',
        successMessage: 'הקטגוריה נוצרה בהצלחה!',
        deleteConfirm: (name) =>
          `למחוק את הקטגוריה "${name}"? פוסטים שמשויכים אליה יישארו ללא קטגוריה.`,
      }}
    />
  );
}
