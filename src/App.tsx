import Sidebar from "./components/Sidebar"

import Tasks from "./pages/Tasks"

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <Tasks />
    </div>
  )
}

export default App