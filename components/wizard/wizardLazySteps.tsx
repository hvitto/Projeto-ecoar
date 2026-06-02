'use client'

import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'
import StepSkeleton from '@/components/wizard/StepSkeleton'

const loading = () => <StepSkeleton />

function named<P>(loader: () => Promise<Record<string, ComponentType<P>>>, exportName: string) {
  return dynamic(() => loader().then((m) => ({ default: m[exportName] })), { loading, ssr: false })
}

export const LazySoulLevelSelectionStep = named(
  () => import('@/components/wizard/steps/SoulLevelSelectionStep'),
  'SoulLevelSelectionStep',
)
export const LazySelectionDetailsPanel = named(
  () => import('@/components/wizard/steps/SelectionDetailsPanel'),
  'SelectionDetailsPanel',
)
export const LazyRaceSelectionStep = named(
  () => import('@/components/wizard/steps/RaceSelectionStep'),
  'RaceSelectionStep',
)
export const LazyMartialSchoolSelectionStep = named(
  () => import('@/components/wizard/steps/MartialSchoolSelectionStep'),
  'MartialSchoolSelectionStep',
)
export const LazyAttributesStep = named(
  () => import('@/components/wizard/steps/AttributesStep'),
  'AttributesStep',
)
export const LazySkillsStep = named(() => import('@/components/wizard/steps/SkillsStep'), 'SkillsStep')
export const LazyAptitudesStep = named(
  () => import('@/components/wizard/steps/AptitudesStep'),
  'AptitudesStep',
)
export const LazyCreationPointsStep = named(
  () => import('@/components/wizard/steps/CreationPointsStep'),
  'CreationPointsStep',
)
export const LazyPCSpendingStep = named(
  () => import('@/components/wizard/steps/pc-spending/PCSpendingStep'),
  'PCSpendingStep',
)
export const LazyEquipmentStep = named(
  () => import('@/components/wizard/steps/EquipmentStep'),
  'EquipmentStep',
)
export const LazyBackgroundStep = named(
  () => import('@/components/wizard/steps/BackgroundStep'),
  'BackgroundStep',
)
