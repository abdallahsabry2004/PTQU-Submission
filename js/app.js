
// منصة التسليم الأكاديمية - كلية العلاج الطبيعي جامعة قنا
// Programming & Development: Abdullah Sabry

const DB={
    users:JSON.parse(localStorage.getItem('users'))||[{
        id:'admin1',nationalId:'30409302705170',name:'المسؤول',email:'admin@qena.edu.eg',
        password:btoa('Admin'),role:'admin',createdAt:new Date().toISOString()
    }],
    courses:JSON.parse(localStorage.getItem('courses'))||[],
    courseStudents:JSON.parse(localStorage.getItem('courseStudents'))||[],
    groups:JSON.parse(localStorage.getItem('groups'))||[],
    assignments:JSON.parse(localStorage.getItem('assignments'))||[],
    submissions:JSON.parse(localStorage.getItem('submissions'))||[],
    notifications:JSON.parse(localStorage.getItem('notifications'))||[],
    supervisors:JSON.parse(localStorage.getItem('supervisors'))||[],
    save(){localStorage.setItem('users',JSON.stringify(this.users));localStorage.setItem('courses',JSON.stringify(this.courses));localStorage.setItem('courseStudents',JSON.stringify(this.courseStudents));localStorage.setItem('groups',JSON.stringify(this.groups));localStorage.setItem('assignments',JSON.stringify(this.assignments));localStorage.setItem('submissions',JSON.stringify(this.submissions));localStorage.setItem('notifications',JSON.stringify(this.notifications));localStorage.setItem('supervisors',JSON.stringify(this.supervisors));},
    genId(){return Date.now().toString(36)+Math.random().toString(36).substr(2);}
};

let currentUser=JSON.parse(sessionStorage.getItem('currentUser'))||null;

const Utils={
    toast(msg,type='success'){
        let c=document.querySelector('.toast-container');
        if(!c){c=document.createElement('div');c.className='toast-container';document.body.appendChild(c);}
        const t=document.createElement('div');t.className='toast '+type;
        const icons={success:'✓',error:'✕',warning:'⚠',info:'ℹ'};
        t.innerHTML='<span style="font-size:1.2rem">'+icons[type]+'</span><span>'+msg+'</span>';
        c.appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(-30px)';setTimeout(()=>t.remove(),300);},4000);
    },
    showAlert(id,msg,type='danger'){
        const c=document.getElementById(id);if(!c)return;
        const a=document.createElement('div');a.className='alert alert-'+type;
        a.innerHTML='<i class="fas fa-'+(type=='success'?'check-circle':type=='warning'?'exclamation-triangle':'exclamation-circle')+'"></i><span>'+msg+'</span>';
        c.innerHTML='';c.appendChild(a);setTimeout(()=>{a.style.opacity='0';setTimeout(()=>a.remove(),300);},5000);
    },
    fmtDate(d){return new Date(d).toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});},
    fmtSize(b){if(!b)return'0 Bytes';const k=1024,s=['Bytes','KB','MB','GB'];const i=Math.floor(Math.log(b)/Math.log(k));return parseFloat((b/Math.pow(k,i)).toFixed(2))+' '+s[i];},
    valNatId(id){
        if(!id||id.length!==14)return{valid:false,msg:'الرقم القومي يجب أن يكون 14 رقماً'};
        if(!/^\d{14}$/.test(id))return{valid:false,msg:'الرقم القومي يجب أن يحتوي على أرقام فقط'};
        const c=id[0];if(c!=='2'&&c!=='3')return{valid:false,msg:'الرقم القومي غير صالح'};
        const y=(c==='2'?'19':'20')+id.substring(1,3),m=id.substring(3,5),d=id.substring(5,7);
        const bd=new Date(y+'-'+m+'-'+d);if(isNaN(bd.getTime())||bd>new Date())return{valid:false,msg:'تاريخ الميلاد غير صالح'};
        const g=parseInt(id.substring(7,9));if(g<1||g>35)return{valid:false,msg:'كود المحافظة غير صالح'};
        return{valid:true,msg:'صالح'};
    },
    pwdStrength(p){
        let s=0;if(p.length>=8)s++;if(p.length>=12)s++;if(/[A-Z]/.test(p))s++;if(/[a-z]/.test(p))s++;if(/\d/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;
        const lv=[{t:'ضعيف جداً',c:'#c0392b',w:'16%'},{t:'ضعيف',c:'#e74c3c',w:'33%'},{t:'متوسط',c:'#f39c12',w:'50%'},{t:'جيد',c:'#f1c40f',w:'66%'},{t:'قوي',c:'#27ae60',w:'83%'},{t:'قوي جداً',c:'#229954',w:'100%'}];
        return lv[Math.min(s,5)];
    },
    genPwd(l=12){const cs='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';let p='';for(let i=0;i<l;i++)p+=cs.charAt(Math.floor(Math.random()*cs.length));return p;},
    confirm(msg,cb){
        const o=document.createElement('div');o.className='modal-overlay active';o.style.zIndex='5000';
        o.innerHTML='<div class="modal" style="max-width:400px"><div class="modal-body" style="text-align:center;padding:40px"><i class="fas fa-question-circle" style="font-size:4rem;color:var(--warning);margin-bottom:20px"></i><h3 style="margin-bottom:15px">تأكيد</h3><p style="color:var(--text2);margin-bottom:25px">'+msg+'</p><div style="display:flex;gap:10px;justify-content:center"><button class="btn btn-danger" id="cy">نعم</button><button class="btn btn-secondary" id="cn">لا</button></div></div></div>';
        document.body.appendChild(o);
        document.getElementById('cy').onclick=()=>{o.remove();cb(true);};
        document.getElementById('cn').onclick=()=>{o.remove();cb(false);};
        o.onclick=(e)=>{if(e.target===o){o.remove();cb(false);}};
    },
    loading(msg='جاري التحميل...'){
        const o=document.createElement('div');o.id='ld-overlay';o.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:9999;flex-direction:column;gap:20px';
        o.innerHTML='<div class="loader" style="border-color:rgba(255,255,255,0.3);border-top-color:white"></div><p style="color:white;font-size:1.1rem;font-weight:600">'+msg+'</p>';
        document.body.appendChild(o);
    },
    hideLoading(){const o=document.getElementById('ld-overlay');if(o)o.remove();}
};

const Auth={
    login(nid,pwd,role='student'){
        const u=DB.users.find(x=>x.nationalId===nid);
        if(!u)return{success:false,msg:'الرقم القومي غير مسجل في النظام'};
        if(u.password&&u.password!==btoa(pwd))return{success:false,msg:'كلمة المرور غير صحيحة'};
        if(!u.password&&role==='student')return{success:false,msg:'يرجى إنشاء كلمة مرور أولاً'};
        if(role==='admin'&&u.role!=='admin')return{success:false,msg:'غير مصرح لك بالدخول كمسؤول'};
        if(role==='supervisor'&&u.role!=='supervisor'&&u.role!=='admin')return{success:false,msg:'غير مصرح لك بالدخول كمشرف'};
        if(role==='student'&&u.role!=='student')return{success:false,msg:'يرجى تسجيل الدخول من الواجهة المناسبة'};
        currentUser={...u};delete currentUser.password;sessionStorage.setItem('currentUser',JSON.stringify(currentUser));
        return{success:true,msg:'تم تسجيل الدخول بنجاح',user:currentUser};
    },
    logout(){currentUser=null;sessionStorage.removeItem('currentUser');window.location.href='../index.html';},
    isLoggedIn(){return currentUser!==null;},
    getUser(){return currentUser;},
    chgPwd(oldP,newP){
        if(!currentUser)return{success:false,msg:'يرجى تسجيل الدخول'};
        const u=DB.users.find(x=>x.id===currentUser.id);if(!u)return{success:false,msg:'المستخدم غير موجود'};
        if(u.password&&u.password!==btoa(oldP))return{success:false,msg:'كلمة المرور القديمة غير صحيحة'};
        if(newP.length<6)return{success:false,msg:'كلمة المرور يجب أن تكون 6 أحرف على الأقل'};
        u.password=btoa(newP);DB.save();return{success:true,msg:'تم تغيير كلمة المرور بنجاح'};
    },
    forgot(nid,email){
        const u=DB.users.find(x=>x.nationalId===nid);if(!u)return{success:false,msg:'الرقم القومي غير مسجل'};
        if(u.email!==email)return{success:false,msg:'البريد الإلكتروني لا يتطابق'};
        const t=DB.genId();u.resetToken=t;u.resetExpires=new Date(Date.now()+3600000).toISOString();DB.save();
        return{success:true,msg:'تم إرسال رابط إعادة التعيين إلى بريدك',token:t};
    },
    reset(token,newP){
        const u=DB.users.find(x=>x.resetToken===token);if(!u)return{success:false,msg:'رمز غير صالح'};
        if(new Date(u.resetExpires)<new Date())return{success:false,msg:'انتهت صلاحية الرمز'};
        u.password=btoa(newP);u.resetToken=null;u.resetExpires=null;DB.save();
        return{success:true,msg:'تم إعادة تعيين كلمة المرور بنجاح'};
    }
};

const Courses={
    create(name,desc,code){
        if(!currentUser||currentUser.role!=='admin')return{success:false,msg:'غير مصرح'};
        if(!name||!code)return{success:false,msg:'الاسم والكود مطلوبان'};
        const c={id:DB.genId(),name:name.trim(),description:desc?.trim()||'',code:code.trim(),createdBy:currentUser.id,createdAt:new Date().toISOString(),isActive:true};
        DB.courses.push(c);DB.save();return{success:true,msg:'تم إنشاء المقرر',course:c};
    },
    getAll(){return DB.courses.filter(c=>c.isActive);},
    getById(id){return DB.courses.find(c=>c.id===id);},
    update(id,upd){
        if(!currentUser||currentUser.role!=='admin')return{success:false,msg:'غير مصرح'};
        const c=DB.courses.find(x=>x.id===id);if(!c)return{success:false,msg:'غير موجود'};
        Object.assign(c,upd);c.updatedAt=new Date().toISOString();DB.save();return{success:true,msg:'تم التحديث'};
    },
    del(id){
        if(!currentUser||currentUser.role!=='admin')return{success:false,msg:'غير مصرح'};
        const c=DB.courses.find(x=>x.id===id);if(!c)return{success:false,msg:'غير موجود'};
        DB.courseStudents=DB.courseStudents.filter(cs=>cs.courseId!==id);
        DB.groups=DB.groups.filter(g=>g.courseId!==id);
        DB.assignments=DB.assignments.filter(a=>a.courseId!==id);
        DB.submissions=DB.submissions.filter(s=>!DB.assignments.find(a=>a.id===s.assignmentId));
        c.isActive=false;DB.save();return{success:true,msg:'تم الحذف'};
    }
};

const Students={
    addToCourse(cid,data){
        if(!currentUser||(currentUser.role!=='admin'&&currentUser.role!=='supervisor'))return{success:false,msg:'غير مصرح'};
        const v=Utils.valNatId(data.nationalId);if(!v.valid)return{success:false,msg:v.msg};
        const ex=DB.courseStudents.find(cs=>cs.courseId===cid&&cs.nationalId===data.nationalId);
        if(ex)return{success:false,msg:'الطالب مسجل بالفعل'};
        let s=DB.users.find(u=>u.nationalId===data.nationalId);
        if(!s){s={id:DB.genId(),nationalId:data.nationalId,name:data.name.trim(),email:data.email?.trim()||'',role:'student',createdAt:new Date().toISOString()};DB.users.push(s);}
        else if(data.name)s.name=data.name.trim();
        const cs={id:DB.genId(),courseId:cid,studentId:s.id,nationalId:s.nationalId,name:s.name,email:s.email,addedAt:new Date().toISOString(),addedBy:currentUser.id};
        DB.courseStudents.push(cs);DB.save();return{success:true,msg:'تم الإضافة',student:s};
    },
    bulkAdd(cid,data){
        if(!currentUser||currentUser.role!=='admin')return{success:false,msg:'غير مصرح'};
        const lines=data.split('\n').filter(l=>l.trim());const res={ok:[],fail:[]};
        lines.forEach((line,i)=>{
            const p=line.split(/[\t,]/).map(x=>x.trim());const nid=p[0],name=p[1]||'',email=p[2]||'';
            if(!nid){res.fail.push({line:i+1,reason:'الرقم القومي فارغ'});return;}
            const v=Utils.valNatId(nid);if(!v.valid){res.fail.push({line:i+1,reason:v.msg});return;}
            const r=this.addToCourse(cid,{nationalId:nid,name,email});
            if(r.success)res.ok.push({line:i+1,name});else res.fail.push({line:i+1,reason:r.msg});
        });
        return{success:true,msg:'تمت إضافة '+res.ok.length+' وفشل '+res.fail.length,res};
    },
    getByCourse(cid){return DB.courseStudents.filter(cs=>cs.courseId===cid);},
    removeFromCourse(cid,sid){
        if(!currentUser||currentUser.role!=='admin')return{success:false,msg:'غير مصرح'};
        const i=DB.courseStudents.findIndex(cs=>cs.courseId===cid&&cs.studentId===sid);if(i===-1)return{success:false,msg:'الطالب غير موجود'};
        DB.courseStudents.splice(i,1);DB.groups=DB.groups.map(g=>{if(g.courseId===cid)g.members=g.members.filter(m=>m!==sid);return g;});
        DB.save();return{success:true,msg:'تم الحذف'};
    },
    updateName(sid,name){
        if(!currentUser||currentUser.role!=='admin')return{success:false,msg:'غير مصرح'};
        const s=DB.users.find(u=>u.id===sid);if(!s)return{success:false,msg:'غير موجود'};
        s.name=name.trim();DB.courseStudents.forEach(cs=>{if(cs.studentId===sid)cs.name=name.trim();});DB.save();return{success:true,msg:'تم التحديث'};
    }
};

const Groups={
    create(cid,name,mids){
        if(!currentUser||currentUser.role!=='admin')return{success:false,msg:'غير مصرح'};
        const g={id:DB.genId(),courseId:cid,name:name.trim(),members:mids||[],createdBy:currentUser.id,createdAt:new Date().toISOString()};
        DB.groups.push(g);DB.save();return{success:true,msg:'تم إنشاء المجموعة',group:g};
    },
    getByCourse(cid){return DB.groups.filter(g=>g.courseId===cid);},
    addMember(gid,sid){
        const g=DB.groups.find(x=>x.id===gid);if(!g)return{success:false,msg:'غير موجود'};
        if(g.members.includes(sid))return{success:false,msg:'موجود بالفعل'};
        g.members.push(sid);DB.save();return{success:true,msg:'تم الإضافة'};
    },
    removeMember(gid,sid){
        const g=DB.groups.find(x=>x.id===gid);if(!g)return{success:false,msg:'غير موجود'};
        g.members=g.members.filter(m=>m!==sid);DB.save();return{success:true,msg:'تم الحذف'};
    },
    del(gid){
        if(!currentUser||currentUser.role!=='admin')return{success:false,msg:'غير مصرح'};
        const i=DB.groups.findIndex(g=>g.id===gid);if(i===-1)return{success:false,msg:'غير موجود'};
        DB.groups.splice(i,1);DB.save();return{success:true,msg:'تم الحذف'};
    }
};

const Assignments={
    create(cid,data){
        if(!currentUser||(currentUser.role!=='admin'&&currentUser.role!=='supervisor'))return{success:false,msg:'غير مصرح'};
        const a={id:DB.genId(),courseId:cid,title:data.title.trim(),description:data.description?.trim()||'',dueDate:data.dueDate,type:data.type||'individual',groupId:data.groupId||null,createdBy:currentUser.id,createdAt:new Date().toISOString(),status:'active'};
        DB.assignments.push(a);DB.save();
        // Notify students
        let targets=[];
        if(a.type==='group'&&a.groupId){const g=DB.groups.find(x=>x.id===a.groupId);if(g)targets=g.members;}
        else{targets=DB.courseStudents.filter(cs=>cs.courseId===cid).map(cs=>cs.studentId);}
        targets.forEach(sid=>{
            DB.notifications.push({id:DB.genId(),userId:sid,type:'assignment',title:'تسليم جديد: '+a.title,message:'تم طلب تسليم جديد في '+Courses.getById(cid)?.name,assignmentId:a.id,read:false,createdAt:new Date().toISOString()});
        });DB.save();
        return{success:true,msg:'تم إنشاء التسليم',assignment:a};
    },
    getByCourse(cid){return DB.assignments.filter(a=>a.courseId===cid&&a.status==='active');},
    getById(id){return DB.assignments.find(a=>a.id===id);},
    del(id){
        if(!currentUser||(currentUser.role!=='admin'&&currentUser.role!=='supervisor'))return{success:false,msg:'غير مصرح'};
        const a=DB.assignments.find(x=>x.id===id);if(!a)return{success:false,msg:'غير موجود'};
        // Delete submissions and free storage
        DB.submissions=DB.submissions.filter(s=>s.assignmentId!==id);a.status='deleted';DB.save();
        return{success:true,msg:'تم الحذف وإفراغ الملفات'};
    }
};

const Submissions={
    create(aid,data){
        if(!currentUser||currentUser.role!=='student')return{success:false,msg:'غير مصرح'};
        const ex=DB.submissions.find(s=>s.assignmentId===aid&&s.studentId===currentUser.id);
        if(ex)return{success:false,msg:'لقد قمت بالتسليم مسبقاً'};
        const s={id:DB.genId(),assignmentId:aid,studentId:currentUser.id,fileName:data.fileName,fileSize:data.fileSize,fileType:data.fileType,fileData:data.fileData||null,status:'pending',submittedAt:new Date().toISOString(),feedback:'',grade:null};
        DB.submissions.push(s);DB.save();
        // Notify admin/supervisors
        const a=Assignments.getById(aid);if(a){
            DB.notifications.push({id:DB.genId(),userId:a.createdBy,type:'submission',title:'تسليم جديد',message:'قام '+currentUser.name+' بتسليم '+a.title,assignmentId:aid,submissionId:s.id,read:false,createdAt:new Date().toISOString()});
        }DB.save();
        return{success:true,msg:'تم التسليم بنجاح',submission:s};
    },
    getByAssignment(aid){return DB.submissions.filter(s=>s.assignmentId===aid);},
    getByStudent(sid){return DB.submissions.filter(s=>s.studentId===sid);},
    review(id,status,feedback,grade){
        if(!currentUser||(currentUser.role!=='admin'&&currentUser.role!=='supervisor'))return{success:false,msg:'غير مصرح'};
        const s=DB.submissions.find(x=>x.id===id);if(!s)return{success:false,msg:'غير موجود'};
        s.status=status;s.feedback=feedback||'';s.grade=grade||null;s.reviewedAt=new Date().toISOString();s.reviewedBy=currentUser.id;DB.save();
        // Notify student
        const msg=status==='approved'?'تم قبول تسليمك':status==='rejected'?'تم رفض تسليمك':'تم طلب إعادة التسليم';
        DB.notifications.push({id:DB.genId(),userId:s.studentId,type:'review',title:msg,message:feedback||'',submissionId:s.id,read:false,createdAt:new Date().toISOString()});DB.save();
        return{success:true,msg:'تم المراجعة'};
    },
    del(id){
        if(!currentUser||currentUser.role!=='admin')return{success:false,msg:'غير مصرح'};
        const i=DB.submissions.findIndex(s=>s.id===id);if(i===-1)return{success:false,msg:'غير موجود'};
        DB.submissions.splice(i,1);DB.save();return{success:true,msg:'تم الحذف وإفراغ المساحة'};
    }
};

const Notifications={
    getByUser(uid){return DB.notifications.filter(n=>n.userId===uid).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));},
    getUnread(uid){return this.getByUser(uid).filter(n=>!n.read);},
    markRead(id){
        const n=DB.notifications.find(x=>x.id===id);if(n){n.read=true;DB.save();}
    },
    markAllRead(uid){
        DB.notifications.filter(n=>n.userId===uid&&!n.read).forEach(n=>n.read=true);DB.save();
    },
    countUnread(uid){return this.getUnread(uid).length;}
};

const Supervisors={
    create(data){
        if(!currentUser||currentUser.role!=='admin')return{success:false,msg:'غير مصرح'};
        const v=Utils.valNatId(data.nationalId);if(!v.valid)return{success:false,msg:v.msg};
        const ex=DB.users.find(u=>u.nationalId===data.nationalId);
        if(ex&&ex.role==='supervisor')return{success:false,msg:'المشرف مسجل بالفعل'};
        let u=ex;
        if(!u){u={id:DB.genId(),nationalId:data.nationalId,name:data.name.trim(),email:data.email?.trim()||'',password:data.password?btoa(data.password):null,role:'supervisor',createdAt:new Date().toISOString()};DB.users.push(u);}
        else{u.role='supervisor';u.name=data.name.trim();if(data.password)u.password=btoa(data.password);}
        DB.supervisors.push({id:DB.genId(),userId:u.id,nationalId:u.id,name:u.name,email:u.email,createdBy:currentUser.id,createdAt:new Date().toISOString()});
        DB.save();return{success:true,msg:'تم إضافة المشرف',supervisor:u};
    },
    getAll(){return DB.supervisors;},
    del(id){
        if(!currentUser||currentUser.role!=='admin')return{success:false,msg:'غير مصرح'};
        const i=DB.supervisors.findIndex(s=>s.id===id);if(i===-1)return{success:false,msg:'غير موجود'};
        const s=DB.supervisors[i];const u=DB.users.find(x=>x.id===s.userId);if(u)u.role='student';
        DB.supervisors.splice(i,1);DB.save();return{success:true,msg:'تم الحذف'};
    }
};

// Password toggle
document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('.password-toggle').forEach(btn=>{
        btn.addEventListener('click',function(){
            const inp=this.parentElement.querySelector('input');
            if(inp.type==='password'){inp.type='text';this.innerHTML='<i class="fas fa-eye-slash"></i>';}
            else{inp.type='password';this.innerHTML='<i class="fas fa-eye"></i>';}
        });
    });
});
