import Link from 'next/link';
import styles from './style.module.scss';

/**
 * Shared polymorphic CTA button.
 * Renders <button>, Next <Link>, or <a> depending on props.
 *
 * Width/size stay generic — pick the prop that matches the layout:
 * - size="lg"     → homepage hero (inline-block, padding 10×40)
 * - fullWidth     → PDP order (width 100% of parent item; no flex-grow)
 * - tone="admin"  → admin chrome (radius/padding/hover)
 *
 * @param {'primary'|'secondary'|'danger'} [variant='primary']
 * @param {'public'|'admin'} [tone='public']
 * @param {'md'|'lg'|'sm'} [size='md']
 * @param {boolean} [fullWidth=false]
 */
export default function Button({
  href,
  children,
  variant = 'primary',
  tone = 'public',
  size = 'md',
  external = false,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  ...rest
}) {
  const isAdmin = tone === 'admin';

  const classNames = [
    styles.btn,
    isAdmin ? styles.admin : '',
    !isAdmin && size === 'lg' ? styles.sizeLg : '',
    isAdmin && size === 'sm' ? styles.adminSm : '',
    fullWidth ? styles.fullWidth : '',
    variant === 'secondary'
      ? isAdmin
        ? styles.adminSecondary
        : styles.secondary
      : '',
    variant === 'danger' ? styles.adminDanger : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          className={classNames}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          {...rest}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classNames} onClick={onClick} {...rest}>
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
      {...rest}
    >
      {children}
    </button>
  );
}
