import React, { useState, useMemo, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import { useTheme } from './context/ThemeContext'
import { useAuth } from './context/AuthContext'

import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Layout from './components/layout/Layout'
import projectsData from './data/projects'
import groupsData from './data/groups'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'
import Error from './pages/Error'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import RoleRoute from './routes/RoleRoute'

import Home from './pages/dashboard/Home'
import Messages from './pages/dashboard/Messages'
import Tasks from './pages/dashboard/Tasks'
import Members from './pages/dashboard/Members'
import Settings from './pages/dashboard/Settings'
import AdminPanel from './pages/admin/AdminPanel'
import ManagerPanel from './pages/manager/ManagerPanel'

const App = () => {
  const { darkMode, toggleTheme } = useTheme()
  const { currentUser } = useAuth()
  const location = useLocation()

  const [sidebar, setSideBar] = useState(true);
  const [selectedProjectID, setSelectedProjectID] = useState(1);
  const [projects, setProjects] = useState(projectsData);
  const [groups, setGroups] = useState(groupsData);

  const [projectTasks, setProjectTasks] = useState(() =>
    Object.fromEntries(projectsData.map(p => [p.id, p.tasks]))
  );

  // Sync selectedProjectID from URL when navigating via search
  useEffect(() => {
    const match = location.pathname.match(/^\/project\/(\d+)$/)
    if (match) {
      const urlId = Number(match[1])
      if (urlId !== selectedProjectID) setSelectedProjectID(urlId)
    }
  }, [location.pathname])

  const toggleSidebar = () => setSideBar(!sidebar);

  // Clients only see projects assigned to their groups
  const visibleProjects = useMemo(() => {
    if (!currentUser || currentUser.role !== 'client') return projects
    const userGroupIds = groups.filter(g => g.memberIds.includes(currentUser.id)).flatMap(g => g.projectIds)
    const allowed = new Set(userGroupIds)
    return projects.filter(p => allowed.has(p.id))
  }, [currentUser, projects, groups])

  const visibleProjectTasks = useMemo(() => {
    if (!currentUser || currentUser.role !== 'client') return projectTasks
    const allowed = new Set(visibleProjects.map(p => p.id))
    return Object.fromEntries(Object.entries(projectTasks).filter(([id]) => allowed.has(Number(id))))
  }, [currentUser, projectTasks, visibleProjects])

  const selectedProject = {
    ...(projects.find(p => p.id === selectedProjectID) || projects[0]),
    tasks: projectTasks[selectedProjectID] ?? [],
  };

  const handleTaskMove = (taskId, newStatus) => {
    setProjectTasks(prev => ({
      ...prev,
      [selectedProjectID]: prev[selectedProjectID].map(t => {
        if (t.id !== taskId) return t;
        const newLog = { status: newStatus, by: currentUser.name, date: new Date().toISOString() };
        return { 
          ...t, 
          status: newStatus, 
          priority: newStatus === 'completed' ? 'Completed' : t.priority,
          stateLogs: [newLog, ...(t.stateLogs || [])]
        };
      }),
    }));
  };

  const handleTaskDelete = (taskId) => {
    setProjectTasks(prev => ({
      ...prev,
      [selectedProjectID]: prev[selectedProjectID].filter(t => t.id !== taskId),
    }));
  };

  const handleTaskRestore = (task) => {
    setProjectTasks(prev => ({
      ...prev,
      [selectedProjectID]: [...(prev[selectedProjectID] ?? []), task],
    }));
  };

  const handleTaskAdd = (status, { title, text = '', priority, image = null }) => {
    const initialLog = { status, by: currentUser.name, date: new Date().toISOString() };
    const newTask = { 
      id: Date.now(), 
      title, 
      text, 
      priority, 
      status, 
      comments: 0, 
      files: 0, 
      image, 
      dueDate: new Date().toISOString().slice(0, 10),
      stateLogs: [initialLog]
    };
    setProjectTasks(prev => ({
      ...prev,
      [selectedProjectID]: [...(prev[selectedProjectID] ?? []), newTask],
    }));
  };

  const handleTaskUpdate = (taskId, updatedData) => {
    setProjectTasks(prev => {
      const newState = { ...prev };
      for (const projectId in newState) {
        newState[projectId] = newState[projectId].map(t => {
          if (t.id === taskId) {
            let nextStatus = updatedData.status !== undefined ? updatedData.status : t.status;
            if (updatedData.priority === 'Completed' && nextStatus !== 'completed') nextStatus = 'completed';
            
            let stateLogs = t.stateLogs || [];
            if (nextStatus !== t.status) {
                stateLogs = [{ status: nextStatus, by: currentUser.name, date: new Date().toISOString() }, ...stateLogs];
            }
            return { ...t, ...updatedData, status: nextStatus, stateLogs };
          }
          return t;
        });
      }
      return newState;
    });
  };

  const handleEditProject = (id, { name, status }) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name, status } : p))
  }

  const handleDeleteProject = (id) => {
    const project = projects.find(p => p.id === id)
    setProjects(prev => prev.filter(p => p.id !== id))
    setProjectTasks(prev => { const next = { ...prev }; delete next[id]; return next })
    if (selectedProjectID === id) setSelectedProjectID(projects[0]?.id ?? null)
    
    if (project) {
        toast.error(`Project "${project.name}" deleted.`, {
            style: { border: '1px solid var(--toast-error)', color: 'var(--toast-text)' },
            iconTheme: { primary: 'var(--toast-error)', secondary: 'var(--toast-bg)' }
        });
    }
  }

  const handleAddProject = ({ name, status }) => {
    const newId = Date.now();
    const newProject = { id: newId, name, status };
    setProjects(prev => [...prev, newProject]);
    setProjectTasks(prev => ({ ...prev, [newId]: [] }));
    toast.success(`Project "${name}" created!`, {
        style: { border: '1px solid var(--toast-info)', color: 'var(--toast-text)' },
        iconTheme: { primary: 'var(--toast-info)', secondary: 'var(--toast-bg)' }
    });
  };

  const handleReorderProjects = (reorderedProjects) => {
    setProjects(reorderedProjects);
  };

  /* ── Group handlers (passed to ManagerPanel) ── */
  const handleAddGroup = ({ name }) => {
    setGroups(prev => [...prev, { id: Date.now(), name, memberIds: [], projectIds: [], createdAt: new Date().toISOString().slice(0, 10) }])
  }
  const handleRenameGroup = (id, name) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, name } : g))
  }
  const handleDeleteGroup = (id) => {
    setGroups(prev => prev.filter(g => g.id !== id))
  }
  const handleRestoreGroup = (group) => {
    setGroups(prev => [...prev, group])
  }
  const handleGroupMemberToggle = (groupId, memberId) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g
      const has = g.memberIds.includes(memberId)
      return { ...g, memberIds: has ? g.memberIds.filter(m => m !== memberId) : [...g.memberIds, memberId] }
    }))
  }
  const handleGroupProjectToggle = (groupId, projectId) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g
      const has = g.projectIds.includes(projectId)
      return { ...g, projectIds: has ? g.projectIds.filter(p => p !== projectId) : [...g.projectIds, projectId] }
    }))
  }

  return (
    <>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '16px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '13px',
          boxShadow: 'var(--shadow-lg)',
          padding: '12px 18px',
          background: 'var(--toast-bg)',
          color: 'var(--toast-text)',
          border: '1px solid var(--toast-border)',
        },
        success: {
          iconTheme: { primary: 'var(--toast-success)', secondary: 'var(--toast-bg)' },
          style: { border: '1px solid var(--toast-success)' },
        },
        error: {
          iconTheme: { primary: 'var(--toast-error)', secondary: 'var(--toast-bg)' },
          style: { border: '1px solid var(--toast-error)' },
        },
      }}
    />
    <Routes>
      {/* ── Auth pages ── */}
      <Route element={<PublicRoute user={currentUser} />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      {/* ── Main app shell ── */}
      <Route path="*" element={
        <ProtectedRoute user={currentUser}>
          <div className='flex'>
            <Sidebar
              sidebar={sidebar}
              setSideBar={setSideBar}
              toggleSidebar={toggleSidebar}
              selectedProjectID={selectedProjectID}
              setSelectedProjectID={setSelectedProjectID}
              projects={visibleProjects}
              onAddProject={handleAddProject}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onReorderProjects={handleReorderProjects}
            />
            <div className="flex flex-col w-full">
              <Header projects={visibleProjects} projectTasks={visibleProjectTasks} />
              <Routes>
                <Route path="/" element={<Home projectTasks={visibleProjectTasks} projects={visibleProjects} />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/tasks" element={<Tasks projectTasks={visibleProjectTasks} projects={visibleProjects} />} />
                <Route path="/members" element={<Members projectTasks={visibleProjectTasks} groups={groups} projects={projects} />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/project/:projectId" element={
                  <Layout
                    selectedProject={selectedProject}
                    onTaskMove={handleTaskMove}
                    onTaskDelete={handleTaskDelete}
                    onTaskRestore={handleTaskRestore}
                    onTaskAdd={handleTaskAdd}
                    onTaskUpdate={handleTaskUpdate}
                    onEditProject={handleEditProject}
                  />
                } />

                {/* ── Admin-only route ── */}
                <Route element={<RoleRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminPanel />} />
                </Route>

                {/* ── Manager + Admin route ── */}
                <Route element={<RoleRoute allowedRoles={['admin', 'manager']} />}>
                  <Route path="/manager" element={
                    <ManagerPanel
                      projects={projects}
                      projectTasks={projectTasks}
                      groups={groups}
                      onAddGroup={handleAddGroup}
                      onRenameGroup={handleRenameGroup}
                      onDeleteGroup={handleDeleteGroup}
                      onRestoreGroup={handleRestoreGroup}
                      onGroupMemberToggle={handleGroupMemberToggle}
                      onGroupProjectToggle={handleGroupProjectToggle}
                    />
                  } />
                </Route>

                <Route path="*" element={<Error />} />
              </Routes>
            </div>

            {/* ── Floating Theme Toggle ── */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              data-tooltip={darkMode ? 'Switch to Light' : 'Switch to Dark'}
              aria-label="Toggle dark mode"
            >
              <div className="icon-wrap">
                <svg className="sun-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <svg className="moon-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9B7FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
            </button>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
    </>
  )
}

export default App