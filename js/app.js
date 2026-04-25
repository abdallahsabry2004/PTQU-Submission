
// ============================================
// منصة التسليم الأكاديمية - كلية العلاج الطبيعي جامعة قنا
// Programming & Development: Abdullah Sabry
// Backend: Supabase (PostgreSQL + Auth + Storage)
// ============================================

// ⬇⬇⬇ ضع بيانات Supabase هنا ⬇⬇⬇
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
// ⬆⬆⬆ ضع بيانات Supabase هنا ⬆⬆⬆

// Initialize Supabase client (loaded from CDN)
let supabase = null;
if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Fallback to localStorage if Supabase not connected (for testing)
const USE_LOCAL = !supabase || SUPABASE_URL.includes('YOUR_PROJECT');

// ============================================
// LOCAL STORAGE FALLBACK (Temporary until Supabase connected)
// ============================================
const LocalDB = {
    users: JSON.parse(localStorage.getItem('users')) || [{
        id: 'admin1', nationalId: '30409302705170', name: 'المسؤول',
        email: 'admin@qena.edu.eg', password: btoa('Admin'),
        role: 'admin', createdAt: new Date().toISOString()
    }],
    courses: JSON.parse(localStorage.getItem('courses')) || [],
    courseStudents: JSON.parse(localStorage.getItem('courseStudents')) || [],
    groups: JSON.parse(localStorage.getItem('groups')) || [],
    assignments: JSON.parse(localStorage.getItem('assignments')) || [],
    submissions: JSON.parse(localStorage.getItem('submissions')) || [],
    notifications: JSON.parse(localStorage.getItem('notifications')) || [],
    supervisors: JSON.parse(localStorage.getItem('supervisors')) || [],
    save() {
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('courses', JSON.stringify(this.courses));
        localStorage.setItem('courseStudents', JSON.stringify(this.courseStudents));
        localStorage.setItem('groups', JSON.stringify(this.groups));
        localStorage.setItem('assignments', JSON.stringify(this.assignments));
        localStorage.setItem('submissions', JSON.stringify(this.submissions));
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
        localStorage.setItem('supervisors', JSON.stringify(this.supervisors));
    },
    genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
};

let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// ============================================
// SUPABASE DATABASE FUNCTIONS
// ============================================
const DB = {
    async query(table, action, data) {
        if (USE_LOCAL) {
            // Fallback to localStorage
            return this.localQuery(table, action, data);
        }
        try {
            switch (action) {
                case 'select':
                    const { data: res, error } = await supabase.from(table).select(data.columns || '*').eq(data.column || 'id', data.value);
                    if (error) throw error;
                    return { success: true, data: res };
                case 'insert':
                    const { data: ins, error: errIns } = await supabase.from(table).insert(data).select();
                    if (errIns) throw errIns;
                    return { success: true, data: ins[0] };
                case 'update':
                    const { data: upd, error: errUpd } = await supabase.from(table).update(data.updates).eq('id', data.id).select();
                    if (errUpd) throw errUpd;
                    return { success: true, data: upd[0] };
                case 'delete':
                    const { error: errDel } = await supabase.from(table).delete().eq('id', data.id);
                    if (errDel) throw errDel;
                    return { success: true };
                default:
                    return { success: false, msg: 'Unknown action' };
            }
        } catch (e) {
            console.error('Supabase error:', e);
            return { success: false, msg: e.message || 'Database error' };
        }
    },

    localQuery(table, action, data) {
        switch (action) {
            case 'select':
                let result = LocalDB[table] || [];
                if (data.column && data.value !== undefined) {
                    result = result.filter(x => x[data.column] === data.value);
                }
                return { success: true, data: result };
            case 'insert':
                const newItem = { id: LocalDB.genId(), ...data, createdAt: new Date().toISOString() };
                if (!LocalDB[table]) LocalDB[table] = [];
                LocalDB[table].push(newItem);
                LocalDB.save();
                return { success: true, data: newItem };
            case 'update':
                const idx = (LocalDB[table] || []).findIndex(x => x.id === data.id);
                if (idx === -1) return { success: false, msg: 'Not found' };
                Object.assign(LocalDB[table][idx], data.updates);
                LocalDB.save();
                return { success: true, data: LocalDB[table][idx] };
            case 'delete':
                LocalDB[table] = (LocalDB[table] || []).filter(x => x.id !== data.id);
                LocalDB.save();
                return { success: true };
            default:
                return { success: false, msg: 'Unknown action' };
        }
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const Utils = {
    toast(msg, type = 'success') {
        let c = document.querySelector('.toast-container');
        if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
        const t = document.createElement('div'); t.className = 'toast ' + type;
        const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
        t.innerHTML = '<span style="font-size:1.2rem">' + icons[type] + '</span><span>' + msg + '</span>';
        c.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-30px)'; setTimeout(() => t.remove(), 300); }, 4000);
    },
    showAlert(id, msg, type = 'danger') {
        const c = document.getElementById(id); if (!c) return;
        const a = document.createElement('div'); a.className = 'alert alert-' + type;
        a.innerHTML = '<i class="fas fa-' + (type == 'success' ? 'check-circle' : type == 'warning' ? 'exclamation-triangle' : 'exclamation-circle') + '"></i><span>' + msg + '</span>';
        c.innerHTML = ''; c.appendChild(a);
        setTimeout(() => { a.style.opacity = '0'; setTimeout(() => a.remove(), 300); }, 5000);
    },
    fmtDate(d) { return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }); },
    fmtSize(b) { if (!b) return '0 Bytes'; const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(b) / Math.log(k)); return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + s[i]; },
    valNatId(id) {
        if (!id || id.length !== 14) return { valid: false, msg: 'الرقم القومي يجب أن يكون 14 رقماً' };
        if (!/^\d{14}$/.test(id)) return { valid: false, msg: 'الرقم القومي يجب أن يحتوي على أرقام فقط' };
        const c = id[0]; if (c !== '2' && c !== '3') return { valid: false, msg: 'الرقم القومي غير صالح' };
        const y = (c === '2' ? '19' : '20') + id.substring(1, 3), m = id.substring(3, 5), d = id.substring(5, 7);
        const bd = new Date(y + '-' + m + '-' + d); if (isNaN(bd.getTime()) || bd > new Date()) return { valid: false, msg: 'تاريخ الميلاد غير صالح' };
        const g = parseInt(id.substring(7, 9)); if (g < 1 || g > 35) return { valid: false, msg: 'كود المحافظة غير صالح' };
        return { valid: true, msg: 'صالح' };
    },
    pwdStrength(p) {
        let s = 0; if (p.length >= 8) s++; if (p.length >= 12) s++; if (/[A-Z]/.test(p)) s++; if (/[a-z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
        const lv = [{ t: 'ضعيف جداً', c: '#c0392b', w: '16%' }, { t: 'ضعيف', c: '#e74c3c', w: '33%' }, { t: 'متوسط', c: '#f39c12', w: '50%' }, { t: 'جيد', c: '#f1c40f', w: '66%' }, { t: 'قوي', c: '#27ae60', w: '83%' }, { t: 'قوي جداً', c: '#229954', w: '100%' }];
        return lv[Math.min(s, 5)];
    },
    genPwd(l = 12) { const cs = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'; let p = ''; for (let i = 0; i < l; i++) p += cs.charAt(Math.floor(Math.random() * cs.length)); return p; },
    confirm(msg, cb) {
        const o = document.createElement('div'); o.className = 'modal-overlay active'; o.style.zIndex = '5000';
        o.innerHTML = '<div class="modal" style="max-width:400px"><div class="modal-body" style="text-align:center;padding:40px"><i class="fas fa-question-circle" style="font-size:4rem;color:var(--warning);margin-bottom:20px"></i><h3 style="margin-bottom:15px">تأكيد</h3><p style="color:var(--text2);margin-bottom:25px">' + msg + '</p><div style="display:flex;gap:10px;justify-content:center"><button class="btn btn-danger" id="cy">نعم</button><button class="btn btn-secondary" id="cn">لا</button></div></div></div>';
        document.body.appendChild(o);
        document.getElementById('cy').onclick = () => { o.remove(); cb(true); };
        document.getElementById('cn').onclick = () => { o.remove(); cb(false); };
        o.onclick = (e) => { if (e.target === o) { o.remove(); cb(false); } };
    },
    loading(msg = 'جاري التحميل...') {
        const o = document.createElement('div'); o.id = 'ld-overlay'; o.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:9999;flex-direction:column;gap:20px';
        o.innerHTML = '<div class="loader" style="border-color:rgba(255,255,255,0.3);border-top-color:white"></div><p style="color:white;font-size:1.1rem;font-weight:600">' + msg + '</p>';
        document.body.appendChild(o);
    },
    hideLoading() { const o = document.getElementById('ld-overlay'); if (o) o.remove(); }
};

// ============================================
// AUTHENTICATION
// ============================================
const Auth = {
    async login(nid, pwd, role = 'student') {
        if (USE_LOCAL) {
            const u = LocalDB.users.find(x => x.nationalId === nid);
            if (!u) return { success: false, msg: 'الرقم القومي غير مسجل في النظام' };
            if (u.password && u.password !== btoa(pwd)) return { success: false, msg: 'كلمة المرور غير صحيحة' };
            if (!u.password && role === 'student') return { success: false, msg: 'يرجى إنشاء كلمة مرور أولاً' };
            if (role === 'admin' && u.role !== 'admin') return { success: false, msg: 'غير مصرح لك بالدخول كمسؤول' };
            if (role === 'supervisor' && u.role !== 'supervisor' && u.role !== 'admin') return { success: false, msg: 'غير مصرح لك بالدخول كمشرف' };
            if (role === 'student' && u.role !== 'student') return { success: false, msg: 'يرجى تسجيل الدخول من الواجهة المناسبة' };
            currentUser = { ...u }; delete currentUser.password; sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            return { success: true, msg: 'تم تسجيل الدخول بنجاح', user: currentUser };
        }
        // Supabase Auth
        try {
            const { data: users, error } = await supabase.from('users').select('*').eq('nationalId', nid);
            if (error) throw error;
            if (!users || users.length === 0) return { success: false, msg: 'الرقم القومي غير مسجل في النظام' };
            const u = users[0];
            if (u.password && u.password !== btoa(pwd)) return { success: false, msg: 'كلمة المرور غير صحيحة' };
            if (role === 'admin' && u.role !== 'admin') return { success: false, msg: 'غير مصرح لك بالدخول كمسؤول' };
            if (role === 'supervisor' && u.role !== 'supervisor' && u.role !== 'admin') return { success: false, msg: 'غير مصرح لك بالدخول كمشرف' };
            if (role === 'student' && u.role !== 'student') return { success: false, msg: 'يرجى تسجيل الدخول من الواجهة المناسبة' };
            currentUser = { ...u }; delete currentUser.password; sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            return { success: true, msg: 'تم تسجيل الدخول بنجاح', user: currentUser };
        } catch (e) {
            return { success: false, msg: e.message || 'خطأ في الاتصال' };
        }
    },
    logout() { currentUser = null; sessionStorage.removeItem('currentUser'); window.location.href = '../index.html'; },
    isLoggedIn() { return currentUser !== null; },
    getUser() { return currentUser; },
    async chgPwd(oldP, newP) {
        if (!currentUser) return { success: false, msg: 'يرجى تسجيل الدخول أولاً' };
        if (USE_LOCAL) {
            const u = LocalDB.users.find(x => x.id === currentUser.id); if (!u) return { success: false, msg: 'المستخدم غير موجود' };
            if (u.password && u.password !== btoa(oldP)) return { success: false, msg: 'كلمة المرور القديمة غير صحيحة' };
            if (newP.length < 6) return { success: false, msg: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
            u.password = btoa(newP); LocalDB.save(); return { success: true, msg: 'تم تغيير كلمة المرور بنجاح' };
        }
        try {
            const { data: users } = await supabase.from('users').select('*').eq('id', currentUser.id);
            if (!users || users.length === 0) return { success: false, msg: 'المستخدم غير موجود' };
            const u = users[0];
            if (u.password && u.password !== btoa(oldP)) return { success: false, msg: 'كلمة المرور القديمة غير صحيحة' };
            if (newP.length < 6) return { success: false, msg: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
            await supabase.from('users').update({ password: btoa(newP) }).eq('id', currentUser.id);
            return { success: true, msg: 'تم تغيير كلمة المرور بنجاح' };
        } catch (e) { return { success: false, msg: e.message }; }
    },
    async forgot(nid, email) {
        if (USE_LOCAL) {
            const u = LocalDB.users.find(x => x.nationalId === nid);
            if (!u) return { success: false, msg: 'الرقم القومي غير مسجل' };
            if (u.email !== email) return { success: false, msg: 'البريد الإلكتروني لا يتطابق' };
            const t = LocalDB.genId(); u.resetToken = t; u.resetExpires = new Date(Date.now() + 3600000).toISOString(); LocalDB.save();
            return { success: true, msg: 'تم إرسال رمز إعادة التعيين', token: t };
        }
        try {
            const { data: users } = await supabase.from('users').select('*').eq('nationalId', nid);
            if (!users || users.length === 0) return { success: false, msg: 'الرقم القومي غير مسجل' };
            const u = users[0]; if (u.email !== email) return { success: false, msg: 'البريد الإلكتروني لا يتطابق' };
            const t = Date.now().toString(36) + Math.random().toString(36).substr(2);
            await supabase.from('users').update({ resetToken: t, resetExpires: new Date(Date.now() + 3600000).toISOString() }).eq('id', u.id);
            return { success: true, msg: 'تم إرسال رمز إعادة التعيين', token: t };
        } catch (e) { return { success: false, msg: e.message }; }
    },
    async reset(token, newP) {
        if (USE_LOCAL) {
            const u = LocalDB.users.find(x => x.resetToken === token);
            if (!u) return { success: false, msg: 'رمز غير صالح' };
            if (new Date(u.resetExpires) < new Date()) return { success: false, msg: 'انتهت صلاحية الرمز' };
            u.password = btoa(newP); u.resetToken = null; u.resetExpires = null; LocalDB.save();
            return { success: true, msg: 'تم إعادة تعيين كلمة المرور بنجاح' };
        }
        try {
            const { data: users } = await supabase.from('users').select('*').eq('resetToken', token);
            if (!users || users.length === 0) return { success: false, msg: 'رمز غير صالح' };
            const u = users[0]; if (new Date(u.resetExpires) < new Date()) return { success: false, msg: 'انتهت صلاحية الرمز' };
            await supabase.from('users').update({ password: btoa(newP), resetToken: null, resetExpires: null }).eq('id', u.id);
            return { success: true, msg: 'تم إعادة تعيين كلمة المرور بنجاح' };
        } catch (e) { return { success: false, msg: e.message }; }
    }
};

// ============================================
// COURSES
// ============================================
const Courses = {
    async create(name, desc, code) {
        if (!currentUser || currentUser.role !== 'admin') return { success: false, msg: 'غير مصرح' };
        if (!name || !code) return { success: false, msg: 'الاسم والكود مطلوبان' };
        if (USE_LOCAL) {
            const c = { id: LocalDB.genId(), name: name.trim(), description: desc?.trim() || '', code: code.trim(), createdBy: currentUser.id, createdAt: new Date().toISOString(), isActive: true };
            LocalDB.courses.push(c); LocalDB.save(); return { success: true, msg: 'تم إنشاء المقرر', course: c };
        }
        try {
            const { data, error } = await supabase.from('courses').insert([{ name: name.trim(), description: desc?.trim() || '', code: code.trim(), createdBy: currentUser.id, isActive: true }]).select();
            if (error) throw error; return { success: true, msg: 'تم إنشاء المقرر', course: data[0] };
        } catch (e) { return { success: false, msg: e.message }; }
    },
    async getAll() {
        if (USE_LOCAL) return LocalDB.courses.filter(c => c.isActive);
        try { const { data, error } = await supabase.from('courses').select('*').eq('isActive', true); if (error) throw error; return data || []; } catch (e) { return []; }
    },
    async getById(id) {
        if (USE_LOCAL) return LocalDB.courses.find(c => c.id === id);
        try { const { data, error } = await supabase.from('courses').select('*').eq('id', id).single(); if (error) throw error; return data; } catch (e) { return null; }
    },
    async update(id, upd) {
        if (!currentUser || currentUser.role !== 'admin') return { success: false, msg: 'غير مصرح' };
        if (USE_LOCAL) { const c = LocalDB.courses.find(x => x.id === id); if (!c) return { success: false, msg: 'غير موجود' }; Object.assign(c, upd); c.updatedAt = new Date().toISOString(); LocalDB.save(); return { success: true, msg: 'تم التحديث' }; }
        try { const { error } = await supabase.from('courses').update({ ...upd, updatedAt: new Date().toISOString() }).eq('id', id); if (error) throw error; return { success: true, msg: 'تم التحديث' }; } catch (e) { return { success: false, msg: e.message }; }
    },
    async del(id) {
        if (!currentUser || currentUser.role !== 'admin') return { success: false, msg: 'غير مصرح' };
        if (USE_LOCAL) {
            const c = LocalDB.courses.find(x => x.id === id); if (!c) return { success: false, msg: 'غير موجود' };
            LocalDB.courseStudents = LocalDB.courseStudents.filter(cs => cs.courseId !== id);
            LocalDB.groups = LocalDB.groups.filter(g => g.courseId !== id);
            LocalDB.assignments = LocalDB.assignments.filter(a => a.courseId !== id);
            LocalDB.submissions = LocalDB.submissions.filter(s => !LocalDB.assignments.find(a => a.id === s.assignmentId));
            c.isActive = false; LocalDB.save(); return { success: true, msg: 'تم الحذف' };
        }
        try {
            await supabase.from('courseStudents').delete().eq('courseId', id);
            await supabase.from('groups').delete().eq('courseId', id);
            await supabase.from('assignments').delete().eq('courseId', id);
            await supabase.from('courses').update({ isActive: false }).eq('id', id);
            return { success: true, msg: 'تم الحذف' };
        } catch (e) { return { success: false, msg: e.message }; }
    }
};

// ============================================
// STUDENTS
// ============================================
const Students = {
    async addToCourse(cid, data) {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'supervisor')) return { success: false, msg: 'غير مصرح' };
        const v = Utils.valNatId(data.nationalId); if (!v.valid) return { success: false, msg: v.msg };
        if (USE_LOCAL) {
            const ex = LocalDB.courseStudents.find(cs => cs.courseId === cid && cs.nationalId === data.nationalId);
            if (ex) return { success: false, msg: 'الطالب مسجل بالفعل' };
            let s = LocalDB.users.find(u => u.nationalId === data.nationalId);
            if (!s) { s = { id: LocalDB.genId(), nationalId: data.nationalId, name: data.name.trim(), email: data.email?.trim() || '', role: 'student', createdAt: new Date().toISOString() }; LocalDB.users.push(s); }
            else if (data.name) s.name = data.name.trim();
            const cs = { id: LocalDB.genId(), courseId: cid, studentId: s.id, nationalId: s.nationalId, name: s.name, email: s.email, addedAt: new Date().toISOString(), addedBy: currentUser.id };
            LocalDB.courseStudents.push(cs); LocalDB.save(); return { success: true, msg: 'تم الإضافة', student: s };
        }
        try {
            const { data: ex } = await supabase.from('courseStudents').select('*').eq('courseId', cid).eq('nationalId', data.nationalId);
            if (ex && ex.length > 0) return { success: false, msg: 'الطالب مسجل بالفعل' };
            let { data: users } = await supabase.from('users').select('*').eq('nationalId', data.nationalId);
            let s;
            if (!users || users.length === 0) {
                const { data: nu } = await supabase.from('users').insert([{ nationalId: data.nationalId, name: data.name.trim(), email: data.email?.trim() || '', role: 'student' }]).select();
                s = nu[0];
            } else { s = users[0]; if (data.name) await supabase.from('users').update({ name: data.name.trim() }).eq('id', s.id); }
            const { data: cs } = await supabase.from('courseStudents').insert([{ courseId: cid, studentId: s.id, nationalId: s.nationalId, name: s.name, email: s.email, addedBy: currentUser.id }]).select();
            return { success: true, msg: 'تم الإضافة', student: s };
        } catch (e) { return { success: false, msg: e.message }; }
    },
    async bulkAdd(cid, data) {
        if (!currentUser || currentUser.role !== 'admin') return { success: false, msg: 'غير مصرح' };
        const lines = data.split('\n').filter(l => l.trim()); const res = { ok: [], fail: [] };
        for (let i = 0; i < lines.length; i++) {
            const p = lines[i].split(/[\t,]/).map(x => x.trim()); const nid = p[0], name = p[1] || '', email = p[2] || '';
            if (!nid) { res.fail.push({ line: i + 1, reason: 'الرقم القومي فارغ' }); continue; }
            const v = Utils.valNatId(nid); if (!v.valid) { res.fail.push({ line: i + 1, reason: v.msg }); continue; }
            const r = await this.addToCourse(cid, { nationalId: nid, name, email });
            if (r.success) res.ok.push({ line: i + 1, name }); else res.fail.push({ line: i + 1, reason: r.msg });
        }
        return { success: true, msg: 'تمت إضافة ' + res.ok.length + ' وفشل ' + res.fail.length, res };
    },
    async getByCourse(cid) {
        if (USE_LOCAL) return LocalDB.courseStudents.filter(cs => cs.courseId === cid);
        try { const { data, error } = await supabase.from('courseStudents').select('*').eq('courseId', cid); if (error) throw error; return data || []; } catch (e) { return []; }
    },
    async removeFromCourse(cid, sid) {
        if (!currentUser || currentUser.role !== 'admin') return { success: false, msg: 'غير مصرح' };
        if (USE_LOCAL) {
            const i = LocalDB.courseStudents.findIndex(cs => cs.courseId === cid && cs.studentId === sid); if (i === -1) return { success: false, msg: 'الطالب غير موجود' };
            LocalDB.courseStudents.splice(i, 1); LocalDB.groups = LocalDB.groups.map(g => { if (g.courseId === cid) g.members = g.members.filter(m => m !== sid); return g; });
            LocalDB.save(); return { success: true, msg: 'تم الحذف' };
        }
        try { await supabase.from('courseStudents').delete().eq('courseId', cid).eq('studentId', sid); return { success: true, msg: 'تم الحذف' }; } catch (e) { return { success: false, msg: e.message }; }
    },
    async updateName(sid, name) {
        if (!currentUser || currentUser.role !== 'admin') return { success: false, msg: 'غير مصرح' };
        if (USE_LOCAL) { const s = LocalDB.users.find(u => u.id === sid); if (!s) return { success: false, msg: 'غير موجود' }; s.name = name.trim(); LocalDB.courseStudents.forEach(cs => { if (cs.studentId === sid) cs.name = name.trim(); }); LocalDB.save(); return { success: true, msg: 'تم التحديث' }; }
        try { await supabase.from('users').update({ name: name.trim() }).eq('id', sid); await supabase.from('courseStudents').update({ name: name.trim() }).eq('studentId', sid); return { success: true, msg: 'تم التحديث' }; } catch (e) { return { success: false, msg: e.message }; }
    }
};

// ============================================
// GROUPS
// ============================================
const Groups = {
    async create(cid, name, mids) {
        if (!currentUser || currentUser.role !== 'admin') return { success: false, msg: 'غير مصرح' };
        if (USE_LOCAL) { const g = { id: LocalDB.genId(), courseId: cid, name: name.trim(), members: mids || [], createdBy: currentUser.id, createdAt: new Date().toISOString() }; LocalDB.groups.push(g); LocalDB.save(); return { success: true, msg: 'تم إنشاء المجموعة', group: g }; }
        try { const { data, error } = await supabase.from('groups').insert([{ courseId: cid, name: name.trim(), members: mids || [], createdBy: currentUser.id }]).select(); if (error) throw error; return { success: true, msg: 'تم إنشاء المجموعة', group: data[0] }; } catch (e) { return { success: false, msg: e.message }; }
    },
    async getByCourse(cid) {
        if (USE_LOCAL) return LocalDB.groups.filter(g => g.courseId === cid);
        try { const { data, error } = await supabase.from('groups').select('*').eq('courseId', cid); if (error) throw error; return data || []; } catch (e) { return []; }
    },
    async addMember(gid, sid) {
        if (USE_LOCAL) { const g = LocalDB.groups.find(x => x.id === gid); if (!g) return { success: false, msg: 'غير موجود' }; if (g.members.includes(sid)) return { success: false, msg: 'موجود بالفعل' }; g.members.push(sid); LocalDB.save(); return { success: true, msg: 'تم الإضافة' }; }
        try { const { data } = await supabase.from('groups').select('members').eq('id', gid).single(); const m = data.members || []; if (m.includes(sid)) return { success: false, msg: 'موجود بالفعل' }; m.push(sid); await supabase.from('groups').update({ members: m }).eq('id', gid); return { success: true, msg: 'تم الإضافة' }; } catch (e) { return { success: false, msg: e.message }; }
    },
    async removeMember(gid, sid) {
        if (USE_LOCAL) { const g = LocalDB.groups.find(x => x.id === gid); if (!g) return { success: false, msg: 'غير موجود' }; g.members = g.members.filter(m => m !== sid); LocalDB.save(); return { success: true, msg: 'تم الحذف' }; }
        try { const { data } = await supabase.from('groups').select('members').eq('id', gid).single(); const m = (data.members || []).filter(x => x !== sid); await supabase.from('groups').update({ members: m }).eq('id', gid); return { success: true, msg: 'تم الحذف' }; } catch (e) { return { success: false, msg: e.message }; }
    },
    async del(gid) {
        if (!currentUser || currentUser.role !== 'admin') return { success: false, msg: 'غير مصرح' };
        if (USE_LOCAL) { const i = LocalDB.groups.findIndex(g => g.id === gid); if (i === -1) return { success: false, msg: 'غير موجود' }; LocalDB.groups.splice(i, 1); LocalDB.save(); return { success: true, msg: 'تم الحذف' }; }
        try { await supabase.from('groups').delete().eq('id', gid); return { success: true, msg: 'تم الحذف' }; } catch (e) { return { success: false, msg: e.message }; }
    }
};

// ============================================
// ASSIGNMENTS
// ============================================
const Assignments = {
    async create(cid, data) {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'supervisor')) return { success: false, msg: 'غير مصرح' };
        if (USE_LOCAL) {
            const a = { id: LocalDB.genId(), courseId: cid, title: data.title.trim(), description: data.description?.trim() || '', dueDate: data.dueDate, type: data.type || 'individual', groupId: data.groupId || null, createdBy: currentUser.id, createdAt: new Date().toISOString(), status: 'active' };
            LocalDB.assignments.push(a); LocalDB.save();
            let targets = []; if (a.type === 'group' && a.groupId) { const g = LocalDB.groups.find(x => x.id === a.groupId); if (g) targets = g.members; }
            else targets = LocalDB.courseStudents.filter(cs => cs.courseId === cid).map(cs => cs.studentId);
            targets.forEach(sid => { LocalDB.notifications.push({ id: LocalDB.genId(), userId: sid, type: 'assignment', title: 'تسليم جديد: ' + a.title, message: 'تم طلب تسليم جديد', assignmentId: a.id, read: false, createdAt: new Date().toISOString() }); });
            LocalDB.save(); return { success: true, msg: 'تم إنشاء التسليم', assignment: a };
        }
        try {
            const { data: na, error } = await supabase.from('assignments').insert([{ courseId: cid, title: data.title.trim(), description: data.description?.trim() || '', dueDate: data.dueDate, type: data.type || 'individual', groupId: data.groupId, createdBy: currentUser.id, status: 'active' }]).select();
            if (error) throw error; const a = na[0];
            let targets = []; if (a.type === 'group' && a.groupId) { const { data: g } = await supabase.from('groups').select('members').eq('id', a.groupId).single(); targets = g.members || []; }
            else { const { data: sts } = await supabase.from('courseStudents').select('studentId').eq('courseId', cid); targets = sts.map(x => x.studentId); }
            const notifs = targets.map(sid => ({ userId: sid, type: 'assignment', title: 'تسليم جديد: ' + a.title, message: 'تم طلب تسليم جديد', assignmentId: a.id, read: false }));
            if (notifs.length) await supabase.from('notifications').insert(notifs);
            return { success: true, msg: 'تم إنشاء التسليم', assignment: a };
        } catch (e) { return { success: false, msg: e.message }; }
    },
    async getByCourse(cid) {
        if (USE_LOCAL) return LocalDB.assignments.filter(a => a.courseId === cid && a.status === 'active');
        try { const { data, error } = await supabase.from('assignments').select('*').eq('courseId', cid).eq('status', 'active'); if (error) throw error; return data || []; } catch (e) { return []; }
    },
    async getById(id) {
        if (USE_LOCAL) return LocalDB.assignments.find(a => a.id === id);
        try { const { data, error } = await supabase.from('assignments').select('*').eq('id', id).single(); if (error) throw error; return data; } catch (e) { return null; }
    },
    async del(id) {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'supervisor')) return { success: false, msg: 'غير مصرح' };
        if (USE_LOCAL) { LocalDB.submissions = LocalDB.submissions.filter(s => s.assignmentId !== id); const a = LocalDB.assignments.find(x => x.id === id); if (a) a.status = 'deleted'; LocalDB.save(); return { success: true, msg: 'تم الحذف' }; }
        try { await supabase.from('submissions').delete().eq('assignmentId', id); await supabase.from('assignments').update({ status: 'deleted' }).eq('id', id); return { success: true, msg: 'تم الحذف' }; } catch (e) { return { success: false, msg: e.message }; }
    }
};

// ============================================
// SUBMISSIONS
// ============================================
const Submissions = {
    async create(aid, data) {
        if (!currentUser || currentUser.role !== 'student') return { success: false, msg: 'غير مصرح' };
        if (USE_LOCAL) {
            const ex = LocalDB.submissions.find(s => s.assignmentId === aid && s.studentId === currentUser.id);
            if (ex) return { success: false, msg: 'لقد قمت بالتسليم مسبقاً' };
            const s = { id: LocalDB.genId(), assignmentId: aid, studentId: currentUser.id, fileName: data.fileName, fileSize: data.fileSize, fileType: data.fileType, fileData: data.fileData || null, status: 'pending', submittedAt: new Date().toISOString(), feedback: '', grade: null };
            LocalDB.submissions.push(s); LocalDB.save();
            const a = Assignments.getById(aid); if (a) { LocalDB.notifications.push({ id: LocalDB.genId(), userId: a.createdBy, type: 'submission', title: 'تسليم جديد', message: 'قام ' + currentUser.name + ' بتسليم ' + a.title, assignmentId: aid, submissionId: s.id, read: false, createdAt: new Date().toISOString() }); LocalDB.save(); }
            return { success: true, msg: 'تم التسليم بنجاح', submission: s };
        }
        try {
            const { data: ex } = await supabase.from('submissions').select('*').eq('assignmentId', aid).eq('studentId', currentUser.id);
            if (ex && ex.length > 0) return { success: false, msg: 'لقد قمت بالتسليم مسبقاً' };
            let fileUrl = null;
            if (data.fileData && supabase) {
                const fileName = currentUser.id + '_' + Date.now() + '_' + data.fileName;
                const { data: upData, error: upError } = await supabase.storage.from('submissions').upload(fileName, data.fileData);
                if (!upError) { const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(fileName); fileUrl = urlData.publicUrl; }
            }
            const { data: ns, error } = await supabase.from('submissions').insert([{ assignmentId: aid, studentId: currentUser.id, fileName: data.fileName, fileSize: data.fileSize, fileType: data.fileType, fileUrl, status: 'pending' }]).select();
            if (error) throw error;
            const { data: a } = await supabase.from('assignments').select('createdBy,title').eq('id', aid).single();
            if (a) await supabase.from('notifications').insert([{ userId: a.createdBy, type: 'submission', title: 'تسليم جديد', message: 'قام ' + currentUser.name + ' بتسليم ' + a.title, assignmentId: aid, submissionId: ns[0].id, read: false }]);
            return { success: true, msg: 'تم التسليم بنجاح', submission: ns[0] };
        } catch (e) { return { success: false, msg: e.message }; }
    },
    async getByAssignment(aid) {
        if (USE_LOCAL) return LocalDB.submissions.filter(s => s.assignmentId === aid);
        try { const { data, error } = await supabase.from('submissions').select('*').eq('assignmentId', aid); if (error) throw error; return data || []; } catch (e) { return []; }
    },
    async getByStudent(sid) {
        if (USE_LOCAL) return LocalDB.submissions.filter(s => s.studentId === sid);
        try { const { data, error } = await supabase.from('submissions').select('*').eq('studentId', sid); if (error) throw error; return data || []; } catch (e) { return []; }
    },
    async review(id, status, feedback, grade) {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'supervisor')) return { success: false, msg: 'غير مصرح' };
        if (USE_LOCAL) { const s = LocalDB.submissions.find(x => x.id === id); if (!s) return { success: false, msg: 'غير موجود' }; s.status = status; s.feedback = feedback || ''; s.grade = grade || null; s.reviewedAt = new Date().toISOString(); s.reviewedBy = currentUser.id; LocalDB.save(); const msg = status === 'approved' ? 'تم قبول تسليمك' : status === 'rejected' ? 'تم رفض تسليمك' : 'تم طلب إعادة التسليم'; LocalDB.notifications.push({ id: LocalDB.genId(), userId: s.studentId, type: 'review', title: msg, message: feedback || '', submissionId: s.id, read: false, createdAt: new Date().toISOString() }); LocalDB.save(); return { success: true, msg: 'تم المراجعة' }; }
        try {
            await supabase.from('submissions').update({ status, feedback: feedback || '', grade: grade || null, reviewedAt: new Date().toISOString(), reviewedBy: currentUser.id }).eq('id', id);
            const { data: sub } = await supabase.from('submissions').select('studentId').eq('id', id).single();
            const msg = status === 'approved' ? 'تم قبول تسليمك' : status === 'rejected' ? 'تم رفض تسليمك' : 'تم طلب إعادة التسليم';
            await supabase.from('notifications').insert([{ userId: sub.studentId, type: 'review', title: msg, message: feedback || '', submissionId: id, read: false }]);
            return { success: true, msg: 'تم المراجعة' };
        } catch (e) { return { success: false, msg: e.message }; }
    },
    async del(id) {
        if (!currentUser || currentUser.role !== 'admin') return { success: false, msg: 'غير مصرح' };
        if (USE_LOCAL) { const i = LocalDB.submissions.findIndex(s => s.id === id); if (i === -1) return { success: false, msg: 'غير موجود' }; LocalDB.submissions.splice(i, 1); LocalDB.save(); return { success: true, msg: 'تم الحذف وإفراغ المساحة' }; }
        try { await supabase.from('submissions').delete().eq('id', id); return { success: true, msg: 'تم الحذف وإفراغ المساحة' }; } catch (e) { return { success: false, msg: e.message }; }
    }
};

// ============================================
// NOTIFICATIONS
// ============================================
const Notifications = {
    async getByUser(uid) {
        if (USE_LOCAL) return LocalDB.notifications.filter(n => n.userId === uid).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        try { const { data, error } = await supabase.from('notifications').select('*').eq('userId', uid).order('createdAt', { ascending: false }); if (error) throw error; return data || []; } catch (e) { return []; }
    },
    async getUnread(uid) { const all = await this.getByUser(uid); return all.filter(n => !n.read); },
    async markRead(id) {
        if (USE_LOCAL) { const n = LocalDB.notifications.find(x => x.id === id); if (n) { n.read = true; LocalDB.save(); } }
        else try { await supabase.from('notifications').update({ read: true }).eq('id', id); } catch (e) { }
    },
    async markAllRead(uid) {
        if (USE_LOCAL) { LocalDB.notifications.filter(n => n.userId === uid && !n.read).forEach(n => n.read = true); LocalDB.save(); }
        else try { await supabase.from('notifications').update({ read: true }).eq('userId', uid).eq('read', false); } catch (e) { }
    },
    async countUnread(uid) { const u = await this.getUnread(uid); return u.length; }
};

// ============================================
// SUPERVISORS
// ============================================
const Supervisors = {
    async create(data) {
        if (!currentUser || currentUser.role !== 'admin') return { success: false, msg: 'غير مصرح' };
        const v = Utils.valNatId(data.nationalId); if (!v.valid) return { success: false, msg: v.msg };
        if (USE_LOCAL) {
            const ex = LocalDB.users.find(u => u.nationalId === data.nationalId);
            if (ex && ex.role === 'supervisor') return { success: false, msg: 'المشرف مسجل بالفعل' };
            let u = ex;
            if (!u) { u = { id: LocalDB.genId(), nationalId: data.nationalId, name: data.name.trim(), email: data.email?.trim() || '', password: data.password ? btoa(data.password) : null, role: 'supervisor', createdAt: new Date().toISOString() }; LocalDB.users.push(u); }
            else { u.role = 'supervisor'; u.name = data.name.trim(); if (data.password) u.password = btoa(data.password); }
            LocalDB.supervisors.push({ id: LocalDB.genId(), userId: u.id, nationalId: u.nationalId, name: u.name, email: u.email, createdBy: currentUser.id, createdAt: new Date().toISOString() });
            LocalDB.save(); return { success: true, msg: 'تم إضافة المشرف', supervisor: u };
        }
        try {
            const { data: ex } = await supabase.from('users').select('*').eq('nationalId', data.nationalId);
            let u;
            if (!ex || ex.length === 0) {
                const { data: nu } = await supabase.from('users').insert([{ nationalId: data.nationalId, name: data.name.trim(), email: data.email?.trim() || '', password: data.password ? btoa(data.password) : null, role: 'supervisor' }]).select();
                u = nu[0];
            } else {
                u = ex[0]; await supabase.from('users').update({ role: 'supervisor', name: data.name.trim(), password: data.password ? btoa(data.password) : u.password }).eq('id', u.id);
            }
            await supabase.from('supervisors').insert([{ userId: u.id, nationalId: u.nationalId, name: u.name, email: u.email, createdBy: currentUser.id }]);
            return { success: true, msg: 'تم إضافة المشرف', supervisor: u };
        } catch (e) { return { success: false, msg: e.message }; }
    },
    async getAll() {
        if (USE_LOCAL) return LocalDB.supervisors;
        try { const { data, error } = await supabase.from('supervisors').select('*'); if (error) throw error; return data || []; } catch (e) { return []; }
    },
    async del(id) {
        if (!currentUser || currentUser.role !== 'admin') return { success: false, msg: 'غير مصرح' };
        if (USE_LOCAL) { const i = LocalDB.supervisors.findIndex(s => s.id === id); if (i === -1) return { success: false, msg: 'غير موجود' }; const s = LocalDB.supervisors[i]; const u = LocalDB.users.find(x => x.id === s.userId); if (u) u.role = 'student'; LocalDB.supervisors.splice(i, 1); LocalDB.save(); return { success: true, msg: 'تم الحذف' }; }
        try { const { data: sp } = await supabase.from('supervisors').select('userId').eq('id', id).single(); if (sp) await supabase.from('users').update({ role: 'student' }).eq('id', sp.userId); await supabase.from('supervisors').delete().eq('id', id); return { success: true, msg: 'تم الحذف' }; } catch (e) { return { success: false, msg: e.message }; }
    }
};

// Password toggle
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', function () {
            const inp = this.parentElement.querySelector('input');
            if (inp.type === 'password') { inp.type = 'text'; this.innerHTML = '<i class="fas fa-eye-slash"></i>'; }
            else { inp.type = 'password'; this.innerHTML = '<i class="fas fa-eye"></i>'; }
        });
    });
});
