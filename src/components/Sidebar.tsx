import { NavLink } from "react-router-dom"

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#161B22] p-5 min-h-screen">

      <h1 className="text-xl font-bold mb-8">
        GATE DA 2027
      </h1>

      <div className="space-y-4">

        <NavLink
          to="/"
          className={({ isActive }) =>
            `block p-2 rounded-lg ${isActive
              ? "bg-blue-600 text-white"
              : "hover:bg-[#21262D]"
            }`
          }
        >
          Dashboard
        </NavLink>

        <div className="p-2 text-gray-500">
          Subjects
        </div>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `block p-2 rounded-lg ${isActive
              ? "bg-blue-600 text-white"
              : "hover:bg-[#21262D]"
            }`
          }
        >
          Tasks
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `block p-2 rounded-lg ${isActive
              ? "bg-blue-600 text-white"
              : "hover:bg-[#21262D]"
            }`
          }
        >
          Analytics
        </NavLink>

      </div>

    </div>
  )
}
