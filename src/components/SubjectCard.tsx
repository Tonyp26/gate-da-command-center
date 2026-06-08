type Props = {
    subject: string
    progress: number
    studiedHours: number
    totalHours: number
}

export default function SubjectCard({
    subject,
    progress,
    studiedHours,
    totalHours
}: Props) {
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
                {studiedHours} / {totalHours} Hours
            </p>

            <div className="w-full h-3 bg-gray-700 rounded-full">
                <div
                    className="h-3 bg-blue-500 rounded-full"
                    style={{
                        width: `${progress}%`
                    }}
                />
            </div>

        </div>
    )
}