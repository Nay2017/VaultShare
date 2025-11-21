import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, Lock, FileText, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

// REPLACE THIS with your Render/Railway Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DownloadPage() {
  const { id } = useParams();
  const [meta, setMeta] = useState(null);
  const [pass, setPass] = useState('');
  const [dl, setDl] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    axios.get(`${API_URL}/api/files/${id}`)
         .then(res => setMeta(res.data))
         .catch((err) => {
            if (err.response && err.response.status === 410) setError('Link has expired.');
            else setError('Link invalid or file removed.');
         });
  }, [id]);

  const handleDl = async (e) => {
    e.preventDefault();
    setDl(true);
    try {
      const res = await axios.post(`${API_URL}/api/files/download/${id}`, { password: pass }, { responseType: 'blob' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([res.data]));
      link.setAttribute('download', meta.name);
      document.body.appendChild(link); 
      link.click();
      link.remove();
      setDl(false);
    } catch (err) {
      setDl(false);
      alert("Access Denied or Network Error");
    }
  };

  if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">{error}</div>;
  if (!meta) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Verifying...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
       <GlassCard className="w-full max-w-md">
          <div className="text-center mb-8">
             <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="text-indigo-600" size={32}/>
             </div>
             <h2 className="text-xl font-bold text-slate-900 truncate px-4">{meta.name}</h2>
             <p className="text-sm text-slate-500 mt-1">{(meta.size/1024/1024).toFixed(2)} MB • {new Date(meta.createdAt).toLocaleDateString()}</p>
          </div>

          <form onSubmit={handleDl} className="space-y-6">
             {meta.hasPassword ? (
                <input type="password" required autoFocus placeholder="Enter Password" 
                       className="glass-input text-center text-lg" 
                       value={pass} onChange={e => setPass(e.target.value)} />
             ) : (
                <div className="bg-emerald-50 p-4 rounded-xl flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm">
                    <ShieldCheck size={18}/> Secure & Ready
                </div>
             )}
             <Button loading={dl} type="submit" className="w-full h-14">Download File</Button>
          </form>
       </GlassCard>
    </div>
  );
}