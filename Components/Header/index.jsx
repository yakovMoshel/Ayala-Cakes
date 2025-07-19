'use client'
import React, { useState, useEffect } from 'react';
import styles from './style.module.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useStore from '../../useStore';

export default function Header() {
    const isAuthenticated = useStore((state) => state.isAuthenticated);
    const favorites = useStore((state) => state.favorites);
    const [isOpen, setIsOpen] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const path = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (favorites.length > 0) {
            setIsPulsing(true);
            const timer = setTimeout(() => setIsPulsing(false), 500);
            return () => clearTimeout(timer);
        }
    }, [favorites.length]);

    const handleToggleBurger = () => {
        setIsOpen(!isOpen);
    };

    const handleMenuItemClick = () => {
        setIsOpen(false);
    };

    const menuItems = [
        { href: '/', label: 'בית' },
        { href: '/about', label: 'אודות' },
        { href: '/shop', label: 'חנות' },
        { href: '/blog', label: 'בלוג' },
        { href: '/favorites', label: 'מועדפים', isFavorites: true },
    ];

    const renderMenuItem = (item) => (
        <div key={item.href} className={`${styles.menuItem} ${item.isFavorites ? styles.favorites : ''}`}>
            <Link 
                href={item.href} 
                className={`${path === item.href ? styles.active : ''} 
                            ${item.isFavorites && isPulsing ? styles.pulse : ''}`}
                onClick={handleMenuItemClick}
            >
                {item.label}
            </Link>
        </div>
    );

    const renderMobileMenu = () => (
        <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}>
            {menuItems.map(renderMenuItem)}
            {isAuthenticated && (
                <div className={styles.menuItem}>
                    <Link href="/admin" className={path === '/admin' ? styles.active : ''} onClick={handleMenuItemClick}>
                        ניהול
                    </Link>
                </div>
            )}
        </div>
    );

    const renderDesktopMenu = () => (
        <div className={styles.desktopMenu}>
            {menuItems.map(renderMenuItem)}
            {isAuthenticated && (
                <div className={styles.menuItem}>
                    <Link href="/admin" className={path === '/admin' ? styles.active : ''}>
                        ניהול
                    </Link>
                </div>
            )}
        </div>
    );

    return (
        <div className={`${styles.Header} ${isSticky ? styles.sticky : ''}`}>
            <div className={styles.navMenu}>
                <div className={styles.burger} onClick={handleToggleBurger}>
                    {isOpen ? '✕' : '☰'}
                </div>
                {isOpen ? renderMobileMenu() : renderDesktopMenu()}
                <Link href="/" className={path === '/' ? styles.active : ''}>
                    <div className={styles.logo}>
                        <img src="/AYALA CAKES LOGO.png" alt="AYALA CAKES LOGO" />
                    </div>
                </Link>
            </div>
        </div>
    );
}