// server.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = 3000;

// Setup __dirname with ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.static(__dirname));
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// OpenAI setup
const openai = new OpenAI({   apiKey:OPENAI_API_KEY
});

// GET: الكود الحالي للقائمة
app.get('/api/menu/snippet', (req, res) => {
  const filePath = path.join(__dirname, 'menu-snippet.html');
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    res.send(content);
  } else {
    res.send('');
  }
});

// POST: توليد قائمة جديدة بناءً على برومبت + الكود القديم
app.post('/api/generate-menu', async (req, res) => {
  const { prompt } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    const generatedHTML = completion.choices[0].message.content.trim();

    // حفظ النتيجة
    const filePath = path.join(__dirname, 'menu-snippet.html');
    fs.writeFileSync(filePath, generatedHTML, 'utf8');

    res.send(generatedHTML);
  } catch (err) {
    console.error('❌ GPT Error:', err.message);
    res.status(500).send('Erreur lors de la génération du menu.');
  }
});

// POST: حذف مجموعة كاملة بناءً على اسم العنوان الكبير
app.post('/api/menu/delete-by-name', (req, res) => {
  const { groupName } = req.body;
  const filePath = path.join(__dirname, 'menu-snippet.html');
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Fichier introuvable.');
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // حذف أول div.sidebar-card يحتوي على groupName
  const regex = new RegExp(
    `<div class=\"sidebar-card\"[\s\S]*?<div class=\"section-title\">[\s\S]*?${groupName}[\s\S]*?<\/ul>\s*<\/div>`,
    'i'
  );

  const newContent = content.replace(regex, '').trim();

  fs.writeFileSync(filePath, newContent, 'utf8');

  res.send({ success: true, message: `Groupe "${groupName}" supprimé.` });
});

// Serve admin and doctorant pages
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});
app.get('/doctorant', (req, res) => {
  res.sendFile(path.join(__dirname, 'doctorant.html'));
});



//hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh






app.post('/api/generate-services', async (req, res) => {
  const { prompt } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const generatedHTML = completion.choices[0].message.content.trim();
    const filePath = path.join(__dirname, 'student','services-snippet.html');
    fs.writeFileSync(filePath, generatedHTML, 'utf8');

    res.send(generatedHTML);
  } catch (err) {
    console.error('❌ GPT Error:', err.message);
    res.status(500).send('Erreur lors de la génération des services.');
  }
});


app.get('/api/services/snippet', (req, res) => {
  const filePath = path.join(__dirname, 'student','services-snippet.html');
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    res.send(content);
  } else {
    res.send('');
  }
});

app.get('/services-admin', (req, res) => {
  res.sendFile(path.join(__dirname,'student', 'services-admin.html'));
});










// 1) تقديم ملفات ATS من المجلد ats
app.use('/ats', express.static(path.join(__dirname, 'ats')));

// 2) GET: جلب محتوى القائمة الإدارية من ats/ats-menu-snippet.html
app.get('/api/ats-menu/snippet', (req, res) => {
  const filePath = path.join(__dirname, 'ats', 'ats-menu-snippet.html');
  if (fs.existsSync(filePath)) {
    res.send(fs.readFileSync(filePath, 'utf8'));
  } else {
    res.send('');
  }
});

// 3) POST: توليد أو تحديث القائمة عبر GPT إلى ats/ats-menu-snippet.html
app.post('/api/generate-ats-menu', async (req, res) => {
  const { prompt } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });
    const html = completion.choices[0].message.content.trim();
    const filePath = path.join(__dirname, 'ats', 'ats-menu-snippet.html');
    fs.writeFileSync(filePath, html, 'utf8');
    res.send(html);
  } catch (err) {
    console.error('❌ GPT Error:', err);
    res.status(500).send('Erreur lors de la génération du menu ATS.');
  }
});

// 4) مسار للوصول إلى صفحة الإدارة مباشرة
app.get('/ats/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'ats', 'ats-menu-admin.html'));
});

// Start server
app.listen(port, () => {
  console.log(`✅ Serveur en marche sur http://localhost:${port}`);
});
   