import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Upload, Copy, Check, Clock, Lock, Shield, FileText, X, ChevronDown, ShieldCheck, KeyRound } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [config, setConfig] = useState({ password: '', expiryHours: '24' });
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback(accepted => {
     if (accepted[0] && accepted[0].size > 16106127360) {
        alert("File limit is 15GB"); return;
     }
     setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, multiple: false, maxSize: 17179869184 
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('expiryHours', config.expiryHours);
    if (config.password) formData.append('password', config.password);

    try {
      const { data } = await axios.post(`${API_URL}/api/files/upload`, formData, { timeout: 14400000 });
      setShareLink(`${window.location.origin}/s/${data.fileId}`);
    } catch (error) {
      console.error(error);
      alert("Upload Failed. Please check connection.");
    } finally { setUploading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const reset = () => { setShareLink(''); setFile(null); setConfig({password:'', expiryHours:'24'}); setCopied(false); }

  // --- SUCCESS VIEW ---
  if (shareLink) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-400/10 rounded-full blur-[120px]"></div>
        </div>
        
        {/* Applied Scale for better visibility */}
        <div className="scale-[0.90] md:scale-100 transition-transform">
          <GlassCard className="text-center max-w-md w-full !border-green-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-500/30"></div>
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 mb-5 shadow-inner border border-green-100">
              <Check size={40} strokeWidth={4}/>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-slate-800 tracking-tight">Link Ready!</h2>
            <p className="text-slate-500 mb-8 font-medium">Valid for {config.expiryHours} hours</p>
            
            <div onClick={copy} className="bg-white border-2 border-slate-100 rounded-2xl p-1.5 flex items-center gap-3 cursor-pointer hover:border-green-500 transition-all group mb-6 shadow-sm hover:shadow-md relative overflow-hidden">
              {copied && <motion.div initial={{width: 0}} animate={{width: '100%'}} className="absolute inset-0 bg-green-500/10 z-0"/>}
              <div className="flex-1 min-w-0 px-4 py-2 z-10">
                  <p className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider text-left mb-0.5">Encrypted URL</p>
                  <p className="text-sm font-mono truncate text-indigo-600 font-bold text-left">{shareLink}</p>
              </div>
              <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl transition-all z-10 ${copied ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                {copied ? <Check size={20} strokeWidth={3}/> : <Copy size={20}/>}
              </div>
            </div>
            
            <Button variant="secondary" onClick={reset} className="w-full h-14 font-bold text-slate-600 hover:text-slate-900">Encrypt Another File</Button>
          </GlassCard>
        </div>
      </div>
    )
  }

  // --- UPLOAD VIEW ---
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Central Rotating Lock (Increased transparency to not distract) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] text-slate-900">
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}>
                  <ShieldCheck size={800} strokeWidth={0.5} />
               </motion.div>
          </div>
          
          {/* Floating Key Animation */}
          <div className="absolute top-[15%] left-[15%] opacity-[0.03] text-indigo-900 animate-float-slow">
               <KeyRound size={300} strokeWidth={1} className="-rotate-45" />
          </div>

          {/* Soft Gradients */}
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-400/20 rounded-full blur-[150px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-cyan-400/15 rounded-full blur-[150px] animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      {/* --- MAIN CONTENT (Scaled to 85%) --- */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[1400px] transition-transform duration-500 origin-center scale-[0.85] xl:scale-100">
        
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-white/80 border border-slate-200 px-5 py-2.5 rounded-full text-xs font-bold tracking-[0.15em] text-indigo-600 mb-6 shadow-sm backdrop-blur-md uppercase"
          >
            <Shield size={12} className="fill-indigo-600" /> End-to-End Encrypted
          </motion.div>
          
          <motion.h1 
             initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
             className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-2"
          >
            VaultShare
          </motion.h1>
          <p className="text-lg text-slate-500 font-medium tracking-tight">Anonymous. Ephemeral. Limitless.</p>
        </div>

        <GlassCard className="max-w-2xl w-full !p-10 !rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border-white/80">
          {/* Drop Zone */}
          <div {...getRootProps()} className={`
            relative overflow-hidden border-[3px] border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300 group bg-white/50
            ${isDragActive 
               ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01] shadow-lg shadow-indigo-500/10' 
               : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
            }
          `}>
            <input {...getInputProps()} />
            {file ? (
               <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center text-white mb-3 shadow-indigo-500/20">
                    <FileText size={36} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-xl truncate px-4 max-w-full">{file.name}</h3>
                  <div className="inline-block bg-slate-100 px-3 py-1 rounded-full text-slate-500 text-xs font-bold mt-2">
                    {(file.size/1024/1024).toFixed(2)} MB
                  </div>
                  <button onClick={(e)=>{e.stopPropagation(); setFile(null)}} className="absolute -top-2 -right-2 bg-slate-100 p-2 rounded-xl text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors"><X size={18}/></button>
               </div>
            ) : (
               <div className="space-y-4">
                 <div className="w-20 h-20 mx-auto bg-white rounded-[2rem] shadow-md border border-slate-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:text-indigo-500 transition-all duration-500">
                   <Upload size={32} strokeWidth={2.5} />
                 </div>
                 <div>
                   <p className="text-xl font-extrabold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">Drop files to Encrypt</p>
                   <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Up to 15 GB</p>
                 </div>
               </div>
            )}
          </div>

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
             {/* Expiry Select */}
             <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-20 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                  <Clock size={20} />
                </div>
                <select 
                  className="glass-input pl-14 pr-10 appearance-none cursor-pointer hover:border-indigo-300 transition-colors text-slate-800 relative z-10"
                  value={config.expiryHours} 
                  onChange={e=>setConfig({...config, expiryHours:e.target.value})}
                >
                  <option value="1">1 Hour</option>
                  <option value="24">1 Day</option>
                  <option value="72">3 Days</option>
                  <option value="168">7 Days</option>
                </select>
                <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-20" />
             </div>

             {/* Password Input */}
             <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-20 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  className="glass-input pl-14 text-slate-800"
                  placeholder="Optional Password"
                  value={config.password}
                  onChange={e=>setConfig({...config, password:e.target.value})}
                />
             </div>
          </div>

          <Button loading={uploading} onClick={handleUpload} className="w-full mt-8 text-lg h-16 shadow-indigo-500/30">
             {uploading ? "Securing in Vault..." : "Create Secure Link"}
          </Button>
        </GlassCard>
        
        <p className="text-slate-400 text-xs mt-10 font-semibold opacity-60 mix-blend-multiply">
           Zero Knowledge • Military Grade AES-256 • Self Destructing
        </p>
      </div>
    </div>
  );
}