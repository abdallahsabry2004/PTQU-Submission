# دليل ربط المشروع بـ Supabase
## منصة التسليم الأكاديمية - كلية العلاج الطبيعي جامعة قنا

هذا الدليل يشرح **خطوة بخطوة** كيف تربط المنصة بـ **Supabase** (بديل Firebase) **من الموبايل فقط ومن المتصفح فقط** بدون أي برامج.

---

## 🔥 لماذا Supabase؟

- ✅ **مجاني** (500MB قاعدة بيانات + 1GB تخزين + 2GB نقل)
- ✅ **PostgreSQL** حقيقية (أقوى من Firestore)
- ✅ **Auth** مدمج (تسجيل دخول بالبريد + Magic Link + OAuth)
- ✅ **Storage** للملفات
- ✅ **Realtime** (تحديث فوري)
- ✅ **Row Level Security** (حماية البيانات)
- ✅ **API تلقائي** (ما تحتاج تكتب backend)

---

## 📱 الخطوات بالتفصيل

### الخطوة 1: إنشاء حساب Supabase

1. افتح **Chrome/Safari** على الموبايل
2. ادخل على: `supabase.com`
3. اضغط **Start your project** (ابدأ مشروعك)
4. اختر **Sign in with GitHub** (أسهل طريقة)
5. سجل دخولك بـ GitHub (لو عندك حساب) أو أنشئ حساب جديد
6. اضغط **New Project** (مشروع جديد)
7. اختر **Organization** (لو طلب) أو اترك الافتراضي
8. اكتب:
   - **Name**: `academic-delivery-qena`
   - **Database Password**: اكتب كلمة مرور قوية واحفظها
   - **Region**: اختر `Central EU (Frankfurt)` (أقرب لمصر)
9. اضغط **Create new project** واستنى دقيقتين

---

### الخطوة 2: إنشاء الجداول (Tables)

1. بعد ما يفتح المشروع، اضغط على **Table Editor** (محرر الجداول) من القائمة الجانبية
2. هتلاقي جدول `users` جاهز من Supabase Auth
3. هننشئ الجداول الباقية:

#### الطريقة السريعة (SQL):
1. من القائمة الجانبية اضغط **SQL Editor** (محرر SQL)
2. اضغط **New query**
3. انسخ الكود من ملف `supabase-setup.sql` اللي مع المشروع
4. الصقه في المحرر
5. اضغط **Run** (التشغيل)
6. كده كل الجداول اتعملت!

#### الطريقة اليدوية (لو حابب):

**جدول courses:**
1. في Table Editor اضغط **New table**
2. Name: `courses`
3. Columns:
   - `name` (text, not null)
   - `description` (text)
   - `code` (text, not null, unique)
   - `createdBy` (uuid)
   - `isActive` (bool, default true)
4. اضغط **Save**

**جدول courseStudents:**
1. New table → Name: `courseStudents`
2. Columns:
   - `courseId` (uuid)
   - `studentId` (uuid)
   - `nationalId` (text, not null)
   - `name` (text, not null)
   - `email` (text)
   - `addedBy` (uuid)
3. Save

**جدول groups:**
1. New table → Name: `groups`
2. Columns:
   - `courseId` (uuid)
   - `name` (text, not null)
   - `members` (uuid[])
   - `createdBy` (uuid)
3. Save

**جدول assignments:**
1. New table → Name: `assignments`
2. Columns:
   - `courseId` (uuid)
   - `title` (text, not null)
   - `description` (text)
   - `dueDate` (timestamptz)
   - `type` (text, default 'individual')
   - `groupId` (uuid)
   - `createdBy` (uuid)
   - `status` (text, default 'active')
3. Save

**جدول submissions:**
1. New table → Name: `submissions`
2. Columns:
   - `assignmentId` (uuid)
   - `studentId` (uuid)
   - `fileName` (text, not null)
   - `fileSize` (int8)
   - `fileType` (text)
   - `fileUrl` (text)
   - `status` (text, default 'pending')
   - `feedback` (text)
   - `grade` (int4)
   - `reviewedBy` (uuid)
3. Save

**جدول notifications:**
1. New table → Name: `notifications`
2. Columns:
   - `userId` (uuid)
   - `type` (text, not null)
   - `title` (text, not null)
   - `message` (text)
   - `assignmentId` (uuid)
   - `submissionId` (uuid)
   - `read` (bool, default false)
3. Save

**جدول supervisors:**
1. New table → Name: `supervisors`
2. Columns:
   - `userId` (uuid)
   - `nationalId` (text, not null)
   - `name` (text, not null)
   - `email` (text)
   - `createdBy` (uuid)
3. Save

---

### الخطوة 3: تفعيل Row Level Security (RLS)

1. ادخل على **Authentication** → **Policies** (من القائمة الجانبية)
2. هتلاقي كل الجداول
3. اضغط على كل جدول وفعّل **Enable RLS**
4. اضغط **New Policy** → **For full access** → **Apply to all queries** → **Save**

أو من SQL Editor شغل الكود التالي:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE courseStudents ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;
```

---

### الخطوة 4: تفعيل Storage (التخزين)

1. من القائمة الجانبية اضغط **Storage**
2. اضغط **New bucket** (دلو جديد)
3. Name: `submissions`
4. اختر **Public bucket** (عشان الملفات تكون متاحة للتحميل)
5. اضغط **Save**

---

### الخطوة 5: الحصول على مفاتيح API

1. من القائمة الجانبية اضغط **Project Settings** (الترس ⚙️)
2. اضغط **API** (من التبويبات فوق)
3. هتلاقي:
   - **URL**: `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIs...`
4. انسخ الـ URL والـ Anon Key دول

---

### الخطوة 6: تعديل ملف app.js

1. افتح ملف `js/app.js` من تطبيق الملفات على موبايلك
2. دور على السطور دي في أول الملف:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```
3. استبدلهم بالقيم اللي نسختها من Supabase:
```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...';
```
4. احفظ الملف

---

### الخطوة 7: رفع الملفات على GitHub

1. افتح Chrome/Safari
2. ادخل `github.com` وسجل دخولك
3. اذهب لمستودعك `academic-delivery-platform`
4. عدّل ملف `js/app.js`:
   - اضغط على الملف
   - اضغط القلم ✏️ (Edit)
   - استبدل المحتوى بالملف الجديد اللي عدّلته
   - اضغط **Commit changes** (الأخضر)
5. كرر نفس الخطوة لملف `index.html` (عشان فيه CDN جديد)

---

### الخطوة 8: استضافة الموقع (GitHub Pages) ← مجاني!

1. في GitHub، ادخل لمستودع `academic-delivery-platform`
2. اضغط **Settings** (الترس فوق)
3. من القائمة الجانبية اضغط **Pages**
4. في **Source** اختر:
   - Branch: `main`
   - Folder: `/ (root)`
5. اضغط **Save**
6. استنى دقيقتين
7. هيعطيك رابط بالشكل: `https://USERNAME.github.io/academic-delivery-platform`

---

### ✅ كده خلصت!

| الخدمة | الرابط بتاعك |
|--------|-------------|
| **موقعك الرسمي** | `https://USERNAME.github.io/academic-delivery-platform` |
| **لوحة Supabase** | `https://app.supabase.com/project/xxxxxxxxxxxxx` |
| **API Docs** | `https://xxxxxxxxxxxxx.supabase.co/rest/v1/` |

---

## ⚠️ ملاحظات مهمة

### 1. الموقع شغال بدون Supabase؟
نعم! لو ما ربطتش Supabase، الموقع هيشتغل بـ **localStorage** (البيانات في المتصفح فقط). ده كويس للتجربة. لكن لما تربط Supabase، البيانات هتكون مشتركة بين كل الطلاب.

### 2. إضافة Admin يدوياً في Supabase:
لو عايز تضيف المسؤول في قاعدة البيانات:
1. في Table Editor → users
2. اضغط **Insert row**
3. اكتب:
   - nationalId: `30409302705170`
   - name: `المسؤول`
   - email: `admin@qena.edu.eg`
   - password: `QWRtaW4=` (هذا Base64 لـ "Admin")
   - role: `admin`
4. Save

### 3. حجم الملفات:
- Supabase Free: 500MB قاعدة بيانات + 1GB تخزين
- لو حابب تكبر: اضغط **Upgrade** في Supabase

### 4. النسخ الاحتياطي:
- Supabase بيعمل backup تلقائي كل يوم
- ممكن تصدر البيانات من Table Editor → Export

---

## 🔧 لو حابب تستخدم Netlify بدل GitHub Pages

1. ادخل `netlify.com`
2. سجل دخول بـ GitHub
3. اضغط **Add new site** → **Import an existing project**
4. اختر مستودعك من GitHub
5. اضغط **Deploy site**
6. هيعطيك رابط احترافي!

---

## 📞 للمساعدة

**برمجة وتطوير: عبدالله صبري**
- 📱 واتساب: [01113515751](https://wa.me/201113515751)
- ✈️ تليجرام: [@Dr_Abdallah_Sabry](https://t.me/Dr_Abdallah_Sabry)

---

© 2026 - كلية العلاج الطبيعي - جامعة قنا
