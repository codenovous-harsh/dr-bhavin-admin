import React from 'react';

interface HeadingProps {
  title: string;
  description?: string;
}

/**
 * The page title.
 *
 * Renders `<h1>` — pages across the app used `<h2>` as their top-level heading
 * with no `<h1>` anywhere, at 13 different size/weight combinations. This is the
 * one canonical treatment; don't hand-roll page titles alongside it.
 */
export const Heading: React.FC<HeadingProps> = ({
  title,
  description
}) => {
  if (!title && !description) return null;

  return (
    <div className='min-w-0 space-y-1'>
      <div className='flex items-center gap-2'>
        <h1 className='truncate text-2xl font-semibold tracking-tight'>
          {title}
        </h1>
      </div>
      {description && (
        <p className='text-muted-foreground text-sm'>{description}</p>
      )}
    </div>
  );
};
