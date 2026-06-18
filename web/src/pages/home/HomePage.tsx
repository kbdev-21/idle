import { Hash, WholeWord } from "lucide-react"
import { Navigate } from "react-router-dom"

import { useMe } from "@/api/user/query-hooks.ts"
import { Spinner } from "@/components/ui/spinner.tsx"
import GameCard from "@/pages/home/GameCard.tsx"
import PlayerProfile from "@/pages/home/PlayerProfile.tsx"

const games = [
  {
    id: "caro",
    name: "Five in a row",
    description: "Five in a row. Outwit your rival.",
    playing: 1277,
    color: "#3B5BDB",
    icon: Hash,
  },
  {
    id: "word-bomb",
    name: "Word Bomb duel",
    description: "Six tries to crack the hidden word.",
    playing: 1255,
    color: "#1B4332",
    icon: WholeWord,
  },
] as const

export default function HomePage() {
  const { data: user, isLoading } = useMe()

  // TODO: tạm redirect thẳng sang /caro vì home chưa hoàn thiện — bỏ khi home sẵn sàng
  return <Navigate to="/caro" replace />

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-4 pt-8">
      <PlayerProfile user={user} />
      <div className="mt-8 grid grid-cols-2 gap-4">
        {games.map((game) => (
          <GameCard key={game.id} {...game} />
        ))}
      </div>
    </main>
  )
}
