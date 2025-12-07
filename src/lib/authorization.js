export function canDeletePost(user, post) {
    if (user.role === "admin") {
        return {
            allowed: true,
            reason: "RBAC: Admin role",
            accessType: "RBAC",
        }
    }

    if (post.authorId === user.id) {
        return {
            allowed: true,
            reason: "ABAC: Ownership (author)",
            accessType: "ABAC_OWENERSHIP"
        }
    }

    if (user.role === "moderator" && post.reportCount >= 3) {
        return {
            allowed: true,
            reason: `ABAC: Moderator with ${post.reportCount} reports (threshold: 3)`,
            accessType: "ABAC_MODERATION"
        }
    }

    return {
        allowed: false,
        reason: "Access denied: No matching authorization rule",
        accessType: "DENIED"
    }
}