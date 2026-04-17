"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parseDate = (s) => { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); };
const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const dayNamesFull = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
function getDaysInMonth(y,m) { return new Date(y,m+1,0).getDate(); }
function getFirstDayOfMonth(y,m) { return new Date(y,m,1).getDay(); }
function addDays(d,n) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function startOfWeek(d) { const r = new Date(d); r.setDate(r.getDate()-r.getDay()); return r; }
function getGreeting() { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'; }

const PC = [{bg:'#dbeafe',text:'#1e40af',border:'#93c5fd'},{bg:'#dcfce7',text:'#166534',border:'#86efac'},{bg:'#fef3c7',text:'#92400e',border:'#fcd34d'},{bg:'#ede9fe',text:'#5b21b6',border:'#c4b5fd'},{bg:'#ffe4e6',text:'#9f1239',border:'#fda4af'},{bg:'#ccfbf1',text:'#115e59',border:'#5eead4'},{bg:'#fce7f3',text:'#9d174d',border:'#f9a8d4'},{bg:'#e0e7ff',text:'#3730a3',border:'#a5b4fc'}];
function pColor(name) { if(!name)return null; let h=0; for(let i=0;i<name.length;i++) h=((h<<5)-h+name.charCodeAt(i))|0; return PC[Math.abs(h)%PC.length]; }

function shouldTaskAppear(task, dateStr) {
  if (!task.recurrence || task.recurrence.type === 'none') return task.date === dateStr;
  const td = parseDate(task.date), cd = parseDate(dateStr);
  if (cd < td) return false;
  const rec = task.recurrence, dd = Math.round((cd.getTime()-td.getTime())/(864e5));
  if (rec.type==='daily') return dd%(rec.interval||1)===0;
  if (rec.type==='weekly') return dd%((rec.interval||1)*7)===0;
  if (rec.type==='monthly') { const m=(cd.getFullYear()-td.getFullYear())*12+(cd.getMonth()-td.getMonth()); return m%(rec.interval||1)===0 && cd.getDate()===td.getDate(); }
  if (rec.type==='weekdays') return (rec.days||[]).includes(cd.getDay());
  return task.date === dateStr;
}
const BL_DATE='1970-01-01';
function tasksFor(tasks, ds, comp) {
  return tasks.filter(t=>t.date!==BL_DATE&&shouldTaskAppear(t,ds)).map(t=>({...t,completed:!!(comp[`${t.id}::${ds}`])}));
}

const T={bg:'#fafaf9',surface:'#fff',surfaceHover:'#f5f5f4',border:'#e7e5e4',borderLight:'#f0eeec',text:'#1c1917',ts:'#78716c',tm:'#a8a29e',accentSoft:'#f5f5f4',thing:'#dc2626',thingBg:'#fef2f2',imp:'#2563eb',impBg:'#eff6ff',maint:'#78716c',maintBg:'#f5f5f4',ok:'#16a34a',okBg:'#f0fdf4',r:'10px',rs:'6px',rl:'14px'};
const F="'DM Sans',sans-serif", SF="'Instrument Serif',serif";

function Ic({name,size=18,color:C,style:s}){
  const m={
    chevLeft:<path d="M15 18l-6-6 6-6" stroke={C||T.text} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    chevRight:<path d="M9 18l6-6-6-6" stroke={C||T.text} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    plus:<><line x1="12" y1="5" x2="12" y2="19" stroke={C||T.text} strokeWidth="2" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke={C||T.text} strokeWidth="2" strokeLinecap="round"/></>,
    check:<polyline points="20 6 9 17 4 12" stroke={C||'#fff'} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    x:<><line x1="18" y1="6" x2="6" y2="18" stroke={C||T.ts} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={C||T.ts} strokeWidth="2" strokeLinecap="round"/></>,
    repeat:<><polyline points="17 1 21 5 17 9" stroke={C||T.tm} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 11V9a4 4 0 0 1 4-4h14" stroke={C||T.tm} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7 23 3 19 7 15" stroke={C||T.tm} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 13v2a4 4 0 0 1-4 4H3" stroke={C||T.tm} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
    settings:<><circle cx="12" cy="12" r="3" stroke={C||T.text} strokeWidth="1.8" fill="none"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={C||T.text} strokeWidth="1.8" fill="none"/></>,
    trash:<><polyline points="3 6 5 6 21 6" stroke={C||'#ef4444'} strokeWidth="1.8" fill="none" strokeLinecap="round"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={C||'#ef4444'} strokeWidth="1.8" fill="none" strokeLinecap="round"/></>,
    edit:<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={C||T.ts} strokeWidth="1.8" fill="none" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={C||T.ts} strokeWidth="1.8" fill="none" strokeLinecap="round"/></>,
    target:<><circle cx="12" cy="12" r="10" stroke={C||T.thing} strokeWidth="1.8" fill="none"/><circle cx="12" cy="12" r="6" stroke={C||T.thing} strokeWidth="1.8" fill="none"/><circle cx="12" cy="12" r="2" fill={C||T.thing}/></>,
    star:<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={C||T.text} stroke="none"/>,
    logout:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={C||T.ts} strokeWidth="1.8" fill="none" strokeLinecap="round"/><polyline points="16 17 21 12 16 7" stroke={C||T.ts} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke={C||T.ts} strokeWidth="1.8" strokeLinecap="round"/></>,
    note:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={C||T.tm} strokeWidth="1.8" fill="none" strokeLinecap="round"/><polyline points="14 2 14 8 20 8" stroke={C||T.tm} strokeWidth="1.8" fill="none" strokeLinecap="round"/></>,
    focus:<><circle cx="12" cy="12" r="10" stroke={C||T.thing} strokeWidth="1.8" fill="none"/><polygon points="10 8 16 12 10 16" fill={C||T.thing}/></>,
    pause:<><rect x="6" y="4" width="4" height="16" rx="1" fill={C||T.text}/><rect x="14" y="4" width="4" height="16" rx="1" fill={C||T.text}/></>,
    inbox:<><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" stroke={C||T.tm} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke={C||T.tm} strokeWidth="1.8" fill="none" strokeLinecap="round"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{flexShrink:0,...s}}>{m[name]}</svg>;
}

const CAT={thing:{label:'The Thing',color:T.thing,bg:T.thingBg,icon:'target',desc:'Tu prioridad #1'},important:{label:'Important',color:T.imp,bg:T.impBg,icon:'star',desc:'Tareas clave'},maintenance:{label:'Maintenance',color:T.maint,bg:T.maintBg,icon:'settings',desc:'Bajo esfuerzo'}};
const DSET={limits:{thing:1,important:3,maintenance:99},shortcut:'n',dark:false,workWeek:false,onboarded:false};

function PPill({name}){if(!name)return null;const c=pColor(name);return <span style={{display:'inline-flex',padding:'1px 6px',borderRadius:20,background:c.bg,color:c.text,border:`1px solid ${c.border}`,fontSize:10,fontWeight:500,fontFamily:F,lineHeight:1.6,whiteSpace:'nowrap',flexShrink:0}}>{name}</span>;}

function PRing({pct,size=44}){const sw=3.5,r=(size-sw)/2,ci=2*Math.PI*r,off=ci-(pct/100)*ci,dn=pct===100;return<div style={{position:'relative',width:size,height:size}}><svg width={size} height={size} style={{transform:'rotate(-90deg)'}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={sw}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={dn?T.ok:T.text} strokeWidth={sw} strokeDasharray={ci} strokeDashoffset={off} strokeLinecap="round" style={{transition:'stroke-dashoffset 0.5s ease'}}/></svg><span style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:dn?T.ok:T.text,fontFamily:F}}>{pct}%</span></div>;}

function Toggle({on,onToggle,label}){return<div onClick={onToggle} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',userSelect:'none'}}>
  <div style={{width:36,height:20,borderRadius:10,background:on?T.text:T.border,transition:'background 0.2s',position:'relative',flexShrink:0}}>
    <div style={{width:16,height:16,borderRadius:8,background:'#fff',position:'absolute',top:2,left:on?18:2,transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.15)'}}/>
  </div>
  {label&&<span style={{fontSize:11,color:on?T.text:T.tm,fontFamily:F,fontWeight:500}}>{label}</span>}
</div>;}

// ─── Onboarding ───────────────────────────────────────────────────
const OB_STEPS=[
  {icon:'target',color:T.thing,title:'The Thing',sub:'Tu única prioridad #1 del día.',body:'Cada día, define una sola tarea que, si la completas, hace que el día valga la pena. No dos. No tres. Una.'},
  {icon:'star',color:'#2563eb',title:'Important',sub:'3 tareas clave que importan.',body:'Después de tu Thing, elige máximo 3 tareas que realmente muevan la aguja. Todo lo demás es ruido.'},
  {icon:'settings',color:'#78716c',title:'Maintenance',sub:'Lo demás va aquí.',body:'Correos, admin, rutina. Tareas que no requieren enfoque profundo. Hazlas en bloque, no las mezcles con lo importante.'},
];

function Onboarding({onDone,userName}){
  const [step,setStep]=useState(0);
  const s=OB_STEPS[step];
  const isLast=step===OB_STEPS.length-1;
  return(
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,position:'relative',zIndex:1}}>
      <div style={{maxWidth:440,width:'90vw',textAlign:'center'}}>
        {/* Progress dots */}
        <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:40}}>
          {OB_STEPS.map((_,i)=><div key={i} style={{width:step===i?24:8,height:8,borderRadius:4,background:step===i?T.text:T.border,transition:'all 0.3s'}}/>)}
        </div>

        {/* Welcome on first step */}
        {step===0&&<div style={{marginBottom:32,animation:'fadeSlideIn 0.4s ease'}}>
          <h1 style={{fontSize:32,fontFamily:SF,fontWeight:400,color:T.text,margin:'0 0 8px'}}>Bienvenido{userName?`, ${userName}`:''}</h1>
          <p style={{fontSize:15,color:T.ts,margin:0,lineHeight:1.6}}>Focus Day te ayuda a hacer menos, mejor.<br/>Así funciona:</p>
        </div>}

        {/* Step card */}
        <div key={step} style={{background:T.surface,borderRadius:T.rl,padding:'40px 32px',boxShadow:'0 8px 32px rgba(0,0,0,0.06)',animation:'fadeSlideIn 0.3s ease',borderTop:`4px solid ${s.color}`}}>
          <div style={{width:56,height:56,borderRadius:16,background:s.color+'12',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
            <Ic name={s.icon} size={28} color={s.color}/>
          </div>
          <h2 style={{fontSize:24,fontFamily:SF,fontWeight:400,color:T.text,margin:'0 0 6px'}}>{s.title}</h2>
          <p style={{fontSize:14,fontWeight:600,color:s.color,margin:'0 0 16px'}}>{s.sub}</p>
          <p style={{fontSize:14,color:T.ts,margin:0,lineHeight:1.7}}>{s.body}</p>
        </div>

        {/* Nav */}
        <div style={{display:'flex',justifyContent:'center',gap:12,marginTop:28}}>
          {step>0&&<button onClick={()=>setStep(p=>p-1)} style={{padding:'12px 28px',borderRadius:T.rs,border:`1.5px solid ${T.border}`,cursor:'pointer',background:'transparent',color:T.ts,fontSize:14,fontWeight:500,fontFamily:F}}>Atrás</button>}
          <button onClick={()=>{if(isLast)onDone();else setStep(p=>p+1);}} style={{padding:'12px 36px',borderRadius:T.rs,border:'none',cursor:'pointer',background:T.text,color:'#fff',fontSize:14,fontWeight:600,fontFamily:F,transition:'transform 0.2s'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.03)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>{isLast?'Comenzar':'Siguiente'}</button>
        </div>

        {/* Skip */}
        {!isLast&&<button onClick={onDone} style={{background:'none',border:'none',cursor:'pointer',marginTop:16,fontSize:12,color:T.tm,fontFamily:F}}>Saltar intro</button>}
      </div>
    </div>
  );
}

// ─── Task Modal ────────────────────────────────────────────────────
function TaskModal({isOpen,onClose,onSave,onDelete,task,dateStr,category:initCat,tasks,completions,settings,allTags}){
  const [title,setTitle]=useState('');
  const [notes,setNotes]=useState('');
  const [tags,setTags]=useState([]);
  const [tagInput,setTagInput]=useState('');
  const [showTS,setShowTS]=useState(false);
  const [category,setCat]=useState('thing');
  const [date,setDate]=useState(dateStr);
  const [recP,setRecP]=useState('none');
  const [recF,setRecF]=useState('daily');
  const [recI,setRecI]=useState(1);
  const [recD,setRecD]=useState([]);
  const iRef=useRef(null);
  function r2p(r){if(!r||r.type==='none')return'none';if(r.type==='weekdays'){const d=(r.days||[]).sort().join(',');if(d==='1,2,3,4,5')return'weekdays';if(d==='0,6')return'weekends';return'specific_days';}if(r.type==='daily'&&(r.interval||1)===1)return'every_day';if(r.type==='weekly'&&(r.interval||1)===1)return'every_week';if(r.type==='weekly'&&(r.interval||1)===2)return'every_2_weeks';if(r.type==='monthly'){const i=r.interval||1;if(i===1)return'every_month';if(i===3)return'every_3_months';if(i===6)return'every_6_months';if(i===12)return'every_year';}return'custom';}
  function r2f(r){if(!r)return'daily';if(r.type==='daily')return'daily';if(r.type==='weekly')return'weekly';if(r.type==='monthly'&&(r.interval||1)>=12)return'yearly';if(r.type==='monthly')return'monthly';return'daily';}
  useEffect(()=>{if(isOpen){setTitle(task?.title||'');setNotes(task?.notes||'');
    try{setTags(JSON.parse(task?.project||'[]'));}catch{setTags(task?.project?[task.project]:[]);}
    setTagInput('');setCat(task?.category||initCat||'thing');setDate(task?.date||dateStr);const r=task?.recurrence||{type:'none'};setRecP(r2p(r));setRecF(r2f(r));setRecI(r.interval||1);setRecD(r.days||[]);setShowTS(false);setTimeout(()=>iRef.current?.focus(),100);}},[isOpen,task,dateStr,initCat]);
  if(!isOpen)return null;
  const fts=allTags.filter(t=>!tags.includes(t)&&t.toLowerCase().includes(tagInput.toLowerCase()));
  const addTag=(t)=>{if(t&&!tags.includes(t))setTags(p=>[...p,t]);setTagInput('');};
  const removeTag=(t)=>setTags(p=>p.filter(x=>x!==t));
  const save=()=>{
    if(!title.trim())return;
    const c=category,lim=settings.limits[c];
    if(!task){const ex=tasksFor(tasks,date,completions).filter(t=>t.category===c);if(ex.length>=lim){alert(`Límite de ${lim} alcanzado para "${CAT[c].label}". Programa para otro día.`);return;}}
    let rec={type:'none'};
    if(recP==='every_day')rec={type:'daily',interval:1};else if(recP==='weekdays')rec={type:'weekdays',days:[1,2,3,4,5]};else if(recP==='weekends')rec={type:'weekdays',days:[0,6]};else if(recP==='every_week')rec={type:'weekly',interval:1};else if(recP==='every_2_weeks')rec={type:'weekly',interval:2};else if(recP==='every_month')rec={type:'monthly',interval:1};else if(recP==='every_3_months')rec={type:'monthly',interval:3};else if(recP==='every_6_months')rec={type:'monthly',interval:6};else if(recP==='every_year')rec={type:'monthly',interval:12};else if(recP==='specific_days')rec={type:'weekdays',days:recD};else if(recP==='custom'){if(recF==='daily')rec={type:'daily',interval:recI};else if(recF==='weekly')rec={type:'weekly',interval:recI};else if(recF==='monthly')rec={type:'monthly',interval:recI};else if(recF==='yearly')rec={type:'monthly',interval:recI*12};}
    onSave({id:task?.id||uid(),title:title.trim(),notes:notes.trim(),project:JSON.stringify(tags),category:c,date,recurrence:rec,createdAt:task?.createdAt||Date.now()});onClose();
  };
  const togD=(d)=>setRecD(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d].sort());
  const IS={width:'100%',boxSizing:'border-box',padding:'10px 14px',fontSize:14,fontFamily:F,border:`1.5px solid ${T.border}`,borderRadius:T.rs,color:T.text,background:T.bg,outline:'none',transition:'border-color 0.2s'};
  const LS={fontSize:12,fontWeight:500,color:T.ts,display:'block',marginBottom:6};
  return(
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.3)',backdropFilter:'blur(4px)'}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:'relative',background:T.surface,borderRadius:T.rl,width:'min(460px,92vw)',maxHeight:'88vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.15)',fontFamily:F}}>
        <div style={{padding:'24px 24px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <h3 style={{margin:0,fontSize:18,fontWeight:600,color:T.text,fontFamily:SF}}>{task?'Editar tarea':'Nueva tarea'}</h3>
            <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="x" size={20}/></button>
          </div>
          <input ref={iRef} value={title} onChange={e=>setTitle(e.target.value)} placeholder="¿Qué necesitas hacer?" onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey)save();}} style={{...IS,fontSize:15,padding:'12px 14px',borderRadius:T.r}} onFocus={e=>e.target.style.borderColor=T.text} onBlur={e=>e.target.style.borderColor=T.border}/>
          <div style={{display:'flex',gap:8,marginTop:16}}>
            {Object.entries(CAT).map(([k,m])=><button key={k} onClick={()=>setCat(k)} style={{flex:1,padding:'10px 8px',borderRadius:T.rs,cursor:'pointer',border:`1.5px solid ${category===k?m.color:T.border}`,background:category===k?m.bg:'transparent',color:category===k?m.color:T.ts,fontSize:12,fontWeight:600,fontFamily:F,transition:'all 0.2s',letterSpacing:'0.02em',textTransform:'uppercase'}}>{m.label}</button>)}
          </div>
          <div style={{marginTop:16}}>
            <label style={LS}>Fecha</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={IS}/>
          </div>
          <div style={{marginTop:16,position:'relative'}}>
            <label style={LS}>Tags</label>
            {tags.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
              {tags.map(t=>{const c=pColor(t);return<span key={t} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 8px 3px 10px',borderRadius:20,background:c.bg,color:c.text,border:`1px solid ${c.border}`,fontSize:12,fontWeight:500,fontFamily:F}}>{t}<button onClick={()=>removeTag(t)} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',opacity:0.5,transition:'opacity 0.15s'}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.5}><Ic name="x" size={12} color={c.text}/></button></span>;})}
            </div>}
            <input value={tagInput} onChange={e=>{setTagInput(e.target.value);setShowTS(true);}} onFocus={()=>setShowTS(true)} onBlur={()=>setTimeout(()=>setShowTS(false),150)}
              onKeyDown={e=>{if(e.key==='Enter'&&tagInput.trim()){e.preventDefault();addTag(tagInput.trim());}}}
              placeholder={tags.length?'Agregar otro tag...':'Buscar o crear tag...'} style={IS}/>
            {showTS&&(fts.length>0||tagInput.trim())&&<div style={{position:'absolute',left:0,right:0,zIndex:10,marginTop:2,background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.rs,boxShadow:'0 8px 24px rgba(0,0,0,0.1)',maxHeight:150,overflow:'auto'}}>
              {fts.map(t=><button key={t} onMouseDown={()=>addTag(t)} style={{display:'flex',alignItems:'center',gap:6,width:'100%',padding:'8px 12px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,color:T.text,fontFamily:F,textAlign:'left'}} onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHover} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><PPill name={t}/></button>)}
              {tagInput.trim()&&!allTags.includes(tagInput.trim())&&!tags.includes(tagInput.trim())&&<button onMouseDown={()=>addTag(tagInput.trim())} style={{display:'flex',alignItems:'center',gap:6,width:'100%',padding:'8px 12px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,color:T.imp,fontFamily:F,textAlign:'left',fontWeight:500}} onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHover} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>+ Crear "{tagInput.trim()}"</button>}
            </div>}
          </div>
          <div style={{marginTop:16}}><label style={LS}>Notas</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Contexto, links, detalles..." rows={3} style={{...IS,resize:'vertical',lineHeight:1.5,minHeight:64}}/></div>
          <div style={{marginTop:16}}>
            <label style={LS}>Repetir</label>
            <select value={recP} onChange={e=>{setRecP(e.target.value);if(e.target.value==='custom'){setRecF('daily');setRecI(1);}if(e.target.value==='specific_days')setRecD([]);}} style={{...IS,appearance:'auto'}}>
              <option value="none">Nunca</option><option value="every_day">Cada día</option><option value="weekdays">Entre semana</option><option value="weekends">Fines de semana</option><option value="every_week">Cada semana</option><option value="every_2_weeks">Cada dos semanas</option><option value="every_month">Cada mes</option><option value="every_3_months">Cada 3 meses</option><option value="every_6_months">Cada 6 meses</option><option value="every_year">Cada año</option><option value="specific_days">Días específicos</option><option value="custom">Personalizado</option>
            </select>
            {recP==='custom'&&<div style={{marginTop:10,padding:14,background:T.bg,borderRadius:T.rs,border:`1px solid ${T.borderLight}`}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}><span style={{fontSize:13,color:T.ts,flexShrink:0}}>Frecuencia:</span><select value={recF} onChange={e=>setRecF(e.target.value)} style={{...IS,flex:1,width:'auto',padding:'8px 10px',fontSize:13,background:T.surface,appearance:'auto'}}><option value="daily">Cada día</option><option value="weekly">Cada semana</option><option value="monthly">Cada mes</option><option value="yearly">Cada año</option></select></div><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:13,color:T.ts}}>Cada</span><input type="number" min={1} max={99} value={recI} onChange={e=>setRecI(Math.max(1,+e.target.value))} style={{...IS,width:56,textAlign:'center',padding:'8px 10px',background:T.surface}}/><span style={{fontSize:13,color:T.ts}}>{recF==='daily'?'día(s)':recF==='weekly'?'semana(s)':recF==='monthly'?'mes(es)':'año(s)'}</span></div></div>}
            {recP==='specific_days'&&<div style={{marginTop:10}}><span style={{fontSize:12,color:T.ts,display:'block',marginBottom:8}}>Selecciona los días:</span><div style={{display:'flex',gap:6,justifyContent:'space-between'}}>{dayNames.map((d,i)=><button key={i} onClick={()=>togD(i)} style={{flex:1,maxWidth:46,height:42,borderRadius:T.rs,border:`1.5px solid ${recD.includes(i)?T.text:T.border}`,background:recD.includes(i)?T.text:'transparent',color:recD.includes(i)?'#fff':T.ts,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}}>{d}</button>)}</div></div>}
          </div>
        </div>
        <div style={{padding:'20px 24px',display:'flex',gap:10,justifyContent:task?'space-between':'flex-end',marginTop:8}}>
          {task&&<button onClick={()=>{onDelete(task.id);onClose();}} style={{padding:'10px 16px',borderRadius:T.rs,border:'none',cursor:'pointer',background:'#fef2f2',color:'#ef4444',fontSize:13,fontWeight:600,fontFamily:F,display:'flex',alignItems:'center',gap:6}}><Ic name="trash" size={15}/>Eliminar</button>}
          <div style={{display:'flex',gap:10}}>
            <button onClick={onClose} style={{padding:'10px 20px',borderRadius:T.rs,border:`1.5px solid ${T.border}`,cursor:'pointer',background:'transparent',color:T.ts,fontSize:13,fontWeight:500,fontFamily:F}}>Cancelar</button>
            <button onClick={save} style={{padding:'10px 24px',borderRadius:T.rs,border:'none',cursor:'pointer',background:T.text,color:'#fff',fontSize:13,fontWeight:600,fontFamily:F,opacity:title.trim()?1:0.4}}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({isOpen,onClose,settings,onSave,showRec,setShowRec}){
  const [lim,setLim]=useState(settings.limits);
  const [sc,setSc]=useState(settings.shortcut||'n');
  const [dark,setDark]=useState(settings.dark||false);
  const [ww,setWw]=useState(settings.workWeek||false);
  useEffect(()=>{if(isOpen){setLim(settings.limits);setSc(settings.shortcut||'n');setDark(settings.dark||false);setWw(settings.workWeek||false);}},[isOpen,settings]);
  if(!isOpen)return null;
  return(<div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}><div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.3)',backdropFilter:'blur(4px)'}}/><div onClick={e=>e.stopPropagation()} style={{position:'relative',background:T.surface,borderRadius:T.rl,width:'min(400px,90vw)',boxShadow:'0 20px 60px rgba(0,0,0,0.15)',fontFamily:F,padding:24}}>
    <h3 style={{margin:'0 0 20px',fontSize:18,fontWeight:600,fontFamily:SF,color:T.text}}>Configuración</h3>
    <p style={{fontSize:13,color:T.ts,margin:'0 0 16px'}}>Límite de tareas por categoría.</p>
    {Object.entries(CAT).map(([k,m])=><div key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:`1px solid ${T.borderLight}`}}><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:10,height:10,borderRadius:'50%',background:m.color}}/><span style={{fontSize:14,fontWeight:500,color:T.text}}>{m.label}</span></div><input type="number" min={1} max={99} value={lim[k]} onChange={e=>setLim(p=>({...p,[k]:Math.max(1,+e.target.value)}))} style={{width:56,padding:'8px 10px',fontSize:14,fontFamily:F,textAlign:'center',border:`1.5px solid ${T.border}`,borderRadius:T.rs,color:T.text,background:T.bg,outline:'none'}}/></div>)}
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 0 0',marginTop:4,borderTop:`1px solid ${T.borderLight}`}}>
      <div><span style={{fontSize:14,fontWeight:500,color:T.text}}>Atajo nueva tarea</span><span style={{fontSize:12,color:T.tm,display:'block',marginTop:2}}>Tecla para abrir el modal</span></div>
      <input value={sc} onChange={e=>{const v=e.target.value.slice(-1).toLowerCase();if(v&&/^[a-z]$/.test(v))setSc(v);}} onKeyDown={e=>{if(e.key.length===1&&/^[a-z]$/i.test(e.key)){e.preventDefault();setSc(e.key.toLowerCase());}}} style={{width:44,height:44,padding:0,fontSize:18,fontFamily:F,textAlign:'center',fontWeight:700,border:`1.5px solid ${T.border}`,borderRadius:T.rs,color:T.text,background:T.bg,outline:'none',textTransform:'uppercase'}}/>
    </div>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 0 0',marginTop:4}}>
      <div><span style={{fontSize:14,fontWeight:500,color:T.text}}>Recurrencias futuras</span><span style={{fontSize:12,color:T.tm,display:'block',marginTop:2}}>Mostrar todas o solo la próxima</span></div>
      <Toggle on={showRec} onToggle={()=>setShowRec(p=>!p)} label={showRec?'Todas':'Próxima'}/>
    </div>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 0 0',marginTop:4}}>
      <div><span style={{fontSize:14,fontWeight:500,color:T.text}}>Semana laboral</span><span style={{fontSize:12,color:T.tm,display:'block',marginTop:2}}>Mostrar Lun–Vie como default</span></div>
      <Toggle on={ww} onToggle={()=>setWw(p=>!p)}/>
    </div>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 0 0',marginTop:4}}>
      <div><span style={{fontSize:14,fontWeight:500,color:T.text}}>Modo oscuro</span><span style={{fontSize:12,color:T.tm,display:'block',marginTop:2}}>Cambiar tema de la interfaz</span></div>
      <Toggle on={dark} onToggle={()=>setDark(p=>!p)}/>
    </div>
    <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:20}}>
      <button onClick={onClose} style={{padding:'10px 20px',borderRadius:T.rs,border:`1.5px solid ${T.border}`,cursor:'pointer',background:'transparent',color:T.ts,fontSize:13,fontWeight:500,fontFamily:F}}>Cancelar</button>
      <button onClick={()=>{onSave({...settings,limits:lim,shortcut:sc,dark,workWeek:ww});onClose();}} style={{padding:'10px 24px',borderRadius:T.rs,border:'none',cursor:'pointer',background:T.text,color:'#fff',fontSize:13,fontWeight:600,fontFamily:F}}>Guardar</button>
    </div>
  </div></div>);
}

function TaskItem({task,onToggle,onEdit,onCatDrag}){
  const m=CAT[task.category],[hov,setHov]=useState(false),[exp,setExp]=useState(false),[justChecked,setJC]=useState(false);
  const hasN=!!task.notes;
  const doToggle=()=>{if(!task.completed)setJC(true);onToggle();setTimeout(()=>setJC(false),600);};
  return(<div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} draggable
    onDragStart={e=>{e.dataTransfer.setData('text/plain',JSON.stringify({id:task.id,cat:task.category}));e.dataTransfer.effectAllowed='move';}}>
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:T.rs,cursor:'grab',transition:'all 0.15s',background:hov?T.surfaceHover:'transparent',borderLeft:`3px solid ${m.color}`,marginLeft:0}}>
      <button onClick={e=>{e.stopPropagation();doToggle();}} style={{width:20,height:20,borderRadius:6,border:`2px solid ${task.completed?m.color:T.border}`,background:task.completed?m.color:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.25s',padding:0,transform:justChecked?'scale(1.2)':'scale(1)'}}>
        {task.completed&&<svg width="13" height="13" viewBox="0 0 24 24" style={{flexShrink:0}}><polyline points="20 6 9 17 4 12" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{strokeDasharray:30,strokeDashoffset:justChecked?30:0,animation:justChecked?'drawCheck 0.4s ease forwards':'none'}}/></svg>}
      </button>
      <div style={{flex:1,minWidth:0}} onClick={doToggle}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:14,color:task.completed?T.tm:T.text,textDecoration:task.completed?'line-through':'none',fontFamily:F,lineHeight:1.4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',transition:'color 0.3s'}}>{task.title}</span>
          {task.project&&(()=>{try{const tgs=JSON.parse(task.project);return Array.isArray(tgs)?tgs.map(t=><PPill key={t} name={t}/>):<PPill name={task.project}/>;}catch{return<PPill name={task.project}/>;}})()}
        </div>
      </div>
      {task.recurrence?.type&&task.recurrence.type!=='none'&&<Ic name="repeat" size={14}/>}
      {hasN&&<button onClick={e=>{e.stopPropagation();setExp(!exp);}} style={{background:'none',border:'none',cursor:'pointer',padding:2,opacity:exp?1:0.4,transition:'opacity 0.2s'}}><Ic name="note" size={14}/></button>}
      {hov&&<button onClick={e=>{e.stopPropagation();onEdit();}} style={{background:'none',border:'none',cursor:'pointer',padding:2,opacity:0.5,transition:'opacity 0.15s'}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.5}><Ic name="edit" size={11}/></button>}
    </div>
    {exp&&hasN&&<div style={{margin:'0 12px 8px 42px',padding:'8px 12px',background:T.bg,borderRadius:T.rs,border:`1px solid ${T.borderLight}`,fontSize:13,color:T.ts,lineHeight:1.5,fontFamily:F,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{task.notes}</div>}
  </div>);
}

const EMPTY_MSG={thing:['¿Cuál es tu batalla principal hoy?','Define tu prioridad #1','¿Qué moverá la aguja hoy?'],important:['¿Qué 3 cosas importan hoy?','Agrega tus tareas clave','¿Qué debes entregar?'],maintenance:['Tareas rápidas y sencillas','Lo que no requiere enfoque','Correos, admin, rutina']};
const EMPTY_SVG={thing:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.7"/></svg>,important:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.5" opacity="0.35" fill="none"/></svg>,maintenance:<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" opacity="0.25" strokeLinecap="round"/></svg>};

function CatSection({category,tasks,onToggle,onEdit,onAdd,onQuickAdd,onCatChange,limit,dateStr}){
  const m=CAT[category],at=tasks.length>=limit,dc=tasks.filter(t=>t.completed).length;
  const isThing=category==='thing';
  const [qaOpen,setQaOpen]=useState(false),[qaVal,setQaVal]=useState('');
  const [dragOver,setDragOver]=useState(false);
  const qaRef=useRef(null);
  const doQA=()=>{if(qaVal.trim()){onQuickAdd(qaVal.trim(),category);setQaVal('');setQaOpen(false);}};
  const emptyMsg=EMPTY_MSG[category][Math.floor(Date.now()/86400000)%EMPTY_MSG[category].length];
  return(<div style={{marginBottom:isThing?28:20}}
    onDragOver={e=>{e.preventDefault();setDragOver(true);}}
    onDragLeave={()=>setDragOver(false)}
    onDrop={e=>{e.preventDefault();setDragOver(false);try{const d=JSON.parse(e.dataTransfer.getData('text/plain'));if(d.id&&d.cat!==category)onCatChange(d.id,category);}catch{}}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,padding:'0 4px'}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <Ic name={m.icon} size={isThing?18:16} color={m.color}/><span style={{fontSize:isThing?14:13,fontWeight:isThing?700:600,color:m.color,textTransform:'uppercase',letterSpacing:'0.06em',fontFamily:F}}>{m.label}</span>
        {tasks.length>0&&<span style={{fontSize:11,color:dc===tasks.length?T.ok:T.tm,fontFamily:F,fontWeight:dc===tasks.length?600:400}}>{dc}/{tasks.length}</span>}
      </div>
      <button onClick={()=>{if(!at){setQaOpen(true);setTimeout(()=>qaRef.current?.focus(),50);}}} disabled={at} title={at?'Límite alcanzado':'Agregar tarea'} style={{background:'none',border:'none',cursor:at?'not-allowed':'pointer',padding:2,opacity:at?0.15:0.5,transition:'opacity 0.2s'}} onMouseEnter={e=>{if(!at)e.target.style.opacity=1}} onMouseLeave={e=>{if(!at)e.target.style.opacity=0.5}}><Ic name="plus" size={16} color={m.color}/></button>
    </div>
    <div data-animate="" style={{background:isThing?`linear-gradient(135deg,${T.thingBg},${T.surface})`:T.surface,borderRadius:T.r,border:dragOver?`2px dashed ${m.color}`:isThing?`1.5px solid ${T.thing}22`:`1px solid ${T.borderLight}`,minHeight:tasks.length||qaOpen?'auto':56,overflow:'hidden',transition:'border 0.2s',padding:isThing&&tasks.length===0&&!qaOpen?'4px 0':0}}>
      {tasks.length===0&&!qaOpen&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'16px 0',gap:6,color:m.color,opacity:0.4,cursor:'pointer'}} onClick={()=>{if(!at){setQaOpen(true);setTimeout(()=>qaRef.current?.focus(),50);}}}>
        {EMPTY_SVG[category]}
        <span style={{fontSize:12,fontFamily:F,fontStyle:'italic'}}>{emptyMsg}</span>
      </div>}
      {tasks.map(t=><TaskItem key={t.id+'_'+t.date} task={t} onToggle={()=>onToggle(t)} onEdit={()=>onEdit(t)}/>)}
      {qaOpen&&<div style={{padding:'8px 12px',display:'flex',gap:8,alignItems:'center'}}>
        <input ref={qaRef} value={qaVal} onChange={e=>setQaVal(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')doQA();if(e.key==='Escape'){setQaOpen(false);setQaVal('');}}} placeholder="Escribe y Enter..." style={{flex:1,padding:'8px 10px',fontSize:13,fontFamily:F,border:`1.5px solid ${m.color}44`,borderRadius:T.rs,outline:'none',background:'transparent',color:T.text}} onBlur={()=>{if(!qaVal.trim()){setQaOpen(false);setQaVal('');}}}/>
        <button onClick={doQA} style={{background:m.color,color:'#fff',border:'none',borderRadius:T.rs,padding:'6px 12px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,opacity:qaVal.trim()?1:0.4}}>+</button>
      </div>}
    </div>
  </div>);
}

function Heatmap({tasks,completions}){
  const today=new Date(),cells=[];
  for(let i=89;i>=0;i--){const d=addDays(today,-i),ds=fmt(d),dt=tasksFor(tasks,ds,completions),tot=dt.length,done=dt.filter(t=>t.completed).length;
    const pct=tot>0?done/tot:0;const col=tot===0?T.borderLight:pct===1?T.ok:pct>=0.5?'#86efac':pct>0?'#fde68a':T.border;
    cells.push({ds,col,d,pct,tot});
  }
  return(<div style={{marginTop:16}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:11,fontWeight:600,color:T.tm,letterSpacing:'0.05em',fontFamily:F,textTransform:'uppercase'}}>Últimos 90 días</span></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(13,1fr)',gap:3}}>{cells.map(c=><div key={c.ds} title={`${c.d.getDate()}/${c.d.getMonth()+1} — ${c.tot>0?Math.round(c.pct*100)+'%':'sin tareas'}`} style={{aspectRatio:'1',borderRadius:3,background:c.col,transition:'transform 0.15s',cursor:'default',minWidth:0}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.3)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>)}</div>
    <div style={{display:'flex',gap:4,alignItems:'center',justifyContent:'flex-end',marginTop:6}}>
      <span style={{fontSize:9,color:T.tm,fontFamily:F}}>Menos</span>
      {[T.borderLight,T.border,'#fde68a','#86efac',T.ok].map((c,i)=><div key={i} style={{width:10,height:10,borderRadius:2,background:c}}/>)}
      <span style={{fontSize:9,color:T.tm,fontFamily:F}}>Más</span>
    </div>
  </div>);
}

function DayView({dateStr,tasks,completions,onToggle,onEdit,onAdd,onQuickAdd,onCatChange,settings}){
  const dt=useMemo(()=>tasksFor(tasks,dateStr,completions),[tasks,dateStr,completions]);
  const d=parseDate(dateStr),done=dt.filter(t=>t.completed).length,tot=dt.length,pct=tot>0?Math.round(done/tot*100):0;
  return(<div key={dateStr} style={{animation:'fadeSlideIn 0.2s ease'}}>
    {tot>0&&<div style={{display:'flex',justifyContent:'center',marginBottom:20}}><PRing pct={pct} size={64}/></div>}
    <div style={{marginBottom:20}}>
      <h2 style={{margin:0,fontSize:36,fontWeight:400,color:T.text,fontFamily:SF,lineHeight:1.1}}>{d.getDate()} <span style={{fontSize:24,color:T.ts}}>{monthNames[d.getMonth()]}</span></h2>
      <p style={{margin:'4px 0 0',fontSize:14,color:T.tm,fontFamily:F}}>{dayNamesFull[d.getDay()]}</p>
    </div>
    {['thing','important','maintenance'].map(c=><CatSection key={c} category={c} tasks={dt.filter(t=>t.category===c)} onToggle={onToggle} onEdit={onEdit} onAdd={()=>onAdd(c)} onQuickAdd={onQuickAdd} onCatChange={onCatChange} limit={settings.limits[c]} dateStr={dateStr}/>)}
    <Heatmap tasks={tasks} completions={completions}/>
  </div>);
}

function MonthView({year,month,today,selectedDate,onSelectDate,onDoubleClickDate,tasks,completions}){
  const dim=getDaysInMonth(year,month),fd=getFirstDayOfMonth(year,month),cells=[];
  for(let i=0;i<fd;i++)cells.push(null);for(let d=1;d<=dim;d++)cells.push(d);
  const rows=Math.ceil(cells.length/7);
  return(<div style={{display:'flex',flexDirection:'column',flex:1}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:4}}>{dayNames.map(d=><div key={d} style={{textAlign:'center',fontSize:11,fontWeight:600,color:T.tm,padding:'6px 0',fontFamily:F,letterSpacing:'0.05em'}}>{d}</div>)}</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gridTemplateRows:`repeat(${rows},1fr)`,gap:4,flex:1}}>{cells.map((day,i)=>{
      if(!day)return<div key={`e${i}`}/>;
      const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,isT=ds===fmt(today),isS=ds===selectedDate,dt=tasksFor(tasks,ds,completions),hT=dt.some(t=>t.category==='thing'),hI=dt.some(t=>t.category==='important'),hM=dt.some(t=>t.category==='maintenance'),ad=dt.length>0&&dt.every(t=>t.completed);
      return<button key={ds} onClick={()=>onSelectDate(ds)} onDoubleClick={()=>onDoubleClickDate(ds)} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,border:'none',borderRadius:T.rs,cursor:'pointer',background:isS?T.accentSoft:'transparent',fontFamily:F,transition:'all 0.2s',boxShadow:isT?`0 0 0 2px ${T.text}, 0 0 12px rgba(28,25,23,0.08)`:isS?`0 0 0 2px ${T.text}`:'none'}}
        onMouseEnter={e=>{if(!isT&&!isS)e.currentTarget.style.transform='translateY(-2px)';if(!isT&&!isS)e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.06)';}}
        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=isT?`0 0 0 2px ${T.text}, 0 0 12px rgba(28,25,23,0.08)`:isS?`0 0 0 2px ${T.text}`:'none';}}
      ><span style={{fontSize:14,fontWeight:isT?700:400,color:isT?T.text:T.ts}}>{day}</span>{dt.length>0&&<div style={{display:'flex',gap:2}}>{hT&&<div style={{width:5,height:5,borderRadius:'50%',background:ad?T.ok:T.thing}}/>}{hI&&<div style={{width:5,height:5,borderRadius:'50%',background:ad?T.ok:T.imp}}/>}{hM&&<div style={{width:5,height:5,borderRadius:'50%',background:ad?T.ok:T.maint}}/>}</div>}</button>;
    })}</div>
  </div>);
}

function WeekView({weekStart,today,selectedDate,onSelectDate,onDoubleClickDate,tasks,completions,onMoveTask,settings}){
  const ww=settings?.workWeek;
  const dn=ww?['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']:dayNames;
  const allDays=Array.from({length:21},(_,i)=>addDays(weekStart,i));
  const days=ww?allDays.filter(d=>{const dw=d.getDay();return dw>=1&&dw<=5;}):allDays;
  const cols=ww?5:7;const rows=ww?3:3;
  const maxTasks=(settings?.limits?.thing||1)+(settings?.limits?.important||3)+(settings?.limits?.maintenance||99);
  const capLoad=Math.min(maxTasks,8);
  const tr={display:'block',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'100%'};
  const [dragOver,setDragOver]=useState(null);
  return(<div style={{display:'flex',flexDirection:'column',flex:1}}>
    <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:2,marginBottom:4}}>{dn.slice(0,cols).map(d=><div key={d} style={{textAlign:'center',fontSize:11,fontWeight:600,color:T.tm,padding:'6px 0',fontFamily:F,letterSpacing:'0.05em'}}>{d}</div>)}</div>
    <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gridTemplateRows:`repeat(${rows},1fr)`,gap:6,flex:1}}>{days.map(d=>{
    const ds=fmt(d),isT=ds===fmt(today),isS=ds===selectedDate,dt=tasksFor(tasks,ds,completions),tt=dt.find(t=>t.category==='thing'),im=dt.filter(t=>t.category==='important'),ma=dt.filter(t=>t.category==='maintenance'),hT=!!tt,hI=im.length>0,hM=ma.length>0,ad=dt.length>0&&dt.every(t=>t.completed);
    const load=Math.min(dt.length/capLoad,1);const loadCol=ad?T.ok:load>0.7?T.thing:load>0.4?'#f59e0b':T.imp;
    return<div key={ds} onClick={()=>onSelectDate(ds)} onDoubleClick={()=>onDoubleClickDate(ds)}
      onDragOver={e=>{e.preventDefault();setDragOver(ds);}}
      onDragLeave={()=>setDragOver(null)}
      onDrop={e=>{e.preventDefault();setDragOver(null);const tid=e.dataTransfer.getData('text/plain');if(tid)onMoveTask(tid,ds);}}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=isT?`0 0 0 2px ${T.text}, 0 6px 20px rgba(0,0,0,0.1)`:'0 6px 20px rgba(0,0,0,0.08)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=isT?`0 0 0 2px ${T.text}, 0 0 12px rgba(28,25,23,0.08)`:isS?`0 0 0 2px ${T.text}`:'0 1px 4px rgba(0,0,0,0.04)';}}
      style={{padding:'10px 8px',borderRadius:T.r,cursor:'pointer',textAlign:'left',border:dragOver===ds?`2px dashed ${T.imp}`:'none',background:dragOver===ds?T.impBg:isS?T.accentSoft:T.surface,fontFamily:F,transition:'all 0.2s',display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0,minHeight:0,position:'relative',boxShadow:isT?`0 0 0 2px ${T.text}, 0 0 12px rgba(28,25,23,0.08)`:isS?`0 0 0 2px ${T.text}`:'0 1px 4px rgba(0,0,0,0.04)'}}>
      {/* Load indicator bar */}
      {dt.length>0&&<div style={{position:'absolute',top:0,left:0,right:0,height:3,background:T.borderLight,borderRadius:'6px 6px 0 0',overflow:'hidden'}}><div style={{height:'100%',width:`${load*100}%`,background:loadCol,borderRadius:3,transition:'width 0.3s ease'}}/></div>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}><span style={{fontSize:10,color:T.tm}}>{monthNames[d.getMonth()].slice(0,3)}</span><span style={{fontSize:15,fontWeight:isT?700:400,color:isT?T.text:T.ts}}>{d.getDate()}</span></div>
      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column',gap:2,minWidth:0}}>
        {tt&&<div draggable onDragStart={e=>e.dataTransfer.setData('text/plain',tt.id)} style={{fontSize:11,padding:'3px 6px',borderRadius:4,background:tt.completed?T.okBg:T.thingBg,color:tt.completed?T.ok:T.thing,fontWeight:500,textDecoration:tt.completed?'line-through':'none',cursor:'grab',...tr}}>{tt.title}</div>}
        {im.slice(0,3).map(t=><div key={t.id} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',t.id)} style={{fontSize:10,padding:'2px 6px',borderRadius:3,color:t.completed?T.ok:T.imp,textDecoration:t.completed?'line-through':'none',cursor:'grab',...tr}}>{t.title}</div>)}
        {ma.slice(0,2).map(t=><div key={t.id} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',t.id)} style={{fontSize:10,padding:'2px 6px',borderRadius:3,color:t.completed?T.ok:T.maint,textDecoration:t.completed?'line-through':'none',cursor:'grab',...tr}}>{t.title}</div>)}
      </div>
      {dt.length>0&&<div style={{display:'flex',gap:3,paddingTop:4,justifyContent:'center'}}>{hT&&<div style={{width:5,height:5,borderRadius:'50%',background:ad?T.ok:T.thing}}/>}{hI&&<div style={{width:5,height:5,borderRadius:'50%',background:ad?T.ok:T.imp}}/>}{hM&&<div style={{width:5,height:5,borderRadius:'50%',background:ad?T.ok:T.maint}}/>}</div>}
    </div>;
  })}</div>
  </div>);
}

// ─── Backlog (tasks without date) ──────────────────────────────────
function Backlog({tasks,onEdit,onMoveToDate,onQuickAdd,onDelete}){
  const bl=tasks.filter(t=>t.date===BL_DATE);
  const [qaOpen,setQaOpen]=useState(false),[qaVal,setQaVal]=useState(''),[dragOver,setDragOver]=useState(false);
  const qaRef=useRef(null);
  const doQA=()=>{if(qaVal.trim()){onQuickAdd(qaVal.trim());setQaVal('');setQaOpen(false);}};
  return(
    <div
      onDragOver={e=>{e.preventDefault();setDragOver(true);}}
      onDragLeave={()=>setDragOver(false)}
      onDrop={e=>{e.preventDefault();setDragOver(false);try{const d=JSON.parse(e.dataTransfer.getData('text/plain'));if(d.id)onMoveToDate(d.id,BL_DATE);}catch{const tid=e.dataTransfer.getData('text/plain');if(tid)onMoveToDate(tid,BL_DATE);}}}
      style={{marginTop:20,borderTop:`1px solid ${T.borderLight}`,paddingTop:16,transition:'all 0.2s'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Ic name="inbox" size={16} color={T.tm}/>
          <span style={{fontSize:13,fontWeight:600,color:T.tm,textTransform:'uppercase',letterSpacing:'0.06em',fontFamily:F}}>Backlog</span>
          {bl.length>0&&<span style={{fontSize:11,color:T.tm,fontFamily:F}}>{bl.length}</span>}
        </div>
        <button onClick={()=>{setQaOpen(true);setTimeout(()=>qaRef.current?.focus(),50);}} style={{background:'none',border:'none',cursor:'pointer',padding:2,opacity:0.5,transition:'opacity 0.2s'}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.5}><Ic name="plus" size={15} color={T.tm}/></button>
      </div>
      <div style={{background:dragOver?T.impBg:T.surface,borderRadius:T.r,border:dragOver?`2px dashed ${T.imp}`:`1px dashed ${T.borderLight}`,minHeight:bl.length||qaOpen?'auto':48,overflow:'hidden',transition:'all 0.2s'}}>
        {bl.length===0&&!qaOpen&&<div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'14px 0',gap:6,opacity:0.3}}>
          <Ic name="inbox" size={14} color={T.tm}/><span style={{fontSize:12,color:T.tm,fontFamily:F,fontStyle:'italic'}}>Arrastra tareas aquí o agrega nuevas</span>
        </div>}
        {bl.map(t=>(
          <div key={t.id} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',t.id)}
            style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',cursor:'grab',transition:'background 0.15s',borderLeft:`3px solid ${T.tm}`}}
            onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHover}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <span style={{flex:1,fontSize:13,color:T.text,fontFamily:F,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</span>
            {t.project&&(()=>{try{const tgs=JSON.parse(t.project);return Array.isArray(tgs)?tgs.map(tg=><PPill key={tg} name={tg}/>):<PPill name={t.project}/>;}catch{return<PPill name={t.project}/>;}})()}
            <button onClick={e=>{e.stopPropagation();onEdit(t);}} style={{background:'none',border:'none',cursor:'pointer',padding:2,opacity:0.4,transition:'opacity 0.15s',flexShrink:0}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.4}><Ic name="edit" size={11}/></button>
          </div>
        ))}
        {qaOpen&&<div style={{padding:'8px 12px',display:'flex',gap:8,alignItems:'center'}}>
          <input ref={qaRef} value={qaVal} onChange={e=>setQaVal(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')doQA();if(e.key==='Escape'){setQaOpen(false);setQaVal('');}}} placeholder="Nueva tarea sin fecha..." style={{flex:1,padding:'8px 10px',fontSize:13,fontFamily:F,border:`1.5px solid ${T.border}`,borderRadius:T.rs,outline:'none',background:'transparent',color:T.text}} onBlur={()=>{if(!qaVal.trim()){setQaOpen(false);setQaVal('');}}}/>
          <button onClick={doQA} style={{background:T.text,color:'#fff',border:'none',borderRadius:T.rs,padding:'6px 12px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,opacity:qaVal.trim()?1:0.4}}>+</button>
        </div>}
      </div>
    </div>
  );
}

// ─── Focus Mode with Pomodoro ─────────────────────────────────────
function FocusMode({task,onToggle,onExit}){
  const [sec,setSec]=useState(25*60),[running,setRunning]=useState(false),[mode,setMode]=useState('work');
  const intRef=useRef(null);
  useEffect(()=>{if(running){intRef.current=setInterval(()=>setSec(p=>{if(p<=1){clearInterval(intRef.current);setRunning(false);const next=mode==='work'?'break':'work';setMode(next);return next==='break'?5*60:25*60;}return p-1;}),1000);}else clearInterval(intRef.current);return()=>clearInterval(intRef.current);},[running,mode]);
  const mm=String(Math.floor(sec/60)).padStart(2,'0'),ss=String(sec%60).padStart(2,'0');
  const pct=mode==='work'?(1-sec/(25*60))*100:(1-sec/(5*60))*100;
  const sz=180,sw=6,r=(sz-sw)/2,ci=2*Math.PI*r,off=ci-(pct/100)*ci;
  return(
    <div style={{position:'fixed',inset:0,zIndex:900,background:T.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:F,transition:'opacity 0.3s'}}>
      <button onClick={onExit} style={{position:'absolute',top:24,right:32,background:'none',border:'none',cursor:'pointer',padding:8,opacity:0.5}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.5}><Ic name="x" size={24} color={T.ts}/></button>
      <span style={{fontSize:12,fontWeight:600,color:mode==='work'?T.thing:T.ok,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:24}}>{mode==='work'?'Enfoque':'Descanso'}</span>
      <div style={{position:'relative',width:sz,height:sz,marginBottom:32}}>
        <svg width={sz} height={sz} style={{transform:'rotate(-90deg)'}}><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={T.border} strokeWidth={sw}/><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={mode==='work'?T.thing:T.ok} strokeWidth={sw} strokeDasharray={ci} strokeDashoffset={off} strokeLinecap="round" style={{transition:'stroke-dashoffset 1s linear'}}/></svg>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:48,fontWeight:300,color:T.text,fontFamily:F,letterSpacing:'-0.02em'}}>{mm}:{ss}</span>
        </div>
      </div>
      {task&&<div style={{textAlign:'center',marginBottom:32,maxWidth:400}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:8}}><Ic name="target" size={20}/><span style={{fontSize:20,fontWeight:600,color:T.text,fontFamily:SF}}>{task.title}</span></div>
        {task.notes&&<p style={{fontSize:13,color:T.ts,margin:0,lineHeight:1.5}}>{task.notes}</p>}
      </div>}
      <div style={{display:'flex',gap:12}}>
        <button onClick={()=>setRunning(p=>!p)} style={{width:56,height:56,borderRadius:'50%',background:mode==='work'?T.thing:T.ok,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(0,0,0,0.15)',transition:'transform 0.2s'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}><Ic name={running?'pause':'focus'} size={22} color="#fff"/></button>
        {task&&!task.completed&&<button onClick={()=>{onToggle();onExit();}} style={{padding:'14px 28px',borderRadius:T.r,border:`1.5px solid ${T.border}`,background:T.surface,cursor:'pointer',fontSize:14,fontWeight:600,color:T.text,fontFamily:F,transition:'all 0.2s'}} onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHover} onMouseLeave={e=>e.currentTarget.style.background=T.surface}>Completar tarea</button>}
      </div>
      <div style={{display:'flex',gap:8,marginTop:20}}>
        {[15,25,45].map(m=><button key={m} onClick={()=>{setSec(m*60);setRunning(false);setMode('work');}} style={{padding:'6px 14px',borderRadius:T.rs,border:`1px solid ${sec===m*60&&mode==='work'?T.text:T.border}`,background:sec===m*60&&mode==='work'?T.accentSoft:'transparent',cursor:'pointer',fontSize:12,color:T.ts,fontFamily:F}}>{m}min</button>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
export default function FocusDay({supabase,user,onSignOut}){
  const [loaded,setLoaded]=useState(false),[tasks,setTasks]=useState([]),[comp,setComp]=useState({}),[settings,setSettings]=useState(DSET);
  const [rightView,setRightView]=useState('week'),[today]=useState(new Date()),[selD,setSelD]=useState(fmt(new Date()));
  const [cM,setCM]=useState(new Date().getMonth()),[cY,setCY]=useState(new Date().getFullYear()),[wS,setWS]=useState(startOfWeek(new Date()));
  const [mOpen,setMOpen]=useState(false),[eTask,setETask]=useState(null),[aCat,setACat]=useState(null),[sOpen,setSOpen]=useState(false),[showRec,setShowRec]=useState(true);
  const [focusMode,setFocusMode]=useState(false);
  const allTags=useMemo(()=>{const s=new Set();tasks.forEach(t=>{if(t.project){try{const a=JSON.parse(t.project);if(Array.isArray(a))a.forEach(x=>s.add(x));else if(t.project)s.add(t.project);}catch{s.add(t.project);}}});return[...s].sort();},[tasks]);
  // When showRec is off, show only the next uncompleted occurrence per recurring task
  const calTasks=useMemo(()=>{
    if(showRec)return tasks;
    return tasks.map(t=>{
      if(!t.recurrence||t.recurrence.type==='none')return t;
      const now=new Date();
      for(let i=0;i<365;i++){
        const d=addDays(now,i),ds=fmt(d);
        if(shouldTaskAppear(t,ds)&&!comp[`${t.id}::${ds}`]){
          return{...t,date:ds,recurrence:{type:'none'}};
        }
      }
      return{...t,recurrence:{type:'none'}};
    });
  },[tasks,showRec,comp]);

  useEffect(()=>{function onK(e){if(mOpen||sOpen){if(e.key==='Escape'){setMOpen(false);setSOpen(false);setETask(null);}return;}const sd=parseDate(selD);if(e.key==='ArrowLeft'){e.preventDefault();setSelD(fmt(addDays(sd,-1)));}if(e.key==='ArrowRight'){e.preventDefault();setSelD(fmt(addDays(sd,1)));}if(e.key===(settings.shortcut||'n')&&!e.metaKey&&!e.ctrlKey&&document.activeElement?.tagName!=='INPUT'&&document.activeElement?.tagName!=='TEXTAREA'&&document.activeElement?.tagName!=='SELECT'){e.preventDefault();setETask(null);setACat('thing');setMOpen(true);}}window.addEventListener('keydown',onK);return()=>window.removeEventListener('keydown',onK);},[mOpen,sOpen,selD,settings.shortcut]);

  useEffect(()=>{document.documentElement.setAttribute('data-theme',settings.dark?'dark':'light');},[settings.dark]);

  useEffect(()=>{if(!user)return;async function ld(){
    const{data:tr}=await supabase.from('tasks').select('*').eq('user_id',user.id);
    setTasks((tr||[]).map(r=>({id:r.id,title:r.title,notes:r.notes||'',project:r.project||'',category:r.category,date:r.date,recurrence:r.recurrence||{type:'none'},createdAt:r.created_at})));
    const{data:cr}=await supabase.from('completions').select('*').eq('user_id',user.id);const lc={};(cr||[]).forEach(r=>{lc[`${r.task_id}::${r.date}`]=true;});setComp(lc);
    const{data:sr}=await supabase.from('user_settings').select('*').eq('user_id',user.id).single();
    const rawLim=sr?.limits||{};const{_shortcut,_dark,_workWeek,_onboarded,...limOnly}=rawLim;
    setSettings(sr?{limits:{...DSET.limits,...limOnly},shortcut:_shortcut||'n',dark:!!_dark,workWeek:!!_workWeek,onboarded:!!_onboarded}:DSET);setLoaded(true);
  }ld();},[user,supabase]);

  const saveTask=useCallback(async(t)=>{setTasks(p=>{const i=p.findIndex(x=>x.id===t.id);if(i>=0){const n=[...p];n[i]=t;return n;}return[...p,t];});await supabase.from('tasks').upsert({id:t.id,user_id:user.id,title:t.title,notes:t.notes||'',project:t.project||'',category:t.category,date:t.date,recurrence:t.recurrence,created_at:t.createdAt});},[supabase,user]);
  const delTask=useCallback(async(id)=>{setTasks(p=>p.filter(t=>t.id!==id));setComp(p=>{const n={...p};Object.keys(n).filter(k=>k.startsWith(id+'::')).forEach(k=>delete n[k]);return n;});await supabase.from('tasks').delete().eq('id',id).eq('user_id',user.id);},[supabase,user]);
  const toggle=useCallback(async(task)=>{const k=`${task.id}::${selD}`,was=!!comp[k];setComp(p=>{const n={...p};if(was)delete n[k];else n[k]=true;return n;});if(was)await supabase.from('completions').delete().eq('user_id',user.id).eq('task_id',task.id).eq('date',selD);else await supabase.from('completions').insert({user_id:user.id,task_id:task.id,date:selD});},[supabase,user,selD,comp]);
  const saveSets=useCallback(async(s)=>{setSettings(s);await supabase.from('user_settings').upsert({user_id:user.id,limits:{...s.limits,_shortcut:s.shortcut||'n',_dark:!!s.dark,_workWeek:!!s.workWeek,_onboarded:!!s.onboarded},updated_at:new Date().toISOString()});},[supabase,user]);

  // Drag-and-drop: move task to a new date
  const moveTask=useCallback(async(taskId,newDate)=>{
    setTasks(p=>p.map(t=>t.id===taskId?{...t,date:newDate}:t));
    await supabase.from('tasks').update({date:newDate}).eq('id',taskId).eq('user_id',user.id);
  },[supabase,user]);

  // Quick-add: create task inline
  const quickAdd=useCallback(async(title,category)=>{
    const t={id:uid(),title,notes:'',project:'',category,date:selD,recurrence:{type:'none'},createdAt:Date.now()};
    setTasks(p=>[...p,t]);
    await supabase.from('tasks').insert({id:t.id,user_id:user.id,title:t.title,notes:'',project:'',category:t.category,date:t.date,recurrence:t.recurrence,created_at:t.createdAt});
  },[supabase,user,selD]);

  // Change task category (drag between sections)
  const catChange=useCallback(async(taskId,newCat)=>{
    setTasks(p=>p.map(t=>t.id===taskId?{...t,category:newCat}:t));
    await supabase.from('tasks').update({category:newCat}).eq('id',taskId).eq('user_id',user.id);
  },[supabase,user]);

  // Backlog quick-add (task with date=BL_DATE)
  const backlogAdd=useCallback(async(title)=>{
    const t={id:uid(),title,notes:'',project:'',category:'important',date:BL_DATE,recurrence:{type:'none'},createdAt:Date.now()};
    setTasks(p=>[...p,t]);
    await supabase.from('tasks').insert({id:t.id,user_id:user.id,title:t.title,notes:'',project:'',category:t.category,date:t.date,recurrence:t.recurrence,created_at:t.createdAt});
  },[supabase,user]);

  const navM=(dir)=>{let m=cM+dir,y=cY;if(m>11){m=0;y++;}else if(m<0){m=11;y--;}setCM(m);setCY(y);};
  const navW=(dir)=>setWS(p=>addDays(p,dir*21));

  const sd=parseDate(selD);
  const hDblClick=(ds)=>{setSelD(ds);setETask(null);setACat('thing');setMOpen(true);};
  const av=user?.user_metadata?.avatar_url,un=user?.user_metadata?.full_name||user?.email||'',fn=(user?.user_metadata?.full_name||'').split(' ')[0]||'';

  if(!loaded)return<div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,color:T.tm}}><div style={{textAlign:'center'}}><div style={{fontSize:28,fontFamily:SF,color:T.text,marginBottom:8}}>Focus Day</div><div style={{fontSize:13}}>Cargando tus tareas...</div></div></div>;

  // Dynamic theme
  if(settings.dark){Object.assign(T,{bg:'#1a1a1a',surface:'#242424',surfaceHover:'#2e2e2e',border:'#3a3a3a',borderLight:'#333',text:'#e7e5e4',ts:'#a8a29e',tm:'#78716c',accentSoft:'#2a2a2a',thingBg:'#2c1a1a',impBg:'#1a2638',maintBg:'#242424',okBg:'#1a2a1f'});}
  else{Object.assign(T,{bg:'#fafaf9',surface:'#fff',surfaceHover:'#f5f5f4',border:'#e7e5e4',borderLight:'#f0eeec',text:'#1c1917',ts:'#78716c',tm:'#a8a29e',accentSoft:'#f5f5f4',thingBg:'#fef2f2',impBg:'#eff6ff',maintBg:'#f5f5f4',okBg:'#f0fdf4'});}

  // Onboarding gate
  if(!settings.onboarded)return<Onboarding userName={fn} onDone={()=>{const ns={...settings,onboarded:true};saveSets(ns);}}/>;
  return(
    <div style={{height:'100vh',background:'transparent',fontFamily:F,color:T.text,padding:'20px 32px 24px',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative',zIndex:1}}>
      {/* Header — single condensed line */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <h1 style={{margin:0,fontSize:22,fontWeight:400,fontFamily:SF,letterSpacing:'-0.01em'}}>Focus Day</h1>
          {fn&&<span style={{fontSize:12,color:T.tm}}>|</span>}
          {fn&&<span style={{fontSize:13,color:T.tm}}>{getGreeting()}, {fn}</span>}
          {(()=>{const dt=tasksFor(tasks,selD,comp);const tC=dt.filter(t=>t.category==='thing').length;const iC=dt.filter(t=>t.category==='important').length;const mC=dt.filter(t=>t.category==='maintenance').length;return dt.length>0?<><span style={{fontSize:12,color:T.tm}}>·</span><span style={{fontSize:12,color:T.tm}}>{tC>0?`${tC} Thing`:''}{tC>0&&iC>0?' · ':''}{iC>0?`${iC} Imp`:''}{(tC>0||iC>0)&&mC>0?' · ':''}{mC>0?`${mC} Maint`:''}</span></>:null;})()}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>{setSelD(fmt(today));setCM(today.getMonth());setCY(today.getFullYear());setWS(startOfWeek(today));}} style={{padding:'6px 12px',borderRadius:T.rs,border:`1.5px solid ${T.border}`,cursor:'pointer',background:'transparent',color:T.text,fontSize:11,fontWeight:600,fontFamily:F}}>Hoy</button>
          <button onClick={()=>setSOpen(true)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="settings" size={16} color={T.ts}/></button>
          <div style={{display:'flex',alignItems:'center',gap:5,marginLeft:2}}>
            {av?<img src={av} alt="" style={{width:26,height:26,borderRadius:'50%',border:`1.5px solid ${T.border}`}} referrerPolicy="no-referrer"/>:<div style={{width:26,height:26,borderRadius:'50%',background:T.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:T.ts}}>{un.charAt(0).toUpperCase()}</div>}
            <button onClick={onSignOut} title="Cerrar sesión" style={{background:'none',border:'none',cursor:'pointer',padding:3}}><Ic name="logout" size={14} color={T.tm}/></button>
          </div>
        </div>
      </div>

      {/* Split layout: Left = DayView, Right = Month/Week */}
      <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:32,flex:1,minHeight:0}}>
        {/* LEFT: Day View (always visible) */}
        <div style={{overflowY:'auto',paddingRight:8}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <button onClick={()=>setSelD(fmt(addDays(sd,-1)))} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="chevLeft" size={16}/></button>
            <span style={{fontSize:14,fontWeight:600,fontFamily:F}}>{sd.getDate()} {monthNames[sd.getMonth()]} {sd.getFullYear()}</span>
            <button onClick={()=>setSelD(fmt(addDays(sd,1)))} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="chevRight" size={16}/></button>
          </div>
          <DayView dateStr={selD} tasks={tasks} completions={comp} onToggle={toggle} onEdit={t=>{setETask(t);setACat(null);setMOpen(true);}} onAdd={c=>{setETask(null);setACat(c);setMOpen(true);}} onQuickAdd={quickAdd} onCatChange={catChange} settings={settings}/>
          {(()=>{const theThing=tasksFor(tasks,selD,comp).find(t=>t.category==='thing');return theThing?<button onClick={()=>setFocusMode(true)} style={{marginTop:16,width:'100%',padding:'10px',borderRadius:T.rs,border:'none',cursor:'pointer',background:T.thing,color:'#fff',fontSize:13,fontWeight:600,fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'transform 0.2s',opacity:0.9}} onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.02)';e.currentTarget.style.opacity='1';}} onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.opacity='0.9';}}><Ic name="focus" size={16} color="#fff"/>Focus Mode</button>:null;})()}
          <Backlog tasks={tasks} onEdit={t=>{setETask(t);setACat(null);setMOpen(true);}} onMoveToDate={moveTask} onQuickAdd={backlogAdd} onDelete={delTask}/>
        </div>

        {/* RIGHT: Calendar panel */}
        <div style={{display:'flex',flexDirection:'column',minHeight:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:4}}>
              <button onClick={()=>rightView==='month'?navM(-1):navW(-1)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="chevLeft" size={18}/></button>
              <span style={{fontSize:15,fontWeight:600,minWidth:160,textAlign:'center',fontFamily:F}}>
                {rightView==='month'?`${monthNames[cM]} ${cY}`:`${wS.getDate()} ${monthNames[wS.getMonth()].slice(0,3)} – ${addDays(wS,20).getDate()} ${monthNames[addDays(wS,20).getMonth()].slice(0,3)}`}
              </span>
              <button onClick={()=>rightView==='month'?navM(1):navW(1)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="chevRight" size={18}/></button>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{display:'flex',background:T.surface,borderRadius:T.rs,border:`1px solid ${T.border}`,overflow:'hidden'}}>
                {['month','week'].map(v=><button key={v} onClick={()=>setRightView(v)} style={{padding:'7px 14px',border:'none',cursor:'pointer',fontSize:12,fontWeight:rightView===v?600:400,background:rightView===v?T.text:'transparent',color:rightView===v?'#fff':T.ts,fontFamily:F,transition:'all 0.2s'}}>{v==='month'?'Mes':'Semana'}</button>)}
              </div>
            </div>
          </div>
          {rightView==='month'&&<MonthView year={cY} month={cM} today={today} selectedDate={selD} onSelectDate={setSelD} onDoubleClickDate={hDblClick} tasks={calTasks} completions={comp}/>}
          {rightView==='week'&&<WeekView weekStart={wS} today={today} selectedDate={selD} onSelectDate={setSelD} onDoubleClickDate={hDblClick} tasks={calTasks} completions={comp} onMoveTask={moveTask} settings={settings}/>}
        </div>
      </div>

      <TaskModal isOpen={mOpen} onClose={()=>{setMOpen(false);setETask(null);}} onSave={saveTask} onDelete={delTask} task={eTask} dateStr={selD} category={aCat} tasks={tasks} completions={comp} settings={settings} allTags={allTags}/>
      <SettingsModal isOpen={sOpen} onClose={()=>setSOpen(false)} settings={settings} onSave={saveSets} showRec={showRec} setShowRec={setShowRec}/>
      {focusMode&&(()=>{const theThing=tasksFor(tasks,selD,comp).find(t=>t.category==='thing');return<FocusMode task={theThing} onToggle={()=>{if(theThing)toggle(theThing);}} onExit={()=>setFocusMode(false)}/>;})()}
    </div>
  );
}
