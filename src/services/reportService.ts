import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { PARTNER_COMPANIES } from "./geminiService";

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

export async function generateCompanyReport(companyId: string | null, opportunities: Opportunity[]) {
  const companyName = companyId 
    ? PARTNER_COMPANIES.find(c => c.id === companyId)?.name || "Empresa"
    : "Todas as Empresas";

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Relatório de Oportunidades Estratégicas",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Empresa: `,
                bold: true,
              }),
              new TextRun(companyName),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Data de Geração: `,
                bold: true,
              }),
              new TextRun(new Date().toLocaleDateString('pt-BR')),
            ],
            spacing: { after: 400 },
          }),
          ...opportunities.flatMap((op) => [
            new Paragraph({
              text: op.name,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 100 },
            }),
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                createTableRow("Instituição", op.institution),
                createTableRow("Área de Atuação", op.policyArea),
                createTableRow("Classificação", op.classification),
                createTableRow("Aderência", op.adherence),
                createTableRow("Descrição", op.description),
                createTableRow("Aplicação", op.application),
                createTableRow("Estratégia", op.strategy),
                createTableRow("Prazo", op.deadline),
              ],
            }),
          ]),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Relatorio_Oportunidades_${companyName.replace(/\s+/g, '_')}.docx`);
}

function createTableRow(label: string, value: string) {
  return new TableRow({
    children: [
      new TableCell({
        width: {
          size: 30,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
      }),
      new TableCell({
        width: {
          size: 70,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
        children: [new Paragraph({ text: value })],
      }),
    ],
  });
}
