import { statusLabel } from '@/shared/styles/ecoarChrome'

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
    <p className={`${statusLabel} ${className}`}>
      {refId} · {time}
    </p>
  )
}
