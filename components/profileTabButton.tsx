import { useCheckAuth } from '@/hooks/check-auth';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

export const ProfileTabButton = (props: any) => {
  const router = useRouter();
  const { user, loading } = useCheckAuth();

  const handlePress = () => {
    if (loading) "loading...";

    if (!user) {
      router.replace('/auth/auth');
    } else {
      props.onPress();
    }
  };

  return <Pressable {...props} onPress={handlePress}>{props.children}</Pressable>;
};
