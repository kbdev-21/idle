export default function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1100px] justify-center px-4 py-8 text-sm font-medium text-muted-foreground">
      <span>
        © 2026{" "}
        <a
          href="https://github.com/kbdev-21/idle"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground hover:underline"
        >
          Idle.gg
        </a>{" "}
        · Made by{" "}
        <a
          href="https://github.com/kbdev-21"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground hover:underline"
        >
          kbdev-21
        </a>
      </span>
    </footer>
  )
}
