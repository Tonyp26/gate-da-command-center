import { Link } from "react-router-dom"

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#161B22] p-5 min-h-screen">

      <h1 className="text-xl font-bold mb-8">
        GATE DA 2027
      </h1>

      <div className="space-y-4">

        <Link
          to="/"
          className="block hover:text-blue-400"
        >
          Dashboard
        </Link>

        <div>Subjects</div>

        <Link
          to="/tasks"
          className="block hover:text-blue-400"
        >
          Tasks
        </Link>

        <div>Analytics</div>

      </div>

    </div>
  )
}