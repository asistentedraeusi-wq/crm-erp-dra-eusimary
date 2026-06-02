import { Construction } from 'lucide-react'

interface Props {
  title: string
}

export default function PlaceholderPage({ title }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-[#12C49A]/10 flex items-center justify-center">
        <Construction size={24} className="text-[#12C49A]" />
      </div>
      <div>
        <h2 className="text-[#0D2244] text-xl font-semibold">{title}</h2>
        <p className="text-gray-400 text-sm mt-1">Módulo en construcción — próxima fase</p>
      </div>
    </div>
  )
}
