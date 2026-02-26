import type { MailLogAttachment } from './mail-log-attachment';
import type { MailTemplate } from './mail-template';

export type MailLog = {
  id?: number;
  mail_template_id?: string;
  user_id?: number;
  subject?: string;
  recipient_email?: string;
  cc?: string;
  bcc?: string;
  content_data?: string;
  mail_template?: MailTemplate;
  mail_log_attachments?: MailLogAttachment[];
  is_sent?: boolean;
  created_at?: string;
  updated_at?: string;
};
