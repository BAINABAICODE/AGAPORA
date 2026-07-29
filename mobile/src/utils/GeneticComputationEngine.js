// frontend/src/utils/GeneticComputationEngine.js
// ============================================================
// PURPOSE: Full frontend genetic computation with grandparent data support
// ============================================================

// -------------------------------------------------------------
// SECTION B — HELPER: inheritance type lookup
// -------------------------------------------------------------
/**
 * Determines the inheritance type of a mutation using the reference data
 * provided by the backend (VisualMutation records).
 *
 * @param {string} mutationName
 * @param {Array}  referenceData - array of objects with { name, inheritance }
 * @returns {string} 'sex_linked_recessive', 'autosomal_dominant', or 'autosomal_recessive'
 */
function getMutationInheritanceType(mutationName, referenceData) {
  if (!referenceData || !Array.isArray(referenceData)) referenceData = [];
  if (!mutationName) return 'autosomal_recessive';

  // 1. Look for exact match in the backend reference data
  const found = referenceData.find(
    ref => (ref.name || '').toLowerCase() === mutationName.toLowerCase()
  );
  if (found) {
    const inh = (found.inheritance || '').toLowerCase();
    if (inh.includes('sex') || inh.includes('linked')) return 'sex_linked_recessive';
    if (inh.includes('dominant')) return 'autosomal_dominant';
    return 'autosomal_recessive';
  }

  // 2. Fallback to a safe default (autosomal recessive)
  return 'autosomal_recessive';
}

// -------------------------------------------------------------
// SECTION C — ENCODING (parent → genetic alleles) with grandparent support
// -------------------------------------------------------------
function encodeBaseColor(colorName, splitGenes) {
  splitGenes = splitGenes || [];
  const c = (colorName || '').toLowerCase().trim();

  const isBlue = (
    c === 'blue' || c === 'cobalt' || c === 'mauve' || c === 'slate' ||
    c === 'white' || c === 'aqua' || c.indexOf('blue') !== -1 ||
    c.indexOf('cobalt') !== -1 || c.indexOf('mauve') !== -1
  );

  const splitToBlue = splitGenes.some(g => {
    const sg = (g || '').toLowerCase();
    return sg.indexOf('blue') !== -1 || sg.indexOf('cobalt') !== -1 || sg.indexOf('turquoise') !== -1;
  });

  let blueAlleles;
  if (isBlue)           blueAlleles = ['b', 'b'];
  else if (splitToBlue) blueAlleles = ['B', 'b'];
  else                  blueAlleles = ['B', 'B'];

  let darkFactor = 0;
  if (c === 'dark green' || c === 'cobalt' || c.indexOf('dark green') !== -1 || c.indexOf('cobalt') !== -1)
    darkFactor = 1;
  else if (c === 'olive' || c === 'mauve' || c.indexOf('olive') !== -1 || c.indexOf('mauve') !== -1)
    darkFactor = 2;

  const dfAlleles = darkFactor === 0 ? [0, 0] : darkFactor === 1 ? [1, 0] : [1, 1];
  return { blueAlleles, dfAlleles, isBlue, darkFactor };
}

/**
 * Merge grandparent genetic data into parent encoding
 * This allows the algorithm to infer missing genetic information
 * from grandparents when parents have incomplete data
 */
function mergeGrandparentData(parentEncoded, grandparentData, isMale) {
  if (!grandparentData) return parentEncoded;
  
  const paternal = grandparentData.paternal || {};
  const maternal = grandparentData.maternal || {};
  
  // Helper to infer if a gene is likely present based on grandparents
  const inferFromGrandparents = (trait, getter) => {
    const paternalGrandfather = getter(paternal.grandfather);
    const paternalGrandmother = getter(paternal.grandmother);
    const maternalGrandfather = getter(maternal.grandfather);
    const maternalGrandmother = getter(maternal.grandmother);
    
    // If any grandparent has the trait, it increases likelihood
    return !!(paternalGrandfather || paternalGrandmother || 
               maternalGrandfather || maternalGrandmother);
  };
  
  // Infer base color alleles from grandparents if parent is unknown
  if (!parentEncoded.raw.base_color || parentEncoded.raw.base_color === '') {
    const hasBlueGrandparent = inferFromGrandparents('base_color', (gp) => {
      if (!gp) return false;
      const color = (gp.base_color || '').toLowerCase();
      return color.includes('blue') || color.includes('cobalt') || 
             color.includes('mauve') || color.includes('slate');
    });
    
    if (hasBlueGrandparent) {
      parentEncoded.blueAlleles = ['B', 'b'];
      parentEncoded.isBlue = false;
    }
  }
  
  // Merge visual mutations from grandparents
  const existingVisual = new Set(parentEncoded.raw.visual_mutations || []);
  const inferVisual = (gp) => {
    if (!gp || !gp.visual_mutations) return [];
    return gp.visual_mutations;
  };
  
  const paternalVisual = [...inferVisual(paternal.grandfather), ...inferVisual(paternal.grandmother)];
  const maternalVisual = [...inferVisual(maternal.grandfather), ...inferVisual(maternal.grandmother)];
  
  // If parent has no visual mutations but grandparents do, add as split/carrier
  if (existingVisual.size === 0 && (paternalVisual.length > 0 || maternalVisual.length > 0)) {
    const allGrandparentVisuals = [...new Set([...paternalVisual, ...maternalVisual])];
    parentEncoded.raw.split_genes = [...new Set([...(parentEncoded.raw.split_genes || []), ...allGrandparentVisuals])];
  }
  
  // Merge split genes from grandparents
  const inferSplit = (gp) => {
    if (!gp || !gp.split_genes) return [];
    return gp.split_genes;
  };
  
  const paternalSplit = [...inferSplit(paternal.grandfather), ...inferSplit(paternal.grandmother)];
  const maternalSplit = [...inferSplit(maternal.grandfather), ...inferSplit(maternal.grandmother)];
  const allGrandparentSplits = [...new Set([...paternalSplit, ...maternalSplit])];
  
  if (allGrandparentSplits.length > 0) {
    parentEncoded.raw.split_genes = [...new Set([...(parentEncoded.raw.split_genes || []), ...allGrandparentSplits])];
  }
  
  return parentEncoded;
}

function encodeParent(parent, referenceData, grandparentData = null) {
  const sex = parent.sex || 'Male';
  const isMale = sex === 'Male';
  const sexChromosomes = isMale ? ['Z', 'Z'] : ['Z', 'W'];

  const colorEncoding = encodeBaseColor(parent.base_color, parent.split_genes || []);
  const blueAlleles = colorEncoding.blueAlleles;
  const dfAlleles   = colorEncoding.dfAlleles;

  const arLoci = {};   // autosomal recessive
  const adLoci = {};   // autosomal dominant
  const slLoci = {};   // sex‑linked recessive

  // Visual mutations
  (parent.visual_mutations || []).forEach(mut => {
    const itype = getMutationInheritanceType(mut, referenceData);
    if (itype === 'sex_linked_recessive') {
      slLoci[mut] = isMale ? ['m', 'm'] : ['m', 'W'];
    } else if (itype === 'autosomal_dominant') {
      adLoci[mut] = ['D', 'n'];
    } else {
      arLoci[mut] = ['m', 'm'];
    }
  });

  // Split genes (carriers)
  (parent.split_genes || []).forEach(gene => {
    const itype = getMutationInheritanceType(gene, referenceData);
    if (itype === 'sex_linked_recessive' && isMale && !slLoci[gene]) {
      slLoci[gene] = ['m', 'N'];
    } else if (itype === 'autosomal_recessive' && !arLoci[gene]) {
      arLoci[gene] = ['N', 'm'];
    }
  });

  const encoded = {
    sex, isMale, sexChromosomes,
    blueAlleles, dfAlleles,
    arLoci, adLoci, slLoci,
    raw: parent,
  };
  
  // Merge grandparent data if provided
  if (grandparentData) {
    return mergeGrandparentData(encoded, grandparentData, isMale);
  }
  
  return encoded;
}

// -------------------------------------------------------------
// SECTION D — PUNNETT CROSSING
// -------------------------------------------------------------
function crossAlleles(alleles1, alleles2) {
  const results = [];
  for (let i = 0; i < alleles1.length; i++) {
    for (let j = 0; j < alleles2.length; j++) {
      results.push([alleles1[i], alleles2[j]]);
    }
  }
  return results;
}

function resolveBaseColor(blueAlleles, dfAlleles) {
  const isBlue = (blueAlleles[0] === 'b' && blueAlleles[1] === 'b');
  const df = (dfAlleles[0] === 1 ? 1 : 0) + (dfAlleles[1] === 1 ? 1 : 0);
  if (!isBlue) {
    if (df === 0) return 'Green';
    if (df === 1) return 'Dark Green';
    return 'Olive';
  } else {
    if (df === 0) return 'Blue';
    if (df === 1) return 'Cobalt';
    return 'Mauve';
  }
}

function expressesAR(alleles)            { return alleles[0] === 'm' && alleles[1] === 'm'; }
function isCarrierAR(alleles)            { return (alleles[0] === 'N' && alleles[1] === 'm') || (alleles[0] === 'm' && alleles[1] === 'N'); }
function expressesAD(alleles)            { return alleles[0] === 'D' || alleles[1] === 'D'; }
function expressesSL(alleles, isMale)    { return isMale ? (alleles[0] === 'm' && alleles[1] === 'm') : (alleles[0] === 'm' && alleles[1] === 'W'); }
function isCarrierSL(alleles, isMale)    { return isMale && ((alleles[0] === 'm' && alleles[1] === 'N') || (alleles[0] === 'N' && alleles[1] === 'm')); }

function buildPunnettData(p1, p2) {
  const malePar = p1.isMale ? p1 : p2;
  const femPar  = p1.isMale ? p2 : p1;

  const blueOutcomes = crossAlleles(p1.blueAlleles, p2.blueAlleles);
  const dfOutcomes   = crossAlleles(p1.dfAlleles,   p2.dfAlleles);

  const allMutationNames = new Set([
    ...Object.keys(p1.arLoci), ...Object.keys(p2.arLoci),
    ...Object.keys(p1.adLoci), ...Object.keys(p2.adLoci),
    ...Object.keys(p1.slLoci), ...Object.keys(p2.slLoci),
  ]);

  const mutationCrossings = {};
  for (const mutName of allMutationNames) {
    let itype;
    if (p1.slLoci[mutName] || p2.slLoci[mutName]) itype = 'sex_linked_recessive';
    else if (p1.adLoci[mutName] || p2.adLoci[mutName]) itype = 'autosomal_dominant';
    else itype = 'autosomal_recessive';

    if (itype === 'sex_linked_recessive') {
      const dadZAlleles = malePar.slLoci[mutName] || ['N', 'N'];
      const momZAllele  = (femPar.slLoci[mutName]  || ['N', 'W'])[0];
      mutationCrossings[mutName] = {
        type: 'sex_linked_recessive',
        dadZAlleles, momZAllele,
      };
    } else if (itype === 'autosomal_dominant') {
      const p1a = p1.adLoci[mutName] || ['n', 'n'];
      const p2a = p2.adLoci[mutName] || ['n', 'n'];
      mutationCrossings[mutName] = { type: 'autosomal_dominant', outcomes: crossAlleles(p1a, p2a) };
    } else {
      const p1b = p1.arLoci[mutName] || ['N', 'N'];
      const p2b = p2.arLoci[mutName] || ['N', 'N'];
      mutationCrossings[mutName] = { type: 'autosomal_recessive', outcomes: crossAlleles(p1b, p2b) };
    }
  }

  return { blueOutcomes, dfOutcomes, mutationCrossings, allMutationNames: Array.from(allMutationNames) };
}

function sampleOneOffspring(punnettData) {
  const sex = Math.random() < 0.5 ? 'Male' : 'Female';
  const isMale = sex === 'Male';

  const blueAlleles = punnettData.blueOutcomes[Math.floor(Math.random() * punnettData.blueOutcomes.length)];
  const dfAlleles   = punnettData.dfOutcomes[Math.floor(Math.random() * punnettData.dfOutcomes.length)];
  const base_color  = resolveBaseColor(blueAlleles, dfAlleles);

  const visual_mutations = [];
  const split_genes = [];

  for (const mutName of punnettData.allMutationNames) {
    const mc = punnettData.mutationCrossings[mutName];
    if (mc.type === 'sex_linked_recessive') {
      const dadContrib = mc.dadZAlleles[Math.floor(Math.random() * mc.dadZAlleles.length)];
      const childAlls = isMale ? [dadContrib, mc.momZAllele] : [dadContrib, 'W'];
      if (expressesSL(childAlls, isMale)) visual_mutations.push(mutName);
      else if (isCarrierSL(childAlls, isMale)) split_genes.push(mutName);
    } else if (mc.type === 'autosomal_dominant') {
      const adAlls = mc.outcomes[Math.floor(Math.random() * mc.outcomes.length)];
      if (expressesAD(adAlls)) visual_mutations.push(mutName);
    } else {
      const arAlls = mc.outcomes[Math.floor(Math.random() * mc.outcomes.length)];
      if (expressesAR(arAlls)) visual_mutations.push(mutName);
      else if (isCarrierAR(arAlls)) split_genes.push(mutName);
    }
  }

  const uniqueVisual = [...new Set(visual_mutations)];
  const uniqueSplits = [...new Set(split_genes)];

  return {
    sex, base_color,
    visual_mutations: uniqueVisual,
    split_genes: uniqueSplits,
    genetic_makeup: `${base_color} ${uniqueVisual.join(' ')} / split: ${uniqueSplits.join(', ')}`,
    blueAlleles, dfAlleles, fitness: 0,
  };
}

// -------------------------------------------------------------
// SECTION E — GENETIC ALGORITHM
// -------------------------------------------------------------

/**
 * Determine species compatibility using a lightweight rule based on species name.
 * This avoids hardcoded arrays and relies on common naming conventions.
 *
 * @param {string} species1
 * @param {string} species2
 * @returns {object} { compatible, warning, score }
 */
function checkSpeciesCompatibility(species1, species2) {
  const s1 = (species1 || '').toLowerCase();
  const s2 = (species2 || '').toLowerCase();
  if (!s1 || !s2 || s1 === s2) return { compatible: true, warning: null, score: 1.0 };

  // Simple rule: if both contain known eye‑ring species keywords → eye‑ring group
  const eyeRingKeywords = ['fischer', 'masked', 'black-cheeked', 'lilian', 'nyasa', 'personatus', 'nigrigenis'];
  const isEyeRing1 = eyeRingKeywords.some(kw => s1.includes(kw));
  const isEyeRing2 = eyeRingKeywords.some(kw => s2.includes(kw));

  if (isEyeRing1 && isEyeRing2) {
    return { compatible: true, warning: 'Cross between two eye‑ring species – hybrid possible.', score: 0.75 };
  }
  if (!isEyeRing1 && !isEyeRing2) {
    return { compatible: true, warning: 'Cross between two non‑eye‑ring species – hybrid possible.', score: 0.75 };
  }
  // One eye‑ring, one non‑eye‑ring → likely incompatible
  return { compatible: false, warning: 'Incompatible species groups: eye‑ring × non‑eye‑ring.', score: 0.30 };
}

function calcGeneticDiversity(p1, p2) {
  let score = 0, count = 0;
  const p1Blue = p1.blueAlleles.filter(a => a === 'b').length;
  const p2Blue = p2.blueAlleles.filter(a => a === 'b').length;
  score += Math.abs(p1Blue - p2Blue) / 2; count++;

  const p1DF = p1.dfAlleles[0] + p1.dfAlleles[1];
  const p2DF = p2.dfAlleles[0] + p2.dfAlleles[1];
  score += Math.abs(p1DF - p2DF) / 2; count++;

  const allMuts = new Set([...Object.keys(p1.arLoci), ...Object.keys(p2.arLoci),
                           ...Object.keys(p1.slLoci), ...Object.keys(p2.slLoci),
                           ...Object.keys(p1.adLoci), ...Object.keys(p2.adLoci)]);
  if (allMuts.size > 0) { score += allMuts.size / (allMuts.size + 5); count++; }
  return count > 0 ? score / count : 0;
}

const COLOR_RARITY = {
  'Green': 0.15, 'Dark Green': 0.30, 'Olive': 0.55,
  'Blue':  0.50, 'Cobalt':    0.65, 'Mauve': 0.80,
};
function calcFitness(ind) {
  const colorScore = COLOR_RARITY[ind.base_color] || 0.25;
  let fitness = colorScore * 0.35;
  fitness += Math.min(ind.visual_mutations.length * 0.12, 0.35);
  fitness += Math.min(ind.split_genes.length * 0.06, 0.20);
  if (ind.genetic_makeup.length > 20) fitness += 0.10;
  return Math.min(Math.round(fitness * 1000) / 1000, 1.0);
}

function rankSelection(population, k) {
  const N = population.length;
  const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
  const probs = sorted.map((_, i) => (2 * (N - i)) / (N * (N + 1)));
  const selected = [];
  for (let i = 0; i < k; i++) {
    let rand = Math.random(), cum = 0, chosen = sorted[0];
    for (let j = 0; j < sorted.length; j++) {
      cum += probs[j];
      if (rand <= cum) { chosen = sorted[j]; break; }
    }
    selected.push(chosen);
  }
  return selected;
}

function uniformCrossover(parentA, parentB, p = 0.5) {
  const sex = Math.random() < p ? parentA.sex : parentB.sex;
  const base_color = Math.random() < p ? parentA.base_color : parentB.base_color;
  const allMuts = [...new Set([...parentA.visual_mutations, ...parentB.visual_mutations])];
  const visual_mutations = allMuts.filter(m => {
    const inA = parentA.visual_mutations.includes(m);
    const inB = parentB.visual_mutations.includes(m);
    return (inA && inB) || Math.random() < p;
  });
  const allSplits = [...new Set([...parentA.split_genes, ...parentB.split_genes])];
  const split_genes = allSplits.filter(() => Math.random() < p);
  const uniqueV = [...new Set(visual_mutations)];
  const uniqueS = [...new Set(split_genes)];
  return {
    sex, base_color,
    visual_mutations: uniqueV,
    split_genes: uniqueS,
    genetic_makeup: `${base_color} ${uniqueV.join(' ')} / split: ${uniqueS.join(', ')}`,
    fitness: 0,
  };
}

function randomResettingMutation(individual, rate = 0.1) {
  const o = {
    sex: individual.sex,
    base_color: individual.base_color,
    visual_mutations: [...individual.visual_mutations],
    split_genes: [...individual.split_genes],
    fitness: 0,
  };
  if (o.visual_mutations.length > 0 && Math.random() < rate) {
    const idx = Math.floor(Math.random() * o.visual_mutations.length);
    o.visual_mutations.splice(idx, 1);
  }
  if (o.split_genes.length > 0 && Math.random() < rate * 0.2) {
    const gene = o.split_genes[Math.floor(Math.random() * o.split_genes.length)];
    if (!o.visual_mutations.includes(gene)) o.visual_mutations.push(gene);
  }
  o.genetic_makeup = `${o.base_color} ${o.visual_mutations.join(' ')} / split: ${o.split_genes.join(', ')}`;
  return o;
}

function inversionMutation(individual, rate = 0.05) {
  if (individual.visual_mutations.length < 2 || Math.random() > rate) return individual;
  const muts = [...individual.visual_mutations];
  let i = Math.floor(Math.random() * muts.length);
  let j = Math.floor(Math.random() * muts.length);
  const lo = Math.min(i, j), hi = Math.max(i, j);
  const seg = muts.slice(lo, hi + 1).reverse();
  const inv = muts.slice(0, lo).concat(seg).concat(muts.slice(hi + 1));
  return {
    ...individual,
    visual_mutations: inv,
    genetic_makeup: `${individual.base_color} ${inv.join(' ')} / split: ${individual.split_genes.join(', ')}`,
  };
}

function runGeneticAlgorithm(p1Encoded, p2Encoded, options = {}) {
  const generations    = options.generations    || 30;
  const populationSize = options.populationSize || 60;
  const crossoverRate  = options.crossoverRate  || 0.5;
  const mutationRate   = options.mutationRate   || 0.1;
  const inversionRate  = options.inversionRate  || 0.05;

  const compatibility  = checkSpeciesCompatibility(p1Encoded.raw.species, p2Encoded.raw.species);
  const diversityScore = calcGeneticDiversity(p1Encoded, p2Encoded);
  const punnettData    = buildPunnettData(p1Encoded, p2Encoded);

  let population = [];
  for (let i = 0; i < populationSize; i++) {
    const ind = sampleOneOffspring(punnettData);
    ind.fitness = calcFitness(ind);
    population.push(ind);
  }

  for (let gen = 0; gen < generations; gen++) {
    const currentMutRate = mutationRate * (1 - gen / generations);
    const currentCrossRate = Math.min(crossoverRate + diversityScore * 0.2, 0.8);

    const parents = rankSelection(population, Math.floor(populationSize * 0.6));
    const nextGen = [...parents];
    while (nextGen.length < populationSize) {
      const pA = parents[Math.floor(Math.random() * parents.length)];
      const pB = parents[Math.floor(Math.random() * parents.length)];
      let child = uniformCrossover(pA, pB, currentCrossRate);
      child = randomResettingMutation(child, currentMutRate);
      child = inversionMutation(child, inversionRate);
      child.fitness = calcFitness(child);
      nextGen.push(child);
    }
    population = nextGen.slice(0, populationSize);
  }
  population = population.map(ind => ({ ...ind, fitness: calcFitness(ind) }));
  return { population, punnettData, compatibility, diversityScore };
}

// -------------------------------------------------------------
// SECTION F — VERIFICATION (Traditional + Fuzzy)
// -------------------------------------------------------------
function fuzzyVisualProbability(p1Vis, p2Vis, p1Split, p2Split, itype) {
  const vc = (p1Vis ? 1 : 0) + (p2Vis ? 1 : 0);
  const sc = (p1Split ? 1 : 0) + (p2Split ? 1 : 0);
  if (itype === 'autosomal_recessive') {
    if (vc === 2) return 75;
    if (vc === 1 && sc >= 1) return 25;
    if (vc === 0 && sc === 2) return 25;
    return 0;
  }
  if (itype === 'sex_linked_recessive') {
    if (vc === 2) return 50;
    if (vc === 1 && sc >= 1) return 25;
    if (vc === 1) return 25;
    return 0;
  }
  if (itype === 'autosomal_dominant') return vc >= 1 ? 50 : 0;
  return 0;
}

function fuzzySplitProbability(p1Vis, p2Vis, p1Split, p2Split, itype) {
  if (itype === 'autosomal_dominant') return 0;
  const vc = (p1Vis ? 1 : 0) + (p2Vis ? 1 : 0);
  const sc = (p1Split ? 1 : 0) + (p2Split ? 1 : 0);
  if (itype === 'autosomal_recessive') {
    if (vc === 1 && sc === 0) return 50;
    if (vc === 1 && sc === 1) return 50;
    if (vc === 0 && sc === 2) return 50;
    if (vc === 0 && sc === 1) return 25;
    return 0;
  }
  if (itype === 'sex_linked_recessive') {
    if (vc >= 1) return 25;
    if (sc >= 1) return 25;
    return 0;
  }
  return 0;
}

function runTraditionalVerification(parent1, parent2, referenceData) {
  const p1Enc = encodeParent(parent1, referenceData);
  const p2Enc = encodeParent(parent2, referenceData);

  // Exact Punnett for base colours
  const blueOuts = crossAlleles(p1Enc.blueAlleles, p2Enc.blueAlleles);
  const dfOuts   = crossAlleles(p1Enc.dfAlleles,   p2Enc.dfAlleles);
  const colorCounts = {};
  for (const b of blueOuts) {
    for (const d of dfOuts) {
      const color = resolveBaseColor(b, d);
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
  }
  const totalCombos = blueOuts.length * dfOuts.length;
  const colorProbabilities = {};
  for (const [color, cnt] of Object.entries(colorCounts))
    colorProbabilities[color] = Math.round((cnt / totalCombos) * 100);

  // Collect all mutation names
  const allMutNames = new Set([
    ...(parent1.visual_mutations || []), ...(parent2.visual_mutations || []),
    ...(parent1.split_genes || []), ...(parent2.split_genes || []),
  ]);
  const mutationProbabilities = {};
  const splitProbabilities = {};
  for (const mutName of allMutNames) {
    const itype = getMutationInheritanceType(mutName, referenceData);
    const p1Vis = (parent1.visual_mutations || []).includes(mutName);
    const p2Vis = (parent2.visual_mutations || []).includes(mutName);
    const p1Spl = (parent1.split_genes || []).includes(mutName);
    const p2Spl = (parent2.split_genes || []).includes(mutName);
    const vp = fuzzyVisualProbability(p1Vis, p2Vis, p1Spl, p2Spl, itype);
    const sp = fuzzySplitProbability(p1Vis, p2Vis, p1Spl, p2Spl, itype);
    if (vp > 0) mutationProbabilities[mutName] = vp;
    if (sp > 0) splitProbabilities[mutName] = sp;
  }

  let confidence = 50;
  if ((parent1.visual_mutations || []).length > 0) confidence += 10;
  if ((parent2.visual_mutations || []).length > 0) confidence += 10;
  if ((parent1.split_genes || []).length > 0) confidence += 10;
  if ((parent2.split_genes || []).length > 0) confidence += 10;
  if (parent1.species === parent2.species) confidence += 10;

  return {
    method: 'Traditional Punnett Square + Fuzzy Logic Inference',
    base_color_probabilities: colorProbabilities,
    sex_probabilities: { Male: 50, Female: 50 },
    mutation_probabilities: mutationProbabilities,
    split_probabilities: splitProbabilities,
    confidence_score: Math.min(confidence, 100),
    punnett_detail: {
      blue_series_cross: blueOuts.map(a => a.join('')).join(' | '),
      dark_factor_cross: dfOuts.map(a => a.join('')).join(' | '),
    },
  };
}

// -------------------------------------------------------------
// SECTION G — PROBABILITIES FROM POPULATION
// -------------------------------------------------------------
function calcPopulationProbabilities(population) {
  const total = population.length;
  const colorCounts = {}, mutCounts = {}, splitCounts = {};
  let maleCount = 0;
  for (const ind of population) {
    if (ind.sex === 'Male') maleCount++;
    colorCounts[ind.base_color] = (colorCounts[ind.base_color] || 0) + 1;
    ind.visual_mutations.forEach(m => mutCounts[m] = (mutCounts[m] || 0) + 1);
    ind.split_genes.forEach(s => splitCounts[s] = (splitCounts[s] || 0) + 1);
  }
  const toPercent = counts => Object.fromEntries(
    Object.entries(counts).map(([k, v]) => [k, Math.round((v / total) * 1000) / 10])
  );
  return {
    base_colors: toPercent(colorCounts),
    sex: {
      Male:   Math.round((maleCount / total) * 1000) / 10,
      Female: Math.round(((total - maleCount) / total) * 1000) / 10,
    },
    mutations: toPercent(mutCounts),
    split_genes: toPercent(splitCounts),
  };
}

// -------------------------------------------------------------
// SECTION H — MAIN EXPORT
// -------------------------------------------------------------
/**
 * Main entry point called from BreedingForm.jsx.
 * @param {Object} formData - contains parent1 and parent2 objects with grandparent data
 * @param {Array} referenceData - visual_mutations from backend
 * @returns {Object} { chicks, genetic_analysis, probabilities, verification }
 */
export function computeGenetics(formData, referenceData = []) {
  // Extract parent data from the form structure
  const parent1Raw = {
    species:          formData.parent1_species || formData.parent1?.species || '',
    sex:              formData.parent1_sex     || formData.parent1?.sex     || 'Male',
    base_color:       formData.parent1_base_color || formData.parent1?.base_color || 'Green',
    visual_mutations: formData.parent1_visual_mutations || formData.parent1?.visual_mutations || [],
    split_genes:      formData.parent1_split_genes      || formData.parent1?.split_genes      || [],
    name:             formData.parent1_name || formData.parent1?.name || 'Parent 1',
  };
  
  const parent2Raw = {
    species:          formData.parent2_species || formData.parent2?.species || '',
    sex:              formData.parent2_sex     || formData.parent2?.sex     || 'Female',
    base_color:       formData.parent2_base_color || formData.parent2?.base_color || 'Green',
    visual_mutations: formData.parent2_visual_mutations || formData.parent2?.visual_mutations || [],
    split_genes:      formData.parent2_split_genes      || formData.parent2?.split_genes      || [],
    name:             formData.parent2_name || formData.parent2?.name || 'Parent 2',
  };
  
  // Extract grandparent data from the form structure
  const grandparentData1 = formData.grandparent_data?.parent1 || formData.parent1?.grandparent_data || null;
  const grandparentData2 = formData.grandparent_data?.parent2 || formData.parent2?.grandparent_data || null;

  // Encode parents with grandparent data integration
  const p1Encoded = encodeParent(parent1Raw, referenceData, grandparentData1);
  const p2Encoded = encodeParent(parent2Raw, referenceData, grandparentData2);

  const gaResult = runGeneticAlgorithm(p1Encoded, p2Encoded, { generations: 30, populationSize: 60 });
  const population = gaResult.population;
  const punnettData = gaResult.punnettData;
  const compatibility = gaResult.compatibility;
  const diversityScore = gaResult.diversityScore;

  // Select 6 chicks balanced by sex
  const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
  const males = sorted.filter(p => p.sex === 'Male');
  const females = sorted.filter(p => p.sex === 'Female');
  let selected = [];
  for (let i = 0; i < 3 && i < males.length; i++) selected.push(males[i]);
  for (let i = 0; i < 3 && i < females.length; i++) selected.push(females[i]);
  if (selected.length < 6) {
    const rest = sorted.filter(p => !selected.includes(p));
    selected = selected.concat(rest.slice(0, 6 - selected.length));
  }
  selected = selected.slice(0, 6).map((chick, idx) => ({
    chick_number: idx + 1,
    sex: chick.sex,
    base_color: chick.base_color,
    visual_mutations: chick.visual_mutations,
    split_genes: chick.split_genes,
    genetic_makeup: chick.genetic_makeup,
    fitness_score: chick.fitness,
  }));

  // Add inheritance percentages
  const finalChicks = selected.map(chick => {
    let maternal = 0, paternal = 0, total = 0;
    if (chick.base_color === parent1Raw.base_color) paternal++;
    if (chick.base_color === parent2Raw.base_color) maternal++;
    total++;
    for (const mut of chick.visual_mutations) {
      if ((parent1Raw.visual_mutations || []).includes(mut)) paternal++;
      if ((parent2Raw.visual_mutations || []).includes(mut)) maternal++;
      total++;
    }
    for (const split of chick.split_genes) {
      if ((parent1Raw.split_genes || []).includes(split)) paternal++;
      if ((parent2Raw.split_genes || []).includes(split)) maternal++;
      total++;
    }
    const inheritance_percentages = {
      mother: total ? (maternal / total) * 100 : 50,
      father: total ? (paternal / total) * 100 : 50,
    };
    return { ...chick, inheritance_percentages };
  });

  const probabilities = calcPopulationProbabilities(population);
  const verification = runTraditionalVerification(parent1Raw, parent2Raw, referenceData);

  const genetic_analysis = {
    parent1: {
      name: parent1Raw.name,
      species: parent1Raw.species,
      sex: parent1Raw.sex,
      base_color: parent1Raw.base_color,
      visual_mutations: parent1Raw.visual_mutations,
      split_genes: parent1Raw.split_genes,
      encoded_alleles: {
        blue_series: p1Encoded.blueAlleles,
        dark_factor: p1Encoded.dfAlleles,
        autosomal_loci: p1Encoded.arLoci,
        sex_linked_loci: p1Encoded.slLoci,
        dominant_loci: p1Encoded.adLoci,
      },
    },
    parent2: {
      name: parent2Raw.name,
      species: parent2Raw.species,
      sex: parent2Raw.sex,
      base_color: parent2Raw.base_color,
      visual_mutations: parent2Raw.visual_mutations,
      split_genes: parent2Raw.split_genes,
      encoded_alleles: {
        blue_series: p2Encoded.blueAlleles,
        dark_factor: p2Encoded.dfAlleles,
        autosomal_loci: p2Encoded.arLoci,
        sex_linked_loci: p2Encoded.slLoci,
        dominant_loci: p2Encoded.adLoci,
      },
    },
    species_compatibility: compatibility,
    genetic_diversity_score: diversityScore,
    punnett_square: {
      blue_series_combinations: punnettData.blueOutcomes,
      dark_factor_combinations: punnettData.dfOutcomes,
      mutation_loci_processed: punnettData.allMutationNames,
    },
    algorithm: {
      name: 'Rule‑Based Genetic Algorithm with Grandparent Data Integration',
      computation_location: 'Frontend (JavaScript) – GeneticComputationEngine.js',
      grandparent_data_used: !!(grandparentData1 || grandparentData2),
      steps_performed: [
        'Step 1: Genetic Data Encoding (Mendelian allele pairs, ZZ/ZW sex system)',
        'Step 1a: Grandparent Data Integration (infer missing parent traits)',
        'Step 2: Rule‑Based Punnett Square (per‑locus: AR, AD, SL)',
        'Step 3a: Species Compatibility Check',
        'Step 3b: Genetic Diversity Score',
        'Step 3c: Population Init via Punnett sampling (60 individuals)',
        'Step 3d: Linear Rank Selection',
        'Step 3e: Parameterized Uniform Crossover (diversity‑adjusted rate)',
        'Step 3f: Random Resetting Mutation (annealed)',
        'Step 3g: Inversion Mutation (chromosomal model)',
        'Verification: Traditional Punnett + Fuzzy Logic (independent check)',
      ],
      generations: 30,
      population_size: 60,
      crossover_rate: '0.5 + (diversity_score × 0.2)',
      mutation_rate: '0.1 annealed to 0',
      selection: 'Linear Rank Selection',
    },
    inheritance_rules: {
      sex_determination: 'ZZ = Male, ZW = Female (avian ZW system)',
      blue_series: 'B dominant over b. bb = Blue‑series. BB/Bb = Green‑series.',
      dark_factor: 'Co‑dominant. 0=Light, 1=Dark (Dark Green/Cobalt), 2=Double Dark (Olive/Mauve).',
      autosomal_recessive: 'Need mm to express. Nm = silent carrier/split.',
      sex_linked_recessive: 'Males: ZmZm = visual, ZmZ = split. Females: ZmW = visual, cannot be split.',
      autosomal_dominant: 'One Dn copy sufficient to express. DD = double‑factor.',
    },
    verification: verification,
  };

  return {
    chicks: finalChicks,
    probabilities,
    genetic_analysis,
    verification,
  };
}

export default { computeGenetics };