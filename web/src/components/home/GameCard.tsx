import { useRef, useState } from "react"
import { Play, type LucideIcon } from "lucide-react"

type GameCardProps = {
  name: string
  description: string
  playing: number
  color: string
  icon: LucideIcon
}

export default function GameCard({ name, description, playing, color, icon: Icon }: GameCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedRef = useRef(0);
  const [btnHovered, setBtnHovered] = useState(false);

  const handleButtonHover = () => {
    setBtnHovered(true);
    const now = Date.now();
    if (now - lastPlayedRef.current < 200) return;
    lastPlayedRef.current = now;
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/hover-button.mp3");
      audioRef.current.volume = 0.5;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  return (
    <div className="flex flex-col rounded-3xl border border-gray-300 bg-gray-100 p-7 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: color }}
      >
        <Icon size={22} className="text-white" />
      </div>

      <h2 className="mt-5 text-5xl font-extrabold tracking-tight">{name}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      <div className="mt-auto flex items-center justify-between pt-10">
        <span className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{playing.toLocaleString()}</span> playing
        </span>
        <button
          className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-all duration-200"
          style={{ backgroundColor: color, transform: btnHovered ? "scale(1.1)" : "scale(1)" }}
          onMouseEnter={handleButtonHover}
          onMouseLeave={() => setBtnHovered(false)}
        >
          <Play size={16} fill="white" />
        </button>
      </div>
    </div>
  )
}
