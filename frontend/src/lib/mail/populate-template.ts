import { toast } from 'sonner';
import { type MailLog } from '@/04_types/mail/mail-log';

export const populateTemplate = (data: MailLog | null | undefined): string => {
  if (!data || !data.mail_template || !data.content_data) {
    return '';
  }

  let content: Record<string, string>;
  try {
    content = JSON.parse(data.content_data);
  } catch (_error) {
    toast.error('Failed to parse content data');
    return '';
  }

  const template = data.mail_template.content || '';

  return template.replace(
    /{{\s*([^}\s]+)\s*}}/g,
    (_match: string, key: string) => {
      return content[key] ?? '';
    },
  );
};
