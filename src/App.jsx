import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Layout from './components/Layout'
import projectsData from './mui/projects'

import Home from './pages/Home'
import Messages from './pages/Messages'
import Tasks from './pages/Tasks'
import Members from './pages/Members'
import Settings from './pages/Settings'

const App = () => {
  const [sidebar, setSideBar] = useState(true);
  const [selectedProjectID, setSelectedProjectID] = useState(1);

  // Projects list lives in state so new ones can be added at runtime
  const [projects, setProjects] = useState(projectsData);

  // Per-project tasks keyed by project id
  const [projectTasks, setProjectTasks] = useState(() =>
    Object.fromEntries(projectsData.map(p => [p.id, p.tasks]))
  );

  const toggleSidebar = () => setSideBar(!sidebar);

  const selectedProject = {
    ...(projects.find(p => p.id === selectedProjectID) || projects[0]),
    tasks: projectTasks[selectedProjectID] ?? [],
  };

  // Move a task and optionally promote its priority when landing in Completed
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

  // Edit project name/status
  const handleEditProject = (id, { name, status }) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name, status } : p))
  }

  // Delete a project
  const handleDeleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    setProjectTasks(prev => { const next = { ...prev }; delete next[id]; return next })
    if (selectedProjectID === id) setSelectedProjectID(projects[0]?.id ?? null)
  }

  // Add a brand-new project from the Sidebar modal
  const handleAddProject = ({ name, status }) => {
    const newId = Date.now();
    const newProject = { id: newId, name, status };
    setProjects(prev => [...prev, newProject]);
    setProjectTasks(prev => ({ ...prev, [newId]: [] }));
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
      />
      <div className="flex flex-col w-full">
        <Header />
        <Routes>
          <Route path="/" element={<Home projectTasks={projectTasks} projects={projects} />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/tasks" element={<Tasks projectTasks={projectTasks} projects={projects} />} />
          <Route path="/members" element={<Members projectTasks={projectTasks} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/project/:projectId" element={<Layout selectedProject={selectedProject} onTaskMove={handleTaskMove} onEditProject={handleEditProject} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App