type Props = {
  title: string
  value: string
}

export default function StatCard({
  title,
  value
}: Props) {
  return (
    <div className="bg-[#1C2128] p-6 rounded-xl">
      <p className="text-gray-400 text-lg">
        {title}
      </p>

      <h2 className="text-4xl font-bold mt-2">
        {value}
      </h2>
    </div>
  )
}