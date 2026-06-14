import { useState, useEffect } from "react"
import StatCard from "../components/StatCard"
import SubjectCard from "../components/SubjectCard"
import { subjects } from "../data/subjects"

export default function Dashboard() {
  const [subjectData, setSubjectData] = useState(() => {
    const savedData =
      localStorage.getItem("gateSubjects")

    return savedData
      ? JSON.parse(savedData)
      : subjects
  })

  const totalStudiedHours =
    subjectData.reduce(
      (total, subject) =>
        total + subject.studiedMinutes,
      0
    ) / 60

  const totalHours =
    subjectData.reduce(
      (total, subject) =>
        total + subject.totalHours,
      0
    )

  const overallProgress = Math.round(
    (totalStudiedHours / totalHours) * 100
  )
  const savedTasks =
    JSON.parse(
      localStorage.getItem("gateTasks") || "[]"
    )

  const completedTasks =
    savedTasks.filter(
      (task: any) => task.completed
    ).length

  const totalTasks = savedTasks.length

  const examDate = new Date("2027-02-01")
  const today = new Date()

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (examDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
    )
  )

  useEffect(() => {
    localStorage.setItem(
      "gateSubjects",
      JSON.stringify(subjectData)
    )
  }, [subjectData])

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
          value={`${overallProgress}%`}
        />

        <StatCard
          title="Hours"
          value={`${totalStudiedHours.toFixed(1)}/${totalHours}`}
        />

        <StatCard
          title="Tasks Done"
          value={`${completedTasks}/${totalTasks}`}
        />

        <StatCard
          title="Days Left"
          value={daysLeft.toString()}
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
                  (
                    subject.studiedMinutes /
                    (subject.totalHours * 60)
                  ) * 100
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