"use client";

import { useEffect, useState } from "react";

export default function ThemeProvider() {
  const [theme, setTheme] = useState<string | null>(null);
  useEffect(() => {
    // A lógica de tema agora é centralizada em ThemeToggle.tsx
    // Este componente pode ser removido ou deixado vazio se outras partes do sistema dependerem de sua existência.
    // Para desativar sua funcionalidade, o conteúdo do useEffect foi removido.
    // Considere remover o uso deste componente em sua aplicação (ex: _app.tsx ou layout principal).
  }, []);
  // Retorna nulo pois só precisamos do efeito colateral
  return null;
}
