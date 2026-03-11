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
      "deadline": string, // Data ou "Não informado"
      "link": string // URL oficial do programa
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
  
  let context = `programas governamentais, editais, linhas de financiamento (BNDES, Caixa, Banco do Nordeste, Banco da Amazônia, FINEP), 
  iniciativas de Ministérios (Cidades, Educação, Meio Ambiente, Justiça, Gestão, Comunicações, MCTI, Desenvolvimento Regional), 
  Agências Reguladoras (ANATEL, ANA, ANTT, ANEEL), IBAMA, FUNASA, SENASP e organismos internacionais (Banco Mundial, BID, CAF, ONU, UNESCO) 
  e programas ESG centrados em inovação, cidades inteligentes e modernização da gestão no Brasil.`;
  
  if (companyId) {
    const company = PARTNER_COMPANIES.find(c => c.id === companyId);
    if (company) {
      context = `oportunidades institucionais, editais e linhas de financiamento (Ministérios, BNDES, Caixa, Banco do Brasil, agências federativas) 
      voltados para ${company.area} e soluções como: ${company.solutions.join(", ")}. 
      Busque especificamente por programas federais, convênios municipais, chamadas públicas de inovação e projetos piloto de cidades inteligentes.`;
    }
  }

  const prompt = `
    Atue como um especialista em inteligência governamental e captação de recursos.
    Pesquise e retorne uma lista de 15 a 20 oportunidades REAIS, RECENTES e que estejam OBRIGATORIAMENTE ATIVAS/ABERTAS (com prazo de inscrição ou vigência em andamento em ${new Date().toLocaleDateString('pt-BR')}) relacionadas a: ${context}.
    
    Para cada oportunidade, forneça:
    1. Nome do Programa/Edital
    2. Órgão Responsável
    3. Status/Prazo
    4. Descrição resumida
    5. Justificativa de Enquadramento Estratégico
    6. Link oficial
    7. Trecho ou Evidência da política pública (citação curta)
    
    IMPORTANTE: Não retorne programas encerrados.
    
    REGRAS CRÍTICAS PARA LINKS E URLs (EVITE ALUCINAÇÕES):
    1. PROIBIDO INVENTAR: Nunca tente adivinhar, simplificar ou deduzir uma URL (ex: não invente bndes.gov.br/programa-x).
    2. FONTE REAL: Use EXCLUSIVAMENTE os links literais retornados pela ferramenta de busca do Google. 
    3. PRIORIDADE: Se encontrar o link do edital/página oficial, use-o.
    4. BACKUP OBRIGATÓRIO: Se não houver um link "limpo", forneça o link da notícia ou da página de onde a informação foi extraída. É preferível um link de notícia real do que um link oficial inventado.
    5. VALIDAÇÃO: Se você não tiver certeza absoluta do link, deixe o campo "link" vazio ou use o link da fonte de pesquisa.
    
    Retorne os dados EXCLUSIVAMENTE em formato JSON seguindo esta estrutura:
    [
      {
        "name": string,
        "institution": string,
        "policyArea": string, // ex: segurança, educação, etc
        "description": string,
        "type": string, // edital, financiamento, etc
        "audience": string,
        "application": string, // Como as soluções se aplicam
        "relatedCompanies": string[], // IDs: betha, arqia, contelurb, saber, datami, iris
        "adherence": "Alta" | "Média" | "Baixa",
        "strategy": string,
        "classification": "ALTA SINERGIA" | "SINERGIA PARCIAL" | "OPORTUNIDADE ESTRATÉGICA",
        "evidence": string,
        "isActive": true,
        "deadline": string,
        "link": string
      }
    ]
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });

  try {
    const results = JSON.parse(response.text || "[]");

    // Extract real grounding URLs from response metadata
    const groundingChunks = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: { uri: string; title: string }[] = groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || "",
      title: chunk.web?.title || "Fonte de Pesquisa"
    })).filter((s: any) => s.uri) || [];

    const webLinks: string[] = sources.map(s => s.uri);

    // Filter for deep links (not just homepages)
    const deepLinks = webLinks.filter(link => {
      try {
        const url = new URL(link);
        return url.pathname.length > 5 || url.search.length > 5;
      } catch {
        return false;
      }
    });

    // Sorted by length: longer URLs tend to be more specific pages
    const sortedLinks = [...deepLinks].sort((a, b) => b.length - a.length);

    const finalResults = results.map((op: any) => {
      let finalLink = op.link;

      // Determine if the link from the AI is suspicious / hallucinated
      let isSuspicious = true;
      try {
        if (finalLink && finalLink.startsWith("http")) {
          const url = new URL(finalLink);
          isSuspicious =
            url.pathname === "/" ||
            url.pathname === "" ||
            finalLink.length < 30 ||
            finalLink.includes("exemplo.com") ||
            finalLink.includes("link-do-edital") ||
            finalLink.includes("link-oficial");
        }
      } catch {
        isSuspicious = true;
      }

      if (isSuspicious) {
        // Try to find a grounding source matching keywords from the program name or institution
        const nameParts = (op.name || "").toLowerCase().split(" ").filter((w: string) => w.length > 4);
        const instParts = (op.institution || "").toLowerCase().split(" ").filter((w: string) => w.length > 4);
        const searchTerms = [...nameParts, ...instParts];

        const bestMatch = sources.find(s => {
          const combined = (s.title + " " + s.uri).toLowerCase();
          return searchTerms.some(term => combined.includes(term));
        })?.uri;

        if (bestMatch) {
          finalLink = bestMatch;
        } else if (sortedLinks.length > 0) {
          // Fall back to best .gov.br link in grounding results
          finalLink =
            sortedLinks.find(l => l.includes(".gov.br")) ||
            sortedLinks[0] ||
            "";
        } else {
          finalLink = "";
        }
      }

      return { ...op, link: finalLink };
    });

    return finalResults;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}
