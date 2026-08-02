// GeneticComputationEngine.js — RBGIA + GICA (no fixed N=6 clutch)
// Deterministic Mendelian probabilities for the same parent inputs.

function getMutationInheritanceType(mutationName, referenceData) {
  if (!referenceData || !Array.isArray(referenceData)) referenceData = [];
  if (!mutationName) return 'autosomal_recessive';
  const found = referenceData.find(
    (ref) => (ref.name || '').toLowerCase() === mutationName.toLowerCase()
  );
  if (found) {
    const inh = (found.inheritance || '').toLowerCase();
    if (inh.includes('sex') || inh.includes('linked')) return 'sex_linked_recessive';
    if (inh.includes('dominant')) return 'autosomal_dominant';
    return 'autosomal_recessive';
  }
  return 'autosomal_recessive';
}

function encodeBaseColor(colorName, splitGenes) {
  splitGenes = splitGenes || [];
  const c = (colorName || '').toLowerCase().trim();
  const isBlue =
    c === 'blue' ||
    c === 'cobalt' ||
    c === 'mauve' ||
    c === 'slate' ||
    c === 'white' ||
    c === 'aqua' ||
    c.indexOf('blue') !== -1 ||
    c.indexOf('cobalt') !== -1 ||
    c.indexOf('mauve') !== -1;
  const splitToBlue = splitGenes.some((g) => {
    const sg = (g || '').toLowerCase();
    return sg.indexOf('blue') !== -1 || sg.indexOf('cobalt') !== -1 || sg.indexOf('turquoise') !== -1;
  });
  let blueAlleles;
  if (isBlue) blueAlleles = ['b', 'b'];
  else if (splitToBlue) blueAlleles = ['B', 'b'];
  else blueAlleles = ['B', 'B'];
  let darkFactor = 0;
  if (c === 'dark green' || c === 'cobalt' || c.indexOf('dark green') !== -1 || c.indexOf('cobalt') !== -1)
    darkFactor = 1;
  else if (c === 'olive' || c === 'mauve' || c.indexOf('olive') !== -1 || c.indexOf('mauve') !== -1)
    darkFactor = 2;
  const dfAlleles = darkFactor === 0 ? [0, 0] : darkFactor === 1 ? [1, 0] : [1, 1];
  return { blueAlleles, dfAlleles, isBlue, darkFactor };
}

function encodeParent(parent, referenceData) {
  const sex = parent.sex || 'Male';
  const isMale = sex === 'Male';
  const colorEncoding = encodeBaseColor(parent.base_color, parent.split_genes || []);
  const arLoci = {};
  const adLoci = {};
  const slLoci = {};

  (parent.visual_mutations || []).forEach((mut) => {
    const itype = getMutationInheritanceType(mut, referenceData);
    if (itype === 'sex_linked_recessive') slLoci[mut] = isMale ? ['m', 'm'] : ['m', 'W'];
    else if (itype === 'autosomal_dominant') adLoci[mut] = ['D', 'n'];
    else arLoci[mut] = ['m', 'm'];
  });

  (parent.split_genes || []).forEach((gene) => {
    const itype = getMutationInheritanceType(gene, referenceData);
    if (itype === 'sex_linked_recessive' && isMale && !slLoci[gene]) slLoci[gene] = ['m', 'N'];
    else if (itype === 'autosomal_recessive' && !arLoci[gene]) arLoci[gene] = ['N', 'm'];
  });

  return {
    sex,
    isMale,
    blueAlleles: colorEncoding.blueAlleles,
    dfAlleles: colorEncoding.dfAlleles,
    arLoci,
    adLoci,
    slLoci,
    raw: parent,
  };
}

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
  const isBlue = blueAlleles[0] === 'b' && blueAlleles[1] === 'b';
  const df = (dfAlleles[0] === 1 ? 1 : 0) + (dfAlleles[1] === 1 ? 1 : 0);
  if (!isBlue) {
    if (df === 0) return 'Green';
    if (df === 1) return 'Dark Green';
    return 'Olive';
  }
  if (df === 0) return 'Blue';
  if (df === 1) return 'Cobalt';
  return 'Mauve';
}

function expressesAR(alleles) {
  return alleles[0] === 'm' && alleles[1] === 'm';
}
function isCarrierAR(alleles) {
  return (alleles[0] === 'N' && alleles[1] === 'm') || (alleles[0] === 'm' && alleles[1] === 'N');
}
function expressesAD(alleles) {
  return alleles[0] === 'D' || alleles[1] === 'D';
}
function expressesSL(alleles, isMale) {
  return isMale ? alleles[0] === 'm' && alleles[1] === 'm' : alleles[0] === 'm' && alleles[1] === 'W';
}
function isCarrierSL(alleles, isMale) {
  return isMale && ((alleles[0] === 'm' && alleles[1] === 'N') || (alleles[0] === 'N' && alleles[1] === 'm'));
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function pctMap(counts, total) {
  const out = {};
  Object.entries(counts).forEach(([k, v]) => {
    out[k] = round1((v / total) * 100);
  });
  return out;
}

/** Real Agapornis clutch / hatch reference (mean eggs × hatch rate). */
export const SPECIES_REPRODUCTION = [
  { key: 'peach', labels: ['peach', 'rosy', 'roseicollis'], eggs_min: 4, eggs_mean: 5.0, eggs_max: 6, hatch_rate: 0.7 },
  { key: 'fischer', labels: ['fischer', 'fischeri'], eggs_min: 3, eggs_mean: 4.5, eggs_max: 6, hatch_rate: 0.65 },
  { key: 'masked', labels: ['masked', 'personatus', 'yellow-collar'], eggs_min: 3, eggs_mean: 4.0, eggs_max: 5, hatch_rate: 0.65 },
  { key: 'black-cheek', labels: ['black-cheek', 'black cheek', 'nigrigenis'], eggs_min: 3, eggs_mean: 4.0, eggs_max: 5, hatch_rate: 0.6 },
  { key: 'lilian', labels: ['lilian', 'nyasa', 'lilianae'], eggs_min: 3, eggs_mean: 4.0, eggs_max: 5, hatch_rate: 0.6 },
  { key: 'black-wing', labels: ['black-wing', 'black wing', 'taranta'], eggs_min: 3, eggs_mean: 3.5, eggs_max: 4, hatch_rate: 0.55 },
  { key: 'red-faced', labels: ['red-faced', 'red faced', 'pullarius', 'red-headed'], eggs_min: 3, eggs_mean: 4.0, eggs_max: 5, hatch_rate: 0.55 },
  { key: 'grey-headed', labels: ['grey-headed', 'gray-headed', 'grey headed', 'canus', 'madagascar'], eggs_min: 3, eggs_mean: 3.5, eggs_max: 4, hatch_rate: 0.5 },
  { key: 'swindern', labels: ['swindern', 'swindernianus', 'black-collar'], eggs_min: 3, eggs_mean: 3.5, eggs_max: 4, hatch_rate: 0.45 },
];

function matchSpeciesConfig(speciesName) {
  const s = (speciesName || '').toLowerCase();
  for (const cfg of SPECIES_REPRODUCTION) {
    if (cfg.labels.some((l) => s.includes(l))) return cfg;
  }
  return SPECIES_REPRODUCTION[0];
}

function checkSpeciesCompatibility(species1, species2) {
  const s1 = (species1 || '').toLowerCase();
  const s2 = (species2 || '').toLowerCase();
  if (!s1 || !s2 || s1 === s2) {
    return { compatible: true, same_species: true, warning: null, score: 1.0, hybrid: false };
  }
  const eyeRingKeywords = ['fischer', 'masked', 'black-cheek', 'lilian', 'nyasa', 'personatus', 'nigrigenis'];
  const isEyeRing1 = eyeRingKeywords.some((kw) => s1.includes(kw));
  const isEyeRing2 = eyeRingKeywords.some((kw) => s2.includes(kw));
  if (isEyeRing1 && isEyeRing2) {
    return {
      compatible: true,
      same_species: false,
      hybrid: true,
      warning: 'Hybrid pair: different eye-ring Agapornis species. Offspring may be sterile or atypical.',
      score: 0.75,
    };
  }
  if (!isEyeRing1 && !isEyeRing2) {
    return {
      compatible: true,
      same_species: false,
      hybrid: true,
      warning: 'Hybrid pair: different non-eye-ring Agapornis species. Use caution for breeding programs.',
      score: 0.7,
    };
  }
  return {
    compatible: false,
    same_species: false,
    hybrid: true,
    warning: 'Hybrid warning: eye-ring × non-eye-ring cross — low compatibility and elevated risk.',
    score: 0.3,
  };
}

function calcGeneticDiversity(p1, p2) {
  let score = 0;
  let count = 0;
  const p1Blue = p1.blueAlleles.filter((a) => a === 'b').length;
  const p2Blue = p2.blueAlleles.filter((a) => a === 'b').length;
  score += Math.abs(p1Blue - p2Blue) / 2;
  count++;
  const p1DF = p1.dfAlleles[0] + p1.dfAlleles[1];
  const p2DF = p2.dfAlleles[0] + p2.dfAlleles[1];
  score += Math.abs(p1DF - p2DF) / 2;
  count++;
  const allMuts = new Set([
    ...Object.keys(p1.arLoci),
    ...Object.keys(p2.arLoci),
    ...Object.keys(p1.slLoci),
    ...Object.keys(p2.slLoci),
    ...Object.keys(p1.adLoci),
    ...Object.keys(p2.adLoci),
  ]);
  if (allMuts.size > 0) {
    score += allMuts.size / (allMuts.size + 5);
    count++;
  }
  return count > 0 ? score / count : 0;
}

/** RBGIA — exact Mendelian / Punnett probability distributions (deterministic). */
function runRBGIA(p1, p2, parent1, parent2, referenceData) {
  const blueOuts = crossAlleles(p1.blueAlleles, p2.blueAlleles);
  const dfOuts = crossAlleles(p1.dfAlleles, p2.dfAlleles);
  const colorCounts = {};
  for (const b of blueOuts) {
    for (const d of dfOuts) {
      const color = resolveBaseColor(b, d);
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
  }
  const totalCombos = blueOuts.length * dfOuts.length;
  const base_colors = pctMap(colorCounts, totalCombos);

  const allMutNames = new Set([
    ...(parent1.visual_mutations || []),
    ...(parent2.visual_mutations || []),
    ...(parent1.split_genes || []),
    ...(parent2.split_genes || []),
    ...Object.keys(p1.arLoci),
    ...Object.keys(p2.arLoci),
    ...Object.keys(p1.adLoci),
    ...Object.keys(p2.adLoci),
    ...Object.keys(p1.slLoci),
    ...Object.keys(p2.slLoci),
  ]);

  const mutations = {};
  const split_genes = {};
  const malePar = p1.isMale ? p1 : p2;
  const femPar = p1.isMale ? p2 : p1;

  for (const mutName of allMutNames) {
    const itype = getMutationInheritanceType(mutName, referenceData);
    let express = 0;
    let carry = 0;
    let total = 0;

    if (itype === 'sex_linked_recessive') {
      const dadZ = malePar.slLoci[mutName] || ['N', 'N'];
      const momZ = (femPar.slLoci[mutName] || ['N', 'W'])[0];
      // Male offspring: dad contributes one of 2 Z, mom contributes Z
      for (const dadContrib of dadZ) {
        const maleAlls = [dadContrib, momZ];
        total++;
        if (expressesSL(maleAlls, true)) express++;
        else if (isCarrierSL(maleAlls, true)) carry++;
      }
      // Female offspring: dad Z + W — equal weight as males (50% sex)
      for (const dadContrib of dadZ) {
        const femAlls = [dadContrib, 'W'];
        total++;
        if (expressesSL(femAlls, false)) express++;
      }
    } else if (itype === 'autosomal_dominant') {
      const outs = crossAlleles(p1.adLoci[mutName] || ['n', 'n'], p2.adLoci[mutName] || ['n', 'n']);
      total = outs.length;
      outs.forEach((a) => {
        if (expressesAD(a)) express++;
      });
    } else {
      const outs = crossAlleles(p1.arLoci[mutName] || ['N', 'N'], p2.arLoci[mutName] || ['N', 'N']);
      total = outs.length;
      outs.forEach((a) => {
        if (expressesAR(a)) express++;
        else if (isCarrierAR(a)) carry++;
      });
    }

    if (total > 0) {
      const ep = round1((express / total) * 100);
      const cp = round1((carry / total) * 100);
      if (ep > 0) mutations[mutName] = ep;
      if (cp > 0) split_genes[mutName] = cp;
    }
  }

  const sex = { Male: 50.0, Female: 50.0 };
  const M = allMutNames.size + 2; // loci count estimate (color + df + mutations)

  return {
    algorithm: 'RBGIA',
    full_name: 'Rule-Based Genetic Inheritance Algorithm',
    deterministic: true,
    loci_count: M,
    probabilities: {
      base_colors,
      sex,
      mutations,
      split_genes,
    },
    punnett: {
      blue_series_combinations: blueOuts,
      dark_factor_combinations: dfOuts,
      mutation_loci_processed: Array.from(allMutNames),
    },
  };
}

/** GICA — Genetic Inheritance Compatibility Algorithm score (deterministic). */
function runGICA(rbgia, compatibility, diversityScore) {
  const probs = rbgia.probabilities;
  const colorVals = Object.values(probs.base_colors || {});
  const mutVals = Object.values(probs.mutations || {});
  const maxColor = colorVals.length ? Math.max(...colorVals) : 50;
  const avgMut = mutVals.length ? mutVals.reduce((a, b) => a + b, 0) / mutVals.length : 0;

  const trait_success = round1(Math.min(100, maxColor * 0.7 + avgMut * 0.3));
  const hybridPenalty = compatibility.hybrid ? (compatibility.compatible ? 18 : 45) : 0;
  const mutRisk = Math.min(35, Object.keys(probs.mutations || {}).length * 5);
  const risk = round1(Math.min(100, hybridPenalty + mutRisk + (1 - compatibility.score) * 40));
  const diversity = round1(Math.min(100, diversityScore * 100));

  const score = round1(
    Math.max(0, Math.min(100, trait_success * 0.45 + (100 - risk) * 0.25 + diversity * 0.3))
  );

  let label = 'Fair';
  let recommendation = 'Proceed with monitoring of clutch outcomes.';
  if (score >= 80) {
    label = 'Excellent';
    recommendation = 'Strong pair compatibility for the selected traits.';
  } else if (score >= 65) {
    label = 'Good';
    recommendation = 'Suitable pair; review mutation risks if relevant.';
  } else if (score >= 45) {
    label = 'Fair';
    recommendation = 'Moderate compatibility — consider trait goals carefully.';
  } else if (compatibility.compatible) {
    label = 'Poor';
    recommendation = 'Low expected trait success or elevated risk.';
  } else {
    label = 'Not Recommended';
    recommendation = 'Species combination is high-risk for productive breeding.';
  }

  return {
    algorithm: 'GICA',
    full_name: 'Genetic Inheritance Compatibility Algorithm',
    score,
    label,
    recommendation,
    breakdown: {
      trait_success,
      risk,
      diversity,
    },
  };
}

/**
 * Clutch / hatch forecast from species biology + genetic compatibility (not a fixed egg count).
 * Real-life Agapornis: same-species pairs near species range; hybrids smaller clutches + lower hatch;
 * high GICA / healthy diversity → toward upper clutch; poor GICA / mutation load → toward lower.
 */
function buildReproductiveForecast(parent1, parent2, compatibility, gica, diversityScore) {
  const cfg1 = matchSpeciesConfig(parent1.species);
  const cfg2 = matchSpeciesConfig(parent2.species);

  let eggs_min;
  let eggs_mean;
  let eggs_max;
  let base_hatch;
  let species_used;

  if (compatibility.same_species) {
    eggs_min = cfg1.eggs_min;
    eggs_mean = cfg1.eggs_mean;
    eggs_max = cfg1.eggs_max;
    base_hatch = cfg1.hatch_rate;
    species_used = parent1.species || cfg1.key;
  } else {
    // Hybrids: narrower / lower clutch than pure species averages
    eggs_min = Math.max(2, Math.min(cfg1.eggs_min, cfg2.eggs_min) - 1);
    eggs_mean = round1((cfg1.eggs_mean + cfg2.eggs_mean) / 2 - 0.5);
    eggs_max = Math.max(eggs_min, Math.round((cfg1.eggs_max + cfg2.eggs_max) / 2) - 1);
    base_hatch = Math.min(cfg1.hatch_rate, cfg2.hatch_rate) * (compatibility.compatible ? 0.75 : 0.45);
    species_used = `${parent1.species || cfg1.key} × ${parent2.species || cfg2.key}`;
  }

  const mutLoad =
    (parent1.visual_mutations || []).length +
    (parent2.visual_mutations || []).length +
    ((parent1.split_genes || []).length + (parent2.split_genes || []).length) * 0.5;

  const gicaScore = Number(gica?.score) || 50;
  const speciesFactor = Number(compatibility.score) || 0.5;
  const diversityFactor = Math.min(1, Math.max(0.2, Number(diversityScore) || 0));
  const mutationStress = Math.min(0.35, mutLoad * 0.04);

  // Start near mid-range (real Agapornis typical clutch), then shift by genetics/compat
  let clutchFactor = 0.5;
  clutchFactor += ((gicaScore - 50) / 100) * 0.55; // GICA pulls toward min or max
  clutchFactor += (speciesFactor - 0.85) * 0.5; // hybrids/low species score pull down
  clutchFactor += (diversityFactor - 0.35) * 0.2;
  clutchFactor -= mutationStress;

  if (!compatibility.compatible) clutchFactor = Math.min(clutchFactor, 0.2) * 0.6;
  else if (compatibility.hybrid) clutchFactor = Math.min(clutchFactor, 0.45) * 0.85;

  clutchFactor = Math.max(0, Math.min(1, clutchFactor));

  const span = Math.max(0, eggs_max - eggs_min);
  const eggs_forecast = Math.max(
    eggs_min,
    Math.min(eggs_max, Math.round(eggs_min + span * clutchFactor))
  );

  // Hatch stays close to species base; genetics nudge it (not always mean×fixed)
  let hatch_rate = base_hatch * (0.78 + 0.22 * Math.min(1, Math.max(0.2, gicaScore / 100) * speciesFactor));
  hatch_rate *= 1 - mutationStress * 0.35;
  if (compatibility.hybrid) hatch_rate *= compatibility.compatible ? 0.8 : 0.5;
  if (!compatibility.compatible) hatch_rate *= 0.65;
  hatch_rate = round1(Math.max(0.15, Math.min(0.88, hatch_rate)) * 100) / 100;

  const expected_hatchlings = round1(eggs_forecast * hatch_rate);
  // How many of the forecast eggs are likely fertile/viable enough to show as hatch examples
  const expected_hatch_count = Math.max(
    0,
    Math.min(eggs_forecast, Math.round(expected_hatchlings))
  );

  const adjustment_notes = [];
  adjustment_notes.push(
    `Species baseline clutch ${eggs_min}–${eggs_max} (ref. mean ${eggs_mean}).`
  );
  adjustment_notes.push(
    `GICA ${gicaScore}/100 + species compat ${round1(speciesFactor * 100)}% → clutch factor ${round1(clutchFactor * 100)}%.`
  );
  if (compatibility.hybrid) {
    adjustment_notes.push('Hybrid pair: reduced clutch size and hatch rate vs pure-species pairs.');
  }
  if (mutationStress > 0.08) {
    adjustment_notes.push('Elevated mutation/split load: mild hatch penalty (real-world stress).');
  }
  if (gicaScore >= 75 && compatibility.same_species) {
    adjustment_notes.push('Strong same-species compatibility: clutch toward upper species range.');
  } else if (gicaScore < 45) {
    adjustment_notes.push('Lower compatibility: clutch toward lower species range.');
  }

  return {
    species_used,
    eggs_laid_min: eggs_min,
    eggs_laid_mean: eggs_mean,
    eggs_laid_max: eggs_max,
    eggs_forecast,
    eggs_forecast_basis: 'compatibility-adjusted within species min–max (not fixed at mean)',
    clutch_factor: round1(clutchFactor * 100) / 100,
    hatch_rate,
    hatch_rate_percent: round1(hatch_rate * 100),
    base_hatch_rate: round1(base_hatch * 100) / 100,
    expected_hatchlings,
    expected_hatch_count,
    formula: 'eggs_forecast = f(species range, GICA, species compat, diversity, mutation load); expected_hatchlings = eggs_forecast × hatch_rate',
    adjustment_notes,
    hybrid_warning: compatibility.hybrid ? compatibility.warning : null,
  };
}

function parentTraitSources(trait, parent1, parent2) {
  const sources = [];
  const t = (trait || '').toLowerCase();
  const p1Vis = (parent1.visual_mutations || []).some((m) => m.toLowerCase() === t);
  const p2Vis = (parent2.visual_mutations || []).some((m) => m.toLowerCase() === t);
  const p1Split = (parent1.split_genes || []).some((m) => m.toLowerCase() === t);
  const p2Split = (parent2.split_genes || []).some((m) => m.toLowerCase() === t);
  if (p1Vis) sources.push(`${parent1.name || 'Parent 1'} (visual)`);
  else if (p1Split) sources.push(`${parent1.name || 'Parent 1'} (split/carrier)`);
  if (p2Vis) sources.push(`${parent2.name || 'Parent 2'} (visual)`);
  else if (p2Split) sources.push(`${parent2.name || 'Parent 2'} (split/carrier)`);
  return sources.length ? sources : ['Not listed on either parent'];
}

function formatAllelePair(alleles) {
  return (alleles || []).map(String).join('/');
}

/**
 * Egg examples: N = eggs_forecast (compatibility-adjusted), not fixed 5 / mean.
 * Deterministic Punnett picks for genotype + phenotype at hatch.
 */
function generateEggChickExamples(p1, p2, parent1, parent2, reproductive, referenceData) {
  const eggCount = Math.max(
    1,
    Math.round(
      Number(reproductive.eggs_forecast) ||
        Number(reproductive.eggs_laid_mean) ||
        Number(reproductive.eggs_laid_min) ||
        3
    )
  );
  const expectedHatch = Math.max(
    0,
    Math.min(
      eggCount,
      Math.round(
        Number(reproductive.expected_hatch_count) ??
          Number(reproductive.expected_hatchlings) ??
          0
      )
    )
  );

  const blueOuts = crossAlleles(p1.blueAlleles, p2.blueAlleles);
  const dfOuts = crossAlleles(p1.dfAlleles, p2.dfAlleles);
  const colorCombos = [];
  for (const b of blueOuts) {
    for (const d of dfOuts) {
      colorCombos.push({ blue: [...b], df: [...d], color: resolveBaseColor(b, d) });
    }
  }

  const allMutNames = Array.from(
    new Set([
      ...(parent1.visual_mutations || []),
      ...(parent2.visual_mutations || []),
      ...(parent1.split_genes || []),
      ...(parent2.split_genes || []),
      ...Object.keys(p1.arLoci),
      ...Object.keys(p2.arLoci),
      ...Object.keys(p1.adLoci),
      ...Object.keys(p2.adLoci),
      ...Object.keys(p1.slLoci),
      ...Object.keys(p2.slLoci),
    ])
  );

  const malePar = p1.isMale ? p1 : p2;
  const femPar = p1.isMale ? p2 : p1;
  const chicks = [];

  for (let i = 0; i < eggCount; i++) {
    const combo = colorCombos[i % colorCombos.length];
    const sex = i % 2 === 0 ? 'Male' : 'Female';
    const isMale = sex === 'Male';
    const visual_mutations = [];
    const split_genes = [];
    const genotype_loci = {
      blue_series: formatAllelePair(combo.blue),
      dark_factor: formatAllelePair(combo.df),
      sex_chromosomes: isMale ? 'ZZ' : 'ZW',
      mutations: {},
    };
    const inherited_traits = [
      `Base color alleles from ${parent1.base_color || 'P1'} × ${parent2.base_color || 'P2'} → ${combo.color}`,
      `Sex ${sex} (${isMale ? 'ZZ' : 'ZW'})`,
    ];

    allMutNames.forEach((mutName, mutIdx) => {
      const itype = getMutationInheritanceType(mutName, referenceData);
      let alleles;
      let visual = false;
      let split = false;

      if (itype === 'sex_linked_recessive') {
        const dadZ = malePar.slLoci[mutName] || ['N', 'N'];
        const momZ = (femPar.slLoci[mutName] || ['N', 'W'])[0];
        const dadContrib = dadZ[(i + mutIdx) % dadZ.length];
        alleles = isMale ? [dadContrib, momZ] : [dadContrib, 'W'];
        visual = expressesSL(alleles, isMale);
        split = isCarrierSL(alleles, isMale);
      } else if (itype === 'autosomal_dominant') {
        const outs = crossAlleles(p1.adLoci[mutName] || ['n', 'n'], p2.adLoci[mutName] || ['n', 'n']);
        alleles = outs[(i + mutIdx) % outs.length];
        visual = expressesAD(alleles);
      } else {
        const outs = crossAlleles(p1.arLoci[mutName] || ['N', 'N'], p2.arLoci[mutName] || ['N', 'N']);
        alleles = outs[(i + mutIdx) % outs.length];
        visual = expressesAR(alleles);
        split = isCarrierAR(alleles);
      }

      genotype_loci.mutations[mutName] = {
        alleles: formatAllelePair(alleles),
        inheritance: itype,
        status: visual ? 'visual' : split ? 'split/carrier' : 'wild-type',
      };

      if (visual) {
        visual_mutations.push(mutName);
        inherited_traits.push(
          `Visual ${mutName} (${formatAllelePair(alleles)}) from ${parentTraitSources(mutName, parent1, parent2).join(' + ')}`
        );
      } else if (split) {
        split_genes.push(mutName);
        inherited_traits.push(
          `Split ${mutName} (${formatAllelePair(alleles)}) from ${parentTraitSources(mutName, parent1, parent2).join(' + ')}`
        );
      }
    });

    const phenotypeParts = [combo.color, ...visual_mutations];
    const phenotype =
      phenotypeParts.join(' ') +
      (split_genes.length ? ` / split: ${split_genes.join(', ')}` : '');

    const genotype = [
      `color:${genotype_loci.blue_series}`,
      `df:${genotype_loci.dark_factor}`,
      `sex:${genotype_loci.sex_chromosomes}`,
      ...Object.entries(genotype_loci.mutations).map(
        ([m, info]) => `${m}:${info.alleles}(${info.status})`
      ),
    ].join(' | ');

    const willHatch = i < expectedHatch;

    chicks.push({
      egg_number: i + 1,
      chick_number: i + 1,
      status: willHatch ? 'expected_hatch' : 'egg_possibility',
      hatch_note: willHatch
        ? 'Within expected hatchlings (eggs_laid_mean × hatch_rate)'
        : 'Egg possibility from mean clutch; may not hatch at species hatch rate',
      sex,
      base_color: combo.color,
      visual_mutations,
      split_genes,
      genotype,
      genotype_loci,
      phenotype,
      genetic_makeup: phenotype,
      inherited_traits,
      inherited_from: {
        base_color: `${parent1.base_color || '—'} × ${parent2.base_color || '—'}`,
        mutations: visual_mutations.concat(split_genes).map((m) => ({
          trait: m,
          from: parentTraitSources(m, parent1, parent2),
        })),
      },
    });
  }

  return {
    egg_count: eggCount,
    expected_hatch_count: expectedHatch,
    source: 'compatibility-adjusted eggs_forecast (species min–max; not fixed clutch)',
    formula_note: `Generated ${eggCount} egg example(s) from pair forecast (GICA/species/diversity); ~${expectedHatch} marked expected hatch.`,
    clutch_factor: reproductive.clutch_factor,
    adjustment_notes: reproductive.adjustment_notes || [],
    chicks,
  };
}

/** Trace which parental traits offspring are expected to inherit (RBGIA). */
function buildInheritedTraits(parent1, parent2, rbgia, referenceData) {
  const probs = rbgia.probabilities || {};
  const baseEntries = Object.entries(probs.base_colors || {}).sort((a, b) => b[1] - a[1]);
  const mutEntries = Object.entries(probs.mutations || {}).sort((a, b) => b[1] - a[1]);
  const splitEntries = Object.entries(probs.split_genes || {}).sort((a, b) => b[1] - a[1]);

  const mostLikelyColor = baseEntries[0]?.[0] || '—';
  const mostLikelyColorPct = baseEntries[0]?.[1] ?? 0;

  const colorInheritance = {
    trait: 'Base color',
    parent1_phenotype: parent1.base_color,
    parent2_phenotype: parent2.base_color,
    most_likely_offspring: mostLikelyColor,
    probability_percent: mostLikelyColorPct,
    distribution: Object.fromEntries(baseEntries),
    computation:
      'Blue-series (B/b) × dark-factor (0/1/2) Punnett grid → phenotype probabilities for Green/Dark Green/Olive or Blue/Cobalt/Mauve.',
    inherited_from: `Parents: ${parent1.base_color || '—'} × ${parent2.base_color || '—'}`,
  };

  const mutation_traits = mutEntries.map(([name, pct]) => {
    const itype = getMutationInheritanceType(name, referenceData);
    return {
      trait: name,
      outcome: 'visual expression',
      probability_percent: pct,
      inheritance_type: itype,
      inherited_from: parentTraitSources(name, parent1, parent2),
      computation:
        itype === 'sex_linked_recessive'
          ? 'Sex-linked recessive: male ZZ / female ZW allele cross; visual if homozygous males or hemizygous females.'
          : itype === 'autosomal_dominant'
            ? 'Autosomal dominant: one D allele sufficient for visual expression.'
            : 'Autosomal recessive: offspring express only if genotype is mm (both alleles mutant).',
    };
  });

  const split_traits = splitEntries.map(([name, pct]) => {
    const itype = getMutationInheritanceType(name, referenceData);
    return {
      trait: name,
      outcome: 'split / silent carrier',
      probability_percent: pct,
      inheritance_type: itype,
      inherited_from: parentTraitSources(name, parent1, parent2),
      computation:
        'Carrier probability from Mendelian cross when offspring receive one mutant allele but do not express visually.',
    };
  });

  const sex_traits = {
    trait: 'Sex',
    distribution: probs.sex || { Male: 50, Female: 50 },
    computation: 'Avian ZW system: ZZ = Male, ZW = Female → theoretical 50% / 50%.',
    inherited_from: 'Sex chromosomes contributed by both parents (ZW system)',
  };

  const feature_lines = [];
  feature_lines.push(
    `Most likely base color: ${mostLikelyColor} (${mostLikelyColorPct}%) from ${parent1.base_color || '?'} × ${parent2.base_color || '?'}.`
  );
  feature_lines.push('Sex of offspring: ~50% Male / 50% Female (ZW).');
  mutEntries.forEach(([name, pct]) => {
    feature_lines.push(
      `Visual ${name}: ${pct}% chance — alleles traced from ${parentTraitSources(name, parent1, parent2).join(' + ')}.`
    );
  });
  splitEntries.forEach(([name, pct]) => {
    feature_lines.push(
      `Split to ${name}: ${pct}% chance offspring carry without showing — from ${parentTraitSources(name, parent1, parent2).join(' + ')}.`
    );
  });
  if (!mutEntries.length && !splitEntries.length) {
    feature_lines.push(
      'No listed visual mutations or splits on parents → offspring mutation/split probabilities are empty for this pair.'
    );
  }

  const expected_phenotype_summary = {
    most_likely_base_color: mostLikelyColor,
    most_likely_base_color_percent: mostLikelyColorPct,
    likely_visual_mutations: mutEntries.filter(([, p]) => p >= 25).map(([n]) => n),
    likely_splits: splitEntries.filter(([, p]) => p >= 25).map(([n]) => n),
    sex_ratio: '50% Male / 50% Female',
  };

  return {
    title: 'Genetic Traits Offspring Inherit from Parents',
    summary:
      'RBGIA maps each parental allele contribution to offspring phenotype probabilities (base color, visual mutations, splits, sex).',
    parents: {
      parent1: {
        name: parent1.name,
        sex: parent1.sex,
        species: parent1.species,
        base_color: parent1.base_color,
        visual_mutations: parent1.visual_mutations || [],
        split_genes: parent1.split_genes || [],
      },
      parent2: {
        name: parent2.name,
        sex: parent2.sex,
        species: parent2.species,
        base_color: parent2.base_color,
        visual_mutations: parent2.visual_mutations || [],
        split_genes: parent2.split_genes || [],
      },
    },
    expected_phenotype_summary,
    color_inheritance: colorInheritance,
    mutation_traits,
    split_traits,
    sex_traits,
    feature_lines,
  };
}

function buildReport(rbgia, gica, reproductive, inheritedTraits, eggExamples) {
  const phen = inheritedTraits?.expected_phenotype_summary || {};
  const eggN =
    eggExamples?.egg_count ??
    reproductive.eggs_forecast ??
    Math.round(reproductive.eggs_laid_mean || 0);
  const hatchN =
    eggExamples?.expected_hatch_count ??
    reproductive.expected_hatch_count ??
    Math.round(reproductive.expected_hatchlings || 0);
  return {
    title: 'Computational Summary (RBGIA + GICA)',
    determinism:
      'RBGIA probabilities, GICA scores, and egg-example genotypes are deterministic for identical parent inputs (Punnett enumeration; no ML / no random GA).',
    time_complexity: 'O(M) to O(M·K)',
    time_complexity_note:
      'M = number of genetic loci/traits processed; K = allele combinations per locus (bounded Mendelian grid).',
    space_complexity: 'O(M)',
    space_complexity_note: 'Stores per-locus genotype tables and probability maps proportional to traits.',
    scalability:
      'As traits increase, runtime grows roughly linearly with M (or M·K). Egg count follows compatibility-adjusted clutch within species range — not a fixed 5 or 6.',
    note_n6_removed:
      'Fixed clutch models removed. Eggs = compatibility-adjusted forecast inside real Agapornis min–max for the pair (hybrids and low GICA reduce clutch/hatch).',
    algorithms: ['RBGIA', 'GICA'],
    reproductive_summary: `Forecast clutch ${eggN} eggs (species range ${reproductive.eggs_laid_min}–${reproductive.eggs_laid_max}, ref. mean ${reproductive.eggs_laid_mean}; clutch factor ${reproductive.clutch_factor ?? '—'}). Hatch ~${reproductive.hatch_rate_percent}% → expected hatchlings ≈ ${reproductive.expected_hatchlings} (${hatchN} marked hatch).`,
    gica_summary: `Compatibility Index ${gica.score}/100 (${gica.label}).`,
    inheritance_summary: `Most likely offspring color ${phen.most_likely_base_color || '—'} (${phen.most_likely_base_color_percent ?? '—'}%). Visual mutations ≥25%: ${(phen.likely_visual_mutations || []).join(', ') || 'none'}. Likely splits ≥25%: ${(phen.likely_splits || []).join(', ') || 'none'}.`,
    inherited_traits: inheritedTraits,
    egg_chick_examples: eggExamples,
    disclaimer:
      'Decision-support only. Not a veterinary diagnosis. Actual clutches vary with health, husbandry, and environment.',
  };
}

function runVerification(rbgia, parent1, parent2) {
  let confidence = 55;
  if ((parent1.visual_mutations || []).length > 0) confidence += 8;
  if ((parent2.visual_mutations || []).length > 0) confidence += 8;
  if ((parent1.split_genes || []).length > 0) confidence += 7;
  if ((parent2.split_genes || []).length > 0) confidence += 7;
  if (parent1.species === parent2.species) confidence += 10;

  return {
    method: 'Mendelian / Punnett Square verification (independent of GICA scoring)',
    base_color_probabilities: rbgia.probabilities.base_colors,
    sex_probabilities: rbgia.probabilities.sex,
    mutation_probabilities: rbgia.probabilities.mutations,
    split_probabilities: rbgia.probabilities.split_genes,
    confidence_score: Math.min(confidence, 100),
    punnett_detail: {
      blue_series_cross: (rbgia.punnett.blue_series_combinations || []).map((a) => a.join('')).join(' | '),
      dark_factor_cross: (rbgia.punnett.dark_factor_combinations || []).map((a) => a.join('')).join(' | '),
    },
  };
}

/**
 * Main entry — RBGIA probabilities + GICA index + reproductive forecast.
 * No fixed 6-chick output.
 */
export function computeGenetics(formData, referenceData = []) {
  const parent1Raw = {
    species: formData.parent1_species || formData.parent1?.species || '',
    sex: formData.parent1_sex || formData.parent1?.sex || 'Male',
    base_color: formData.parent1_base_color || formData.parent1?.base_color || 'Green',
    visual_mutations: formData.parent1_visual_mutations || formData.parent1?.visual_mutations || [],
    split_genes: formData.parent1_split_genes || formData.parent1?.split_genes || [],
    name: formData.parent1_name || formData.parent1?.name || 'Parent 1',
  };
  const parent2Raw = {
    species: formData.parent2_species || formData.parent2?.species || '',
    sex: formData.parent2_sex || formData.parent2?.sex || 'Female',
    base_color: formData.parent2_base_color || formData.parent2?.base_color || 'Green',
    visual_mutations: formData.parent2_visual_mutations || formData.parent2?.visual_mutations || [],
    split_genes: formData.parent2_split_genes || formData.parent2?.split_genes || [],
    name: formData.parent2_name || formData.parent2?.name || 'Parent 2',
  };

  const p1 = encodeParent(parent1Raw, referenceData);
  const p2 = encodeParent(parent2Raw, referenceData);
  const compatibility = checkSpeciesCompatibility(parent1Raw.species, parent2Raw.species);
  const diversityScore = calcGeneticDiversity(p1, p2);

  const rbgia = runRBGIA(p1, p2, parent1Raw, parent2Raw, referenceData);
  const gica = runGICA(rbgia, compatibility, diversityScore);
  const reproductive_forecast = buildReproductiveForecast(
    parent1Raw,
    parent2Raw,
    compatibility,
    gica,
    diversityScore
  );
  const verification = runVerification(rbgia, parent1Raw, parent2Raw);
  const inherited_traits = buildInheritedTraits(parent1Raw, parent2Raw, rbgia, referenceData);
  const egg_chick_examples = generateEggChickExamples(
    p1,
    p2,
    parent1Raw,
    parent2Raw,
    reproductive_forecast,
    referenceData
  );
  const chicks = egg_chick_examples.chicks;
  const report = buildReport(
    rbgia,
    gica,
    reproductive_forecast,
    inherited_traits,
    egg_chick_examples
  );

  const genetic_analysis = {
    parent1: {
      name: parent1Raw.name,
      species: parent1Raw.species,
      sex: parent1Raw.sex,
      base_color: parent1Raw.base_color,
      visual_mutations: parent1Raw.visual_mutations,
      split_genes: parent1Raw.split_genes,
      encoded_alleles: {
        blue_series: p1.blueAlleles,
        dark_factor: p1.dfAlleles,
        autosomal_loci: p1.arLoci,
        sex_linked_loci: p1.slLoci,
        dominant_loci: p1.adLoci,
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
        blue_series: p2.blueAlleles,
        dark_factor: p2.dfAlleles,
        autosomal_loci: p2.arLoci,
        sex_linked_loci: p2.slLoci,
        dominant_loci: p2.adLoci,
      },
    },
    species_compatibility: compatibility,
    genetic_diversity_score: diversityScore,
    rbgia,
    gica,
    reproductive_forecast,
    report,
    inherited_traits,
    egg_chick_examples,
    verification,
    punnett_square: rbgia.punnett,
    algorithm: {
      name: 'RBGIA + GICA',
      computation_location: 'Client (JavaScript) — GeneticComputationEngine.js',
      steps_performed: [
        'RBGIA: Mendelian encoding of base color, dark factor, and mutation loci',
        'RBGIA: Exact Punnett enumeration → probability distributions',
        'GICA: Compatibility Index from trait success, risk, and diversity',
        'Reproductive forecast: compatibility-adjusted clutch within species min–max × hatch rate',
        'Egg examples: N = eggs_forecast (not fixed 5); genotype + phenotype per egg',
        'Inherited traits report: map parental alleles → offspring phenotype features',
        'Verification: independent Mendelian check + confidence',
      ],
      fixed_n6_removed: true,
    },
    inheritance_rules: {
      sex_determination: 'ZZ = Male, ZW = Female (avian ZW system)',
      blue_series: 'B dominant over b. bb = Blue-series. BB/Bb = Green-series.',
      dark_factor: 'Co-dominant. 0=Light, 1=Dark (Dark Green/Cobalt), 2=Double Dark (Olive/Mauve).',
      autosomal_recessive: 'Need mm to express. Nm = silent carrier/split.',
      sex_linked_recessive: 'Males: ZmZm = visual, ZmZ = split. Females: ZmW = visual.',
      autosomal_dominant: 'One D copy sufficient to express.',
    },
  };

  return {
    chicks,
    chicks_data: chicks,
    probabilities: rbgia.probabilities,
    genetic_analysis,
    verification,
    gica,
    reproductive_forecast,
    report,
    egg_chick_examples,
  };
}

export default { computeGenetics, SPECIES_REPRODUCTION };
