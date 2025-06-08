// מטא-דטה לדף המועדפים
export const metadata = {
  title: 'המועדפים שלי - עוגות מעוצבות של אילה',
  description: 'כל העוגות המועדפות שלכם במקום אחד. שמרו ועקבו אחר העוגות שהכי מעניינות אתכם',
  robots: 'noindex', // מועדפים הוא דף אישי - לא צריך אינדקס
};

export default function FavoritesLayout({ children }) {
  return children;
} 