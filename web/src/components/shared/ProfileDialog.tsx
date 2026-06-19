import { Pencil } from "lucide-react"

import { useMe, useUser } from "@/api/user/query-hooks.ts"
import { useCaroMatches } from "@/api/caro/query-hooks.ts"
import type { CaroMatchSummary } from "@/api/caro/api.ts"
import type { User } from "@/api/user/api.ts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Spinner } from "@/components/ui/spinner.tsx"
import { cn } from "@/lib/utils.ts"

type ProfileDialogProps = {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProfileDialog({ userId, open, onOpenChange }: ProfileDialogProps) {
  const { data: user, isLoading: userLoading } = useUser(userId);
  const { data: matches, isLoading: matchesLoading } = useCaroMatches({ userId });
  const { data: me } = useMe();
  const isMe = me?.id === userId;
  const isLoading = userLoading || matchesLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[440px]">
        {/* tiêu đề ẩn cho screen reader (a11y), nội dung hiển thị tự custom bên dưới */}
        <DialogHeader className="sr-only">
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>

        {isLoading || !user ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="size-8 text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 pt-2">
            {/* avatar top center */}
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-3xl">
              {user.avtUrl ? (
                <img src={user.avtUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                "🐝"
              )}
            </div>

            {/* name center; nút edit absolute ở mép phải name -> không làm lệch center */}
            <div className="relative">
              <span className="text-lg font-bold">{user.name}</span>
              {isMe && (
                <button
                  type="button"
                  className="absolute left-full top-1/2 ml-1.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Edit profile"
                >
                  <Pencil size={15} />
                </button>
              )}
            </div>

            {/* stats row: rating | matches | wins */}
            <div className="mt-1 flex items-center gap-4">
              <Stat label="Rating" value={user.caroStat?.rating ?? 0} />
              <span className="h-8 w-px bg-gray-200" />
              <Stat label="Matches" value={user.caroStat?.matches ?? 0} />
              <span className="h-8 w-px bg-gray-200" />
              <Stat label="Wins" value={user.caroStat?.wins ?? 0} />
            </div>

            {/* match history ngay dưới stats */}
            <MatchHistory matches={matches ?? []} userId={userId} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-extrabold tracking-tight">{value.toLocaleString()}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function MatchHistory({ matches, userId }: { matches: CaroMatchSummary[]; userId: string }) {
  if (matches.length === 0) {
    return (
      <div className="w-full pt-4 text-center text-sm text-muted-foreground">
        No matches yet
      </div>
    )
  }

  return (
    <div className="max-h-72 w-full space-y-2 overflow-y-auto pt-3">
      {matches.map((match) => (
        <MatchHistoryItem key={match.id} match={match} userId={userId} />
      ))}
    </div>
  )
}

function MatchHistoryItem({ match, userId }: { match: CaroMatchSummary; userId: string }) {
  const result = match.winnerId === null ? "draw" : match.winnerId === userId ? "win" : "lose"
  const resultLabel = result === "win" ? "Win" : result === "lose" ? "Lose" : "Draw"
  const resultColor =
    result === "win" ? "text-green-600" : result === "lose" ? "text-red-600" : "text-yellow-500"
  const date = new Date(match.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  // rating delta của chủ profile sau trận
  const isX = match.xPlayerId === userId
  const oldRating = isX ? match.xRating : match.oRating
  const newRating = isX ? match.xNewRating : match.oNewRating
  const delta = newRating !== null ? newRating - oldRating : null
  const deltaText = delta === null ? null : delta > 0 ? `+${delta}` : `${delta}`

  return (
    <button
      type="button"
      // TODO: mở match detail
      onClick={() => {}}
      className="flex w-full items-center gap-4 rounded-lg border border-gray-200 px-3 py-3 text-left transition-colors duration-100 hover:bg-gray-50"
    >
      {/* col 1: (kết quả + delta cùng hàng), date bên dưới */}
      <div className="flex w-24 shrink-0 flex-col gap-1">
        <div className="flex items-baseline gap-1.5">
          <span className={cn("text-sm font-bold", resultColor)}>{resultLabel}</span>
          {deltaText && <span className={cn("text-xs font-semibold", resultColor)}>({deltaText})</span>}
        </div>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>

      {/* col 2: 2 player dọc */}
      <div className="flex flex-col gap-1.5">
        <PlayerLine player={match.xPlayer} rating={match.xRating} />
        <PlayerLine player={match.oPlayer} rating={match.oRating} />
      </div>
    </button>
  )
}

function PlayerLine({ player, rating }: { player: User; rating: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xs">
        {player.avtUrl ? (
          <img src={player.avtUrl} alt={player.name} className="h-full w-full object-cover" />
        ) : (
          "🐝"
        )}
      </div>
      <span className="text-sm font-semibold">{player.name}</span>
      <span className="text-xs text-muted-foreground">({rating})</span>
    </div>
  )
}
