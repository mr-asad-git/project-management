import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Layout from './components/Layout'
import projects from './mui/projects'

const App = () => {
  const [sidebar, setSideBar] = useState(true);
  const [selectedProjectID, setSelectedProjectID] = useState(1);

  const toggleSidebar = () => {
    setSideBar(!sidebar);
  }

  const selectedProject = projects.find(
    project => project.id === selectedProjectID
  ) || projects[0];

  return (
    <div className='flex'>
      <Sidebar sidebar={sidebar} setSideBar={setSideBar} toggleSidebar={toggleSidebar} selectedProjectID={selectedProjectID} setSelectedProjectID={setSelectedProjectID} />
      <div className="flex flex-col w-full">
        <Header />
        <Layout selectedProject={selectedProject} />
      </div>
    </div>
  )
}

export default App