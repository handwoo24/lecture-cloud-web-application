import { User } from 'lucide-react'
import { m } from '@/paraglide/messages'

export const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">{m.app_title()}</a>
      </div>
      <div className="flex-none">
        <button className="btn btn-square btn-ghost">
          <User />
        </button>
      </div>
    </div>
  )
}
