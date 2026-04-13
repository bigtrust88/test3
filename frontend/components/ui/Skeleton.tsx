/**
 * Skeleton 컴포넌트
 * 로딩 상태 표시
 */

import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  count?: number;
  circle?: boolean;
  className?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width = '100%', height = '20px', count = 1, circle = false, className }, ref) => {
    const skeletons = Array.from({ length: count });

    return (
      <>
        {skeletons.map((_, idx) => (
          <div
            key={idx}
            ref={idx === 0 ? ref : undefined}
            className={clsx(
              'bg-gray-200 dark:bg-gray-700 animate-pulse',
              circle && 'rounded-full',
              !circle && 'rounded-lg',
              className,
            )}
            style={{
              width: typeof width === 'number' ? `${width}px` : width,
              height: typeof height === 'number' ? `${height}px` : height,
              marginBottom: idx < skeletons.length - 1 ? '12px' : '0',
            }}
          />
        ))}
      </>
    );
  },
);

Skeleton.displayName = 'Skeleton';
