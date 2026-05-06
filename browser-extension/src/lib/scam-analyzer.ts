export type SignalSeverity = "low" | "medium" | "high";
export type RiskLevel = "low" | "medium" | "high";

export type ScamSignal = {
  readonly id: string;
  readonly category: string;
  readonly label: string;
  readonly phrase: string;
  readonly severity: SignalSeverity;
  readonly explanation: string;
};

type SignalPattern = Omit<ScamSignal, "phrase"> & {
  readonly regex: RegExp;
};

export type SignalMatch = {
  readonly start: number;
  readonly end: number;
  readonly phrase: string;
  readonly pattern: SignalPattern;
};

const SIGNAL_PATTERNS: readonly SignalPattern[] = [
  {
    id: "account-threat",
    category: "Account Threat",
    label: "Account suspension or lockout",
    severity: "high",
    explanation: "Threatening account actions is used to create panic.",
    regex:
      /account\s+will\s+be\s+(suspended|locked|disabled|deactivated|terminated)|account\s+(suspended|locked|disabled|deactivated)|account\s+compromised|unauthorized\s+login/i,
  },
  {
    id: "urgency",
    category: "Urgency Manipulation",
    label: "Pressure to act quickly",
    severity: "medium",
    explanation: "Urgent language pushes you to act without verifying.",
    regex: /urgent|immediately|right\s+now|act\s+now|today|within\s+\d+|expire|hurry|asap|limited\s+time/i,
  },
  {
    id: "suspicious-link",
    category: "Suspicious Link",
    label: "Shortened or suspicious link",
    severity: "high",
    explanation: "Shortened links can hide dangerous destinations.",
    regex:
      /bit\.ly\/\S+|tinyurl\.com\/\S+|t\.co\/\S+|goo\.gl\/\S+|short\.link\/\S+|click\s+here|click\s+this|login\s+at\s+\S+|verify\s+at\s+\S+|\w+\.com\/login/i,
  },
  {
    id: "sensitive-info",
    category: "Sensitive Information Request",
    label: "OTP or credential request",
    severity: "high",
    explanation: "Legitimate services do not ask for OTPs or passwords here.",
    regex:
      /otp|one\s*time\s+password|verification\s+code|password|pin|credential|cvv|card\s+number/i,
  },
  {
    id: "impersonation",
    category: "Impersonation Cue",
    label: "Pretending to be official",
    severity: "low",
    explanation: "Scammers impersonate trusted brands to gain trust.",
    regex:
      /support\s+team|security\s+team|customer\s+service|official\s+notice|bank\s+alert|gcash\s+support|bdo\s+alert/i,
  },
  {
    id: "isolation",
    category: "Isolation Tactic",
    label: "Discouraging verification",
    severity: "medium",
    explanation: "Discouraging you from sharing prevents a second opinion.",
    regex:
      /do\s+not\s+share|don't\s+share|dont\s+share|keep\s+this\s+secret|confidential|do\s+not\s+call|don't\s+call|dont\s+call/i,
  },
  {
    id: "payment-pressure",
    category: "Payment Pressure",
    label: "Request for immediate payment",
    severity: "high",
    explanation: "Urgent payment requests are common scam tactics.",
    regex:
      /pay\s+now|send\s+money|transfer\s+fee|processing\s+fee|payment\s+required|customs\s+clearance|redelivery\s+fee|clinic\s+bills|hospital\s+bills/i,
  },
  {
    id: "prize-bait",
    category: "Prize/Reward Bait",
    label: "Too-good-to-be-true rewards",
    severity: "medium",
    explanation: "Unexpected prizes often hide fraud.",
    regex:
      /congratulations|you('ve)?\s+won|winner|selected|lucky\s+winner|claim\s+your\s+prize|reward/i,
  },
];

const severityWeight: Record<SignalSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export const getSignalMatches = (text: string): SignalMatch[] => {
  const matches: SignalMatch[] = [];

  for (const pattern of SIGNAL_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, "gi");
    for (const match of text.matchAll(regex)) {
      if (match.index === undefined || !match[0]) {
        continue;
      }
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        phrase: match[0],
        pattern,
      });
    }
  }

  return matches;
};

export const analyzeText = (text: string) => {
  const matches = getSignalMatches(text);
  const uniqueSignals = new Map<string, ScamSignal>();

  for (const match of matches) {
    const key = `${match.pattern.id}:${match.phrase.toLowerCase()}`;
    if (!uniqueSignals.has(key)) {
      uniqueSignals.set(key, {
        id: match.pattern.id,
        category: match.pattern.category,
        label: match.pattern.label,
        phrase: match.phrase,
        severity: match.pattern.severity,
        explanation: match.pattern.explanation,
      });
    }
  }

  const score = matches.reduce(
    (sum, match) => sum + severityWeight[match.pattern.severity],
    0,
  );

  let riskLevel: RiskLevel = "low";
  if (score >= 8 || matches.length >= 6) {
    riskLevel = "high";
  } else if (score >= 4 || matches.length >= 3) {
    riskLevel = "medium";
  }

  const riskScore = Math.min(100, score * 12 + matches.length * 4);

  return {
    riskLevel,
    riskScore,
    signals: Array.from(uniqueSignals.values()),
    totalMatches: matches.length,
  };
};
