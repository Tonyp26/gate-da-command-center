import { useState } from "react"
import StatCard from "../components/StatCard"
import SubjectCard from "../components/SubjectCard"
import { subjects } from "../data/subjects"

export default function Dashboard() {
  const [subjectData, setSubjectData] = useState(subjects)

  const addHour = (subjectName: string) => {
    setSubjectData(
      subjectData.map((subject) =>
        subject.name === subjectName
          ? {
            ...subject,
            studiedMinutes: Math.min(
              subject.studiedMinutes + 60,
              subject.totalHours * 60
            )
          }
          : subject
      )
    )
  }

  const add30Min = (subjectName: string) => {
    setSubjectData(
      subjectData.map((subject) =>
        subject.name === subjectName
          ? {
            ...subject,
            studiedMinutes: Math.min(
              subject.studiedMinutes + 30,
              subject.totalHours * 60
            )
          }
          : subject
      )
    )
  }

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
        {subjectData.map((subject) => (
          <SubjectCard
            key={subject.name}
            subject={subject.name}
            studiedMinutes={subject.studiedMinutes}
            totalHours={subject.totalHours}
            progress={
              Math.min(
                Math.round(
                  (subject.studiedMinutes /
                    (subject.totalHours * 60)) *
                  100
                ),
                100
              )
            }
            onAddHour={() => addHour(subject.name)}
            onAdd30Min={() => add30Min(subject.name)}
          />
        ))}
      </div>
    </div>
  )
}