import React from 'react'
import styles from './style.module.scss'
import PostItem from '@/Components/PostItem';
import { getAllPosts } from '@/server/BL/postService';
import { connectToMongo } from '@/server/DL/connectToMongo';

// מטא-דטה סטטית לדף הבלוג הראשי
export async function generateMetadata() {
    return {
        title: 'בלוג קונדיטוריה - טיפים ומתכונים לאפייה ועיצוב עוגות מאת אילה אברהם',
        description: 'בלוג הקונדיטוריה של אילה - טיפים שימושיים, מתכונים מפתיעים, והשראה לעוגות ייחודיות. גלו איך לשדרג את העוגות שלכם עם הטיפים והמתכונים שלי.',
        keywords: 'בלוג קונדיטוריה, טיפים לאפייה, מתכונים, עוגות מעוצבות, אילה אברהם, עיצוב עוגות',
        openGraph: {
            title: 'בלוג הקונדיטוריה של אילה - טיפים ומתכונים',
            description: 'טיפים שימושיים, מתכונים מפתיעים, והשראה לעוגות ייחודיות מאת הקונדיטורית אילה אברהם',
            type: 'website',
        },
        alternates: {
            canonical: '/blog'
        }
    };
}

export default async function Blog() {
    await connectToMongo();

    const posts = await getAllPosts();
    return (
        <div className={styles.blog}>
            <div className={styles.content}>
                <div className={styles.title}>
                    טיפים, מתכונים ועוד
                </div>
                <div className={styles.items}>
                    {posts && posts.map((post) => (
                        <PostItem key={post._id} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
}
