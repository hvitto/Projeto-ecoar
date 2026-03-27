import { redirect } from 'next/navigation'

type EvolucaoCharacterPageProps = {
  params: Promise<{ id: string }>
}

export default async function EvolucaoCharacterPage({ params }: EvolucaoCharacterPageProps) {
  const { id } = await params
  redirect(`/?view=evolution&characterId=${encodeURIComponent(id)}`)
}
