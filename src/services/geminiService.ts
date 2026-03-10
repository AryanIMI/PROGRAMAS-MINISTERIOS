import {GoogleGenAI} from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const PARTNER_COMPANIES = [
  {
    id: "betha",
    name: "Betha Sistemas",
    area: "Gestão Pública e Governo Digital",
    solutions: [
      "transformação digital do governo",
      "sistemas de gestão pública",
      "digitalização de processos administrativos",
      "transparência pública",
      "integração de dados governamentais",
      "modernização da gestão municipal"
    ]
  },
  {
    id: "arqia",
    name: "Arqia",
    area: "Conectividade e Internet das Coisas (IoT)",
    solutions: [
      "conectividade urbana",
      "cidades inteligentes",
      "sensores urbanos",
      "telemetria",
      "monitoramento inteligente de infraestrutura",
      "conectividade para dispositivos públicos"
    ]
  },
  {
    id: "contelurb",
    name: "Contelurb",
    area: "Gestão de Resíduos e Sustentabilidade Urbana",
    solutions: [
      "gestão de resíduos sólidos",
      "coleta mecanizada",
      "conteinerização urbana",
      "reciclagem",
      "economia circular",
      "limpeza urbana inteligente"
    ]
  },
  {
    id: "saber",
    name: "Saber Soluções Educacionais",
    area: "Educação Pública",
    solutions: [
      "melhoria da qualidade da educação",
      "avaliação educacional",
      "formação de professores",
      "tecnologia educacional",
      "programas de alfabetização e aprendizagem"
    ]
  },
  {
    id: "datami",
    name: "Datami",
    area: "Inclusão Digital e Conectividade Social",
    solutions: [
      "inclusão digital",
      "acesso gratuito à internet",
      "aplicativos de serviços públicos",
      "conectividade para população de baixa renda",
      "digitalização de serviços municipais"
    ]
  },
  {
    id: "iris",
    name: "Sistema IRIS — Cidade Segura",
    area: "Segurança Pública e Monitoramento Urbano",
    solutions: [
      "videomonitoramento urbano",
      "reconhecimento facial",
      "cercamento digital",
      "monitoramento de veículos",
      "centros de comando e controle",
      "segurança pública inteligente"
    ]
  }
];

export async function analyzeProgram(programDescription: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Você é um agente especializado em inteligência estratégica para o setor público.
    Analise o seguinte programa/edital/iniciativa governamental:
    
    "${programDescription}"
    
    Com base nas seguintes empresas parceiras e suas soluções:
    ${JSON.stringify(PARTNER_COMPANIES, null, 2)}
    
    Para este programa, identifique:
    1. Nome do programa
    2. Instituição responsável
    3. Área de política pública
    4. Descrição resumida
    5. Tipo de iniciativa (edital, financiamento, etc)
    6. Público beneficiado
    7. Possível aplicação das soluções das empresas parceiras (seja específico)
    8. Empresas parceiras relacionadas
    9. Grau de aderência (Alta, Média, Baixa)
    10. Estratégia de abordagem para municípios
    11. Classificação (ALTA SINERGIA, SINERGIA PARCIAL, OPORTUNIDADE ESTRATÉGICA)
    12. Status de Vigência: O programa ainda está aberto/ativo? Se não, avise o usuário.
    
    Retorne os dados em formato JSON seguindo esta estrutura:
    {
      "name": string,
      "institution": string,
      "policyArea": string,
      "description": string,
      "type": string,
      "audience": string,
      "application": string,
      "relatedCompanies": string[], // IDs das empresas: betha, arqia, contelurb, saber, datami, iris
      "adherence": "Alta" | "Média" | "Baixa",
      "strategy": string,
      "classification": "ALTA SINERGIA" | "SINERGIA PARCIAL" | "OPORTUNIDADE ESTRATÉGICA",
      "evidence": string,
      "isActive": boolean,
      "deadline": string // Data ou "Não informado"
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function searchOpportunities(companyId: string | null) {
  const model = "gemini-3-flash-preview";
  
  let context = "programas governamentais, editais, linhas de financiamento (BNDES, Caixa, Ministérios) e iniciativas institucionais no Brasil para municípios e estados.";
  
  if (companyId) {
    const company = PARTNER_COMPANIES.find(c => c.id === companyId);
    if (company) {
      context = `oportunidades institucionais, editais e programas governamentais (Ministérios, BNDES, Caixa) no Brasil voltados para ${company.area}. 
      Foque em soluções como: ${company.solutions.join(", ")}. 
      Busque por convênios com municípios e estados.`;
    }
  }

  const prompt = `
    Atue como um especialista em inteligência governamental e captação de recursos.
    Pesquise e retorne uma lista de 4 a 6 oportunidades REAIS, RECENTES e que estejam OBRIGATORIAMENTE ATIVAS/ABERTAS (com prazo de inscrição ou vigência em andamento em ${new Date().toLocaleDateString('pt-BR')}) relacionadas a: ${context}.
    
    Para cada oportunidade, forneça:
    - **Nome do Programa/Edital**
    - **Órgão Responsável**
    - **Status/Prazo**: Informe se está aberto e qual o prazo final (se disponível).
    - **Descrição**: Breve resumo do objetivo.
    - **Justificativa de Enquadramento**: Explique detalhadamente por que esta oportunidade é ideal para as empresas parceiras mencionadas no contexto, citando sinergias específicas com suas soluções tecnológicas.
    - **Link oficial** (se disponível)
    
    IMPORTANTE: Não retorne programas encerrados ou editais cujos prazos já expiraram.
    
    Formate a resposta em Markdown estruturado e profissional.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text;
}
