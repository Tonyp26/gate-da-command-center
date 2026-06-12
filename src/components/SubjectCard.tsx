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
    return (
        <div className="bg-[#1C2128] p-5 rounded-xl">

            <div className="flex justify-between mb-2">
                <h3 className="font-semibold">
                    {subject}
                </h3>

                {progress === 100 ? (
                    <span className="text-green-400 font-semibold">
                        ✅ Completed
                    </span>
                ) : (
                    <span>
                        {progress}%
                    </span>
                )}
            </div>

            <p className="text-gray-400 text-sm mb-3">
                {(studiedMinutes / 60).toFixed(1)} / {totalHours} Hours
            </p>

            <div className="w-full h-3 bg-gray-700 rounded-full">
                <div
                    className={`h-3 rounded-full ${progress === 100
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
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