# אינסטלציה בקליק - דף נחיתה

דף נחיתה בעברית לעסק אינסטלציה, עם כפתורי התקשרות/WhatsApp וטופס יצירת קשר ששולח מייל.

## הרצה מקומית (על המחשב שלך)

1. ודא שמותקן Node.js (גרסה 18 ומעלה) - הורדה מ- https://nodejs.org
2. פתח טרמינל בתיקיית הפרויקט והרץ:
   ```
   npm install
   ```
3. צור קובץ בשם `.env` (העתק מ-`.env.example`) ומלא את הפרטים - ראה הסבר למטה איך ליצור סיסמת אפליקציה של Gmail.
4. הרץ את השרת:
   ```
   npm start
   ```
5. פתח דפדפן בכתובת: http://localhost:3000

אם לא תמלא פרטי Gmail ב-.env, האתר עדיין יעבוד - הטופס פשוט ידפיס את הפנייה ללוג של השרת במקום לשלוח מייל. שימושי לבדיקות.

## איך יוצרים סיסמת אפליקציה ל-Gmail (חד פעמי)

Gmail לא מאפשר להשתמש בסיסמה הרגילה שלך בקוד - צריך "סיסמת אפליקציה" ייעודית:

1. היכנס לחשבון Google שלך → Security (אבטחה)
2. ודא ש"אימות דו-שלבי" (2-Step Verification) מופעל - חובה כדי ליצור סיסמת אפליקציה
3. חפש "App Passwords" (סיסמאות אפליקציה) - קישור ישיר: https://myaccount.google.com/apppasswords
4. צור סיסמה חדשה (בחר "Other" ותן שם כמו "plumbing-site")
5. Google ייתן לך קוד בן 16 תווים - העתק אותו ל-`GMAIL_APP_PASSWORD` בקובץ `.env`

## העלאה ל-GitHub

```
git init
git add .
git commit -m "דף נחיתה ראשוני"
git branch -M main
git remote add origin <כתובת הריפו שלך ב-GitHub>
git push -u origin main
```

קובץ `.env` לא יעלה (הוא ב-`.gitignore`) - זה בכוונה, כדי לא לחשוף סיסמאות.

## פריסה לאוויר (Deployment) עם Render

GitHub Pages מתאים רק לאתרים סטטיים, ולא יכול להריץ את השרת ששולח מיילים. לכן מומלץ Render (יש חבילה חינמית):

1. היכנס ל- https://render.com והתחבר עם חשבון GitHub שלך
2. לחץ "New +" → "Web Service" ובחר את הריפו שיצרת
3. הגדרות:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. בלשונית "Environment", הוסף את אותם משתנים שיש ב-.env שלך:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `NOTIFY_EMAIL`
5. לחץ "Create Web Service" - Render יבנה ויפרוס את האתר, ותקבל כתובת אינטרנט פעילה
6. מעכשיו, כל `git push` ל-GitHub יעדכן אוטומטית את האתר החי

## מבנה הקבצים

```
plumbing-landing/
├── package.json       - רשימת החבילות והוראות הפעלה
├── server.js           - שרת Express: מגיש את הדף ומטפל בטופס
├── .env.example         - תבנית למשתני הסביבה (העתק בשם .env)
├── .gitignore             - קבצים שלא יעלו ל-GitHub
└── public/
    ├── index.html            - הדף עצמו
    ├── style.css              - עיצוב
    └── script.js               - שליחת הטופס
```

## דברים לעדכן לפני שהאתר עולה לאוויר

- [ ] להחליף את הביקורות בביקורות אמיתיות (בקובץ `public/index.html`, החלק `reviews`)
- [ ] לוודא שמספר הטלפון/וואטסאפ נכון בכל מקום בדף
- [ ] לבדוק ששליחת המייל עובדת (שלח פנייה בדיקה מהטופס)
- [ ] לשקול לרשום דומיין (למשל instalatsia-beklik.co.il) ולחבר אותו ל-Render
