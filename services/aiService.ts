
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const createTaskTool: FunctionDeclaration = {
  name: "createTask",
  description: "Cria uma nova tarefa no CRM para o escritório contábil.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Título curto e claro da tarefa" },
      description: { type: Type.STRING, description: "Instruções detalhadas da demanda" },
      priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
      type: { type: Type.STRING, enum: ["FISCAL", "CONTABIL", "DP", "LEGAL", "ADM"] },
      dueDate: { type: Type.STRING, description: "Data de vencimento (YYYY-MM-DD)" }
    },
    required: ["title", "type", "priority"]
  }
};

export const askAccountantAI = async (history: any[], prompt: string, contextData: string, imagePart?: any) => {
  if (!process.env.API_KEY) return { text: "Erro: API Key não configurada." };
  try {
    const fullSystemInstruction = `
      Você é o ContabilFlow AI Advisor.
      CONTEXTO: ${contextData}
      REGRAS: 1. Use 'createTask' para agendar lembretes ou obrigações. 2. Analise imagens de notas ou guias fiscais se fornecidas. 3. Seja direto.
    `;
    const parts: any[] = [{ text: prompt }];
    if (imagePart) parts.push(imagePart);
    
    // Fix: Updated contents parameter to follow the correct structure according to @google/genai guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
      config: { systemInstruction: fullSystemInstruction, tools: [{ functionDeclarations: [createTaskTool] }], temperature: 0.4 }
    });
    return { text: response.text, functionCall: response.functionCalls?.[0] };
  } catch (error) {
    return { text: "Ocorreu um erro no processamento da IA." };
  }
};
