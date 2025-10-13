import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/Navbar'

export const Route = createFileRoute('/_navbar')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}
