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
function tasksFor(tasks, ds, comp) {
  return tasks.filter(t=>shouldTaskAppear(t,ds)).map(t=>({...t,completed:!!(comp[`${t.id}::${ds}`])}));
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
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{flexShrink:0,...s}}>{m[name]}</svg>;
}

const CAT={thing:{label:'The Thing',color:T.thing,bg:T.thingBg,icon:'target',desc:'Tu prioridad #1'},important:{label:'Important',color:T.imp,bg:T.impBg,icon:'star',desc:'Tareas clave'},maintenance:{label:'Maintenance',color:T.maint,bg:T.maintBg,icon:'settings',desc:'Bajo esfuerzo'}};
const DSET={limits:{thing:1,important:3,maintenance:99}};

function PPill({name}){if(!name)return null;const c=pColor(name);return <span style={{display:'inline-flex',padding:'1px 6px',borderRadius:20,background:c.bg,color:c.text,border:`1px solid ${c.border}`,fontSize:10,fontWeight:500,fontFamily:F,lineHeight:1.6,whiteSpace:'nowrap',flexShrink:0}}>{name}</span>;}

function PRing({pct,size=44}){const sw=3.5,r=(size-sw)/2,ci=2*Math.PI*r,off=ci-(pct/100)*ci,dn=pct===100;return<div style={{position:'relative',width:size,height:size}}><svg width={size} height={size} style={{transform:'rotate(-90deg)'}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={sw}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={dn?T.ok:T.text} strokeWidth={sw} strokeDasharray={ci} strokeDashoffset={off} strokeLinecap="round" style={{transition:'stroke-dashoffset 0.5s ease'}}/></svg><span style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:dn?T.ok:T.text,fontFamily:F}}>{pct}%</span></div>;}

// ─── Task Modal ────────────────────────────────────────────────────
function TaskModal({isOpen,onClose,onSave,onDelete,task,dateStr,category:initCat,tasks,completions,settings,allProjects}){
  const [title,setTitle]=useState('');
  const [notes,setNotes]=useState('');
  const [project,setProject]=useState('');
  const [showPS,setShowPS]=useState(false);
  const [category,setCat]=useState('thing');
  const [date,setDate]=useState(dateStr);
  const [recP,setRecP]=useState('none');
  const [recF,setRecF]=useState('daily');
  const [recI,setRecI]=useState(1);
  const [recD,setRecD]=useState([]);
  const iRef=useRef(null);
  function r2p(r){if(!r||r.type==='none')return'none';if(r.type==='weekdays'){const d=(r.days||[]).sort().join(',');if(d==='1,2,3,4,5')return'weekdays';if(d==='0,6')return'weekends';return'specific_days';}if(r.type==='daily'&&(r.interval||1)===1)return'every_day';if(r.type==='weekly'&&(r.interval||1)===1)return'every_week';if(r.type==='weekly'&&(r.interval||1)===2)return'every_2_weeks';if(r.type==='monthly'){const i=r.interval||1;if(i===1)return'every_month';if(i===3)return'every_3_months';if(i===6)return'every_6_months';if(i===12)return'every_year';}return'custom';}
  function r2f(r){if(!r)return'daily';if(r.type==='daily')return'daily';if(r.type==='weekly')return'weekly';if(r.type==='monthly'&&(r.interval||1)>=12)return'yearly';if(r.type==='monthly')return'monthly';return'daily';}
  useEffect(()=>{if(isOpen){setTitle(task?.title||'');setNotes(task?.notes||'');setProject(task?.project||'');setCat(task?.category||initCat||'thing');setDate(task?.date||dateStr);const r=task?.recurrence||{type:'none'};setRecP(r2p(r));setRecF(r2f(r));setRecI(r.interval||1);setRecD(r.days||[]);setShowPS(false);setTimeout(()=>iRef.current?.focus(),100);}},[isOpen,task,dateStr,initCat]);
  if(!isOpen)return null;
  const fps=allProjects.filter(p=>p.toLowerCase().includes(project.toLowerCase())&&p!==project);
  const save=()=>{
    if(!title.trim())return;
    const c=category,lim=settings.limits[c];
    if(!task){const ex=tasksFor(tasks,date,completions).filter(t=>t.category===c);if(ex.length>=lim){alert(`Límite de ${lim} alcanzado para "${CAT[c].label}". Programa para otro día.`);return;}}
    let rec={type:'none'};
    if(recP==='every_day')rec={type:'daily',interval:1};else if(recP==='weekdays')rec={type:'weekdays',days:[1,2,3,4,5]};else if(recP==='weekends')rec={type:'weekdays',days:[0,6]};else if(recP==='every_week')rec={type:'weekly',interval:1};else if(recP==='every_2_weeks')rec={type:'weekly',interval:2};else if(recP==='every_month')rec={type:'monthly',interval:1};else if(recP==='every_3_months')rec={type:'monthly',interval:3};else if(recP==='every_6_months')rec={type:'monthly',interval:6};else if(recP==='every_year')rec={type:'monthly',interval:12};else if(recP==='specific_days')rec={type:'weekdays',days:recD};else if(recP==='custom'){if(recF==='daily')rec={type:'daily',interval:recI};else if(recF==='weekly')rec={type:'weekly',interval:recI};else if(recF==='monthly')rec={type:'monthly',interval:recI};else if(recF==='yearly')rec={type:'monthly',interval:recI*12};}
    onSave({id:task?.id||uid(),title:title.trim(),notes:notes.trim(),project:project.trim(),category:c,date,recurrence:rec,createdAt:task?.createdAt||Date.now()});onClose();
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
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:16}}>
            <div style={{position:'relative'}}>
              <label style={LS}>Proyecto</label>
              <input value={project} onChange={e=>{setProject(e.target.value);setShowPS(true);}} onFocus={()=>setShowPS(true)} onBlur={()=>setTimeout(()=>setShowPS(false),150)} placeholder="Opcional" style={IS}/>
              {showPS&&fps.length>0&&<div style={{position:'absolute',top:'100%',left:0,right:0,zIndex:10,marginTop:2,background:T.surface,border:`1px solid ${T.border}`,borderRadius:T.rs,boxShadow:'0 8px 24px rgba(0,0,0,0.1)',maxHeight:120,overflow:'auto'}}>{fps.map(p=><button key={p} onMouseDown={()=>{setProject(p);setShowPS(false);}} style={{display:'flex',alignItems:'center',gap:6,width:'100%',padding:'8px 12px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,color:T.text,fontFamily:F,textAlign:'left'}} onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHover} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><PPill name={p}/></button>)}</div>}
            </div>
            <div><label style={LS}>Fecha</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={IS}/></div>
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

function SettingsModal({isOpen,onClose,settings,onSave}){
  const [lim,setLim]=useState(settings.limits);
  useEffect(()=>{if(isOpen)setLim(settings.limits);},[isOpen,settings]);
  if(!isOpen)return null;
  return(<div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}><div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.3)',backdropFilter:'blur(4px)'}}/><div onClick={e=>e.stopPropagation()} style={{position:'relative',background:T.surface,borderRadius:T.rl,width:'min(400px,90vw)',boxShadow:'0 20px 60px rgba(0,0,0,0.15)',fontFamily:F,padding:24}}>
    <h3 style={{margin:'0 0 20px',fontSize:18,fontWeight:600,fontFamily:SF,color:T.text}}>Configuración</h3>
    <p style={{fontSize:13,color:T.ts,margin:'0 0 16px'}}>Límite de tareas por categoría.</p>
    {Object.entries(CAT).map(([k,m])=><div key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:`1px solid ${T.borderLight}`}}><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:10,height:10,borderRadius:'50%',background:m.color}}/><span style={{fontSize:14,fontWeight:500,color:T.text}}>{m.label}</span></div><input type="number" min={1} max={99} value={lim[k]} onChange={e=>setLim(p=>({...p,[k]:Math.max(1,+e.target.value)}))} style={{width:56,padding:'8px 10px',fontSize:14,fontFamily:F,textAlign:'center',border:`1.5px solid ${T.border}`,borderRadius:T.rs,color:T.text,background:T.bg,outline:'none'}}/></div>)}
    <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:20}}>
      <button onClick={onClose} style={{padding:'10px 20px',borderRadius:T.rs,border:`1.5px solid ${T.border}`,cursor:'pointer',background:'transparent',color:T.ts,fontSize:13,fontWeight:500,fontFamily:F}}>Cancelar</button>
      <button onClick={()=>{onSave({...settings,limits:lim});onClose();}} style={{padding:'10px 24px',borderRadius:T.rs,border:'none',cursor:'pointer',background:T.text,color:'#fff',fontSize:13,fontWeight:600,fontFamily:F}}>Guardar</button>
    </div>
  </div></div>);
}

function TaskItem({task,onToggle,onEdit}){
  const m=CAT[task.category],[hov,setHov]=useState(false),[exp,setExp]=useState(false);
  const hasN=!!task.notes;
  return(<div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:T.rs,cursor:'pointer',transition:'background 0.15s',background:hov?T.surfaceHover:'transparent'}}>
      <button onClick={e=>{e.stopPropagation();onToggle();}} style={{width:20,height:20,borderRadius:6,border:`2px solid ${task.completed?m.color:T.border}`,background:task.completed?m.color:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s',padding:0}}>{task.completed&&<Ic name="check" size={13} color="#fff"/>}</button>
      <div style={{flex:1,minWidth:0}} onClick={onEdit}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:14,color:task.completed?T.tm:T.text,textDecoration:task.completed?'line-through':'none',fontFamily:F,lineHeight:1.4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{task.title}</span>
          {task.project&&<PPill name={task.project}/>}
        </div>
      </div>
      {task.recurrence?.type&&task.recurrence.type!=='none'&&<Ic name="repeat" size={14}/>}
      {hasN&&<button onClick={e=>{e.stopPropagation();setExp(!exp);}} style={{background:'none',border:'none',cursor:'pointer',padding:2,opacity:exp?1:0.4,transition:'opacity 0.2s'}}><Ic name="note" size={14}/></button>}
      {hov&&<button onClick={e=>{e.stopPropagation();onEdit();}} style={{background:'none',border:'none',cursor:'pointer',padding:2}}><Ic name="edit" size={14}/></button>}
    </div>
    {exp&&hasN&&<div style={{margin:'0 12px 8px 42px',padding:'8px 12px',background:T.bg,borderRadius:T.rs,border:`1px solid ${T.borderLight}`,fontSize:13,color:T.ts,lineHeight:1.5,fontFamily:F,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{task.notes}</div>}
  </div>);
}

function CatSection({category,tasks,onToggle,onEdit,onAdd,limit}){
  const m=CAT[category],at=tasks.length>=limit,dc=tasks.filter(t=>t.completed).length;
  return(<div style={{marginBottom:24}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,padding:'0 4px'}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <Ic name={m.icon} size={16} color={m.color}/><span style={{fontSize:13,fontWeight:600,color:m.color,textTransform:'uppercase',letterSpacing:'0.06em',fontFamily:F}}>{m.label}</span>
        {tasks.length>0&&<span style={{fontSize:11,color:dc===tasks.length?T.ok:T.tm,fontFamily:F,fontWeight:dc===tasks.length?600:400}}>{dc}/{tasks.length}</span>}
      </div>
      <button onClick={onAdd} disabled={at} title={at?'Límite alcanzado':'Agregar tarea'} style={{background:'none',border:'none',cursor:at?'not-allowed':'pointer',padding:2,opacity:at?0.15:0.5,transition:'opacity 0.2s'}} onMouseEnter={e=>{if(!at)e.target.style.opacity=1}} onMouseLeave={e=>{if(!at)e.target.style.opacity=0.5}}><Ic name="plus" size={16} color={m.color}/></button>
    </div>
    <div style={{background:T.surface,borderRadius:T.r,border:`1px solid ${T.borderLight}`,minHeight:tasks.length?'auto':44,overflow:'hidden'}}>
      {tasks.length===0&&<div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'12px 0',opacity:0.35}}><span style={{fontSize:12,color:T.tm,fontStyle:'italic',fontFamily:F}}>{m.desc}</span></div>}
      {tasks.map(t=><TaskItem key={t.id+'_'+t.date} task={t} onToggle={()=>onToggle(t)} onEdit={()=>onEdit(t)}/>)}
    </div>
  </div>);
}

function DayView({dateStr,tasks,completions,onToggle,onEdit,onAdd,settings}){
  const dt=useMemo(()=>tasksFor(tasks,dateStr,completions),[tasks,dateStr,completions]);
  const d=parseDate(dateStr),done=dt.filter(t=>t.completed).length,tot=dt.length,pct=tot>0?Math.round(done/tot*100):0;
  return(<div>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
      <div><h2 style={{margin:0,fontSize:28,fontWeight:400,color:T.text,fontFamily:SF,lineHeight:1.2}}>{d.getDate()} <span style={{fontSize:20,color:T.ts}}>{monthNames[d.getMonth()]}</span></h2><p style={{margin:'4px 0 0',fontSize:13,color:T.tm,fontFamily:F}}>{dayNamesFull[d.getDay()]}</p></div>
      {tot>0&&<PRing pct={pct}/>}
    </div>
    {tot===0&&<div style={{textAlign:'center',padding:'32px 0 24px',opacity:0.5}}><p style={{fontSize:14,color:T.tm,fontFamily:F,margin:0}}>Sin tareas para este día.</p><p style={{fontSize:12,color:T.tm,fontFamily:F,margin:'4px 0 0'}}>Presiona <strong>N</strong> o haz clic en <strong>+</strong> para agregar.</p></div>}
    {['thing','important','maintenance'].map(c=><CatSection key={c} category={c} tasks={dt.filter(t=>t.category===c)} onToggle={onToggle} onEdit={onEdit} onAdd={()=>onAdd(c)} limit={settings.limits[c]}/>)}
  </div>);
}

function MonthView({year,month,today,selectedDate,onClickDate,onDoubleClickDate,tasks,completions}){
  const dim=getDaysInMonth(year,month),fd=getFirstDayOfMonth(year,month),cells=[];
  for(let i=0;i<fd;i++)cells.push(null);for(let d=1;d<=dim;d++)cells.push(d);
  return(<div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:4}}>{dayNames.map(d=><div key={d} style={{textAlign:'center',fontSize:11,fontWeight:600,color:T.tm,padding:'6px 0',fontFamily:F,letterSpacing:'0.05em'}}>{d}</div>)}</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>{cells.map((day,i)=>{
      if(!day)return<div key={`e${i}`}/>;
      const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,isT=ds===fmt(today),isS=ds===selectedDate,dt=tasksFor(tasks,ds,completions),hT=dt.some(t=>t.category==='thing'),hI=dt.some(t=>t.category==='important'),hM=dt.some(t=>t.category==='maintenance'),ad=dt.length>0&&dt.every(t=>t.completed);
      return<button key={ds} onClick={()=>onClickDate(ds)} onDoubleClick={()=>onDoubleClickDate(ds)} style={{aspect:'1',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,border:isS?`2px solid ${T.text}`:isT?`2px solid ${T.tm}`:`1px solid transparent`,borderRadius:T.rs,cursor:'pointer',background:isS?T.accentSoft:'transparent',fontFamily:F,transition:'all 0.15s'}}><span style={{fontSize:14,fontWeight:isT?700:400,color:isT?T.text:T.ts}}>{day}</span>{dt.length>0&&<div style={{display:'flex',gap:2}}>{hT&&<div style={{width:5,height:5,borderRadius:'50%',background:ad?T.ok:T.thing}}/>}{hI&&<div style={{width:5,height:5,borderRadius:'50%',background:ad?T.ok:T.imp}}/>}{hM&&<div style={{width:5,height:5,borderRadius:'50%',background:ad?T.ok:T.maint}}/>}</div>}</button>;
    })}</div>
  </div>);
}

function WeekView({weekStart,today,selectedDate,onClickDate,onDoubleClickDate,tasks,completions}){
  const days=Array.from({length:7},(_,i)=>addDays(weekStart,i));
  const tr={display:'block',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'100%'};
  return(<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>{days.map(d=>{
    const ds=fmt(d),isT=ds===fmt(today),isS=ds===selectedDate,dt=tasksFor(tasks,ds,completions),tt=dt.find(t=>t.category==='thing'),im=dt.filter(t=>t.category==='important'),ma=dt.filter(t=>t.category==='maintenance'),hT=!!tt,hI=im.length>0,hM=ma.length>0,ad=dt.length>0&&dt.every(t=>t.completed);
    return<button key={ds} onClick={()=>onClickDate(ds)} onDoubleClick={()=>onDoubleClickDate(ds)} style={{padding:'12px 8px',borderRadius:T.r,cursor:'pointer',textAlign:'left',border:isS?`2px solid ${T.text}`:isT?`2px solid ${T.tm}`:`1px solid ${T.borderLight}`,background:isS?T.accentSoft:T.surface,fontFamily:F,minHeight:180,transition:'all 0.15s',display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}><span style={{fontSize:11,fontWeight:600,color:T.tm,letterSpacing:'0.04em'}}>{dayNames[d.getDay()]}</span><span style={{fontSize:16,fontWeight:isT?700:400,color:isT?T.text:T.ts}}>{d.getDate()}</span></div>
      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column',gap:2,minWidth:0}}>
        {tt&&<div style={{fontSize:11,padding:'3px 6px',borderRadius:4,background:tt.completed?T.okBg:T.thingBg,color:tt.completed?T.ok:T.thing,fontWeight:500,textDecoration:tt.completed?'line-through':'none',...tr}}>{tt.title}</div>}
        {im.slice(0,3).map(t=><div key={t.id} style={{fontSize:10,padding:'2px 6px',borderRadius:3,color:t.completed?T.ok:T.imp,textDecoration:t.completed?'line-through':'none',...tr}}>{t.title}</div>)}
        {ma.slice(0,2).map(t=><div key={t.id} style={{fontSize:10,padding:'2px 6px',borderRadius:3,color:t.completed?T.ok:T.maint,textDecoration:t.completed?'line-through':'none',...tr}}>{t.title}</div>)}
      </div>
      {dt.length>0&&<div style={{display:'flex',gap:3,paddingTop:6,justifyContent:'center'}}>{hT&&<div style={{width:5,height:5,borderRadius:'50%',background:ad?T.ok:T.thing}}/>}{hI&&<div style={{width:5,height:5,borderRadius:'50%',background:ad?T.ok:T.imp}}/>}{hM&&<div style={{width:5,height:5,borderRadius:'50%',background:ad?T.ok:T.maint}}/>}</div>}
    </button>;
  })}</div>);
}

// ═══════════════════════════════════════════════════════════════════
export default function FocusDay({supabase,user,onSignOut}){
  const [loaded,setLoaded]=useState(false),[tasks,setTasks]=useState([]),[comp,setComp]=useState({}),[settings,setSettings]=useState(DSET);
  const [view,setView]=useState('month'),[today]=useState(new Date()),[selD,setSelD]=useState(fmt(new Date()));
  const [cM,setCM]=useState(new Date().getMonth()),[cY,setCY]=useState(new Date().getFullYear()),[wS,setWS]=useState(startOfWeek(new Date()));
  const [mOpen,setMOpen]=useState(false),[eTask,setETask]=useState(null),[aCat,setACat]=useState(null),[sOpen,setSOpen]=useState(false);
  const allProjects=useMemo(()=>[...new Set(tasks.map(t=>t.project).filter(Boolean))].sort(),[tasks]);

  useEffect(()=>{function onK(e){if(mOpen||sOpen){if(e.key==='Escape'){setMOpen(false);setSOpen(false);setETask(null);}return;}const sd=parseDate(selD);if(e.key==='ArrowLeft'){e.preventDefault();setSelD(fmt(addDays(sd,-1)));}if(e.key==='ArrowRight'){e.preventDefault();setSelD(fmt(addDays(sd,1)));}if(e.key==='n'&&!e.metaKey&&!e.ctrlKey&&document.activeElement?.tagName!=='INPUT'&&document.activeElement?.tagName!=='TEXTAREA'&&document.activeElement?.tagName!=='SELECT'){e.preventDefault();setETask(null);setACat('thing');setMOpen(true);}}window.addEventListener('keydown',onK);return()=>window.removeEventListener('keydown',onK);},[mOpen,sOpen,selD]);

  useEffect(()=>{if(!user)return;async function ld(){
    const{data:tr}=await supabase.from('tasks').select('*').eq('user_id',user.id);
    setTasks((tr||[]).map(r=>({id:r.id,title:r.title,notes:r.notes||'',project:r.project||'',category:r.category,date:r.date,recurrence:r.recurrence||{type:'none'},createdAt:r.created_at})));
    const{data:cr}=await supabase.from('completions').select('*').eq('user_id',user.id);const lc={};(cr||[]).forEach(r=>{lc[`${r.task_id}::${r.date}`]=true;});setComp(lc);
    const{data:sr}=await supabase.from('user_settings').select('*').eq('user_id',user.id).single();
    setSettings(sr?{limits:sr.limits||DSET.limits}:DSET);setLoaded(true);
  }ld();},[user,supabase]);

  const saveTask=useCallback(async(t)=>{setTasks(p=>{const i=p.findIndex(x=>x.id===t.id);if(i>=0){const n=[...p];n[i]=t;return n;}return[...p,t];});await supabase.from('tasks').upsert({id:t.id,user_id:user.id,title:t.title,notes:t.notes||'',project:t.project||'',category:t.category,date:t.date,recurrence:t.recurrence,created_at:t.createdAt});},[supabase,user]);
  const delTask=useCallback(async(id)=>{setTasks(p=>p.filter(t=>t.id!==id));setComp(p=>{const n={...p};Object.keys(n).filter(k=>k.startsWith(id+'::')).forEach(k=>delete n[k]);return n;});await supabase.from('tasks').delete().eq('id',id).eq('user_id',user.id);},[supabase,user]);
  const toggle=useCallback(async(task)=>{const k=`${task.id}::${selD}`,was=!!comp[k];setComp(p=>{const n={...p};if(was)delete n[k];else n[k]=true;return n;});if(was)await supabase.from('completions').delete().eq('user_id',user.id).eq('task_id',task.id).eq('date',selD);else await supabase.from('completions').insert({user_id:user.id,task_id:task.id,date:selD});},[supabase,user,selD,comp]);
  const saveSets=useCallback(async(s)=>{setSettings(s);await supabase.from('user_settings').upsert({user_id:user.id,limits:s.limits,updated_at:new Date().toISOString()});},[supabase,user]);

  const navM=(dir)=>{let m=cM+dir,y=cY;if(m>11){m=0;y++;}else if(m<0){m=11;y--;}setCM(m);setCY(y);};
  const navW=(dir)=>setWS(p=>addDays(p,dir*7));
  const ctRef=useRef(null);
  const hClick=(ds)=>{if(ctRef.current)clearTimeout(ctRef.current);ctRef.current=setTimeout(()=>{setSelD(ds);setETask(null);setACat('thing');setMOpen(true);ctRef.current=null;},250);};
  const hDbl=(ds)=>{if(ctRef.current){clearTimeout(ctRef.current);ctRef.current=null;}setSelD(ds);setView('day');};

  const vL={month:'Mes',week:'Semana',day:'Día'},sd=parseDate(selD);
  const av=user?.user_metadata?.avatar_url,un=user?.user_metadata?.full_name||user?.email||'',fn=(user?.user_metadata?.full_name||'').split(' ')[0]||'';

  if(!loaded)return<div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F,color:T.tm}}><div style={{textAlign:'center'}}><div style={{fontSize:28,fontFamily:SF,color:T.text,marginBottom:8}}>Focus Day</div><div style={{fontSize:13}}>Cargando tus tareas...</div></div></div>;

  return(
    <div style={{minHeight:'100vh',background:T.bg,fontFamily:F,color:T.text,padding:'20px 32px 40px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <div><h1 style={{margin:0,fontSize:24,fontWeight:400,fontFamily:SF,letterSpacing:'-0.01em'}}>Focus Day</h1>{fn&&<p style={{margin:'2px 0 0',fontSize:13,color:T.tm}}>{getGreeting()}, {fn}</p>}</div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>{setSelD(fmt(today));setCM(today.getMonth());setCY(today.getFullYear());setWS(startOfWeek(today));setView('day');}} style={{padding:'7px 14px',borderRadius:T.rs,border:`1.5px solid ${T.border}`,cursor:'pointer',background:'transparent',color:T.text,fontSize:12,fontWeight:600,fontFamily:F}}>Hoy</button>
          <button onClick={()=>setSOpen(true)} style={{background:'none',border:'none',cursor:'pointer',padding:6}}><Ic name="settings" size={18} color={T.ts}/></button>
          <div style={{display:'flex',alignItems:'center',gap:6,marginLeft:4}}>
            {av?<img src={av} alt="" style={{width:28,height:28,borderRadius:'50%',border:`1.5px solid ${T.border}`}} referrerPolicy="no-referrer"/>:<div style={{width:28,height:28,borderRadius:'50%',background:T.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600,color:T.ts}}>{un.charAt(0).toUpperCase()}</div>}
            <button onClick={onSignOut} title="Cerrar sesión" style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="logout" size={16} color={T.tm}/></button>
          </div>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          {view!=='day'&&<><button onClick={()=>view==='month'?navM(-1):navW(-1)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="chevLeft" size={18}/></button><span style={{fontSize:15,fontWeight:600,minWidth:160,textAlign:'center',fontFamily:F}}>{view==='month'?`${monthNames[cM]} ${cY}`:`${wS.getDate()} ${monthNames[wS.getMonth()].slice(0,3)} – ${addDays(wS,6).getDate()} ${monthNames[addDays(wS,6).getMonth()].slice(0,3)}`}</span><button onClick={()=>view==='month'?navM(1):navW(1)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="chevRight" size={18}/></button></>}
          {view==='day'&&<><button onClick={()=>setSelD(fmt(addDays(sd,-1)))} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="chevLeft" size={18}/></button><span style={{fontSize:15,fontWeight:600,minWidth:180,textAlign:'center',fontFamily:F}}>{sd.getDate()} {monthNames[sd.getMonth()]} {sd.getFullYear()}</span><button onClick={()=>setSelD(fmt(addDays(sd,1)))} style={{background:'none',border:'none',cursor:'pointer',padding:4}}><Ic name="chevRight" size={18}/></button></>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:10,color:T.tm,display:'flex',alignItems:'center',gap:4}}><kbd style={{padding:'1px 5px',borderRadius:3,border:`1px solid ${T.border}`,fontSize:10,fontFamily:F,background:T.surface}}>N</kbd><span>nueva</span></span>
          <div style={{display:'flex',background:T.surface,borderRadius:T.rs,border:`1px solid ${T.border}`,overflow:'hidden'}}>{['month','week','day'].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:'7px 14px',border:'none',cursor:'pointer',fontSize:12,fontWeight:view===v?600:400,background:view===v?T.text:'transparent',color:view===v?'#fff':T.ts,fontFamily:F,transition:'all 0.2s'}}>{vL[v]}</button>)}</div>
        </div>
      </div>
      {view==='month'&&<MonthView year={cY} month={cM} today={today} selectedDate={selD} onClickDate={hClick} onDoubleClickDate={hDbl} tasks={tasks} completions={comp}/>}
      {view==='week'&&<WeekView weekStart={wS} today={today} selectedDate={selD} onClickDate={hClick} onDoubleClickDate={hDbl} tasks={tasks} completions={comp}/>}
      {view==='day'&&<DayView dateStr={selD} tasks={tasks} completions={comp} onToggle={toggle} onEdit={t=>{setETask(t);setACat(null);setMOpen(true);}} onAdd={c=>{setETask(null);setACat(c);setMOpen(true);}} settings={settings}/>}
      {view==='day'&&<button onClick={()=>{setETask(null);setACat('thing');setMOpen(true);}} style={{position:'fixed',bottom:24,right:24,width:52,height:52,borderRadius:'50%',background:T.text,border:'none',cursor:'pointer',boxShadow:'0 4px 16px rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center',transition:'transform 0.2s'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}><Ic name="plus" size={22} color="#fff"/></button>}
      <TaskModal isOpen={mOpen} onClose={()=>{setMOpen(false);setETask(null);}} onSave={saveTask} onDelete={delTask} task={eTask} dateStr={selD} category={aCat} tasks={tasks} completions={comp} settings={settings} allProjects={allProjects}/>
      <SettingsModal isOpen={sOpen} onClose={()=>setSOpen(false)} settings={settings} onSave={saveSets}/>
    </div>
  );
}
