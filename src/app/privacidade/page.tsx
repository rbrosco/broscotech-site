import Link from "next/link";
import Header from "../../component/Header";

export const metadata = {
  title: 'Política de Privacidade - EASYDEV',
  description: 'Política de Privacidade do site EASYDEV: coleta, uso e direitos do usuário.',
};

export default function PrivacidadePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>

        <section className="mb-6">
          <p>
            Esta Política de Privacidade descreve como a <strong>EASYDEV</strong> coleta, usa, compartilha e protege as informações
            pessoais dos usuários ao utilizar nosso site.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Informações que coletamos</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Dados fornecidos diretamente: nome, e-mail e outras informações de contato quando você preenche formulários.</li>
            <li>Dados de uso: informações sobre como você interage com o site (páginas visitadas, tempo de uso, etc.).</li>
            <li>Dados técnicos: endereço IP, tipo de navegador, sistema operacional e informações de dispositivo.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Como usamos as informações</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Fornecer e personalizar os serviços e conteúdo do site.</li>
            <li>Responder a solicitações, mensagens e suporte.</li>
            <li>Melhorar a experiência do usuário e analisar o uso do site.</li>
            <li>Cumprir obrigações legais e proteger nossos direitos.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. Cookies e tecnologias semelhantes</h2>
          <p>
            Utilizamos cookies e tecnologias similares para lembrar preferências, analisar tráfego e oferecer funcionalidades.
            Você pode controlar o uso de cookies nas configurações do seu navegador.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">4. Compartilhamento de dados</h2>
          <p>
            Não vendemos informações pessoais. Podemos compartilhar dados com provedores de serviços que nos ajudam a operar o site
            (ex.: provedores de hospedagem, ferramentas de análise) e quando exigido por lei.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Seus direitos</h2>
          <p>
            Dependendo da sua jurisdição, você pode ter direitos de acessar, corrigir, portar ou apagar seus dados pessoais. Para exercer
            esses direitos, entre em contato conosco pelo e-mail abaixo.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">6. Segurança</h2>
          <p>
            Adotamos medidas técnicas e organizacionais adequadas para proteger os dados pessoais. No entanto, nenhum método de
            transmissão ou armazenamento é 100% seguro; solicite informações sobre medidas específicas quando necessário.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">7. Alterações nesta política</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente. Publicaremos a data da última alteração e, quando apropriado,
            notificaremos os usuários sobre mudanças significativas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Contato</h2>
          <p className="mb-2">Para dúvidas ou solicitações relacionadas à privacidade, entre em contato:</p>
          <p className="text-sm">Email: <Link href="mailto:legal@easydev.example">legal@easydev.example</Link></p>
        </section>
      </main>
    </>
  );
}
