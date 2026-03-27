'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  onClose: () => void
}

type State = { hasError: boolean }

/**
 * Isola falhas de render no catálogo de equipamentos para não derrubar a ficha inteira.
 */
export default class EquipmentCatalogErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[EquipmentCatalog]', error.message, info.componentStack)
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-ecoar-magenta/35 bg-ecoar-magenta/10 dark:bg-ecoar-magenta/15 px-4 py-3 space-y-3 text-sm text-slate-800 dark:text-ecoar-light-900/90">
          <p>O catálogo encontrou um erro ao exibir um item. Você pode tentar de novo ou fechar.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-ecoar-teal-500/40 bg-ecoar-teal-500/15 text-ecoar-teal-800 dark:text-ecoar-teal-300"
            >
              Tentar de novo
            </button>
            <button
              type="button"
              onClick={this.props.onClose}
              className="px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-ecoar-light-900/20"
            >
              Fechar catálogo
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
