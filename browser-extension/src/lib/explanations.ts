import type { DetectionCategory } from "./types";

type CategoryInfo = {
  readonly explanation: string;
  readonly tip: string;
};

export const CATEGORY_EXPLANATIONS: Record<DetectionCategory, CategoryInfo> = {
  "Urgency Manipulation": {
    explanation:
      "Scammers often create urgency to pressure users into acting quickly before verifying the message.",
    tip: "Pause before clicking or responding. Verify through the official website, app, or hotline.",
  },
  "Suspicious Link": {
    explanation:
      "Suspicious or shortened links can hide the real destination and may lead to phishing pages.",
    tip: "Do not click unfamiliar links. Visit the official website manually instead.",
  },
  "Sensitive Information Request": {
    explanation:
      "Legitimate services should not ask for OTPs, passwords, PINs, or verification codes through random messages or pages.",
    tip: "Never share OTPs, passwords, PINs, CVVs, or verification codes.",
  },
  "Account Threat": {
    explanation:
      "Scammers often threaten account suspension or locking to scare users into acting immediately.",
    tip: "Check your account status through the official app or website.",
  },
  "Impersonation Cue": {
    explanation:
      "Scammers may pretend to be banks, platforms, couriers, or support teams to gain trust.",
    tip: "Verify the sender through official contact channels.",
  },
  "Isolation Tactic": {
    explanation:
      "Scammers may tell users not to share the message so others cannot warn them.",
    tip: "Ask a trusted person or contact official support before taking action.",
  },
  "Payment Pressure": {
    explanation:
      "Unexpected payment demands or penalty threats can be used to pressure victims into sending money.",
    tip: "Verify the transaction or balance directly through official services.",
  },
  "Prize/Reward Bait": {
    explanation:
      "Fake rewards are used to lure users into clicking links, paying fees, or sharing personal information.",
    tip: "Do not claim rewards through suspicious links. Verify promos from official channels.",
  },
};
