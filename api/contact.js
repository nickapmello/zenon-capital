// api/contact.js
// Endpoint Serverless na Vercel para envio real de formulário de contato para contato@zenoncapital.com.br

const RECEIVER_EMAIL = process.env.CONTACT_RECEIVER_EMAIL || 'contato@zenoncapital.com.br';

const VALID_ASSUNTOS = {
  'diagnostico': 'Diagnóstico Zenon',
  'diagnostico-zenon': 'Diagnóstico Zenon',
  'reforma-tributaria': 'Adequação à Reforma Tributária',
  'reforma': 'Adequação à Reforma Tributária',
  'fusoes-aquisicoes': 'Fusões e Aquisições',
  'fusoes': 'Fusões e Aquisições',
  'inteligencia-tributaria': 'Inteligência Tributária',
  'credito': 'Linhas de Crédito e Antecipação',
  'credito-antecipacao': 'Linhas de Crédito e Antecipação',
  'mini-banco': 'Mini Banco Proprietário',
  'mercado-capitais': 'Acesso ao Mercado de Capitais',
  'investimento-expansao': 'Investimento e Expansão',
  'outro': 'Outro assunto'
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = async (req, res) => {
  // Configuração de Cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Método não permitido. Utilize o método POST.'
    });
    return;
  }

  // Parse do corpo da requisição (JSON ou URL-encoded)
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // Se não for JSON, tentar querystring
      try {
        const querystring = require('querystring');
        body = querystring.parse(body);
      } catch {
        body = {};
      }
    }
  }
  body = body || {};

  const { nome, email, telefone, assunto, mensagem, _gotcha } = body;

  // Proteção Anti-Spam Honeypot (campo oculto para bots)
  if (_gotcha && String(_gotcha).trim().length > 0) {
    // Retorna 200 silencioso para não alertar o bot, sem disparar e-mail
    res.status(200).json({
      success: true,
      message: 'Solicitação recebida com sucesso.'
    });
    return;
  }

  // Validação dos Campos Obrigatórios no Servidor
  const errors = {};

  const trimmedNome = nome ? String(nome).trim() : '';
  if (!trimmedNome || trimmedNome.length < 2) {
    errors.nome = 'Nome completo é obrigatório (mínimo 2 caracteres).';
  }

  const trimmedEmail = email ? String(email).trim().toLowerCase() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    errors.email = 'E-mail corporativo ou pessoal válido é obrigatório.';
  }

  const cleanPhone = telefone ? String(telefone).replace(/\D/g, '') : '';
  if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
    errors.telefone = 'Telefone para contato com DDD é obrigatório (10 ou 11 dígitos).';
  }

  if (!assunto || !VALID_ASSUNTOS[assunto]) {
    errors.assunto = 'Selecione uma opção de atendimento válida.';
  }

  const trimmedMensagem = mensagem ? String(mensagem).trim() : '';
  if (trimmedMensagem && trimmedMensagem.length < 5) {
    errors.mensagem = 'Se informada, a mensagem deve conter ao menos 5 caracteres.';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({
      success: false,
      error: 'Por favor, corrija os erros nos campos informados.',
      fields: errors
    });
    return;
  }

  const assuntoLabel = VALID_ASSUNTOS[assunto] || assunto;
  const safeNome = escapeHtml(trimmedNome);
  const safeEmail = escapeHtml(trimmedEmail);
  const safeTelefone = escapeHtml(String(telefone).trim());
  const safeMensagem = trimmedMensagem ? escapeHtml(trimmedMensagem) : 'Nenhuma mensagem adicional informada.';
  const dataEnvio = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  // Verificação de Credenciais Disponíveis no Ambiente da Vercel
  const resendApiKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = process.env.SMTP_PORT || 587;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  const hasResend = Boolean(resendApiKey && resendApiKey.trim().length > 0);
  const hasSmtp = Boolean(smtpHost && smtpUser && smtpPass);
  const hasSendGrid = Boolean(sendgridApiKey && sendgridApiKey.trim().length > 0);

  // Se nenhuma credencial estiver configurada, informar com total transparência sem simular sucesso
  if (!hasResend && !hasSmtp && !hasSendGrid) {
    res.status(503).json({
      success: false,
      error: 'Credenciais de envio pendentes no servidor da Vercel.',
      details: `O endpoint foi executado e os dados foram validados, mas nenhuma credencial de envio de e-mail foi configurada nas Variáveis de Ambiente da Vercel para entregar a mensagem em ${RECEIVER_EMAIL}.`,
      pendencias: [
        'Opção 1 (Recomendada): Crie uma chave na Resend (resend.com) e adicione a variável RESEND_API_KEY no painel da Vercel.',
        'Opção 2 (SMTP direto): Adicione SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS nas variáveis da Vercel (ex: dados do e-mail corporativo contato@zenoncapital.com.br).'
      ]
    });
    return;
  }

  // Template HTML do E-mail Formatado na Identidade Zenon Capital
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Novo Contato — Zenon Capital</title>
      <style>
        body { margin: 0; padding: 0; background-color: #F7F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #172D44; }
        .wrapper { max-width: 600px; margin: 30px auto; background: #FFFFFF; border-top: 4px solid #C79662; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border-radius: 4px; overflow: hidden; }
        .header { background: #172D44; padding: 32px 36px; text-align: left; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #EEE9DF; letter-spacing: 0.12em; text-transform: uppercase; }
        .header p { margin: 6px 0 0; font-size: 11px; color: #C79662; letter-spacing: 0.16em; text-transform: uppercase; }
        .content { padding: 36px 36px 28px; }
        .intro { font-size: 14px; line-height: 1.6; color: #333330; margin-bottom: 24px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; border: 1px solid #E5DFD3; }
        .data-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #E5DFD3; }
        .data-table td.label { width: 32%; font-weight: 600; color: #586879; text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.1em; background-color: #FAF8F5; }
        .data-table td.value { color: #172D44; font-weight: 500; }
        .msg-label { font-size: 11px; font-weight: 600; color: #586879; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px; }
        .message-box { background-color: #FAF8F5; border-left: 3px solid #C79662; padding: 16px 20px; font-size: 14px; line-height: 1.6; color: #172D44; white-space: pre-wrap; }
        .footer { background: #FAF8F5; padding: 20px 36px; font-size: 11.5px; color: #586879; border-top: 1px solid #E5DFD3; text-align: center; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>ZENON CAPITAL</h1>
          <p>Notificação de Novo Contato no Website</p>
        </div>
        <div class="content">
          <p class="intro">Você recebeu uma nova solicitação de diagnóstico/contato através do formulário institucional do site:</p>
          <table class="data-table">
            <tr>
              <td class="label">Nome</td>
              <td class="value"><strong>${safeNome}</strong></td>
            </tr>
            <tr>
              <td class="label">E-mail</td>
              <td class="value"><a href="mailto:${safeEmail}" style="color: #172D44; text-decoration: underline;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td class="label">Telefone</td>
              <td class="value"><a href="tel:${cleanPhone}" style="color: #172D44; text-decoration: none;">${safeTelefone}</a></td>
            </tr>
            <tr>
              <td class="label">Interesse</td>
              <td class="value"><span style="color: #6F3C2C; font-weight: 600;">${assuntoLabel}</span></td>
            </tr>
            <tr>
              <td class="label">Data/Hora</td>
              <td class="value">${dataEnvio} (Horário de Brasília)</td>
            </tr>
          </table>
          <p class="msg-label">Mensagem do interessado:</p>
          <div class="message-box">${safeMensagem}</div>
        </div>
        <div class="footer">
          Mensagem transmitida diretamente para ${RECEIVER_EMAIL} · Zenon Capital (zenoncapital.com.br)
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `Novo Contato — Zenon Capital\n\nNome: ${trimmedNome}\nE-mail: ${trimmedEmail}\nTelefone: ${safeTelefone}\nInteresse: ${assuntoLabel}\nData/Hora: ${dataEnvio}\n\nMensagem:\n${trimmedMensagem || 'Nenhuma mensagem informada.'}\n\nEnviado para ${RECEIVER_EMAIL}`;

  // 1. Provedor Resend (Padrão Oficial Recomendado na Vercel)
  if (hasResend) {
    try {
      const fromEmail = process.env.RESEND_FROM || 'Zenon Capital <onboarding@resend.dev>';
      let usedFallback = false;
      let effectiveRecipient = RECEIVER_EMAIL;

      let resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [RECEIVER_EMAIL],
          reply_to: trimmedEmail,
          subject: `[Contato Site] ${assuntoLabel} — ${trimmedNome}`,
          html: emailHtml,
          text: emailText
        })
      });

      let resendData = await resendResponse.json();

      // Tratamento inteligente caso o domínio corporativo ainda não tenha sido verificado no painel da Resend
      if (!resendResponse.ok && resendResponse.status === 403 && resendData.message && resendData.message.includes('only send testing emails to your own email address')) {
        usedFallback = true;
        const match = resendData.message.match(/\(([^)]+)\)/);
        const fallbackEmail = match ? match[1] : 'nicolas.mello@edu.unifil.br';
        effectiveRecipient = fallbackEmail;

        const advisoryNotice = `
          <div style="background-color: #FFF8E7; border-left: 4px solid #C79662; padding: 14px 18px; margin-bottom: 24px; font-family: sans-serif; font-size: 13px; color: #6F3C2C; border-radius: 2px; line-height: 1.5;">
            <strong>Aviso de Configuração Resend:</strong> Esta mensagem foi entregue em <strong>${fallbackEmail}</strong> porque o domínio corporativo <code>zenoncapital.com.br</code> ainda está pendente de verificação DNS em <a href="https://resend.com/domains" target="_blank" style="color: #6F3C2C; font-weight: 700;">resend.com/domains</a>. Assim que verificado, as mensagens serão entregues automaticamente em <code>${RECEIVER_EMAIL}</code>.
          </div>
        `;

        const fallbackHtml = emailHtml.replace('<div class="content">', '<div class="content">' + advisoryNotice);

        resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [fallbackEmail],
            reply_to: trimmedEmail,
            subject: `[Contato Site] ${assuntoLabel} — ${trimmedNome}`,
            html: fallbackHtml,
            text: emailText
          })
        });

        resendData = await resendResponse.json();
      }

      if (!resendResponse.ok) {
        throw new Error(resendData.message || resendData.error || `Erro HTTP ${resendResponse.status} na API do Resend`);
      }

      const reqId = req.headers['x-vercel-id'] || `req_${Date.now()}`;
      res.status(200).json({
        success: true,
        message: 'Sua mensagem foi enviada com sucesso! Nossa equipe entrará em contato em breve.',
        id: resendData.id,
        requestId: reqId,
        provider: 'resend',
        deliveryStatus: resendData.id ? 'sent_to_provider' : 'unknown',
        targetRecipient: RECEIVER_EMAIL,
        actualRecipient: effectiveRecipient,
        mode: usedFallback ? 'sandbox_fallback' : 'production_direct'
      });
      return;
    } catch (err) {
      console.error('[Resend Error]', err);
      res.status(502).json({
        success: false,
        error: 'Falha no serviço Resend ao entregar a mensagem.',
        details: err.message
      });
      return;
    }
  }

  // 2. Provedor SMTP Direto (Nodemailer)
  if (hasSmtp) {
    try {
      const nodemailer = require('nodemailer');
      const isSecure = Number(smtpPort) === 465 || String(process.env.SMTP_SECURE).toLowerCase() === 'true';

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
        }
      });

      const info = await transporter.sendMail({
        from: `"${trimmedNome} via Zenon" <${smtpUser}>`,
        replyTo: trimmedEmail,
        to: RECEIVER_EMAIL,
        subject: `[Contato Site] ${assuntoLabel} — ${trimmedNome}`,
        text: emailText,
        html: emailHtml
      });

      res.status(200).json({
        success: true,
        message: 'Sua mensagem foi enviada com sucesso! Nossa equipe entrará em contato em breve.',
        id: info.messageId
      });
      return;
    } catch (err) {
      console.error('[SMTP Error]', err);
      res.status(502).json({
        success: false,
        error: 'Falha na conexão SMTP ao enviar a mensagem.',
        details: err.message
      });
      return;
    }
  }

  // 3. Provedor SendGrid (Fallback)
  if (hasSendGrid) {
    try {
      const fromEmail = process.env.SENDGRID_FROM || RECEIVER_EMAIL;
      const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: RECEIVER_EMAIL }],
            subject: `[Contato Site] ${assuntoLabel} — ${trimmedNome}`
          }],
          from: { email: fromEmail, name: 'Zenon Capital Website' },
          reply_to: { email: trimmedEmail, name: trimmedNome },
          content: [
            { type: 'text/plain', value: emailText },
            { type: 'text/html', value: emailHtml }
          ]
        })
      });

      if (!sgResponse.ok) {
        const sgErrText = await sgResponse.text();
        throw new Error(sgErrText || `Erro HTTP ${sgResponse.status} na API SendGrid`);
      }

      res.status(200).json({
        success: true,
        message: 'Sua mensagem foi enviada com sucesso! Nossa equipe entrará em contato em breve.'
      });
      return;
    } catch (err) {
      console.error('[SendGrid Error]', err);
      res.status(502).json({
        success: false,
        error: 'Falha no serviço SendGrid ao entregar a mensagem.',
        details: err.message
      });
      return;
    }
  }
};
