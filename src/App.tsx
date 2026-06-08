import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <Dashboard />
    </div>
  )
}

export default App