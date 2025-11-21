import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Upload, Copy, Check, Clock, Lock, Shield, FileText, X, ChevronDown, ShieldCheck, KeyRound } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

// REPLACE THIS URL with your Render/Railway Backend URL after you deploy
// Example: const API_URL = 'https://vaultshare-backend.onrender.com';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    // IMPORTANT: Config must be appended BEFORE the file
    formData.append('expiryHours', config.expiryHours);
    if (config.password) formData.append('password', config.password);
    formData.append('file', file);

    try {
      const { data } = await axios.post(`${API_URL}/api/files/upload`, formData, { 
        timeout: 14400000 // 4 hours
      });
      setShareLink(`${window.location.origin}/s/${data.fileId}`);
    } catch (error) {
      console.error(error);
      alert("Upload Failed. Check connection or backend URL.");
    } finally { setUploading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const reset = () => { setShareLink(''); setFile(null); setConfig({password:'', expiryHours:'24'}); setCopied(false); }

  if (shareLink) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <GlassCard className="text-center max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 mb-5">
            <Check size={40} strokeWidth={4}/>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-slate-800">Link Ready!</h2>
          <p className="text-slate-500 mb-8 font-medium">Valid for {config.expiryHours} hours</p>
          
          <div onClick={copy} className="bg-white border-2 border-slate-100 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-green-500 transition-all mb-6">
             <p className="flex-1 text-sm font-mono truncate text-indigo-600 font-bold text-left">{shareLink}</p>
             <div className={`p-2 rounded-lg ${copied ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
               {copied ? <Check size={18}/> : <Copy size={18}/>}
             </div>
          </div>
          <Button variant="secondary" onClick={reset} className="w-full">Encrypt Another File</Button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[1400px] scale-[0.85] xl:scale-100">
        <div className="text-center mb-10">
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-2">VaultShare</h1>
          <p className="text-lg text-slate-500 font-medium">Anonymous. Ephemeral. Limitless.</p>
        </div>

        <GlassCard className="max-w-2xl w-full !p-10 !rounded-[2.5rem]">
          <div {...getRootProps()} className={`
            relative overflow-hidden border-[3px] border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300 
            ${isDragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400'}
          `}>
            <input {...getInputProps()} />
            {file ? (
               <div className="flex flex-col items-center">
                  <FileText size={36} className="text-indigo-600 mb-3"/>
                  <h3 className="font-bold text-slate-800 text-xl truncate max-w-full">{file.name}</h3>
                  <div className="text-slate-500 text-sm mt-1">{(file.size/1024/1024).toFixed(2)} MB</div>
                  <button onClick={(e)=>{e.stopPropagation(); setFile(null)}} className="mt-4 text-red-500 text-sm font-bold hover:underline">Remove</button>
               </div>
            ) : (
               <div className="space-y-4">
                 <Upload size={32} className="mx-auto text-indigo-600"/>
                 <p className="text-xl font-extrabold text-slate-800">Drop files to Encrypt</p>
               </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
             <div className="relative">
                <Clock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"/>
                <select className="glass-input pl-14" value={config.expiryHours} onChange={e=>setConfig({...config, expiryHours:e.target.value})}>
                  <option value="1">1 Hour</option>
                  <option value="24">1 Day</option>
                  <option value="72">3 Days</option>
                  <option value="168">7 Days</option>
                </select>
             </div>
             <div className="relative">
                <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input type="password" className="glass-input pl-14" placeholder="Optional Password" value={config.password} onChange={e=>setConfig({...config, password:e.target.value})}/>
             </div>
          </div>

          <Button loading={uploading} onClick={handleUpload} className="w-full mt-8 text-lg h-16">
             {uploading ? "Securing in Vault..." : "Create Secure Link"}
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}