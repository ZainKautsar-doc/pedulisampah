import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser) => {
    try {
      // Fetch user role from users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        // Fallback if users table doesn't have the user yet
        setUser({ 
          ...authUser, 
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User', 
          role: authUser.email?.includes('admin') ? 'admin' : authUser.email?.includes('komunitas') ? 'komunitas' : 'warga' 
        });
      } else {
        setUser({ ...authUser, ...data });
      }
    } catch (err) {
      console.error('Exception fetching profile:', err);
      setUser({ ...authUser, role: 'warga' });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    
    // Fetch role for immediate redirect
    let role = 'warga';
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();
      if (profile?.role) role = profile.role;
    } catch (err) {
      // fallback
      if (email.includes('admin')) role = 'admin';
      else if (email.includes('komunitas')) role = 'komunitas';
    }
    
    return { ...data, role };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
