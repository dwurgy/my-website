import type { ImageMetadata } from 'astro';
import lodge from '../../assets/photos/lodge-dusk.jpg';
import pavilion from '../../assets/photos/pavilion-peak.jpg';
import firs from '../../assets/photos/firs-house.jpg';
import moon from '../../assets/photos/lake-dusk-moon.jpg';
import flowers from '../../assets/photos/flowers-table.jpg';
import wheelbarrow from '../../assets/photos/wheelbarrow-driveway.jpg';
import iceCream from '../../assets/photos/ice-cream.jpg';

// David's photographs for the camera viewer, in order. Metadata is already
// stripped from the originals, and the image pipeline writes none back.
export interface Photo {
  src: ImageMetadata;
  alt: string;
}

export const photos: Photo[] = [
  { src: lodge, alt: 'A glass-fronted lodge under tall pines at dusk.' },
  { src: flowers, alt: 'Orange lilies in a red vase, lit by low sun beside a dark wooden chair.' },
  { src: pavilion, alt: 'A timber pavilion framing a mountain peak beyond a pool.' },
  { src: wheelbarrow, alt: 'A small boy in a trucker cap shovelling dirt into a red wheelbarrow in a driveway.' },
  { src: firs, alt: 'Two old firs in front of a house and a dark car.' },
  { src: iceCream, alt: 'A smiling boy holding an ice cream cone at a red table by the window.' },
  { src: moon, alt: 'Mountains at dusk over still water, a sliver of moon above.' },
];
