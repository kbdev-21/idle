import { useEffect, useState } from "react"
import { Pencil } from "lucide-react"

import { useMe, useUpdateMe, useUser } from "@/api/user/query-hooks.ts"
import { useCaroMatches } from "@/api/caro/query-hooks.ts"
import type { CaroMatchSummary } from "@/api/caro/api.ts"
import type { User } from "@/api/user/api.ts"
import { AVATARS } from "@/core/constants.ts"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Button } from "@/components/ui/button.tsx"
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

  const [editOpen, setEditOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  return (
    <>
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
          <div className="flex w-full min-w-0 flex-col items-center gap-3 pt-2">
            {/* avatar top center; click để đổi (chỉ khi là chính mình) */}
            <button
              type="button"
              onClick={() => setAvatarOpen(true)}
              disabled={!isMe}
              className={cn(
                "relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-3xl disabled:cursor-default",
                isMe && "group"
              )}
            >
              {AVATARS[user.avtCode] ? (
                <img src={AVATARS[user.avtCode]} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                "🐝"
              )}
              {/* hover (chỉ khi là chính mình): tối avatar + icon bút giữa */}
              {isMe && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-100 group-hover:opacity-100">
                  <Pencil size={20} className="text-white" />
                </span>
              )}
            </button>

            {/* name center; nút edit absolute ở mép phải name -> không làm lệch center */}
            <div className="relative">
              <span className="text-lg font-bold">{user.name}</span>
              {isMe && (
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
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

    {isMe && user && (
      <UpdateNameDialog open={editOpen} onOpenChange={setEditOpen} currentName={user.name} />
    )}
    {isMe && user && (
      <UpdateAvatarDialog open={avatarOpen} onOpenChange={setAvatarOpen} currentAvtCode={user.avtCode} />
    )}
    </>
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
    <div className="max-h-72 w-full min-w-0 space-y-2 overflow-y-auto pt-3">
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
      <div className="flex shrink-0 flex-col gap-1 sm:w-24">
        <div className="flex items-baseline gap-1.5">
          <span className={cn("text-sm font-bold", resultColor)}>{resultLabel}</span>
          {deltaText && <span className={cn("text-xs font-semibold", resultColor)}>({deltaText})</span>}
        </div>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>

      {/* col 2: 2 player dọc */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <PlayerLine player={match.xPlayer} rating={match.xRating} />
        <PlayerLine player={match.oPlayer} rating={match.oRating} />
      </div>
    </button>
  )
}

function PlayerLine({ player, rating }: { player: User; rating: number }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xs">
        {AVATARS[player.avtCode] ? (
          <img src={AVATARS[player.avtCode]} alt={player.name} className="h-full w-full object-cover" />
        ) : (
          "🐝"
        )}
      </div>
      <span className="truncate text-sm font-semibold">{player.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground">({rating})</span>
    </div>
  )
}

function UpdateNameDialog({
  open,
  onOpenChange,
  currentName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
}) {
  const updateMe = useUpdateMe();
  const [nameInput, setNameInput] = useState(currentName);

  // mỗi lần mở lại -> reset input về tên hiện tại
  useEffect(() => {
    if (open) setNameInput(currentName);
  }, [open, currentName]);

  const handleConfirm = () => {
    updateMe.mutate(
      { name: nameInput },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Update your name</DialogTitle>
        </DialogHeader>

        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          maxLength={20}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
        />

        <DialogFooter>
          <Button
            className="font-bold"
            onClick={handleConfirm}
            disabled={updateMe.isPending || nameInput.trim().length === 0}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UpdateAvatarDialog({
  open,
  onOpenChange,
  currentAvtCode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvtCode: string;
}) {
  const updateMe = useUpdateMe();
  const [selected, setSelected] = useState(currentAvtCode);

  // mỗi lần mở lại -> reset về avatar hiện tại
  useEffect(() => {
    if (open) setSelected(currentAvtCode);
  }, [open, currentAvtCode]);

  const handleSave = () => {
    updateMe.mutate(
      { avtCode: selected },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Choose your avatar</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          {Object.entries(AVATARS).map(([code, src]) => (
            <button
              key={code}
              type="button"
              onClick={() => setSelected(code)}
              className={cn(
                "flex aspect-square items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-2 ring-offset-2 transition-colors",
                selected === code ? "ring-foreground/80" : "ring-transparent hover:ring-gray-300"
              )}
            >
              <img src={src} alt={code} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button
            className="font-bold"
            onClick={handleSave}
            disabled={updateMe.isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
