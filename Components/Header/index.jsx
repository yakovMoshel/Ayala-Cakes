'use client'
import React, { useState, useEffect } from 'react';
import styles from './style.module.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useStore from '../../useStore';
// Rely on server HttpOnly cookie; verify via API

export default function Header() {
    const isAuthenticated = useStore((state) => state.isAuthenticated);
    // Favorites menu disabled for now — uncomment when re-enabling /favorites
    // const favorites = useStore((state) => state.favorites);
    const setAuthenticated = useStore((state) => state.setAuthenticated);
    const setUser = useStore((state) => state.setUser);
    const [isOpen, setIsOpen] = useState(false);
    // Pulse animation for favorites menu item — restore with favorites below
    // const [isPulsing, setIsPulsing] = useState(false);
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

    // Initialize auth state from server (HttpOnly cookie)
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/auth/verify-token', { method: 'POST' });
                const data = await res.json();
                if (data?.success) {
                    setAuthenticated(true);
                    setUser(data.user);
                } else {
                    setAuthenticated(false);
                    setUser(null);
                }
            } catch (e) {
                setAuthenticated(false);
                setUser(null);
            }
        })();
    }, [setAuthenticated, setUser]);

    // Favorites pulse effect — uncomment together with favorites state and menu item
    // useEffect(() => {
    //     if (favorites.length > 0) {
    //         setIsPulsing(true);
    //         const timer = setTimeout(() => setIsPulsing(false), 500);
    //         return () => clearTimeout(timer);
    //     }
    // }, [favorites.length]);

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
        { href: '/bento-workshop', label: 'סדנת בנטו' },
        { href: '/blog', label: 'בלוג' },
        // Favorites nav link disabled for now — uncomment to show "מועדפים" in menu again
        // { href: '/favorites', label: 'מועדפים', isFavorites: true },
    ];

    const renderMenuItem = (item) => (
        // When favorites menu is back: add ${item.isFavorites ? styles.favorites : ''} to className below
        <div key={item.href} className={styles.menuItem}>
            <Link 
                href={item.href} 
                // When favorites menu is back: add ${item.isFavorites && isPulsing ? styles.pulse : ''} to className below
                className={path === item.href ? styles.active : ''}
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