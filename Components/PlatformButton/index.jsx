import Link from 'next/link';
import styles from './style.module.scss';

export default function PlatformButton({
  href,
  children,
  variant = 'primary',
  external = false,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}) {
  const classNames = `${styles.btn} ${variant === 'secondary' ? styles.secondary : ''} ${className}`.trim();

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          className={classNames}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classNames}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
