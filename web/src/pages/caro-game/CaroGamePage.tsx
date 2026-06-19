import { useEffect, useState } from "react"
import { Circle, X } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useMe, useUser } from "@/api/user/query-hooks.ts"
import { useCaroStore } from "@/stores/caro.store.ts"
import type { CaroSide } from "@/core/caro-types.ts"
import { cn } from "@/lib/utils.ts"
import { Button } from "@/components/ui/button.tsx"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import ProfileDialog from "@/components/shared/ProfileDialog.tsx"
import { AVATARS } from "@/core/constants.ts"

const SIZE = 15
const TURN_TIME_LIMIT = 20 // giây, mirror backend TURN_TIME_LIMIT_MS

const MARK_COLOR: Record<CaroSide, string> = {
  X: "#3B5BDB",
  O: "#d52e33",
}

export default function CaroGamePage() {
  const navigate = useNavigate()
  const { data: user } = useMe()
  const match = useCaroStore((s) => s.match)
  const playTurn = useCaroStore((s) => s.playTurn)
  const leaveMatch = useCaroStore((s) => s.leaveMatch)

  // opponentId = player còn lại trong match (tính trước early-return để giữ thứ tự hook)
  const opponentId = match
    ? match.xPlayerId === user?.id
      ? match.oPlayerId
      : match.xPlayerId
    : undefined
  const { data: opponent } = useUser(opponentId ?? "")

  // profile dialog: tách open khỏi userId để khi đóng data không bị mất giữa animation
  const [profileUserId, setProfileUserId] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const openProfile = (id: string) => {
    setProfileUserId(id)
    setProfileOpen(true)
  }

  // "watch board" -> ẩn dialog để xem lại bàn cờ; reset khi ván mới bắt đầu
  const [watching, setWatching] = useState(false)
  const gameStatus = match?.state.status
  useEffect(() => {
    if (gameStatus === "playing") setWatching(false)
  }, [gameStatus])

  // countdown lượt: tick mỗi 250ms khi đang chơi, client tự tính từ lastMoveAt
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (gameStatus !== "playing") return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [gameStatus])

  // RequireGame đảm bảo có match khi render, nhưng vẫn guard cho chắc type
  if (!match) return null

  const { board, status, turnOf, winner } = match.state
  const mySide: CaroSide = match.xPlayerId === user?.id ? "X" : "O"
  const oppSide: CaroSide = mySide === "X" ? "O" : "X"
  const isMyTurn = status === "playing" && turnOf === mySide

  // tỉ lệ thời gian còn lại của lượt hiện tại (0..1) cho thanh của người đang active
  const turnProgress =
    status === "playing"
      ? Math.max(0, TURN_TIME_LIMIT - (now - match.lastMoveAt) / 1000) / TURN_TIME_LIMIT
      : 1

  const handleCellClick = (x: number, y: number) => {
    if (!isMyTurn) return
    if (board[x][y] !== null) return
    playTurn(x, y)
  }

  const handleLeave = () => {
    leaveMatch()
    navigate("/caro")
  }

  // kết quả ván + chênh lệch rating của tôi (chỉ dùng khi game over)
  const gameOver = status !== "playing"
  const resultLabel = status === "won" ? (winner === mySide ? "You win 🎉" : "You lose") : "Draw"
  const myRatingBefore = mySide === "X" ? match.xRating : match.oRating
  const myRatingAfter = mySide === "X" ? match.xNewRating : match.oNewRating
  const ratingNow = myRatingAfter ?? myRatingBefore
  const ratingDelta = ratingNow - myRatingBefore
  const deltaText = ratingDelta > 0 ? `+${ratingDelta}` : `${ratingDelta}`
  const deltaColor =
    ratingDelta > 0 ? "text-green-600" : ratingDelta < 0 ? "text-red-600" : "text-muted-foreground"

  return (
    <main className="flex flex-1 flex-col items-center gap-4 px-4 py-6">
      {/* status */}
      <StatusBar status={status} isMyTurn={isMyTurn} mySide={mySide} winner={winner} />

      <div className="flex w-full max-w-[490px] flex-col gap-3">
        {/* opponent */}
        <PlayerBar
          mark={oppSide}
          name={opponent?.name ?? "Opponent"}
          rating={opponent?.caroStat?.rating ?? 0}
          avtCode={opponent?.avtCode}
          avatarFallback="🦊"
          active={status === "playing" && turnOf === oppSide}
          progress={turnProgress}
          onProfileClick={opponentId ? () => openProfile(opponentId) : undefined}
        />

        {/* board */}
        <div
          className="grid aspect-square w-full gap-px overflow-hidden rounded-lg bg-gray-200"
          style={{
            gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${SIZE}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: SIZE * SIZE }).map((_, i) => {
            const x = Math.floor(i / SIZE)
            const y = i % SIZE
            const mark = board[x][y]
            return (
              <button
                key={`${x}-${y}`}
                onClick={() => handleCellClick(x, y)}
                disabled={!isMyTurn || mark !== null}
                className="flex items-center justify-center bg-white enabled:hover:bg-gray-100 disabled:cursor-default"
              >
                {mark === "X" && <X size={16} strokeWidth={4} style={{ color: MARK_COLOR.X }} />}
                {mark === "O" && <Circle size={14} strokeWidth={4} style={{ color: MARK_COLOR.O }} />}
              </button>
            )
          })}
        </div>

        {/* me */}
        <PlayerBar
          mark={mySide}
          name={user?.name ?? "You"}
          rating={user?.caroStat?.rating ?? 0}
          avtCode={user?.avtCode}
          avatarFallback="🐝"
          active={isMyTurn}
          progress={turnProgress}
          onProfileClick={user ? () => openProfile(user.id) : undefined}
        />
      </div>

      <button
        onClick={handleLeave}
        disabled={!gameOver}
        className="mt-2 rounded-full border border-gray-300 px-5 py-2 text-sm font-bold text-muted-foreground transition-colors enabled:hover:bg-gray-100 disabled:opacity-50"
      >
        Leave
      </button>

      <Dialog open={gameOver && !watching} onOpenChange={(open) => !open && setWatching(true)}>
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          className="gap-4 p-5 sm:max-w-[260px]"
        >
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-lg font-bold">{resultLabel}</DialogTitle>
          </DialogHeader>

          <div className="flex items-baseline justify-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight">
              {ratingNow.toLocaleString()}
            </span>
            <span className={cn("text-sm font-bold", deltaColor)}>{deltaText}</span>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full rounded-lg font-bold" onClick={handleLeave}>
              Return to lobby
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-lg font-bold"
              onClick={() => setWatching(true)}
            >
              Watch board
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ProfileDialog
        userId={profileUserId ?? ""}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </main>
  )
}

type StatusBarProps = {
  status: "playing" | "won" | "draw"
  isMyTurn: boolean
  mySide: CaroSide
  winner: CaroSide | null
}

function StatusBar({ status, isMyTurn, mySide, winner }: StatusBarProps) {
  let label: string
  if (status === "won") label = winner === mySide ? "You win 🎉" : "You lose"
  else if (status === "draw") label = "Draw"
  else label = isMyTurn ? "Your turn" : "Opponent's turn"

  return (
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      {label}
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
    </div>
  )
}

type PlayerBarProps = {
  mark: CaroSide
  name: string
  rating: number
  avtCode?: string
  avatarFallback: string
  active?: boolean
  progress?: number
  onProfileClick?: () => void
}

function PlayerBar({ mark, name, rating, avtCode, avatarFallback, active, progress, onProfileClick }: PlayerBarProps) {
  const avatarSrc = avtCode ? AVATARS[avtCode] : undefined
  // chỉ người đang active mới đếm ngược; người còn lại giữ thanh đầy (xám)
  const width = active && progress !== undefined ? `${progress * 100}%` : "100%"
  return (
    <div className="flex flex-col gap-3">
      {/* hàng info: avatar + (name/rating) bên trái, mark badge đẩy về phải */}
      <div className="flex items-center gap-2.5">
        {/* avatar + name clickable -> mở profile */}
        <button
          type="button"
          onClick={onProfileClick}
          disabled={!onProfileClick}
          className="flex items-center gap-2.5 text-left disabled:cursor-default"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xl"
            style={{ boxShadow: `0 0 0 2px ${MARK_COLOR[mark]}` }}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt={name} className="h-full w-full object-cover" />
            ) : (
              avatarFallback
            )}
          </div>

          <div className="flex flex-col leading-tight">
            <span className="font-bold">{name}</span>
            <span className="text-sm font-medium text-muted-foreground">{rating.toLocaleString()}</span>
          </div>
        </button>

        {/* mark badge đẩy sát mép phải để thẳng hàng với đuôi thanh time */}
        <div
          className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: MARK_COLOR[mark] }}
        >
          {mark === "X" ? <X size={16} strokeWidth={3} /> : <Circle size={13} strokeWidth={3} />}
        </div>
      </div>

      {/* thanh time full-width, luôn cùng điểm đầu + cùng độ dài giữa 2 player */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-[width] duration-200 ease-linear"
          style={{ width, backgroundColor: active ? MARK_COLOR[mark] : "#D1D5DB" }}
        />
      </div>
    </div>
  )
}
