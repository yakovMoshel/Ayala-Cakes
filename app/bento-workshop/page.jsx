'use client';
import React from 'react';
import styles from './style.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { FaPhone, FaWhatsapp, FaComments } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import WorkshopOption from '../../Components/WorkshopOption';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
// Import required modules
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';

const BentoWorkshopPage = () => {
    const carouselImages = [
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991228/ayala-media/file_wf3r95.webp',
            alt: 'בנות יוצרות עוגות בנטו בסדנה'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991226/ayala-media/file_cw2orb.webp',
            alt: 'עוגות בנטו מעוצבות מעשה ידי המשתתפות'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991225/ayala-media/file_pllstj.webp',
            alt: 'תהליך למידה והתנסות בסדנת בנטו'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991224/ayala-media/file_cubdxc.webp',
            alt: 'עוגות בנטו מרשימות שנוצרו בסדנה'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991222/ayala-media/file_m5xqlx.webp',
            alt: 'תוצרים מרהיבים של המשתתפות'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991220/ayala-media/file_wwcuxr.webp',
            alt: 'עבודה מקצועית על עוגות בנטו'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991218/ayala-media/file_nh16ji.webp',
            alt: 'תהליכי עיצוב ועבודה על עוגות בנטו'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991217/ayala-media/file_qvwhjj.webp',
            alt: 'עוגות בנטו מעוצבות בסגנונות שונים'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991215/ayala-media/file_mdgurv.webp',
            alt: 'הדגמת טכניקות עיצוב מתקדמות לעוגות בנטו'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991212/ayala-media/file_cztkjp.webp',
            alt: 'תוצרים מיוחדים מעוגות בנטו'
        },
        {
            src: 'https://res.cloudinary.com/ddopx40bu/image/upload/f_auto,q_auto,c_limit,w_1200,dpr_auto/v1754991209/ayala-media/file_dluyoe.webp',
            alt: 'חוויה יצירתית בסדנת הבנטו'
        }
    ];
    
    return (
        <div className={styles.landingPage} role="main">
            {/* Hero Section */}
            <section className={styles.hero} aria-label="מידע ראשי">
                <div className={styles.heroBackground}>
                    <Image
                        src="/images/summer-hero.png"
                        alt="סדנת עוגות בנטו - תמונת רקע"
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                        loading="eager"
                    />
                </div>
                <div className={styles.heroContent}>
                    <h1>סדנת בנטו – החוויה המושלמת ליום ההולדת שלך</h1>
                    <h2>
                        חוגגת יום הולדת לבת שלך? הסדנה המושלמת ליום ההולדת – יצירה, גיבוש, תוצאה מהממת וזיכרון שישאר לה (ולך) לתמיד.
                        עוגות בנטו מעוצבות, קצפות צבעוניות, חוויה צבעונית כיפית ומתוקה.
                    </h2>

                    <div className={styles.ctaButtons}>
                        <button
                            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                            aria-label="גלול למטה לפרטי הסדנה"
                        >
                            לכל הפרטים על הסדנה
                        </button>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className={styles.about}>
                <div className={styles.aboutContent}>
                    <h2>מה באמת קורה בסדנה?</h2>
                    <div className={styles.aboutText}>
                        <p>
                            הכול מתחיל בהסבר קצר על הכלים, הקצפות והחומרים – ואז הבנות צופות בהדגמה חיה של השלב הראשון.
                            משם כל אחת נכנסת לעולם הקסום של עוגות בנטו – מרכיבה עוגה אמיתית בעצמה, כולל מילוי, עיטוף וזילוף.
                        </p>

                        <p>
                            הבנות בוחרות תוספות צבעוניות וקישוטים מיוחדים, מקשטות עם צימקאו – כותבות שם, ברכה או ציור חמוד.
                            האווירה קלילה, כיפית, רגועה ומלאה בפרגון הדדי.
                        </p>

                        <p>
                            והסיום? כל אחת אורזת את העוגה בקופסה אישית ויוצאת עם עוגת בנטו מהממת שהיא עצבה בעצמה – בקופסה אלגנטית, מתאימה לצילום, להראות ולזלול בגאווה. והכי חשוב – עם חיוך ענק!
                        </p>
                    </div>
                    <div className={styles.aboutHighlights}>
                        <div className={styles.highlight}>
                            <span className={styles.icon}>🎯</span>
                            <h3>גילאים</h3>
                            <p>מתאים לגילאי 10 ומעלה</p>
                        </div>
                        <div className={styles.highlight}>
                            <span className={styles.icon}>🏠</span>
                            <h3>מיקום</h3>
                            <p>אצלכם בבית – באה עם הכול</p>
                        </div>
                        <div className={styles.highlight}>
                            <span className={styles.icon}>⏱️</span>
                            <h3>משך</h3>
                            <p>שעה עד שעתיים – לפי בחירה</p>
                        </div>
                        <div className={styles.highlight}>
                            <span className={styles.icon}>🎂</span>
                            <h3>עוגה אישית</h3>
                            <p>כל משתתפת יוצרת ומקשטת עוגה משלה</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className={styles.gallery}>
                <div className={styles.galleryWrapper}>
                    <div className={styles.galleryTitle}>
                        <h2>רגעים מתוקים מהסדנה</h2>
                        <p>הצצה לחוויה המיוחדת שמחכה למשתתפות בסדנת הבנטו שלנו</p>
                    </div>
                    <div className={styles.galleryContainer}>
                        <Swiper
                            spaceBetween={30}
                            centeredSlides={true}
                            effect={'fade'}
                            loop={true}
                            autoplay={{
                                delay: 4000,
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
                            
                            {/* Navigation Arrows */}
                            <div className={`swiper-button-prev ${styles.customNavButton}`}></div>
                            <div className={`swiper-button-next ${styles.customNavButton}`}></div>
                        </Swiper>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <h2>✨ מה מחכה למשתתפות?</h2>
                <div className={styles.featureGrid}>
                    <div className={styles.feature}>
                        <span className={styles.icon}>🎨</span>
                        <h3>עולם של קצפות, צבעים וקישוטים</h3>
                        <p>ורודים, טורקיזים, לבבות, מרשמלו, סוכריות – כל משתתפת יוצרת עוגה בסגנון האישי שלה, עם מגוון קצפות ותוספות טעימות וצבעוניות.</p>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.icon}>📦</span>
                        <h3>תוצר שכיף לקחת הביתה</h3>
                        <p>כל משתתפת מסיימת את הסדנה עם עוגת בנטו יפיפייה שהיא עצבה בעצמה – ארוזה בקופסה אלגנטית, מתאימה לצילום, להראות ולזלול בגאווה.</p>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.icon}>🍰</span>
                        <h3>עוגת בנטו שכל משתתפת מעצבת בעצמה</h3>
                        <p>זה לא רק לקשט – זה להרכיב, למלא, לזלף, לכתוב, לבחור צבעים, לבחור תוספות – ולעבור תהליך יצירתי מההתחלה ועד הסוף.</p>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.icon}>💖</span>
                        <h3>חוויה שכל אחת תזכור</h3>
                        <p>הרבה מעבר לעוגה – זו פעילות מגבשת, נעימה, מרגשת ומשותפת, שמחברת בין הבנות ומעמידה את ילדת יום ההולדת במרכז.</p>
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className={styles.socialProof}>
                <h2>מה המשתתפות אומרות על הסדנה?</h2>
                <div className={styles.testimonials}>
                    <div className={styles.testimonial}>
                        <p>״אילה את מודל להשראה! נתת את כל כולך בשביל כל בת ובת שהייתה בסדנה. בהסברים שלך היית כל כך מובנת והסברת ופרטת על כל חומר... את הסברת, עזרת, ונתת את כל הלב שלך״</p>
                        <div className={styles.testimonialHeader}>
                            <cite>- ליאן</cite>
                            <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                        </div>
                    </div>

                    <div className={styles.testimonial}>
                        <p>״אלו היו השעתיים הכי כיפים שהיו לי בחיים! אני עדיין בהלם שעשיתי הכל לבד. את מושלמת ואני אבוא לכל סדנה שלך״</p>
                        <div className={styles.testimonialHeader}>
                            <cite>- מיי</cite>
                            <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                        </div>
                    </div>

                    <div className={styles.testimonial}>
                        <p>״זה היה היום הולדת הכי מושלם שהיה לי בחיים. היה לי כיף ברמות, נהנתי להכיר אותך וללמוד ממך. חבל לי שנגמר כי הייתה סדנה נדירה״</p>
                        <div className={styles.testimonialHeader}>
                            <cite>- אגם</cite>
                            <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                        </div>
                    </div>

                    <div className={styles.testimonial}>
                        <p>״אילה את אלופה! כל הכבוד על הסבלנות עם שני, זה לא מובן מאליו בכלל״</p>
                        <div className={styles.testimonialHeader}>
                            <cite>- שירין</cite>
                            <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                        </div>
                    </div>

                    <div className={styles.testimonial}>
                        <p>״אילה אין עליך! למרות הכל הצלחתי לעשות עוגה מהממת ויותר חשוב למדתי המון. תודה שהצלחת לעזור למרות שהיה קשה״</p>
                        <div className={styles.testimonialHeader}>
                            <cite>- שני</cite>
                            <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course Options */}
            <section id="features" className={styles.courseOptions}>
                <h2>איזו סדנה מתאימה לך?</h2>
                <div className={styles.optionsGrid}>
                    <WorkshopOption
                        packageType="בייסיק"
                        packageTitle="טעימה ראשונה"
                        duration="טעימה ראשונה באורך שעה"
                        emphasis="המסלול המושלם לפעילות קלילה וחמודה"
                        features={[
                            "עוגת בנטו בטעם וניל בקוטר 10 ס''מ",
                            "קצפת לבנה + צבע נוסף",
                            "3 תוספות קישוט",
                            "ערכת עבודה אישית",
                            "מינימום 10 משתתפות"
                        ]}
                        bonus="כל משתתפת יוצאת עם עוגה שההרכיבה ועיצבה בעצמה, ארוזה יפה, ועם חיוך ענק"
                        price="180 ₪ למשתתפת"
                        color="green"
                    />

                    <WorkshopOption
                        packageType="קלאסיק"
                        packageTitle="החוויה המתוקה"
                        duration="החוויה המתוקה באורך שעה וחצי"
                        emphasis="המסלול  המבוקש ליום הולדת ביתי קלאסי"
                        features={[
                            "כל מה שמקבלים בחבילת הבייסיק, ובנוסף:",
                            "עוגה בקוטר 10 ס''מ",
                            "עד 5 צבעי קצפת",
                            "6 תוספות קישוט",
                            "קובץ טיפים אישי",
                            "אפשרות לעוגת שוקולד/וניל",
                            "מינימום 8 משתתפות"
                        ]}
                        bonus="כל מה שמקבלים בחבילת הבייסיק + קובץ טיפים חשובים לעיצוב עוגות בנטו"
                        price="220 ₪ למשתתפת"
                        color="blue"
                        recommended={true}
                        badge="מומלצת!"
                    />

                    <WorkshopOption
                        packageType="פרימיום"
                        packageTitle="החגיגה המלאה"
                        duration="החגיגה המלאה באורך שעתיים"
                        emphasis="החוויה המלאה עם כל הפינוקים"
                        features={[
                            "כל מה שמקבלים בחבילת הקלאסיק, ובנוסף:",
                            "עוגה גדולה בקוטר 12 ס״מ",
                            "מארז שקוף מהמם",
                            "עבודה עם צימקאו לכתיבה",
                            "טקס עוגה במתנה",
                            "מינימום 6 משתתפות",
                        ]}
                        bonus='כל מה שמקבלים בחבילת הקלאסיק + קופסה פרימיום + טקס עוגה מרגש'
                        price="270 ₪ למשתתפת"
                        color="pink"
                    />
                </div>
                <div className={styles.optionsSummary}>
                    <h3>כל משתתפת יוצאת עם עוגה שההרכיבה ועיצבה בעצמה, ארוזה יפה, ועם חיוך ענק</h3>
                </div>


            </section>

            {/* About Section */}
            <section className={styles.aboutInstructor}>
                <div className={styles.aboutWrapper}>
                    <div className={styles.instructorImage}>
                        <Image
                            src="/אילה אברהם.png"
                            alt="אילה - קונדיטורית ומדריכת הסדנה"
                            width={300}
                            height={375}
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <div className={styles.instructorContent}>
                        <h2>מי עומדת מאחורי החוויה הזו?</h2>
                        <div className={styles.instructorDetails}>
                            <h3>אילה אברהם</h3>
                            <p className={styles.title}>קונדיטורית ומדריכת סדנאות בנטו, עם לב גדול ותשוקה אמיתית לעולם המתוק 🎂</p>
                            <div className={styles.description}>
                                <p>
                                    במהלך השנים האחרונות ליוויתי מאות ילדות בסדנאות עוגות בנטו – כל אחת עם החלום הקטן שלה לעוגה מהממת שהיא עיצבה בעצמה.
                                </p>
                                <p>
                                    הסדנאות שלי הן לא רק על קצפת וקישוט – הן חוויה מחבקת של יצירה, העצמה, גיבוש והמון שמחה.
                                </p>
                                <p>
                                    אני מגיעה עם ניסיון מקצועי – אבל מה שהכי חשוב לי זה לחבר את הילדות ליצירה, לדמיון, ולחוויה אישית שיישארו איתן גם אחרי שהקצפת נאכלה.
                                </p>
                                <p>
                                    אני איתן בכל שלב – עם גישה רגישה, יחס אישי, ותשומת לב לפרטים הכי קטנים 💕
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className={styles.benefits}>
                <div className={styles.benefitsContent}>
                    <h2>למה לבחור בסדנה הזו?</h2>

                    <div className={styles.benefitsGrid}>
                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>🏠</div>
                            <div className={styles.benefitText}>
                                <h3>אצלך בבית</h3>
                                <p>
                                    בלי לצאת, בלי להיערך, בלי להתרוצץ. אני מגיעה עם כל הציוד – את רק פותחת את הדלת, ונכנסת לחוויה מתוקה ורגועה.
                                </p>
                            </div>
                        </div>

                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>✨</div>
                            <div className={styles.benefitText}>
                                <h3>חוויה אמיתית</h3>
                                <p>
                                    זו לא "הפעלה". זו סדנה יצירתית, עם תוכן, עשייה, והרגשה של משהו מיוחד באמת. הבנות יוצרות, מעצבות, גאות – וזה נוגע בלב.
                                </p>
                            </div>
                        </div>

                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>🎉</div>
                            <div className={styles.benefitText}>
                                <h3>מתאימה לכולן</h3>
<p>
                                    בנות שקטות או מוחצנות, יצירתיות או לא – כולן מוצאות את עצמן בתוך החוויה. זו פעילות שמקרבת, מחברת, ומשאירה טעם של עוד.
</p>
                            </div>
                        </div>

                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>📸</div>
                            <div className={styles.benefitText}>
                                <h3>תמונות ששוות הכל</h3>
<p>
                                    הצבעים, העוגות, החיוכים – כל סדנה נראית כמו אלבום של אינסטגרם. את רק תצאי להגיד "וואו!" ותמלאי את הטלפון בתמונות מהממות.
</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className={styles.faq}>
                <details className={styles.faqMainDropdown}>
                    <summary className={styles.faqMainSummary}>
                        <h2>❓ שאלות נפוצות על סדנת הבנטו</h2>
                        <span className={styles.faqHint}>לחצו כאן לפתיחה</span>
                    </summary>
                <div className={styles.faqList}>
                    <details>
                            <summary>🍰 מה זו בכלל עוגת בנטו?</summary>
                            <p>עוגת בנטו היא עוגה אישית, בגודל קטן ומושלם, המעוצבת בצורה מושקעת ומרשימה – כאילו יצאה מאינסטגרם. היא נארזת בקופסת בנטו מתוקה ואלגנטית, ונראית כאילו נולדה לצילום 🎀. היא מתאימה בול לילדות שרוצות משהו מיוחד, אישי ואסתטי – גם טעים, גם מהמם.</p>
                        </details>
                        
                        <details>
                            <summary>🎉 למי הסדנה מתאימה?</summary>
                            <p>בעיקר ליום הולדת לבנות – אבל לא רק! הסדנה מושלמת גם לערבי גיבוש, מפגש חברות, ימי כיף, מסיבת סיום, או כל פעילות משותפת. היא מתאימה לגילאי 10 ומעלה, עם דגש על בנות 12–14.</p>
                        </details>
                        
                        <details>
                            <summary>🏡 איפה מתקיימת הסדנה?</summary>
                            <p>אצלכן בבית, או בכל מקום שתבחרו. אני מגיעה עם כל הציוד הנדרש – ערכות, קישוטים, עוגות, כלים – ומביאה איתי את כל החוויה עד אליכן.</p>
                        </details>
                        
                        <details>
                            <summary>🕐 כמה זמן נמשכת הסדנה?</summary>
                            <p>יש שלוש אפשרויות: שעה, שעה וחצי, או שעתיים. יחד עם זאת – אני גמישה בזמנים. אפשר לשוחח איתי מראש ולהתאים את הסדנה לפי מה שנכון לכן. המטרה היא חוויה נעימה ולא "שעון עצר".</p>
                        </details>
                        
                        <details>
                            <summary>💸 מה המחירים ומה כלול?</summary>
                            <div className={styles.faqTable}>
                                <div className={styles.faqTableRow}>
                                    <div className={styles.faqTableHeader}>סוג הסדנה</div>
                                    <div className={styles.faqTableHeader}>זמן</div>
                                    <div className={styles.faqTableHeader}>מחיר</div>
                                    <div className={styles.faqTableHeader}>מה כלול</div>
                                </div>
                                <div className={styles.faqTableRow}>
                                    <div>טעימה ראשונה</div>
                                    <div>שעה</div>
                                    <div>180 ₪</div>
                                    <div>קצפת לבנה + צבע נוסף, 3 תוספות קישוט</div>
                                </div>
                                <div className={styles.faqTableRow}>
                                    <div>החוויה המתוקה</div>
                                    <div>שעה וחצי</div>
                                    <div>200 ₪</div>
                                    <div>עד 5 צבעי קצפת, 6 תוספות, קובץ טיפים, בחירת טעם לעוגה</div>
                                </div>
                                <div className={styles.faqTableRow}>
                                    <div>החגיגה המלאה</div>
                                    <div>שעתיים</div>
                                    <div>250 ₪</div>
                                    <div>כל מה שכלול ב"החוויה המתוקה" + קופסת בנטו 12 ס"מ, קופסה שקופה, קישוט עם צימקאו, נוכחות בטקס העוגה</div>
                                </div>
                            </div>
                            <p><strong>📌 חשוב לדעת:</strong></p>
                            <ul>
                                <li>המחיר עשוי להשתנות לפי מספר המשתתפות בפועל.</li>
                                <li>העוגה של טקס העוגה – אינה כלולה במחיר. ניתן להוסיף בתשלום.</li>
                                <li>תוספות בתשלום: זמן נוסף, קישוטים נוספים, עוגת יום הולדת מעוצבת במיוחד.</li>
                            </ul>
                        </details>
                        
                        <details>
                            <summary>✏️ מה זה קישוט עם צימקאו?</summary>
                            <p>צימקאו הוא שוקולד לעבודה בעיטור. במהלך הסדנה נלמד איך לקשט איתו את העוגה – למשל בכתיבת שמות, ברכות, איחולים או ציורים חמודים. זה מוסיף טאץ' אישי מהמם לכל עוגה!</p>
                        </details>
                        
                        <details>
                            <summary>🧁 מה כל משתתפת מקבלת?</summary>
                            <ul>
                                <li>עוגת בנטו מהממת שהיא עיצבה בעצמה</li>
                                <li>קופסה אישית ואלגנטית</li>
                                <li>תוצאה שהיא גאה בה</li>
                                <li>חוויה מגבשת, מהנה, אישית ומלאת השראה</li>
                            </ul>
                        </details>
                        
                        <details>
                            <summary>👑 מה ילדת יום ההולדת מקבלת?</summary>
                            <p>אפשר להזמין עבורה עוגת יום הולדת מעוצבת (בתוספת תשלום). בנוסף, אני נשארת ומובילה טקס עוגה חגיגי – עם כיבוי נרות, שיר, תמונות ורגע מרגש. הכול באהבה ובלי לחץ – כדי להפוך את הרגע לבלתי נשכח 💖</p>
                        </details>
                        
                        <details>
                            <summary>🎨 מה הבנות עושות בסדנה?</summary>
                            <ul>
                                <li>לומדות על הכלים, הקצפות והחומרים</li>
                                <li>צופות בהדגמה חיה של שלב ראשון</li>
                                <li>מרכיבות עוגה אמיתית בעצמן – כולל מילוי, עיטוף וזילוף</li>
                                <li>בוחרות תוספות צבעוניות וקישוטים מיוחדים</li>
                                <li>מקשטות עם צימקאו – כותבות שם, ברכה או ציור</li>
                                <li>אורזות את העוגה בקופסה אישית ויוצאות עם חיוך ענק</li>
                            </ul>
                        </details>
                        
                        <details>
                            <summary>🎈 האם זו הפעלה רגילה?</summary>
                            <p>ממש לא. זו סדנה חווייתית אמיתית – עם עשייה, יצירה, תוצר אישי וליווי מקצועי. לא הפעלה בידורית, אלא פעילות שתשאיר חותם – לכל משתתפת ולילדת יום ההולדת.</p>
                    </details>
                        
                    <details>
                            <summary>📍 איפה בארץ ניתן להזמין אותך?</summary>
                            <p>אני מגיעה לבתים מהצפון ועד המרכז. אם אתן לא בטוחות שהאזור שלכן כלול – דברו איתי ונבדוק יחד.</p>
                    </details>
                        
                    <details>
                            <summary>🪑 האם צריך להכין משהו מראש?</summary>
                            <p>כן – רק דבר אחד: שולחן גדול או כמה שולחנות קטנים, מקום נעים לישיבה וכיסאות. את כל שאר הציוד אני מביאה איתי – כולל מגשיות, קצפות, קישוטים, עוגות וערכות עבודה.</p>
                    </details>
                        
                    <details>
                            <summary>📲 איך מזמינים?</summary>
                            <p>בקלות! דרך האתר – לוחצים על כפתור יצירת הקשר, מגיעים אליי לוואטסאפ, ומשם מתאמים תאריך וסוג סדנה. רצוי להזמין מראש כדי לשריין תאריך פופולרי.</p>
                    </details>
                </div>
                </details>
            </section>

            {/* Contact Details Section - replacing the form */}
            <section id="contactDetails" className={styles.contactDetails}>
                <h2>לפרטים נוספים על הסדנה</h2>
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
                            <Link href="https://api.whatsapp.com/send?phone=972587995083&text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%A1%D7%93%D7%A0%D7%AA%20%D7%94%D7%91%D7%A0%D7%98%D7%95">
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

export default BentoWorkshopPage; 