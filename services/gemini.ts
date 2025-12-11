import { GoogleGenAI } from "@google/genai";
import { getFullDBDump, generateMonthlySummary } from './db';
import { format } from 'date-fns';

export const sendMessageToGemini = async (history: {role: string, parts: {text: string}[]}[], newMessage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dbData = getFullDBDump();
  
  // Calculate current month summary context
  const today = new Date();
  const currentSummary = generateMonthlySummary(today.getMonth(), today.getFullYear());

  const systemPrompt = `
    You are an intelligent assistant for "Sales Record System (SRS)", a bookkeeping application.
    You have access to the current database state in JSON format below.
    Use this data to answer user questions about sales, expenses, debtors, and financial performance.
    
    Current Date: ${format(today, 'yyyy-MM-dd')}
    
    Financial Summary for this Month:
    - Total Sales: TZS ${currentSummary.total_sales.toLocaleString()}
    - Total Expenses: TZS ${currentSummary.total_expenses.toLocaleString()}
    - Debtor Payments Recovered: TZS ${currentSummary.total_debtor_payments.toLocaleString()}
    - Salary Costs: TZS ${currentSummary.salary_cost.toLocaleString()}
    - Net Profit (Accrual): TZS ${currentSummary.profit_or_loss.toLocaleString()}

    Recent Data Snapshot (Last 5 items of each category for context, full analysis requires user specific queries):
    - Recent Sales: ${JSON.stringify(dbData.sales.slice(-5))}
    - Recent Expenses: ${JSON.stringify(dbData.expenses.slice(-5))}
    - Top Debtors: ${JSON.stringify(dbData.debtors.sort((a,b) => b.balance - a.balance).slice(0, 5))}
    
    Roles: Admin (Full Access), Saler (Sales/Debt Access).
    
    If the user asks for a report, format it cleanly with bullet points or tables.
    If the user asks for insights, analyze the trends (e.g., if expenses are high vs sales).
    Be concise and professional.
  `;

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview', // Requested Model
      config: {
        systemInstruction: systemPrompt,
      },
      history: history.map(h => ({
          role: h.role,
          parts: h.parts
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to the AI service right now. Please check your internet connection or API key.";
  }
};