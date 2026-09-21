import { BottomNav } from '@/components/shared/BottomNav';
import { CidadaoTopNav } from '@/components/shared/CidadaoTopNav';

export default function CidadaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sol density-cidadao">
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-folha focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Ir para o conteúdo
      </a>
      <CidadaoTopNav />
      <div id="conteudo-principal" className="pb-20 md:pb-0">
        {children}
      </div>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
