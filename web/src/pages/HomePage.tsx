import { Hash, WholeWord } from "lucide-react"

import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import GameCard from "@/components/home/GameCard"
import PlayerProfile from "@/components/home/PlayerProfile"

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
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#edecea" }}>
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 pb-4 pt-8">
        <PlayerProfile />
        <div className="mt-8 grid grid-cols-2 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
