# TrustLens AI Browser Extension

Lightweight browser extension that highlights scam-like language on the page, explains why it is risky, and routes deeper analysis to the TrustLens web app.

## Features
- Scam-like phrase highlighting with severity styling
- Hover tooltips with brief explanations
- Floating badge with detected signal count
- Popup summary with risk level and top phrases
- Analyze selected text from the context menu
- Toggle highlighting on and off

## Configuration
Set the web app URL in .env:

```
VITE_WEB_APP_URL="http://localhost:3000"
```

## Development
- Install: `bun install`
- Run (Chrome): `bun dev`
- Build: `bun run build`

## Usage
1. Visit a webpage with suspicious text.
2. TrustLens highlights risky phrases and shows a badge when signals are detected.
3. Hover highlights to see why a phrase is suspicious.
4. Open the popup for a summary, or analyze selected text via right-click.
5. Click Open Full Analysis to continue in the web app.
