"use client";

import { Camera, Check, KeyRound, LoaderCircle, LockKeyhole, MapPin, Save, UserRound } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { changeAccountPassword, updateProfile, type AccountActionState } from "@/app/account/actions";
import { ProfileAvatar } from "@/components/profile-avatar";

type InitialProfile = {
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  contactPhone: string;
  bio: string;
  avatarUrl: string | null;
  preferredLocale: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  country: string;
};

type AccountAction = (state: AccountActionState, formData: FormData) => Promise<AccountActionState>;

export function ProfileSettings({ initial }: { initial: InitialProfile }) {
  const [profileState, profileAction, profilePending] = useActionState<AccountActionState, FormData>(updateProfile as AccountAction, {});
  const [passwordState, passwordAction, passwordPending] = useActionState<AccountActionState, FormData>(changeAccountPassword as AccountAction, {});
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [avatarMessage, setAvatarMessage] = useState<AccountActionState>({});
  const [avatarPending, setAvatarPending] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function uploadAvatar(file: File) {
    setAvatarPending(true);
    setAvatarMessage({});
    const formData = new FormData();
    formData.set("file", file);
    try {
      const response = await fetch("/api/account/avatar", { method: "POST", body: formData });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "The photo could not be uploaded.");
      setAvatarUrl(result.url);
      setAvatarMessage({ success: "Your new profile photo is now active." });
    } catch (error) {
      setAvatarMessage({ error: error instanceof Error ? error.message : "The photo could not be uploaded." });
    } finally {
      setAvatarPending(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="account-settings-stack">
      <section className="account-settings-card" id="profile-details">
        <div className="account-card-heading">
          <span><UserRound size={20} /></span>
          <div><h2>Personal details</h2><p>Manage the name readers see and your private contact details.</p></div>
        </div>

        <div className="account-photo-row">
          <ProfileAvatar name={initial.displayName} url={avatarUrl} className="account-photo" />
          <div>
            <strong>Profile photo</strong>
            <p>JPG, PNG, WebP or AVIF. Maximum 5 MB.</p>
            <button className="account-upload-button" type="button" disabled={avatarPending} onClick={() => fileInput.current?.click()}>
              {avatarPending ? <LoaderCircle className="spin" size={17} /> : <Camera size={17} />}
              {avatarPending ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            <input
              ref={fileInput}
              className="visually-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAvatar(file); }}
            />
          </div>
        </div>
        {avatarMessage.error && <p className="form-message form-error" role="alert">{avatarMessage.error}</p>}
        {avatarMessage.success && <p className="form-message form-success" role="status"><Check size={15} /> {avatarMessage.success}</p>}

        <form className="account-form" action={profileAction}>
          <div className="account-field-grid two-columns">
            <label>First name<input name="firstName" defaultValue={initial.firstName} autoComplete="given-name" maxLength={60} /></label>
            <label>Last name<input name="lastName" defaultValue={initial.lastName} autoComplete="family-name" maxLength={60} /></label>
          </div>
          <div className="account-field-grid two-columns">
            <label>Display name <small>Shown publicly</small><input name="displayName" defaultValue={initial.displayName} autoComplete="nickname" minLength={2} maxLength={80} required /></label>
            <label>Email address <small>Sign-in email</small><input value={initial.email} type="email" readOnly disabled /></label>
          </div>
          <div className="account-field-grid two-columns">
            <label>Contact phone <small>Kept private</small><input name="contactPhone" defaultValue={initial.contactPhone} type="tel" autoComplete="tel" maxLength={30} /></label>
            <label>Preferred language<select name="preferredLocale" defaultValue={initial.preferredLocale}><option value="en">English</option><option value="de">German</option><option value="hi">Hindi</option><option value="es">Spanish</option></select></label>
          </div>
          <label>About you <small>Optional public profile bio</small><textarea name="bio" defaultValue={initial.bio} rows={4} maxLength={500} placeholder="Share a short introduction…" /></label>

          <div className="account-subheading"><MapPin size={18} /><div><h3>Address</h3><p>Your address is private and is never displayed on articles.</p></div></div>
          <label>Address line 1<input name="addressLine1" defaultValue={initial.addressLine1} autoComplete="address-line1" maxLength={120} /></label>
          <label>Address line 2<input name="addressLine2" defaultValue={initial.addressLine2} autoComplete="address-line2" maxLength={120} /></label>
          <div className="account-field-grid address-grid">
            <label>City<input name="city" defaultValue={initial.city} autoComplete="address-level2" maxLength={120} /></label>
            <label>State / region<input name="stateRegion" defaultValue={initial.stateRegion} autoComplete="address-level1" maxLength={120} /></label>
            <label>Postal code<input name="postalCode" defaultValue={initial.postalCode} autoComplete="postal-code" maxLength={120} /></label>
            <label>Country<input name="country" defaultValue={initial.country} autoComplete="country-name" maxLength={120} /></label>
          </div>
          {profileState.error && <p className="form-message form-error" role="alert">{profileState.error}</p>}
          {profileState.success && <p className="form-message form-success" role="status"><Check size={15} /> {profileState.success}</p>}
          <div className="account-form-actions"><button className="button button-primary" type="submit" disabled={profilePending}><Save size={17} /> {profilePending ? "Saving…" : "Save profile"}</button></div>
        </form>
      </section>

      <section className="account-settings-card" id="security">
        <div className="account-card-heading">
          <span><KeyRound size={20} /></span>
          <div><h2>Password & security</h2><p>Choose a unique password with at least 8 characters.</p></div>
        </div>
        <form className="account-form account-password-form" action={passwordAction}>
          <div className="account-field-grid two-columns">
            <label>New password<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
            <label>Confirm new password<input name="passwordConfirmation" type="password" minLength={8} autoComplete="new-password" required /></label>
          </div>
          {passwordState.error && <p className="form-message form-error" role="alert">{passwordState.error}</p>}
          {passwordState.success && <p className="form-message form-success" role="status"><Check size={15} /> {passwordState.success}</p>}
          <div className="account-form-actions"><span><LockKeyhole size={15} /> Your password is handled securely by Supabase.</span><button className="button button-primary" type="submit" disabled={passwordPending}>{passwordPending ? "Changing…" : "Change password"}</button></div>
        </form>
      </section>
    </div>
  );
}

