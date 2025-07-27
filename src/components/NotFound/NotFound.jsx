function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
      <svg
        className="w-32 h-32 text-brand mb-8"
        fill="none"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="4" />
        <path
          d="M16 20h16M16 28h16"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="24" cy="24" r="6" fill="currentColor" opacity="0.1" />
      </svg>
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-secondary mb-8 text-center max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
        <br />
        Please check the URL or return to the homepage.
      </p>
      <a
        href="/"
        className="btn-primary px-6 py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-brand-dark transition-colors"
      >
        Go Home
      </a>
    </div>
  );
}

export default NotFound;
