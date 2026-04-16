const https = require('https');
const fs = require('fs');
const { marked } = require('./backend/node_modules/marked/lib/marked.cjs');
const TOKEN = fs.readFileSync('C:/Users/User/AppData/Local/Temp/token.txt', 'utf8').trim();

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.bigtrust.site',
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Length': Buffer.byteLength(data),
      }
    };
    const req = https.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve({error: d}); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// TSMC 포스트 - 본문 이미지 URL 업데이트 (안정적인 형식)
const tsmc_md = `## TSMC Q1 2024 Earnings: Record Revenue Driven by AI Chip Demand

Taiwan Semiconductor Manufacturing Company (TSMC), the world's largest contract chipmaker, reported record Q1 2024 revenue on April 18, 2024, fueled by explosive demand for AI inference and training chips from hyperscalers.

*Sources: TSMC Investor Relations, Bloomberg, FactSet*

## Key Financial Metrics (as of April 18, 2024)

| Metric | Q1 2024 | QoQ Change | YoY Change |
|--------|---------|------------|------------|
| Revenue (TWD) | NT$686.7B | +47.2% | +9.5% |
| Gross Margin | 57.9% | +1,550 bps | +390 bps |
| Operating Margin | 43.6% | +2,050 bps | +520 bps |
| EPS (TWD) | NT$2.90 | +53.5% | +9.8% |

## The AI Catalyst

TSMC's record quarter is driven by **artificial intelligence infrastructure**. Hyperscalers (Microsoft, Google, Meta, Amazon) are racing to deploy AI training clusters, and TSMC's advanced process nodes (N3, N5) are essential.

When TSMC's margins expand 200+ basis points sequentially, it signals customers are paying premium prices for leading-edge AI chips. This is a structural shift in semiconductor demand driven by trillion-dollar AI infrastructure investments.

![TSMC semiconductor manufacturing fab with advanced chip production equipment](https://images.unsplash.com/photo-1535905557558-afc4877a26fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80)

## The Product Mix: AI Dominance

Management commentary revealed:
- **AI-related products** (GPUs, training accelerators, inference chips) now account for a "significant and growing" portion of platform revenues
- Smartphone and consumer chips remain stable but are no longer primary growth drivers
- Data center and AI represent fastest-growing segments at **30%+ growth sequentially**

### Segment Breakdown

**Platform Revenue** grew 52% QoQ:
1. **Data Center / AI** — explosive growth from NVIDIA GPUs using TSMC's N3/N4 process
2. **Smartphones** — stable demand from Apple, Qualcomm
3. **IoT & Automotive** — steady mid-single-digit growth

## TSMC's Advanced Node Dominance

TSMC maintains an unassailable lead:

- **N3 process** (3nm): Apple A18, NVIDIA Blackwell, AMD Ryzen 9000 all use N3
- **N4 process** (4nm): High-volume production; NVIDIA H100/H200 GPUs manufactured here
- **Roadmap**: N2 (2nm) in risk production; N1.6 (1.6nm) in research

**Competitive moat:** Samsung's 3nm is years behind in yields and cost. Intel's gap has widened. TSMC's advantage is durable.

## Forward Guidance

TSMC Q2 2024 guidance: NT$700–730B revenue (flat to +3% QoQ), ~57% gross margin, ~42% operating margin.

Management is cautiously optimistic on AI demand but acknowledged macro headwinds. To maintain leadership, TSMC plans $25B+ annual capex through 2026.

## Risk Factors

- **Geopolitical risk**: Taiwan/China tensions; US CHIPS Act incentivizes US manufacturing
- **Capex intensity**: $25B+ annual capex unsustainable long-term without revenue growth
- **Customer concentration**: NVIDIA represents >25% of revenues
- **Cyclical risk**: AI spending could moderate in 2025 if hyperscalers reach saturation

## Investment Outlook

TSMC is the essential infrastructure play in the AI era. Q1 results confirm AI demand is real, growing, and pricing at premium levels.

**However, valuation matters.** TSMC trades at ~25x forward P/E. The margin expansion seen in Q1 may not persist if capex needs force gross margin compression in 2025–2026.

For investors: TSMC is a core holding for those bullish on AI infrastructure. Dollar-cost average over 12 months. Monitor quarterly gross margin trends closely.

> **Disclaimer**: This content is for informational purposes only and was produced with AI assistance. It does not constitute financial advice. All investment decisions carry risk and are solely your own responsibility. TSMC trades as TSM ADR on NYSE and is subject to currency and geopolitical risk.`;

async function run() {
  const updateData = {
    content_md: tsmc_md,
    content_html: marked(tsmc_md)
  };

  console.log('Updating TSMC Q1 2024 - body image URL...');
  console.log('New image URL (stable format):');
  console.log('https://images.unsplash.com/photo-1535905557558-afc4877a26fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80\n');

  try {
    const result = await apiRequest('PUT', '/api/posts/3a2da41e-2157-4a92-a708-7e74cb14e94b', updateData);
    if (result.id) {
      console.log(`✅ Updated - ID: ${result.id.substring(0, 8)}`);
      console.log('✅ Body image now uses stable URL format');
    } else {
      console.log(`❌ Error: ${JSON.stringify(result).substring(0, 300)}`);
    }
  } catch (e) {
    console.log(`❌ Request failed: ${e.message}`);
  }
}

run();
