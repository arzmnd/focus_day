"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import FocusDay from "./FocusDay";

const theme = {
  bg: '#fafaf9', surface: '#ffffff', text: '#1c1917',
  textSecondary: '#78716c', textMuted: '#a8a29e',
  border: '#e7e5e4', radius: '10px',
};

export default function AuthGate() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
        fontFamily:"'DM Sans',sans-serif",color:theme.textMuted,background:theme.bg,
      }}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:32,fontFamily:"'Instrument Serif',serif",color:theme.text,marginBottom:8}}>Focus Day</div>
          <div style={{fontSize:13}}>Cargando...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
        fontFamily:"'DM Sans',sans-serif",background:theme.bg,
      }}>
        <div style={{
          textAlign:'center',maxWidth:380,padding:'48px 32px',
          background:theme.surface,borderRadius:16,
          boxShadow:'0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <h1 style={{
            fontSize:36,fontFamily:"'Instrument Serif',serif",color:theme.text,
            marginBottom:8,fontWeight:400,
          }}>Focus Day</h1>
          <p style={{fontSize:14,color:theme.textSecondary,marginBottom:32,lineHeight:1.6}}>
            Simplifica tu productividad.<br/>Una tarea. Tres prioridades. Cada día.
          </p>
          <button onClick={signInWithGoogle} style={{
            width:'100%',padding:'14px 24px',borderRadius:theme.radius,border:`1.5px solid ${theme.border}`,
            cursor:'pointer',background:theme.surface,color:theme.text,
            fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",
            display:'flex',alignItems:'center',justifyContent:'center',gap:10,
            transition:'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background='#f5f5f4'}
            onMouseLeave={e => e.currentTarget.style.background=theme.surface}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>
          <p style={{fontSize:11,color:theme.textMuted,marginTop:20}}>
            Tus datos se guardan de forma segura y privada.
          </p>
        </div>
      </div>
    );
  }

  return <FocusDay supabase={supabase} user={user} onSignOut={signOut} />;
}
