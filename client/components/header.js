import Link from 'next/link';
export default ({ currentUser }) => {
  const links = [
    !currentUser && { label: 'Sign in', href: '/auth/signin' },
    !currentUser && { label: 'Sign up', href: '/auth/signup' },
    currentUser && { label: 'Sell tickets', href: '/tickets/new' },
    currentUser && { label: 'My orders', href: '/orders' },
    currentUser && { label: 'Sign out', href: '/auth/signout' },
  ]
    .filter((config) => config)
    .map(({ label, href }) => (
      <>
        <li key={href} className='nav-item nav-link'>
          <Link href={href}>{label}</Link>
        </li>
      </>
    ));
  return (
    <>
      <nav className='navbar navbar-light bg-light'>
        <Link href='/'>
          <span className='navbar-brand ml-5'>GitTix</span>
        </Link>
        <div className='d-flex justify-content-end'>
          <ul className='nav d-flex align-items-center'>{links}</ul>
        </div>
      </nav>
    </>
  );
};
