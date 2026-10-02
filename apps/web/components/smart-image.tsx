import Image, { type ImageProps } from 'next/image';
import { isSvg } from '@/lib/utils';

/** next/image that skips the optimiser for our SVG illustrations. */
export function SmartImage(props: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : '';
  return <Image {...props} unoptimized={props.unoptimized ?? isSvg(src)} alt={props.alt} />;
}
