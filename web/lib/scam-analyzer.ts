// TrustLens AI — Centralized Scam Analysis Engine
// Provides percentage-based scoring, phrase-level detection, and explanations

export type RiskLevel = 'high' | 'medium' | 'low'
export type SignalSeverity = 'critical' | 'high' | 'medium' | 'low'
export type HighlightType = 'danger' | 'warning' | 'info' | 'normal'

export interface ScamSignal {
  id: string
  category: string
  label: string
  phrase: string
  severity: SignalSeverity
  explanation: string
  tip: string
  icon: string // Lucide icon name, e.g., 'ShieldAlert'
}

export interface TextSegment {
  text: string
  type: HighlightType
  signalId?: string
  isRedFlag: boolean
}

export interface PercentageBreakdown {
  safe: number
  suspicious: number
  scam: number
}

export interface AnalysisResult {
  riskLevel: RiskLevel
  riskScore: number
  percentages: PercentageBreakdown
  signals: ScamSignal[]
  segments: TextSegment[]
  explanation: string
  recommendedActions: { number: number; title: string; description: string }[]
  confidence: number
}

export interface Challenge {
  id: string
  title: string
  message: string
  difficulty: 'easy' | 'medium' | 'hard'
  platform: 'SMS' | 'Email' | 'Messaging App'
  precomputedAnalysis?: AnalysisResult
}

// Expand to 15+ varied scam challenges
export const CHALLENGES: Challenge[] = [
  {
    id: 'gcash-suspension',
    title: 'GCash Account Suspension',
    difficulty: 'easy',
    platform: 'SMS',
    message: "Your GCash account will be suspended today due to suspicious activity. Verify your identity immediately using this link: bit.ly/gcash-secure-login. Do not share this warning. Enter your OTP to continue."
  },
  {
    id: 'bdo-unauthorized',
    title: 'BDO Unauthorized Login',
    difficulty: 'medium',
    platform: 'SMS',
    message: "BDO Alert: We noticed an unauthorized login attempt from a new device. If this was not you, please secure your account immediately at secure-bdo-update.com/login and enter your OTP to freeze your account."
  },
  {
    id: 'shopee-prize',
    title: 'Shopee Anniversary Prize',
    difficulty: 'easy',
    platform: 'SMS',
    message: "Congratulations! You've been selected as our lucky winner for the Shopee 10.10 Anniversary! Claim your ₱50,000 cash prize now. Send a processing fee of ₱500 to this GCash number: 09123456789. Hurry, offer expires today!"
  },
  {
    id: 'maya-upgrade',
    title: 'Maya Account Upgrade',
    difficulty: 'medium',
    platform: 'SMS',
    message: "Maya Support: Your account requires a mandatory upgrade to comply with BSP regulations. Verify your identity right now to avoid deactivation. Click this link: maya-upgrade-portal.link and enter your PIN."
  },
  {
    id: 'philhealth-update',
    title: 'PhilHealth Info Update',
    difficulty: 'hard',
    platform: 'Email',
    message: "Dear Member, Your PhilHealth records indicate missing information. Failure to update within 24 hours will result in suspension of benefits. Please download the attached secure document or visit philhealth-verify.org to validate your credentials."
  },
  {
    id: 'lazada-delivery',
    title: 'Lazada Failed Delivery',
    difficulty: 'medium',
    platform: 'SMS',
    message: "Lazada Express: We attempted to deliver your parcel today but failed due to an incomplete address. To reschedule, please pay a small redelivery fee of ₱50 at lazada-parcel-tracking.com/reschedule. Urgent action required."
  },
  {
    id: 'job-offer',
    title: 'High-Paying Remote Job',
    difficulty: 'easy',
    platform: 'Messaging App',
    message: "Hello! I am a recruiter from a top agency. We have an urgent remote job opening for you. Earn ₱3000 to ₱5000 daily by simply rating videos online. No experience needed. Reply 'YES' and send ₱1000 for your initial training materials."
  },
  {
    id: 'romance-scam',
    title: 'Stranded Package',
    difficulty: 'hard',
    platform: 'Messaging App',
    message: "Honey, the luxury items I sent you from the US are stuck at customs in Manila. The agent said I need to pay a customs clearance fee of ₱15,000 right now or they will confiscate it. Can you send the money to this account? I will pay you back as soon as I arrive next week."
  },
  {
    id: 'crypto-investment',
    title: 'Guaranteed Crypto Returns',
    difficulty: 'medium',
    platform: 'Messaging App',
    message: "Want to double your money in 24 hours? Our AI-driven crypto trading bot guarantees a 200% daily return. Limited slots available! Send your investment to our VIP wallet address to start earning immediately. Guaranteed results or your money back."
  },
  {
    id: 'sss-loan',
    title: 'SSS Salary Loan Approval',
    difficulty: 'medium',
    platform: 'Email',
    message: "Good day. Your SSS Salary Loan application has been pre-approved for ₱40,000. To expedite the release of funds to your bank account, please pay the document processing fee of ₱800. Click here to process the payment: sss-loan-release.net."
  },
  {
    id: 'relative-emergency',
    title: 'Relative in Emergency',
    difficulty: 'medium',
    platform: 'SMS',
    message: "Ma/Pa, it's me. I lost my phone and I'm using a friend's number. I'm at the hospital right now, got into a minor accident. I need ₱5000 urgently for the clinic bills. Please send it to this GCash number ASAP. Don't call this number, just send."
  },
  {
    id: 'bpi-rewards',
    title: 'BPI Rewards Points Expiry',
    difficulty: 'medium',
    platform: 'SMS',
    message: "BPI Info: You have 8,500 unused BPI Rewards points that will expire today. Redeem them now for cash credits or vouchers. Log in to your account through bpi-rewards-redeem.com to claim before they are forfeited."
  },
  {
    id: 'globe-points',
    title: 'Globe Rewards Promo',
    difficulty: 'easy',
    platform: 'SMS',
    message: "Globe Alert: Congratulations! Your number was selected to receive 50GB free data and ₱1000 GCash. Click this link: bit.ly/globe-promo-2025 to claim your prize. Enter your phone number and the OTP sent to you."
  },
  {
    id: 'legit-bank',
    title: 'Legitimate Bank Alert (Safe)',
    difficulty: 'hard',
    platform: 'SMS',
    message: "BDO Alert: A withdrawal of PHP 2,000.00 was made from ATM on 05/04/2026. If unauthorized, call 8631-8000 immediately."
  },
  {
    id: 'legit-delivery',
    title: 'Legitimate Delivery (Safe)',
    difficulty: 'medium',
    platform: 'SMS',
    message: "Shopee Xpress: Your rider Juan is out for delivery today. Pls prepare EXACT amount of P350 for your COD order. Track your order at shopee.ph/app"
  }
];

// Provide original sample message for backward compatibility during refactor
export const SAMPLE_MESSAGE = CHALLENGES[0].message;

export function getRandomChallenge(): Challenge {
  const randomIndex = Math.floor(Math.random() * CHALLENGES.length);
  return CHALLENGES[randomIndex];
}

// Risk category definitions used in the "What TrustLens checks" panel
export const RISK_CATEGORIES = [
  { icon: 'Clock', label: 'Urgency manipulation', description: 'Pressure tactics forcing quick action' },
  { icon: 'Link2', label: 'Suspicious links', description: 'Shortened or fake URLs' },
  { icon: 'KeyRound', label: 'Sensitive info requests', description: 'Asking for OTP, password, or PIN' },
  { icon: 'ShieldAlert', label: 'Account threats', description: 'Fear tactics about losing access' },
  { icon: 'UserX', label: 'Impersonation cues', description: 'Pretending to be a trusted entity' },
  { icon: 'Gift', label: 'Prize or reward bait', description: 'Too-good-to-be-true offers' },
  { icon: 'CreditCard', label: 'Payment pressure', description: 'Demands for immediate upfront fees' },
  { icon: 'VolumeX', label: 'Isolation tactics', description: 'Discouraging you from seeking help' },
  { icon: 'AlertOctagon', label: 'Fear-based language', description: 'Language designed to cause panic' },
]

// Expanded Education Content (10 Categories)
export const EDUCATION_CONTENT = [
  {
    id: 'urgency',
    title: 'Urgency Manipulation',
    icon: 'Clock',
    description: 'Scammers create artificial time pressure to prevent you from thinking critically or verifying information through official channels.',
    examples: [
      '"Your account will be suspended in 24 hours"',
      '"Act now or lose access"',
      '"Immediate action required"'
    ],
    whatToDo: [
      'Pause and take a deep breath before responding',
      'Legitimate companies allow time for verification',
      'Contact the company directly through official channels'
    ]
  },
  {
    id: 'phishing-links',
    title: 'Phishing Links',
    icon: 'Link2',
    description: 'Shortened URLs or lookalike domains designed to mimic legitimate websites and steal your credentials when you log in.',
    examples: [
      '"bit.ly/secure-login"',
      '"gcash-verify.com" (not the real site)',
      '"Click here to verify: [suspicious link]"'
    ],
    whatToDo: [
      'Never click links in unsolicited messages',
      'Go directly to the official app or website',
      'Check the URL carefully for misspellings'
    ]
  },
  {
    id: 'otp-requests',
    title: 'OTP and Password Requests',
    icon: 'KeyRound',
    description: 'Fraudsters attempt to collect one-time passwords, PINs, or login credentials by impersonating legitimate services.',
    examples: [
      '"Enter your OTP to verify"',
      '"Share your PIN for account recovery"',
      '"Reply with your password to confirm"'
    ],
    whatToDo: [
      'Never share OTP, password, or PIN with anyone',
      'Legitimate services never ask for these via messages',
      'Report any message requesting credentials'
    ]
  },
  {
    id: 'prize-scams',
    title: 'Fake Prize or Reward Scams',
    icon: 'Gift',
    description: 'Messages claiming you have won a prize or reward, typically requiring a processing fee or personal info to claim.',
    examples: [
      '"Congratulations! You won ₱500,000!"',
      '"Claim your reward by sending ₱1,000 processing fee"',
      '"You are the lucky winner selected today"'
    ],
    whatToDo: [
      'You cannot win a contest you never entered',
      'Legitimate prizes never require upfront fees',
      'Verify any claims through official sources'
    ]
  },
  {
    id: 'account-threats',
    title: 'Account Suspension Threats',
    icon: 'ShieldAlert',
    description: 'Fear-based messages threatening to suspend, lock, or delete your account unless you take immediate action.',
    examples: [
      '"Your account will be permanently deleted"',
      '"Account suspended due to suspicious activity"',
      '"Verify now to prevent account closure"'
    ],
    whatToDo: [
      'Log in directly through the official app to check your account',
      'Contact customer support through verified channels',
      'Do not use links from the suspicious message'
    ]
  },
  {
    id: 'impersonation',
    title: 'Impersonation Scams',
    icon: 'UserX',
    description: 'Scammers pretend to be trusted entities like banks, government agencies, or known contacts to gain your trust.',
    examples: [
      '"This is GCash Support Team"',
      '"From: BDO Security Department"',
      '"Your friend sent you a message" (from unknown sender)'
    ],
    whatToDo: [
      'Verify sender identity through official channels',
      'Check the sender number against known official numbers',
      'Be skeptical of unsolicited messages from "officials"'
    ]
  },
  {
    id: 'payment-pressure',
    title: 'Payment Pressure & Advance Fees',
    icon: 'CreditCard',
    description: 'Tactics that pressure you into making immediate payments, often using threats or promises of a larger payout.',
    examples: [
      '"Pay now to avoid legal action"',
      '"Send ₱5,000 to unfreeze your account"',
      '"Transfer fee required within 1 hour"'
    ],
    whatToDo: [
      'Never send money based on an unsolicited message',
      'Legitimate organizations provide formal billing',
      'Verify payment requests through official channels'
    ]
  },
  {
    id: 'job-scams',
    title: 'Fake Job Offers',
    icon: 'Briefcase',
    description: 'Offers for easy, high-paying remote work that eventually ask you to pay for "training materials" or equipment.',
    examples: [
      '"Earn ₱5000/day by rating videos"',
      '"Urgent remote hiring, send ₱1000 for materials"',
      '"You have been selected for a VIP job position"'
    ],
    whatToDo: [
      'Legitimate jobs do not ask you to pay to work',
      'Research the company offering the job',
      'If it sounds too good to be true, it probably is'
    ]
  },
  {
    id: 'social-media-scams',
    title: 'Social Media & Romance Scams',
    icon: 'HeartCrack',
    description: 'Scammers building fake relationships online to eventually ask for money for "emergencies" or "customs fees".',
    examples: [
      '"My package is stuck at customs, please pay the fee"',
      '"I need money for an urgent medical emergency"',
      '"Invest in this crypto platform my friend runs"'
    ],
    whatToDo: [
      'Never send money to someone you have only met online',
      'Be wary of people who declare strong feelings quickly',
      'Reverse image search their profile photos'
    ]
  },
  {
    id: 'investment-scams',
    title: 'Investment & Crypto Scams',
    icon: 'TrendingDown',
    description: 'Promises of guaranteed, incredibly high returns on investments or cryptocurrency trading with zero risk.',
    examples: [
      '"Double your money in 24 hours"',
      '"Guaranteed 200% daily return on crypto"',
      '"Risk-free investment opportunity"'
    ],
    whatToDo: [
      'All investments carry risk; there are no guarantees',
      'Verify the investment platform with financial regulators',
      'Do not invest money you cannot afford to lose'
    ]
  }
]

// Analyzer function for arbitrary text input
export function analyzeMessage(text: string): AnalysisResult {
  if (!text.trim()) {
    return {
      riskLevel: 'low',
      riskScore: 0,
      percentages: { safe: 100, suspicious: 0, scam: 0 },
      signals: [],
      segments: [{ text, type: 'normal', isRedFlag: false }],
      explanation: 'No text to analyze.',
      recommendedActions: [],
      confidence: 0
    }
  }

  const lower = text.toLowerCase()
  const signals: ScamSignal[] = []
  let dangerScore = 0
  let warningScore = 0

  // Expanded Pattern matching
  const patterns: { test: (t: string) => boolean; signal: Omit<ScamSignal, 'phrase'>; phraseExtractor: (t: string) => string; dangerPoints: number; warningPoints: number }[] = [
    {
      test: (t) => /suspend|deactivat|lock|block|terminat|delet|freeze|closure|unauthorized login|disabled|compromised/i.test(t),
      signal: { id: 'account-threat', category: 'Account Threat', label: 'Account Suspension Threat', severity: 'critical', explanation: 'Threatening account suspension creates panic.', tip: 'Check your account through the official app.', icon: 'ShieldAlert' },
      phraseExtractor: (t) => (t.match(/(account\s+will\s+be\s+\w+|will\s+be\s+suspend|be\s+deactivat|permanently\s+\w+|freeze\s+your\s+account|unauthorized\s+login|account\s+is\s+disabled|account\s+compromised)/i)?.[0]) || 'account threat',
      dangerPoints: 15, warningPoints: 5
    },
    {
      test: (t) => /urgent|immediately|right now|act now|today|within \d|expire|hurry|asap/i.test(t),
      signal: { id: 'urgency', category: 'Urgency Manipulation', label: 'Urgency Pressure', severity: 'high', explanation: 'Creates artificial time pressure.', tip: 'Pause and verify through official channels.', icon: 'Clock' },
      phraseExtractor: (t) => (t.match(/(urgent|immediately|right now|act now|today|within \d+ \w+|expire\w*|hurry|asap)/i)?.[0]) || 'urgency',
      dangerPoints: 12, warningPoints: 8
    },
    {
      test: (t) => /bit\.ly|tinyurl|goo\.gl|t\.co|short\.link|click here|click this|link:|login at|portal\.link|\.com\/login/i.test(t),
      signal: { id: 'suspicious-link', category: 'Suspicious Link', label: 'Shortened/Suspicious URL', severity: 'critical', explanation: 'Shortened URLs hide the real destination.', tip: 'Never click links in unsolicited messages.', icon: 'Link2' },
      phraseExtractor: (t) => (t.match(/(bit\.ly\/\S+|tinyurl\.com\/\S+|https?:\/\/\S+|\S+\.link|\S+\.com\/\S+|click here|click this)/i)?.[0]) || 'suspicious link',
      dangerPoints: 18, warningPoints: 5
    },
    {
      test: (t) => /otp|password|pin|credential|cvv|card number|social security|credentials/i.test(t),
      signal: { id: 'sensitive-info', category: 'Sensitive Information Request', label: 'OTP/Credential Request', severity: 'critical', explanation: 'Requesting sensitive credentials.', tip: 'Never share OTP, password, or PIN.', icon: 'KeyRound' },
      phraseExtractor: (t) => (t.match(/(enter\s+your\s+otp|share\s+your\s+\w+|your\s+otp|your\s+password|your\s+pin|your\s+cvv|your\s+credentials)/i)?.[0]) || 'credential request',
      dangerPoints: 20, warningPoints: 5
    },
    {
      test: (t) => /verify your|confirm your|validate your|authenticate|secure your/i.test(t),
      signal: { id: 'verify-request', category: 'Verification Request', label: 'Identity Verification Request', severity: 'high', explanation: 'Unsolicited verification requests are common in phishing.', tip: 'Contact the company directly to verify.', icon: 'Zap' },
      phraseExtractor: (t) => (t.match(/(verify\s+your\s+\w+|confirm\s+your\s+\w+|validate\s+your\s+\w+|authenticate\s+\w*|secure\s+your\s+\w+)/i)?.[0]) || 'verify request',
      dangerPoints: 12, warningPoints: 6
    },
    {
      test: (t) => /do not share|don't tell|keep this secret|confidential|don't call/i.test(t),
      signal: { id: 'isolation', category: 'Isolation Tactic', label: 'Isolation Warning', severity: 'high', explanation: 'Preventing you from getting a second opinion.', tip: 'Always share suspicious messages with trusted people.', icon: 'VolumeX' },
      phraseExtractor: (t) => (t.match(/(do not share|don't tell|keep this secret|confidential|don't call)/i)?.[0]) || 'isolation tactic',
      dangerPoints: 10, warningPoints: 5
    },
    {
      test: (t) => /won|winner|prize|reward|congratulations|selected|lucky/i.test(t),
      signal: { id: 'prize-bait', category: 'Prize Bait', label: 'Prize/Reward Bait', severity: 'high', explanation: 'Too-good-to-be-true offers are a scam hallmark.', tip: 'You cannot win a contest you never entered.', icon: 'Gift' },
      phraseExtractor: (t) => (t.match(/(congratulations|you('ve)?\s+won|winner|you\s+are\s+selected|lucky\s+winner|prize)/i)?.[0]) || 'prize bait',
      dangerPoints: 15, warningPoints: 5
    },
    {
      test: (t) => /pay now|send money|transfer fee|processing fee|₱|p\d|payment required|customs clearance|redelivery fee|bills|clinic bills|hospital bills|loan application/i.test(t),
      signal: { id: 'payment-pressure', category: 'Payment Pressure', label: 'Payment Demand', severity: 'critical', explanation: 'Demanding immediate payment is a scam tactic.', tip: 'Never send money based on unsolicited messages.', icon: 'CreditCard' },
      phraseExtractor: (t) => (t.match(/(pay now|send\s+\S+\s+fee|processing fee|transfer fee|payment required|customs clearance|redelivery fee|send\s+₱\d+|₱\d+|P\d+|clinic\s+bills|hospital\s+bills|loan\s+application)/i)?.[0]) || 'payment pressure',
      dangerPoints: 18, warningPoints: 5
    },
    {
      test: (t) => /suspicious activity|unusual activity|unauthorized|security alert|security breach/i.test(t),
      signal: { id: 'fear-trigger', category: 'Fear Trigger', label: 'Fear-Based Language', severity: 'medium', explanation: 'Fear-based language triggers panic and clouded judgment.', tip: 'If there were real suspicious activity, your bank would use secure channels.', icon: 'AlertOctagon' },
      phraseExtractor: (t) => (t.match(/(suspicious activity|unusual activity|unauthorized\s+\w+|security alert|security breach)/i)?.[0]) || 'fear trigger',
      dangerPoints: 8, warningPoints: 8
    },
    {
      test: (t) => /guaranteed.*return|double your money|investment|earn.*daily|rating videos|remote job|recruiter/i.test(t),
      signal: { id: 'too-good-to-be-true', category: 'Unrealistic Promise', label: 'Too Good To Be True', severity: 'high', explanation: 'Promises of easy money or guaranteed returns are classic scam lures.', tip: 'If it sounds too good to be true, it is.', icon: 'TrendingUp' },
      phraseExtractor: (t) => (t.match(/(guaranteed\s+\w+\s+return|double your money|earn\s+₱\d+\s+(to|daily)|guaranteed|rating videos|remote job|recruiter)/i)?.[0]) || 'unrealistic promise',
      dangerPoints: 15, warningPoints: 5
    }
  ]

  for (const pattern of patterns) {
    if (pattern.test(lower)) {
      const phrase = pattern.phraseExtractor(text)
      signals.push({ ...pattern.signal, phrase })
      dangerScore += pattern.dangerPoints
      warningScore += pattern.warningPoints
    }
  }

  // Calculate percentages
  const totalRisk = Math.min(dangerScore + warningScore, 100)
  const scamPct = Math.min(Math.round(dangerScore * 0.8), 85)
  const suspiciousPct = Math.min(Math.round(warningScore * 0.6), 30)
  const safePct = Math.max(100 - scamPct - suspiciousPct, 0)

  // Determine risk level
  let riskLevel: RiskLevel = 'low'
  let riskScore = Math.min(totalRisk, 100)
  if (signals.length === 0) {
    riskScore = Math.max(5, Math.min(riskScore, 15))
  } else if (signals.length <= 2 && dangerScore < 20) {
    riskLevel = 'medium'
    riskScore = Math.max(35, Math.min(riskScore, 65))
  } else {
    riskLevel = 'high'
    riskScore = Math.max(70, Math.min(riskScore, 98))
  }

  // Build segments (simple approach — highlight matched phrases)
  let remaining = text
  const segments: TextSegment[] = []
  
  if (signals.length > 0) {
    // Sort signal phrases by their position in text
    const phrasePositions = signals
      .map(s => ({ signal: s, index: lower.indexOf(s.phrase.toLowerCase()) }))
      .filter(p => p.index >= 0)
      .sort((a, b) => a.index - b.index)

    let cursor = 0
    for (const pp of phrasePositions) {
      if (pp.index > cursor) {
        segments.push({ text: text.substring(cursor, pp.index), type: 'normal', isRedFlag: false })
      }
      if (pp.index >= cursor) {
        // Prevent overlapping highlights by checking cursor position strictly
        const segmentText = text.substring(pp.index, pp.index + pp.signal.phrase.length)
        if(segmentText.length > 0) {
          segments.push({
            text: segmentText,
            type: pp.signal.severity === 'critical' || pp.signal.severity === 'high' ? 'danger' : 'warning',
            signalId: pp.signal.id,
            isRedFlag: true
          })
          cursor = pp.index + pp.signal.phrase.length
        }
      }
    }
    if (cursor < text.length) {
      segments.push({ text: text.substring(cursor), type: 'normal', isRedFlag: false })
    }
  } else {
    segments.push({ text, type: 'normal', isRedFlag: false })
  }

  const explanations: Record<RiskLevel, string> = {
    high: `This message exhibits ${signals.length} distinct scam indicators. It uses a combination of manipulation tactics consistent with phishing attacks. Do NOT interact with it or click any links.`,
    medium: `This message contains ${signals.length} suspicious element${signals.length > 1 ? 's' : ''}. We recommend verifying the sender through official channels before taking any action.`,
    low: 'This message appears relatively safe, but always stay vigilant and verify any unexpected requests through official channels.'
  }

  return {
    riskLevel,
    riskScore,
    percentages: signals.length === 0 
      ? { safe: 92, suspicious: 5, scam: 3 }
      : { safe: safePct, suspicious: suspiciousPct, scam: scamPct },
    signals,
    segments,
    explanation: explanations[riskLevel],
    confidence: signals.length === 0 ? 45 : Math.min(70 + signals.length * 4, 98),
    recommendedActions: signals.length === 0 
      ? [{ number: 1, title: 'Stay vigilant', description: 'Always verify unexpected requests through official channels.' }]
      : [
          { number: 1, title: 'Do not click any links', description: 'Links may lead to fake pages designed to steal your credentials.' },
          { number: 2, title: 'Do not share OTP, password, or PIN', description: 'Legitimate services never ask for these via unsolicited messages.' },
          { number: 3, title: 'Verify through official channels', description: 'Open the official app directly or visit the official website.' },
          { number: 4, title: 'Report and block the sender', description: 'Help protect others by reporting this to your carrier.' }
        ]
  }
}

export function mapExtensionAnalysis(text: string, extAnalysis: any, source?: string): AnalysisResult {
  const signals = (extAnalysis.matches || []).map((m: any) => {
    let icon = 'ShieldAlert';
    const cat = (m.category || '').toLowerCase();
    if (cat.includes('urgency')) icon = 'Clock';
    else if (cat.includes('link')) icon = 'Link2';
    else if (cat.includes('information') || cat.includes('otp')) icon = 'KeyRound';
    else if (cat.includes('account')) icon = 'ShieldAlert';
    else if (cat.includes('impersonation')) icon = 'UserX';
    else if (cat.includes('prize') || cat.includes('reward')) icon = 'Gift';
    else if (cat.includes('payment')) icon = 'CreditCard';
    else if (cat.includes('isolation')) icon = 'VolumeX';

    return {
      id: m.id || Math.random().toString(),
      category: m.category || 'Unknown',
      label: m.category || 'Unknown',
      phrase: m.matchedText || '',
      severity: m.severity === 'high' ? 'critical' : (m.severity === 'medium' ? 'high' : 'medium'),
      explanation: m.explanation || m.category,
      tip: m.tip || 'Proceed with caution.',
      icon
    };
  });

  const segments: TextSegment[] = [];
  if (signals.length > 0) {
    const phrasePositions = (extAnalysis.matches || [])
      .map((m: any, idx: number) => {
        let start = -1;
        let end = -1;
        if (m.matchedText) {
          const matchStr = m.matchedText.toLowerCase();
          const fullStr = text.toLowerCase();
          const foundIdx = fullStr.indexOf(matchStr);
          if (foundIdx !== -1) {
            start = foundIdx;
            end = foundIdx + m.matchedText.length;
          }
        }
        return { signal: signals[idx], start, end };
      })
      .filter((p: any) => p.start !== -1)
      .sort((a: any, b: any) => a.start - b.start);

    let cursor = 0;

    for (let i = 0; i < phrasePositions.length; i++) {
      const pp = phrasePositions[i];
      if (pp.start > cursor) {
        segments.push({ text: text.substring(cursor, pp.start), type: 'normal', isRedFlag: false });
      }
      if (pp.start >= cursor) {
        const segmentText = text.substring(pp.start, pp.end);
        if (segmentText.length > 0) {
          segments.push({
            text: segmentText,
            type: pp.signal.severity === 'critical' || pp.signal.severity === 'high' ? 'danger' : 'warning',
            signalId: pp.signal.id,
            isRedFlag: true
          });
          cursor = pp.end;
        }
      }
    }
    if (cursor < text.length) {
      segments.push({ text: text.substring(cursor), type: 'normal', isRedFlag: false });
    }
  } else {
    segments.push({ text, type: 'normal', isRedFlag: false });
  }

  let scamPct = 0;
  let susPct = 0;
  let safePct = 100;

  if (extAnalysis.riskLevel === 'high') {
    scamPct = Math.min(extAnalysis.riskScore, 85);
    susPct = Math.min(100 - scamPct, 15);
    safePct = Math.max(0, 100 - scamPct - susPct);
  } else if (extAnalysis.riskLevel === 'medium') {
    scamPct = Math.floor(extAnalysis.riskScore * 0.4);
    susPct = Math.floor(extAnalysis.riskScore * 0.5);
    safePct = Math.max(0, 100 - scamPct - susPct);
  } else {
    scamPct = 3;
    susPct = 5;
    safePct = 92;
  }

  return {
    riskLevel: extAnalysis.riskLevel || 'low',
    riskScore: extAnalysis.riskScore || 0,
    percentages: { safe: safePct, suspicious: susPct, scam: scamPct },
    signals,
    segments,
    explanation: extAnalysis.summary || (extAnalysis.riskLevel === 'high' ? 'High risk message detected.' : 'Message analyzed.'),
    confidence: signals.length === 0 ? 45 : Math.min(70 + signals.length * 4, 98),
    recommendedActions: signals.length === 0 
      ? [{ number: 1, title: 'Stay vigilant', description: 'Always verify unexpected requests through official channels.' }]
      : [
          { number: 1, title: 'Do not click any links', description: 'Links may lead to fake pages designed to steal your credentials.' },
          { number: 2, title: 'Do not share OTP, password, or PIN', description: 'Legitimate services never ask for these via unsolicited messages.' },
          { number: 3, title: 'Verify through official channels', description: 'Open the official app directly or visit the official website.' },
          { number: 4, title: 'Report and block the sender', description: 'Help protect others by reporting this to your carrier.' }
        ]
  };
}

// Pre-compute analysis for the first challenge to use as SAMPLE_ANALYSIS
export const SAMPLE_ANALYSIS = analyzeMessage(CHALLENGES[0].message);
export const SAMPLE_SEGMENTS = SAMPLE_ANALYSIS.segments;
export const SAMPLE_SIGNALS = SAMPLE_ANALYSIS.signals;
