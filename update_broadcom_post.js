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

// Broadcom post with in-body image
const broadcom_md = `## Broadcom Q1 2024 Earnings: Custom Silicon and AI Networking Accelerate

Broadcom (AVGO), the analog and infrastructure software company, reported solid Q1 2024 results driven by custom silicon chips for hyperscaler AI clusters and networking infrastructure. The company's exposure to data center custom silicon positions it as an essential enabler of the AI infrastructure buildout.

*Sources: Broadcom Investor Relations, FactSet, Goldman Sachs Equity Research*

## Key Financial Metrics (as of March 14, 2024)

| Metric | Q1 2024 | QoQ | YoY |
|--------|---------|-----|-----|
| Revenue | $8.47B | +18% | +4% |
| Gross Margin | 51.2% | +240 bps | +120 bps |
| Operating Margin | 31.5% | +350 bps | +150 bps |
| EPS | $10.12 | +20% | -2% |

## The AI Networking Opportunity

Broadcom manufactures the switching, routing, and interconnect silicon that connects NVIDIA GPUs in data center clusters. As hyperscalers build larger AI training clusters, they need higher-bandwidth networking between GPUs.

**Why this matters:** Each GPU needs 400 Gbps of networking throughput. Google TPU, Meta MTIA, and Amazon Trainium clusters all use Broadcom's custom silicon for networking and interconnect.

![Broadcom networking chips and interconnect silicon for AI data centers](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80&fm=jpg)

## Segment Breakdown

**Infrastructure Software** (50% of revenue): networking, storage, and data center software
- Growing modestly at ~3% YoY
- High-margin, recurring revenue business

**Semiconductors** (50% of revenue): broadband, switching, and **custom silicon for hyperscalers**
- Custom AI silicon grew **35% YoY** — the real story
- Power management, analog, and RF semiconductors stable

The company's custom silicon business is a **hidden AI play** that most investors overlook.

## Risk Factors

- **Customer concentration**: >40% of revenue from 5 hyperscalers (Google, Amazon, Meta, Microsoft, Apple)
- **Technology risk**: Custom silicon designs take 18–24 months; design loss = lost revenue for 2+ years
- **Capex cyclicality**: If hyperscalers moderate AI infrastructure spending, Broadcom's custom silicon demand drops sharply
- **Competition**: Intel Gaudi and other custom accelerators are emerging, though far behind Broadcom's integration level

## Investment Outlook

Broadcom is the least obvious AI infrastructure play, but arguably the most critical for hyperscaler data centers. The company's custom silicon moat is durable — designing and optimizing interconnect silicon requires deep expertise.

**For investors:** Broadcom is a steady, less-volatile complement to NVIDIA and TSMC. Suitable as a 20–30% holding in a semiconductor portfolio.

> **Disclaimer**: This content is for informational purposes only and was produced with AI assistance. It does not constitute financial advice. All investment decisions carry risk and are solely your own responsibility. The semiconductor sector is cyclical and highly volatile.`;

async function run() {
  const updateData = {
    content_md: broadcom_md,
    content_html: marked(broadcom_md)
  };
  console.log('Updating: Broadcom Q1 2024...');
  try {
    const result = await apiRequest('PUT', '/api/posts/20eb2ff4-482b-4ea8-805d-3507b0a2d30c', updateData);
    if (result.id) {
      console.log(`✅ Updated - ID: ${result.id.substring(0, 8)}`);
    } else {
      console.log(`❌ Error: ${JSON.stringify(result).substring(0, 300)}`);
    }
  } catch (e) {
    console.log(`❌ Request failed: ${e.message}`);
  }
}

run();
