"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AccountActionState = { error?: string; success?: string };

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function tooLong(valueToCheck: string, maximum: number) {
  return valueToCheck.length > maximum;
}

export async function updateProfile(
  _state: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const firstName = value(formData, "firstName");
  const lastName = value(formData, "lastName");
  const displayName = value(formData, "displayName");
  const contactPhone = value(formData, "contactPhone");
  const bio = value(formData, "bio");
  const addressLine1 = value(formData, "addressLine1");
  const addressLine2 = value(formData, "addressLine2");
  const city = value(formData, "city");
  const stateRegion = value(formData, "stateRegion");
  const postalCode = value(formData, "postalCode");
  const country = value(formData, "country");
  const preferredLocale = value(formData, "preferredLocale");

  if (displayName.length < 2) return { error: "Enter a display name with at least 2 characters." };
  if (tooLong(displayName, 80) || tooLong(firstName, 60) || tooLong(lastName, 60)) {
    return { error: "Names must be shorter than 80 characters." };
  }
  if (tooLong(contactPhone, 30)) return { error: "The contact phone number is too long." };
  if (tooLong(bio, 500)) return { error: "Your bio must be 500 characters or fewer." };
  if ([addressLine1, addressLine2, city, stateRegion, postalCode, country].some((item) => tooLong(item, 120))) {
    return { error: "One of the address fields is too long." };
  }
  if (!["en", "de", "hi", "es"].includes(preferredLocale)) {
    return { error: "Choose a supported language." };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { error: "Your session has expired. Sign in again to update your profile." };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ display_name: displayName, bio: bio || null, preferred_locale: preferredLocale })
    .eq("id", userId);
  if (profileError) return { error: profileError.message };

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      display_name: displayName,
      first_name: firstName,
      last_name: lastName,
      contact_phone: contactPhone,
      address: {
        line_1: addressLine1,
        line_2: addressLine2,
        city,
        state_region: stateRegion,
        postal_code: postalCode,
        country,
      },
    },
  });
  if (metadataError) return { error: metadataError.message };

  revalidatePath("/account");
  revalidatePath("/");
  return { success: "Your profile has been saved." };
}

export async function changeAccountPassword(
  _state: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const password = value(formData, "password");
  const confirmation = value(formData, "passwordConfirmation");
  if (password.length < 8) return { error: "Use a password with at least 8 characters." };
  if (password !== confirmation) return { error: "The password confirmation does not match." };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) return { error: "Your session has expired. Sign in again to change your password." };
  const { error } = await supabase.auth.updateUser({ password });
  return error ? { error: error.message } : { success: "Your password has been changed." };
}

