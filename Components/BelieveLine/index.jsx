import React from 'react';
import styles from './style.module.scss';
import { BiDish, BiCake, BiHappyAlt } from 'react-icons/bi';

export default function BelieveLine() {
  const advantages = [
    {
      icon: <BiDish />,
      title: 'טעם ומראה מושלם',
      description:
        'עוגה חייבת להיות מדהימה מבפנים בדיוק כמו שהיא יפה מבחוץ. אני משתמשת בחומרי הגלם האיכותיים ביותר ואופה כל עוגה בסמוך למועד המסירה, כדי להבטיח עוגה טריה עם טעם מושלם.',
    },
    {
      icon: <BiCake />,
      title: 'חוויה של WOW',
      description:
        'עוגה היא קודם כל רגע של אושר. כל עיצוב מותאם אישית במטרה לייצר חוויה בלתי נשכחת – מהרגע שפותחים את הקופסה, דרך החיוך המופתע של מי שמקבל אותה, ועד לביס האחרון.',
    },
    {
      icon: <BiHappyAlt />,
      title: 'ראש שקט מהרגע הראשון',
      description:
        'תהליך ההזמנה אצלי נועד לתת לכם שקט נפשי. מההודעה הראשונה ועד רגע האיסוף, אני כאן כדי להקשיב ולייעץ בסבלנות, ולדאוג שתקבלו בדיוק את מה שרציתם.',
    },
  ];

  return (
<div className={styles.believeLine}>
  {advantages.map((advantage, index) => (
    <div key={index} className={styles.advantageItem}>
      <div className={styles.icon}>{advantage.icon}</div>
      <div className={styles.text}>
        <h4>{advantage.title}</h4>
        <p>{advantage.description}</p>
      </div>
    </div>
  ))}
</div>

  );
}
