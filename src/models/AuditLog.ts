// ConsoleCV - Audit Log Model (Bank-Level Security)
// Tracks all security-critical actions for compliance and forensics

import mongoose, { Schema, Document, Model } from "mongoose";

// =============================================================================
// AUDIT ACTION TYPES
// =============================================================================

export type AuditAction =
    | "USER_REGISTERED"
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "LOGOUT"
    | "PASSWORD_RESET_REQUESTED"
    | "PASSWORD_RESET_COMPLETED"
    | "PASSWORD_CHANGED"
    | "RESUME_CREATED"
    | "RESUME_UPDATED"
    | "RESUME_DELETED"
    | "RESUME_VIEWED"
    | "RESUME_EXPORTED"
    | "RATE_LIMIT_EXCEEDED"
    | "VALIDATION_FAILED"
    | "UNAUTHORIZED_ACCESS"
    | "SUSPICIOUS_ACTIVITY";

// =============================================================================
// AUDIT LOG INTERFACE
// =============================================================================

export interface IAuditLog extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId | null; // Null for unauthenticated actions
    action: AuditAction;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    details: {
        // Flexible object for action-specific data
        success?: boolean;
        reason?: string;
        resourceId?: string;
        resourceType?: string;
        previousValue?: string;
        newValue?: string;
        endpoint?: string;
        method?: string;
        [key: string]: unknown;
    };
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

// =============================================================================
// SCHEMA DEFINITION
// =============================================================================

const AuditLogSchema = new Schema<IAuditLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
            default: null,
        },
        action: {
            type: String,
            required: true,
            enum: [
                "USER_REGISTERED",
                "LOGIN_SUCCESS",
                "LOGIN_FAILED",
                "LOGOUT",
                "PASSWORD_RESET_REQUESTED",
                "PASSWORD_RESET_COMPLETED",
                "PASSWORD_CHANGED",
                "RESUME_CREATED",
                "RESUME_UPDATED",
                "RESUME_DELETED",
                "RESUME_VIEWED",
                "RESUME_EXPORTED",
                "RATE_LIMIT_EXCEEDED",
                "VALIDATION_FAILED",
                "UNAUTHORIZED_ACCESS",
                "SUSPICIOUS_ACTIVITY",
            ],
            index: true,
        },
        ipAddress: {
            type: String,
            required: true,
            index: true,
        },
        userAgent: {
            type: String,
            default: "Unknown",
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
        details: {
            type: Schema.Types.Mixed,
            default: {},
        },
        severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            default: "LOW",
            index: true,
        },
    },
    {
        // No timestamps needed, we have our own timestamp field
        timestamps: false,
        // Optimize for insert-heavy workload
        capped: {
            size: 104857600, // 100MB cap
            max: 100000, // Max 100k documents
        },
    }
);

// Compound indexes for common queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ ipAddress: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });

// =============================================================================
// STATIC METHODS
// =============================================================================

interface AuditLogModel extends Model<IAuditLog> {
    log(
        action: AuditAction,
        data: {
            userId?: string | null;
            ipAddress: string;
            userAgent?: string;
            details?: Record<string, unknown>;
            severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        }
    ): Promise<IAuditLog>;
    getRecentByUser(
        userId: string,
        limit?: number
    ): Promise<IAuditLog[]>;
    getRecentByIp(
        ipAddress: string,
        limit?: number
    ): Promise<IAuditLog[]>;
    getFailedLoginAttempts(
        ipAddress: string,
        withinMinutes?: number
    ): Promise<number>;
}

/**
 * Quick logging method
 */
AuditLogSchema.statics.log = async function (
    action: AuditAction,
    data: {
        userId?: string | null;
        ipAddress: string;
        userAgent?: string;
        details?: Record<string, unknown>;
        severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    }
): Promise<IAuditLog> {
    // Determine severity based on action if not provided
    let severity = data.severity;
    if (!severity) {
        switch (action) {
            case "LOGIN_FAILED":
            case "VALIDATION_FAILED":
                severity = "MEDIUM";
                break;
            case "RATE_LIMIT_EXCEEDED":
            case "UNAUTHORIZED_ACCESS":
                severity = "HIGH";
                break;
            case "SUSPICIOUS_ACTIVITY":
                severity = "CRITICAL";
                break;
            default:
                severity = "LOW";
        }
    }

    return this.create({
        userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : null,
        action,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent || "Unknown",
        details: data.details || {},
        severity,
        timestamp: new Date(),
    });
};

/**
 * Get recent audit logs for a user
 */
AuditLogSchema.statics.getRecentByUser = async function (
    userId: string,
    limit: number = 50
): Promise<IAuditLog[]> {
    return this.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
};

/**
 * Get recent audit logs for an IP
 */
AuditLogSchema.statics.getRecentByIp = async function (
    ipAddress: string,
    limit: number = 50
): Promise<IAuditLog[]> {
    return this.find({ ipAddress })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
};

/**
 * Count failed login attempts from an IP within a time window
 */
AuditLogSchema.statics.getFailedLoginAttempts = async function (
    ipAddress: string,
    withinMinutes: number = 15
): Promise<number> {
    const since = new Date(Date.now() - withinMinutes * 60 * 1000);
    return this.countDocuments({
        ipAddress,
        action: "LOGIN_FAILED",
        timestamp: { $gte: since },
    });
};

// =============================================================================
// MODEL EXPORT
// =============================================================================

// Handle the capped collection - create regular collection if capped fails
const AuditLogSchemaFallback = new Schema<IAuditLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
            default: null,
        },
        action: {
            type: String,
            required: true,
            enum: [
                "USER_REGISTERED",
                "LOGIN_SUCCESS",
                "LOGIN_FAILED",
                "LOGOUT",
                "PASSWORD_RESET_REQUESTED",
                "PASSWORD_RESET_COMPLETED",
                "PASSWORD_CHANGED",
                "RESUME_CREATED",
                "RESUME_UPDATED",
                "RESUME_DELETED",
                "RESUME_VIEWED",
                "RESUME_EXPORTED",
                "RATE_LIMIT_EXCEEDED",
                "VALIDATION_FAILED",
                "UNAUTHORIZED_ACCESS",
                "SUSPICIOUS_ACTIVITY",
            ],
            index: true,
        },
        ipAddress: {
            type: String,
            required: true,
            index: true,
        },
        userAgent: {
            type: String,
            default: "Unknown",
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
        details: {
            type: Schema.Types.Mixed,
            default: {},
        },
        severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            default: "LOW",
            index: true,
        },
    },
    { timestamps: false }
);

// Copy indexes to fallback schema
AuditLogSchemaFallback.index({ userId: 1, timestamp: -1 });
AuditLogSchemaFallback.index({ action: 1, timestamp: -1 });
AuditLogSchemaFallback.index({ ipAddress: 1, timestamp: -1 });
AuditLogSchemaFallback.index({ severity: 1, timestamp: -1 });

// Copy statics methods to fallback schema
AuditLogSchemaFallback.statics = AuditLogSchema.statics;

// Try to use the capped collection, fall back to regular if it fails
const AuditLog: AuditLogModel =
    (mongoose.models.AuditLog as AuditLogModel) ||
    mongoose.model<IAuditLog, AuditLogModel>("AuditLog", AuditLogSchemaFallback);

export default AuditLog;
