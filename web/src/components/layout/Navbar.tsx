import { LogIn } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-5">
      <div className="flex items-baseline">
        <span className="text-lg font-bold tracking-tight">Idle</span>
        <span className="text-lg font-medium text-muted-foreground">.gg</span>
      </div>
      <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50">
        <LogIn size={14} />
        Sign in
      </button>
    </nav>
  )
}
