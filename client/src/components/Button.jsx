import { Loader2 } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Button({ 
  children, loading = false, className = '', variant = 'primary', ...props 
}) {
  
  const baseStyles = "relative overflow-hidden inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed h-14 px-8 text-base tracking-wide";
  
  const variants = {
    primary: "bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    ghost: "bg-transparent text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
}