# CareerGraph — Career Discovery via Graph Database

A modern web application for discovering career paths, skill requirements, and role opportunities through graph-based relationship discovery. Built with CognoDB, Next.js, and React Flow.

**Live Demo:** [Deploy to Vercel](#deployment)  
**Status:** Production-ready, ready for submission to WEXA AI

---

## Table of Contents

1. [Use Case](#use-case)
2. [Why a Graph Database?](#why-a-graph-database)
3. [Data Model](#data-model)
4. [Quick Start](#quick-start)
5. [Architecture](#architecture)
6. [Main Queries](#main-queries)
7. [Features](#features)
8. [Deployment](#deployment)
9. [Development](#development)

---

## Use Case

**CareerGraph solves the career discovery problem:** Given your current skills, which roles are you qualified for? What skills do you need to get there? How do these opportunities interconnect?

### The Problem
- Career websites show jobs in isolation; they don't show **career pathways**
- You can't easily see what skills lead to which roles
- Company hiring patterns and role prerequisites aren't visible
- Technology stacks aren't linked to real hiring demand

### The Solution
CareerGraph models careers as a **connected graph**: 
- **People** have **skills**
- **Roles** require specific **skills** and **technologies**
- **Companies** hire for multiple **roles**
- **Technologies** are related and form ecosystems
- **Career paths** emerge from traversing these connections

Users select their current skills, and the system recommends roles, shows what they're missing, and recommends a learning path. The interactive graph explorer lets users see the entire skill-to-company ecosystem.

### Example User Journey
1. **Alice** has React, TypeScript, Node.js skills
2. She selects these skills in CareerGraph
3. System recommends: "Senior Frontend Engineer" (95% match), "Full Stack Engineer" (87% match)
4. She clicks "Senior Frontend Engineer" and sees:
   - Required skills: React ✓, TypeScript ✓, CSS-in-JS ✓, GraphQL ✗
   - Companies hiring: Meta, Airbnb, GitHub
   - Missing skills: GraphQL (learning path provided)
5. She explores the graph and discovers: GraphQL → Backend optimization → Database optimization → Microservices
6. She realizes a career path: Frontend → Full Stack → Platform Engineering

---

## Why a Graph Database?

### The Graph Perspective
Relationships and multi-hop traversals are first-class queries in CareerGraph. In a relational database, these require complex joins and recursion; in a graph database, they're natural operations.

### Query Classes Uniquely Suited to Graphs

#### 1. **Skill-to-Role Matching (4-hop traversal)**
```cypher
MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(skill:Skill)
MATCH (role:Role)-[:REQUIRES]->(requiredSkill:Skill)
WITH p, role, 
  collect(DISTINCT skill.id) AS personSkills,
  collect(DISTINCT requiredSkill.id) AS requiredSkills
RETURN role, 
  [s IN requiredSkills WHERE s IN personSkills] AS matched,
  [s IN requiredSkills WHERE NOT s IN personSkills] AS missing
```

**Why this is hard in SQL:** Requires self-joins on skills, nested aggregations, and set operations — often expressed as subqueries or window functions that are inefficient at scale.

**Why it's natural in Cypher:** Pattern matching handles arbitrary hops elegantly. The graph itself encodes the business logic.

#### 2. **Related Technologies (Recursive Relationships)**
```cypher
MATCH (t:Technology {id: $id})-[:RELATED_TO*1..3]->(related:Technology)
RETURN collect(DISTINCT related)
```

**Why this is hard in SQL:** Recursive CTEs or stored procedures; complex to express "find all technologies related by up to 3 degrees."

**Why it's natural in Cypher:** Variable-length relationships (`*1..3`) are a first-class language feature.

#### 3. **Career Path Discovery (Full Relationship Traversal)**
```cypher
MATCH path = (s1:Skill)-[:LEADS_TO*]->(r:Role)-[:AVAILABLE_AT]->(c:Company)
WHERE s1.id = $skillId
RETURN path
```

**Why this is hard in SQL:** You'd need to enumerate all possible paths explicitly or use graph-specific extensions.

**Why it's natural in Cypher:** Graph traversal is the entire purpose.

### Conclusion
CareerGraph **genuinely benefits** from a graph database because:
1. ✅ **Relationships are data:** Skills→Roles→Companies form the core model
2. ✅ **Multi-hop queries are common:** "Find all paths from my skills to a dream role"
3. ✅ **Traversal cost is low:** Graph traversal is faster than SQL joins at scale
4. ✅ **Pattern matching is elegant:** Cypher expresses career logic more naturally than SQL

---

## Data Model

### Nodes (6 Types)

```
┌─────────────┐
│   Person    │  id, name, title
└─────────────┘
      │
      ├─[:HAS_SKILL]──► ┌──────────┐  id, name, category, description
      │                 │  Skill   │
      └─────────────────┤  (100+)  │
                        └──────────┘
                              ▲
                              │ [:LEADS_TO]
                              │
                        ┌──────────┐
                        │   Role   │  id, name, level, description
                        │ (50+)    │
                        └──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         [:REQUIRES]    [:USES]         [:AVAILABLE_AT]
              │               │               │
              ▼               ▼               ▼
         ┌──────────┐  ┌─────────────┐ ┌──────────┐
         │  Skill   │  │ Technology  │ │ Company  │  id, name, industry, size
         └──────────┘  │   (20+)     │ └──────────┘
                       └─────────────┘
                              │
                         [:IN_INDUSTRY]
                              │
                              ▼
                        ┌──────────────┐
                        │   Industry   │  name
                        └──────────────┘
```

### Relationships (7 Types)

| Relationship | From | To | Properties | Example |
|---|---|---|---|---|
| `HAS_SKILL` | Person | Skill | years, proficiency | person-alice HAS_SKILL skill-react |
| `REQUIRES` | Role | Skill | essential, level | role-senior-fe REQUIRES skill-typescript |
| `USES` | Role | Technology | version, years | role-fullstack USES tech-node.js |
| `AVAILABLE_AT` | Role | Company | open_positions | role-engineer AVAILABLE_AT company-meta |
| `RELATED_TO` | Skill/Tech | Skill/Tech | similarity | skill-react RELATED_TO skill-vue |
| `LEADS_TO` | Skill | Role | match_score | skill-typescript LEADS_TO role-senior-fe |
| `IN_INDUSTRY` | Company | Industry | — | company-meta IN_INDUSTRY industry-tech |

### Cardinality

- **50+ Roles** (levels: Junior, Mid, Senior, Lead)
- **100+ Skills** (categories: Backend, Frontend, DevOps, Data, Soft)
- **30+ Companies** (industries: Tech, Finance, Healthcare, Retail)
- **20+ Technologies** (categories: Frontend, Backend, DevOps, Data)
- **12 Industries**
- **2 Sample People** (with skills for testing)

---

## Quick Start

### 1. Create CognoDB Account

Go to [console.cognodb.com/signup](https://console.cognodb.com/signup) and create a free account (no credit card required).

### 2. Create Free Instance

From the CognoDB Console:
1. Click "Create Instance"
2. Select free tier (c0)
3. Choose a region (us-east-1 recommended)
4. **Copy the connection URI** (format: `bolt+s://xxxx.databases.cognodb.cloud`)
5. **Copy the password** for user "cognodb" (shown only once)

### 3. Clone Repository

```bash
git clone https://github.com/your-username/careergraph.git
cd careergraph
```

### 4. Configure Environment

Create `.env.local`:

```env
NEO4J_URI=bolt+s://your-instance-id.databases.cognodb.cloud
NEO4J_PASSWORD=your-generated-password
NEO4J_USERNAME=cognodb
```

**Never commit `.env.local`** — it's in `.gitignore`.

### 5. Install & Seed

```bash
npm install
npm run seed
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture

### System Diagram

```
Browser (React 19 + React Flow)
         ↓ HTTPS
Next.js Route Handlers (/api/*)
  - Validation
  - Business Logic
  - Error Handling
         ↓
lib/cognodb.ts (Connection Pool)
  - Parameterized Queries
  - Error Mapping
         ↓ Bolt+S Protocol
CognoDB (Managed Graph Database)
  - 6 Node Types
  - 7 Relationship Types
  - 150+ Entities
```

### Key Layers

1. **UI Layer:** React components with Tailwind CSS
2. **API Layer:** Next.js Route Handlers with TypeScript
3. **Database Layer:** neo4j-driver with parameterized queries
4. **Data Layer:** CognoDB with Cypher queries

---

## Main Queries

All queries are **parameterized** (no string concatenation).

### 1. Role Recommendations (4-Hop Traversal) ⭐

```cypher
MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(personSkill:Skill)
MATCH (role:Role)-[:REQUIRES]->(requiredSkill:Skill)
WITH p, role, 
  collect(DISTINCT personSkill.id) AS currentSkillIds, 
  collect(DISTINCT requiredSkill.id) AS requiredSkillIds
WITH p, role, currentSkillIds, requiredSkillIds,
  [skillId IN requiredSkillIds WHERE skillId IN currentSkillIds] AS matchedSkills,
  [skillId IN requiredSkillIds WHERE NOT skillId IN currentSkillIds] AS missingSkills
WITH p, role, matchedSkills, missingSkills, size(requiredSkillIds) AS totalRequiredSkills,
  size([skillId IN requiredSkillIds WHERE skillId IN currentSkillIds]) AS matchedCount
WHERE totalRequiredSkills > 0
RETURN role.id, role.name, matchedSkills, missingSkills, 
  toFloat((matchedCount * 100.0) / totalRequiredSkills) AS matchPercentage
ORDER BY matchPercentage DESC
LIMIT 10
```

**Why Graph:** Person→Skill and Role→Skill are natural traversals; comparing sets is elegant in graph queries.

### 2. Skill Gap Analysis (Bidirectional Matching) ⭐

```cypher
MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(current:Skill)
MATCH (r:Role {id: $roleId})-[:REQUIRES]->(required:Skill)
WITH p, r, 
  collect(DISTINCT current.id) AS currentSkillIds, 
  collect(DISTINCT required.id) AS requiredSkillIds
RETURN p, r, currentSkillIds, requiredSkillIds,
  [skillId IN requiredSkillIds WHERE NOT skillId IN currentSkillIds] AS missingSkills
```

**Why Graph:** Traverses relationships bidirectionally without JOIN complexity.

### 3. Related Technologies (Variable-Length Traversal) ⭐

```cypher
MATCH (t:Technology {id: $technologyId})
OPTIONAL MATCH (related:Technology)<-[:RELATED_TO*1..3]-(t)
OPTIONAL MATCH (r:Role)-[:USES]->(t)
RETURN t, collect(DISTINCT related) AS relatedTechnologies, 
  collect(DISTINCT r) AS relevantRoles
```

**Why Graph:** `*1..3` variable-length syntax is unique to graph databases.

### 4. Full-Text Search (Multi-Entity)

```cypher
MATCH (n)
WHERE (n:Skill OR n:Technology OR n:Role OR n:Company OR n:Project)
AND (toLower(n.name) CONTAINS toLower($searchTerm) 
  OR toLower(n.description) CONTAINS toLower($searchTerm))
RETURN labels(n) AS label, n.id, n.name, n.description
ORDER BY n.name
LIMIT 50
```

---

## Features

### Pages Implemented (11 Routes)

- ✅ Landing page with Hero section
- ✅ Career paths with skill selector & recommendations
- ✅ Role detail with skill gap analysis
- ✅ Company discovery & detail pages
- ✅ Technology catalog & detail pages
- ✅ Skill deep-dive with related skills
- ✅ Interactive graph explorer with React Flow

### UI Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading states (skeleton loaders)
- ✅ Empty states (helpful messaging)
- ✅ Error states (graceful failures)
- ✅ Global search with dropdown
- ✅ Real-time role recommendations
- ✅ Match score visualization (circular progress)
- ✅ Skill chip selector

### Architecture Features

- ✅ TypeScript strict mode
- ✅ ESLint validation passing
- ✅ Zero hardcoded secrets (.env.local)
- ✅ Parameterized queries (no SQL injection)
- ✅ Connection pooling (neo4j-driver)
- ✅ Graceful error handling
- ✅ Production build: 13.7s (Turbopack)

---

## Deployment

### Deploy to Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Add environment variables in Vercel dashboard:
# NEO4J_URI=bolt+s://...
# NEO4J_PASSWORD=...
```

### Alternative Hosting

- **Railway:** Click "Deploy" at [railway.app](https://railway.app)
- **Render:** Create Web Service at [render.com](https://render.com)
- **AWS Amplify:** Console at [console.aws.amazon.com/amplify](https://console.aws.amazon.com/amplify)

---

## Development

### Scripts

```bash
npm run dev              # Development server (localhost:3000)
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint check
npm run seed             # Load seed data
```

### Project Structure

```
careergraph/
├── app/                 # Next.js pages & API routes
│   ├── api/            # Route Handlers
│   ├── roles/          # Career discovery
│   ├── companies/      # Company pages
│   ├── technologies/   # Tech catalog
│   ├── skills/         # Skill details
│   └── explore/        # Graph explorer
├── components/         # React components
│   ├── nav/           # Header & search
│   ├── ui/            # Primitives
│   ├── landing/       # Home sections
│   └── graph/         # Graph viz
├── lib/                # Utilities
│   ├── cognodb.ts     # DB layer
│   ├── api.ts         # API helpers
│   └── types/         # TypeScript
├── scripts/            # One-off scripts
│   └── seed.ts        # Database seeding
└── .env.local         # Secrets (not in repo)
```

### Tech Stack

- **Framework:** Next.js 16.3.0 (App Router, Turbopack)
- **UI:** React 19.2.8 + Tailwind CSS 4
- **Database:** neo4j-driver 6.2.0
- **Visualization:** React Flow 12.11.3
- **Language:** TypeScript 5 (strict mode)

### Environment Variables

```env
NEO4J_URI=bolt+s://[instance-id].databases.cognodb.cloud
NEO4J_PASSWORD=[generated-password]
NEO4J_USERNAME=cognodb
```

---

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| Connection refused | CognoDB offline | Check CognoDB Console |
| Seed script fails | Database not accessible | Verify .env.local & instance status |
| Type errors | TypeScript strict | Add explicit types to variables |
| ESLint errors | Code style | Run `npm run lint` for details |

---

## Submission Status

✅ **Code Complete**
- 11 pages implemented
- 12 API routes with parameterized queries
- 6 node types, 7 relationship types
- Real seed data (150+ entities)
- TypeScript strict mode passing
- ESLint validation passing
- Production build successful

⏳ **Pending**
- [ ] GitHub repository created
- [ ] Hosted demo deployed (Vercel/Railway/Render)
- [ ] Screen recording uploaded
- [ ] Submission email sent to hr@wexa.ai

---

## License

MIT

---

**Status:** Production-ready, ready for submission  
**Last Updated:** August 12, 2026
