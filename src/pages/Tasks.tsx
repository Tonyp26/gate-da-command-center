import { useState, useEffect } from "react"
import { tasks as initialTasks } from "../data/tasks"

export default function Tasks() {
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem("gateTasks")

        return savedTasks
            ? JSON.parse(savedTasks)
            : initialTasks
    })

    const [newTask, setNewTask] = useState("")

    useEffect(() => {
        console.log("Saving tasks...", tasks)

        localStorage.setItem(
            "gateTasks",
            JSON.stringify(tasks)
        )
    }, [tasks])

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

    const addTask = () => {
        if (newTask.trim() === "") return

        const task = {
            id: Date.now(),
            text: newTask,
            completed: false
        }

        setTasks([...tasks, task])

        setNewTask("")
    }

    const deleteTask = (id: number) => {
        setTasks(
            tasks.filter(
                (task) => task.id !== id
            )
        )
    }

    return (
        <div className="flex-1 p-8">

            <h1 className="text-3xl font-bold mb-8">
                Tasks
            </h1>

            <div className="flex gap-3 mb-6">

                <input
                    type="text"
                    value={newTask}
                    onChange={(e) =>
                        setNewTask(e.target.value)
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            addTask()
                        }
                    }}
                    placeholder="Enter a task..."
                    className="flex-1 bg-[#1C2128] p-3 rounded-xl outline-none"
                />

                <button
                    onClick={addTask}
                    className="bg-blue-600 px-5 rounded-xl"
                >
                    Add Task
                </button>

            </div>

            <div className="space-y-4">

                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="bg-[#1C2128] p-4 rounded-xl flex justify-between items-center"
                    >
                        <div
                            onClick={() => toggleTask(task.id)}
                            className={`cursor-pointer text-lg ${task.completed
                                ? "line-through text-gray-400"
                                : ""
                                }`}
                        >
                            {task.completed ? "☑" : "☐"} {task.text}
                        </div>

                        <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-400 text-xl hover:scale-110"
                        >
                            🗑
                        </button>
                    </div>
                ))}

            </div>

        </div>
    )
}