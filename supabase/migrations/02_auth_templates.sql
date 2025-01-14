-- 创建邮箱模板
BEGIN;

-- 删除已存在的模板（如果有）
DELETE FROM auth.email_templates WHERE template_name = 'confirmation';

-- 插入新模板
INSERT INTO auth.email_templates (template_name, subject, content_html, content_text)
VALUES
  ('confirmation',
   '确认您的邮箱地址',
   '点击下面的链接确认您的邮箱地址：<br><a href="{{ .ConfirmationURL }}">确认邮箱</a>',
   '点击下面的链接确认您的邮箱地址：\n{{ .ConfirmationURL }}');

COMMIT;