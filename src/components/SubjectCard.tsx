type Props = {
    subject: string
    progress: number
    studiedMinutes: number
    totalHours: number
    onAddHour: () => void
    onAdd30Min: () => void
}

export default function SubjectCard({
    subject,
    progress,
    studiedMinutes,
    totalHours,
    onAddHour,
    onAdd30Min
}: Props) {

    if (progress === 100) {
        return (
            <div className="bg-green-600 border-4 border-green-300 p-5 rounded-xl flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-6xl font-bold">
                    ✓
                </div>

                <h3 className="text-2xl font-bold mt-3">
                    COMPLETED
                </h3>

                <p className="mt-2 text-lg">
                    {subject}
                </p>
            </div>
        )
    }

    return (
        <div className="bg-[#1C2128] p-5 rounded-xl">

            <div className="flex justify-between mb-2">
                <h3 className="font-semibold">
                    {subject}
                </h3>

                <span>
                    {progress}%
                </span>
            </div>

            <p className="text-gray-400 text-sm mb-3">
                {(studiedMinutes / 60).toFixed(1)} / {totalHours} Hours
            </p>

            <div className="w-full h-3 bg-gray-700 rounded-full">
                <div
                    className="h-3 bg-blue-500 rounded-full"
                    style={{
                        width: `${progress}%`
                    }}
                />
            </div>

            <div className="flex gap-2 mt-4">
                <button
                    onClick={onAddHour}
                    className="bg-blue-600 px-3 py-2 rounded-lg"
                >
                    +1 Hour
                </button>

                <button
                    onClick={onAdd30Min}
                    className="bg-green-600 px-3 py-2 rounded-lg"
                >
                    +30 Min
                </button>
            </div>

        </div>
    )
}