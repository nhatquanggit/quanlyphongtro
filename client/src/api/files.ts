import { apiRequest } from './client';

export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
  const form = new FormData();
  form.append('file', file);
  return apiRequest<{ avatarUrl: string }>('/files/upload-avatar', {
    method: 'POST',
    body: form,
  });
};
