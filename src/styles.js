export const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#000', color: '#fff', fontFamily: '"Inter", sans-serif' },
  sidebar: { width: '280px', backgroundColor: '#0a0a0a', padding: '30px 20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1a1a1a' },
  sidebarLogo: { fontSize: '22px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '40px', textAlign: 'center' },
  menu: { flexGrow: 1 },
  menuBtn: { width: '100%', padding: '14px', background: 'none', color: '#888', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '16px', borderRadius: '12px', marginBottom: '8px', transition: '0.3s' },
  activeMenuBtn: { width: '100%', padding: '14px', background: '#1a1a1a', color: '#d7ff00', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '16px', borderRadius: '12px', marginBottom: '8px', fontWeight: 'bold' },
  icon: { marginRight: '10px' },
  userSection: { display: 'flex', alignItems: 'center', padding: '15px', backgroundColor: '#111', borderRadius: '15px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #d7ff00' },
  logoutBtn: { color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: 0 },
  
  main: { flexGrow: 1, padding: '40px', backgroundColor: '#000', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  pointsBadge: { backgroundColor: '#d7ff00', color: '#000', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' },
  
  content: { maxWidth: '600px' },
  workoutCard: { backgroundColor: '#0f0f0f', padding: '25px', borderRadius: '24px', border: '1px solid #1a1a1a', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  label: { fontSize: '10px', color: '#555', fontWeight: 'bold', marginBottom: '5px', display: 'block', letterSpacing: '1px' },
  select: { width: '100%', padding: '15px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '12px', marginBottom: '20px' },
  statsRow: { display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '25px' },
  inputGroup: { flex: 1 },
  input: { width: '100%', padding: '15px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '12px' },
  addSetBtn: { height: '50px', width: '50px', backgroundColor: '#1a1a1a', color: '#d7ff00', border: '1px solid #d7ff00', borderRadius: '12px', cursor: 'pointer', fontSize: '20px' },
  finishBtn: { width: '100%', padding: '18px', backgroundColor: '#d7ff00', color: '#000', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', fontSize: '16px' },
  
  leagueItem: { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #1a1a1a' },
  createLeagueBtn: { width: '100%', marginTop: '20px', padding: '12px', background: 'none', border: '1px dashed #d7ff00', color: '#d7ff00', borderRadius: '12px', cursor: 'pointer' },
  
  loginPage: { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', color: '#fff' },
  logo: { fontSize: '64px', fontWeight: '900', marginBottom: '10px' },
  loginBtn: { padding: '15px 40px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }
};
