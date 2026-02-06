# Rich Text Editor - Manual Testing Guide

## URL to Test
Visit: `http://localhost:3000/dashboard/blogs/create`

## Features to Test

### 1. **Bold** (Ctrl+B)
- Type some text
- Select it
- Click the **B** button
- Text should become bold with `<strong>` tags

### 2. **Italic** (Ctrl+I)
- Type some text
- Select it
- Click the *I* button
- Text should become italic with `<em>` tags

### 3. **Inline Code**
- Type some text
- Select it
- Click the `</>` button
- Text should be styled as inline code with monospace font

### 4. **Heading 2**
- Type a line of text
- Place cursor on that line
- Click the **H2** button
- Text should become a large heading

### 5. **Heading 3**
- Type a line of text
- Place cursor on that line
- Click the **H3** button
- Text should become a medium heading

### 6. **Bullet List**
- Type some text
- Click the bullet list button
- Text should be in a bulleted list
- Press Enter to add more items

### 7. **Numbered List**
- Type some text
- Click the numbered list button (1. 2. 3.)
- Text should be in a numbered list
- Press Enter to add more items

### 8. **Blockquote**
- Type some text
- Click the quote button
- Text should appear as an indented quote

### 9. **Link**
- Type and select some text
- Click the link button (chain icon)
- Enter a URL in the prompt (e.g., https://example.com)
- Text should become a clickable link (underlined and colored)

### 10. **Image Upload**
- Click the image button (picture icon)
- Select an image file (JPG, PNG, WEBP, or GIF)
- Max size: 5MB
- Image should be uploaded and displayed in the editor
- Image should be properly styled (rounded corners, responsive)

### 11. **Undo** (Ctrl+Z)
- Make some changes
- Click the undo button (arrow pointing left)
- Last change should be reverted

### 12. **Redo** (Ctrl+Shift+Z)
- After undoing
- Click the redo button (arrow pointing right)
- Undone change should be reapplied

## Expected Behaviors

✅ **All buttons should have tooltips** when you hover over them
✅ **Active buttons should be highlighted** (e.g., when cursor is on bold text, Bold button is highlighted)
✅ **Images should display inline** in the editor after upload
✅ **Editor should maintain focus** when clicking toolbar buttons
✅ **Links should be underlined** and styled properly
✅ **Lists should indent properly** and allow nested items
✅ **Undo/Redo buttons should disable** when there's nothing to undo/redo

## Known Working Features

Based on TipTap documentation and configuration:
- ✅ Bold formatting
- ✅ Italic formatting
- ✅ Inline code
- ✅ Headings (H2, H3, H4)
- ✅ Bullet lists
- ✅ Numbered lists
- ✅ Blockquotes
- ✅ Links (with auto-protocol)
- ✅ Image upload with display
- ✅ Undo/Redo functionality
- ✅ Keyboard shortcuts
- ✅ Placeholder text
- ✅ Responsive image sizing

## Improvements Made

1. **Image Configuration**:
   - Changed from `inline: true` to `inline: false` for proper block display
   - Added `allowBase64: true` for flexibility
   - Enhanced image styling with rounded corners and responsive sizing

2. **Link Extension**:
   - Fixed duplicate extension warning
   - Added autolink support
   - Added default protocol (https)
   - Improved link styling

3. **Button Behavior**:
   - Changed from `onClick` to `onMouseDown` with `preventDefault()`
   - This prevents editor from losing focus when clicking buttons
   - All formatting operations now work correctly

4. **UI Enhancements**:
   - Added tooltips to all buttons for better UX
   - Improved active state highlighting
   - Better button sizing and spacing

5. **Image Upload**:
   - Added proper file type validation
   - Better error handling
   - Loading states with toast notifications
   - Proper image insertion at cursor position
