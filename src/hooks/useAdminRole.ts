import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { retryWithBackoff } from '@/lib/retryWithBackoff';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.is_anonymous) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkAdminRole = async () => {
      try {
        const result = await retryWithBackoff(() =>
          Promise.resolve(
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .maybeSingle()
          )
        );
        if (result.error) throw result.error;
        setIsAdmin(!!result.data);
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user?.id, user?.is_anonymous]);

  return { isAdmin, loading };
};
