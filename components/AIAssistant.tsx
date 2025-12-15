
import React, { useState, useRef } from 'react';
import { askAccountantAI } from '../services/aiService';
import { Send, Bot, Loader2, Sparkles, Paperclip, CheckCircle2, FileText, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Task, Client } from '../types';

interface AIAssistantProps {
    tasks?: Task[];
    clients?: Client[];
    onAddTask?: (task: any) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ tasks = [], clients = [], onAddTask }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string, type?: 'text' | 'success'}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{data: string, mime: string, name: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = (reader.result as string).split(',')[1];
              setSelectedFile({
                  data: base64String,
                  mime: file.type,
                  name: file.name
              });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAsk = async () => {
    if ((!prompt.trim() && !selectedFile) || isLoading) return;
    
    const userText = prompt;
    const currentFile = selectedFile;

    // Add User Message
    setMessages(prev => [...prev, { 
        role: 'user', 
        content: currentFile ? `[Arquivo: ${currentFile.name}] ${userText}` : userText 
    }]);
    
    setPrompt('');
    setSelectedFile(null);
    setIsLoading(true);
    setTimeout(scrollToBottom, 100);

    // Prepare Context
    const clientsContext = clients.map(c => `${c.name} (${c.regime})`).join(', ');
    const tasksContext = tasks.slice(0, 5).map(t => `${t.title} (${t.status})`).join(', ');
    const contextData = `
      Clientes: ${clientsContext}
      Tarefas Recentes: ${tasksContext}
      Data Atual: ${new Date().toLocaleDateString()}
    `;

    try {
        // Prepare Image Part if exists
        const imagePart = currentFile ? { 
            inlineData: { data: currentFile.data, mimeType: currentFile.mime } 
        } : undefined;

        // Call AI
        const result = await askAccountantAI(messages, userText, contextData, imagePart);

        // Handle Function Call (Create Task)
        if (result.functionCall && result.functionCall.name === 'createTask' && onAddTask) {
            const args = result.functionCall.args as any;
            
            onAddTask({
                title: args.title,
                description: args.description || 'Tarefa criada via AI Advisor',
                priority: args.priority || 'MEDIUM',
                type: args.type || 'ADM',
                dueDate: args.dueDate || new Date().toISOString().split('T')[0],
                status: 'TODO',
                isInternal: true,
                subtasks: [], comments: [], tags: [], attachments: []
            });

            setMessages(prev => [...prev, { 
                role: 'ai', 
                content: `✅ Tarefa criada com sucesso: **${args.title}**`,
                type: 'success'
            }]);
            
            // Optional: Call AI again to confirm or generate follow-up text
            // For simplicity, we just show the success message.
        } 
        
        // Handle Text Response
        if (result.text) {
            setMessages(prev => [...prev, { role: 'ai', content: result.text || '' }]);
        }

    } catch (error) {
        setMessages(prev => [...prev, { role: 'ai', content: 'Desculpe, ocorreu um erro ao processar sua solicitação.' }]);
    } finally {
        setIsLoading(false);
        setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">AI Advisor 2.0</h2>
                    <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Conectado ao CRM & Vision
                    </p>
                </div>
            </div>
            <button 
                onClick={() => setMessages([])}
                className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                Limpar
            </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <Bot size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Como posso ajudar hoje?</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
                        Posso criar tarefas, analisar documentos fiscais, tirar dúvidas tributárias e gerar relatórios.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                        <button onClick={() => { setPrompt("Crie uma tarefa urgente para calcular o DAS da Tech Solutions"); }} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors text-left border border-transparent hover:border-indigo-200">
                            ⚡ "Crie uma tarefa urgente..."
                        </button>
                        <button onClick={() => { setPrompt("Analise este documento e extraia o valor total"); }} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors text-left border border-transparent hover:border-indigo-200">
                            📄 "Analise este documento..."
                        </button>
                    </div>
                </div>
            )}
            
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                        msg.type === 'success' 
                         ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800'
                         : msg.role === 'user' 
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-br-sm' 
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                    }`}>
                        {msg.type === 'success' && <div className="flex items-center gap-2 mb-2 font-bold"><CheckCircle2 size={16}/> Ação Realizada</div>}
                        <ReactMarkdown className="prose dark:prose-invert prose-sm max-w-none">
                            {msg.content}
                        </ReactMarkdown>
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 rounded-bl-sm shadow-sm flex items-center gap-3">
                        <Loader2 size={16} className="animate-spin text-indigo-500" />
                        <span className="text-xs font-medium text-gray-500">Pensando...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            {selectedFile && (
                <div className="flex items-center gap-2 mb-3 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg w-fit">
                    <FileText size={14} className="text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 truncate max-w-[200px]">{selectedFile.name}</span>
                    <button onClick={() => setSelectedFile(null)} className="ml-2 text-indigo-500 hover:text-indigo-800"><X size={14}/></button>
                </div>
            )}
            <div className="relative flex items-end gap-2">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 mb-0.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    title="Anexar arquivo"
                >
                    <Paperclip size={20} />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect} 
                    accept="image/*,.pdf"
                />
                
                <div className="flex-1 relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAsk();
                            }
                        }}
                        placeholder="Digite sua solicitação..."
                        rows={1}
                        className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none max-h-32"
                        style={{ minHeight: '48px' }}
                    />
                    <button 
                        onClick={handleAsk}
                        disabled={isLoading || (!prompt.trim() && !selectedFile)}
                        className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/20"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
