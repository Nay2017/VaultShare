import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import axios from 'axios';
import { Download, Lock, FileText, AlertCircle, ShieldCheck, ArrowRight, X, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

//const API_URL = '';
const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

export default function DownloadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [pass, setPass] = useState('');
  const [dl, setDl] = useState(false);
  const [error, setError] = useState('');
  
  // State for Success Animation
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/files/${id}`)
         .then(res => setMeta(res.data))
         .catch(() => setError('Link expired or does not exist'));
  }, [id]);

  const handleDl = async (e) => {
    e.preventDefault();
    setDl(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/files/download/${id}`, 
        { password: pass }, 
        { responseType: 'blob', timeout: 14400000 }
      );
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([res.data]));
      link.setAttribute('download', meta.name);
      document.body.appendChild(link); 
      link.click();

      // TRIGGER THE EXPLOSION ANIMATION
      setTimeout(() => {
        setDl(false);
        setIsSuccess(true); // This triggers the exit animation
      }, 800); // Small delay to let the browser start the download first

    } catch (err) {
      setDl(false);
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
         setShowErrorModal(true);
      } else {
         alert("Network Timeout or Connection Lost.");
      }
    }
  };

  const retry = () => {
      setShowErrorModal(false);
      setPass('');
      setTimeout(() => { passwordInputRef.current?.focus(); }, 100);
  }

  const cancel = () => { setShowErrorModal(false); }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <GlassCard className="text-center max-w-sm !border-red-200 !bg-white shadow-xl">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 animate-pulse">
                <AlertCircle size={32}/>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">File Unavailable</h2>
            <p className="text-slate-500">{error}</p>
        </GlassCard>
    </div>
  );

  if (!meta) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-medium">Verifying Vault...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-[#f8fafc] overflow-hidden">
       {/* Dynamic Background - Shifts color on Success */}
       <motion.div 
         animate={isSuccess ? { background: "#ecfdf5" } : { background: "#f8fafc" }} // Changes to faint green
         className="absolute inset-0 -z-20 transition-colors duration-1000"
       />

       <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[100px] mix-blend-multiply -z-10"></div>
       <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] mix-blend-multiply -z-10"></div>

       <AnimatePresence mode='wait'>
         {/* --- STATE 1: THE CARD (Before Download) --- */}
         {!isSuccess ? (
           <GlassCard 
             key="download-card"
             className="w-full max-w-md relative z-10 origin-center"
             // THIS IS THE EXPLOSION EXIT ANIMATION
             as={motion.div}
             exit={{ 
               scale: 1.5, 
               opacity: 0, 
               filter: "blur(20px)",
               transition: { duration: 0.5, ease: "easeIn" }
             }}
           >
              <div className="text-center mb-10">
                 <div className="relative w-24 h-24 mx-auto mb-6 group">
                     <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-[2rem] rotate-6 opacity-10 group-hover:rotate-12 transition-transform duration-500"></div>
                     <div className="relative bg-white w-full h-full rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-center">
                        <FileText className="w-10 h-10 text-indigo-600"/>
                     </div>
                 </div>
                 
                 <h2 className="text-2xl font-bold text-slate-900 break-all line-clamp-2 px-4">{meta.name}</h2>
                 <div className="flex items-center justify-center gap-3 mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="bg-white px-3 py-1 rounded-full border border-slate-200">{(meta.size/1024/1024).toFixed(2)} MB</span>
                    <span>{new Date(meta.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>

              <form onSubmit={handleDl} className="space-y-6">
                 {meta.hasPassword ? (
                    <div className="relative">
                       <div className="flex items-center justify-between mb-2 px-1">
                          <span className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-500 uppercase tracking-wider">
                             <Lock size={12} /> Vault Locked
                          </span>
                       </div>
                       
                       <input 
                         ref={passwordInputRef}
                         autoFocus 
                         type="password" 
                         placeholder="Enter Password" 
                         className="glass-input text-center text-lg tracking-[0.2em] placeholder:tracking-normal focus:border-indigo-500 transition-all"
                         value={pass} 
                         onChange={e => setPass(e.target.value)}
                       />
                    </div>
                 ) : (
                    <div className="bg-emerald-50/80 border border-emerald-100 p-5 rounded-2xl flex flex-col items-center gap-2 text-emerald-800 mb-8">
                        <ShieldCheck size={28} className="text-emerald-500"/> 
                        <span className="font-bold text-sm">Scanned & Secured</span>
                    </div>
                 )}
                 
                 <Button loading={dl} type="submit" className="w-full shadow-xl text-base h-14 shadow-indigo-200">
                    {dl ? 'Decrypting...' : <span className="flex items-center">Unlock & Download <ArrowRight className="ml-2 w-4 h-4"/></span>}
                 </Button>
              </form>
           </GlassCard>

         ) : (

           /* --- STATE 2: SUCCESS MESSAGE (After Explosion) --- */
           <motion.div 
             key="success-msg"
             initial={{ scale: 0.5, opacity: 0, y: 20 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
             className="text-center relative z-20"
           >
              <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(74,222,128,0.3)] animate-[bounce_1s]">
                  <CheckCircle2 size={56} className="text-green-500" strokeWidth={2.5} />
              </div>
              
              <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">File Saved!</h2>
              <p className="text-slate-500 font-medium mb-10">The file has been securely transferred to your device.</p>

              <button 
                onClick={() => navigate('/')}
                className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 shadow-lg shadow-slate-500/20 flex items-center gap-2 mx-auto"
              >
                 Send Your Own File <ArrowRight size={18} />
              </button>
           </motion.div>
         )}
       </AnimatePresence>

       {/* ERROR POPUP MODAL */}
       <AnimatePresence>
        {showErrorModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
               className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden"
             >
                <div className="p-8 text-center">
                   <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                      <Lock size={32} />
                   </div>
                   <h3 className="text-xl font-black text-slate-800 mb-2">Access Denied</h3>
                   <p className="text-slate-500 text-sm mb-8 px-4">
                      Incorrect password. Please try again.
                   </p>
                   <div className="flex flex-col gap-3">
                      <button onClick={retry} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                        <RefreshCcw size={18} /> Re-enter Password
                      </button>
                      <button onClick={cancel} className="w-full h-12 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                        Cancel
                      </button>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
       </AnimatePresence>
    </div>
  );
}