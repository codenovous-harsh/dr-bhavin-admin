'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import 'react-quill-new/dist/quill.snow.css';
import './rich-text-editor.css';
import { toast } from 'sonner';
import { blogService } from '@/services/blog.service';

// Dynamic import to avoid SSR issues with Quill
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg p-4 min-h-[300px] animate-pulse bg-muted/20">
      <div className="h-8 bg-muted rounded mb-4"></div>
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </div>
  ),
});

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write your content here...',
  className,
  editable = true
}: RichTextEditorProps) {
  const quillRef = useRef<any>(null);
  const reactQuillRef = useRef<any>(null);

  // Custom image upload handler
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/png,image/webp,image/gif');

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      // Get Quill editor instance BEFORE upload
      const quill = reactQuillRef.current?.getEditor?.() || quillRef.current;
      if (!quill) {
        toast.error('Editor not ready');
        return;
      }

      // Save cursor position BEFORE upload
      const range = quill.getSelection(true);
      if (!range) {
        toast.error('Please click in the editor first');
        return;
      }

      try {
        toast.loading('Uploading image...', { id: 'image-upload' });

        // Upload the image
        const uploadResponse = await blogService.uploadImage(file);

        console.log('Full upload response:', uploadResponse);

        // Extract URL from response
        const imageUrl = uploadResponse.data?.url;
        console.log('Using data.url:', imageUrl);

        // Verify URL is valid
        if (!imageUrl || typeof imageUrl !== 'string') {
          console.error('Could not extract URL from response:', uploadResponse);
          throw new Error('Invalid image URL received from server. Check backend configuration.');
        }

        // Insert image at the saved cursor position
        quill.insertEmbed(range.index, 'image', imageUrl, 'user');

        // Move cursor to next line
        quill.setSelection(range.index + 1, 'silent');

        console.log('Image inserted at index:', range.index);
        console.log('Image URL:', imageUrl);

        toast.success('Image uploaded successfully', { id: 'image-upload' });
      } catch (error: any) {
        console.error('Image upload error:', error);
        toast.error(error?.message || 'Failed to upload image', { id: 'image-upload' });
      }
    };

    input.click();
  }, []);

  // Quill modules configuration
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          ['bold', 'italic', 'underline'],
          ['code'],
          [{ header: [2, 3, false] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote'],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler]
  );

  // Quill formats configuration
  const formats = [
    'bold',
    'italic',
    'underline',
    'code',
    'header',
    'list',
    'blockquote',
    'link',
    'image',
  ];

  // Callback ref to capture the ReactQuill instance
  const setQuillRef = useCallback((ref: any) => {
    reactQuillRef.current = ref;
    if (ref) {
      quillRef.current = ref.getEditor();
    }
  }, []);

  return (
    <div className={cn('rich-text-editor-wrapper', className)}>
      <ReactQuill
        ref={setQuillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={!editable}
        className={cn(
          'bg-background',
          !editable && 'pointer-events-none opacity-70'
        )}
      />
    </div>
  );
}
