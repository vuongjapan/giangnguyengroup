import { useState, ImgHTMLAttributes } from 'react';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallback?: string;
  width: number;
  height: number;
}

/**
 * Image with WebP-first + fallback to original format.
 * Always requires width/height to prevent CLS.
 */
export default function OptimizedImage({ src, fallback, width, height, alt = '', loading = 'lazy', decoding = 'async', ...rest }: Props) {
  const [errored, setErrored] = useState(false);
  const finalSrc = errored && fallback ? fallback : src;
  return (
    <img
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      onError={() => { if (!errored && fallback) setErrored(true); }}
      {...rest}
    />
  );
}
