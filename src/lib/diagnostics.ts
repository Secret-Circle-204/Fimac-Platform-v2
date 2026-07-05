import type {
  CollectionBeforeChangeHook,
  CollectionAfterChangeHook,
  CollectionBeforeValidateHook,
  CollectionAfterReadHook,
  Access,
} from 'payload'

// --- 1. Concurrency Registry ---
const activeRequests = new Map<string, { startTime: number; count: number }>()

function trackConcurrency(docId: string | number): number {
  const idStr = String(docId)
  const existing = activeRequests.get(idStr) || { startTime: performance.now(), count: 0 }
  existing.count += 1
  activeRequests.set(idStr, existing)
  return existing.count
}

function releaseConcurrency(docId: string | number) {
  const idStr = String(docId)
  const existing = activeRequests.get(idStr)
  if (existing) {
    existing.count -= 1
    if (existing.count <= 0) {
      activeRequests.delete(idStr)
    } else {
      activeRequests.set(idStr, existing)
    }
  }
}

// --- 2. Diagnostic Log Formatter ---
interface LogContext {
  reqId: string
  docId: string
  phase: string
  method: string
  user: string
  depth: number
}

function printDiagnosticLog(ctx: LogContext, message: string, durationMs?: number) {
  const timestamp = new Date().toISOString()
  const durationStr = durationMs !== undefined ? `[${durationMs.toFixed(2)}ms]` : ''
  console.log(
    `[DIAGNOSTIC] ${timestamp} | Req: ${ctx.reqId} | Doc: ${ctx.docId} | Phase: ${ctx.phase} | User: ${ctx.user} | Depth: ${ctx.depth} ${durationStr} => ${message}`,
  )
}

// --- 3. Wrappers ---
export function measureBeforeValidate(
  hookName: string,
  hookFn?: CollectionBeforeValidateHook,
): CollectionBeforeValidateHook {
  return async (args) => {
    const t0 = performance.now()
    const reqId =
      (args.req as unknown as { id?: string })?.id || Math.random().toString(36).substring(7)
    const docId = args.data?.id || args.originalDoc?.id || 'new'
    const ctx: LogContext = {
      reqId: String(reqId),
      docId: String(docId),
      phase: `beforeValidate:${hookName}`,
      method: args.operation,
      user: args.req?.user ? `${args.req.user.email}` : 'anonymous',
      depth: args.req?.query?.depth ? Number(args.req.query.depth) : 1,
    }

    printDiagnosticLog(ctx, `Starting execution.`)
    try {
      if (hookFn) {
        return await hookFn(args)
      }
      return args.data
    } catch (err) {
      printDiagnosticLog(ctx, `ERROR: ${err instanceof Error ? err.message : 'Unknown'}`)
      throw err
    } finally {
      const t1 = performance.now()
      printDiagnosticLog(ctx, `Finished execution.`, t1 - t0)
    }
  }
}

export function measureBeforeChange(
  hookName: string,
  hookFn: CollectionBeforeChangeHook,
): CollectionBeforeChangeHook {
  return async (args) => {
    const t0 = performance.now()
    const reqId =
      (args.req as unknown as { id?: string })?.id || Math.random().toString(36).substring(7)
    const docId = args.data?.id || args.originalDoc?.id || 'new'
    const ctx: LogContext = {
      reqId: String(reqId),
      docId: String(docId),
      phase: `beforeChange:${hookName}`,
      method: args.operation,
      user: args.req?.user ? `${args.req.user.email}` : 'anonymous',
      depth: args.req?.query?.depth ? Number(args.req.query.depth) : 1,
    }

    if (docId !== 'new') {
      const concurrentCount = trackConcurrency(docId)
      if (concurrentCount > 1) {
        console.warn(
          `[CONCURRENCY DETECTED] OVERLAPPING PATCH FOR DOC: ${docId}. Active operations: ${concurrentCount}`,
        )
      }
    }

    printDiagnosticLog(ctx, `Starting execution.`)
    try {
      return await hookFn(args)
    } catch (err) {
      printDiagnosticLog(ctx, `ERROR: ${err instanceof Error ? err.message : 'Unknown'}`)
      throw err
    } finally {
      if (docId !== 'new') releaseConcurrency(docId)
      const t1 = performance.now()
      printDiagnosticLog(ctx, `Finished execution.`, t1 - t0)
    }
  }
}

export function measureAfterChange(
  hookName: string,
  hookFn?: CollectionAfterChangeHook,
): CollectionAfterChangeHook {
  return async (args) => {
    const t0 = performance.now()
    const reqId =
      (args.req as unknown as { id?: string })?.id || Math.random().toString(36).substring(7)
    const docId = args.doc?.id || 'unknown'
    const ctx: LogContext = {
      reqId: String(reqId),
      docId: String(docId),
      phase: `afterChange:${hookName}`,
      method: args.operation,
      user: args.req?.user ? `${args.req.user.email}` : 'anonymous',
      depth: args.req?.query?.depth ? Number(args.req.query.depth) : 1,
    }

    printDiagnosticLog(ctx, `Starting execution.`)
    try {
      if (hookFn) {
        await hookFn(args)
      }
      return args.doc
    } catch (err) {
      printDiagnosticLog(ctx, `ERROR: ${err instanceof Error ? err.message : 'Unknown'}`)
      throw err
    } finally {
      const t1 = performance.now()
      printDiagnosticLog(ctx, `Finished execution.`, t1 - t0)
    }
  }
}

export function measureAfterRead(
  hookName: string,
  hookFn: CollectionAfterReadHook,
): CollectionAfterReadHook {
  return async (args) => {
    const reqId =
      (args.req as unknown as { id?: string })?.id || Math.random().toString(36).substring(7)
    const docId = args.doc?.id || 'unknown'
    const depth = args.req?.query?.depth ? Number(args.req.query.depth) : 1

    // Throttle noisy afterRead logs unless depth is suspicious or it's slow
    const ctx: LogContext = {
      reqId: String(reqId),
      docId: String(docId),
      phase: `afterRead:${hookName}`,
      method: 'read',
      user: args.req?.user ? `${args.req.user.email}` : 'anonymous',
      depth,
    }

    try {
      const t0 = performance.now()
      const result = await hookFn(args)
      const duration = performance.now() - t0
      if (duration > 50 || depth > 2) {
        printDiagnosticLog(ctx, `Suspiciously slow or deep afterRead.`, duration)
      }
      return result
    } catch (err) {
      printDiagnosticLog(ctx, `ERROR: ${err instanceof Error ? err.message : 'Unknown'}`)
      throw err
    }
  }
}

export const diagnosticAccessWrapper = (accessName: string, accessFn: Access): Access => {
  return async (args) => {
    const t0 = performance.now()
    const reqId =
      (args.req as unknown as { id?: string })?.id || Math.random().toString(36).substring(7)
    const ctx: LogContext = {
      reqId: String(reqId),
      docId: args.id ? String(args.id) : 'unknown',
      phase: `access:${accessName}`,
      method: 'accessCheck',
      user: args.req?.user ? `${args.req.user.email}` : 'anonymous',
      depth: 1,
    }
    try {
      const result = await accessFn(args)
      // const t1 = performance.now()
      // printDiagnosticLog(ctx, `Access evaluation result: ${result}`, t1 - t0)
      return result
    } catch (err) {
      const t1 = performance.now()
      printDiagnosticLog(ctx, `ERROR evaluating access: ${err}`, t1 - t0)
      throw err
    }
  }
}
