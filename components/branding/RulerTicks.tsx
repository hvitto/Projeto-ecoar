type RulerTicksProps = {
  marks?: string[]
  className?: string
}

export default function RulerTicks({
  marks = ['00', '08', '16', '24', '32'],
  className = '',
}: RulerTicksProps) {
  return (
    <div className={`flex mt-auto pt-6 text-[9px] tracking-[0.08em] text-ecoar-teal-700 dark:text-ecoar-teal ${className}`}>
      {marks.map((mark) => (
        <span key={mark} className="flex-1 border-t border-ecoar-teal/60 dark:border-ecoar-teal pt-1">
          {mark}
        </span>
      ))}
    </div>
  )
}
