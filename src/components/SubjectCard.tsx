type Props = {
    subject: string
    progress: number
}

export default function SubjectCard({
    subject,
    progress
}: Props) {
    return (
        <div className="bg-[#1C2128] p-5 rounded-xl">
            <div className="flex justify-between mb-3">
                <h3 className="font-semibold">
                    {subject}
                </h3>

                <span>
                    {progress}%
                </span>
            </div>

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