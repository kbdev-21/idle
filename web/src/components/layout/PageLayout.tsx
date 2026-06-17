import { Outlet } from "react-router-dom"

import Navbar from "@/components/layout/Navbar.tsx"
import Footer from "@/components/layout/Footer.tsx"

export default function PageLayout() {
  return (
    <div className="flex flex-col" style={{ backgroundColor: "#edecea" }}>
      {/* Navbar + nội dung chiếm trọn 1 viewport -> footer bị đẩy xuống dưới fold */}
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
