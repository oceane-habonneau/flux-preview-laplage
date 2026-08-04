import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'
import { useContent } from '../../hooks/useContent'

export default function AppShell() {
  const { loading, error } = useContent()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh', flexDirection:'column', gap:12, background:'var(--client-bg-base)' }}>
      <div style={{ width:28, height:28, border:'1.5px solid var(--fh-sand-200)', borderTop:'1.5px solid var(--client-primary)', borderRadius:'50%', animation:'fh-spin 0.8s linear infinite' }} />
    </div>
  )

  if (error) return (
    <div style={{ padding:'2rem', color:'var(--fh-danger)', fontSize:13, fontFamily:'var(--font-body)' }}>
      Erreur de chargement : {error}
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100dvh' }}>
      <main style={{
        flex: 1,
        overflowY: 'auto',
        background: 'var(--client-bg-base)',
        paddingBottom: 'calc(var(--nav-height) + 24px + env(safe-area-inset-bottom))',
        width: '100%'
      }}>
        <Outlet />
      </main>
      <NavBar />
    </div>
  )
}
