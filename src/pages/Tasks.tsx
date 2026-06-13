import { tasks } from "../data/tasks"

export default function Tasks() {
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
                        {task.text}
                    </div>
                ))}

            </div>

        </div>
    )
}