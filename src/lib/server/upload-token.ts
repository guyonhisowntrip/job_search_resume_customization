import { createHmac, timingSafeEqual } from "crypto"
import { deflateRawSync, inflateRawSync } from "zlib"

import { getServerConfig } from "@/lib/server/config"

const TOKEN_VERSION = "v1"
const UPLOAD_TOKEN_TTL_SECONDS = 10 * 60

type UploadTokenPayload = {
  text: string
  exp: number
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url")
}

export function createUploadId(text: string): string {
  if (!text.trim()) {
    throw new Error("Extracted resume text is empty")
  }

  const payload: UploadTokenPayload = {
    text,
    exp: Math.floor(Date.now() / 1000) + UPLOAD_TOKEN_TTL_SECONDS,
  }

  const payloadJson = JSON.stringify(payload)
  const compressed = deflateRawSync(Buffer.from(payloadJson, "utf8"))
  const encodedPayload = compressed.toString("base64url")
  const signature = signPayload(encodedPayload, getServerConfig().uploadTokenSecret)

  return `${TOKEN_VERSION}.${encodedPayload}.${signature}`
}

export function readUploadId(uploadId: string): string {
  const [version, encodedPayload, providedSignature] = uploadId.split(".")
  if (!version || !encodedPayload || !providedSignature || version !== TOKEN_VERSION) {
    throw new Error("Invalid upload token")
  }

  const expectedSignature = signPayload(encodedPayload, getServerConfig().uploadTokenSecret)
  const providedBuffer = Buffer.from(providedSignature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    throw new Error("Upload token signature mismatch")
  }

  let payload: UploadTokenPayload

  try {
    const compressed = Buffer.from(encodedPayload, "base64url")
    const payloadJson = inflateRawSync(compressed).toString("utf8")
    payload = JSON.parse(payloadJson) as UploadTokenPayload
  } catch {
    throw new Error("Upload token payload is invalid")
  }

  if (!payload || typeof payload.text !== "string" || typeof payload.exp !== "number") {
    throw new Error("Upload token payload shape is invalid")
  }

  if (Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error("Upload token expired")
  }

  return payload.text
}
