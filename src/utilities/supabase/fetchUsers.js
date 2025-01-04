// src/utilities/supabase/fetchUsers.js
import { supabase } from "./supabaseClient";

export async function fetchUsers() {
  const { data, error } = await supabase
    .from("auth.users") // Access the Supabase auth table
    .select("*");

  if (error) {
    console.error("Error fetching users:", error.message);
    return;
  }

  console.log("Users:", data);
}
