'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SkinAnalysisPhoto } from '@/types/skinAnalysis';
import { Icons } from '@/components/icons';

interface PhotoGalleryProps {
  photos: SkinAnalysisPhoto[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (!photos || photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No photos uploaded</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Photos ({photos.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <ThumbnailTile key={photo.key} photo={photo} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ThumbnailTile({
  photo,
  index,
}: {
  photo: SkinAnalysisPhoto;
  index: number;
}) {
  return (
    <a
      href={photo.url}
      target="_blank"
      rel="noopener noreferrer"
      title="Open full-size image in a new tab"
      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer hover:border-blue-500 transition-colors group block"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={`Photo ${index + 1}`}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Hover overlay — Tailwind v4 opacity syntax (bg-black/0 → /20).
          The old bg-opacity-* utilities are removed in v4 and render as
          solid opaque black, which hid every thumbnail. */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white rounded-full p-2">
            <Icons.search className="h-5 w-5 text-gray-700" />
          </div>
        </div>
      </div>
    </a>
  );
}
