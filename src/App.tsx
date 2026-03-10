/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Building2, 
  Shield, 
  Wifi, 
  Trash2, 
  GraduationCap, 
  Smartphone, 
  ChevronRight, 
  Plus, 
  FileText, 
  TrendingUp, 
  ExternalLink,
  Target,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PARTNER_COMPANIES, analyzeProgram, searchOpportunities } from './services/geminiService';
import { cn } from './lib/utils';
import ReactMarkdown from 'react-markdown';

interface Opportunity {
  id: string;
  name: string;
  institution: string;
  policyArea: string;
  description: string;
  type: string;
  audience: string;
  application: string;
  relatedCompanies: string[];
  adherence: 'Alta' | 'Média' | 'Baixa';
  strategy: string;
  classification: 'ALTA SINERGIA' | 'SINERGIA PARCIAL' | 'OPORTUNIDADE ESTRATÉGICA';
  evidence: string;
  dateAdded: string;
  isActive: boolean;
  deadline: string;
}

const COMPANY_ICONS: Record<string, React.ReactNode> = {
  betha: <Building2 className="w-4 h-4" />,
  arqia: <Wifi className="w-4 h-4" />,
  contelurb: <Trash2 className="w-4 h-4" />,
  saber: <GraduationCap className="w-4 h-4" />,
  datami: <Smartphone className="w-4 h-4" />,
  iris: <Shield className="w-4 h-4" />,
};

export default function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [analysisInput, setAnalysisInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Load initial mock data or from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('govsmart_opportunities');
    if (saved) {
      setOpportunities(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('govsmart_opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await searchOpportunities(selectedCompany);
      setSearchResults(results || "Nenhum resultado encontrado.");
    } catch (error) {
      console.error(error);
      setSearchResults("Erro ao buscar oportunidades. Verifique sua conexão.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisInput.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeProgram(analysisInput);
      const newOp: Opportunity = {
        ...result,
        id: Math.random().toString(36).substr(2, 9),
        dateAdded: new Date().toLocaleDateString('pt-BR'),
      };
      setOpportunities([newOp, ...opportunities]);
      setAnalysisInput('');
      setShowAnalysisModal(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao analisar programa. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredOpportunities = selectedCompany 
    ? opportunities.filter(op => op.relatedCompanies.includes(selectedCompany))
    : opportunities;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Target className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              GovSmart <span className="text-indigo-600">Intelligence</span>
            </h1>
          </div>
          
          <button 
            onClick={() => setShowAnalysisModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Análise
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar - Companies */}
          <aside className="lg:col-span-3 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter className="w-3 h-3" />
                Empresas Parceiras
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    !selectedCompany ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  Todas as Empresas
                </button>
                {PARTNER_COMPANIES.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => setSelectedCompany(company.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                      selectedCompany === company.id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {COMPANY_ICONS[company.id]}
                    {company.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Status do Mercado
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                O governo federal anunciou recentemente novas diretrizes para o <strong>Novo PAC</strong>, focando em cidades inteligentes e digitalização.
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Search Section */}
            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Target className="w-32 h-32 text-indigo-600" />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Search className="w-6 h-6 text-indigo-600" />
                      Monitoramento de Mercado
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedCompany 
                        ? `Buscando oportunidades institucionais ATIVAS para ${PARTNER_COMPANIES.find(c => c.id === selectedCompany)?.name}...`
                        : "Buscando oportunidades gerais ATIVAS em todos os setores governamentais..."}
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-3 group"
                  >
                    {isSearching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    {isSearching ? 'Mapeando Oportunidades...' : 'Buscar Oportunidades'}
                  </button>
                </div>

                <AnimatePresence>
                  {searchResults && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 border-t border-slate-100 pt-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            Radar de Inteligência: {selectedCompany ? PARTNER_COMPANIES.find(c => c.id === selectedCompany)?.name : 'Geral'}
                          </h4>
                        </div>
                        <button 
                          onClick={() => setSearchResults(null)}
                          className="text-xs font-medium text-slate-400 hover:text-slate-600 flex items-center gap-1"
                        >
                          Fechar Radar
                        </button>
                      </div>
                      
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="prose prose-indigo prose-sm max-w-none text-slate-700">
                          <ReactMarkdown>{searchResults}</ReactMarkdown>
                        </div>
                        
                        <div className="mt-6 flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                          <p className="text-xs text-slate-500">
                            <strong>Dica Estratégica:</strong> Copie a descrição de um programa acima e use o botão <strong>"Nova Análise"</strong> no topo da página para gerar um plano de abordagem detalhado para municípios.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Opportunities List */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Banco de Oportunidades Estratégicas
                  {selectedCompany && <span className="ml-2 text-sm font-normal text-slate-500">para {PARTNER_COMPANIES.find(c => c.id === selectedCompany)?.name}</span>}
                </h2>
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {filteredOpportunities.length} itens
                </span>
              </div>

              {filteredOpportunities.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                  <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="text-slate-300 w-6 h-6" />
                  </div>
                  <h3 className="text-slate-900 font-medium">Nenhuma oportunidade encontrada</h3>
                  <p className="text-slate-500 text-sm mt-1">Comece pesquisando ou adicionando uma nova análise.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredOpportunities.map((op) => (
                    <motion.div 
                      layout
                      key={op.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                              op.classification === 'ALTA SINERGIA' ? "bg-emerald-100 text-emerald-700" :
                              op.classification === 'SINERGIA PARCIAL' ? "bg-amber-100 text-amber-700" :
                              "bg-blue-100 text-blue-700"
                            )}>
                              {op.classification}
                            </span>
                            {op.isActive ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                Aberto
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                                Encerrado
                              </span>
                            )}
                            <span className="text-xs text-slate-400">{op.dateAdded}</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {op.name}
                          </h3>
                          <p className="text-sm font-medium text-indigo-600">{op.institution}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {op.relatedCompanies.map(compId => (
                              <div 
                                key={compId}
                                className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-600 shadow-sm"
                                title={PARTNER_COMPANIES.find(c => c.id === compId)?.name}
                              >
                                {COMPANY_ICONS[compId]}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Descrição do Programa</h4>
                            <p className="text-sm text-slate-600 line-clamp-3">{op.description}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Público Beneficiado</h4>
                            <p className="text-sm text-slate-600">{op.audience}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-tighter mb-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Aplicação das Soluções
                            </h4>
                            <p className="text-sm text-slate-700">{op.application}</p>
                          </div>
                          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-tighter mb-1 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Estratégia de Abordagem
                            </h4>
                            <p className="text-sm text-slate-700 italic">"{op.strategy}"</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">Aderência:</span>
                            <span className={cn(
                              "text-xs font-bold",
                              op.adherence === 'Alta' ? "text-emerald-600" :
                              op.adherence === 'Média' ? "text-amber-600" :
                              "text-slate-600"
                            )}>{op.adherence}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">Área:</span>
                            <span className="text-xs font-bold text-slate-700">{op.policyArea}</span>
                          </div>
                          {op.deadline && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-400">Prazo:</span>
                              <span className="text-xs font-bold text-indigo-600">{op.deadline}</span>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => {
                            setOpportunities(opportunities.filter(o => o.id !== op.id));
                          }}
                          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                        >
                          Remover do Banco
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Analysis Modal */}
      <AnimatePresence>
        {showAnalysisModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAnalysisModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Nova Análise Estratégica</h2>
                  <button 
                    onClick={() => setShowAnalysisModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <ChevronRight className="w-6 h-6 rotate-90" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Descrição do Programa ou Edital
                    </label>
                    <textarea 
                      placeholder="Cole aqui o texto do edital, descrição do programa ministerial ou link com contexto..."
                      className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                      value={analysisInput}
                      onChange={(e) => setAnalysisInput(e.target.value)}
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      A inteligência artificial irá analisar a compatibilidade deste programa com as soluções da <strong>Betha, Arqia, Contelurb, Saber, Datami e Sistema IRIS</strong>, gerando uma estratégia de abordagem institucional.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      onClick={() => setShowAnalysisModal(false)}
                      className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !analysisInput.trim()}
                      className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          Gerar Inteligência
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                <Target className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900">GovSmart Intelligence</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500">
              <a href="#" className="hover:text-indigo-600 transition-colors">Documentação</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Fontes de Dados</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Suporte Estratégico</a>
            </div>
            <p className="text-xs text-slate-400">
              © 2026 GovSmart Intelligence. Agente de Inteligência para o Setor Público.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
