"use client";

import CategoryManager from '@/Components/CategoryManager';

export default function AddCategoryForm() {
  return (
    <CategoryManager
      endpoint="/api/category"
      listVariant="grid"
      requireImage
      autoSlug={false}
      permissions={{ edit: true, delete: true }}
      labels={{
        createTitle: 'הוספת קטגוריה חדשה',
        listTitle: 'קטגוריות קיימות',
        emptyMessage: 'אין קטגוריות במערכת עדיין.',
        namePlaceholder: 'למשל: עוגות מוס, מארזים',
        slugPlaceholder: 'למשל: mousse-cakes',
        descriptionPlaceholder: 'תיאור קצר שיוצג לקוראים...',
        successMessage: 'הקטגוריה נוצרה בהצלחה! 🎉',
        deleteConfirm: (name) =>
          `למחוק את הקטגוריה "${name}"? לא ניתן למחוק קטגוריה שמשויכים אליה מוצרים.`,
      }}
    />
  );
}
