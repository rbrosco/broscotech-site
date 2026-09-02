'use client';
import Image from "next/image";
import { FiMail } from "react-icons/fi";
import { FaGithub } from "react-icons/fa";
import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface VCardProps {
  name: string;
  image: string;
  title: string;
  skills: string[];
  bio: string;
  email: string;
  githubUrl?: string;
}

const VCard: React.FC<VCardProps> = ({ name, image, title, skills, bio, email, githubUrl }) => {
  const [imgSrc, setImgSrc] = useState(image);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Mouse coordinates normalized from -0.5 to 0.5
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for buttery smooth tilt
  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 18 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 18 });

  // Tilt rotations (subtle Pokemon card style)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10]);

  // Holographic glare coordinates (0% to 100%)
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [10, 90]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [10, 90]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      style={{ perspective: 1200 }}
      className="w-full max-w-md mx-auto py-2"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.025 }}
        transition={{ scale: { duration: 0.25, ease: "easeOut" } }}
        className="relative rounded-3xl border border-black/10 bg-white/85 dark:border-white/15 dark:bg-[#071324]/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden cursor-pointer select-none"
      >
        {/* Holographic / Pokemon foil sheen effect that follows mouse */}
        <motion.div
          className="pointer-events-none absolute -inset-[50%] transition-opacity duration-300 z-10 mix-blend-overlay dark:mix-blend-color-dodge"
          style={{
            opacity: isHovered ? 0.85 : 0,
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle 320px at ${gx}% ${gy}%, rgba(0, 220, 180, 0.45), rgba(168, 85, 247, 0.35), rgba(59, 130, 246, 0.2), transparent 70%)`
            ),
          }}
        />

        {/* Diagonal holographic shimmer rainbow band */}
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500 opacity-0 group-hover:opacity-30"
          style={{
            opacity: isHovered ? 0.18 : 0,
            background: "linear-gradient(115deg, transparent 20%, rgba(0, 212, 170, 0.3) 40%, rgba(168, 85, 247, 0.35) 50%, rgba(59, 130, 246, 0.3) 60%, transparent 80%)",
          }}
        />

        {/* Ambient subtle glow inside card */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-15 dark:opacity-20"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Card Content with 3D layers */}
        <div className="relative z-20" style={{ transformStyle: "preserve-3d" }}>
          <div className="flex flex-col items-center">
            {/* Avatar - Elevated in 3D */}
            <div
              className="relative mb-4"
              style={{ transform: "translateZ(35px)", transformStyle: "preserve-3d" }}
            >
              <div
                className="absolute inset-0 rounded-full opacity-35 blur-xl transition-opacity duration-300"
                style={{ background: 'var(--color-accent)' }}
              />
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={`Foto de ${name}`}
                  width={112}
                  height={112}
                  unoptimized
                  onError={() => setImgSrc('')}
                  className="relative w-28 h-28 rounded-full border-2 border-white/70 shadow-2xl dark:border-cyan-400/40 object-cover"
                />
              ) : (
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#004aad] to-[#00b09b] flex items-center justify-center text-white text-2xl font-bold border-2 border-white/70 shadow-2xl dark:border-cyan-400/40">
                  {initials}
                </div>
              )}
            </div>

            {/* Name & Title - Elevated in 3D */}
            <div
              className="text-center"
              style={{ transform: "translateZ(28px)" }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {name}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-cyan-300/80">
                {title}
              </p>
            </div>

            {/* Skills Badges - Elevated in 3D */}
            <div
              className="mt-3 flex flex-wrap gap-2 justify-center"
              style={{ transform: "translateZ(22px)" }}
            >
              {skills.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-black/8 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-white/85 shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Bio - Elevated in 3D */}
            <p
              className="mt-4 text-sm text-slate-600 dark:text-white/70 text-center leading-relaxed max-w-xs"
              style={{ transform: "translateZ(18px)" }}
            >
              {bio}
            </p>

            {/* Action Buttons - Elevated in 3D */}
            <div
              className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full"
              style={{ transform: "translateZ(30px)" }}
            >
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-black/10 bg-white/80 hover:bg-white text-slate-800 transition-all duration-200 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 shadow-sm hover:shadow"
                  aria-label={`GitHub de ${name}`}
                >
                  <FaGithub className="w-4 h-4" />
                  GitHub
                </a>
              )}
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all duration-200 hover:opacity-95 hover:shadow-xl hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
              >
                <FiMail className="w-4 h-4" />
                Contato
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VCard;
