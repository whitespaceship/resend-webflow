import express from 'express';
import { Resend } from 'resend';

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

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
    // Добавляем контакт в сегмент waitlist users
    if (AUDIENCE_ID) {
      try {
        const contactResult = await resend.contacts.create({
          email,
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
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
        <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 8px; overflow: hidden; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

                <!-- Logo -->
                <tr>
                    <td style="padding: 48px 40px 32px; text-align: center; background-color: #1a1a1a;">
                        <img src="https://cdn.prod.website-files.com/6981cca3fe2c3f562a2ad751/6988e3fa37946578994d5268_Vector.png" alt="Atomic Bot" style="height: 48px; width: auto; display: block; margin: 0 auto;">
                    </td>
                </tr>

                <!-- Heading -->
                <tr>
                    <td style="padding: 0 40px 24px; text-align: center;">
                        <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff; line-height: 1.3; letter-spacing: -0.02em;">
                            Early access<br>confirmed
                        </h1>
                    </td>
                </tr>

                <!-- Body text -->
                <tr>
                    <td style="padding: 0 40px 16px; text-align: center;">
                        <p style="margin: 0; font-size: 18px; line-height: 1.6; color: #a0a0a0; font-weight: 400;">
                            You're on the early access list.
                        </p>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 0 40px 40px; text-align: center;">
                        <p style="margin: 0; font-size: 18px; line-height: 1.6; color: #a0a0a0; font-weight: 400;">
                            We'll email you as soon as your invite is ready.
                        </p>
                    </td>
                </tr>

                <!-- Social links -->
                <tr>
                    <td style="padding: 32px 40px; text-align: center; border-top: 1px solid #2a2a2a;">
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
                                        <img src="https://cdn.prod.website-files.com/6981cca3fe2c3f562a2ad751/6988e4c62780fca60c8c332a_discord.png" alt="Discord" style="width: 24px; height: 24px; display: block;">
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="padding: 32px 40px; text-align: center; background-color: #141414;">
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
