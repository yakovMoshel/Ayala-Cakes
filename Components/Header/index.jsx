'use client'
import React, { useState, useEffect, useRef } from 'react';
import styles from './style.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import useStore from '@/store/useStore';
// Rely on server HttpOnly cookie; verify via API

export default function Header() {
    const isAuthenticated = useStore((state) => state.isAuthenticated);
    // Favorites menu disabled for now — uncomment when re-enabling /favorites
    // const favorites = useStore((state) => state.favorites);
    const setAuthenticated = useStore((state) => state.setAuthenticated);
    const setUser = useStore((state) => state.setUser);
    const [isOpen, setIsOpen] = useState(false);
    const [workshopsOpen, setWorkshopsOpen] = useState(false);
    const [submenuDismissed, setSubmenuDismissed] = useState(false);
    // Pulse animation for favorites menu item — restore with favorites below
    // const [isPulsing, setIsPulsing] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const path = usePathname();
    const workshopsButtonRef = useRef(null);
    const backButtonRef = useRef(null);
    const drawerWasOpen = useRef(false);
    const submenuPointerInside = useRef(false);
    const submenuWasVisible = useRef(false);

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
        setIsOpen((open) => !open);
        setWorkshopsOpen(false);
    };

    useEffect(() => {
        if (!isOpen) {
            drawerWasOpen.current = false;
            return;
        }
        if (workshopsOpen) {
            backButtonRef.current?.focus();
            drawerWasOpen.current = true;
            return;
        }
        if (drawerWasOpen.current) {
            workshopsButtonRef.current?.focus();
            drawerWasOpen.current = false;
        }
    }, [isOpen, workshopsOpen]);

    const handleMenuItemClick = () => {
        setIsOpen(false);
        setWorkshopsOpen(false);
    };

    const closeDesktopSubmenu = () => {
        setWorkshopsOpen(false);
        setSubmenuDismissed(true);
    };

    useEffect(() => {
        setWorkshopsOpen(false);
        if (submenuPointerInside.current) setSubmenuDismissed(true);
    }, [path]);

    const menuItems = [
        { href: '/', label: 'בית' },
        { href: '/about', label: 'אודות' },
        { href: '/shop', label: 'חנות' },
        {
            label: 'סדנאות',
            children: [
                { href: '/bento-workshop', label: 'סדנת בנטו' },
                { href: '/paint-cake-workshop', label: 'סדנת ציור על עוגות' },
            ],
        },
        { href: '/blog', label: 'בלוג' },
        // Favorites nav link disabled for now — uncomment to show "מועדפים" in menu again
        // { href: '/favorites', label: 'מועדפים', isFavorites: true },
    ];

    const renderMenuItem = (item) => {
        if (item.children) {
            const groupActive = item.children.some((child) => child.href === path);

            return (
                <div
                    key={item.label}
                    className={`${styles.menuItem} ${styles.hasSubmenu} ${workshopsOpen ? styles.submenuOpen : ''} ${submenuDismissed ? styles.submenuDismissed : ''}`}
                    onMouseEnter={() => {
                        submenuPointerInside.current = true;
                    }}
                    onMouseLeave={() => {
                        submenuPointerInside.current = false;
                        setSubmenuDismissed(false);
                        setWorkshopsOpen(false);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape') closeDesktopSubmenu();
                    }}
                >
                    <button
                        type="button"
                        className={groupActive ? styles.active : ''}
                        aria-expanded={workshopsOpen && !submenuDismissed}
                        aria-haspopup="true"
                        aria-controls="workshops-submenu"
                        onMouseDown={(event) => {
                            const submenu = event.currentTarget.nextElementSibling;
                            submenuWasVisible.current = Boolean(
                                submenu && window.getComputedStyle(submenu).display !== 'none'
                            );
                        }}
                        onKeyDown={(event) => {
                            if (event.key !== 'Enter' && event.key !== ' ') return;
                            const submenu = event.currentTarget.nextElementSibling;
                            const visible = submenu && window.getComputedStyle(submenu).display !== 'none';
                            if (!visible) return;
                            event.preventDefault();
                            closeDesktopSubmenu();
                        }}
                        onClick={() => {
                            if (submenuWasVisible.current) {
                                submenuWasVisible.current = false;
                                closeDesktopSubmenu();
                                return;
                            }
                            setSubmenuDismissed(false);
                            setWorkshopsOpen(true);
                        }}
                    >
                        {item.label}
                    </button>
                    <div id="workshops-submenu" className={styles.submenu} role="menu">
                        {item.children.map((child) => (
                            <Link
                                key={child.href}
                                href={child.href}
                                role="menuitem"
                                className={path === child.href ? styles.active : ''}
                                onClick={closeDesktopSubmenu}
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                </div>
            );
        }

        return (
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
    };

    const workshopItem = menuItems.find((item) => item.children);

    const renderMobileMenu = () => (
        <nav
            className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}
            onKeyDown={(event) => {
                if (event.key === 'Escape') {
                    if (workshopsOpen) setWorkshopsOpen(false);
                    else setIsOpen(false);
                }
            }}
        >
            <div className={styles.mobileStack}>
                <div
                    className={`${styles.mobileLevel} ${workshopsOpen ? styles.levelHidden : ''}`}
                    aria-hidden={workshopsOpen}
                    {...(workshopsOpen ? { inert: '' } : {})}
                >
                    {menuItems.map((item) => (
                        item.children ? (
                            <div key={item.label} className={styles.menuItem}>
                                <button
                                    ref={workshopsButtonRef}
                                    type="button"
                                    className={`${styles.submenuTrigger} ${item.children.some((child) => child.href === path) ? styles.active : ''}`}
                                    aria-expanded={workshopsOpen}
                                    aria-haspopup="true"
                                    aria-controls="workshops-submenu"
                                    onClick={() => setWorkshopsOpen(true)}
                                >
                                    <span>{item.label}</span>
                                    <span className={styles.chevron} aria-hidden="true">›</span>
                                </button>
                            </div>
                        ) : (
                            <div key={item.href} className={styles.menuItem}>
                                <Link
                                    href={item.href}
                                    className={path === item.href ? styles.active : ''}
                                    onClick={handleMenuItemClick}
                                >
                                    {item.label}
                                </Link>
                            </div>
                        )
                    ))}
                    {isAuthenticated && (
                        <div className={styles.menuItem}>
                            <Link href="/admin" className={path === '/admin' ? styles.active : ''} onClick={handleMenuItemClick}>
                                ניהול
                            </Link>
                        </div>
                    )}
                </div>
                <div
                    id="workshops-submenu"
                    className={`${styles.mobileDrawer} ${workshopsOpen ? styles.drawerOpen : ''}`}
                    role="region"
                    aria-labelledby="workshops-drawer-title"
                    aria-hidden={!workshopsOpen}
                    {...(workshopsOpen ? {} : { inert: '' })}
                >
                    <button
                        ref={backButtonRef}
                        type="button"
                        className={styles.backButton}
                        onClick={() => setWorkshopsOpen(false)}
                    >
                        <span className={styles.chevron} aria-hidden="true">‹</span>
                        <span>חזרה</span>
                    </button>
                    <p id="workshops-drawer-title" className={styles.drawerTitle}>{workshopItem?.label}</p>
                    <div className={styles.drawerLinks} role="menu">
                        {workshopItem?.children.map((child) => (
                            <Link
                                key={child.href}
                                href={child.href}
                                role="menuitem"
                                className={path === child.href ? styles.active : ''}
                                onClick={handleMenuItemClick}
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );

    const renderDesktopMenu = () => (
        <nav className={styles.desktopMenu}>
            {menuItems.map(renderMenuItem)}
            {isAuthenticated && (
                <div className={styles.menuItem}>
                    <Link href="/admin" className={path === '/admin' ? styles.active : ''}>
                        ניהול
                    </Link>
                </div>
            )}
        </nav>
    );

    return (
        <header className={`${styles.Header} ${isSticky ? styles.sticky : ''}`}>
            <div className={styles.navMenu}>
                <div className={styles.burger} onClick={handleToggleBurger}>
                    {isOpen ? '✕' : '☰'}
                </div>
                {isOpen ? renderMobileMenu() : renderDesktopMenu()}
                <Link href="/" className={path === '/' ? styles.active : ''}>
                    <div className={styles.logo}>
                        {/* CSS pins height to 50px; width:auto preserves the logo ratio */}
                        <Image
                            src="/ayala-cakes-logo.png"
                            alt="Ayala Cakes - עוגות מעוצבות"
                            width={552}
                            height={179}
                            priority
                            style={{ width: 'auto' }}
                        />
                    </div>
                </Link>
            </div>
        </header>
    );
}