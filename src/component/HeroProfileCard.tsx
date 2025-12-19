import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';

const HeroProfileCard: React.FC = () => {
  return (
    <article className="max-w-md mx-auto md:mx-0 bg-gradient-to-r from-white/60 to-white/30 dark:from-black/30 dark:to-black/20 border border-black/10 dark:border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-lg">
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 rounded-full flex-shrink-0">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-md opacity-60" />
          <Image
            src="/images/Perfil_Rogger.png"
            alt="Foto de Rogger Brosco"
            width={64}
            height={64}
            className="relative rounded-full border-2 border-white/60 dark:border-white/70 shadow-lg"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rogger Brosco</h3>
              <p className="text-xs text-slate-600 dark:text-white/75">Full Stack • Banco de Dados • Automação</p>
            </div>
            <span className="text-xs text-slate-500 dark:text-white/60">Broscotech</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {['Web Apps','APIs','PostgreSQL','MongoDB','n8n'].map(tag => (
              <span key={tag} className="text-[11px] px-2 py-1 rounded-full bg-black/5 border border-black/10 dark:bg-white/5 dark:border-white/10 text-slate-700 dark:text-white/80">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-3">
            <a href="#Servicos" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              Ver serviços <FiArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HeroProfileCard;
