import { Link } from '@tanstack/react-router'
import { User } from 'lucide-react'
import { m } from '@/paraglide/messages'

export const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link className="btn btn-ghost text-xl" to="/">
          {m.app_title()}
        </Link>
      </div>
      <div className="flex-none">
        <Link className="btn btn-square btn-ghost" to="/settings">
          <User />
        </Link>
      </div>
    </div>
  )
}
