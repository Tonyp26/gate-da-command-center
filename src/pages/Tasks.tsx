import { useState } from "react"
import { tasks as initialTasks } from "../data/tasks"

export default function Tasks() {
    const [tasks, setTasks] = useState(initialTasks)

    const toggleTask = (id: number) => {
        setTasks(
            tasks.map((task) =>
                task.id === id
                    ? {
                        ...task,
                        completed: !task.completed
                    }
                    : task
            )
        )
    }

    return (
        <div className="flex-1 p-8">

            <h1 className="text-3xl font-bold mb-8">
                Tasks
            </h1>

            <div className="space-y-4">

                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="bg-[#1C2128] p-4 rounded-xl"
                    >
                        <div
                            onClick={() => toggleTask(task.id)}
                            className="cursor-pointer text-lg"
                        >
                            {task.completed ? "☑" : "☐"} {task.text}
                        </div>
                    </div>
                ))}

            </div>

        </div>
    )
}