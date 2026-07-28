'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { UserPlus, User, LogOut, Home, MoreHorizontal } from 'lucide-react'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { useApp } from '@/shared/contexts/AppContext'
import { useAuth } from '@/shared/contexts/AuthContext'
import Button from '@/shared/components/ui/Button'
import { FIXED_FOLDER_WIDTH } from '@/features/character/sheet/sheetLayoutTypes'
import { sheetFocusRingInset } from '@/features/character/sheet/sheetChrome'

interface HeaderProps {
  onNewCharacter?: () => void
  onGoToDashboard?: () => void
  variant?: 'default' | 'sheet'
}

function SheetMoreMenu({
  onNewCharacter,
  onLogout,
}: {
  onNewCharacter: () => void
  onLogout?: () => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    const focusId = window.setTimeout(() => {
      rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    }, 0)
    return () => {
      window.clearTimeout(focusId)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const itemClass =
    `flex w-full items-center gap-2 px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-[#adb5bd] transition-colors hover:bg-ecoar-teal/10 hover:text-[#f5f5f5] ${sheetFocusRingInset}`

  return (
    <div ref={rootRef} className="relative flex items-stretch">
      <button
        type="button"
        aria-label="Mais ações"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`flex min-w-8 items-center justify-center border-l border-ecoar-teal/30 px-2 text-[#adb5bd] transition-colors hover:bg-ecoar-teal/10 hover:text-[#f5f5f5] ${sheetFocusRingInset} [@media(pointer:coarse)]:min-w-10`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-40 min-w-[11rem] rounded-none border border-ecoar-teal/45 bg-[#1a1d21]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onNewCharacter()
            }}
            className={itemClass}
          >
            <UserPlus className="h-3.5 w-3.5 shrink-0" />
            Nova ficha
          </button>
          {onLogout ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                void onLogout()
              }}
              className={`${itemClass} border-t border-ecoar-teal/25`}
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              Sair
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default function Header({
  onNewCharacter,
  onGoToDashboard,
  variant = 'default',
}: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const appContext = useApp()
  const { user, logout } = useAuth()
  const handleNewCharacterFn = onNewCharacter || appContext.onNewCharacter
  const isSheet = variant === 'sheet'
  const onRosterHome = pathname === '/personagens'

  const handleNewCharacter = () => {
    if (handleNewCharacterFn) {
      handleNewCharacterFn()
    } else {
      router.push('/personagens/novo')
    }
  }

  const handleGoToDashboard = () => {
    if (onGoToDashboard) {
      onGoToDashboard()
    } else {
      router.push('/personagens')
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (isSheet) {
    return (
      <header className="relative z-30 w-full shrink-0 border-b border-ecoar-teal/30 bg-[#1a1d21] text-[#f5f5f5]">
        <div
          className="mx-auto flex h-8 w-full items-stretch px-1.5 sm:h-9 sm:px-4"
          style={{ maxWidth: FIXED_FOLDER_WIDTH }}
        >
          <button
            type="button"
            onClick={handleGoToDashboard}
            className={`border-r border-ecoar-teal/30 px-2.5 text-left transition-colors hover:bg-ecoar-teal/10 ${sheetFocusRingInset} sm:px-3`}
          >
            <span className="block font-display text-[11px] uppercase leading-none tracking-[0.04em] text-[#f5f5f5] sm:text-xs">
              ECOAR +
            </span>
          </button>

          <nav className="ml-auto flex items-stretch">
            <button
              type="button"
              onClick={handleGoToDashboard}
              className={`flex items-center gap-1.5 border-l border-ecoar-teal/30 px-2.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#adb5bd] transition-colors hover:bg-ecoar-teal/10 hover:text-[#f5f5f5] ${sheetFocusRingInset} sm:px-3 sm:text-[10px] [@media(pointer:coarse)]:min-w-10`}
              aria-label="Voltar para personagens"
            >
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <SheetMoreMenu
              onNewCharacter={handleNewCharacter}
              onLogout={user ? handleLogout : undefined}
            />
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ecoar-teal bg-[#1a1d21]/95 text-[#f5f5f5]">
      <div className="flex min-h-[52px] items-stretch">
        <button
          type="button"
          onClick={handleGoToDashboard}
          className="border-r border-ecoar-teal/30 px-4 py-3 text-left transition-colors hover:bg-ecoar-teal/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ecoar-teal sm:px-5"
        >
          <span className="block font-display text-xs uppercase leading-none tracking-[0.04em] text-[#f5f5f5] sm:text-sm">
            ECOAR +
          </span>
          <span className="mt-1 block text-[9px] uppercase tracking-[0.16em] text-ecoar-teal">
            Fichas
          </span>
        </button>

        <nav className="hidden flex-1 items-stretch justify-end md:flex">
          {user && !onRosterHome ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={Home}
              onClick={handleGoToDashboard}
              className="h-auto rounded-none border-r border-ecoar-teal/30 px-4 text-[10px] uppercase tracking-[0.12em] text-[#adb5bd] hover:text-[#f5f5f5]"
            >
              Fichas
            </Button>
          ) : null}
          <div className="flex items-center border-r border-ecoar-teal/30 px-3">
            <ThemeSwitcher />
          </div>
          <button
            type="button"
            onClick={handleNewCharacter}
            className="flex items-center gap-2 bg-ecoar-magenta px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ecoar-accent-ink)] transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ecoar-teal"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Nova ficha
          </button>
          {user && (
            <div className="flex items-stretch border-l border-ecoar-teal/30">
              <div className="flex items-center gap-2 px-4 text-[#adb5bd]">
                <User className="h-3.5 w-3.5 text-ecoar-teal" />
                <span className="max-w-[150px] truncate text-[10px] uppercase tracking-wider">
                  {user.username || user.email.split('@')[0]}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="border-l border-ecoar-teal/30 px-4 text-[#adb5bd] transition-colors hover:bg-ecoar-teal/10 hover:text-[#f5f5f5]"
                aria-label="Sair"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </nav>

        <div className="ml-auto flex items-stretch md:hidden">
          {user && !onRosterHome ? (
            <button
              type="button"
              onClick={handleGoToDashboard}
              className="flex min-w-[44px] items-center justify-center border-l border-ecoar-teal/30 text-[#adb5bd] hover:text-[#f5f5f5]"
              aria-label="Minhas fichas"
            >
              <Home className="h-5 w-5" />
            </button>
          ) : null}
          <div className="flex min-w-[44px] items-center justify-center border-l border-ecoar-teal/30">
            <ThemeSwitcher />
          </div>
          <button
            type="button"
            onClick={handleNewCharacter}
            className="flex min-w-[44px] items-center justify-center bg-ecoar-magenta text-[var(--ecoar-accent-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ecoar-teal"
            aria-label="Nova ficha"
          >
            <UserPlus className="h-5 w-5" />
          </button>
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-w-[44px] items-center justify-center border-l border-ecoar-teal/30 text-[#adb5bd] hover:text-[#f5f5f5]"
              aria-label="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
