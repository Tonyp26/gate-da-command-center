type Props = {
  title: string
  value: string
}

export default function StatCard({ title, value }: Props) {
  return (
    <div className="bg-[#1C2128] p-5 rounded-xl">

      <h3 className="text-gray-400">
        {title}
      </h3>

      <p className="text-3xl font-bold">
        {value}
      </p>

    </div>
  )
}