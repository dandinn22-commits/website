// server.js
// שרת Express פשוט: מגיש את דף הנחיתה, ומטפל בטופס יצירת הקשר ע"י שליחת מייל.

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// מאפשר לשרת לקרוא JSON שנשלח מהטופס בדף
app.use(express.json());

// מגיש את כל הקבצים בתיקיית public (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname, 'public')));

// הגדרת שולח המייל דרך Gmail, באמצעות פרטים סודיים מקובץ .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// נקודת קצה שהטופס שולח אליה את הפרטים
app.post('/api/contact', async (req, res) => {
  const { name, phone } = req.body;

  // ולידציה בסיסית - שם וטלפון חייבים להיות קיימים ותקינים
  if (!name || !phone || typeof name !== 'string' || typeof phone !== 'string') {
    return res.status(400).json({ ok: false, message: 'נא למלא שם וטלפון תקינים.' });
  }

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();

  // בדיקת טלפון ישראלי בסיסית (9-10 ספרות, יכול להתחיל ב-0)
  const phoneRegex = /^0\d{8,9}$/;
  if (trimmedName.length < 2 || !phoneRegex.test(trimmedPhone)) {
    return res.status(400).json({ ok: false, message: 'נא לבדוק שהשם והטלפון תקינים.' });
  }

  // אם לא הוגדרו פרטי מייל, לא נופלים - רק מדפיסים ללוג (שימושי לבדיקות מקומיות)
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('פנייה חדשה (מייל לא מוגדר):', trimmedName, trimmedPhone);
    return res.json({ ok: true, message: 'הפנייה נשלחה בהצלחה! ניצור איתך קשר בקרוב.' });
  }

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.NOTIFY_EMAIL || process.env.GMAIL_USER,
      subject: 'פנייה חדשה מדף הנחיתה - אינסטלציה בקליק',
      text: `התקבלה פנייה חדשה:\n\nשם: ${trimmedName}\nטלפון: ${trimmedPhone}`,
    });

    res.json({ ok: true, message: 'הפנייה נשלחה בהצלחה! ניצור איתך קשר בקרוב.' });
  } catch (err) {
    console.error('שגיאה בשליחת מייל:', err);
    res.status(500).json({ ok: false, message: 'משהו השתבש בשליחה. נסה שוב או התקשר אלינו ישירות.' });
  }
});

app.listen(PORT, () => {
  console.log(`השרת פועל על פורט ${PORT}`);
});
