import { redirect } from 'next/navigation'

type CharacterPageProps = {
  params: Promise<{ id: string }>
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { id } = await params
  redirect(`/?view=sheet&characterId=${encodeURIComponent(id)}`)
}
