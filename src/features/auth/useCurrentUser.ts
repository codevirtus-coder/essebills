import { useEffect, useState } from "react";
import { getAuthSession, saveAuthSession } from "./auth.storage";
import { getCurrentUserProfile } from "./auth.service";
import type { UserProfileDto, UserGroup } from "./dto/auth.dto";

export type CurrentUserState = {
  profile: UserProfileDto | null;
  group: UserGroup | null;
  loading: boolean;
};

export function useCurrentUser(): CurrentUserState {
  const session = getAuthSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(session?.profile ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session || profile) return;
    let mounted = true;
    setLoading(true);
    getCurrentUserProfile()
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
        saveAuthSession({ ...session, profile: data });
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [profile, session]);

  return {
    profile,
    group: session?.group ?? null,
    loading,
  };
}
