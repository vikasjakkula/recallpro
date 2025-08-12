import { createClient as createServerSupabaseClient } from './supabase/server'

export interface User {
  id: string
  name: string
  college: string
  email: string
  phone: string
  alt_phone?: string
  password: string
  created_at: string
}

export async function createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating user:', error)
    return null
  }
  
  return data
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('phone', phone)
    .single()
  
  if (error) {
    console.error('Error fetching user:', error)
    return null
  }
  
  return data
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching user:', error)
    return null
  }
  
  return data
} 