'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { SkinAnalysisPhoto } from '@/types/skinAnalysis';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface PhotoGalleryProps {
  photos: SkinAnalysisPhoto[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<SkinAnalysisPhoto | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const openPhoto = (photo: SkinAnalysisPhoto, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
      setCurrentIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    } else {
      const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Photos ({photos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <ThumbnailTile
                key={photo.key}
                photo={photo}
                index={index}
                onClick={() => openPhoto(photo, index)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={closePhoto}>
        <DialogContent className="max-w-4xl">
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPhoto.url}
                  alt={`Photo ${currentIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Photo {currentIndex + 1} of {photos.length}
                  <br />
                  <span className="text-xs">
                    Uploaded: {formatDate(selectedPhoto.uploadedAt)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigatePhoto('prev')}
                    disabled={photos.length === 1}
                  >
                    <Icons.chevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigatePhoto('next')}
                    disabled={photos.length === 1}
                  >
                    Next
                    <Icons.chevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ThumbnailTile({
  photo,
  index,
  onClick,
}: {
  photo: SkinAnalysisPhoto;
  index: number;
  onClick: () => void;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [info, setInfo] = useState<string>('');

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    if (el.complete && el.naturalWidth > 0) {
      setStatus('loaded');
      setInfo(`${el.naturalWidth}x${el.naturalHeight}`);
    }
  }, [photo.url]);

  return (
    <div
      role="button"
      tabIndex={0}
      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer hover:border-blue-500 transition-colors group"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={photo.url}
        alt={`Photo ${index + 1}`}
        width={480}
        height={640}
        className="absolute inset-0 w-full h-full object-cover"
        onLoad={(e) => {
          const t = e.currentTarget;
          setStatus('loaded');
          setInfo(`${t.naturalWidth}x${t.naturalHeight}`);
        }}
        onError={() => {
          setStatus('error');
          setInfo('error');
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url("${photo.url}")` }}
      />
      <div className="absolute top-1 left-1 z-10 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white pointer-events-none">
        {status === 'loaded' ? `OK ${info}` : status === 'error' ? 'ERR' : 'LOAD…'}
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center pointer-events-none">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white rounded-full p-2">
            <Icons.search className="h-5 w-5 text-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
