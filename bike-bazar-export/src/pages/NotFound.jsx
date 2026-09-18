import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="font-display font-bold text-3xl">Page Not Found</h1>
      <p className="text-textmuted mt-2">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="inline-flex mt-6 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3"
      >
        Back to Home
      </Link>
    </div>
  )
}

export default NotFound
