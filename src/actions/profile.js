"use server";

import { createClient } from "../utils/supabase/server";
import { database } from "../lib/database";
import { revalidatePath } from "next/cache";

export async function updateUserBio(formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Não autenticado" };
    }

    // Buscar usuário do banco
    const username = user.email.split("@")[0];
    const dbUser = await database.getUserByUsername(username);

    const bio = formData.get("bio");

    // Atualizar bio
    await database.updateUserBio(dbUser.id, bio);

    revalidatePath("/profile");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar bio:", error);
    return { success: false, error: "Erro ao atualizar bio" };
  }
}
