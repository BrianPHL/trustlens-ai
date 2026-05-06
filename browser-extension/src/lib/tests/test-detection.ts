import { analyzeMessage } from "../analyzeMessage";

// Test the specific phrases from the demo scenario
const phrases = [
  "account will be suspended",
  "suspicious activity detected",
  "Verify your identity immediately",
  "bit.ly/gcash-secure-login",
  "Do not share this warning",
  "Enter your OTP to continue",
  "today due to suspicious activity",
];

console.log("=== INDIVIDUAL PHRASE TESTS ===");
for (const phrase of phrases) {
  const result = analyzeMessage(phrase);
  if (result.totalSignals > 0) {
    const cats = result.matches.map(m => `${m.category} (${m.severity})`).join(", ");
    console.log(`✅ "${phrase}" → ${cats}`);
  } else {
    console.log(`⚠️  "${phrase}" → not detected`);
  }
}

// Full demo text with isolation tactic
console.log("\n=== FULL DEMO TEXT (detailed) ===");
const fullText = `Your GCash account will be suspended today due to suspicious activity. Verify your identity immediately using this link: bit.ly/gcash-secure-login. Do not share this warning. Enter your OTP to continue.`;
const result = analyzeMessage(fullText);
console.log(`Risk: ${result.riskLevel} (${result.riskScore}/100)`);
console.log(`Signals: ${result.totalSignals}`);
console.log(`Categories: ${result.categories.join(", ")}`);
for (const m of result.matches) {
  console.log(`  [${m.severity}] "${m.matchedText}" → ${m.category}`);
}
