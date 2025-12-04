'use client'

import { motion } from 'framer-motion'
import { LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import Badge from './Badge'

interface AttributeCardProps {
  label: string
  value: number
  modifier: number
  maxValue: number
  baseValue: number
  icon: LucideIcon
  raceBonus?: number
  martialSchoolBonus?: number
  canIncrease: boolean
  canDecrease: boolean
  onIncrease: () => void
  onDecrease: () => void
  description?: string
  isEvolutionStep?: boolean
  pcCost?: number
  className?: string
}

export default function AttributeCard({
  label,
  value,
  modifier,
  maxValue,
  baseValue,
  icon: Icon,
  raceBonus = 0,
  martialSchoolBonus = 0,
  canIncrease,
  canDecrease,
  onIncrease,
  onDecrease,
  description,
  isEvolutionStep = false,
  pcCost,
  className = '',
}: AttributeCardProps) {
  const totalBonus = raceBonus + martialSchoolBonus
  const progressPercentage = (value / maxValue) * 100
  
  // Determina cor baseada no valor - cores mais suaves
  const getValueColor = () => {
    if (value <= 2) return 'text-ecoar-teal/90'
    if (value <= 5) return 'text-ecoar-teal-400/90'
    return 'text-ecoar-magenta/90'
  }
  
  // Cor da barra de progresso - mais suave
  const getProgressColor = () => {
    if (progressPercentage <= 50) return 'bg-ecoar-teal/60'
    if (progressPercentage <= 75) return 'bg-ecoar-teal-400/60'
    return 'bg-ecoar-magenta/60'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative p-3 rounded-lg border bg-white/[0.03] dark:bg-ecoar-light-900/[0.03] 
        border-white/[0.08] dark:border-ecoar-light-900/[0.08] 
        hover:border-ecoar-teal/30 dark:hover:border-ecoar-teal-500/30 hover:shadow-lg hover:shadow-ecoar-teal/10 dark:hover:shadow-ecoar-teal-600/10
        transition-all duration-200 h-full min-h-[190px] flex flex-col
        ${className}
      `}
    >
      {/* Header: Ícone e Nome - mais compacto com altura fixa */}
      <div className="flex items-center gap-1.5 mb-2.5 min-h-[38px]">
        <div className="w-6 h-6 rounded-md bg-ecoar-teal/15 dark:bg-ecoar-teal-600/15 border border-ecoar-teal/20 dark:border-ecoar-teal-500/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3 h-3 text-ecoar-teal/80 dark:text-ecoar-teal-400/80" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-white/90 dark:text-ecoar-light-900/90 truncate">
            {label}
          </h4>
          <p className="text-[10px] text-white/50 dark:text-ecoar-light-900/50">
            Mod: {modifier >= 0 ? '+' : ''}{modifier}
          </p>
        </div>
        {/* Badges de Bônus - sempre reserva espaço para manter uniformidade */}
        <div className="flex items-center gap-1 flex-shrink-0 min-w-[32px] justify-end">
          {raceBonus > 0 && (
            <Badge variant="cost" size="sm" className="text-[9px] px-1 py-0.5 opacity-80">
              +{raceBonus}
            </Badge>
          )}
          {martialSchoolBonus > 0 && (
            <Badge variant="bonus" size="sm" className="text-[9px] px-1 py-0.5 opacity-80">
              +{martialSchoolBonus}
            </Badge>
          )}
        </div>
      </div>

      {/* Valor Central com Controles Intuitivos - altura fixa */}
      <div className="flex flex-row items-center justify-center mb-2.5 gap-2 flex-1 min-h-[75px]">
        {/* Botão Diminuir - Esquerda */}
        <motion.button
          onClick={canDecrease ? onDecrease : undefined}
          disabled={!canDecrease}
          whileHover={canDecrease ? { scale: 1.05 } : {}}
          whileTap={canDecrease ? { scale: 0.95 } : {}}
          className={`
            w-5 h-5 rounded-full border flex-shrink-0
            flex items-center justify-center
            transition-all duration-150
            ${canDecrease
              ? 'bg-ecoar-magenta/15 border-ecoar-magenta/30 hover:bg-ecoar-magenta/20 hover:border-ecoar-magenta/40 text-ecoar-magenta/80 cursor-pointer'
              : 'bg-white/[0.03] border-white/[0.08] text-white/20 cursor-not-allowed opacity-40'
            }
          `}
        >
          <ChevronLeft className="w-3 h-3" />
        </motion.button>

        {/* Valor Central */}
        <motion.div
          key={value}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className={`text-2xl font-bold leading-none ${getValueColor()} flex-shrink-0`}
        >
          {value}
        </motion.div>

        {/* Botão Aumentar - Direita */}
        <motion.button
          onClick={canIncrease ? onIncrease : undefined}
          disabled={!canIncrease}
          whileHover={canIncrease ? { scale: 1.05 } : {}}
          whileTap={canIncrease ? { scale: 0.95 } : {}}
          className={`
            w-5 h-5 rounded-full border flex-shrink-0
            flex items-center justify-center
            transition-all duration-150
            ${canIncrease
              ? 'bg-ecoar-teal/15 border-ecoar-teal/30 hover:bg-ecoar-teal/20 hover:border-ecoar-teal/40 text-ecoar-teal/80 cursor-pointer'
              : 'bg-white/[0.03] border-white/[0.08] text-white/20 cursor-not-allowed opacity-40'
            }
          `}
        >
          <ChevronRight className="w-3 h-3" />
        </motion.button>
      </div>

      {/* Barra de Progresso - mais sutil */}
      <div className="mb-2">
        <div className="w-full h-0.5 bg-white/[0.03] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`h-full ${getProgressColor()} rounded-full`}
          />
        </div>
      </div>

      {/* Informações Adicionais - footer com altura fixa para uniformidade */}
      <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/[0.06] min-h-[30px]">
        <div className="flex-shrink-0">
          <span className="text-white/50 dark:text-ecoar-light-900/50">Base: </span>
          <span className="text-white/80 dark:text-ecoar-light-900/80 font-medium">{baseValue}</span>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          {totalBonus > 0 && (
            <div className="flex-shrink-0">
              <span className="text-white/50 dark:text-ecoar-light-900/50">Bônus: </span>
              <span className="text-ecoar-teal/80 dark:text-ecoar-teal-400/80 font-medium">+{totalBonus}</span>
            </div>
          )}
          {isEvolutionStep && pcCost !== undefined && pcCost > 0 && (
            <div className="flex-shrink-0">
              <span className="text-white/50 dark:text-ecoar-light-900/50">Custo: </span>
              <span className="text-ecoar-magenta/80 dark:text-ecoar-magenta-400/80 font-medium">{pcCost} PC</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
