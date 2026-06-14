import { BrowserRouter, Routes, Route } from "react-router-dom"

import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import Tasks from "./pages/Tasks"

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />

        <Routes>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/tasks"
            element={<Tasks />}
          />
        </Routes>

      </div>
    </BrowserRouter>
  )
}

export default App