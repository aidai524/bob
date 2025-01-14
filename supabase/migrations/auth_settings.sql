-- 更新认证设置
ALTER SYSTEM SET auth.email.enable_signup = true;
ALTER SYSTEM SET auth.email.double_confirm_changes = false;
ALTER SYSTEM SET auth.email.enable_confirmations = false;

-- 创建邮箱模板（如果需要后续启用邮箱验证）
INSERT INTO auth.email_templates (template_name, subject, content_html, content_text)
VALUES
  ('confirmation',
   '确认您的邮箱地址',
   '点击下面的链接确认您的邮箱地址：<br><a href="{{ .ConfirmationURL }}">确认邮箱</a>',
   '点击下面的链接确认您的邮箱地址：\n{{ .ConfirmationURL }}'); 