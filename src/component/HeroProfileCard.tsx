import { FiUser } from 'react-icons/fi';


export default function HeroProfileCard() {
  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
      {/* Card Adriano Neco */}
      <div className="rounded-2xl bg-white border border-slate-200 p-2 flex items-center gap-3 shadow min-w-[340px] dark:bg-black/30 dark:border-white/10">
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg dark:border-white/20">
            <div className="flex items-center justify-center w-full h-full">
              <FiUser className="w-16 h-16 text-slate-700 dark:text-white/80" />
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Adriano Neco</h3>
            <span className="text-xs text-slate-600 font-semibold dark:text-slate-300">EasyDev</span>
          </div>
          <div className="text-slate-700 text-sm font-medium mt-1 dark:text-slate-200">Full Stack • Banco de Dados • Automação</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Web Apps', 'APIs', 'PostgreSQL', 'MongoDB', 'n8n'].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs text-slate-700 dark:bg-black/40 dark:border-white/10 dark:text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>

        </div>
      </div>
      {/* Card Rogger Brosco */}
      <div className="rounded-2xl bg-white border border-slate-200 p-2 flex items-center gap-3 shadow min-w-[340px] dark:bg-black/30 dark:border-white/10">
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg dark:border-white/20">
            <div className="flex items-center justify-center w-full h-full">
              <FiUser className="w-16 h-16 text-slate-700 dark:text-white/80" />
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rogger Brosco</h3>
            <span className="text-xs text-slate-600 font-semibold dark:text-slate-300">EasyDev</span>
          </div>
          <div className="text-slate-700 text-sm font-medium mt-1 dark:text-slate-200">Full Stack • Banco de Dados • Automação</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Web Apps', 'APIs', 'PostgreSQL', 'MongoDB', 'n8n'].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs text-slate-700 dark:bg-black/40 dark:border-white/10 dark:text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

