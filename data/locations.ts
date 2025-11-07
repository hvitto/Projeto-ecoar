// Locations data from Ecoar RPG - Plano Caeruleum

export interface Location {
  id: string
  name: string
  nation?: string // Nação/Continente
  region?: string // Região dentro da nação
  description?: string
  technology?: string // Tecnologia predominante
  culturalInspiration?: string // Inspiração cultural
}

// ========== ALIANÇA RESISTENTE (GERRAH) ==========
const aliancaResistente: Location[] = [
  {
    id: 'novae-terrae',
    name: 'Novae-Terrae',
    nation: 'Aliança Resistente',
    description: 'Uma nação criada por refugiados durante a Era do Aço em uma região extremamente hostil do continente de Gerrah. Possui uma variedade de idiomas e povos, sendo principalmente composta por peccatas, híbridos de peccatas e outras raças de praticamente todo o Plano Caeruleum. O território é habitado por bestas monstruosas chamadas de dinossauros, que impediram a facilidade de habitação.',
    technology: 'Reclusa',
    culturalInspiration: 'Fantasia medieval europeia',
  },
  {
    id: 'hinan',
    name: 'Hinan',
    nation: 'Aliança Resistente',
    description: 'Uma terra fria, montanhosa e cercada por água na região norte do continente de Gerrah. Os hinaneses são um povo que preza muito pela sua própria cultura, possuem seu próprio panteão de deuses, muitas superstições e um grande foco em representações artísticas. Embora a maior parte dos humanos em Hinan sejam tsusagis, também existem outras raças locais.',
    technology: 'Reclusa',
    culturalInspiration: 'Japão feudal e seu folclore',
  },
  {
    id: 'nila',
    name: 'Nila',
    nation: 'Aliança Resistente',
    description: 'Uma nação árida e desértica na região sudeste do continente de Gerrah. Os nilípcios adoram deuses antropomórficos de origem incerta. Sua civilização é uma das mais antigas no Plano Caeruleum, se não a mais antiga, e acompanha o rio Nila, um grande corpo de água doce que viabiliza a vida na área desértica. Nila é facilmente acessada através da água, possuindo uma variedade maior de raças do que Hinan.',
    technology: 'Reclusa',
    culturalInspiration: 'Egito Antigo e seu folclore',
  },
]

// ========== ILHAS DO NORTE ==========
const ilhasDoNorte: Location[] = [
  {
    id: 'porto-do-encontro',
    name: 'Porto do Encontro',
    nation: 'Ilhas do Norte',
    description: 'Uma ilha com poucas ou nenhumas leis, populada por piratas e saqueadores de todas as Ilhas do Norte. Os piratas vivem sob um código de honra, com regras não faladas sobre a boa convivência entre os saqueadores. Aqueles que nascem no Porto do Encontro não possuem cidadania e nacionalidade nenhuma até que sejam devidamente registrados em uma das nações, sendo chamados de piratas.',
    technology: 'Vapor-Alquímico',
    culturalInspiration: 'Os piratas da cultura pop',
  },
  {
    id: 'governo-meneviano',
    name: 'Governo Meneviano',
    nation: 'Ilhas do Norte',
    description: 'Um reino rico e poderoso, pioneiro da tecnologia do Vapor-Alquímico. Seu método de governo é autoritário e imperialista, não só controlando e segmentando sua população mas com um pé nas nações ao seu redor. Durante a Era do Aço, essa nação fez diversas investidas colonialistas. Hoje, a nação é famosa por seu pioneirismo e conhecimentos alquímicos, sendo referência em alquimia, magia e educação no geral. Estudantes de todo o plano vão para Meneva estudar em suas gloriosas escolas.',
    technology: 'Vapor-Alquímico',
    culturalInspiration: 'Uma Inglaterra distópica e steampunk',
  },
  {
    id: 'keltia-alba',
    name: 'Alba',
    nation: 'Ilhas do Norte',
    region: 'Keltia',
    description: 'Uma das três regiões de Keltia. Os kélticos são um conjunto de culturas diferentes sob uma aliança, semelhante à Aliança Resistente mas em uma escala muito menor. A união dos povos de Keltia foi o que permitiu que essa nação saísse do controle do Governo Meneviano no final da Era do Aço. Keltia permaneceu com a sua tecnologia Reclusa e se manteve distante do Vapor-Alquímico, se mantendo fiel às suas raízes.',
    technology: 'Reclusa',
    culturalInspiration: 'Escócia, País de Gales, e outros povos que caem sob o termo "celtas"',
  },
  {
    id: 'keltia-cynru',
    name: 'Cymru',
    nation: 'Ilhas do Norte',
    region: 'Keltia',
    description: 'Uma das três regiões de Keltia. Os kélticos são um conjunto de culturas diferentes sob uma aliança, semelhante à Aliança Resistente mas em uma escala muito menor. A união dos povos de Keltia foi o que permitiu que essa nação saísse do controle do Governo Meneviano no final da Era do Aço. Keltia permaneceu com a sua tecnologia Reclusa e se manteve distante do Vapor-Alquímico, se mantendo fiel às suas raízes.',
    technology: 'Reclusa',
    culturalInspiration: 'Escócia, País de Gales, e outros povos que caem sob o termo "celtas"',
  },
  {
    id: 'keltia-eiru',
    name: 'Ériu',
    nation: 'Ilhas do Norte',
    region: 'Keltia',
    description: 'Uma das três regiões de Keltia. Os kélticos são um conjunto de culturas diferentes sob uma aliança, semelhante à Aliança Resistente mas em uma escala muito menor. A união dos povos de Keltia foi o que permitiu que essa nação saísse do controle do Governo Meneviano no final da Era do Aço. Keltia permaneceu com a sua tecnologia Reclusa e se manteve distante do Vapor-Alquímico, se mantendo fiel às suas raízes.',
    technology: 'Reclusa',
    culturalInspiration: 'Escócia, País de Gales, e outros povos que caem sob o termo "celtas"',
  },
  {
    id: 'reinos-nordicos-eyja',
    name: 'Eyja',
    nation: 'Ilhas do Norte',
    region: 'Reinos Nórdicos',
    description: 'Um dos cinco reinos dos Reinos Nórdicos. Os povos dos Reinos Nórdicos possuem contato tanto com todas as Ilhas do Norte, Gerrah e Darenvia. Durante a Era do Aço, eles costumavam saquear todos que conseguiam alcançar. Os reinos se mantiveram afastados durante a Era do Ouro, focando em relações entre um reino e outro e desenvolvendo seu próprio estilo de vida.',
    technology: 'Reclusa',
    culturalInspiration: 'Nas crônicas vikings e nos países escandinavos',
  },
  {
    id: 'reinos-nordicos-havn',
    name: 'Havn',
    nation: 'Ilhas do Norte',
    region: 'Reinos Nórdicos',
    description: 'Um dos cinco reinos dos Reinos Nórdicos. Os povos dos Reinos Nórdicos possuem contato tanto com todas as Ilhas do Norte, Gerrah e Darenvia. Durante a Era do Aço, eles costumavam saquear todos que conseguiam alcançar. Os reinos se mantiveram afastados durante a Era do Ouro, focando em relações entre um reino e outro e desenvolvendo seu próprio estilo de vida.',
    technology: 'Reclusa',
    culturalInspiration: 'Nas crônicas vikings e nos países escandinavos',
  },
  {
    id: 'reinos-nordicos-stykke',
    name: 'Stykke',
    nation: 'Ilhas do Norte',
    region: 'Reinos Nórdicos',
    description: 'Um dos cinco reinos dos Reinos Nórdicos. Os povos dos Reinos Nórdicos possuem contato tanto com todas as Ilhas do Norte, Gerrah e Darenvia. Durante a Era do Aço, eles costumavam saquear todos que conseguiam alcançar. Os reinos se mantiveram afastados durante a Era do Ouro, focando em relações entre um reino e outro e desenvolvendo seu próprio estilo de vida.',
    technology: 'Reclusa',
    culturalInspiration: 'Nas crônicas vikings e nos países escandinavos',
  },
  {
    id: 'reinos-nordicos-vagg',
    name: 'Vägg',
    nation: 'Ilhas do Norte',
    region: 'Reinos Nórdicos',
    description: 'Um dos cinco reinos dos Reinos Nórdicos. Os povos dos Reinos Nórdicos possuem contato tanto com todas as Ilhas do Norte, Gerrah e Darenvia. Durante a Era do Aço, eles costumavam saquear todos que conseguiam alcançar. Os reinos se mantiveram afastados durante a Era do Ouro, focando em relações entre um reino e outro e desenvolvendo seu próprio estilo de vida.',
    technology: 'Reclusa',
    culturalInspiration: 'Nas crônicas vikings e nos países escandinavos',
  },
  {
    id: 'reinos-nordicos-yksin',
    name: 'Yksin',
    nation: 'Ilhas do Norte',
    region: 'Reinos Nórdicos',
    description: 'Um dos cinco reinos dos Reinos Nórdicos. Os povos dos Reinos Nórdicos possuem contato tanto com todas as Ilhas do Norte, Gerrah e Darenvia. Durante a Era do Aço, eles costumavam saquear todos que conseguiam alcançar. Os reinos se mantiveram afastados durante a Era do Ouro, focando em relações entre um reino e outro e desenvolvendo seu próprio estilo de vida.',
    technology: 'Reclusa',
    culturalInspiration: 'Nas crônicas vikings e nos países escandinavos',
  },
]

// ========== IMPÉRIO DARENVIANO ==========
const imperioDarenviano: Location[] = [
  {
    id: 'terra-de-ninguem',
    name: 'Terra de Ninguém',
    nation: 'Império Darenviano',
    description: 'Terras que costumavam ser do Império Vugre, e que fazem fronteira com a União Lyriana. Ambas as nações brigam pelo controle desses territórios. A Terra de Ninguém darenviana é uma área exclusivamente militar, com pouca ou nenhuma área residencial. O lugar é uma zona de guerra completa, não só contra a União Lyriana mas também contra as ameaças da Praga, que são trazidas pelo caos do conflito.',
    technology: 'Darenferrum',
    culturalInspiration: 'Nos campos de batalha das guerras mundiais',
  },
  {
    id: 'battaglia',
    name: 'Battaglia',
    nation: 'Império Darenviano',
    description: 'Battaglia está mais afastada da zona de guerra, mas faz fronteira com o decaído Império Vugre, de onde criaturas nefastas costumam surgir. Essa região é responsável por explorar a região devastada e mantê-la sob controle. Diversos Arautos da Praga e Assombros saem da Devastação de Vugra e tentam invadir o resto de Darenvia.',
    technology: 'Darenferrum',
    culturalInspiration: 'Itália',
  },
  {
    id: 'conquista',
    name: 'Conquista',
    nation: 'Império Darenviano',
    description: 'Conquista também faz contato com a Devastação de Vugra, e auxilia Battaglia na contenção dessa área. Essa região também faz fronteira com a zona de guerra da Terra de Ninguém, e age como uma mediadora entre reforços para ambos os pontos de conflito.',
    technology: 'Darenferrum',
    culturalInspiration: 'Espanha',
  },
  {
    id: 'gerland',
    name: 'Gerland',
    nation: 'Império Darenviano',
    description: 'Gerland está mais afastada do conflito com a União Lyriana e faz um pouco de fronteira com a Devastação de Vugra. Seu foco, porém, é em desenvolvimento tecnológico e treinamento militar. Há diversas culturas e povos diferentes espalhados por Gerland, e todos contribuem para os esforços da guerra.',
    technology: 'Darenferrum',
    culturalInspiration: 'Alemanha e outros países como a Áustria, Bélgica, Suíça e Países Baixos',
  },
  {
    id: 'porto-de-guerra',
    name: 'Porto de Guerra',
    nation: 'Império Darenviano',
    description: 'Porto de Guerra faz fronteira com a Terra de Ninguém, mas mais importante: com o mar de Darenvia. Essa região portuária é responsável pela logística no ocidente de Darenvia e também bate de frente com a marinha Lyriana.',
    technology: 'Darenferrum',
    culturalInspiration: 'Itália',
  },
]

// ========== UNIÃO LYRIANA ==========
const uniaoLyriana: Location[] = [
  {
    id: 'libertyrio',
    name: 'Libertyrio',
    nation: 'União Lyriana',
    description: 'Libertyrio já foi parte do Império Vugre, e por isso seu nome homenageia a atual liberdade do território. A região é populada por diversos povos, mas principalmente por famílias de belluans que viviam lá desde a época que o Império Vugre controlava o território, ou que fugiram para lá após a ruína do mesmo. Em toda a nação, Libertyrio é a única região que possui maior liberdade sobre o uso de magia, embora ainda extremamente regulada. Com as permissões corretas, você é livre para utilizar magia no território. Essa liberdade possui motivo, e é provocada pela situação atual da Praga em Libertyrio.',
    technology: 'Imaculada',
    culturalInspiration: 'Nenhum país específico em mente, apenas um cenário inspirado no mundo moderno',
  },
  {
    id: 'sulyrio',
    name: 'Sulyrio',
    nation: 'União Lyriana',
    description: 'Sulyrio está mergulhada no conflito contra Darenvia, e também faz uma pequena fronteira com a Devastação de Vugra. A região é responsável pela logística dos conflitos, enquanto recebe apoio militar e tecnológico de Nortyrio.',
    technology: 'Darenferrum',
    culturalInspiration: 'França',
  },
  {
    id: 'nortyrio',
    name: 'Nortyrio',
    nation: 'União Lyriana',
    description: 'Os nortyrianos não são nativos desse plano, e sua origem é traçada até o Plano Faerie. No entanto, essa população vive em Lyrio desde pouco antes da Era do Aço e criou raízes fortes no continente, assim como os novae-terraenses fundaram seu próprio povo e cultura em Gerrah. O governo de Nortyrio é especialmente rígido contra a magia.',
    technology: 'Darenferrum',
    culturalInspiration: 'Um pedaço da Rússia e outros países eslavos no Plano Caeruleum',
  },
]

// ========== TODAS AS LOCALIZAÇÕES ==========
export const locations: Location[] = [
  ...aliancaResistente,
  ...ilhasDoNorte,
  ...imperioDarenviano,
  ...uniaoLyriana,
]

// ========== FUNÇÕES AUXILIARES ==========
export const getLocationById = (id: string): Location | undefined => {
  return locations.find(loc => loc.id === id)
}

export const getLocationsByNation = (nation: string): Location[] => {
  return locations.filter(loc => loc.nation === nation)
}

export const getLocationsByRegion = (region: string): Location[] => {
  return locations.filter(loc => loc.region === region)
}

export const getAllNations = (): string[] => {
  const nations = new Set(
    locations
      .map(loc => loc.nation)
      .filter((nation): nation is string => typeof nation === 'string')
  )
  return Array.from(nations).sort()
}

export const getAllRegions = (nation?: string): string[] => {
  const filtered = nation 
    ? locations.filter(loc => loc.nation === nation)
    : locations
  const regions = new Set(
    filtered
      .map(loc => loc.region)
      .filter((region): region is string => typeof region === 'string')
  )
  return Array.from(regions).sort()
}
