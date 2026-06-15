import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { RefreshCw } from 'lucide-react';

export interface CaptchaRef {
  validate: () => boolean;
  reset: () => void;
  getCaptchaData: () => { token: string; input: string };
  setErrorState: (isError: boolean) => void;
}

interface CaptchaProps {
  onValidateStateChange?: (isValid: boolean) => void;
}

export const Captcha = forwardRef<CaptchaRef, CaptchaProps>(({ onValidateStateChange }, ref) => {
  const [svg, setSvg] = useState('');
  const [token, setToken] = useState('');
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/captcha/generate');
      if (res.ok) {
        const data = await res.json();
        setSvg(data.svg);
        setToken(data.token);
        setInput('');
      } else {
        console.error('Failed to load CAPTCHA');
      }
    } catch (err) {
      console.error('Error loading CAPTCHA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  useImperativeHandle(ref, () => ({
    validate: () => {
      // Basic client-side check: must be exactly 6 characters
      const isValid = input.trim().length === 6;
      setError(!isValid);
      return isValid;
    },
    reset: () => {
      fetchCaptcha();
    },
    getCaptchaData: () => {
      return { token, input: input.trim() };
    },
    setErrorState: (isError: boolean) => {
      setError(isError);
      if (isError) {
        setInput('');
      }
    }
  }));

  return (
    <div className="space-y-2 select-none my-4">
      <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1 block">
        Security Verification *
      </label>
      <div className="flex items-center gap-3">
        {/* Captcha display box */}
        <div 
          className="flex items-center justify-center bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-inner h-[50px] w-[150px]"
        >
          {svg ? (
            <div 
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: svg }} 
            />
          ) : (
            <div className="text-xs text-slate-400 animate-pulse">
              Loading...
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={loading}
          className="p-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
          title="Refresh Captcha"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {/* Captcha Input Box */}
      <div className="space-y-1 max-w-xs">
        <input
          required
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(false);
          }}
          placeholder="Enter the security code"
          className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-100 focus:border-blue-400'
          }`}
        />
        {error && (
          <p className="text-red-500 text-xs font-bold px-1 animate-pulse">
            Incorrect security code. Please try again.
          </p>
        )}
      </div>
    </div>
  );
});

Captcha.displayName = 'Captcha';
