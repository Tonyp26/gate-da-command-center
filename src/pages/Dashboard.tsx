import StatCard from "../components/StatCard"
import SubjectCard from "../components/SubjectCard"

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

      <h2 className="text-2xl font-bold mt-10 mb-5">
        Subjects
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <SubjectCard
          subject="Linear Algebra"
          progress={0}
        />

        <SubjectCard
          subject="Numerical Ability"
          progress={0}
        />

        <SubjectCard
          subject="Probability & Statistics"
          progress={0}
        />

        <SubjectCard
          subject="Python"
          progress={0}
        />

      </div>

    </div>
  )
}