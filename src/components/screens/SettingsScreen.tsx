import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, User, Bell, Globe, Sparkles, Shield, Camera, UploadCloud, AlertCircle, Lock, Download, Trash2, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { auth } from '../../lib/firebase';
import { sendPasswordResetEmail, signOut, deleteUser } from 'firebase/auth';

export const SettingsScreen: React.FC = () => {
  const { user, goBack, navigateTo } = useApp();
  
  // Profile state
  const [name, setName] = useState(user.name);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  
  // Preferences state
  const [language, setLanguage] = useState(user.preferences?.language || 'english');
  const [responseStyle, setResponseStyle] = useState(user.preferences?.responseStyle || 'balanced');
  const [explanationMode, setExplanationMode] = useState(user.preferences?.explanationPreference || 'simple');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSaveProfile = async () => {
    if (!supabase) {
      setMessage({ text: 'Unable to save. Database not connected.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      const { error } = await supabase.from('users').update({
        display_name: name,
        avatar_url: avatarUrl,
        preferences: {
          language,
          responseStyle,
          explanationPreference: explanationMode
        },
        updated_at: new Date().toISOString()
      }).eq('id', currentUser.uid);
      
      if (error) throw error;
      
      setIsEditingProfile(false);
      setMessage({ text: 'Profile updated successfully.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: 'Unable to save changes. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!supabase) {
      setMessage({ text: 'Unable to save. Database not connected.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      const { error } = await supabase.from('users').update({
        preferences: {
          language,
          responseStyle,
          explanationPreference: explanationMode
        },
        updated_at: new Date().toISOString()
      }).eq('id', currentUser.uid);
      
      if (error) throw error;
      setMessage({ text: 'Preferences saved successfully.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: 'Unable to save preferences. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'Image must be under 2MB', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.uid}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setMessage({ text: 'Avatar uploaded successfully. Remember to save.', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Unable to upload profile image.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user.email) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage({ text: 'Password reset email sent!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to send reset email.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      navigateTo('welcome');
    } catch (error) {
      setMessage({ text: 'Error signing out.', type: 'error' });
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteUser(currentUser);
        navigateTo('welcome');
      }
    } catch (error) {
      setMessage({ text: 'Failed to delete account. You may need to sign in again first.', type: 'error' });
      setLoading(false);
    }
  };

  const handleExportData = () => {
    setMessage({ text: 'Data export started. A download link will be emailed to you.', type: 'success' });
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col px-6 py-6 max-w-2xl mx-auto">
      {/* Top Bar with Back Arrow */}
      <div className="flex items-center justify-between mb-8 sticky top-6 bg-[#F7F2EC]/80 backdrop-blur-md z-10 py-2 rounded-2xl">
        <div className="flex items-center">
          <button
            onClick={goBack}
            aria-label="Go back"
            className="w-10 h-10 rounded-full bg-white/70 border border-white/80 flex items-center justify-center text-[#151515] hover:bg-white shadow-sm cursor-pointer active:scale-95 transition-all mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-[#151515]">Settings</h1>
        </div>
      </div>

      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-3 text-sm font-medium ${
              message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 pb-20"
      >
        {/* Profile Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider pl-2">Profile</h2>
          <div className="bg-white/50 border border-white/60 p-5 rounded-3xl space-y-5">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <label className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border border-stone-200 shadow-sm flex items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors">
                  <Camera className="w-3 h-3 text-stone-600" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={loading} />
                </label>
              </div>
              <div className="flex-1">
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-sm text-[#151515] font-semibold focus:outline-none focus:border-[#FF6B22]"
                    disabled={loading}
                  />
                ) : (
                  <h3 className="text-lg font-bold text-[#151515] leading-tight">{name}</h3>
                )}
                <p className="text-sm text-[#6F6A64] mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="flex justify-end border-t border-stone-100 pt-3">
              {isEditingProfile ? (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditingProfile(false)} disabled={loading} className="px-4 py-2 text-sm font-medium text-stone-500 hover:text-stone-700">Cancel</button>
                  <button onClick={handleSaveProfile} disabled={loading} className="px-4 py-2 text-sm font-bold text-white bg-[#FF6B22] rounded-xl hover:bg-[#e85a15] shadow-sm disabled:opacity-50">Save Profile</button>
                </div>
              ) : (
                <button onClick={() => setIsEditingProfile(true)} className="px-4 py-2 text-sm font-medium text-[#151515] bg-white border border-stone-200 rounded-xl hover:bg-stone-50 shadow-sm">Edit Profile</button>
              )}
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider pl-2">AI Personalization</h2>
          <div className="bg-white/50 border border-white/60 p-5 rounded-3xl space-y-6">
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-[#151515] flex items-center gap-2">
                <Globe className="w-4 h-4 text-stone-500" /> Language
              </label>
              <div className="flex gap-2 p-1 bg-stone-100/50 rounded-xl border border-stone-200/50">
                <button 
                  onClick={() => setLanguage('english')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${language === 'english' ? 'bg-white text-[#151515] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('hinglish')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${language === 'hinglish' ? 'bg-white text-[#151515] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  Hinglish
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-[#151515] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-stone-500" /> Response Style
              </label>
              <div className="flex gap-2 p-1 bg-stone-100/50 rounded-xl border border-stone-200/50">
                <button 
                  onClick={() => setResponseStyle('concise')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${responseStyle === 'concise' ? 'bg-white text-[#151515] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  Concise
                </button>
                <button 
                  onClick={() => setResponseStyle('balanced')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${responseStyle === 'balanced' ? 'bg-white text-[#151515] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  Balanced
                </button>
                <button 
                  onClick={() => setResponseStyle('detailed')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${responseStyle === 'detailed' ? 'bg-white text-[#151515] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  Detailed
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-[#151515] flex items-center gap-2">
                <User className="w-4 h-4 text-stone-500" /> Explanation Mode
              </label>
              <div className="flex gap-2 p-1 bg-stone-100/50 rounded-xl border border-stone-200/50">
                <button 
                  onClick={() => setExplanationMode('simple')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${explanationMode === 'simple' ? 'bg-white text-[#151515] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  Simple
                </button>
                <button 
                  onClick={() => setExplanationMode('technical')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${explanationMode === 'technical' ? 'bg-white text-[#151515] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  Technical/Legal
                </button>
              </div>
            </div>

            <div className="flex justify-end border-t border-stone-100 pt-3">
               <button onClick={handleSavePreferences} disabled={loading} className="px-4 py-2 text-sm font-bold text-[#151515] bg-white border border-stone-200 rounded-xl hover:bg-stone-50 shadow-sm disabled:opacity-50">Save Preferences</button>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider pl-2">Security</h2>
          <div className="bg-white/50 border border-white/60 rounded-3xl overflow-hidden divide-y divide-stone-100">
            <button 
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-stone-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#151515]">Change Password</h3>
                  <p className="text-xs text-[#6F6A64]">Send a reset link to your email</p>
                </div>
              </div>
            </button>
            <button 
              onClick={handleSignOut}
              disabled={loading}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-stone-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#151515]">Sign Out</h3>
                  <p className="text-xs text-[#6F6A64]">Sign out of your account on this device</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Data & Privacy Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider pl-2">Data & Privacy</h2>
          <div className="bg-white/50 border border-white/60 rounded-3xl overflow-hidden divide-y divide-stone-100">
            <button 
              onClick={handleExportData}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                  <Download className="w-4 h-4 text-stone-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#151515]">Export Data</h3>
                  <p className="text-xs text-[#6F6A64]">Download your documents and analysis history</p>
                </div>
              </div>
            </button>
            <button 
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-red-50 transition-colors group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-600">Delete Account</h3>
                  <p className="text-xs text-red-500">Permanently delete your account and all data</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider pl-2">About</h2>
          <div className="bg-white/50 border border-white/60 rounded-3xl p-5 text-center space-y-3">
            <div className="flex items-center justify-center">
              <span className="text-2xl font-extrabold tracking-tight text-[#151515]">LEX</span>
              <span className="text-2xl font-extrabold tracking-tight text-[#FF6B22]">FLOW</span>
            </div>
            <p className="text-sm text-[#6F6A64]">Version 1.0.0</p>
            <div className="flex justify-center gap-4 text-xs font-semibold text-stone-500 pt-2">
              <button onClick={() => navigateTo('terms')} className="hover:text-stone-700 underline underline-offset-2">Terms of Service</button>
              <button onClick={() => navigateTo('terms')} className="hover:text-stone-700 underline underline-offset-2">Privacy Policy</button>
            </div>
          </div>
        </section>

      </motion.div>
    </div>
  );
};
