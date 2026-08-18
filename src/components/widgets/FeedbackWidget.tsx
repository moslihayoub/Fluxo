'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquarePlus, X, Send, CheckCircle2, Sparkles, Bug, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';

export default function FeedbackWidget() {
  const widgetId = process.env.NEXT_PUBLIC_FEEDBACK_WIDGET_ID;

  useEffect(() => {
    // If a Featurebase / Hotjar widget ID is provided, load the external SDK script
    if (widgetId && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.id = 'featurebase-widget-script';
      script.src = 'https://do.featurebase.app/js/sdk.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).Featurebase) {
          (window as any).Featurebase('initialize_feedback_widget', {
            organization: widgetId,
            theme: 'dark',
            placement: 'right',
          });
        }
      };
      document.body.appendChild(script);

      return () => {
        const existingScript = document.getElementById('featurebase-widget-script');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [widgetId]);

  return null;
}

export function FeedbackTriggerButton({ className = '', variant = 'default' }: { className?: string; variant?: 'default' | 'small' | 'icon' }) {
  const language = useStore((s) => s.language);
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'idea' | 'other'>('idea');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success(t('feedback.successTitle'));
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setMessage('');
        setName('');
        setEmail('');
        setRating(0);
      }, 1500);
    }, 500);
  };

  const renderTrigger = () => {
    if (variant === 'icon') {
      return (
        <button
          onClick={() => setIsOpen(true)}
          title={t('feedback.title')}
          className={`p-2 text-zinc-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center ${className}`}
        >
          <MessageSquarePlus className="w-4 h-4" />
        </button>
      );
    }

    if (variant === 'small') {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-violet-400 text-zinc-700 dark:text-zinc-300 font-bold hover:scale-105 active:scale-95 transition-all shadow-sm ${className}`}
        >
          <MessageSquarePlus className="w-3.5 h-3.5 text-violet-500 shrink-0" />
          <span>Feedback</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => setIsOpen(true)}
        title={t('feedback.title')}
        className={`p-2 text-zinc-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold ${className}`}
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span className="hidden md:inline">Feedback</span>
      </button>
    );
  };

  return (
    <>
      {renderTrigger()}

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center sm:block p-4 sm:p-0">
          <div 
            className="absolute sm:fixed inset-0 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="relative sm:fixed sm:inset-y-0 sm:right-0 z-10 bg-white dark:bg-zinc-900 w-full max-w-md sm:max-w-none sm:w-[50%] rounded-3xl sm:rounded-none sm:rounded-l-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none sm:h-full animate-in fade-in sm:slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {t('feedback.title')}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {t('feedback.subtitle')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isSubmitted ? (
                <div className="p-8 text-center space-y-3 mt-10">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white">{t('feedback.successTitle')}</h4>
                  <p className="text-sm text-zinc-500">{t('feedback.successDesc')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">{t('feedback.type')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFeedbackType('idea')}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          feedbackType === 'idea'
                            ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" /> {t('feedback.idea')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackType('bug')}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          feedbackType === 'bug'
                            ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Bug className="w-3.5 h-3.5" /> {t('feedback.bug')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedbackType('other')}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          feedbackType === 'other'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" /> {t('feedback.other')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Note (Optionnel)</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1.5 rounded-lg transition-colors ${rating >= star ? 'text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">{t('feedback.message')} *</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={feedbackType === 'bug' ? t('feedback.placeholderBug') : t('feedback.placeholderIdea')}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Nom (Optionnel)</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">{t('feedback.email')} (Optionnel)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nom@email.com"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                      />
                    </div>
                  </div>

                </form>
              )}
            </div>

            {!isSubmitted && (
              <div className="flex-shrink-0 flex justify-end gap-3 p-5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium text-sm hover:bg-zinc-200 transition-colors"
                >
                  {t('feedback.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !message.trim()}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? t('feedback.sending') : t('feedback.send')}
                </button>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
