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

const SIZE = 15

const MARK_COLOR: Record<CaroSide, string> = {
  X: "#3B5BDB",
  O: "#d52e33",
}

export default function CaroGamePage() {
  const navigate = useNavigate()
  const { data: user } = useMe()
  const room = useCaroStore((s) => s.room)
  const playTurn = useCaroStore((s) => s.playTurn)
  const leaveRoom = useCaroStore((s) => s.leaveRoom)

  // opponentId = player còn lại trong room (tính trước early-return để giữ thứ tự hook)
  const opponentId = room
    ? room.xPlayerId === user?.id
      ? room.oPlayerId
      : room.xPlayerId
    : undefined
  const { data: opponent } = useUser(opponentId ?? "")

  // "watch board" -> ẩn dialog để xem lại bàn cờ; reset khi ván mới bắt đầu
  const [watching, setWatching] = useState(false)
  const gameStatus = room?.state.status
  useEffect(() => {
    if (gameStatus === "playing") setWatching(false)
  }, [gameStatus])

  // RequireGame đảm bảo có room khi render, nhưng vẫn guard cho chắc type
  if (!room) return null

  const { board, status, turnOf, winner } = room.state
  const mySide: CaroSide = room.xPlayerId === user?.id ? "X" : "O"
  const oppSide: CaroSide = mySide === "X" ? "O" : "X"
  const isMyTurn = status === "playing" && turnOf === mySide

  const handleCellClick = (x: number, y: number) => {
    if (!isMyTurn) return
    if (board[x][y] !== null) return
    playTurn(x, y)
  }

  const handleLeave = () => {
    leaveRoom()
    navigate("/caro")
  }

  // kết quả ván + chênh lệch rating của tôi (chỉ dùng khi game over)
  const gameOver = status !== "playing"
  const resultLabel = status === "won" ? (winner === mySide ? "You win 🎉" : "You lose") : "Draw"
  const myRatingBefore = mySide === "X" ? room.xRating : room.oRating
  const myRatingAfter = mySide === "X" ? room.xRatingAfter : room.oRatingAfter
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
          avatarUrl={opponent?.avtUrl}
          avatarFallback="🦊"
          active={status === "playing" && turnOf === oppSide}
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
          avatarUrl={user?.avtUrl}
          avatarFallback="🐝"
          active={isMyTurn}
        />
      </div>

      <button
        onClick={handleLeave}
        className="mt-2 rounded-full border border-gray-300 px-5 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-gray-100"
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
  avatarUrl?: string
  avatarFallback: string
  active?: boolean
}

function PlayerBar({ mark, name, rating, avatarUrl, avatarFallback, active }: PlayerBarProps) {
  return (
    <div className="flex items-center gap-3">
      {/* combo: avatar trái + (name trên / rating dưới) phải */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xl"
          style={{ boxShadow: `0 0 0 2px ${MARK_COLOR[mark]}` }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            avatarFallback
          )}
        </div>

        <div className="flex flex-col leading-tight">
          <span className="font-bold">{name}</span>
          <span className="text-sm font-medium text-muted-foreground">{rating.toLocaleString()}</span>
        </div>
      </div>

      {/* mark badge bên phải */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: MARK_COLOR[mark] }}
      >
        {mark === "X" ? <X size={16} strokeWidth={3} /> : <Circle size={13} strokeWidth={3} />}
      </div>

      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full"
          style={{ width: "100%", backgroundColor: active ? MARK_COLOR[mark] : "#D1D5DB" }}
        />
      </div>


    </div>
  )
}
