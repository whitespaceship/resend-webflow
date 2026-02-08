import express from 'express';
import { Resend } from 'resend';

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Список отписавшихся
const unsubscribed = new Set();

app.post('/webhook', async (req, res) => {
  console.log('Получен webhook:', req.body);

const { payload } = req.body;
const email = payload.data.Email;

  if (!email) {
    return res.status(400).json({ error: 'Email обязателен' });
  }

  // Проверка на отписку
  if (unsubscribed.has(email)) {
    console.log('Пропущен (отписался):', email);
    return res.status(200).json({ skipped: true });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Atomic Bot <welcome@atomicbot.ai>',
      to: email,
      subject: '✅ +1 Atomic Bot! You’re on the early access list.',
      html: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>Atomic Bot — Early Access</title>
  </head>
  <body style="margin:0;padding:0;background:#ffffff;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      You're on the early access list. We'll email you when your invite is ready.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;">
            <tr>
              <td style="padding:0 2px 18px 2px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111827;">
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.85;">
                  ATOMIC BOT
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 2px;">
                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111827;">
                  <div style="font-size:22px;line-height:1.25;margin:0 0 10px 0;font-weight:750;">
                    Early access confirmed
                  </div>
                  <div style="font-size:14px;line-height:1.8;color:#374151;margin:0 0 22px 0;">
                    You're on the early access list.<br />
                    We'll email you as soon as your invite is ready.
                  </div>
                  <div style="font-size:13px;line-height:1.7;color:#6b7280;margin:0 0 6px 0;">
                    Keep in touch:
                  </div>
                  <div style="font-size:14px;line-height:1.7;color:#111827;margin:0 0 28px 0;">
                    <a href="https://x.com/atomicbot_ai" style="color:#111827;text-decoration:underline;">X (Twitter)</a>
                  </div>
                  <div style="border-top:1px solid #e5e7eb;padding-top:14px;font-size:12px;line-height:1.6;color:#9ca3af;">
                    If you didn't request early access, you can ignore this email.
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 2px 0 2px;">
                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#9ca3af;font-size:12px;line-height:1.6;">
                  © Atomic Bot · <br />
                  <a href="${process.env.BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
                  <span style="color:#d1d5db;"> · </span>
                  <a href="http://atomicbot.ai/terms-of-service" style="color:#9ca3af;text-decoration:underline;">Privacy</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
      `
    });

    if (error) {
      console.error('Ошибка Resend:', error);
      return res.status(400).json({ error });
    }

    console.log('Email отправлен:', data);
    return res.status(200).json({ success: true, id: data.id });

  } catch (error) {
    console.error('Ошибка сервера:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Страница отписки
app.get('/unsubscribe', (req, res) => {
  const { email } = req.query;
  
  if (email) {
    unsubscribed.add(email);
    console.log('Отписался:', email);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Unsubscribed</title>
        <style>
          body { font-family: system-ui; max-width: 400px; margin: 100px auto; text-align: center; }
        </style>
      </head>
      <body>
        <h1>✓ Unsubscribed</h1>
        <p>You won't receive more emails from Atomic Bot.</p>
      </body>
      </html>
    `);
  } else {
    res.send('Invalid link');
  }
});

// Privacy страница
app.get('/privacy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Privacy Policy</title>
      <style>
        body { font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
        h1 { font-size: 24px; }
      </style>
    </head>
    <body>
      <h1>Privacy Policy</h1>
      <p>We collect your email to send product updates.</p>
      <p>We don't sell or share your data with third parties.</p>
      <p>Contact: hello@atomicbot.ai</p>
      <p><small>Last updated: February 2025</small></p>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
