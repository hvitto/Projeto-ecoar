import type { Ecoar } from '@/data/ecoar'
import type { EcoarSingularity } from '@/data/ecoarSingularities'

export type EcoarSeedItem = {
  id: string
  name: string
  type: string
  acquisitionRequirement: string
  acquisitionCost: number
  description: string
}

export type EcoarBaseTraitSeed = {
  id: string
  ecoarId: string
  name: string
  description: string
  displayOrder: number
}

export type EcoarActionSeed = {
  id: string
  name: string
  description: string
}

export const ecoarCatalogSeed: EcoarSeedItem[] = [
  { id: 'immortalis', name: 'Immortalis', type: 'immortalis', acquisitionRequirement: 'Não ser um Eco no momento da aquisição.', acquisitionCost: 30, description: 'Imortal versátil sem especialização rígida, com foco em habilidades.' },
  { id: 'apodrecido', name: 'Apodrecido', type: 'apodrecido', acquisitionRequirement: 'Não ser um Eco no momento da aquisição.', acquisitionCost: 40, description: 'Cadavérico resistente, com Consciência no lugar de Mente e Mana.' },
  { id: 'elisiade', name: 'Elísiade', type: 'elisiade', acquisitionRequirement: 'Não ser um Eco no momento da aquisição.', acquisitionCost: 40, description: 'Imortal ligado ao Éter, suporte de Compostura e aura de pureza.' },
  { id: 'fenix', name: 'Fênix', type: 'fenix', acquisitionRequirement: 'Não ser um Eco no momento da aquisição.', acquisitionCost: 35, description: 'Imortal ligado à Grande-Chama, cura e resiliência ardente.' },
  { id: 'geist', name: 'Geist', type: 'geist', acquisitionRequirement: 'Não ser um Eco no momento da aquisição.', acquisitionCost: 40, description: 'Espectro incorpóreo com possessão e corpo baseado em Espírito.' },
  { id: 'lycantropo', name: 'Lycantropo', type: 'lycantropo', acquisitionRequirement: 'Não ser um Eco no momento da aquisição.', acquisitionCost: 50, description: 'Imortal de Lunara que assume forma monstruosa de alto combate.' },
  { id: 'proelita', name: 'Proelita', type: 'proelita', acquisitionRequirement: 'Não ser um Eco no momento da aquisição.', acquisitionCost: 40, description: 'Acorrentado pela Fúria, agressivo e resiliente em combate direto.' },
  { id: 'revenant', name: 'Revenant', type: 'revenant', acquisitionRequirement: 'Não ser um Eco no momento da aquisição.', acquisitionCost: 40, description: 'Imortal abissal, aura de penalidade e foco em Compostura.' },
  { id: 'triade', name: 'Tríade', type: 'triade', acquisitionRequirement: 'Não ser um Eco no momento da aquisição.', acquisitionCost: 60, description: 'Imortal de alma fragmentada em três identidades com troca de fichas e projeções.' },
  { id: 'vampiro', name: 'Vampiro', type: 'vampiro', acquisitionRequirement: 'Estar contaminado com a Sede Carmesim; não ser um Eco no momento da aquisição.', acquisitionCost: 0, description: 'Acorrentado pela Sede de sangue, com maldição solar e progressão por pecados e famílias vampíricas.' },
]

export const ecoarBaseTraitsSeed: EcoarBaseTraitSeed[] = [
  { id: 'immortalis-eco-imortal', ecoarId: 'immortalis', name: 'Eco: Imortal', description: 'Eco, Imortal e Força de Vontade Monstruosa.', displayOrder: 1 },
  { id: 'apodrecido-eco-cadaverico', ecoarId: 'apodrecido', name: 'Eco: Cadavérico', description: 'Eco, Cadavérico, Morto-Vivo e Consciência.', displayOrder: 1 },
  { id: 'elisiade-eco-imortal', ecoarId: 'elisiade', name: 'Eco: Imortal', description: 'Eco, Imortal, Força de Vontade Monstruosa e Pureza dos Elísiade.', displayOrder: 1 },
  { id: 'fenix-eco-imortal', ecoarId: 'fenix', name: 'Eco: Imortal', description: 'Eco, Imortal, Força de Vontade Monstruosa e Salvação na Imolação.', displayOrder: 1 },
  { id: 'geist-eco-espectro', ecoarId: 'geist', name: 'Eco: Espectro', description: 'Eco, Espectro, Morto-Vivo, Espírito, Eco Fantasmagórico e Memórias de um Espectro.', displayOrder: 1 },
  { id: 'lycantropo-eco-imortal', ecoarId: 'lycantropo', name: 'Eco: Imortal', description: 'Eco, Imortal, Força de Vontade Monstruosa, Transformação em Lycantropo e Chamado da Lua.', displayOrder: 1 },
  { id: 'proelita-eco-acorrentado', ecoarId: 'proelita', name: 'Eco: Acorrentado', description: 'Eco, Acorrentado, Força de Vontade Monstruosa, Corrente: Fúria e Retribuição do Proelita.', displayOrder: 1 },
  { id: 'revenant-eco-imortal', ecoarId: 'revenant', name: 'Eco: Imortal', description: 'Eco, Imortal, Força de Vontade Monstruosa e Corrupção Abissal.', displayOrder: 1 },
  { id: 'triade-eco-imortal', ecoarId: 'triade', name: 'Eco: Imortal', description: 'Eco, Imortal, Força de Vontade Monstruosa e Fragmentação do Tríade.', displayOrder: 1 },
  { id: 'vampiro-eco-acorrentado', ecoarId: 'vampiro', name: 'Eco: Acorrentado', description: 'Eco, Acorrentado, Força de Vontade Monstruosa, Corrente: Sede, maldição vampírica e descontrole.', displayOrder: 1 },
]

export const ecoarActionsSeed: EcoarActionSeed[] = [
  { id: 'ressurreicao', name: 'Ressurreição', description: 'Retorno entre 12h e 24h após morte, com limitações corporais padrão.' },
  { id: 'ressurreicao-imediata', name: 'Ressurreição Imediata', description: 'Versão acelerada da Ressurreição: de 1 minuto até 24h.' },
  { id: 'regeneracao', name: 'Regeneração', description: 'Regenera membros em descanso e remove bloqueios extremos de ressurgimento corporal.' },
  { id: 'reposicionar-ressurreicao', name: 'Reposicionar Ressurreição', description: 'Permite ressurgir em local onde esteve nas últimas 24h.' },
]

export type EcoarSingularitySeed = EcoarSingularity & { tier?: number }

export const ecoarSingularitiesSeed: EcoarSingularitySeed[] = [
  { id: 'ecoar-immortalis-i', ecoarId: 'immortalis', name: 'Ecoar: Immortalis I', description: 'Ranço Imortal I (-4 em habilidade primária), Ressurreição Imediata e Especialidade do Imortal (+1 em especialidade escolhida).', cost: 20, tier: 1, requirements: { previous: 'immortalis', nivelAlma: 3 } },
  { id: 'ecoar-immortalis-ii', ecoarId: 'immortalis', name: 'Ecoar: Immortalis II', description: 'Ranço Imortal II (-6), Regeneração e Prática do Imortal (bônus = Nível de Poder).', cost: 30, tier: 2, requirements: { previous: 'ecoar-immortalis-i', nivelAlma: 7 } },
  { id: 'ecoar-immortalis-iii', ecoarId: 'immortalis', name: 'Ecoar: Immortalis III', description: 'Ranço Imortal III (-8), Resistência do Immortalis e Maestria do Imortal (especialidades favoráveis).', cost: 40, tier: 3, requirements: { previous: 'ecoar-immortalis-ii', nivelAlma: 13 } },

  { id: 'ecoar-apodrecido-i', ecoarId: 'apodrecido', name: 'Ecoar: Apodrecido I', description: 'Consciência Definhada I, Regeneração do Apodrecido e Mente Apodrecida (+2 resistência mental).', cost: 20, tier: 1, requirements: { previous: 'apodrecido', nivelAlma: 3 } },
  { id: 'ecoar-apodrecido-ii', ecoarId: 'apodrecido', name: 'Ecoar: Apodrecido II', description: 'Consciência Definhada II, Resistência do Apodrecido e Morto Andando.', cost: 30, tier: 2, requirements: { previous: 'ecoar-apodrecido-i', nivelAlma: 7 } },
  { id: 'ecoar-apodrecido-iii', ecoarId: 'apodrecido', name: 'Ecoar: Apodrecido III', description: 'Consciência Definhada III, Ressurreição Imediata e Além da Vida.', cost: 40, tier: 3, requirements: { previous: 'ecoar-apodrecido-ii', nivelAlma: 13 } },

  { id: 'ecoar-elisiade-i', ecoarId: 'elisiade', name: 'Ecoar: Elísiade I', description: 'Verdade Etérea I (-4 mentiras), Ressurreição Imediata e Aura de Pureza.', cost: 20, tier: 1, requirements: { previous: 'elisiade', nivelAlma: 3 } },
  { id: 'ecoar-elisiade-ii', ecoarId: 'elisiade', name: 'Ecoar: Elísiade II', description: 'Verdade Etérea II (-6), Regeneração do Elísiade e Vislumbre do Éter.', cost: 30, tier: 2, requirements: { previous: 'ecoar-elisiade-i', nivelAlma: 7 } },
  { id: 'ecoar-elisiade-iii', ecoarId: 'elisiade', name: 'Ecoar: Elísiade III', description: 'Verdade Etérea III (-8), Resistência do Elísiade e Não Tema.', cost: 40, tier: 3, requirements: { previous: 'ecoar-elisiade-ii', nivelAlma: 13 } },

  { id: 'ecoar-fenix-i', ecoarId: 'fenix', name: 'Ecoar: Fênix I', description: 'Dependência da Chama I, Ressurreição Imediata e Cura da Fênix.', cost: 20, tier: 1, requirements: { previous: 'fenix', nivelAlma: 3 } },
  { id: 'ecoar-fenix-ii', ecoarId: 'fenix', name: 'Ecoar: Fênix II', description: 'Dependência da Chama II, Regeneração da Fênix e Renascido na Chama.', cost: 30, tier: 2, requirements: { previous: 'ecoar-fenix-i', nivelAlma: 7 } },
  { id: 'ecoar-fenix-iii', ecoarId: 'fenix', name: 'Ecoar: Fênix III', description: 'Dependência da Chama III, Resistência da Fênix e Aspecto da Fênix.', cost: 40, tier: 3, requirements: { previous: 'ecoar-fenix-ii', nivelAlma: 13 } },

  { id: 'ecoar-geist-i', ecoarId: 'geist', name: 'Ecoar: Geist I', description: 'Espírito Inflamável I, Reposicionar Ressurreição e Geist Incorpóreo.', cost: 20, tier: 1, requirements: { previous: 'geist', nivelAlma: 3 } },
  { id: 'ecoar-geist-ii', ecoarId: 'geist', name: 'Ecoar: Geist II', description: 'Espírito Inflamável II, Resistência do Geist e Possessão do Geist.', cost: 30, tier: 2, requirements: { previous: 'ecoar-geist-i', nivelAlma: 7 } },
  { id: 'ecoar-geist-iii', ecoarId: 'geist', name: 'Ecoar: Geist III', description: 'Espírito Inflamável III, Ressurreição Imediata e Marionete Cadavérica.', cost: 40, tier: 3, requirements: { previous: 'ecoar-geist-ii', nivelAlma: 13 } },

  { id: 'ecoar-lycantropo-i', ecoarId: 'lycantropo', name: 'Ecoar: Lycantropo I', description: 'Alergia a Prata I, Ressurreição Imediata e Garras do Lycantropo.', cost: 20, tier: 1, requirements: { previous: 'lycantropo', nivelAlma: 3 } },
  { id: 'ecoar-lycantropo-ii', ecoarId: 'lycantropo', name: 'Ecoar: Lycantropo II', description: 'Alergia a Prata II, Regeneração do Lycantropo e Resistência Quase-Monstruosa.', cost: 30, tier: 2, requirements: { previous: 'ecoar-lycantropo-i', nivelAlma: 7 } },
  { id: 'ecoar-lycantropo-iii', ecoarId: 'lycantropo', name: 'Ecoar: Lycantropo III', description: 'Alergia a Prata III, Resistência do Lycantropo e Força do Lycantropo fora da forma.', cost: 40, tier: 3, requirements: { previous: 'ecoar-lycantropo-ii', nivelAlma: 13 } },

  { id: 'ecoar-proelita-i', ecoarId: 'proelita', name: 'Ecoar: Proelita I', description: 'Fúria Descontrolada I, Regeneração do Proelita e Deleite na Violência.', cost: 20, tier: 1, requirements: { previous: 'proelita', nivelAlma: 3 } },
  { id: 'ecoar-proelita-ii', ecoarId: 'proelita', name: 'Ecoar: Proelita II', description: 'Fúria Descontrolada II, Resistência do Proelita e O Sangue Mais Vermelho.', cost: 30, tier: 2, requirements: { previous: 'ecoar-proelita-i', nivelAlma: 7 } },
  { id: 'ecoar-proelita-iii', ecoarId: 'proelita', name: 'Ecoar: Proelita III', description: 'Fúria Descontrolada III, Ressurreição Imediata e Força Imparável.', cost: 40, tier: 3, requirements: { previous: 'ecoar-proelita-ii', nivelAlma: 13 } },

  { id: 'ecoar-revenant-i', ecoarId: 'revenant', name: 'Ecoar: Revenant I', description: 'Flashbacks Abissais I, Ressurreição Imediata e Aura de Apatia.', cost: 20, tier: 1, requirements: { previous: 'revenant', nivelAlma: 3 } },
  { id: 'ecoar-revenant-ii', ecoarId: 'revenant', name: 'Ecoar: Revenant II', description: 'Flashbacks Abissais II, Regeneração do Revenant e Forma de Revenant.', cost: 30, tier: 2, requirements: { previous: 'ecoar-revenant-i', nivelAlma: 7 } },
  { id: 'ecoar-revenant-iii', ecoarId: 'revenant', name: 'Ecoar: Revenant III', description: 'Flashbacks Abissais III, Resistência do Revenant e Forma Abissal.', cost: 40, tier: 3, requirements: { previous: 'ecoar-revenant-ii', nivelAlma: 13 } },

  { id: 'ecoar-triade-i', ecoarId: 'triade', name: 'Ecoar: Tríade I', description: 'Fragmentação de Humor I (tabela 1d10), Ressurreição Imediata e Desfragmentação.', cost: 20, tier: 1, requirements: { previous: 'triade', nivelAlma: 3 } },
  { id: 'ecoar-triade-ii', ecoarId: 'triade', name: 'Ecoar: Tríade II', description: 'Fragmentação de Humor II (tabela 1d8), Regeneração do Tríade e Pertences Fragmentados.', cost: 30, tier: 2, requirements: { previous: 'ecoar-triade-i', nivelAlma: 7 } },
  { id: 'ecoar-triade-iii', ecoarId: 'triade', name: 'Ecoar: Tríade III', description: 'Fragmentação de Humor III (tabela 1d6), Resistência do Tríade e Projeção do Tríade.', cost: 40, tier: 3, requirements: { previous: 'ecoar-triade-ii', nivelAlma: 13 } },

  { id: 'sede-carmesim', ecoarId: 'vampiro', name: 'Sede Carmesim', description: 'Imunidade à Praga, necessidade de beber sangue, transmissão pelo sangue e transformação obrigatória em Vampiro após morte.', cost: 0 },
  { id: 'vampiro-crueldade', ecoarId: 'vampiro', name: 'Vampiro: Crueldade', description: 'Punição da Crueldade e Bênção da Crueldade (+Nível de Poder em ataque).', cost: 5, requirements: { previous: 'vampiro', nivelAlma: 3 } },
  { id: 'vampiro-ganancia', ecoarId: 'vampiro', name: 'Vampiro: Ganância', description: 'Punição da Ganância e Bênção da Ganância (Atenção e visão no escuro).', cost: 5, requirements: { previous: 'vampiro', nivelAlma: 3 } },
  { id: 'vampiro-luxuria', ecoarId: 'vampiro', name: 'Vampiro: Luxúria', description: 'Punição da Luxúria e Bênção da Luxúria (sedução para beber sangue).', cost: 5, requirements: { previous: 'vampiro', nivelAlma: 3 } },
  { id: 'vampiro-orgulho', ecoarId: 'vampiro', name: 'Vampiro: Orgulho', description: 'Punição do Orgulho e Bênção do Orgulho (refazer teste falho).', cost: 5, requirements: { previous: 'vampiro', nivelAlma: 3 } },
  { id: 'vampiro-furia', ecoarId: 'vampiro', name: 'Vampiro: Fúria', description: 'Punição da Fúria e Bênção da Fúria (+Nível de Poder em dano).', cost: 5, requirements: { previous: 'vampiro', nivelAlma: 3 } },
  { id: 'vampiro-obsessao', ecoarId: 'vampiro', name: 'Vampiro: Obsessão', description: 'Punição da Obsessão e Bênção da Obsessão (marcação de alvo pelo sangue).', cost: 5, requirements: { previous: 'vampiro', nivelAlma: 3 } },
  { id: 'vampiro-sabotagem', ecoarId: 'vampiro', name: 'Vampiro: Sabotagem', description: 'Punição da Sabotagem e Bênção da Sabotagem (+Nível de Poder em Furtividade).', cost: 5, requirements: { previous: 'vampiro', nivelAlma: 3 } },
  { id: 'ecoar-vampiro-i', ecoarId: 'vampiro', name: 'Ecoar: Vampiro I', description: 'Regeneração do Vampiro.', cost: 20, tier: 1, requirements: { previous: 'vampiro', nivelAlma: 3 } },
  { id: 'ecoar-vampiro-ii', ecoarId: 'vampiro', name: 'Ecoar: Vampiro II', description: 'Resistência do Vampiro (exceto prata).', cost: 20, tier: 2, requirements: { previous: 'ecoar-vampiro-i', nivelAlma: 7 } },
  { id: 'ecoar-vampiro-iii', ecoarId: 'vampiro', name: 'Ecoar: Vampiro III', description: 'Ressurreição do Vampiro (Ressurreição Imediata).', cost: 20, tier: 3, requirements: { previous: 'ecoar-vampiro-ii', nivelAlma: 13 } },

  { id: 'orfao-inveja-do-orfao', ecoarId: 'vampiro', name: 'Inveja do Órfão', description: 'Permite ao órfão obter poderes de família por sangue, com limitações por descanso e pecados.', cost: 0, requirements: { previous: 'vampiro' } },
  { id: 'ravenborne-realeza-magenta', ecoarId: 'vampiro', name: 'Realeza Magenta', description: 'Família Ravenborne: fama vampírica e efeito de medo/respeito.', cost: 0, requirements: { previous: 'vampiro' } },
  { id: 'ravenborne-luxuria-i', ecoarId: 'vampiro', name: 'Ravenborne: Luxúria I', description: 'Bênção social ampliada contra não-Ravenborne e bônus contra alvo que teve sangue bebido.', cost: 30, requirements: { previous: 'vampiro-luxuria', nivelAlma: 7 } },
  { id: 'ravenborne-luxuria-ii', ecoarId: 'vampiro', name: 'Ravenborne: Luxúria II', description: 'Com Sede > 0, testes sociais contra alvo de Luxúria I usam resultado máximo (exceto Empatia).', cost: 40, requirements: { previous: 'ravenborne-luxuria-i', nivelAlma: 13 } },
  { id: 'ravenborne-orgulho-i', ecoarId: 'vampiro', name: 'Ravenborne: Orgulho I', description: 'Com Sede > 0, alvo que vence teste resistido deve repetir e manter pior resultado.', cost: 30, requirements: { previous: 'vampiro-orgulho', nivelAlma: 7 } },
  { id: 'ravenborne-orgulho-ii', ecoarId: 'vampiro', name: 'Ravenborne: Orgulho II', description: 'Com Sede > 0, após falha de alvo em teste resistido, seu próximo teste contra ele usa resultado máximo.', cost: 40, requirements: { previous: 'ravenborne-orgulho-i', nivelAlma: 13 } },
  { id: 'ravenborne-obsessao-i', ecoarId: 'vampiro', name: 'Ravenborne: Obsessão I', description: 'Com Sede > 0, alvo marcado por Obsessão faz esquiva desfavorável contra você.', cost: 30, requirements: { previous: 'vampiro-obsessao', nivelAlma: 7 } },
  { id: 'ravenborne-obsessao-ii', ecoarId: 'vampiro', name: 'Ravenborne: Obsessão II', description: 'Com Sede > 0 e alvo marcado presente na cena, iniciativa usa resultado máximo.', cost: 40, requirements: { previous: 'ravenborne-obsessao-i', nivelAlma: 13 } },

  { id: 'abyssaux-sangue-do-abismo', ecoarId: 'vampiro', name: 'Sangue do Abismo', description: 'Família Abyssaux: sangue negro identificável e beber sangue de Praga/mortos-vivos.', cost: 0, requirements: { previous: 'vampiro' } },
  { id: 'abyssaux-crueldade-i', ecoarId: 'vampiro', name: 'Abyssaux: Crueldade I', description: 'Ao expurgar por drenagem, recupera Sede conforme Nível de Poder do alvo.', cost: 30, requirements: { previous: 'vampiro-crueldade', nivelAlma: 7 } },
  { id: 'abyssaux-crueldade-ii', ecoarId: 'vampiro', name: 'Abyssaux: Crueldade II', description: 'Após expurgo por sangue, próximos testes ganham consistência máxima por curta duração.', cost: 40, requirements: { previous: 'abyssaux-crueldade-i', nivelAlma: 13 } },
  { id: 'abyssaux-sabotagem-i', ecoarId: 'vampiro', name: 'Abyssaux: Sabotagem I', description: 'Se bebeu sangue da Praga recentemente, criaturas da Praga não ficam hostis de imediato.', cost: 30, requirements: { previous: 'vampiro-sabotagem', nivelAlma: 7 } },
  { id: 'abyssaux-sabotagem-ii', ecoarId: 'vampiro', name: 'Abyssaux: Sabotagem II', description: 'Pode gastar Sede para estado morto-vivo temporário e bônus de resistência física.', cost: 40, requirements: { previous: 'abyssaux-sabotagem-i', nivelAlma: 13 } },
  { id: 'abyssaux-obsessao-i', ecoarId: 'vampiro', name: 'Abyssaux: Obsessão I', description: 'Ícor mágico pode comandar alvo que bebe seu sangue, com resistência em comandos críticos.', cost: 30, requirements: { previous: 'vampiro-obsessao', nivelAlma: 7 } },
  { id: 'abyssaux-obsessao-ii', ecoarId: 'vampiro', name: 'Abyssaux: Obsessão II', description: 'Amplia número de alvos de comando e eleva dificuldade para resistir.', cost: 40, requirements: { previous: 'abyssaux-obsessao-i', nivelAlma: 13 } },

  { id: 'kriegshetzer-fomentadores-da-guerra', ecoarId: 'vampiro', name: 'Os Fomentadores da Guerra', description: 'Família Kriegshetzer: sangue corrosivo volátil e ocultação entre mortais enquanto Sede não é 0.', cost: 0, requirements: { previous: 'vampiro' } },
  { id: 'kriegshetzer-crueldade-i', ecoarId: 'vampiro', name: 'Kriegshetzer: Crueldade I', description: 'Banha armas e munições com sangue corrosivo, ganhando penetração e dano corrosivo extra ao sacrificar Sede.', cost: 30, requirements: { previous: 'vampiro-crueldade', nivelAlma: 7 } },
  { id: 'kriegshetzer-crueldade-ii', ecoarId: 'vampiro', name: 'Kriegshetzer: Crueldade II', description: 'Após causar dano corrosivo, ataques contra o alvo ficam favoráveis por uma rodada.', cost: 40, requirements: { previous: 'kriegshetzer-crueldade-i', nivelAlma: 13 } },
  { id: 'kriegshetzer-furia-i', ecoarId: 'vampiro', name: 'Kriegshetzer: Fúria I', description: 'Ao sofrer dano ardente, pode sacrificar Sede para ignorar fraquezas vampíricas.', cost: 30, requirements: { previous: 'vampiro-furia', nivelAlma: 7 } },
  { id: 'kriegshetzer-furia-ii', ecoarId: 'vampiro', name: 'Kriegshetzer: Fúria II', description: 'Contra dano cortante/perfurante/balístico, permite ataque de oportunidade com dano corrosivo e penetração.', cost: 40, requirements: { previous: 'kriegshetzer-furia-i', nivelAlma: 13 } },
  { id: 'kriegshetzer-sabotagem-i', ecoarId: 'vampiro', name: 'Kriegshetzer: Sabotagem I', description: 'Enquanto Sede não é 0, testes de Enganação são favoráveis.', cost: 30, requirements: { previous: 'vampiro-sabotagem', nivelAlma: 7 } },
  { id: 'kriegshetzer-sabotagem-ii', ecoarId: 'vampiro', name: 'Kriegshetzer: Sabotagem II', description: 'Expande bônus sociais para Conversação e estende bônus de Sabotagem I a aliados na cena.', cost: 40, requirements: { previous: 'kriegshetzer-sabotagem-i', nivelAlma: 13 } },

  { id: 'rocha-seja-como-a-rocha', ecoarId: 'vampiro', name: 'Seja Como a Rocha', description: 'Família Rocha: rigidez cadavérica (-2 esquiva) e pele de pedra (+2 resistência física).', cost: 0, requirements: { previous: 'vampiro' } },
  { id: 'rocha-ganancia-i', ecoarId: 'vampiro', name: 'Rocha: Ganância I', description: 'Todos os testes da primeira rodada de combate são favoráveis.', cost: 30, requirements: { previous: 'vampiro-ganancia', nivelAlma: 7 } },
  { id: 'rocha-ganancia-ii', ecoarId: 'vampiro', name: 'Rocha: Ganância II', description: 'Primeiro teste do combate recebe consistência máxima, com gatilho adicional por rodada sem sucesso anterior.', cost: 40, requirements: { previous: 'rocha-ganancia-i', nivelAlma: 13 } },
  { id: 'rocha-orgulho-i', ecoarId: 'vampiro', name: 'Rocha: Orgulho I', description: 'Reação especial em testes resistidos quando o oponente vence na rolagem de dado (texto-base preservado do material).', cost: 30, requirements: { previous: 'vampiro-orgulho', nivelAlma: 7 } },
  { id: 'rocha-orgulho-ii', ecoarId: 'vampiro', name: 'Rocha: Orgulho II', description: 'Em teste resistido, pode sacrificar Sede para tornar seu teste favorável.', cost: 40, requirements: { previous: 'rocha-orgulho-i', nivelAlma: 13 } },
  { id: 'rocha-furia-i', ecoarId: 'vampiro', name: 'Rocha: Fúria I', description: 'Com ação menor e sacrifício de Sede, ganha bônus em resistência física igual ao Nível de Poder.', cost: 30, requirements: { previous: 'vampiro-furia', nivelAlma: 7 } },
  { id: 'rocha-furia-ii', ecoarId: 'vampiro', name: 'Rocha: Fúria II', description: 'Ao sofrer ataque físico, pode sacrificar Sede para esquiva favorável com consistência aprimorada.', cost: 40, requirements: { previous: 'rocha-furia-i', nivelAlma: 13 } },

  { id: 'estrella-brilho-da-estrela', ecoarId: 'vampiro', name: 'Brilho da Estrela', description: 'Família Estrella: Sede mais intensa e mitigação pontual de penalidades solares ao custo de Sede.', cost: 0, requirements: { previous: 'vampiro' } },
  { id: 'estrella-ganancia-i', ecoarId: 'vampiro', name: 'Estrella: Ganância I', description: 'Concede visão no escuro e bônus de Atenção a você e alvo tocado até o amanhecer.', cost: 30, requirements: { previous: 'vampiro-ganancia', nivelAlma: 7 } },
  { id: 'estrella-ganancia-ii', ecoarId: 'vampiro', name: 'Estrella: Ganância II', description: 'Aumenta modificador de Percepção seu e de alvos sob efeito de Ganância I.', cost: 40, requirements: { previous: 'estrella-ganancia-i', nivelAlma: 13 } },
  { id: 'estrella-luxuria-i', ecoarId: 'vampiro', name: 'Estrella: Luxúria I', description: 'Permite usar Luxúria em combate com penalidade ao alvo e cura adicional de Sede ao beber sangue.', cost: 30, requirements: { previous: 'vampiro-luxuria', nivelAlma: 7 } },
  { id: 'estrella-luxuria-ii', ecoarId: 'vampiro', name: 'Estrella: Luxúria II', description: 'Ao beber de alvo afetado por Luxúria, converte saciedade de Sede em cura de Fôlego e Mana.', cost: 40, requirements: { previous: 'estrella-luxuria-i', nivelAlma: 13 } },
  { id: 'estrella-sabotagem-i', ecoarId: 'vampiro', name: 'Estrella: Sabotagem I', description: 'Sob sol, remove desvantagens vampíricas sem remover vantagens.', cost: 30, requirements: { previous: 'vampiro-sabotagem', nivelAlma: 7 } },
  { id: 'estrella-sabotagem-ii', ecoarId: 'vampiro', name: 'Estrella: Sabotagem II', description: 'Sob sol, suprime traços de identificação vampírica e pode tornar Furtividade favorável com custo de Sede.', cost: 40, requirements: { previous: 'estrella-sabotagem-i', nivelAlma: 13 } },

  { id: 'stigia-rio-das-almas', ecoarId: 'vampiro', name: 'Rio das Almas', description: 'Família Stigia: aversão ao sol e oscilação entre físico e semi-incorpóreo em resistências.', cost: 0, requirements: { previous: 'vampiro' } },
  { id: 'stigia-crueldade-i', ecoarId: 'vampiro', name: 'Stigia: Crueldade I', description: 'Com ação menor e custo de Sede, converte dano físico do ataque em dano mágico.', cost: 30, requirements: { previous: 'vampiro-crueldade', nivelAlma: 7 } },
  { id: 'stigia-crueldade-ii', ecoarId: 'vampiro', name: 'Stigia: Crueldade II', description: 'Marca alvo ao causar dano mágico; se morrer até o amanhecer, é expurgado por você.', cost: 40, requirements: { previous: 'stigia-crueldade-i', nivelAlma: 13 } },
  { id: 'stigia-ganancia-i', ecoarId: 'vampiro', name: 'Stigia: Ganância I', description: 'Durante combate, falha de esquiva inimiga permite ataque de oportunidade (1 vez por rodada).', cost: 30, requirements: { previous: 'vampiro-ganancia', nivelAlma: 7 } },
  { id: 'stigia-ganancia-ii', ecoarId: 'vampiro', name: 'Stigia: Ganância II', description: 'Com reação e custo de Sede, cria turno especial extra na rodada com economia de ações ampliada.', cost: 40, requirements: { previous: 'stigia-ganancia-i', nivelAlma: 13 } },
  { id: 'stigia-orgulho-i', ecoarId: 'vampiro', name: 'Stigia: Orgulho I', description: 'Incrementa Corpo e amplia resistência localizada sem armadura/capacete ou com armadura leve.', cost: 30, requirements: { previous: 'vampiro-orgulho', nivelAlma: 7 } },
  { id: 'stigia-orgulho-ii', ecoarId: 'vampiro', name: 'Stigia: Orgulho II', description: 'Com ação longa e Sede, transita para forma espectral, substituindo Corpo/Fôlego por Espírito.', cost: 40, requirements: { previous: 'stigia-orgulho-i', nivelAlma: 13 } },

  { id: 'grekhonov-sorte-de-grekhonov', ecoarId: 'vampiro', name: 'A Sorte de Grekhonov', description: 'Família Grekhonov: erros críticos automáticos no mínimo do dado e reserva de dados extras para testes.', cost: 0, requirements: { previous: 'vampiro' } },
  { id: 'grekhonov-luxuria-i', ecoarId: 'vampiro', name: 'Grekhonov: Luxúria I', description: 'Beber sangue por Luxúria recupera recursos da mecânica Fortuna Favorece os Bravos.', cost: 30, requirements: { previous: 'vampiro-luxuria', nivelAlma: 7 } },
  { id: 'grekhonov-luxuria-ii', ecoarId: 'vampiro', name: 'Grekhonov: Luxúria II', description: 'Recursos de Luxúria I escalam para d12, com limite próprio e uso como substituição dos d10.', cost: 40, requirements: { previous: 'grekhonov-luxuria-i', nivelAlma: 13 } },
  { id: 'grekhonov-furia-i', ecoarId: 'vampiro', name: 'Grekhonov: Fúria I', description: 'Ao acertar ataque físico, pode adicionar 1d10 ao dano sem limitação por dano máximo.', cost: 30, requirements: { previous: 'vampiro-furia', nivelAlma: 7 } },
  { id: 'grekhonov-furia-ii', ecoarId: 'vampiro', name: 'Grekhonov: Fúria II', description: 'Se causar e receber dano físico relevante na rodada, recupera recurso adicional de fortuna.', cost: 40, requirements: { previous: 'grekhonov-furia-i', nivelAlma: 13 } },
  { id: 'grekhonov-obsessao-i', ecoarId: 'vampiro', name: 'Grekhonov: Obsessão I', description: 'Pode gastar dados de fortuna como penalidade em testes resistidos por você.', cost: 30, requirements: { previous: 'vampiro-obsessao', nivelAlma: 7 } },
  { id: 'grekhonov-obsessao-ii', ecoarId: 'vampiro', name: 'Grekhonov: Obsessão II', description: 'Ao falhar contra alvo da obsessão, pode gastar ação menor + Sede para adicionar 1d20 ao teste.', cost: 40, requirements: { previous: 'grekhonov-obsessao-i', nivelAlma: 13 } },

  { id: 'vampiro-placeholder-em-jogo', ecoarId: 'vampiro', name: 'Vampiros em jogo (placeholder)', description: 'PLACEHOLDER: conteúdo pendente no material de origem.', cost: 0 },
  { id: 'vampiro-placeholder-ecoar', ecoarId: 'vampiro', name: 'O Ecoar de um Vampiro (placeholder)', description: 'PLACEHOLDER: conteúdo pendente no material de origem.', cost: 0 },
]

export type EcoarCatalogPayload = {
  ecoarTypes: Ecoar[]
  ecoarSingularities: EcoarSingularity[]
}
