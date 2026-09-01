'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

/**
 * Envolve a árvore de componentes com o MotionConfig do framer-motion
 * configurado para respeitar `prefers-reduced-motion` do sistema
 * (reducedMotion="user"): quando o usuário tem a preferência ativa,
 * todas as animações `motion.*` do site (Header, LoginModal, etc.)
 * passam a pular direto para o estado final, sem precisar tocar em
 * cada componente individualmente.
 */
export default function MotionA11yProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
