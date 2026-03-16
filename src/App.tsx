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
import { PARTNER_COMPANIES, MINISTRIES, analyzeProgram, searchOpportunities } from './services/geminiService';
import { cn } from './lib/utils';
import { generateCompanyReport } from './services/reportService';

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
  link?: string;
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [analysisInput, setAnalysisInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Opportunity[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchOpportunities(selectedCompany, selectedMinistry);
      setSearchResults(results.map((r: any) => ({
        ...r,
        id: Math.random().toString(36).substr(2, 9),
        dateAdded: new Date().toLocaleDateString('pt-BR'),
      })));
    } catch (error) {
      console.error(error);
      setSearchError("Erro ao buscar oportunidades. Verifique sua conexão ou cota da API.");
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
      setSearchResults(prev => prev ? [newOp, ...prev] : [newOp]);
      setAnalysisInput('');
      setShowAnalysisModal(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao analisar programa. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentOpportunities = searchResults || [];

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
              IMI Oportunidades <span className="text-indigo-600">MINISTERIOS</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!selectedCompany) {
                  alert("Selecione uma empresa primeiro.");
                  return;
                }
                generateCompanyReport(selectedCompany, selectedMinistry, currentOpportunities);
              }}
              className="hidden md:flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              Exportar Relatório Word
            </button>
            <button
              onClick={() => setShowAnalysisModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nova Análise
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Company Selector - Dropdown */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 max-w-md">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Filter className="w-3 h-3 text-indigo-500" />
                  Selecione a Empresa Parceira
                </label>
                <div className="relative group">
                  <select
                    value={selectedCompany || ''}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-all appearance-none cursor-pointer hover:bg-white"
                  >
                    <option value="" disabled>Selecione uma empresa...</option>
                    {PARTNER_COMPANIES.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-md">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Filter className="w-3 h-3 text-indigo-500" />
                  Selecione o Ministério (Opcional)
                </label>
                <div className="relative group">
                  <select
                    value={selectedMinistry || ''}
                    onChange={(e) => setSelectedMinistry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-all appearance-none cursor-pointer hover:bg-white"
                  >
                    <option value="">Todos os Ministérios / Geral</option>
                    {MINISTRIES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 flex-none">
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !selectedCompany}
                  className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                  {isSearching ? 'Mapeando...' : 'Mapear Oportunidade'}
                </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            {/* Main Content */}
            <div className="space-y-8">

              {/* Status Section (Simplified) */}
              <section className="bg-indigo-600 rounded-2xl p-6 shadow-xl relative overflow-hidden hidden md:block">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Target className="w-32 h-32 text-white" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">Radar de Inteligência IMI Oportunidades</h2>
                    <p className="text-sm text-indigo-100">
                      Monitorando editais e programas {selectedMinistry && <span>do <span className="font-extrabold text-white underline underline-offset-4 decoration-indigo-300">{MINISTRIES.find(m => m.id === selectedMinistry)?.name}</span> </span>}
                      para <span className="font-extrabold text-white underline underline-offset-4 decoration-indigo-300">{PARTNER_COMPANIES.find(c => c.id === selectedCompany)?.name || 'Empresas Parceiras'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-white tracking-wider">SISTEMA ATIVO</span>
                  </div>
                </div>
              </section>

            {/* Opportunities List */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Radar de Inteligência Estratégica
                  {(selectedCompany || selectedMinistry) && (
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      para {PARTNER_COMPANIES.find(c => c.id === selectedCompany)?.name || 'Empresas'}
                      {selectedMinistry && ` no ${MINISTRIES.find(m => m.id === selectedMinistry)?.name}`}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (!selectedCompany) {
                        alert("Selecione uma empresa primeiro.");
                        return;
                      }
                      generateCompanyReport(selectedCompany, selectedMinistry, currentOpportunities);
                    }}
                    className="md:hidden flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Report
                  </button>
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {currentOpportunities.length} resultados encontrados
                  </span>
                </div>
              </div>

              {isSearching && !searchResults ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="text-slate-500">Mapeando oportunidades em tempo real...</p>
                </div>
              ) : currentOpportunities.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                  <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="text-slate-300 w-6 h-6" />
                  </div>
                  <h3 className="text-slate-900 font-medium">Nenhum resultado no radar</h3>
                  <p className="text-slate-500 text-sm mt-1">Clique em "Atualizar Radar" ou mude o filtro de empresa.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {currentOpportunities.map((op) => (
                    <motion.div
                      layout
                      key={op.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
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

                        <div className="flex flex-col items-start md:items-end gap-2 mt-4 md:mt-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oportunidade focada para:</span>
                          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                            {op.relatedCompanies?.map(compId => {
                              const company = PARTNER_COMPANIES.find(c => c.id === compId);
                              return (
                                <div
                                  key={compId}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 shadow-sm"
                                  title={company?.name}
                                >
                                  {COMPANY_ICONS[compId] && <span className="text-indigo-600">{COMPANY_ICONS[compId]}</span>}
                                  {company?.name || compId}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Descrição do Programa</h4>
                            <p className="text-sm text-slate-600">{op.description}</p>
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
                        <div className="md:col-span-2 mt-4 space-y-2">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Trecho ou Evidência da Política Pública
                          </h4>
                          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 italic font-serif">
                            {op.evidence}
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
                          {op.link && (
                            <a
                              href={op.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Link Oficial
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSearchResults(currentOpportunities.filter(o => o.id !== op.id));
                          }}
                          className="text-xs text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Ignorar Oportunidade
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
            </div>
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
                      A inteligência artificial irá analisar a compatibilidade deste programa com as soluções da <strong>Betha, Arqia, Contelurb, Saber, Datami e Sistema IRIS</strong>, inserindo-o no radar de hoje.
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
                          Adicionar ao Radar
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
              <span className="font-bold text-slate-900">IMI Oportunidades MINISTERIOS</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500">
              <a href="#" className="hover:text-indigo-600 transition-colors">Documentação</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Fontes de Dados</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Suporte Estratégico</a>
            </div>
            <p className="text-xs text-slate-400">
              © 2026 IMI Oportunidades MINISTERIOS. Agente de Inteligência para o Setor Público.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
