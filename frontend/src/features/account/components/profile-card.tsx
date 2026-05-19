import { useState } from 'react';
import { Profile } from '@/lib/types';
import { usersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRound, Phone, Mail, Award, MapPin, Pencil, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfileCard({ profile: initialProfile }: { profile: Profile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: initialProfile.name,
    phone: initialProfile.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const updated = await usersApi.updateProfile({
        name: formData.name,
        phone: formData.phone
      });
      setProfile(prev => ({
        ...prev,
        name: updated.name || prev.name,
        phone: updated.phone || prev.phone
      }));
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      phone: profile.phone || ''
    });
    setIsEditing(false);
    setError(null);
  };

  return (
    <section className="surface relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Personal Information</h2>
            <p className="text-sm text-foreground/50">Manage your basic details and contact info.</p>
          </div>
        </div>
        {!isEditing ? (
            <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="rounded-xl gap-2 h-10 px-4 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
          >
            <Pencil className="h-4 w-4" />
              Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              className="rounded-xl h-10 px-4 text-foreground/50 hover:bg-muted"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              className="rounded-xl gap-2 h-10 px-4 shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-rose-500/10 p-4 border border-rose-500/20 text-sm font-medium text-rose-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 px-1">Full Name</label>
          {isEditing ? (
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl border-border bg-muted/30 focus:ring-primary/20"
              placeholder="Your name"
            />
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/20 px-4 py-3.5 transition-colors group hover:bg-muted/40">
              <UserRound className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
              <p className="text-sm font-semibold text-foreground">{profile.name}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 px-1">Phone Number</label>
          {isEditing ? (
            <Input 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="rounded-xl border-border bg-muted/30 focus:ring-primary/20"
              placeholder="+1 (555) 000-0000"
            />
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/20 px-4 py-3.5 transition-colors group hover:bg-muted/40">
              <Phone className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
              <p className="text-sm font-semibold text-foreground">{profile.phone || 'Not provided'}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 px-1">Email Address</label>
          <div className="flex items-center gap-3 rounded-2xl border border-border/30 bg-muted/10 px-4 py-3.5 opacity-80">
            <Mail className="h-4 w-4 text-foreground/30" />
            <p className="text-sm font-medium text-foreground/60">{profile.email}</p>
          </div>
          <p className="px-1 text-[10px] text-foreground/40">Email cannot be changed for security reasons.</p>
        </div>

        <div className="space-y-1.5 opacity-80">
          <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 px-1">Account Level</label>
          <div className="flex items-center gap-3 rounded-2xl border border-border/30 bg-muted/10 px-4 py-3.5">
            <Award className="h-4 w-4 text-foreground/30" />
            <p className="text-sm font-medium text-foreground/60">{profile.membership}</p>
          </div>
        </div>

        <div className="sm:col-span-2 space-y-1.5 opacity-80">
          <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 px-1">Primary Address</label>
          <div className="flex items-center gap-3 rounded-2xl border border-border/30 bg-muted/10 px-4 py-3.5">
            <MapPin className="h-4 w-4 text-foreground/30" />
            <p className="text-sm font-medium text-foreground/60 line-clamp-1">{profile.defaultAddress || 'No default address set'}</p>
          </div>
          <p className="px-1 text-[10px] text-foreground/40 italic">Manage your address book in the Address section (coming soon).</p>
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
    </section>
  );
}
