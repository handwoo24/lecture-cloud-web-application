import { Link } from '@tanstack/react-router'
import { User } from 'lucide-react'

export const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link className="btn btn-ghost text-xl" to="/">
          My App
        </Link>
      </div>
      <div className="flex-none">
        <button className="btn btn-square btn-ghost">
          <User />
        </button>
      </div>
    </div>
  )
}
