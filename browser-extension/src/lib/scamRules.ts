import type { DetectionCategory, DetectionSeverity } from "./types";

// ── Rule Definition ─────────────────────────────────────────────────

export type ScamRule = {
  readonly id: string;
  readonly category: DetectionCategory;
  readonly severity: DetectionSeverity;
  readonly label: string;
  readonly regex: RegExp;
  readonly baseScore: number;
};

// ── Scam Detection Rules ────────────────────────────────────────────
//
// All patterns use \b word boundaries and phrase-level / context-level
// matching to prevent false positives like "pin" in "Philippines".
//
// Rules are grouped by category.  Context-aware patterns (e.g. action
// verb + credential) are preferred over isolated keyword matches.
//

export const SCAM_RULES: readonly ScamRule[] = [
  // ── Account Threat ──────────────────────────────────────────────
  {
    id: "account-threat-suspended",
    category: "Account Threat",
    severity: "high",
    label: "Account suspension or lockout threat",
    regex:
      /\b(?:your\s+)?(?:account|wallet|profile|access|subscription)\s+(?:will\s+be|has\s+been|is|was)\s+(?:suspended|locked|disabled|deactivated|terminated|closed|compromised|restricted|on\s+hold|invalidated)\b/i,
    baseScore: 20,
  },
  {
    id: "account-threat-unauthorized",
    category: "Account Threat",
    severity: "high",
    label: "Unauthorized access warning",
    regex:
      /\b(?:unauthorized\s+(?:access|login|activity|transaction|charge)|suspicious\s+(?:activity|login|sign-in)\s+(?:detected|on\s+your|from\s+a\s+new\s+device)|someone\s+has\s+your\s+password)\b/i,
    baseScore: 20,
  },

  // ── Urgency Manipulation ────────────────────────────────────────
  {
    id: "urgency-verify-immediately",
    category: "Urgency Manipulation",
    severity: "high",
    label: "Pressuring immediate verification",
    regex:
      /\b(?:verify|confirm|validate|update)\b.{0,15}\b(?:immediately|right\s+now|urgently|asap|at\s+once)\b/i,
    baseScore: 15,
  },
  {
    id: "urgency-act-now",
    category: "Urgency Manipulation",
    severity: "medium",
    label: "Urgent action demand",
    regex:
      /\b(?:act\s+now|urgent\s+action\s+required|respond\s+(?:immediately|within\s+\d+\s*(?:hours?|minutes?|hrs?))|do\s+not\s+delay|limited\s+time\s+(?:only|offer|remaining)|today\s+only|expires?\s+(?:today|soon|in\s+\d+)|last\s+chance|final\s+notice|action\s+needed\s+immediately)\b/i,
    baseScore: 15,
  },
  {
    id: "urgency-within-hours",
    category: "Urgency Manipulation",
    severity: "medium",
    label: "Time-limited demand",
    regex:
      /\b(?:within\s+\d+\s*(?:hours?|minutes?|hrs?|days?))\b/i,
    baseScore: 15,
  },

  // ── Suspicious Link ─────────────────────────────────────────────
  {
    id: "suspicious-link-shortener",
    category: "Suspicious Link",
    severity: "high",
    label: "Shortened or suspicious link",
    regex:
      /\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|cutt\.ly|short\.link|ow\.ly|rb\.gy|tiny\.cc)\/\S+/i,
    baseScore: 25,
  },
  {
    id: "suspicious-link-login",
    category: "Suspicious Link",
    severity: "high",
    label: "Suspicious login/verification link",
    regex:
      /\b(?:(?:verify|login|confirm|secure|update)\s+(?:at|here|via|through|using)\s*:?\s*(?:https?:\/\/)?\S{4,})/i,
    baseScore: 25,
  },

  // ── Sensitive Information Request ───────────────────────────────
  // Context-aware: requires action verb near credential term
  {
    id: "sensitive-info-with-action",
    category: "Sensitive Information Request",
    severity: "high",
    label: "Request for sensitive credentials",
    regex:
      /\b(?:enter|send|share|provide|verify|submit|input|confirm|type|give|reply\s+with|text\s+me|message\s+us)\b[^.!?\n]{0,40}\b(?:PIN|OTP|one[\s-]?time\s+password|password|passcode|verification\s+code|security\s+code|CVV|card\s+number|account\s+number|SSN|social\s+security|backup\s+codes?)\b/i,
    baseScore: 30,
  },
  // Reverse order: credential then action verb
  {
    id: "sensitive-info-reverse",
    category: "Sensitive Information Request",
    severity: "high",
    label: "Credential followed by action request",
    regex:
      /\b(?:PIN|OTP|one[\s-]?time\s+password|password|passcode|verification\s+code|security\s+code|CVV|card\s+number|account\s+number)\b[^.!?\n]{0,40}\b(?:to\s+(?:continue|proceed|verify|confirm|complete|unlock)|is\s+required|needed)\b/i,
    baseScore: 30,
  },

  // ── Impersonation Cue ───────────────────────────────────────────
  {
    id: "impersonation-support",
    category: "Impersonation Cue",
    severity: "medium",
    label: "Impersonating official support",
    regex:
      /\b(?:(?:bank|official|customer|technical|security|fraud)\s+(?:support|service|team|department|center|helpdesk|hotline))\b/i,
    baseScore: 15,
  },
  {
    id: "impersonation-brand",
    category: "Impersonation Cue",
    severity: "medium",
    label: "Impersonating brand/platform",
    regex:
      /\b(?:GCash|PayPal|PayMaya|BDO|BPI|Metrobank|UnionBank|RCBC|LandBank|PNB|Globe|Smart|PLDT)\s+(?:support|security|team|alert|service|department|verification)\b/i,
    baseScore: 15,
  },
  {
    id: "impersonation-government",
    category: "Impersonation Cue",
    severity: "medium",
    label: "Impersonating government/authority",
    regex:
      /\b(?:government\s+(?:assistance|agency|verification)|(?:tax|revenue|customs)\s+(?:authority|office|department|bureau)|(?:official|authorized)\s+(?:notice|notification|letter|communication))\b/i,
    baseScore: 15,
  },

  // ── Isolation Tactic ────────────────────────────────────────────
  {
    id: "isolation-do-not-share",
    category: "Isolation Tactic",
    severity: "high",
    label: "Discouraging sharing/verification",
    regex:
      /\b(?:do\s+not\s+share|don'?t\s+share|dont\s+share)\s+(?:this|the|with\s+anyone)/i,
    baseScore: 20,
  },
  {
    id: "isolation-confidential",
    category: "Isolation Tactic",
    severity: "medium",
    label: "Enforced secrecy",
    regex:
      /\b(?:keep\s+this\s+(?:secret|confidential|private)|private\s+verification\s+only|for\s+your\s+eyes\s+only|do\s+not\s+(?:tell|call|contact)\s+anyone)\b/i,
    baseScore: 20,
  },

  // ── Payment Pressure ────────────────────────────────────────────
  {
    id: "payment-pressure-immediate",
    category: "Payment Pressure",
    severity: "high",
    label: "Immediate payment demand",
    regex:
      /\b(?:pay\s+(?:immediately|now|today|right\s+now)|send\s+(?:payment|money)|transfer\s+(?:now|immediately|the\s+(?:fee|amount|balance))|settlement\s+required|penalty\s+fee|unpaid\s+balance|payment\s+(?:required|due|overdue))\b/i,
    baseScore: 20,
  },
  {
    id: "payment-pressure-fee",
    category: "Payment Pressure",
    severity: "medium",
    label: "Suspicious fee request",
    regex:
      /\b(?:processing\s+fee|customs\s+clearance\s+(?:fee|charge)|redelivery\s+fee|handling\s+(?:fee|charge)|activation\s+fee|release\s+fee)\b/i,
    baseScore: 20,
  },

  // ── Prize / Reward Bait ─────────────────────────────────────────
  {
    id: "prize-congratulations",
    category: "Prize/Reward Bait",
    severity: "medium",
    label: "Fake congratulations message",
    regex:
      /\b(?:congratulations\s+you(?:'ve)?\s+(?:won|been\s+selected|been\s+chosen)|you(?:'ve)?\s+(?:won|been\s+selected\s+as))\b/i,
    baseScore: 15,
  },
  {
    id: "prize-claim-reward",
    category: "Prize/Reward Bait",
    severity: "medium",
    label: "Reward claim bait",
    regex:
      /\b(?:claim\s+your\s+(?:reward|prize|bonus|gift|winnings)|(?:free\s+cash|special\s+prize|selected\s+winner|lucky\s+winner|receive\s+(?:a\s+)?bonus))\b/i,
    baseScore: 15,
  },
  {
    id: "delivery-scam-issue",
    category: "Payment Pressure",
    severity: "high",
    label: "Fake delivery issue",
    regex:
      /\b(?:package|delivery|shipment|parcel|order)\b.{0,20}\b(?:failed|on\s+hold|pending|missed|cannot\s+be\s+delivered|requires\s+payment|unpaid\s+fee|redelivery\s+needed)\b/i,
    baseScore: 25,
  },
  {
    id: "prize-claim-urgency",
    category: "Prize/Reward Bait",
    severity: "high",
    label: "High-value prize claim",
    regex:
      /\b(?:won|claim)\b.{0,30}\b(?:\$|₱|€|£|coins?|cash|reward|tesla|iphone|macbook|gift\s+card)\b.{0,30}\b(?:immediately|asap|now|today)\b/i,
    baseScore: 25,
  },
  {
    id: "payment-pressure-invoice",
    category: "Payment Pressure",
    severity: "high",
    label: "Fake invoice or renewal notice",
    regex:
      /\b(?:invoice|receipt|renewal|subscription|order\s+confirmation)\b.{0,30}\b(?:attached|enclosed|auto-renew|charge|amount\s+due|payment\s+(?:confirmed|received|processed)|successfully\s+charged)\b/i,
    baseScore: 25,
  },
  {
    id: "account-help-center",
    category: "Impersonation Cue",
    severity: "medium",
    label: "Impersonating help center",
    regex:
      /\b(?:help\s+center|security\s+center|resolution\s+center|support\s+portal|case\s+(?:ID|number):?\s*\d+)\b/i,
    baseScore: 15,
  },
  {
    id: "impersonation-official-notice",
    category: "Impersonation Cue",
    severity: "high",
    label: "Urgent official notification",
    regex:
      /\b(?:official\s+notice|final\s+warning|mandatory\s+update|required\s+verification|important\s+security\s+alert)\b/i,
    baseScore: 25,
  },
];
