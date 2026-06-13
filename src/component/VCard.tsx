import Image from "next/image";
import { FiMail } from "react-icons/fi";
import React from "react";

interface VCardProps {
  name: string;
  image: string;
  title: string;
  skills: string[];
  bio: string;
  email: string;
}

const VCard: React.FC<VCardProps> = ({ name, image, title, skills, bio, email }) => (
  <div className="relative w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl border border-black/8 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300 dark:border-white/10 dark:bg-white/5 overflow-hidden">
    {/* Subtle accent glow */}
    <div
      className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 dark:opacity-15"
      style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 70%)' }}
      aria-hidden="true"
    />

    <div className="relative">
      <div className="flex flex-col items-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <div
            className="absolute inset-0 rounded-full opacity-25 blur-lg"
            style={{ background: 'var(--color-accent)' }}
          />
          <Image
            src={image}
            alt={`Foto de ${name}`}
            width={112}
            height={112}
            className="relative rounded-full border-2 border-white/60 shadow-lg dark:border-white/20 object-cover"
          />
        </div>

        {/* Name & title */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white text-center">
          {name}
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/60 text-center">{title}</p>

        {/* Skills */}
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {skills.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-black/8 bg-white/60 px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/75"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bio */}
        <p className="mt-4 text-sm text-slate-600 dark:text-white/65 text-center leading-relaxed max-w-xs">
          {bio}
        </p>

        {/* CTA */}
        <a
          href={`mailto:${email}`}
          className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow transition-all duration-200 hover:opacity-90 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
        >
          <FiMail className="w-4 h-4" />
          Entrar em contato
        </a>
      </div>
    </div>
  </div>
);

export default VCard;
