import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, Moon, Sun, Volume2, VolumeX } from "lucide-react"

import GoogleIcon from "@/components/common/GoogleIcon.tsx"
import { auth } from "@/core/auth.ts"
import { useAuthStore } from "@/stores/auth.store.ts"
import { Button } from "@/components/ui/button.tsx"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const session = useAuthStore((s) => s.session);
  const isLoggedIn = !!session && !session.user.is_anonymous;

  return (
    <nav className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4 py-5">
      <div className="flex items-center gap-2">
        <button className="rounded-full p-2 transition-colors hover:bg-black/5">
          <Menu size={18} />
        </button>
        <Link to="/" className="flex items-baseline">
          <span className="text-lg font-bold tracking-tight">Idle</span>
          <span className="text-lg font-medium text-muted-foreground">.gg</span>
        </Link>
      </div>
      <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
        <button
          onClick={() => setIsDark((v) => !v)}
          className="rounded-full p-2 transition-colors hover:bg-black/5"
        >
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button
          onClick={() => setIsMuted((v) => !v)}
          className="rounded-full p-2 transition-colors hover:bg-black/5"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        {isLoggedIn ? (
          <button
            onClick={async () => {
              await auth.signOut();
              window.location.reload();
            }}
            className="hover:text-foreground transition-colors font-medium"
          >
            Log out
          </button>
        ) : (
          <button
            onClick={() => setIsSignInOpen(true)}
            className="hover:text-foreground transition-colors font-medium"
          >
            Sign in
          </button>
        )}
      </div>

      <SignInDialog open={isSignInOpen} onOpenChange={setIsSignInOpen} />
    </nav>
  )
}

function SignInDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  async function handleGoogleLink() {
    await auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: import.meta.env.VITE_WEB_URL
      }
    });
  }

  async function handleGoogleSignIn() {
    await auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: import.meta.env.VITE_WEB_URL
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <div className="flex items-baseline">
          <span className="text-lg font-extrabold tracking-tight">Idle</span>
          <span className="text-lg font-semibold text-muted-foreground">.gg</span>
        </div>

        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-xl font-bold">Sign in to continue</DialogTitle>
          <DialogDescription>
            Save your progress, customize your profile,
            <br />
            and challenge your friends across every game!
          </DialogDescription>
        </DialogHeader>

        <Button
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-lg text-base font-bold"
          onClick={handleGoogleLink}
        >
          <GoogleIcon className="size-5" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or if you already have an account
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          size="lg"
          className="h-12 w-full rounded-lg text-base font-bold"
          onClick={handleGoogleSignIn}
        >
          Sign in
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Signing in to an existing account will discard your current guest progress.
        </p>
      </DialogContent>
    </Dialog>
  )
}
