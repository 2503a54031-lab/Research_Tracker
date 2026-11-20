import React, {useEffect, useState} from 'react';
import {Routes, Route, Navigate, useNavigate, NavLink, useLocation} from 'react-router-dom';
import {BookOpen, LayoutDashboard, FolderKanban, FileText, Sparkles, LogOut, Menu, X, UserRound} from 'lucide-react';
import {api, getToken} from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Publications from './pages/Publications';
import Assistant from './pages/Assistant';

function Protected({children}) { return getToken() ? children : <Navigate to="/login" replace/>; }
function Shell({children, user, onLogout}) {
  const [open,setOpen]=useState(false); const location=useLocation();
  const links=[['/','Overview',LayoutDashboard],['/projects','Research Projects',FolderKanban],['/publications','Publications',FileText],['/assistant','AI Writing Helper',Sparkles]];
  return <div className="app-shell"><aside className={`sidebar ${open?'show':''}`}><div className="brand"><div className="brand-mark"><BookOpen size={22}/></div><div><b>ResearchTrack</b><small>Research workspace</small></div><button className="mobile-close" onClick={()=>setOpen(false)}><X/></button></div><div className="nav-label">WORKSPACE</div><nav>{links.map(([to,label,Icon])=><NavLink end={to==='/'} onClick={()=>setOpen(false)} className={({isActive})=>`nav-link ${isActive?'active':''}`} key={to} to={to}><Icon size={18}/>{label}</NavLink>)}</nav><div className="sidebar-bottom"><div className="user-mini"><div className="avatar"><UserRound size={18}/></div><div className="user-meta"><b>{user?.name||'Researcher'}</b><small>{user?.email}</small></div></div><button className="logout" onClick={onLogout}><LogOut size={17}/> Sign out</button></div></aside><main className="main-area"><header className="topbar"><button className="mobile-menu" onClick={()=>setOpen(true)}><Menu/></button><div className="crumb">Workspace <span>/</span> {links.find(x=>x[0]===location.pathname)?.[1]||'Overview'}</div><div className="top-user"><span className="online-dot"></span> {user?.name||'Researcher'}</div></header><div className="page-content">{children}</div></main></div>
}
export default function App(){
 const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('rt_user'))}catch{return null}});
 const nav=useNavigate();
 useEffect(()=>{if(getToken()&&!user){api('/auth/me').then(r=>{setUser(r.user);localStorage.setItem('rt_user',JSON.stringify(r.user))}).catch(()=>setUser(null))}},[]);
 const logout=()=>{localStorage.removeItem('rt_token');localStorage.removeItem('rt_user');setUser(null);nav('/login')};
 const onLogin=(data)=>{localStorage.setItem('rt_token',data.access_token);localStorage.setItem('rt_user',JSON.stringify(data.user));setUser(data.user);nav('/')};
 return <Routes><Route path="/login" element={getToken()?<Navigate to="/"/>:<Login onLogin={onLogin}/>}/><Route path="*" element={<Protected><Shell user={user} onLogout={logout}><Routes><Route path="/" element={<Dashboard/>}/><Route path="/projects" element={<Projects/>}/><Route path="/publications" element={<Publications/>}/><Route path="/assistant" element={<Assistant/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes></Shell></Protected>}/></Routes>
}
