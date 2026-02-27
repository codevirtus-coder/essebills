import { useEffect, useMemo, useState } from "react";
import { getCurrentUserProfile } from "../auth.service";
import { getAuthSession, saveAuthSession } from "../auth.storage";
import type { UserProfileDto } from "../dto/auth.dto";

type ProfileDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
};

const formatName = (profile?: UserProfileDto | null) => {
  const first = profile?.firstName ?? "";
  const last = profile?.lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || profile?.username || "User";
};

export function ProfileDrawer({ open, onClose, title = "Profile" }: ProfileDrawerProps) {
  const session = getAuthSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(session?.profile ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = useMemo(() => formatName(profile), [profile]);

  useEffect(() => {
    if (!open) return;
    if (session?.profile) {
      setProfile(session.profile);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);
    getCurrentUserProfile()
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
        if (session) {
          saveAuthSession({
            ...session,
            profile: data,
          });
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Unable to load profile");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, session]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30">
      <div className="w-full max-w-md h-full bg-white shadow-2xl border-l border-neutral-light overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-light">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">
              {title}
            </p>
            <h3 className="text-lg font-black text-dark-text">{displayName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-neutral-light text-neutral-text hover:bg-neutral-light/60"
            aria-label="Close profile"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading ? (
            <p className="text-sm text-neutral-text">Loading profile...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <>
              <div className="grid gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">
                    Username
                  </p>
                  <p className="text-sm font-semibold text-dark-text">{profile?.username ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-dark-text">{profile?.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">
                    Phone
                  </p>
                  <p className="text-sm font-semibold text-dark-text">{profile?.phoneNumber ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">
                    Group
                  </p>
                  <p className="text-sm font-semibold text-dark-text">{profile?.group?.name ?? "—"}</p>
                </div>
                {profile?.organisationName ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">
                      Organization
                    </p>
                    <p className="text-sm font-semibold text-dark-text">{profile.organisationName}</p>
                  </div>
                ) : null}
                {profile?.shopName ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-text/60 font-bold">
                      Shop Name
                    </p>
                    <p className="text-sm font-semibold text-dark-text">{profile.shopName}</p>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
