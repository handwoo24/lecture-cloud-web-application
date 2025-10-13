import { User } from 'lucide-react'

export const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">My App</a>
      </div>
      <div className="flex-none">
        <button className="btn btn-square btn-ghost">
          <User />
        </button>
      </div>
    </div>
  )
}
