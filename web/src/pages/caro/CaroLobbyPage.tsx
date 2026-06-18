import { useEffect, useState } from "react"
import { Bot, ChevronRight, Hash, Pencil, Swords, UserPlus, type LucideIcon } from "lucide-react"
import { toast } from "sonner"

import { useMe } from "@/api/user/query-hooks.ts"
import { useMatchmakingStore } from "@/stores/matchmaking.store.ts"

export default function CaroLobbyPage() {
  const { data: user } = useMe()
  const findingMatch = useMatchmakingStore((s) => s.findingMatch)
  const startMatchmaking = useMatchmakingStore((s) => s.start)
  const cancelMatchmaking = useMatchmakingStore((s) => s.cancel)

  // toast bật/tắt theo findingMatch: cancel hoặc MATCH_FOUND set false -> cleanup tự đóng
  // @ts-ignore
  useEffect(() => {
    if (!findingMatch) return
    const id = toast.loading("Finding a worthy opponent...", {
      description: <SearchElapsed />,
      duration: Infinity,
      cancel: {
        label: "Cancel",
        onClick: () => cancelMatchmaking(),
      },
    })
    return () => toast.dismiss(id)
  }, [findingMatch, cancelMatchmaking])

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 pb-16 pt-10">
        {/* Game title */}
        <div className="flex items-center justify-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-[0_4px_12px_rgba(59,91,219,0.35)]"
            style={{ backgroundColor: "#3B5BDB" }}
          >
            <Hash size={26} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Five in a row</h1>
        </div>

        {/* Player card */}
        <button className="mt-8 flex w-full items-center justify-between rounded-3xl border border-gray-300 bg-gray-100 px-5 py-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(30,30,50,0.4)] active:translate-y-0 active:duration-75">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-2xl">
              {user?.avtUrl ? (
                <img src={user.avtUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                "🐝"
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1.5 font-bold">
                {user?.name ?? "..."}
                <Pencil size={13} className="text-muted-foreground" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                You
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="h-9 w-px bg-black/10" />
            <div className="flex flex-col items-end leading-none">
              <span className="text-2xl font-extrabold tracking-tight">
                {user?.caroStat?.rating.toLocaleString() ?? "..."}
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Rating
              </span>
            </div>
          </div>
        </button>

        {/* Play section header */}
        <div className="mt-6 flex items-center justify-between px-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Play
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="font-bold text-foreground">3,224</span> players online
          </span>
        </div>

        {/* Play actions */}
        <div className="mt-3 flex flex-col gap-3">
          <ActionRow
            icon={Swords}
            color="#EAB308"
            title="Play Online"
            subtitle="Find an opponent near your rating"
            badge="Ranked"
            onClick={startMatchmaking}
            disabled={findingMatch}
          />
          <ActionRow
            icon={Bot}
            color="#16A34A"
            title="Practice with bot"
            subtitle="Casual · no rating at stake"
            onClick={() => toast.info("Available soon")}
          />
          <ActionRow
            icon={UserPlus}
            color="#3B5BDB"
            title="Challenge a friend"
            subtitle="Create a private room and share the code"
            onClick={() => toast.info("Available soon")}
          />
        </div>
    </main>
  )
}

function SearchElapsed() {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return <>Searching for {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</>;
}

type ActionRowProps = {
  icon: LucideIcon
  color: string
  title: string
  subtitle: string
  badge?: string
  onClick?: () => void
  disabled?: boolean
}

function ActionRow({ icon: Icon, color, title, subtitle, badge, onClick, disabled }: ActionRowProps) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex w-full items-center gap-4 rounded-3xl border border-gray-300 bg-gray-100 px-5 py-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(30,30,50,0.4)] active:translate-y-0 active:duration-75 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: color }}
      >
        <Icon size={22} className="text-white" />
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="font-bold">{title}</span>
        <span className="text-xs font-medium text-muted-foreground">{subtitle}</span>
      </div>

      <div className="ml-auto pl-2">
        {badge ? (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: "#FACC15", color: "#422006" }}
          >
            {badge}
          </span>
        ) : (
          <ChevronRight size={20} className="text-muted-foreground" />
        )}
      </div>
    </button>
  )
}
