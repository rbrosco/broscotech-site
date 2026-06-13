import Link from "next/link";
import Header from "../../component/Header";

export const metadata = {
  title: 'Licença - EASYDEV',
  description: 'Informações sobre licenças do código, dependências e ativos usados no site EASYDEV.',
};

export default function LicencaPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Licença</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Código-fonte</h2>
        <p className="mb-4">O código deste site é disponibilizado sob a licença MIT:</p>
        <pre className="bg-slate-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
  {`MIT License

Copyright (c) 2025 EASYDEV

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the \"Software\"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

...`}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Dependências (licenças conhecidas)</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            React — MIT — <Link href="https://reactjs.org/">reactjs.org</Link>
          </li>
          <li>
            Next.js — MIT — <Link href="https://nextjs.org/">nextjs.org</Link>
          </li>
          <li>
            Tailwind CSS — MIT — <Link href="https://tailwindcss.com/">tailwindcss.com</Link>
          </li>
          <li>
            Framer Motion — MIT — <Link href="https://www.framer.com/motion/">framer.com</Link>
          </li>
          <li>
            React Icons — MIT — <Link href="https://react-icons.github.io/react-icons/">react-icons</Link>
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Consulte o <em>package.json</em> para a lista completa de dependências e links para suas licenças.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Imagens, fontes e outros ativos</h2>
        <p className="mb-3">Os ativos presentes em <code>public/</code> têm licenças variadas. Sempre verifique os arquivos de origem ou o fornecedor dos ativos.</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Logotipos e imagens originais: propriedade da EASYDEV.</li>
          <li>Fontes: consulte <code>public/fonts/</code> para detalhes e créditos.</li>
          <li>Imagens de terceiros: a licença específica aparece na origem do ativo — entre em contato se precisar das fontes exatas.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Mais informações / contato</h2>
        <p className="mb-3">Para solicitar cópias completas de licenças, remoção de conteúdo ou dúvidas relacionadas a direitos, entre em contato:</p>
        <p className="text-sm">Email: <Link href="mailto:legal@easydev.example">legal@easydev.example</Link></p>
      </section>
      </main>
    </>
  );
}
