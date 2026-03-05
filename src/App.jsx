import React, { useState } from 'react'
import Sidebar from './components/Sidebar'

const App = () => {
  const [sidebar, setSideBar] = useState(true);

  const toggleSidebar = () => {
    setSideBar(!sidebar);
  }

  return (
    <Sidebar sidebar={sidebar} setSideBar={setSideBar} toggleSidebar={toggleSidebar} />
  )
}

export default App