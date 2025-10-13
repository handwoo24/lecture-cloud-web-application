import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'

export const Route = createFileRoute('/_navbar/')({
  component: App,
  loader() {},
})

function App() {
  return (
    <main>
      <div>
        <label className="input">
          <input type="search" placeholder="domain name" />
          <span className="label">
            <Search />
          </span>
        </label>
        <form className="filter">
          <input className="btn btn-square" type="reset" value="×" />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="Svelte"
          />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="Vue"
          />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="React"
          />
        </form>
      </div>
      <div className="grid">
        <div className="card bg-base-100 w-96 shadow-sm">
          <figure>
            <img
              src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              alt="Shoes"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Card Title</h2>
            <p>
              A card component has a figure, a body part, and inside body there
              are title and actions parts
            </p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
