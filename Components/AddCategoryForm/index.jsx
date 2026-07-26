"use client";

import CategoryManager from '@/Components/CategoryManager';

/** Product categories — create + grid list (edit/delete off to preserve prior behavior). */
export default function AddCategoryForm() {
  return (
    <CategoryManager
      endpoint="/api/category"
      listVariant="grid"
      requireImage
      autoSlug={false}
      permissions={{ edit: false, delete: false }}
      labels={{
        createTitle: 'הוספת קטגוריה חדשה',
        listTitle: 'קטגוריות קיימות',
        emptyMessage: 'אין קטגוריות במערכת עדיין.',
        namePlaceholder: 'למשל: עוגות מוס, מארזים',
        slugPlaceholder: 'למשל: mousse-cakes',
        descriptionPlaceholder: 'תיאור קצר שיוצג לקוראים...',
        successMessage: 'הקטגוריה נוצרה בהצלחה! 🎉',
      }}
    />
  );
}
