'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import SelectPlate from '@/components/beyond/SelectPlate'
import StampButton from '@/components/beyond/StampButton'
import CoordLabel from '@/components/beyond/CoordLabel'
import RulerTicks from '@/components/branding/RulerTicks'
import {
  soulLevels,
  getSoulLevelByNivel,
  getEstagios,
  getSoulLevelsByEstagio,
  resolveSoulLevelOrDefault,
} from '@/data/soulLevels'
import { microLabel, plateMeta, statusLabel } from '@/shared/styles/ecoarChrome'

function shortEstagio(estagio: string) {
  return estagio.replace(/^Personagem\s+/, '')
}

export function SoulLevelSelectionStep({
  nivelAlmaInicial,
  onSelect,
}: {
  nivelAlmaInicial: number
  onSelect: (nivel: number) => void
}) {
  const catalogEmpty = soulLevels.length === 0
  const selected = catalogEmpty
    ? resolveSoulLevelOrDefault(1)
    : getSoulLevelByNivel(nivelAlmaInicial)
  const estagios = getEstagios()
  const reduceMotion = useReducedMotion()
  const [advancedOpen, setAdvancedOpen] = useState(
    () => !catalogEmpty && nivelAlmaInicial > 1,
  )
  const [activeEstagio, setActiveEstagio] = useState<string | null>(() => {
    if (catalogEmpty) return null
    const current = getSoulLevelByNivel(nivelAlmaInicial)
    if (current && current.nivel > 1) return current.estagio
    return null
  })
  const [mobileStageIndex, setMobileStageIndex] = useState(() => {
    if (catalogEmpty) return 0
    const current = getSoulLevelByNivel(nivelAlmaInicial)
    if (!current) return 0
    const idx = estagios.indexOf(current.estagio)
    return idx >= 0 ? idx : 0
  })
  const headingId = useId()
  const selectionLiveId = useId()
  const stageLiveId = useId()
  const [stageLiveMessage, setStageLiveMessage] = useState('')
  const stageLiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const carouselNavRef = useRef<HTMLDivElement | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const ensureCarouselNavVisible = () => {
    const nav = carouselNavRef.current
    if (!nav) return

    let scrollParent: HTMLElement | null = nav.parentElement
    while (scrollParent) {
      const { overflowY } = getComputedStyle(scrollParent)
      if (
        overflowY === 'auto' ||
        overflowY === 'scroll' ||
        overflowY === 'overlay'
      ) {
        break
      }
      scrollParent = scrollParent.parentElement
    }

    const dock = document.querySelector<HTMLElement>('[data-soul-level-dock]')
    const dockTop = dock?.getBoundingClientRect().top ?? window.innerHeight
    const navBottom = nav.getBoundingClientRect().bottom
    const overflow = navBottom - (dockTop - 12)
    if (overflow <= 0) return

    if (scrollParent) {
      scrollParent.scrollBy({ top: overflow, behavior: 'auto' })
    } else {
      window.scrollBy({ top: overflow, behavior: 'auto' })
    }
  }

  useEffect(() => {
    if (!advancedOpen || activeEstagio) return
    let cancelled = false
    const run = () => {
      if (!cancelled) ensureCarouselNavVisible()
    }
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(run)
    })
    const timer = window.setTimeout(run, 140)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
    }
  }, [advancedOpen, activeEstagio, mobileStageIndex, reduceMotion])

  const publishStageMessage = (msg: string) => {
    if (stageLiveTimerRef.current != null) clearTimeout(stageLiveTimerRef.current)
    setStageLiveMessage('')
    stageLiveTimerRef.current = setTimeout(() => {
      setStageLiveMessage(msg)
      stageLiveTimerRef.current = null
    }, 50)
  }

  const publishStageLive = (index: number) => {
    const estagio = estagios[index]
    if (!estagio) return
    publishStageMessage(
      `Estágio ${index + 1} de ${estagios.length}: ${shortEstagio(estagio)}.`,
    )
  }

  const publishStageOpen = (estagio: string) => {
    publishStageMessage(`Estágio ${shortEstagio(estagio)} aberto. Escolha um nível.`)
  }

  useEffect(() => {
    return () => {
      if (stageLiveTimerRef.current != null) clearTimeout(stageLiveTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (catalogEmpty) {
      if (nivelAlmaInicial !== 1) onSelectRef.current(1)
      setAdvancedOpen(false)
      setActiveEstagio(null)
      return
    }
    if (!getSoulLevelByNivel(nivelAlmaInicial)) {
      onSelectRef.current(1)
      setAdvancedOpen(false)
      setActiveEstagio(null)
    }
  }, [catalogEmpty, nivelAlmaInicial])

  useEffect(() => {
    if (!activeEstagio) return
    if (getSoulLevelsByEstagio(activeEstagio).length === 0) {
      setActiveEstagio(null)
    }
  }, [activeEstagio])

  useEffect(() => {
    if (estagios.length === 0) return
    setMobileStageIndex((i) => Math.min(i, estagios.length - 1))
  }, [estagios.length])

  const stageCount = estagios.length
  const mobileEstagio = estagios[mobileStageIndex] ?? null
  const fadeTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }

  const levelsInStage = activeEstagio ? getSoulLevelsByEstagio(activeEstagio) : []
  const levelsInStageExceptAlma1 = levelsInStage.filter((sl) => sl.nivel !== 1)
  const selectedOutsideStage =
    selected &&
    selected.nivel > 1 &&
    !levelsInStageExceptAlma1.some((sl) => sl.nivel === selected.nivel)
      ? selected
      : null
  const alma1Meta = resolveSoulLevelOrDefault(1)

  const levelAnnounce = selected
    ? `Nível de Alma ${selected.nivel} selecionado. ${selected.pontosEvolucao} pontos de evolução. Nível de Poder ${selected.nivelPoder}.`
    : 'Nenhum nível selecionado.'

  const selectAlma1 = () => {
    onSelect(1)
    setActiveEstagio(null)
    setAdvancedOpen(false)
  }

  const renderStagePlate = (estagio: string, i: number) => {
    const niveis = getSoulLevelsByEstagio(estagio)
    const poder = niveis[0]?.nivelPoder ?? 0
    const range =
      niveis.length > 0 ? `${niveis[0].nivel}–${niveis[niveis.length - 1].nivel}` : '—'
    const name = shortEstagio(estagio)
    return (
      <SelectPlate
        key={estagio}
        title={name}
        description={`Níveis ${range}`}
        meta={<span className={plateMeta}>Poder {poder}</span>}
        selected={false}
        selection="action"
        ariaLabel={`Abrir estágio ${name}, níveis ${range}, Poder ${poder}`}
        onClick={() => {
          setActiveEstagio(estagio)
          const idx = estagios.indexOf(estagio)
          if (idx >= 0) setMobileStageIndex(idx)
          publishStageOpen(estagio)
        }}
        index={i}
        className="w-full"
      />
    )
  }

  const alma1Plate = (mode: 'radio' | 'action') => (
    <div>
      <CoordLabel refId="LVL-01" stamp="DEFAULT" className="mb-2" />
      <SelectPlate
        figure="01"
        title="Alma 1"
        description="Recomendado para iniciantes. Sem PE iniciais."
        meta={
          <span className={plateMeta}>
            Poder {alma1Meta.nivelPoder} · 0 PE
          </span>
        }
        selected={nivelAlmaInicial === 1 || catalogEmpty}
        selection={mode}
        ariaLabel={
          mode === 'radio'
            ? `Nível de Alma 1, padrão para iniciantes, Poder ${alma1Meta.nivelPoder}, 0 PE`
            : `Usar Alma 1, padrão para iniciantes, Poder ${alma1Meta.nivelPoder}, 0 PE`
        }
        onClick={selectAlma1}
        index={0}
      />
    </div>
  )

  const glossary = (
    <dl className="space-y-2 text-xs leading-relaxed text-ecoar-dark-600 dark:text-[#c5c8ce] max-w-[52ch] font-normal">
      <div>
        <dt className="inline font-normal text-ecoar-dark-900 dark:text-ecoar-light-900">PE</dt>
        <dd className="inline">
          {' '}
          — Pontos de Evolução. Compram singularidades e evoluem traços na criação.
        </dd>
      </div>
      <div>
        <dt className="inline font-normal text-ecoar-dark-900 dark:text-ecoar-light-900">ȼ</dt>
        <dd className="inline">
          {' '}
          — Moeda de equipamento. Cada PE rende ȼ50 extras. Base: ȼ5500 + pontos de criação.
        </dd>
      </div>
      <div>
        <dt className="inline font-normal text-ecoar-dark-900 dark:text-ecoar-light-900">Poder</dt>
        <dd className="inline">
          {' '}
          — Nível de Poder. Calibra a oposição da mesa.
        </dd>
      </div>
    </dl>
  )

  return (
    <div className="space-y-6 pb-2 sm:pb-0">
      <div>
        <h2
          id={headingId}
          className="font-display text-[clamp(1.2rem,2.4vw,1.5rem)] uppercase leading-[1.05] tracking-[-0.02em] text-ecoar-dark-900 dark:text-ecoar-light-900"
        >
          Nível de Alma
        </h2>
        <p className={`mt-2 ${microLabel} font-normal`}>
          {nivelAlmaInicial <= 1 || catalogEmpty
            ? 'Padrão · Alma 1'
            : `Selecionado · Alma ${nivelAlmaInicial}`}
        </p>
      </div>

      <p id={selectionLiveId} className="sr-only" aria-live="polite" aria-atomic="true">
        {levelAnnounce}
      </p>
      <p id={stageLiveId} className="sr-only" aria-live="polite" aria-atomic="true">
        {stageLiveMessage}
      </p>

      {catalogEmpty ? (
        <div className="space-y-4" role="status">
          <p className="text-xs leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] max-w-[48ch] font-normal">
            Catálogo de níveis indisponível. Alma 1 fica selecionado; outros níveis não podem ser
            escolhidos agora. Você ainda pode começar a criação.
          </p>
          <div role="radiogroup" aria-labelledby={headingId}>
            {alma1Plate('radio')}
          </div>
        </div>
      ) : (
        <>
          {!advancedOpen ? (
            <>
              <div role="radiogroup" aria-labelledby={headingId}>
                {alma1Plate('radio')}
              </div>
              <StampButton
                tone="ghost"
                onClick={() => {
                  setAdvancedOpen(true)
                  publishStageLive(mobileStageIndex)
                  requestAnimationFrame(() => ensureCarouselNavVisible())
                }}
                className="w-full sm:w-auto font-normal min-h-[48px]"
                disabled={estagios.length === 0}
              >
                Escolher outro nível
              </StampButton>
            </>
          ) : estagios.length === 0 ? (
            <>
              <div className="mb-5">{glossary}</div>
              <div role="radiogroup" aria-labelledby={headingId}>
                {alma1Plate('radio')}
              </div>
              <p
                className="text-xs leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] font-normal"
                role="status"
              >
                Nenhum estágio disponível no catálogo. Use Alma 1 para continuar.
              </p>
            </>
          ) : (
            <div className="space-y-5">
              {glossary}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={statusLabel}>
                  {activeEstagio ? (
                    `Níveis · ${shortEstagio(activeEstagio)}`
                  ) : (
                    <>
                      <span className="sm:hidden">
                        Estágio {mobileStageIndex + 1} de {stageCount}
                      </span>
                      <span className="hidden sm:inline">Escolha o estágio</span>
                    </>
                  )}
                </p>
                <StampButton
                  tone="ghost"
                  onClick={() => {
                    setAdvancedOpen(false)
                    setActiveEstagio(null)
                    setStageLiveMessage('')
                    onSelect(1)
                  }}
                  className="!py-2.5 !px-3 text-xs font-normal min-h-[44px]"
                >
                  Voltar ao Alma 1
                </StampButton>
              </div>

              {!activeEstagio ? (
                <div className="space-y-5">
                  {alma1Plate('action')}
                  <div className="border-t border-ecoar-teal/40 pt-5 space-y-5">
                    <div className="sm:hidden space-y-3 pb-1">
                      <div className="relative">
                        <div
                          className="pointer-events-none absolute inset-y-0 left-0 w-6 z-[1] bg-gradient-to-r from-white/90 to-transparent dark:from-[rgba(26,29,33,0.92)]"
                          aria-hidden
                        />
                        <div
                          className="pointer-events-none absolute inset-y-0 right-0 w-6 z-[1] bg-gradient-to-l from-white/90 to-transparent dark:from-[rgba(26,29,33,0.92)]"
                          aria-hidden
                        />
                        <AnimatePresence mode="wait" initial={false}>
                          {mobileEstagio ? (
                            <motion.div
                              key={mobileEstagio}
                              initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                              transition={fadeTransition}
                            >
                              {renderStagePlate(mobileEstagio, mobileStageIndex)}
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                      <div
                        ref={carouselNavRef}
                        className="flex items-center gap-2 scroll-mb-[calc(15.5rem+env(safe-area-inset-bottom))]"
                        role="group"
                        aria-label="Navegar estágios"
                      >
                        <StampButton
                          tone="grid"
                          onClick={() => {
                            const next = Math.max(0, mobileStageIndex - 1)
                            setMobileStageIndex(next)
                            publishStageLive(next)
                            requestAnimationFrame(() => ensureCarouselNavVisible())
                          }}
                          disabled={mobileStageIndex <= 0}
                          className="flex-1 min-h-[48px] font-normal"
                          aria-label="Estágio anterior"
                        >
                          ← Anterior
                        </StampButton>
                        <span className={`${statusLabel} shrink-0 tabular-nums px-1`}>
                          {mobileStageIndex + 1}/{stageCount}
                        </span>
                        <StampButton
                          tone="grid"
                          onClick={() => {
                            const next = Math.min(stageCount - 1, mobileStageIndex + 1)
                            setMobileStageIndex(next)
                            publishStageLive(next)
                            requestAnimationFrame(() => ensureCarouselNavVisible())
                          }}
                          disabled={mobileStageIndex >= stageCount - 1}
                          className="flex-1 min-h-[48px] font-normal"
                          aria-label="Próximo estágio"
                        >
                          Próximo →
                        </StampButton>
                      </div>
                      <RulerTicks
                        marks={estagios.map((_, i) =>
                          String(i + 1).padStart(2, '0'),
                        )}
                      />
                    </div>

                    <div
                      role="group"
                      aria-label="Estágios do personagem"
                      className="hidden sm:grid sm:grid-cols-2 gap-2"
                    >
                      {estagios.map((estagio, i) => renderStagePlate(estagio, i))}
                    </div>
                    <div className="hidden sm:block">
                      <RulerTicks marks={['01', '06', '12', '18', '24']} />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <StampButton
                    tone="grid"
                    onClick={() => {
                      setActiveEstagio(null)
                      publishStageLive(mobileStageIndex)
                    }}
                    className="!py-2.5 !px-3 text-xs font-normal min-h-[44px] w-full sm:w-auto"
                  >
                    ← {shortEstagio(activeEstagio)} · estágios
                  </StampButton>

                  {levelsInStage.length === 0 ? (
                    <p
                      className="text-xs leading-relaxed text-ecoar-dark-500 dark:text-[#adb5bd] font-normal"
                      role="status"
                    >
                      Este estágio não tem níveis carregados. Volte e escolha outro.
                    </p>
                  ) : (
                    <div
                      role="radiogroup"
                      aria-labelledby={headingId}
                      className="space-y-4"
                    >
                      {selectedOutsideStage ? (
                        <SelectPlate
                          figure={String(selectedOutsideStage.nivel).padStart(2, '0')}
                          title={`Alma ${selectedOutsideStage.nivel}`}
                          description={`${selectedOutsideStage.pontosEvolucao} PE · outro estágio`}
                          meta={
                            <span className={plateMeta}>
                              Poder {selectedOutsideStage.nivelPoder}
                              {` · +ȼ${selectedOutsideStage.pontosEvolucao * 50}`}
                            </span>
                          }
                          selected
                          selection="radio"
                          ariaLabel={`Nível de Alma ${selectedOutsideStage.nivel} selecionado, de outro estágio, ${selectedOutsideStage.pontosEvolucao} PE, Poder ${selectedOutsideStage.nivelPoder}`}
                          onClick={() => onSelect(selectedOutsideStage.nivel)}
                          index={0}
                        />
                      ) : null}
                      {levelsInStageExceptAlma1.length > 0 ? (
                        <div
                          className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${
                            selectedOutsideStage
                              ? 'border-t border-ecoar-teal/40 pt-4'
                              : ''
                          }`}
                        >
                          {levelsInStageExceptAlma1.map((sl, i) => (
                            <SelectPlate
                              key={sl.nivel}
                              figure={String(sl.nivel).padStart(2, '0')}
                              title={`Alma ${sl.nivel}`}
                              description={`${sl.pontosEvolucao} PE`}
                              meta={
                                <span className={plateMeta}>
                                  Poder {sl.nivelPoder}
                                  {sl.nivel > 1
                                    ? ` · +ȼ${sl.pontosEvolucao * 50}`
                                    : ''}
                                </span>
                              }
                              selected={nivelAlmaInicial === sl.nivel}
                              selection="radio"
                              ariaLabel={`Nível de Alma ${sl.nivel}, ${sl.pontosEvolucao} PE, Poder ${sl.nivelPoder}${
                                sl.nivel > 1
                                  ? `, mais ȼ${sl.pontosEvolucao * 50}`
                                  : ''
                              }`}
                              onClick={() => onSelect(sl.nivel)}
                              index={i}
                            />
                          ))}
                        </div>
                      ) : null}
                      <RulerTicks
                        marks={levelsInStageExceptAlma1.map((sl) =>
                          String(sl.nivel).padStart(2, '0'),
                        )}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
