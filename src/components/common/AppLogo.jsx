import React from 'react';
import logoPng from '../../../icons/launchericon-192x192.png';

export default function AppLogo({ size = 32, rounded = 'rounded-lg', className = '' }) {
  return (
    <img
      src={logoPng}
      alt="ToolStack logo"
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      className={`${rounded} object-cover ${className}`}
    />
  );
}
