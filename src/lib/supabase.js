import { createClient } from '@supabase/supabase-js'
import { isDemoMode } from './demo'
import { DEMO_PROFILE, DEMO_TOKEN_USAGE, DEMO_CHATS, DEMO_MESSAGES, DEMO_RESPONSES } from './demoData'
import { AI_TIMEOUT_MS, QUERY_TIMEOUT_MS } from './config'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Allow missing env vars in demo mode
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

function withTimeout(promise, ms = QUERY_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), ms)),
  ])
}

// ── Auth helpers ──────────────────────────────────────────────

export async function signUp(email, password, fullname) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { fullname } },
  })
  if (error) throw error

  if (data.user) {
    try {
      await supabase.from('users').insert({
        user_auth_id: data.user.id,
        fullname: fullname || null,
      })
    } catch (e) {
      // Profile will be created on first login via getOrCreateUserProfile
    }
  }

  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (isDemoMode()) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

export async function getSession() {
  if (isDemoMode()) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ── User profile ──────────────────────────────────────────────

export async function getOrCreateUserProfile(authId, fullname) {
  if (isDemoMode()) return DEMO_PROFILE

  try {
    const { data: existing } = await withTimeout(
      supabase.from('users').select('*').eq('user_auth_id', authId).maybeSingle()
    )
    if (existing) return existing
  } catch (e) {
    return null
  }

  try {
    const insertData = { user_auth_id: authId }
    if (fullname) insertData.fullname = fullname
    const { data: created } = await withTimeout(
      supabase.from('users').insert(insertData).select().single()
    )
    return created
  } catch (e) {
    return null
  }
}

export async function updateUserProfile(authId, updates) {
  if (isDemoMode()) return { ...DEMO_PROFILE, ...updates }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_auth_id', authId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Token/credit usage ───────────────────────────────────────

export async function getTokenUsage(authId) {
  if (isDemoMode()) return DEMO_TOKEN_USAGE

  try {
    const { data } = await withTimeout(
      supabase
        .from('user_monthly_usage')
        .select('*')
        .eq('user_auth_id', authId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    )
    return data || { tokens_used: 0, progress_bar_value: 0 }
  } catch (e) {
    return { tokens_used: 0, progress_bar_value: 0 }
  }
}

// ── Chats ─────────────────────────────────────────────────────

export async function getChats(authId) {
  if (isDemoMode()) return [...DEMO_CHATS]

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_auth_id', authId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createChat(authId, agentType) {
  if (isDemoMode()) {
    const newChat = {
      id: 'demo-chat-' + Date.now(),
      user_auth_id: authId,
      agent_type: agentType,
      title: 'Novo chat',
      created_at: new Date().toISOString(),
      attached_file_name: null,
      attached_file_text: null,
    }
    DEMO_CHATS.unshift(newChat)
    return newChat
  }

  const { data, error } = await supabase
    .from('chats')
    .insert({
      user_auth_id: authId,
      agent_type: agentType,
      title: 'Novo chat',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateChatTitle(chatId, title) {
  if (isDemoMode()) {
    const chat = DEMO_CHATS.find(c => c.id === chatId)
    if (chat) chat.title = title
    return
  }

  const { error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', chatId)
  if (error) throw error
}

export async function deleteChat(chatId) {
  if (isDemoMode()) {
    const idx = DEMO_CHATS.findIndex(c => c.id === chatId)
    if (idx > -1) DEMO_CHATS.splice(idx, 1)
    delete DEMO_MESSAGES[chatId]
    return
  }

  await supabase.from('chat_messages').delete().eq('chat_id', chatId)
  const { error } = await supabase.from('chats').delete().eq('id', chatId)
  if (error) throw error
}

// ── Messages ──────────────────────────────────────────────────

export async function getMessages(chatId) {
  if (isDemoMode()) return [...(DEMO_MESSAGES[chatId] || [])]

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function insertMessage(chatId, authId, message, sender) {
  if (isDemoMode()) {
    const msg = {
      id: 'demo-msg-' + Date.now(),
      chat_id: chatId,
      user_auth_id: authId,
      message,
      sender,
      created_at: new Date().toISOString(),
    }
    if (!DEMO_MESSAGES[chatId]) DEMO_MESSAGES[chatId] = []
    DEMO_MESSAGES[chatId].push(msg)
    return msg
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      chat_id: chatId,
      user_auth_id: authId,
      message,
      sender,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Agent prompts ─────────────────────────────────────────────

export async function getAgentPrompt(agentType) {
  if (isDemoMode()) return 'Você é um assistente especializado para psicólogas infantis.'

  const { data } = await supabase
    .from('agents_prompts')
    .select('prompt')
    .eq('agent_type', agentType)
    .maybeSingle()

  return data?.prompt || ''
}

// ── File attachments ──────────────────────────────────────────

export async function saveFileToChat(chatId, authId, file, extractedText) {
  if (isDemoMode()) {
    const chat = DEMO_CHATS.find(c => c.id === chatId)
    if (chat) {
      chat.attached_file_name = file.name
      chat.attached_file_text = extractedText
    }
    return
  }

  const path = `${authId}/${chatId}/${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('chat-attachments')
    .upload(path, file, { upsert: true })

  if (uploadError) {
    // Upload falhou, mas o texto extraído já foi salvo na tabela chats abaixo
  }

  const { error: updateError } = await supabase
    .from('chats')
    .update({
      attached_file_text: extractedText,
      attached_file_name: file.name,
    })
    .eq('id', chatId)

  if (updateError) throw updateError
}

// ── Subscription ──────────────────────────────────────────────

export async function createCheckoutSession(planType) {
  if (isDemoMode()) return { success: true, message: 'Demo mode' }

  const session = await getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(
    `${supabaseUrl}/functions/v1/create-subscription`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ plan_type: planType }),
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Checkout error: ${response.status} ${text}`)
  }

  return response.json()
}

// ── Edge function: chat-ai ────────────────────────────────────

export async function callChatAI({ chatId, userMessage, prompt, createTitle = false, fileContext = null }) {
  if (isDemoMode()) {
    // Simulate AI delay
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000))

    const reply = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)]

    if (!DEMO_MESSAGES[chatId]) DEMO_MESSAGES[chatId] = []
    DEMO_MESSAGES[chatId].push({
      id: 'demo-ai-' + Date.now(),
      chat_id: chatId,
      sender: 'agent',
      message: reply,
      created_at: new Date().toISOString(),
    })

    if (createTitle) {
      const chat = DEMO_CHATS.find(c => c.id === chatId)
      if (chat) chat.title = userMessage.slice(0, 40) + (userMessage.length > 40 ? '...' : '')
    }

    return { reply, tokens_used: 24640, tokens_remaining: 55360, progress: 0.31 }
  }

  const session = await getSession()
  if (!session) throw new Error('Not authenticated')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  const body = {
    chat_id: chatId,
    user_message: userMessage,
    prompt,
    createTitle,
  }
  if (fileContext) {
    body.file_context = fileContext
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/chat-ai`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (response.status === 403) {
      const respBody = await response.json()
      if (respBody.error === 'subscription_required') {
        throw { type: 'subscription_required', message: 'Assine para continuar usando.' }
      }
      if (respBody.error === 'token_limit_reached') {
        throw { type: 'token_limit_reached', message: 'Seus créditos mensais acabaram.' }
      }
      throw new Error(respBody.error || 'Forbidden')
    }

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Edge function error: ${response.status} ${text}`)
    }

    return response.json()
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('A resposta da IA demorou demais. Tente novamente.')
    }
    throw err
  }
}
