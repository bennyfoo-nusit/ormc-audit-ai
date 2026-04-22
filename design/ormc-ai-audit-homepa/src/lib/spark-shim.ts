/**
 * Local shim for window.spark – replaces the GitHub Spark runtime API
 * with localStorage-backed equivalents for offline/local development.
 */

const KV_PREFIX = 'spark-kv:'

const localKv = {
  async get<T = unknown>(key: string): Promise<T | undefined> {
    try {
      const raw = localStorage.getItem(`${KV_PREFIX}${key}`)
      return raw !== null ? (JSON.parse(raw) as T) : undefined
    } catch {
      return undefined
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    localStorage.setItem(`${KV_PREFIX}${key}`, JSON.stringify(value))
  },

  async delete(key: string): Promise<void> {
    localStorage.removeItem(`${KV_PREFIX}${key}`)
  },
}

function localLlm(_prompt: string, _model?: string, _json?: boolean): Promise<string> {
  console.warn('[spark-shim] llm() called – returning stub response')
  return Promise.resolve(JSON.stringify({ message: 'LLM is not available in local mode.' }))
}

function localLlmPrompt(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((result, str, i) => result + str + (values[i] ?? ''), '')
}

async function localUser() {
  return { id: '180628674', login: 'bennyfoo-nusit' }
}

// Always override – @github/spark/spark may have installed a real runtime
// that tries to proxy to GitHub APIs we can't reach locally.
const spark = ((window as any).spark ??= {}) as Record<string, unknown>
spark.kv = localKv
spark.llm = localLlm
spark.llmPrompt = localLlmPrompt
spark.user = localUser
