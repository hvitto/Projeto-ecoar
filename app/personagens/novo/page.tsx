import { redirect } from 'next/navigation'

export default function NovoPersonagemPage() {
  redirect('/?view=wizard')
}
