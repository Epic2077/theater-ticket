export const receiptUpload = {
  maxSizeBytes: 10 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
} as const;

export function receiptFileError(file: File | null): string | null {
  if (!file) return 'بارگذاری تصویر رسید الزامی است.';
  if (!receiptUpload.allowedMimeTypes.some((type) => type === file.type)) {
    return 'فرمت رسید باید JPG، PNG، WebP یا GIF باشد.';
  }
  if (file.size > receiptUpload.maxSizeBytes) {
    return 'حجم تصویر رسید نباید بیشتر از ۱۰ مگابایت باشد.';
  }
  return null;
}

export function receiptFileExtension(file: File): string {
  const extensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  return extensions[file.type] ?? '.jpg';
}
