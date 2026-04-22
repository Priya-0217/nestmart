import { Profile } from '@/lib/types';

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <section className="surface p-5">
      <h2 className="text-lg font-semibold">Profile</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Name" value={profile.name} />
        <Field label="Email" value={profile.email} />
        <Field label="Phone" value={profile.phone} />
        <Field label="Membership" value={profile.membership} />
      </div>
      <div className="mt-3">
        <Field label="Default Address" value={profile.defaultAddress} />
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <p className="text-xs uppercase tracking-wide text-foreground/50">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
