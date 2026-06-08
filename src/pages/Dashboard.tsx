import StatCard from "../components/StatCard"

export default function Dashboard() {
  return (
    <div className="flex-1 p-8">

      <h1 className="text-3xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-4">

        <StatCard
          title="Progress"
          value="0%"
        />

        <StatCard
          title="Hours"
          value="0/181"
        />

        <StatCard
          title="Streak"
          value="0"
        />

        <StatCard
          title="Days Left"
          value="245"
        />

      </div>

    </div>
  )
}