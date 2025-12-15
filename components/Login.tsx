
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_USERS } from '../constants';
import { User, CompanyProfile } from '../types';
import { Loader2, ArrowRight, Mail, Lock, Zap } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  companyProfile?: CompanyProfile;
}

export const Login: React.FC<LoginProps> = ({ onLogin, companyProfile }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -2000, y: -2000 });

  const primaryColor = companyProfile?.primaryColor || '#6366f1';

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '99, 102, 241';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // CONFIGURAÇÕES DE ALTA SUAVIDADE E CURTO ALCANCE
    const particleCount = 110; 
    const mouseInfluenceRadius = 100; // Raio reduzido para interação local
    const ultraSoftPush = 0.035;      // Força minimizada para apenas um leve desvio
    const maxConnections = 6;         
    const themeRgb = hexToRgb(primaryColor);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseVx: number;
      baseVy: number;
      size: number;
      opacity: number;
      targetOpacity: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        
        // Movimento base ultra lento (drift natural)
        this.baseVx = (Math.random() - 0.5) * 0.2;
        this.baseVy = (Math.random() - 0.5) * 0.2;
        
        this.vx = 0;
        this.vy = 0;
        
        this.size = Math.random() * 2.0 + 1.2;
        this.targetOpacity = Math.random() * 0.3 + 0.2;
        this.opacity = 0; 
      }

      update(w: number, h: number) {
        if (this.opacity < this.targetOpacity) this.opacity += 0.005;

        // INTERAÇÃO MÍNIMA: Apenas um "nudge" suave
        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseInfluenceRadius) {
          const force = (1 - distance / mouseInfluenceRadius);
          const angle = Math.atan2(dy, dx);
          
          // Aplica um deslocamento sutil, não as "joga"
          this.vx += Math.cos(angle) * force * ultraSoftPush;
          this.vy += Math.sin(angle) * force * ultraSoftPush;
        }

        // Damping constante para manter o movimento sedoso
        this.vx *= 0.97;
        this.vy *= 0.97;
        
        this.x += this.vx + this.baseVx;
        this.y += this.vy + this.baseVy;

        // Bordas infinitas com margem generosa
        const margin = 50;
        if (this.x < -margin) this.x = w + margin;
        if (this.x > w + margin) this.x = -margin;
        if (this.y < -margin) this.y = h + margin;
        if (this.y > h + margin) this.y = -margin;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${themeRgb}, ${this.opacity})`;
        ctx.fill();
        
        // Halo quase invisível
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${themeRgb}, ${this.opacity * 0.06})`;
        ctx.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particlesWithDistance: {p: Particle, dist: number}[] = [];

      particles.forEach(p => {
        p.update(canvas.width, canvas.height);
        p.draw();

        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouseInfluenceRadius + 100) {
          particlesWithDistance.push({ p, dist });
        }
      });

      // CONEXÕES: Fade-in e out muito curtos e suaves
      particlesWithDistance
        .sort((a, b) => a.dist - b.dist)
        .slice(0, maxConnections)
        .forEach(({ p, dist }) => {
          const alpha = (1 - dist / (mouseInfluenceRadius + 100)) * 0.3;
          
          ctx.strokeStyle = `rgba(${themeRgb}, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(mouseRef.current.x, mouseRef.current.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener('resize', init);
    
    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationFrameId);
    };
  }, [primaryColor]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -2000, y: -2000 };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (user) onLogin(user);
      else {
        setError('Credenciais inválidas.');
        setIsLoading(false);
      }
    }, 800);
  };

  const demoLogin = (idx: number) => {
    setEmail(MOCK_USERS[idx].email);
    setPassword(MOCK_USERS[idx].password || '123');
  };

  return (
    <div 
      className="h-screen w-full flex items-center justify-center font-sans relative overflow-hidden bg-[#020204]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/10 via-[#020204] to-purple-950/10"></div>
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" style={{ mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="w-full max-w-[400px] z-10 px-6 flex flex-col justify-center items-center">
        
        <div className="text-center mb-10 animate-in slide-in-from-top-8 duration-1000">
            <div className="relative inline-block group mb-6">
                <div className="absolute -inset-4 bg-indigo-500 rounded-[32px] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative w-16 h-16 rounded-[24px] bg-gray-950 border border-white/5 flex items-center justify-center shadow-2xl">
                    <Zap size={32} className="text-indigo-500 fill-indigo-500/10" />
                </div>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
              CRM <span className="text-indigo-500">CONTÁBIL</span>
            </h1>
            <p className="text-gray-500 mt-2 text-[10px] font-black uppercase tracking-[0.4em] opacity-60">High Performance Workspace</p>
        </div>

        <div className="w-full bg-white/[0.04] backdrop-blur-3xl rounded-[44px] border border-white/10 p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden animate-in zoom-in-95 duration-700">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"></div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Identificação</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-20">
                            <Mail className="text-gray-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        </div>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[22px] text-white placeholder-gray-700 focus:border-indigo-500/50 focus:bg-black/60 outline-none transition-all font-bold text-sm"
                          placeholder="Email corporativo"
                          required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Senha</label>
                        <a href="#" className="text-[10px] font-black text-indigo-500/70 hover:text-white uppercase tracking-widest transition-colors">Esqueceu?</a>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-20">
                            <Lock className="text-gray-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        </div>
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-[22px] text-white placeholder-gray-700 focus:border-indigo-500/50 focus:bg-black/60 outline-none transition-all font-bold text-sm tracking-widest"
                          placeholder="••••••••"
                          required
                        />
                    </div>
                </div>

                {error && (
                    <div className="py-3 px-5 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center gap-3 animate-in shake">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">{error}</span>
                    </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[12px] uppercase tracking-[0.25em] py-5 rounded-[24px] transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 disabled:opacity-50 group"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                        <>AUTENTICAR <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                </button>
            </form>
        </div>

        <div className="mt-12 flex flex-col items-center animate-in fade-in duration-1000 delay-500">
            <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.5em] mb-4">Demonstração</p>
            <div className="flex gap-3">
                {['ADMIN', 'GESTOR', 'USER'].map((role, idx) => (
                    <button 
                        key={role}
                        onClick={() => demoLogin(idx)}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest hover:bg-indigo-600/10 hover:text-indigo-400 transition-all active:scale-90"
                    >
                        {role}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
