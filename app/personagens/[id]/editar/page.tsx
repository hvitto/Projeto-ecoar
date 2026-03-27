import { redirect } from 'next/navigation'

type EditarCharacterPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditarCharacterPage({ params }: EditarCharacterPageProps) {
  const { id } = await params
  redirect(`/?view=wizard&characterId=${encodeURIComponent(id)}`)
}
