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

            <h2 className="text-2xl font-bold mt-10 mb-5">
                Subject Progress
            </h2>

            <div className="space-y-4">

                {subjects.map((subject: any) => {
                    const progress = Math.round(
                        (subject.studiedMinutes /
                            (subject.totalHours * 60)) *
                        100
                    )

                    return (
                        <div
                            key={subject.name}
                            className="bg-[#1C2128] p-4 rounded-xl"
                        >
                            <div className="flex justify-between mb-2">

                                <span>
                                    {subject.name}
                                </span>

                                <span>
                                    {Math.min(progress, 100)}%
                                </span>

                            </div>

                            <div className="w-full h-3 bg-gray-700 rounded-full">

                                <div
                                    className={`h-3 rounded-full ${progress === 100
                                            ? "bg-green-500"
                                            : "bg-blue-500"
                                        }`}
                                    style={{
                                        width: `${Math.min(progress, 100)}%`
                                    }}
                                />

                            </div>

                        </div>
                    )
                })}

            </div>

        </div>
    )
}