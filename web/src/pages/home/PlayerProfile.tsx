import { Pencil, Hash, WholeWord } from "lucide-react"

import type { User } from "@/api/user/api.ts"

const stats = [
  { game: "5INAROW", score: "1,431", icon: Hash, color: "#3B5BDB" },
  { game: "BOMB", score: "1,130", icon: WholeWord, color: "#1B4332" },
]

export default function PlayerProfile({ user }: { user?: User }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-4xl">
        {user?.avtUrl ? (
          <img src={user.avtUrl} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          "🐝"
        )}
      </div>

      <div className="relative flex items-center justify-center">
        <span className="text-xl font-bold">{user?.name ?? "..."}</span>
        <button className="absolute left-full ml-1.5 rounded-full p-1 text-muted-foreground hover:bg-black/5">
          <Pencil size={13} />
        </button>
      </div>

      <div className="flex gap-2">
        {stats.map(({ game, score, icon: Icon, color }) => (
          <div
            key={game}
            className="flex items-center gap-2 rounded-full border border-black/10 px-2 py-2 pr-4" style={{ backgroundColor: "#edecea" }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ backgroundColor: color }}
            >
              <Icon size={14} className="text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                {game}
              </span>
              <span className="text-sm font-bold">{score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
