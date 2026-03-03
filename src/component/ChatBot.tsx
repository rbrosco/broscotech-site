'use client';
import { useEffect } from "react";

// Declare o chatwootSDK no objeto window para o TypeScript
declare global {
  interface Window {
    chatwootSDK?: {
      run: (options: {
        websiteToken: string;
        baseUrl: string;
        darkMode?: 'light' | 'dark';
      }) => void;
    };
  }
}

const Chatbot: React.FC = () => {
  useEffect(() => {
    // Evita re-injetar o script se já estiver presente ou se window não estiver definido
    if (typeof window === "undefined" || window.chatwootSDK) {
      return;
    }

    (function(d: Document, t: string) {
      const BASE_URL = "";
      const g = d.createElement(t) as HTMLScriptElement;
      const s = d.getElementsByTagName(t)[0] as HTMLScriptElement | undefined; // Pode ser undefined se não houver scripts

      g.src = BASE_URL + "/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      
      if (s && s.parentNode) {
        s.parentNode.insertBefore(g, s);
      } else {
        // Fallback para adicionar ao head se nenhum script for encontrado ou se s.parentNode não existir
        (d.head || d.documentElement).appendChild(g);
      }
      
      g.onload = function() {
        let chatwootThemeMode: 'light' | 'dark' = 'light';
        try {
          const storedTheme = localStorage.getItem('theme'); 
          if (storedTheme === 'dark') {
            chatwootThemeMode = 'dark';
          } else if (storedTheme === 'light') {
            chatwootThemeMode = 'light';
          } else {
            if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
              chatwootThemeMode = 'dark';
            }
          }
        } catch (error) {
          console.error("Erro ao ler o tema para o Chatwoot:", error);
          if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
            chatwootThemeMode = 'dark';
          }
        }

        if (window.chatwootSDK) {
          window.chatwootSDK.run({
            websiteToken: 'cdiU6YEJFNn2orhaEqJSYqbV',
            baseUrl: BASE_URL,
            darkMode: chatwootThemeMode
          });
        }

        // Aguarda o carregamento e tenta ocultar a marca d'água
        setTimeout(() => {
          const branding = d.querySelector('a[href*="chatwoot"], div[title="Chatwoot"]') as HTMLElement | null;
          if (branding) {
            branding.style.display = "none";
          }
        }, 3000);
      };

      g.onerror = function() {
        console.error("Falha ao carregar o script do Chatwoot.");
      };

    })(document, "script");
  }, []);

  return null;
};

export default Chatbot;
