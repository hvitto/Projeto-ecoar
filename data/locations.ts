// Locations data from Ecoar RPG map

export interface Location {
  id: string
  name: string
  region?: string
  description?: string
}

// Baseado nas regiões comuns de RPGs de fantasia - será atualizado com dados do mapa do PDF
export const locations: Location[] = [
  {
    id: 'caeruleum',
    name: 'Caeruleum',
    region: 'Capital',
    description: 'A grande capital do reino.',
  },
  {
    id: 'norte',
    name: 'Região Norte',
    region: 'Norte',
    description: 'Terras do norte.',
  },
  {
    id: 'sul',
    name: 'Região Sul',
    region: 'Sul',
    description: 'Terras do sul.',
  },
  {
    id: 'leste',
    name: 'Região Leste',
    region: 'Leste',
    description: 'Terras do leste.',
  },
  {
    id: 'oeste',
    name: 'Região Oeste',
    region: 'Oeste',
    description: 'Terras do oeste.',
  },
]

export const getLocationById = (id: string): Location | undefined => {
  return locations.find(loc => loc.id === id)
}

export const getLocationsByRegion = (region: string): Location[] => {
  return locations.filter(loc => loc.region === region)
}

