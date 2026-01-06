import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContributorProfile {
  display_name: string | null;
  avatar_url: string | null;
}

const profileCache = new Map<string, ContributorProfile>();

export const useContributorProfile = (userId: string) => {
  const [profile, setProfile] = useState<ContributorProfile | null>(
    profileCache.get(userId) || null
  );
  const [loading, setLoading] = useState(!profileCache.has(userId));

  useEffect(() => {
    if (profileCache.has(userId)) {
      setProfile(profileCache.get(userId)!);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;

        const profileData = data || { display_name: null, avatar_url: null };
        profileCache.set(userId, profileData);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching contributor profile:', error);
        setProfile({ display_name: null, avatar_url: null });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading };
};
