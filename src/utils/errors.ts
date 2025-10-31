import { config } from "../config/config";

export type ErrorCode =
    | "PACKET_UNKNOWN"
    | "NETWORK_DISCONNECTED"
    | "INVALID_REALM"
    | "INVITE_FAILED"
    | "INVALID_PROTOCOL"

export class AtomicError extends Error {
    readonly code: ErrorCode;
    readonly details?: Record<string, unknown>;

    constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
        super(`[${code}] ${message}`);
        this.name = "AtomicError";
        this.code = code;
        this.details = details;
        Error.captureStackTrace?.(this, AtomicError);
    }
}

export const Errors = {
    unknownPacket(details?: Record<string, unknown>) {
        return new AtomicError("PACKET_UNKNOWN", "Received unrecognized packet type.", details);
    },
    disconnected(reason?: string) {
        return new AtomicError("NETWORK_DISCONNECTED", reason ?? "Connection was lost.");
    },
    noRealm(code: number, text: string) {
        return new AtomicError("INVALID_REALM", `Unable to gather the realm's IP/PORT. (${code}:${text})`);
    },
    inviteFailed() {
        return new AtomicError("INVITE_FAILED", "Unable to accept realm invite.");
    },
    invalidProtocol(current: number | undefined) {
        return new AtomicError("INVALID_PROTOCOL", `Unsupported protocol version: ${current}. (Supported ${config.protocol})`)
    }
};
