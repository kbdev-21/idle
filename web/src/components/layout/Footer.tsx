export default function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-8 text-sm text-muted-foreground">
      <span>© 2026 Idle.gg</span>
      <div className="flex gap-6">
        <a href="#" className="hover:text-foreground transition-colors">Discord</a>
        <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
      </div>
    </footer>
  )
}
