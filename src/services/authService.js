import { supabase } from "../lib/supabaseClient"

export async function registerUser({ name, email, password }) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name
            }
        }
    })

    if (error) throw error

    return data
}

export async function loginUser({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) throw error

    return data
}

export async function getCurrentUser() {
    const { data } = await supabase.auth.getUser()
    return data?.user
}

export async function logoutUser() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}