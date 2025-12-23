import Image from "next/image";
import { FiMail, FiUser } from "react-icons/fi";
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
  <div className="relative w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl shadow-2xl dark:from-black/20 dark:to-black/10 dark:border-white/10 overflow-hidden">
    <div className="pointer-events-none absolute -inset-10 opacity-20 dark:opacity-30">
      <div className="gradient w-full h-full blur-3xl animate-pulse" />
    </div>
    <div className="relative">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-30 animate-pulse"></div>
          <Image
            src={image}
            alt={`Foto de ${name}`}
            width={120}
            height={120}
            className="relative rounded-full border-4 border-white/50 shadow-2xl dark:border-white/70"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-white/80 bg-clip-text text-transparent">
          {name}
        </h1>
        <p className="mt-1 text-md sm:text-lg font-medium text-slate-700 dark:text-white/70">{title}</p>
        <div className="mt-2 flex flex-wrap gap-2 justify-center text-xs">
          {skills.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/60 border border-black/10 px-3 py-1 text-slate-700 dark:bg-black/20 dark:border-white/10 dark:text-white/80"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl bg-white/20 dark:bg-black/20 border border-white/10 dark:border-white/5 shadow">
          <h2 className="text-base font-semibold flex items-center text-slate-900 dark:text-white mb-2">
            <FiUser className="h-5 w-5 mr-2 text-purple-500" />Sobre
          </h2>
          <p className="text-slate-700 dark:text-white/80 text-sm leading-relaxed">{bio}</p>
        </div>
        <a
          href={`mailto:${email}`}
          className="mt-4 inline-flex items-center justify-center px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
        >
          <FiMail className="h-5 w-5 mr-2" />
          Contato
        </a>
      </div>
    </div>
  </div>
);

export default VCard;
