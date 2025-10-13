import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'

export const Route = createFileRoute('/_navbar/')({
  component: App,
  loader() {},
})

function App() {
  return (
    <main>
      <div className="product-control-bar">
        <label className="input w-full md:max-w-sm">
          <input type="search" placeholder="상품명으로 검색하세요." />
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
            aria-label="운동화"
          />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="티셔츠"
          />
        </form>
      </div>
      <div className="divider" />
      <div className="grid">
        <div className="product-card">
          <figure>
            <img
              src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              alt="Shoes"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">나XX 운동화</h2>
            <p>
              이번 시즌 최고의 운동화. 편안한 착용감과 세련된 디자인을
              자랑합니다.
            </p>
            <div className="card-actions">
              <button className="btn btn-primary">구매하기</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
