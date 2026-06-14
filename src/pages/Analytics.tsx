import StatCard from "../components/StatCard"

export default function Analytics() {
    const subjects = JSON.parse(
        localStorage.getItem("gateSubjects") || "[]"
    )

    const tasks = JSON.parse(
        localStorage.getItem("gateTasks") || "[]"
    )

    const totalStudiedHours =
        subjects.reduce(
            (total: number, subject: any) =>
                total + subject.studiedMinutes,
            0
        ) / 60

    const totalHours =
        subjects.reduce(
            (total: number, subject: any) =>
                total + subject.totalHours,
            0
        )

    const overallProgress =
        totalHours > 0
            ? Math.round(
                (totalStudiedHours / totalHours) * 100
            )
            : 0

    const completedSubjects =
        subjects.filter(
            (subject: any) =>
                subject.studiedMinutes >=
                subject.totalHours * 60
        ).length

    const completedTasks =
        tasks.filter(
            (task: any) => task.completed
        ).length

    return (
        <div className="flex-1 p-8">

            <h1 className="text-3xl font-bold mb-8">
                Analytics
            </h1>

            <div className="grid grid-cols-4 gap-4">

                <StatCard
                    title="Hours Studied"
                    value={totalStudiedHours.toFixed(1)}
                />

                <StatCard
                    title="Progress"
                    value={`${overallProgress}%`}
                />

                <StatCard
                    title="Subjects Done"
                    value={`${completedSubjects}/${subjects.length}`}
                />

                <StatCard
                    title="Tasks Done"
                    value={`${completedTasks}/${tasks.length}`}
                />

            </div>

        </div>
    )
}