# ⚠️ R2 Bucket Private URL Issue

## Problem

Images are uploading successfully, but the URLs returned are **private R2 storage URLs** that require authentication:

```
https://tally-sync-data.0cfb799a9b0268891a79d96f3fc930f2.r2.cloudflarestorage.com/uploads/...
```

When accessing these URLs, you get:
```xml
<Error>
  <Code>InvalidArgument</Code>
  <Message>Authorization</Message>
</Error>
```

## Root Cause

**Cloudflare R2 buckets are private by default.** The backend is returning the internal storage URL which requires authentication. Images cannot be displayed publicly.

---

## ✅ Solutions (Choose One)

### **Solution 1: Configure R2 Public Access (Recommended)**

Make the R2 bucket (or specific paths) publicly accessible.

#### In Cloudflare Dashboard:

1. Go to **R2** → Your bucket (`tally-sync-data`)
2. Click **Settings**
3. Under **Public Access**, click **Allow Access**
4. Or create a **Custom Domain** for public access:
   - Click **Connect Domain**
   - Enter your domain (e.g., `cdn.yourdomain.com`)
   - Add DNS records as instructed
   - Images will be accessible at `https://cdn.yourdomain.com/uploads/...`

#### Backend Changes:
Update the upload response to return the public URL:
```typescript
// Instead of R2 storage URL
return {
  url: `https://cdn.yourdomain.com/${key}`  // Public CDN URL
}
```

---

### **Solution 2: Use Signed URLs**

Generate temporary signed URLs with expiration (good for security).

#### Backend Implementation:
```typescript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function getSignedImageUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: 'tally-sync-data',
    Key: key,
  });

  // URL expires in 24 hours
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 86400
  });

  return signedUrl;
}
```

**Cons**: URLs expire, need to regenerate periodically.

---

### **Solution 3: Use Cloudflare Images (Paid Service)**

Switch to Cloudflare Images which provides:
- Automatic public URLs
- Image optimization
- Resizing and transformations
- CDN delivery

---

## 🔧 Quick Fix for Development

For now, the frontend will:
1. ✅ Upload the image
2. ✅ Insert it into the editor
3. ⚠️  Show a warning if using private R2 URL
4. ✅ Log the full URL for debugging

### Console Output:
```
Full upload response: {full object}
Using data.file.url: https://...
⚠️  WARNING: Using private R2 storage URL. Images may not be publicly accessible!
The backend should configure R2 public access or return a CDN URL instead.
Image inserted at index: 5
```

---

## 📋 Recommended Action

**Contact your backend team** to implement one of these solutions:

### Option A: Public R2 Bucket (Easiest)
1. Enable public access on R2 bucket in Cloudflare dashboard
2. Or set up custom domain for bucket
3. Update backend to return public URL instead of storage URL

### Option B: R2 Custom Domain (Best)
1. Set up `cdn.yourdomain.com` pointing to R2 bucket
2. Update backend upload response:
   ```typescript
   return {
     url: `https://cdn.yourdomain.com/${file.key}`
   }
   ```

### Option C: Signed URLs (Most Secure)
1. Implement signed URL generation in backend
2. Return signed URLs in upload response
3. Set appropriate expiration times

---

## 🧪 How to Test Which URL Type You Have

### Check the Console:
After uploading an image, look for:

```
Using data.file.url: https://...
```

**If URL contains** `r2.cloudflarestorage.com`:
- ❌ Private R2 URL (won't work publicly)
- Need to fix backend configuration

**If URL contains** your custom domain:
- ✅ Public CDN URL (will work)
- No changes needed!

---

## 🔍 Current Code Changes

The frontend now:

1. **Tries multiple URL fields**:
   - `data.file.url`
   - `data.url`
   - `data.file.location`

2. **Detects private R2 URLs**:
   - Shows warning toast
   - Logs to console
   - Still inserts image (for testing)

3. **Provides debugging info**:
   - Full response logged
   - URL source identified
   - Helpful error messages

---

## 📝 Backend Fix Example

### Current Backend Code (Problem):
```typescript
// Returns private R2 URL
return {
  data: {
    file: {
      url: uploadResult.Location  // Private R2 URL
    }
  }
}
```

### Fixed Backend Code (Solution):
```typescript
// Returns public CDN URL
return {
  data: {
    url: `https://cdn.yourdomain.com/${file.key}`,  // Public URL
    key: file.key
  }
}
```

Or keep nested structure:
```typescript
return {
  data: {
    file: {
      url: `https://cdn.yourdomain.com/${file.key}`,  // Public URL
      key: file.key
    }
  }
}
```

---

## ✅ Checklist for Backend Team

- [ ] Enable R2 public access OR set up custom domain
- [ ] Update upload response to return public URL
- [ ] Test image URL is publicly accessible (open in browser)
- [ ] Update TypeScript types to match actual response structure
- [ ] Deploy backend changes

---

## 🎯 Expected Final Result

After backend fix:

1. Upload image → Gets public URL
2. Image displays in editor ✅
3. Image is publicly accessible ✅
4. No authorization errors ✅
5. No warning toasts ✅

---

**Current Status**: ⚠️ **Backend Configuration Needed**
**Frontend Status**: ✅ **Ready** (will work once backend returns public URLs)

