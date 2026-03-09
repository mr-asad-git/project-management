import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTheme } from './context/ThemeContext'

import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Layout from './components/Layout'
import projectsData from './mui/projects'
import usersData from './mui/users'
import SignUp from './pages/SignUp'
import Error from './pages/Error'

import Home from './pages/Home'
import Messages from './pages/Messages'
import Tasks from './pages/Tasks'
import Members from './pages/Members'
import Settings from './pages/Settings'

const App = () => {
  const { darkMode, toggleTheme } = useTheme()
  const [sidebar, setSideBar] = useState(true);
  const [selectedProjectID, setSelectedProjectID] = useState(1);
  const [user, setUser] = useState(usersData[0]);

  const [projects, setProjects] = useState(projectsData);

  const [projectTasks, setProjectTasks] = useState(() =>
    Object.fromEntries(projectsData.map(p => [p.id, p.tasks]))
  );

  const toggleSidebar = () => setSideBar(!sidebar);

  const selectedProject = {
    ...(projects.find(p => p.id === selectedProjectID) || projects[0]),
    tasks: projectTasks[selectedProjectID] ?? [],
  };

  const handleTaskMove = (taskId, newStatus) => {
    setProjectTasks(prev => ({
      ...prev,
      [selectedProjectID]: prev[selectedProjectID].map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status: newStatus,
          priority: newStatus === 'completed' ? 'Completed' : t.priority,
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

  const handleTaskAdd = (status, { title, text = '', priority, image = null }) => {
    const newTask = {
      id: Date.now(),
      title,
      text,
      priority,
      status,
      comments: 0,
      files: 0,
      image,
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
            if (updatedData.priority === 'Completed' && nextStatus !== 'completed') {
              nextStatus = 'completed';
            }
            return { ...t, ...updatedData, status: nextStatus };
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
    setProjects(prev => prev.filter(p => p.id !== id))
    setProjectTasks(prev => { const next = { ...prev }; delete next[id]; return next })
    if (selectedProjectID === id) setSelectedProjectID(projects[0]?.id ?? null)
  }

  const handleAddProject = ({ name, status }) => {
    const newId = Date.now();
    const newProject = { id: newId, name, status };
    setProjects(prev => [...prev, newProject]);
    setProjectTasks(prev => ({ ...prev, [newId]: [] }));
  };

  const handleReorderProjects = (reorderedProjects) => {
    setProjects(reorderedProjects);
  };

  return (
    <div className='flex'>
      <Sidebar
        sidebar={sidebar}
        setSideBar={setSideBar}
        toggleSidebar={toggleSidebar}
        selectedProjectID={selectedProjectID}
        setSelectedProjectID={setSelectedProjectID}
        projects={projects}
        onAddProject={handleAddProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        onReorderProjects={handleReorderProjects}
      />
      <div className="flex flex-col w-full">
        <Header projects={projects} projectTasks={projectTasks} user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Home projectTasks={projectTasks} projects={projects} />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/tasks" element={<Tasks projectTasks={projectTasks} projects={projects} />} />
          <Route path="/members" element={<Members projectTasks={projectTasks} />} />
          <Route path="/settings" element={<Settings user={user} setUser={setUser} />} />
          <Route path="/project/:projectId" element={<Layout selectedProject={selectedProject} onTaskMove={handleTaskMove} onTaskDelete={handleTaskDelete} onTaskAdd={handleTaskAdd} onTaskUpdate={handleTaskUpdate} onEditProject={handleEditProject} />} />
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
          {/* Sun icon — shown in light mode */}
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
          {/* Moon icon — shown in dark mode */}
          <svg className="moon-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9B7FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>
      </button>
    </div>
  )
}

export default App