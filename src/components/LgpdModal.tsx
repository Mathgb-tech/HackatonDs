"use client";

import { useState, useEffect } from 'react';
import { ShieldAlert, Check } from 'lucide-react';

export default function LgpdModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasAccepted = sessionStorage.getItem('prenatal_lgpd_accepted');
    if (!hasAccepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    if (!accepted) return;
    sessionStorage.setItem('prenatal_lgpd_accepted', 'true');
    setIsOpen(false);
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 bg-primary text-white flex items-center gap-3 shrink-0">
          <ShieldAlert className="w-8 h-8 text-orange-400" />
          <div>
            <h2 className="text-xl font-bold">Termo de Responsabilidade e Sigilo</h2>
            <p className="text-sm text-white/80">Conformidade com a LGPD (Lei nº 13.709/2018)</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 text-slate-700 text-sm space-y-4">
          <p>
            O <strong>Pré-Natal Ativo</strong> é uma ferramenta de apoio à gestão e operação do Sistema Único de Saúde (SUS). Ao acessar esta plataforma, você, na qualidade de profissional de saúde ou gestor público, terá acesso a <strong>dados pessoais sensíveis</strong> (histórico de saúde, situação socioeconômica e geolocalização).
          </p>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Suas Responsabilidades (Art. 11, LGPD):</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Finalidade Exclusiva:</strong> O acesso a estes dados tem como única finalidade a execução de políticas públicas de saúde, especificamente o acompanhamento de pré-natal e a busca ativa de gestantes.</li>
              <li><strong>Sigilo e Confidencialidade:</strong> É terminantemente proibido o compartilhamento, cópia, exportação, <em>print screen</em> ou divulgação dos dados aqui presentes para pessoas ou entidades não autorizadas.</li>
              <li><strong>Minimização:</strong> Utilize apenas os dados necessários para o exercício da sua função. (Ex: Perfil de Gestor não tem acesso aos dados diretos e nominais das gestantes).</li>
              <li><strong>Auditoria:</strong> Todos os seus acessos, consultas a perfis e atualizações de status são registrados e vinculados à sua credencial para fins de auditoria e segurança da informação.</li>
            </ul>
          </div>

          <p className="text-xs text-slate-500 bg-red-50 p-3 rounded-lg border border-red-100 text-red-800">
            <strong>Atenção:</strong> A violação do sigilo de dados sensíveis em saúde constitui infração gravíssima, sujeita a sanções administrativas, civis e penais cabíveis, além das penalidades previstas na própria Lei Geral de Proteção de Dados.
          </p>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 shrink-0">
          <label className="flex items-start gap-3 cursor-pointer mb-6 group">
            <div className="relative flex items-center justify-center shrink-0 mt-0.5">
              <input 
                type="checkbox" 
                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-primary focus:border-primary checked:bg-primary checked:border-primary transition-colors cursor-pointer bg-white"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
              Declaro que li, compreendo minhas responsabilidades e me comprometo a manter o sigilo absoluto dos dados sensíveis aos quais terei acesso nesta sessão.
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!accepted}
            className="w-full py-3 px-4 bg-primary text-white text-center rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 shadow-sm"
          >
            Aceitar e Acessar o Sistema
          </button>
        </div>
      </div>
    </div>
  );
}
