/**
 * Map API image_src paths (Vite-style) to bundled Expo assets.
 * API returns paths like "/src/assets/birds/peach-faced-lovebird.png".
 */
const BIRDS = {
  'lilians-lovebird.png': require('../../assets/birds/lilians-lovebird.png'),
  'peach-faced-lovebird.png': require('../../assets/birds/peach-faced-lovebird.png'),
  'masked-lovebird.png': require('../../assets/birds/masked-lovebird.png'),
  'fischers-lovebird.png': require('../../assets/birds/fischers-lovebird.png'),
  'black-cheeked-lovebird.png': require('../../assets/birds/black-cheeked-lovebird.png'),
  'black-winged-lovebird.png': require('../../assets/birds/black-winged-lovebird.png'),
  'red-faced-lovebird.png': require('../../assets/birds/red-faced-lovebird.png'),
  'grey-headed-lovebird.png': require('../../assets/birds/grey-headed-lovebird.png'),
  'swinderns-lovebird.png': require('../../assets/birds/swinderns-lovebird.png'),
};

export function resolveSpeciesImage(imageSrc, speciesName = '') {
  if (
    typeof imageSrc === 'string' &&
    (imageSrc.startsWith('http://') || imageSrc.startsWith('https://'))
  ) {
    return { uri: imageSrc };
  }

  const filename = imageSrc
    ? String(imageSrc).split(/[/\\]/).pop()?.toLowerCase().trim()
    : '';

  if (filename && BIRDS[filename]) {
    return BIRDS[filename];
  }

  const key = String(speciesName).toLowerCase();
  const byName = [
    ['lilian', 'lilians-lovebird.png'],
    ['nyasa', 'lilians-lovebird.png'],
    ['peach', 'peach-faced-lovebird.png'],
    ['rosy', 'peach-faced-lovebird.png'],
    ['masked', 'masked-lovebird.png'],
    ['fischer', 'fischers-lovebird.png'],
    ['black-cheek', 'black-cheeked-lovebird.png'],
    ['black cheek', 'black-cheeked-lovebird.png'],
    ['black-wing', 'black-winged-lovebird.png'],
    ['black wing', 'black-winged-lovebird.png'],
    ['red-faced', 'red-faced-lovebird.png'],
    ['red faced', 'red-faced-lovebird.png'],
    ['grey-headed', 'grey-headed-lovebird.png'],
    ['gray-headed', 'grey-headed-lovebird.png'],
    ['swindern', 'swinderns-lovebird.png'],
  ];

  for (const [needle, file] of byName) {
    if (key.includes(needle) && BIRDS[file]) return BIRDS[file];
  }

  return BIRDS['peach-faced-lovebird.png'] || null;
}
