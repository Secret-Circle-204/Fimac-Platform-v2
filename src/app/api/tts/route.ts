import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"

// ─────────────────────────────────────────────────────────────────────────────
// Runtime declaration: force Node.js runtime (never Edge) so that `ws` and
// `node:crypto` are available and native-module resolution is stable.
// ─────────────────────────────────────────────────────────────────────────────
export const runtime = "nodejs"

// ─────────────────────────────────────────────────────────────────────────────
// Edge-TTS service constants
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL   = "speech.platform.bing.com/consumer/speech/synthesize/readaloud"
const TCT        = "6A5AA1D4EAFF4E9FB37E23D68491D6F4"
const WS_URL     = `wss://${BASE_URL}/edge/v1?TrustedClientToken=${TCT}`

const CHROMIUM_FULL = "143.0.3650.75"
const CHROMIUM_MAJOR = CHROMIUM_FULL.split(".")[0]
const SEC_MS_GEC_VERSION = `1-${CHROMIUM_FULL}`

const WIN_EPOCH  = 11_644_473_600   // delta seconds 1601-01-01 → 1970-01-01
const AUDIO_SEP  = "Path:audio\r\n"

// How long to wait for a full TTS response before giving up (per attempt).
const ATTEMPT_TIMEOUT_MS = 12_000
const MAX_RETRIES        = 2

// ─────────────────────────────────────────────────────────────────────────────
// Pure-JS WebSocket options
// Passing `perMessageDeflate: false` entirely disables the permessage-deflate
// extension so the `ws` library never touches `bufferutil` or `zlib` for
// masking/compression — eliminating the "bufferUtil.mask is not a function"
// crash unconditionally, regardless of which version of ws is installed.
// ─────────────────────────────────────────────────────────────────────────────
const WS_OPTIONS = {
  perMessageDeflate: false,      // ← key fix: no native bufferutil needed
  skipUTF8Validation: true,      // skip utf-8-validate native dep
  handshakeTimeout: 8_000,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Token & ID helpers
// ─────────────────────────────────────────────────────────────────────────────
function generateSecMsGec(): string {
  let ticks = Date.now() / 1000 + WIN_EPOCH
  ticks     -= ticks % 300
  ticks     *= 1e9 / 100
  return crypto
    .createHash("sha256")
    .update(`${ticks.toFixed(0)}${TCT}`, "ascii")
    .digest("hex")
    .toUpperCase()
}

const generateMuid        = () => crypto.randomBytes(16).toString("hex").toUpperCase()
const generateConnectionId = () => crypto.randomUUID().replaceAll("-", "")

// ─────────────────────────────────────────────────────────────────────────────
// XML escaping (prevent SSML injection / parse errors)
// ─────────────────────────────────────────────────────────────────────────────
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

// ─────────────────────────────────────────────────────────────────────────────
// Build the two protocol messages once (templates don't change between calls)
// ─────────────────────────────────────────────────────────────────────────────
const SPEECH_CONFIG_BODY = JSON.stringify({
  context: {
    synthesis: {
      audio: {
        metadataoptions: { sentenceBoundaryEnabled: false, wordBoundaryEnabled: false },
        outputFormat: "audio-24khz-48kbitrate-mono-mp3",
      },
    },
  },
})

function buildConfigMsg(): string {
  return (
    `X-Timestamp:${new Date().toISOString()}\r\n` +
    `Content-Type:application/json; charset=utf-8\r\n` +
    `Path:speech.config\r\n\r\n${SPEECH_CONFIG_BODY}`
  )
}

function buildSsmlMsg(text: string, voice: string, rate: string, pitch: string): string {
  return (
    `X-RequestId:${generateConnectionId()}\r\n` +
    `Content-Type:application/ssml+xml\r\n` +
    `X-Timestamp:${new Date().toISOString()}\r\n` +
    `Path:ssml\r\n\r\n` +
    `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
    `<voice name='${voice}'>` +
    `<prosody pitch='${pitch}' rate='${rate}' volume='+0%'>${escapeXml(text)}</prosody>` +
    `</voice></speak>`
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Core synthesizer — single attempt.
// Returns a Buffer of MP3 audio, or throws on any failure.
// ─────────────────────────────────────────────────────────────────────────────
async function synthesiseOnce(
  text:  string,
  voice: string,
  rate:  string,
  pitch: string,
  signal: AbortSignal,
): Promise<Buffer> {
  // Dynamic import keeps `ws` out of the edge bundle.
  const { WebSocket } = await import("ws")

  const secMsGec = generateSecMsGec()
  const connId   = generateConnectionId()
  const url      =
    `${WS_URL}&Sec-MS-GEC=${secMsGec}` +
    `&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}` +
    `&ConnectionId=${connId}`

  return new Promise<Buffer>((resolve, reject) => {
    // ── Guard: do not proceed if the caller already aborted ──
    if (signal.aborted) {
      reject(new Error("Synthesis aborted before start"))
      return
    }

    let settled = false

    // Helper to settle exactly once (prevents double-reject / resolve)
    const settle = (err: Error | null, result?: Buffer) => {
      if (settled) return
      settled = true
      clearTimeout(hardTimeout)
      signal.removeEventListener("abort", onAbort)
      // Give the socket a chance to close cleanly without blocking resolution.
      try { ws.close() } catch { /* ignore */ }
      if (err) reject(err)
      else resolve(result!)
    }

    // ── Abort-signal listener ──
    const onAbort = () => settle(new Error("TTS synthesis timed out"))
    signal.addEventListener("abort", onAbort, { once: true })

    // ── Safety hard-timeout (belt-and-suspenders) ──
    const hardTimeout = setTimeout(
      () => settle(new Error("TTS hard timeout")),
      ATTEMPT_TIMEOUT_MS + 2_000,
    )

    // ── Open WebSocket ──
    // perMessageDeflate: false → never calls bufferutil.mask
    // compress: false on every ws.send() call → same guarantee
    const ws = new WebSocket(url, {
      ...WS_OPTIONS,
      headers: {
        Pragma:                   "no-cache",
        "Cache-Control":           "no-cache",
        Origin:                   "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
        "Sec-WebSocket-Version":  "13",
        "User-Agent":              `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_MAJOR}.0.0.0 Safari/537.36 Edg/${CHROMIUM_MAJOR}.0.0.0`,
        "Accept-Encoding":        "gzip, deflate, br, zstd",
        "Accept-Language":        "en-US,en;q=0.9",
        Cookie:                   `muid=${generateMuid()};`,
      },
    })

    const audioChunks: Buffer[] = []

    // ── Message handler ──
    ws.on("message", (rawData: unknown, isBinary: boolean) => {
      if (!isBinary) {
        const text = Buffer.isBuffer(rawData)
          ? rawData.toString("utf8")
          : String(rawData)

        if (text.includes("Path:turn.end")) {
          settle(null, Buffer.concat(audioChunks))
        }
        // Surface service-side errors (e.g. quota / invalid voice)
        else if (text.includes("Path:response") && text.includes("\"code\":")) {
          settle(new Error(`Edge-TTS service error: ${text.slice(0, 300)}`))
        }
        return
      }

      const buf = rawData as Buffer
      const idx = buf.indexOf(AUDIO_SEP)
      if (idx >= 0) {
        audioChunks.push(buf.subarray(idx + AUDIO_SEP.length))
      }
    })

    // ── Error handler ──
    ws.on("error", (err: Error) => {
      settle(err)
    })

    // ── Unexpected close before turn.end ──
    ws.on("close", (code: number, reason: Buffer) => {
      if (!settled) {
        settle(new Error(`WebSocket closed unexpectedly (code ${code}: ${reason.toString()})`))
      }
    })

    // ── On open: send config then SSML ──
    ws.on("open", () => {
      const configMsg = buildConfigMsg()
      const ssmlMsg   = buildSsmlMsg(text, voice, rate, pitch)

      // compress: false — no bufferutil / zlib required
      ws.send(configMsg, { compress: false, binary: false }, (configErr) => {
        if (configErr) { settle(configErr); return }

        ws.send(ssmlMsg, { compress: false, binary: false }, (ssmlErr) => {
          if (ssmlErr) settle(ssmlErr)
        })
      })
    })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Retry wrapper — up to MAX_RETRIES attempts with individual AbortControllers
// ─────────────────────────────────────────────────────────────────────────────
async function edgeTTS(
  text:  string,
  voice: string  = "en-US-JennyNeural",
  rate:  string  = "-2%",
  pitch: string  = "+2Hz",
): Promise<Buffer> {
  let lastErr: Error = new Error("Unknown TTS error")

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS)

    try {
      const result = await synthesiseOnce(text, voice, rate, pitch, controller.signal)
      clearTimeout(timer)
      return result
    } catch (err: unknown) {
      clearTimeout(timer)
      lastErr = err instanceof Error ? err : new Error(String(err))
      console.warn(`[TTS] Attempt ${attempt} failed: ${lastErr.message}`)

      if (attempt <= MAX_RETRIES) {
        // Brief back-off before retry: 400 ms × attempt number
        await new Promise(r => setTimeout(r, 400 * attempt))
      }
    }
  }

  throw lastErr
}

// ─────────────────────────────────────────────────────────────────────────────
// API Route Handler
// Contract: POST { text: string, voice?: string } → audio/mpeg | JSON error
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { text, voice: requestedVoice } = body as { text?: unknown; voice?: unknown }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "text is required and must be a non-empty string" }, { status: 400 })
    }

    const clampedText = text.slice(0, 1_000)
    const voice       = typeof requestedVoice === "string" && requestedVoice.trim()
      ? requestedVoice.trim()
      : "en-US-JennyNeural"

    console.log("[TTS] Generating:", voice, "chars:", clampedText.length)
    const t0 = Date.now()

    const audioBuffer = await edgeTTS(clampedText, voice)

    console.log(`[TTS] ✅ Success: ${audioBuffer.length} bytes in ${Date.now() - t0}ms`)

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type":   "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control":  "public, max-age=86400, stale-while-revalidate=3600",
        "X-TTS-Voice":    voice,
        "X-TTS-Chars":    clampedText.length.toString(),
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[TTS] ❌ Error:", msg)
    return NextResponse.json({ error: "TTS synthesis failed", details: msg }, { status: 500 })
  }
}
