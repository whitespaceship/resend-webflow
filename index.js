import express from 'express';
import { Resend } from 'resend';

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/webhook', async (req, res) => {
  console.log('Получен webhook:', req.body);

  const { payload } = req.body;
  const email = payload.data.Email;

  if (!email) {
    return res.status(400).json({ error: 'Email обязателен' });
  }

  try {
    // Добавляем контакт в сегмент waitlist users
    if (AUDIENCE_ID) {
      try {
        const contactResult = await resend.contacts.create({
          email,
          unsubscribed: false,
          audienceId: AUDIENCE_ID,
        });
        console.log('Контакт добавлен в audience:', contactResult);
      } catch (contactError) {
        console.error('Ошибка добавления контакта:', contactError);
      }
    }

    const { data, error } = await resend.emails.send({
      from: 'Atomic Bot <welcome@atomicbot.ai>',
      to: email,
      subject: "✅ +1 Atomic Bot! You're on the early access list.",
      html: `
<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <style>
      :root { color-scheme: light dark; }
      @media (prefers-color-scheme: light) {
        .email-bg { background-color: #ffffff !important; }
        .card-bg { background-color: #2C2C2C !important; }
        .footer-bg { background-color: #242424 !important; }
        .border-light { border-color: #3a3a3a !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#2C2C2C;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-bg" style="background-color: #2C2C2C;">
    <tr>
        <td style="padding: 40px 20px;" class="email-bg">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="card-bg" style="max-width: 600px; margin: 0 auto; background-color: #1E1E1E; border-radius: 8px; overflow: hidden; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <tr>
                    <td style="padding: 48px 40px 32px; text-align: center;" class="card-bg">
                        <img src="https://cdn.prod.website-files.com/6981cca3fe2c3f562a2ad751/6988e3fa37946578994d5268_Vector.png" alt="Atomic Bot" style="height: 48px; width: auto; display: block; margin: 0 auto;">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 0 40px 24px; text-align: center;" class="card-bg">
                        <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff; line-height: 1.3; letter-spacing: -0.02em;">
                            Early access<br>confirmed
                        </h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 0 40px 16px; text-align: center;" class="card-bg">
                        <p style="margin: 0; font-size: 18px; line-height: 1.6; color: #a0a0a0; font-weight: 400;">
                            You're on the early access list.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 0 40px 40px; text-align: center;" class="card-bg">
                        <p style="margin: 0; font-size: 18px; line-height: 1.6; color: #a0a0a0; font-weight: 400;">
                            We'll email you as soon as your invite is ready.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 32px 40px; text-align: center; border-top: 1px solid #3a3a3a;" class="card-bg border-light">
                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #a0a0a0;">
                            Join our community
                        </p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                                <td style="padding: 0 12px;">
                                    <a href="https://x.com/atomicbot_ai" style="display: inline-block; text-decoration: none;">
                                        <img src="https://cdn.prod.website-files.com/6981cca3fe2c3f562a2ad751/6988e4c432684aa70c924ff6_twitter.png" alt="X" style="width: 24px; height: 24px; display: block;">
                                    </a>
                                </td>
                                <td style="padding: 0 12px;">
                                    <a href="https://discord.gg/r9SPcKKB" style="display: inline-block; text-decoration: none;">
                                        <img src="https://cdn.prod.website-files.com/6981cca3fe2c3f562a2ad751/6988e4c62780fca60c8c332a_discord.png" alt="Discord" style="width: 30px; height: 30px; display: block;">
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 32px 40px; text-align: center; background-color: #1A1A1A;" class="footer-bg">
                        <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #666666;">
                            If you didn't request early access, you can safely ignore this email.
                        </p>
                        <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #666666;">
                            &copy; 2026 Atomic Bot
                        </p>
                        <p style="margin: 0; font-size: 13px; line-height: 1.6;">
                            <a href="${process.env.BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #666666; text-decoration: underline;">Unsubscribe</a>
                            <span style="color: #333333;"> &bull; </span>
                            <a href="https://atomicbot.ai/terms" style="color: #666666; text-decoration: underline;">Terms of Service</a>
                        </p>
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

// Страница отписки — помечает контакт как unsubscribed в Resend
app.get('/unsubscribe', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.send('Invalid link');
  }

  try {
    if (AUDIENCE_ID) {
      // Находим контакт в audience и помечаем как отписанного
      const contacts = await resend.contacts.list({ audienceId: AUDIENCE_ID });
      const contact = contacts.data?.data?.find(c => c.email === email);

      if (contact) {
        await resend.contacts.update({
          id: contact.id,
          audienceId: AUDIENCE_ID,
          unsubscribed: true,
        });
      }
    }
    console.log('Отписался через Resend:', email);
  } catch (err) {
    console.error('Ошибка отписки:', err);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Unsubscribed</title>
      <style>
        body { font-family: system-ui; max-width: 400px; margin: 100px auto; text-align: center; color: #111; }
      </style>
    </head>
    <body>
      <h1>Unsubscribed</h1>
      <p>You won't receive more emails from Atomic Bot.</p>
    </body>
    </html>
  `);
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
