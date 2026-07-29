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

export function resolveSpeciesImage(imageSrc) {
  if (!imageSrc) return null;

  if (typeof imageSrc === 'string' && (imageSrc.startsWith('http://') || imageSrc.startsWith('https://'))) {
    return { uri: imageSrc };
  }

  const filename = String(imageSrc).split('/').pop()?.toLowerCase();
  if (filename && BIRDS[filename]) {
    return BIRDS[filename];
  }

  return null;
}
