# منصة التسليم الأكاديمية
## كلية العلاج الطبيعي - جامعة قنا

**منصة متكاملة تربط الطلاب بالمسؤولين الأكاديميين. أنشئ المقررات، قسّم المجموعات، وأدر طلبات التسليم بكفاءة عالية.**

---

## المميزات الرئيسية

### واجهة المسؤول (Admin)
- ✅ إنشاء وإدارة المقررات الدراسية
- ✅ إضافة طلاب يدوياً بالرقم القومي
- ✅ إضافة مجموعة طلاب دفعة واحدة (نسخ/لصق من Excel)
- ✅ حذف طالب من المقرر
- ✅ تعديل اسم الطالب
- ✅ إنشاء مجموعات وتقسيم الطلاب
- ✅ إنشاء تسليمات فردية أو جماعية
- ✅ مراجعة التسليمات (قبول / رفض / طلب تعديل)
- ✅ تحميل التسليمات فردياً أو جميعاً
- ✅ إضافة مشرفين (دكاترة) يدوياً
- ✅ تغيير كلمة المرور
- ✅ حذف التسليمات مع إفراغ المساحة

### واجهة المشرف (Supervisor)
- ✅ إنشاء تسليمات للمقررات
- ✅ مراجعة وتحميل التسليمات
- ✅ نفس صلاحيات المسؤول فيما يخص التسليمات

### واجهة الطالب (Student)
- ✅ عرض التسليمات المطلوبة
- ✅ رفع الملفات (PDF, Word, PowerPoint)
- ✅ متابعة حالة التسليم (معلق / مقبول / مرفوض)
- ✅ عرض الدرجات والملاحظات
- ✅ سجل التسليمات لكل مادة
- ✅ إشعارات فورية بالتسليمات الجديدة
- ✅ تغيير كلمة المرور
- ✅ استعادة كلمة المرور عبر البريد الإلكتروني

### الأمان
- 🔒 تسجيل الدخول بالرقم القومي
- 🔒 التحقق من صحة الرقم القومي المصري (14 رقم)
- 🔒 عدم تكرار الرقم القومي
- 🔒 إمكانية إضافة كلمة مرور
- 🔒 إظهار/إخفاء كلمة المرور
- 🔒 مؤشر قوة كلمة المرور
- 🔒 رسائل خطأ بالعربية

---

## البيانات الافتراضية

### المسؤول
- الرقم القومي: `30409302705170`
- كلمة المرور: `Admin`

---

## كيفية الرفع على GitHub

### 1. إنشاء مستودع GitHub
1. ادخل إلى [github.com](https://github.com) وسجل دخولك
2. اضغط على **New Repository** (الزر الأخضر +)
3. اكتب اسم المستودع: `academic-delivery-platform`
4. اختر **Public** أو **Private**
5. اضغط **Create repository**

### 2. رفع الملفات
افتح Terminal أو Command Prompt في مجلد المشروع ونفذ:

```bash
# الانتقال لمجلد المشروع
cd academic-delivery-platform

# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# أول commit
git commit -m "Initial commit - Academic Delivery Platform"

# ربط المستودع (استبدل USERNAME باسم مستخدمك)
git remote add origin https://github.com/USERNAME/academic-delivery-platform.git

# الرفع
git push -u origin main
```

---

## كيفية النشر على Firebase

### 1. إنشاء مشروع Firebase
1. ادخل إلى [firebase.google.com](https://firebase.google.com)
2. اضغط **Go to Console**
3. اضغط **Add project**
4. اكتب اسم المشروع: `academic-delivery-qena`
5. اتبع الخطوات حتى الإنشاء

### 2. تثبيت Firebase CLI
```bash
npm install -g firebase-tools
```

### 3. تسجيل الدخول
```bash
firebase login
```

### 4. تهيئة المشروع
في مجلد المشروع:
```bash
firebase init
```
- اختر **Hosting**
- اختر مشروعك
- اكتب `index.html` كملف index
- اختر **No** للـ SPA (لأننا نستخدم صفحات منفصلة)

### 5. البناء والنشر
```bash
firebase deploy
```

سيعطيك Firebase رابطاً مثل:
```
https://academic-delivery-qena.web.app
```

---

## ربط Firebase بالمنصة (Firestore + Auth + Storage)

### 1. تفعيل Firestore Database
1. في Console اذهب إلى **Firestore Database**
2. اضغط **Create database**
3. اختر **Start in test mode** (للتطوير)
4. اختر المنطقة: `europe-west` أو أقرب منطقة

### 2. تفعيل Authentication
1. اذهب إلى **Authentication**
2. اضغط **Get started**
3. فعّل **Email/Password**

### 3. تفعيل Storage
1. اذهب إلى **Storage**
2. اضغط **Get started**
3. اختر **Start in test mode**

### 4. الحصول على إعدادات Firebase
1. اذهب إلى **Project Settings** (الترس)
2. في تبويب **General** أسفل **Your apps** اضغط **</>** (Web)
3. اكتب اسم التطبيق واضغط **Register app**
4. انسخ كود التهيئة

### 5. تحديث ملف `js/app.js`
استبدل هذا الجزء:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```
بالإعدادات الحقيقية من Firebase.

ثم أزل التعليق عن:
```javascript
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
```

واستبدل `localStorage` بـ Firestore في كائن `DB`.

---

## هيكل المشروع

```
academic-delivery-platform/
├── index.html              # صفحة تسجيل الدخول الرئيسية
├── css/
│   └── style.css           # التنسيقات
├── js/
│   └── app.js              # المنطق والبيانات
├── pages/
│   ├── admin-dashboard.html      # لوحة المسؤول
│   ├── supervisor-dashboard.html # لوحة المشرف
│   ├── student-dashboard.html    # لوحة الطالب
│   ├── forgot-password.html      # استعادة كلمة المرور
│   └── reset-password.html       # إعادة تعيين كلمة المرور
└── README.md
```

---

## المطور

**برمجة وتطوير: عبدالله صبري**

- 📱 واتساب: [01113515751](https://wa.me/201113515751)
- ✈️ تليجرام: [@Dr_Abdallah_Sabry](https://t.me/Dr_Abdallah_Sabry)

---

## ملاحظات هامة

1. **المرحلة الحالية**: المنصة تعمل بالكامل باستخدام `localStorage` كقاعدة بيانات مؤقتة. جميع البيانات تُحفظ في متصفح المستخدم فقط.

2. **للإنتاج**: يجب ربط المنصة بـ Firebase (Firestore + Auth + Storage) لجعل البيانات مشتركة بين جميع المستخدمين.

3. **الملفات**: رفع الملفات حالياً يستخدم `FileReader` + `localStorage`. في الإنتاج، استخدم Firebase Storage.

4. **الإشعارات**: الإشعارات حالياً داخلية فقط. في الإنتاج يمكن إضافة Firebase Cloud Messaging.

5. **البريد الإلكتروني**: استعادة كلمة المرور حالياً وهمية (تعرض الرمز على الشاشة). في الإنتاج استخدم Firebase Auth أو SendGrid.

---

© 2026 - كلية العلاج الطبيعي - جامعة قنا
