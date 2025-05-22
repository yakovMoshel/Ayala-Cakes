'use client';
import React from 'react';
import styles from './summer.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { FaPhone, FaWhatsapp, FaComments } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
// Import required modules
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';

const SummerLandingPage = () => {
    const carouselImages = [
        {
            src: 'https://i.imgur.com/FViEwgt.jpeg',
            alt: 'תלמידות מעצבות עוגות בקורס קונדיטוריה'
        },
        {
            src: 'https://i.imgur.com/uonanZZ.jpeg',
            alt: 'עוגות מעוצבות מעשה ידי המשתתפות'
        },
        {
            src: 'https://i.imgur.com/XWReb3t.jpeg',
            alt: 'תהליך למידה והתנסות בקורס'
        },
        {
            src: 'https://i.imgur.com/f47wSwp.jpeg',
            alt: 'עוגות מרשימות שנוצרו בקורס'
        },
        {
            src: 'https://i.imgur.com/vI3hbeD.jpeg',
            alt: 'תוצרים מרהיבים של המשתתפות'
        },
        {
            src: 'https://i.imgur.com/pkrSJ8r.jpeg',
            alt: 'עבודה מקצועית על עוגות'
        },
        {
            src: 'https://i.imgur.com/UFpBpPg.jpeg',
            alt: 'תהליכי עיצוב ועבודה על עוגות'
        },
        {
            src: 'https://i.imgur.com/WZY14rd.jpeg',
            alt: 'עוגות מעוצבות בסגנונות שונים'
        },
        {
            src: 'https://i.imgur.com/QHqTBbj.jpeg',
            alt: 'הדגמת טכניקות עיצוב מתקדמות'
        }
    ];

    return (
        <div className={styles.landingPage} role="main">
            {/* Hero Section */}
            <section className={styles.hero} aria-label="מידע ראשי">
                <div className={styles.heroBackground}>
                    <Image
                        src="/images/summer-hero.png"
                        alt="קורס קונדיטוריה לנוער - תמונת רקע"
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                        loading="eager"
                    />
                </div>
                <div className={styles.heroContent}>
                    <h1>קורס הקונדיטוריה של הקיץ מגיע לעיר שלכם!</h1>
                    <h2>
                        תכנית קיץ מקצועית ומהנה לבני ובנות נוער:
                        לומדים לאפות, מזלפים, מקשטים – ויוצאים עם תעודה, מתכונים ועוגה מעוצבת מקצועית בסיום
                    </h2>

                    <div className={styles.ctaButtons}>
                        <button
                            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                            aria-label="גלול למטה לפרטי הקורסים"
                        >
                            פרטים נוספים
                        </button>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className={styles.about}>
                <div className={styles.aboutContent}>
                    <h2>קורס קונדיטוריה מקצועי לנוער</h2>
                    <div className={styles.aboutText}>
                        <p>
                            קורס קונדיטוריה מקצועי וחווייתי שמותאם במיוחד לחופשת הקיץ – תכנית ממוקדת, קצרה ואפקטיבית לבני ובנות נוער בגילאי 12–16.
                            הקורס בנוי ממפגשים בני שעה וחצי, שכל אחד מהם משלב ידע תיאורטי בסיסי (חומרי גלם, תברואה, טכנולוגיה של אפייה) עם התנסות מעשית מלהיבה – כולל אפייה, זילוף, הרכבת עוגות ועיצוב אישי.
                        </p>

                        <p>
                            הקורס מתאים לכל נער ונערה – אין צורך בידע קודם – ומופעל כיום בהצלחה בטירת כרמל וביקנעם, בשיתוף פעולה מלא עם מחלקות הנוער העירוניות.
                            כל משתתף יוצא מהקורס עם עוגות בעיצוב אישי, תעודת סיום, חוברת מתכונים – ובעיקר: תחושת מסוגלות, יצירתיות וביטחון עצמי.
                        </p>

                    </div>
                    <div className={styles.aboutHighlights}>
                        <div className={styles.highlight}>
                            <span className={styles.icon}>👥</span>
                            <h3>קבוצות קטנות</h3>
                            <p>10-15 משתתפים</p>
                        </div>
                        <div className={styles.highlight}>
                            <span className={styles.icon}>⏱️</span>
                            <h3>משך מפגש</h3>
                            <p>שעה וחצי</p>
                        </div>
                        <div className={styles.highlight}>
                            <span className={styles.icon}>📅</span>
                            <h3>זמינות</h3>
                            <p>יולי-אוגוסט 2025</p>
                        </div>
                        <div className={styles.highlight}>
                            <span className={styles.icon}>🎯</span>
                            <h3>גילים</h3>
                            <p>12-16</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className={styles.gallery}>
                <div className={styles.galleryWrapper}>
                    <div className={styles.galleryTitle}>
                        <h2>רגעים מתוקים מהקורס</h2>
                        <p>הצצה לחוויה המיוחדת שמחכה למשתתפים בקורס הקונדיטוריה שלנו</p>
                    </div>
                    <div className={styles.galleryContainer}>
                        <Swiper
                            spaceBetween={30}
                            centeredSlides={true}
                            effect={'fade'}
                            autoplay={{
                                delay: 3500,
                                disableOnInteraction: false,
                                pauseOnMouseEnter: true
                            }}
                            pagination={{
                                clickable: true,
                                renderBullet: (index, className) => {
                                    return `<span class="${className}" aria-label="עבור לתמונה ${index + 1}"></span>`;
                                }
                            }}
                            navigation={{
                                prevEl: '.swiper-button-prev',
                                nextEl: '.swiper-button-next'
                            }}
                            modules={[Autoplay, Pagination, Navigation, EffectFade]}
                            className={styles.gallerySwiper}
                        >
                            {carouselImages.map((image, index) => (
                                <SwiperSlide key={index}>
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={image.src}
                                            alt={image.alt}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 768px) 100vw, 80vw"
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className={styles.socialProof}>
                <div className={styles.testimonials}>
                    <div className={styles.testimonial}>
                        <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                        <p>״אילה את מודל להשראה! נתת את כל כולך בשביל כל בת ובת שהייתה בקורס. בהסברים שלך היית כל כך מובנת והסברת ופרטת על כל חומר... את הסברת, עזרת, ונתת את כל הלב שלך״</p>
                        <cite>- ליאן</cite>
                    </div>

                    <div className={styles.testimonial}>
                        <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                        <p>״אלו היו הארבעה ימים הכי כיפים שהיו לי בחיים! אני עדיין בהלם שעשיתי הכל לבד. את מושלמת ואני אבוא לכל קורס שלך״</p>
                        <cite>- מיי</cite>
                    </div>

                    <div className={styles.testimonial}>
                        <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                        <p>״זה היה הקורס הכי מושלם שהייתי בו בחיים. היה לי כיף ברמות, נהנתי להכיר אותך וללמוד ממך. חבל לי שנגמר כי היה קורס נדיר״</p>
                        <cite>- אגם</cite>
                    </div>

                    <div className={styles.testimonial}>
                        <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                        <p>״אילה את אלופה! כל הכבוד על הסבלנות עם שני, זה לא מובן מאליו בכלל״</p>
                        <cite>- שירין</cite>
                    </div>

                    <div className={styles.testimonial}>
                        <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                        <p>״אילה אין עליך! למרות הכל הצלחתי לעשות עוגה מהממת ויותר חשוב למדתי המון. תודה שהצלחת לעזור למרות שהיה קשה״</p>
                        <cite>- שני</cite>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <h2>מה לומדים?</h2>
                <div className={styles.featureGrid}>
                    <div className={styles.feature}>
                        <span className={styles.icon}>🍦</span>
                        <h3>טכניקות זילוף ועיצוב</h3>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.icon}>🍰</span>
                        <h3>הרכבת עוגת שכבות יציבה</h3>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.icon}>📚</span>
                        <h3>טכנולוגיית מזון ותברואה</h3>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.icon}>🎂</span>
                        <h3>עוגה בעיצוב אישי וחוברת מתכונים</h3>
                    </div>
                </div>
            </section>

            {/* Course Options */}
            <section id="features" className={styles.courseOptions}>
                <h2>אפשרויות הקורס</h2>
                <div className={styles.optionsGrid}>
                    <div className={styles.option}>
                        <h3>העוגה הראשונה שלי</h3>
                        <div className={styles.duration}>5 מפגשים × 1.5 שעות</div>
                        <div className={styles.emphasis}>המסלול המושלם להתחלה מוצלחת בקונדיטוריה</div>
                        <ul>
                            <li>יסודות ההכנה של עוגת שכבות יציבה</li>
                            <li>תורת חומרי-הגלם</li>
                            <li>קרמים בסיסיים וזילוף דקורטיבי</li>
                            <li>עיטוף, פפיונים, טכניקות זילוף </li>
                        </ul>
                        <div className={styles.bonus}>
                            <strong>בסיום הקורס:</strong>
                            <p>עוגת שכבות מעוצבת + חוברת מתכונים + תעודה</p>
                        </div>
                        <button onClick={() => document.getElementById('contactDetails').scrollIntoView({ behavior: 'smooth' })}>
                            לפרטים והרשמה
                        </button>
                    </div>

                    <div className={`${styles.option} ${styles.recommended}`}>
                        <div className={styles.badge}>המסלול המומלץ!</div>
                        <h3>קונדיטור ג'וניור</h3>
                        <div className={styles.duration}>10 מפגשים × 1.5 שעות</div>
                        <div className={styles.emphasis}>כולל את כל תכני מסלול ״העוגה הראשונה שלי״</div>
                        <ul>
                            <li>הרחבת סגנונות עיצוב (דריפ, דפי סוכר)</li>
                            <li>עוגות בנטו</li>
                            <li>חלות ועוגות שמרים</li>
                            <li>התנסות עם צימקאו ועיצובים מתקדמים</li>
                        </ul>
                        <div className={styles.bonus}>
                            <strong>בסיום הקורס:</strong>
                            <p>עוגה מעוצבת + עוגת בנטו + עוגת שמרים + חוברת מתכונים + תעודה</p>
                        </div>
                        <button onClick={() => document.getElementById('contactDetails').scrollIntoView({ behavior: 'smooth' })}>
                            לפרטים והרשמה
                        </button>
                    </div>

                    <div className={styles.option}>
                        <h3>קונדיטור מאסטר</h3>
                        <div className={styles.duration}>15 מפגשים × 1.5 שעות</div>
                        <div className={styles.emphasis}>כולל את כל תכני המסלולים הקודמים</div>
                        <ul>
                            <li>גסטרונומיה וטכניקות פטיסרי מתקדמות</li>
                            <li>רד-וולווט, מוסים, טארטים, קרם ברולה</li>
                            <li>ניהול תפריט, תמחור ושיווק</li>
                            <li>ניהול מלאי וחישובי עלויות</li>
                        </ul>
                        <div className={styles.bonus}>
                            <strong>בסיום הקורס:</strong>
                            <p>כל מה שמקבלים בקורס "קונדיטור ג'וניור" + מארז קינוחים מקצועי + תיק עבודות + תעודה מקצועית

</p>
                        </div>
                        <button onClick={() => document.getElementById('contactDetails').scrollIntoView({ behavior: 'smooth' })}>
                            לפרטים והרשמה
                        </button>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className={styles.aboutInstructor}>
                <div className={styles.aboutWrapper}>
                    <div className={styles.instructorImage}>
                        <Image
                            src="/אילה אברהם.png"
                            alt="אילה - קונדיטורית ומדריכת הקורס"
                            width={300}
                            height={375}
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <div className={styles.instructorContent}>
                        <h2>מי מעבירה את הקורס?</h2>
                        <div className={styles.instructorDetails}>
                            <h3>אילה אברהם</h3>
                            <p className={styles.title}>קונדיטורית מוסמכת ומדריכת סדנאות</p>
                            <div className={styles.description}>
                                <p>
                                    כקונדיטורית מוסמכת עם שנים של ניסיון בתחום, אני מביאה איתי לא רק את הידע המקצועי, אלא גם את התשוקה להעביר אותו הלאה לדור הבא.
                                </p>
                                <p>
                                    במהלך השנים האחרונות זכיתי להדריך מאות בני ובנות נוער בקורסים ובסדנאות, תוך שימת דגש על חוויה לימודית מהנה ומעצימה. הגישה שלי משלבת מקצועיות עם סבלנות ותשומת לב אישית לכל משתתף ומשתתפת.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className={styles.benefits}>
                <div className={styles.benefitsContent}>
                    <h2>למה עיריות בוחרות דווקא בקורס הזה?</h2>

                    <div className={styles.benefitsGrid}>
                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>🛠️</div>
                            <div className={styles.benefitText}>
                                <h3>מסגרת מוכנה להפעלה</h3>
                                <p>
                                    הקורס מגיע כתכנית מוכנה מראש – עם תכנים מקצועיים וציוד מלא.
                                    אתם דואגים לחלל מתאים - ואני אדאג לכל השאר.
                                </p>
                            </div>
                        </div>

                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>👩🏾‍👧🏾‍👦🏾</div>
                            <div className={styles.benefitText}>
                                <h3>מתאים לכווולם</h3>
                                <p>
                                הקורס בנוי כך שכל משתתף ומשתתפת יוכלו להצליח ולהרגיש ביטחון – גם בלי רקע קודם באפייה או בקונדיטוריה.  
                                אני מתאימים את הקצב, ההסברים והאתגרים לפי גיל ורמה, כך שכל קבוצה נהנית מחוויה אישית, מהנה ומקדמת.                                </p>
                            </div>
                        </div>

                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>📚</div>
                            <div className={styles.benefitText}>
                            <h3>חוויה עם ערך מקצועי אמיתי</h3>
<p>
מעבר להנאה והיצירתיות – הקורס מעניק למשתתפים היכרות קרובה עם עולם הקונדיטוריה,  
כולל הקניית ידע, מונחים וטכניקות שימשיכו ללוות אותם גם אחרי שהקורס מסתיים.
</p>

                            </div>
                        </div>

                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>🗓️</div>
                            <div className={styles.benefitText}>
                            <h3>מענה איכותי לחופשת הקיץ</h3>
<p>
מסגרת מהנה ובטוחה לבני ובנות נוער ביולי–אוגוסט,  
שניתן להפעיל במסגרת מחלקות העירייה הרלוונטיות, בשיתוף פעולה עם מתנ"סים עירוניים –  
בקבוצה אחת, במספר מחזורים, או בכמה מוקדים ברחבי העיר.
</p>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            {/* <section className={styles.faq}>
                <h2>שאלות נפוצות</h2>
                <div className={styles.faqList}>
                    <details>
                        <summary>אפשר להפריד קבוצות לפי גיל?</summary>
                        <p>כן! אנחנו ממליצים על הפרדה בין גילאי 12-14 ו-15-16 לחוויה מותאמת יותר.</p>
                    </details>
                    <details>
                        <summary>מה לגבי אלרגיות?</summary>
                        <p>אנחנו ערוכים לעבודה עם אלרגיות שונות ומקפידים על סביבת עבודה בטוחה.</p>
                    </details>
                    <details>
                        <summary>איך עובד התשלום?</summary>
                        <p>התשלום מתבצע דרך העירייה/מתנ״ס, ואנחנו מציעים מחירים מיוחדים לקבוצות.</p>
                    </details>
                    <details>
                        <summary>כמה זמן מראש צריך לשריין?</summary>
                        <p>מומלץ לשריין לפחות חודשיים מראש כדי להבטיח זמינות בתאריכים המבוקשים.</p>
                    </details>
                </div>
            </section> */}

            {/* Contact Details Section - replacing the form */}
            <section id="contactDetails" className={styles.contactDetails}>
                <h2>לפרטים נוספים על הקורסים</h2>
                <div className={styles.detailsContainer}>
                    <div className={styles.detail}>
                        <FaPhone className={styles.icon} />
                        <div className={styles.info}>
                            <h3>טלפון</h3>
                            <Link href="tel:058-799-5083">058-799-5083</Link>
                        </div>
                    </div>
                    <div className={styles.detail}>
                        <FaWhatsapp className={styles.icon} />
                        <div className={styles.info}>
                            <h3>וואטסאפ</h3>
                            <Link href="https://api.whatsapp.com/send?phone=972587995083&text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%A7%D7%95%D7%A8%D7%A1%20%D7%94%D7%A7%D7%99%D7%A5">
                                שלחו הודעה
                            </Link>
                        </div>
                    </div>
                    <div className={styles.detail}>
                        <MdEmail className={styles.icon} />
                        <div className={styles.info}>
                            <h3>אימייל</h3>
                            <Link href="mailto:ayalapastry@gmail.com">ayalapastry@gmail.com</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile Sticky CTA */}
            <div className={styles.stickyCtaMobile}>
                <button onClick={() => document.getElementById('contactDetails').scrollIntoView({ behavior: 'smooth' })}>
                    <FaComments />
                    דברו איתי
                </button>
            </div>
        </div>
    );
};

export default SummerLandingPage; 