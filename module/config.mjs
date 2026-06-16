/**
 * Configuração estática do sistema Toon, exposta em CONFIG.TOON.
 * Labels guardam chaves de i18n (localizadas na hora de renderizar).
 */
const TOON = {};

/** Os quatro atributos (valores 1-6). */
TOON.attributes = {
  muque: { label: "TOON.Attributes.Muque" },
  zip: { label: "TOON.Attributes.Zip" },
  astucia: { label: "TOON.Attributes.Astucia" },
  caradura: { label: "TOON.Attributes.Caradura" }
};

/** Limites de regra. */
TOON.limits = {
  attribute: { min: 1, max: 6 },
  skillNh: { min: 1, max: 9 },
  prodigyNh: { min: 1, max: 9 },
  startingSkillPoints: 30,
  startingAttributePoints: 14,
  maxProdigies: 2,
  prodigyStartNh: 5
};

/**
 * As 23 perícias canônicas, agrupadas pelo atributo que as governa.
 * Usadas para semear a ficha de um novo personagem.
 */
TOON.skills = [
  // Muque
  { name: "Derrubar Portas", attribute: "muque" },
  { name: "Escalada", attribute: "muque" },
  { name: "Luta", attribute: "muque" },
  { name: "Erguer Coisas Pesadas", attribute: "muque" },
  { name: "Arremesso", attribute: "muque" },
  // Zip
  { name: "Esquiva", attribute: "zip" },
  { name: "Condução", attribute: "zip" },
  { name: "Disparar Arma", attribute: "zip" },
  { name: "Salto", attribute: "zip" },
  { name: "Cavalgar", attribute: "zip" },
  { name: "Corrida", attribute: "zip" },
  { name: "Natação", attribute: "zip" },
  // Astúcia
  { name: "Esconder/Achar Escondido", attribute: "astucia" },
  { name: "Identificar Coisas Perigosas", attribute: "astucia" },
  { name: "Leitura", attribute: "astucia" },
  { name: "Resistir à Lábia", attribute: "astucia" },
  { name: "Visão/Audição/Olfato", attribute: "astucia" },
  { name: "Armar/Desarmar Armadilhas", attribute: "astucia" },
  { name: "Seguir/Cobrir Pistas", attribute: "astucia" },
  // Caradura
  { name: "Lábia", attribute: "caradura" },
  { name: "Passar/Detectar Coisas de Má Qualidade", attribute: "caradura" },
  { name: "Prestidigitação", attribute: "caradura" },
  { name: "Esgueirar", attribute: "caradura" }
];

/**
 * Prodígios e seus custos iniciais em Pontos de Perícia.
 * O 2º prodígio custa +5; tornar utilizável em outros custa +2.
 */
TOON.prodigies = [
  { name: "Detectar Objetos", cost: 2 },
  { name: "Esticar", cost: 3 },
  { name: "Mudança Rápida/Disfarce", cost: 3 },
  { name: "Animal de Estimação ou Fiel Companheiro", cost: 3 },
  { name: "Sorte Incrível", cost: 3 },
  { name: "Escudo de 1001 Utilidades", cost: 4 },
  { name: "Voar", cost: 4 },
  { name: "Força Incrível", cost: 5 },
  { name: "Hipnotismo", cost: 5 },
  { name: "Invisibilidade", cost: 5 },
  { name: "Mudar de Forma", cost: 5 },
  { name: "Saco de Surpresas", cost: 5 },
  { name: "Teleporte", cost: 6 },
  { name: "Velocidade Incrível", cost: 6 },
  { name: "Transferência Cósmica", cost: 10 }
];

export default TOON;
