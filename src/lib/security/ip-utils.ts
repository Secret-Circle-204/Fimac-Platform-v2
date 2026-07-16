interface RequestWithIP extends Request {
  ip?: string
}

/**
 * التحقق مما إذا كان عنوان الـ IP يقع ضمن النطاقات الخاصة أو المحلية
 */
export function isPrivateIP(ip: string): boolean {
  const cleanIp = ip.trim().toLowerCase()
  if (
    cleanIp === "::1" ||
    cleanIp === "127.0.0.1" ||
    cleanIp === "::ffff:127.0.0.1" ||
    cleanIp === "localhost" ||
    cleanIp === "unknown"
  ) {
    return true
  }

  // IPv6 link-local and unique local address ranges
  if (
    cleanIp.startsWith("fe80:") ||
    cleanIp.startsWith("fc00:") ||
    cleanIp.startsWith("fd00:")
  ) {
    return true
  }

  // IPv4-mapped private IPs (e.g. ::ffff:192.168.1.1)
  if (cleanIp.startsWith("::ffff:")) {
    const ipv4 = cleanIp.substring(7)
    return isPrivateIP(ipv4)
  }

  // 192.168.x.x
  if (cleanIp.startsWith("192.168.")) return true

  // 10.x.x.x
  if (cleanIp.startsWith("10.")) return true

  // 172.16.x.x - 172.31.x.x (فئة B الخاصة)
  const parts = cleanIp.split(".")
  if (parts.length === 4 && parts[0] === "172") {
    const secondOctet = parseInt(parts[1], 10)
    if (!isNaN(secondOctet) && secondOctet >= 16 && secondOctet <= 31) {
      return true
    }
  }

  return false
}

/**
 * استخراج عنوان الـ IP الفعلي للعميل من الترويسات المختلفة بناءً على الأولوية المطلوبة
 */
export function getClientIP(request: Request): string {
  const headers = request.headers

  // 1. ترويسة Cloudflare المفضلة للـ IP الحقيقي للعميل
  const cfConnectingIp = headers.get("cf-connecting-ip")
  if (cfConnectingIp && !isPrivateIP(cfConnectingIp)) {
    return cfConnectingIp.trim()
  }

  // 2. ترويسة True-Client-IP من Cloudflare/Akamai
  const trueClientIp = headers.get("true-client-ip")
  if (trueClientIp && !isPrivateIP(trueClientIp)) {
    return trueClientIp.trim()
  }

  // 3. ترويسة X-Real-IP القياسية للـ reverse proxies
  const xRealIp = headers.get("x-real-ip")
  if (xRealIp && !isPrivateIP(xRealIp)) {
    return xRealIp.trim()
  }

  // 4. ترويسة X-Forwarded-For التي تحتوي على سلسلة الـ IPs
  const xForwardedFor = headers.get("x-forwarded-for")
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim())
    // البحث عن أول IP عام (غير خاص) في السلسلة من اليسار لليمين
    for (const ip of ips) {
      if (!isPrivateIP(ip)) {
        return ip
      }
    }
  }

  // 5. ترويسات أخرى محتملة
  const xClientIp = headers.get("x-client-ip")
  if (xClientIp && !isPrivateIP(xClientIp)) {
    return xClientIp.trim()
  }

  // 6. الترويسات الخاصة بـ Vercel
  const vercelForwardedFor = headers.get("x-vercel-forwarded-for")
  if (vercelForwardedFor) {
    const ips = vercelForwardedFor.split(",").map((ip) => ip.trim())
    for (const ip of ips) {
      if (!isPrivateIP(ip)) {
        return ip
      }
    }
  }

  // 7. خيار الاحتياط النهائي: استخدام الـ IP المدمج في الطلب (إذا كان متاحاً في بيئة Next.js)
  const nextRequestIp = (request as RequestWithIP).ip
  if (nextRequestIp && !isPrivateIP(nextRequestIp)) {
    return nextRequestIp.trim()
  }

  // إذا لم نجد أي عنوان IP عام، نقوم بإرجاع أول قيمة متوفرة كخيار احتياط أخير
  const fallbackIp =
    cfConnectingIp ||
    trueClientIp ||
    xRealIp ||
    (xForwardedFor ? xForwardedFor.split(",")[0].trim() : null) ||
    xClientIp ||
    nextRequestIp ||
    "unknown"

  return fallbackIp.trim()
}
