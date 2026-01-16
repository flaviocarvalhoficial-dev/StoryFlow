import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/storyboard';
import { toast } from 'sonner';

export function useUserProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            return;
        }

        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching profile:', error);
                }

                if (data) {
                    setProfile({
                        firstName: data.first_name || '',
                        lastName: data.last_name || '',
                        email: data.email || user.email || '',
                        specialty: data.specialty || '',
                        plan: data.plan || 'Free',
                        avatarUrl: data.avatar_url || '',
                    });
                } else {
                    // Initialize defaults if not found
                    setProfile({
                        firstName: '',
                        lastName: '',
                        email: user.email || '',
                        specialty: '',
                        plan: 'Free',
                        avatarUrl: ''
                    });
                }
            } catch (e) {
                console.error('Error in fetchProfile', e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const updateProfile = useCallback(async (updatedProfile: UserProfile, avatarFile?: Blob | File) => {
        if (!user) return;
        try {
            let avatarUrl = updatedProfile.avatarUrl;

            if (avatarFile) {
                const fileExt = 'jpg'; // We convert to jpeg in modal usually, or just use generic
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Upload
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                // Get URL
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                avatarUrl = publicUrl;
            }

            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: user.id,
                    first_name: updatedProfile.firstName,
                    last_name: updatedProfile.lastName,
                    email: updatedProfile.email,
                    specialty: updatedProfile.specialty,
                    plan: updatedProfile.plan,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;

            setProfile({ ...updatedProfile, avatarUrl });
            toast.success('Perfil atualizado com sucesso!');
        } catch (e) {
            console.error('Error updating profile', e);
            toast.error('Erro ao atualizar perfil.');
            throw e; // Re-throw to handle closer logic if needed
        }
    }, [user]);

    return { profile, isLoading, updateProfile };
}
