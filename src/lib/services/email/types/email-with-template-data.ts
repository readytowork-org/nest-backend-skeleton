import { EmailTemplateSubjectEnum } from './email-template-subject.enum';
import { EmailTemplateEnum } from './email-template.enum';

export type EmailWithTemplateData = {
  to: string;
  subject: EmailTemplateSubjectEnum;
  templateName: EmailTemplateEnum;
  data: Record<string, any>;
};
