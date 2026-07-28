type CoordLabelProps = {
  refId?: string
  stamp?: string
  className?: string
}

export default function CoordLabel({
  refId = 'EB-4A',
  stamp,
  className = '',
}: CoordLabelProps) {
  const time = stamp ?? new Date().toISOString().slice(0, 16).replace('T', ' · ')
  return (
    <p
      className={`text-[0.6875rem] uppercase tracking-[0.14em] text-ecoar-teal ${className}`}
    >
      {refId} · {time}
    </p>
  )
}
