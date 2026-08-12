import neo4j, { Driver, Session } from "neo4j-driver";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

function getCredentials() {
  const uri = process.env.COGNODB_URI?.trim();
  const username = process.env.COGNODB_USERNAME?.trim();
  const password = process.env.COGNODB_PASSWORD?.trim();

  return { uri, username, password };
}

async function runWrite(
  session: Session,
  cypher: string,
  params: Record<string, unknown> = {}
) {
  await session.executeWrite((tx) => tx.run(cypher, params));
}

function logSection(message: string) {
  console.log(`\n=== ${message} ===`);
}

async function verifyCounts(session: Session) {
  const queries = {
    people: "MATCH (p:Person) RETURN count(p) AS total",
    skills: "MATCH (s:Skill) RETURN count(s) AS total",
    technologies: "MATCH (t:Technology) RETURN count(t) AS total",
    roles: "MATCH (r:Role) RETURN count(r) AS total",
    companies: "MATCH (c:Company) RETURN count(c) AS total",
    projects: "MATCH (p:Project) RETURN count(p) AS total",
    industries: "MATCH (i:Industry) RETURN count(i) AS total",
    relationships: "MATCH ()-[r]->() RETURN count(r) AS total",
  };

  for (const [key, cypher] of Object.entries(queries)) {
    const result = await session.executeRead((tx) => tx.run(cypher));
    const value = Number(result.records[0].get("total"));
    console.log(`${key}: ${value}`);
  }
}

async function seed() {
  const { uri, username, password } = getCredentials();

  if (!uri || !username || !password) {
    console.error(
      "Missing CognoDB environment variables. Required: COGNODB_URI, COGNODB_USERNAME, COGNODB_PASSWORD"
    );
    process.exit(1);
  }

  const driver: Driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

  const session = driver.session();

  try {
    console.log("Connecting to CognoDB...");
    await driver.getServerInfo();
    console.log("Connected successfully.");

    logSection("Clearing the graph for a fresh seed");
    await runWrite(session, "MATCH (n) DETACH DELETE n");

    const industries = [
      { id: "ind-ai", name: "Artificial Intelligence", description: "AI products and autonomous systems." },
      { id: "ind-fintech", name: "FinTech", description: "Payments, banking infrastructure, and financial products." },
      { id: "ind-devtools", name: "Developer Tools", description: "Developer workflows, tooling, and software delivery." },
      { id: "ind-ecommerce", name: "E-Commerce", description: "Commerce platforms and online retail experiences." },
      { id: "ind-cloud", name: "Cloud Infrastructure", description: "Compute, infrastructure, and platform engineering." },
      { id: "ind-healthtech", name: "HealthTech", description: "Patient experiences, digital health, and care systems." },
      { id: "ind-media", name: "Media & Entertainment", description: "Consumer engagement, content, and recommendation products." },
      { id: "ind-saas", name: "Enterprise SaaS", description: "Business software and workflow tooling." },
    ];

    logSection("Creating industries");
    for (const industry of industries) {
      await runWrite(
        session,
        "MERGE (i:Industry {id: $id}) SET i.name = $name, i.description = $description",
        industry
      );
    }

    const companies = [
      { id: "co-wexa", name: "Wexa AI", industry: "ind-ai", size: "11-50", description: "AI-powered career intelligence platform." },
      { id: "co-vercel", name: "Vercel", industry: "ind-devtools", size: "1001-5000", description: "Frontend infrastructure and deployment platform." },
      { id: "co-stripe", name: "Stripe", industry: "ind-fintech", size: "5001-10000", description: "Payments and commerce infrastructure." },
      { id: "co-shopify", name: "Shopify", industry: "ind-ecommerce", size: "5001-10000", description: "E-commerce platform for merchants." },
      { id: "co-github", name: "GitHub", industry: "ind-devtools", size: "5001-10000", description: "Collaborative software development platform." },
      { id: "co-datadog", name: "Datadog", industry: "ind-cloud", size: "5001-10000", description: "Cloud monitoring and observability platform." },
      { id: "co-openai", name: "OpenAI", industry: "ind-ai", size: "1001-5000", description: "Research and deployment for frontier AI systems." },
      { id: "co-notion", name: "Notion", industry: "ind-saas", size: "1001-5000", description: "Workspace and knowledge management platform." },
      { id: "co-airbnb", name: "Airbnb", industry: "ind-saas", size: "10001+", description: "Global hospitality and travel marketplace." },
      { id: "co-spotify", name: "Spotify", industry: "ind-media", size: "5001-10000", description: "Audio streaming and personalization platform." },
      { id: "co-figma", name: "Figma", industry: "ind-saas", size: "1001-5000", description: "Collaborative product design tooling." },
      { id: "co-plaid", name: "Plaid", industry: "ind-fintech", size: "1001-5000", description: "Financial data connectivity platform." },
      { id: "co-linear", name: "Linear", industry: "ind-saas", size: "201-500", description: "Productivity and issue management platform." },
      { id: "co-dropbox", name: "Dropbox", industry: "ind-cloud", size: "5001-10000", description: "Cloud file sync and collaboration platform." },
      { id: "co-coinbase", name: "Coinbase", industry: "ind-fintech", size: "5001-10000", description: "Digital asset platform and exchange." },
    ];

    logSection("Creating companies and company-to-industry relationships");
    for (const company of companies) {
      await runWrite(
        session,
        "MERGE (c:Company {id: $id}) SET c.name = $name, c.size = $size, c.description = $description",
        company
      );
      await runWrite(
        session,
        "MATCH (c:Company {id: $companyId}) MATCH (i:Industry {id: $industryId}) MERGE (c)-[:IN_INDUSTRY]->(i)",
        { companyId: company.id, industryId: company.industry }
      );
    }

    const skills = [
      { id: "skill-typescript", name: "TypeScript", category: "Language", description: "Typed JavaScript for large-scale frontend and backend systems." },
      { id: "skill-javascript", name: "JavaScript", category: "Language", description: "Core language for frontend and browser-based development." },
      { id: "skill-react", name: "React", category: "Frontend", description: "Component-driven UI development." },
      { id: "skill-nextjs", name: "Next.js", category: "Frontend", description: "Full-stack framework for React applications." },
      { id: "skill-css", name: "CSS", category: "Frontend", description: "Styling, layout, and responsiveness." },
      { id: "skill-html", name: "HTML", category: "Frontend", description: "Semantic document structure for web interfaces." },
      { id: "skill-testing", name: "Testing", category: "Quality", description: "Automated validation of application behavior." },
      { id: "skill-accessibility", name: "Accessibility", category: "UX", description: "Inclusive interfaces and screen-reader support." },
      { id: "skill-rest-apis", name: "REST APIs", category: "Backend", description: "HTTP interfaces for application integration." },
      { id: "skill-graphql", name: "GraphQL", category: "Backend", description: "Flexible API querying for client and server contracts." },
      { id: "skill-nodejs", name: "Node.js", category: "Runtime", description: "Server-side JavaScript execution environment." },
      { id: "skill-express", name: "Express", category: "Backend", description: "Minimal web application framework for Node.js." },
      { id: "skill-postgresql", name: "PostgreSQL", category: "Database", description: "Relational data persistence and query processing." },
      { id: "skill-sql", name: "SQL", category: "Database", description: "Structured data querying." },
      { id: "skill-docker", name: "Docker", category: "DevOps", description: "Containerization for reproducible environments." },
      { id: "skill-kubernetes", name: "Kubernetes", category: "DevOps", description: "Container orchestration and service deployment." },
      { id: "skill-aws", name: "AWS", category: "Cloud", description: "Cloud platform and infrastructure services." },
      { id: "skill-ci-cd", name: "CI/CD Pipelines", category: "DevOps", description: "Automated testing, builds, and deployment flows." },
      { id: "skill-system-design", name: "System Design", category: "Architecture", description: "Scalable application and service design patterns." },
      { id: "skill-distributed-systems", name: "Distributed Systems", category: "Architecture", description: "Resiliency, replication, and coordination across services." },
      { id: "skill-python", name: "Python", category: "Language", description: "General-purpose language for data tooling and backend services." },
      { id: "skill-fastapi", name: "FastAPI", category: "Backend", description: "Modern Python API framework with type safety." },
      { id: "skill-machine-learning", name: "Machine Learning", category: "AI", description: "Model training, evaluation, and feature engineering." },
      { id: "skill-data-engineering", name: "Data Engineering", category: "Data", description: "Pipelines, data modeling, and reliable transformation flows." },
      { id: "skill-data-structures", name: "Data Structures", category: "Computer Science", description: "Core abstractions for efficient problem solving." },
      { id: "skill-algorithms", name: "Algorithms", category: "Computer Science", description: "Algorithmic reasoning and performance analysis." },
      { id: "skill-ux-research", name: "UX Research", category: "Design", description: "User understanding and product discovery research." },
      { id: "skill-product-thinking", name: "Product Thinking", category: "Product", description: "Balancing user needs, business goals, and technical constraints." },
      { id: "skill-communication", name: "Communication", category: "Soft Skills", description: "Cross-functional collaboration and clear technical narratives." },
      { id: "skill-security", name: "Security", category: "Platform", description: "Secure coding, identity, and protection of sensitive systems." },
      { id: "skill-auth", name: "Authentication", category: "Security", description: "Identity, sessions, and access control patterns." },
      { id: "skill-observability", name: "Observability", category: "Operations", description: "Metrics, logs, and tracing for production health." },
      { id: "skill-monitoring", name: "Monitoring", category: "Operations", description: "Tracking system health, events, and performance signals." },
      { id: "skill-caching", name: "Caching", category: "Performance", description: "Reducing latency and load through strategic memory layers." },
      { id: "skill-redis", name: "Redis", category: "Database", description: "In-memory caching and high-speed data access patterns." },
      { id: "skill-kafka", name: "Kafka", category: "Data", description: "Event streaming for asynchronous systems." },
      { id: "skill-pytorch", name: "PyTorch", category: "AI", description: "Model development and experimentation for deep learning." },
      { id: "skill-tensorflow", name: "TensorFlow", category: "AI", description: "Machine learning framework for production-scale model development." },
      { id: "skill-openai-api", name: "OpenAI API", category: "AI", description: "LLM integration to augment product workflows." },
      { id: "skill-llm-apps", name: "LLM Applications", category: "AI", description: "Prompt-driven features and product experiences built on language models." },
      { id: "skill-ux-design", name: "UX Design", category: "Design", description: "User journey design, information architecture, and visual systems." },
      { id: "skill-prototyping", name: "Prototyping", category: "Design", description: "Rapid exploration of interfaces and product flows." },
      { id: "skill-cypher", name: "openCypher", category: "Database", description: "Graph query language for traversing connected data." },
      { id: "skill-graph-db", name: "Graph Databases", category: "Database", description: "Storing and querying highly connected entities." },
      { id: "skill-serverless", name: "Serverless", category: "Cloud", description: "Event-driven compute without managing underlying infrastructure." },
      { id: "skill-microservices", name: "Microservices", category: "Architecture", description: "Independent services that communicate through well-defined interfaces." },
      { id: "skill-event-driven", name: "Event-Driven Architecture", category: "Architecture", description: "Asynchronous messaging patterns for decoupled systems." },
      { id: "skill-api-design", name: "API Design", category: "Backend", description: "Designing stable, maintainable interfaces for products." },
    ];

    logSection("Creating skills");
    for (const skill of skills) {
      await runWrite(
        session,
        "MERGE (s:Skill {id: $id}) SET s.name = $name, s.category = $category, s.description = $description",
        skill
      );
    }

    const technologies = [
      { id: "tech-react", name: "React", category: "Frontend", description: "JavaScript library for building user interfaces." },
      { id: "tech-nextjs", name: "Next.js", category: "Frontend", description: "React framework for web applications." },
      { id: "tech-typescript", name: "TypeScript", category: "Language", description: "Javascript with static types." },
      { id: "tech-javascript", name: "JavaScript", category: "Language", description: "Language for interactive web experiences." },
      { id: "tech-nodejs", name: "Node.js", category: "Runtime", description: "JavaScript runtime for server-side code." },
      { id: "tech-express", name: "Express", category: "Backend", description: "HTTP server framework for Node.js." },
      { id: "tech-rest", name: "REST", category: "Protocol", description: "Resource-oriented API design style." },
      { id: "tech-graphql", name: "GraphQL", category: "Protocol", description: "Query language and runtime for APIs." },
      { id: "tech-postgresql", name: "PostgreSQL", category: "Database", description: "Open-source relational database." },
      { id: "tech-sql", name: "SQL", category: "Database", description: "Language for relational data access." },
      { id: "tech-docker", name: "Docker", category: "DevOps", description: "Tooling for containerizing applications." },
      { id: "tech-kubernetes", name: "Kubernetes", category: "DevOps", description: "System for orchestrating container workloads." },
      { id: "tech-aws", name: "AWS", category: "Cloud", description: "Cloud infrastructure and managed services." },
      { id: "tech-gcp", name: "Google Cloud", category: "Cloud", description: "Cloud services for computing and data." },
      { id: "tech-azure", name: "Azure", category: "Cloud", description: "Microsoft cloud platform and managed services." },
      { id: "tech-ci-cd", name: "CI/CD", category: "DevOps", description: "Automation for build, test, and deployment systems." },
      { id: "tech-python", name: "Python", category: "Language", description: "Flexible language for data and backend services." },
      { id: "tech-fastapi", name: "FastAPI", category: "Backend", description: "Python API framework for service development." },
      { id: "tech-pytorch", name: "PyTorch", category: "AI", description: "Deep learning framework for research and deployment." },
      { id: "tech-tensorflow", name: "TensorFlow", category: "AI", description: "End-to-end ML platform and framework." },
      { id: "tech-openai-api", name: "OpenAI API", category: "AI", description: "LLM access via hosted API endpoints." },
      { id: "tech-redis", name: "Redis", category: "Database", description: "In-memory cache and data store." },
      { id: "tech-kafka", name: "Kafka", category: "Data", description: "Distributed event streaming platform." },
      { id: "tech-tailwind", name: "Tailwind CSS", category: "Frontend", description: "Utility-first CSS framework." },
      { id: "tech-css", name: "CSS", category: "Frontend", description: "Cascade style sheet for UI design." },
      { id: "tech-html", name: "HTML", category: "Frontend", description: "Markup language for web documents." },
      { id: "tech-figma", name: "Figma", category: "Design", description: "Design and prototyping collaboration platform." },
      { id: "tech-cognodb", name: "CognoDB", category: "Database", description: "Graph-native database for connected data systems." },
      { id: "tech-neo4j", name: "Neo4j", category: "Database", description: "Graph database platform for connected data models." },
      { id: "tech-serverless", name: "Serverless", category: "Cloud", description: "Cloud functions and event-driven compute." },
      { id: "tech-kinesis", name: "Kinesis", category: "Data", description: "Streaming data platform for event ingestion and processing." },
      { id: "tech-observability", name: "Observability", category: "Operations", description: "Monitoring, tracing, and debugging systems in production." },
      { id: "tech-websocket", name: "WebSockets", category: "Protocol", description: "Real-time, bi-directional communication for interactive applications." },
    ];

    logSection("Creating technologies");
    for (const technology of technologies) {
      await runWrite(
        session,
        "MERGE (t:Technology {id: $id}) SET t.name = $name, t.category = $category, t.description = $description",
        technology
      );
    }

    const roles = [
      { id: "role-frontend-engineer", name: "Frontend Engineer", level: "Mid", description: "Builds high-quality, user-centric web interfaces." },
      { id: "role-full-stack-engineer", name: "Full Stack Engineer", level: "Mid", description: "Works across UI, APIs, and data flows in product teams." },
      { id: "role-backend-engineer", name: "Backend Engineer", level: "Mid", description: "Designs and maintains APIs and backend services." },
      { id: "role-senior-backend-engineer", name: "Senior Backend Engineer", level: "Senior", description: "Owns service architecture, performance, and reliability." },
      { id: "role-staff-frontend-engineer", name: "Staff Frontend Engineer", level: "Staff", description: "Sets frontend standards and shapes large UI ecosystems." },
      { id: "role-product-engineer", name: "Product Engineer", level: "Mid", description: "Turns product requirements into polished user-facing systems." },
      { id: "role-devops-engineer", name: "DevOps Engineer", level: "Mid", description: "Automates deployment, distribution, and environment reliability." },
      { id: "role-platform-engineer", name: "Platform Engineer", level: "Senior", description: "Builds reusable internal infrastructure and developer platforms." },
      { id: "role-cloud-engineer", name: "Cloud Engineer", level: "Mid", description: "Designs cloud-native architecture and operational systems." },
      { id: "role-data-engineer", name: "Data Engineer", level: "Mid", description: "Builds pipelines and robust data infrastructure." },
      { id: "role-ai-engineer", name: "AI Engineer", level: "Mid", description: "Transforms models into reliable product experiences." },
      { id: "role-ml-engineer", name: "ML Engineer", level: "Senior", description: "Develops production ML systems and evaluation pipelines." },
      { id: "role-data-scientist", name: "Data Scientist", level: "Mid", description: "Analyzes signals and creates product insight from data." },
      { id: "role-solutions-architect", name: "Solutions Architect", level: "Senior", description: "Designs customer-centric, end-to-end technical solutions." },
      { id: "role-security-engineer", name: "Security Engineer", level: "Senior", description: "Protects systems, services, and sensitive data." },
      { id: "role-sre", name: "Site Reliability Engineer", level: "Senior", description: "Improves system resilience, reliability, and incident response." },
      { id: "role-engineering-manager", name: "Engineering Manager", level: "Manager", description: "Leads engineering execution and people development." },
      { id: "role-ux-engineer", name: "UX Engineer", level: "Mid", description: "Combines interaction design and front-end implementation." },
      { id: "role-product-designer", name: "Product Designer", level: "Mid", description: "Shapes product experience and interaction design." },
      { id: "role-technical-product-manager", name: "Technical Product Manager", level: "Senior", description: "Connects technical feasibility, product strategy, and execution." },
    ];

    logSection("Creating roles and company assignments");
    for (const role of roles) {
      await runWrite(
        session,
        "MERGE (r:Role {id: $id}) SET r.name = $name, r.level = $level, r.description = $description",
        role
      );
    }

    const roleCompanyAssignments = [
      { roleId: "role-frontend-engineer", companyId: "co-vercel" },
      { roleId: "role-frontend-engineer", companyId: "co-figma" },
      { roleId: "role-full-stack-engineer", companyId: "co-wexa" },
      { roleId: "role-full-stack-engineer", companyId: "co-notion" },
      { roleId: "role-backend-engineer", companyId: "co-stripe" },
      { roleId: "role-backend-engineer", companyId: "co-shopify" },
      { roleId: "role-senior-backend-engineer", companyId: "co-github" },
      { roleId: "role-senior-backend-engineer", companyId: "co-dropbox" },
      { roleId: "role-staff-frontend-engineer", companyId: "co-vercel" },
      { roleId: "role-product-engineer", companyId: "co-linear" },
      { roleId: "role-devops-engineer", companyId: "co-datadog" },
      { roleId: "role-platform-engineer", companyId: "co-airbnb" },
      { roleId: "role-cloud-engineer", companyId: "co-spotify" },
      { roleId: "role-data-engineer", companyId: "co-openai" },
      { roleId: "role-ai-engineer", companyId: "co-wexa" },
      { roleId: "role-ml-engineer", companyId: "co-openai" },
      { roleId: "role-data-scientist", companyId: "co-spotify" },
      { roleId: "role-solutions-architect", companyId: "co-plaid" },
      { roleId: "role-security-engineer", companyId: "co-coinbase" },
      { roleId: "role-sre", companyId: "co-datadog" },
      { roleId: "role-engineering-manager", companyId: "co-notion" },
      { roleId: "role-ux-engineer", companyId: "co-figma" },
      { roleId: "role-product-designer", companyId: "co-airbnb" },
      { roleId: "role-technical-product-manager", companyId: "co-shopify" },
    ];

    for (const assignment of roleCompanyAssignments) {
      await runWrite(
        session,
        "MATCH (r:Role {id: $roleId}) MATCH (c:Company {id: $companyId}) MERGE (r)-[:AVAILABLE_AT]->(c)",
        assignment
      );
    }

    const people = [
      { id: "person-alice", name: "Alice Chen", headline: "Frontend Engineer", location: "San Francisco, CA", bio: "Builds accessible product experiences and enjoys design systems." },
      { id: "person-ben", name: "Ben Foster", headline: "Full Stack Engineer", location: "Austin, TX", bio: "Likes shipping end-to-end product features with clean APIs." },
      { id: "person-priya", name: "Priya Shah", headline: "Backend Engineer", location: "New York, NY", bio: "Builds service-oriented systems and deeply cares about performance." },
      { id: "person-martin", name: "Martin Gomez", headline: "Product Engineer", location: "Seattle, WA", bio: "Bridges product thinking and implementation across tooling layers." },
      { id: "person-nina", name: "Nina Petrov", headline: "Data Engineer", location: "Chicago, IL", bio: "Loves pipelines, transformation logic, and trustworthy data flows." },
      { id: "person-omar", name: "Omar Haddad", headline: "AI Engineer", location: "Los Angeles, CA", bio: "Works on product experiences powered by LLMs and inference systems." },
      { id: "person-sofia", name: "Sofia Rossi", headline: "UX Engineer", location: "Boston, MA", bio: "Mixes interface thinking with polished front-end implementation." },
      { id: "person-daniel", name: "Daniel Kim", headline: "DevOps Engineer", location: "Denver, CO", bio: "Focuses on delivery systems, deployment safety, and environment automation." },
      { id: "person-lena", name: "Lena Okafor", headline: "Cloud Engineer", location: "Remote", bio: "Designs resilient infrastructure on modern cloud platforms." },
      { id: "person-jules", name: "Jules Martin", headline: "Software Engineer", location: "Remote", bio: "Interested in systems architecture and practical product delivery." },
    ];

    logSection("Creating people");
    for (const person of people) {
      await runWrite(
        session,
        "MERGE (p:Person {id: $id}) SET p.name = $name, p.headline = $headline, p.location = $location, p.bio = $bio",
        person
      );
    }

    const personSkills = [
      { personId: "person-alice", skillId: "skill-react" },
      { personId: "person-alice", skillId: "skill-typescript" },
      { personId: "person-alice", skillId: "skill-css" },
      { personId: "person-alice", skillId: "skill-accessibility" },
      { personId: "person-alice", skillId: "skill-testing" },
      { personId: "person-ben", skillId: "skill-react" },
      { personId: "person-ben", skillId: "skill-typescript" },
      { personId: "person-ben", skillId: "skill-nodejs" },
      { personId: "person-ben", skillId: "skill-rest-apis" },
      { personId: "person-ben", skillId: "skill-postgresql" },
      { personId: "person-priya", skillId: "skill-nodejs" },
      { personId: "person-priya", skillId: "skill-rest-apis" },
      { personId: "person-priya", skillId: "skill-postgresql" },
      { personId: "person-priya", skillId: "skill-system-design" },
      { personId: "person-priya", skillId: "skill-docker" },
      { personId: "person-martin", skillId: "skill-react" },
      { personId: "person-martin", skillId: "skill-nextjs" },
      { personId: "person-martin", skillId: "skill-product-thinking" },
      { personId: "person-martin", skillId: "skill-communication" },
      { personId: "person-martin", skillId: "skill-api-design" },
      { personId: "person-nina", skillId: "skill-sql" },
      { personId: "person-nina", skillId: "skill-postgresql" },
      { personId: "person-nina", skillId: "skill-python" },
      { personId: "person-nina", skillId: "skill-data-engineering" },
      { personId: "person-nina", skillId: "skill-kafka" },
      { personId: "person-omar", skillId: "skill-python" },
      { personId: "person-omar", skillId: "skill-machine-learning" },
      { personId: "person-omar", skillId: "skill-fastapi" },
      { personId: "person-omar", skillId: "skill-openai-api" },
      { personId: "person-omar", skillId: "skill-llm-apps" },
      { personId: "person-sofia", skillId: "skill-react" },
      { personId: "person-sofia", skillId: "skill-ux-design" },
      { personId: "person-sofia", skillId: "skill-prototyping" },
      { personId: "person-sofia", skillId: "skill-accessibility" },
      { personId: "person-daniel", skillId: "skill-docker" },
      { personId: "person-daniel", skillId: "skill-kubernetes" },
      { personId: "person-daniel", skillId: "skill-aws" },
      { personId: "person-daniel", skillId: "skill-ci-cd" },
      { personId: "person-daniel", skillId: "skill-observability" },
      { personId: "person-lena", skillId: "skill-aws" },
      { personId: "person-lena", skillId: "skill-kubernetes" },
      { personId: "person-lena", skillId: "skill-serverless" },
      { personId: "person-lena", skillId: "skill-security" },
      { personId: "person-lena", skillId: "skill-docker" },
      { personId: "person-jules", skillId: "skill-typescript" },
      { personId: "person-jules", skillId: "skill-nodejs" },
      { personId: "person-jules", skillId: "skill-system-design" },
      { personId: "person-jules", skillId: "skill-api-design" },
      { personId: "person-jules", skillId: "skill-microservices" },
    ];

    logSection("Linking people to skills");
    for (const connection of personSkills) {
      await runWrite(
        session,
        "MATCH (p:Person {id: $personId}) MATCH (s:Skill {id: $skillId}) MERGE (p)-[:HAS_SKILL]->(s)",
        connection
      );
    }

    const projects = [
      { id: "project-careergraph", name: "CareerGraph", description: "Career exploration platform using graph data and skill recommendations.", difficulty: "Medium" },
      { id: "project-supply-ops", name: "Supply Chain Ops Portal", description: "Operations dashboard for inventory monitoring and fulfillment metrics.", difficulty: "Medium" },
      { id: "project-ml-chatbot", name: "AI Customer Support Copilot", description: "LLM assistant to help customers resolve issues and find answers.", difficulty: "Hard" },
      { id: "project-merch-analytics", name: "Merch Analytics Studio", description: "Real-time dashboard for growth and retention analytics.", difficulty: "Medium" },
      { id: "project-billing-apis", name: "Billing API Gateway", description: "Enables billing, invoicing, and payment flows across services.", difficulty: "Hard" },
      { id: "project-infra-templates", name: "Infrastructure Templates", description: "Reusable deployment and configuration libraries for platform teams.", difficulty: "Medium" },
      { id: "project-ua-automation", name: "UX Automation", description: "Design tooling and automation for experiment-driven design iteration.", difficulty: "Medium" },
      { id: "project-ml-features", name: "Feature Ranking Pipeline", description: "Data pipeline to surface model-driven product recommendations.", difficulty: "Hard" },
      { id: "project-warehouse-sync", name: "Warehouse Sync Service", description: "Integrates inventory systems and shipping data in near real time.", difficulty: "Hard" },
      { id: "project-identity-platform", name: "Identity Platform", description: "Authentication and authorization service for multi-tenant apps.", difficulty: "Hard" },
      { id: "project-monitoring-suite", name: "Monitoring Suite", description: "Cross-service observability and alerting dashboards.", difficulty: "Medium" },
      { id: "project-collab-editor", name: "Realtime Collaboration Editor", description: "Multi-user editing experiences with sync and conflict resolution.", difficulty: "Hard" },
      { id: "project-search-relevance", name: "Search Relevance Lab", description: "Ranking and experimentation system for product search quality.", difficulty: "Hard" },
      { id: "project-mlops", name: "Model Operations Platform", description: "Deployment, evaluation, and monitoring for ML workloads.", difficulty: "Hard" },
      { id: "project-warehouse-ml", name: "Demand Forecasting", description: "Forecasting engine for retail inventory planning.", difficulty: "Hard" },
      { id: "project-api-gateway", name: "API Gateway", description: "Central broker for routing, auth, and traffic management.", difficulty: "Medium" },
      { id: "project-design-system", name: "Design System", description: "Reusable UI foundations and accessibility patterns across teams.", difficulty: "Medium" },
      { id: "project-knowledge-base", name: "Knowledge Base AI", description: "Search and summarization experience for internal documentation.", difficulty: "Medium" },
      { id: "project-analytics-ingestion", name: "Analytics Ingestion", description: "Clean streaming ingestion pipeline for product metrics.", difficulty: "Medium" },
      { id: "project-payments-ops", name: "Payments Operations", description: "Monitors payment health and orchestrates transaction alerting.", difficulty: "Hard" },
    ];

    logSection("Creating projects");
    for (const project of projects) {
      await runWrite(
        session,
        "MERGE (p:Project {id: $id}) SET p.name = $name, p.description = $description, p.difficulty = $difficulty",
        project
      );
    }

    const personProjectLinks = [
      { personId: "person-alice", projectId: "project-design-system" },
      { personId: "person-alice", projectId: "project-careergraph" },
      { personId: "person-alice", projectId: "project-ua-automation" },
      { personId: "person-ben", projectId: "project-collab-editor" },
      { personId: "person-ben", projectId: "project-api-gateway" },
      { personId: "person-ben", projectId: "project-billing-apis" },
      { personId: "person-priya", projectId: "project-billing-apis" },
      { personId: "person-priya", projectId: "project-identity-platform" },
      { personId: "person-priya", projectId: "project-supply-ops" },
      { personId: "person-martin", projectId: "project-careergraph" },
      { personId: "person-martin", projectId: "project-knowledge-base" },
      { personId: "person-nina", projectId: "project-analytics-ingestion" },
      { personId: "person-nina", projectId: "project-search-relevance" },
      { personId: "person-nina", projectId: "project-warehouse-ml" },
      { personId: "person-omar", projectId: "project-ml-chatbot" },
      { personId: "person-omar", projectId: "project-mlops" },
      { personId: "person-omar", projectId: "project-knowledge-base" },
      { personId: "person-sofia", projectId: "project-design-system" },
      { personId: "person-sofia", projectId: "project-ua-automation" },
      { personId: "person-sofia", projectId: "project-careergraph" },
      { personId: "person-daniel", projectId: "project-monitoring-suite" },
      { personId: "person-daniel", projectId: "project-infra-templates" },
      { personId: "person-lena", projectId: "project-identity-platform" },
      { personId: "person-lena", projectId: "project-monitoring-suite" },
      { personId: "person-jules", projectId: "project-api-gateway" },
      { personId: "person-jules", projectId: "project-supply-ops" },
    ];

    for (const connection of personProjectLinks) {
      await runWrite(
        session,
        "MATCH (p:Person {id: $personId}) MATCH (pr:Project {id: $projectId}) MERGE (p)-[:WORKED_ON]->(pr)",
        connection
      );
    }

    const projectTechLinks = [
      { projectId: "project-careergraph", techId: "tech-react" },
      { projectId: "project-careergraph", techId: "tech-nextjs" },
      { projectId: "project-careergraph", techId: "tech-typescript" },
      { projectId: "project-careergraph", techId: "tech-cognodb" },
      { projectId: "project-supply-ops", techId: "tech-postgresql" },
      { projectId: "project-supply-ops", techId: "tech-redis" },
      { projectId: "project-supply-ops", techId: "tech-aws" },
      { projectId: "project-ml-chatbot", techId: "tech-python" },
      { projectId: "project-ml-chatbot", techId: "tech-fastapi" },
      { projectId: "project-ml-chatbot", techId: "tech-openai-api" },
      { projectId: "project-ml-chatbot", techId: "tech-pytorch" },
      { projectId: "project-merch-analytics", techId: "tech-kafka" },
      { projectId: "project-merch-analytics", techId: "tech-postgresql" },
      { projectId: "project-merch-analytics", techId: "tech-aws" },
      { projectId: "project-billing-apis", techId: "tech-nodejs" },
      { projectId: "project-billing-apis", techId: "tech-express" },
      { projectId: "project-billing-apis", techId: "tech-rest" },
      { projectId: "project-billing-apis", techId: "tech-postgresql" },
      { projectId: "project-infra-templates", techId: "tech-docker" },
      { projectId: "project-infra-templates", techId: "tech-kubernetes" },
      { projectId: "project-infra-templates", techId: "tech-aws" },
      { projectId: "project-ua-automation", techId: "tech-figma" },
      { projectId: "project-ua-automation", techId: "tech-react" },
      { projectId: "project-ml-features", techId: "tech-python" },
      { projectId: "project-ml-features", techId: "tech-pytorch" },
      { projectId: "project-ml-features", techId: "tech-kinesis" },
      { projectId: "project-warehouse-sync", techId: "tech-kafka" },
      { projectId: "project-warehouse-sync", techId: "tech-nodejs" },
      { projectId: "project-warehouse-sync", techId: "tech-postgresql" },
      { projectId: "project-identity-platform", techId: "tech-aws" },
      { projectId: "project-identity-platform", techId: "tech-serverless" },
      { projectId: "project-monitoring-suite", techId: "tech-docker" },
      { projectId: "project-monitoring-suite", techId: "tech-observability" },
      { projectId: "project-monitoring-suite", techId: "tech-kubernetes" },
      { projectId: "project-collab-editor", techId: "tech-react" },
      { projectId: "project-collab-editor", techId: "tech-nodejs" },
      { projectId: "project-collab-editor", techId: "tech-websocket" },
      { projectId: "project-search-relevance", techId: "tech-python" },
      { projectId: "project-search-relevance", techId: "tech-kafka" },
      { projectId: "project-mlops", techId: "tech-python" },
      { projectId: "project-mlops", techId: "tech-kubernetes" },
      { projectId: "project-mlops", techId: "tech-aws" },
      { projectId: "project-api-gateway", techId: "tech-nodejs" },
      { projectId: "project-api-gateway", techId: "tech-express" },
      { projectId: "project-api-gateway", techId: "tech-graphql" },
      { projectId: "project-design-system", techId: "tech-react" },
      { projectId: "project-design-system", techId: "tech-tailwind" },
      { projectId: "project-design-system", techId: "tech-figma" },
      { projectId: "project-knowledge-base", techId: "tech-openai-api" },
      { projectId: "project-knowledge-base", techId: "tech-nextjs" },
      { projectId: "project-analytics-ingestion", techId: "tech-kafka" },
      { projectId: "project-analytics-ingestion", techId: "tech-python" },
      { projectId: "project-payments-ops", techId: "tech-postgresql" },
      { projectId: "project-payments-ops", techId: "tech-redis" },
      { projectId: "project-payments-ops", techId: "tech-aws" },
    ];

    for (const connection of projectTechLinks) {
      await runWrite(
        session,
        "MATCH (pr:Project {id: $projectId}) MATCH (t:Technology {id: $techId}) MERGE (pr)-[:USES]->(t)",
        connection
      );
    }

    const projectSkillLinks = [
      { projectId: "project-careergraph", skillId: "skill-react" },
      { projectId: "project-careergraph", skillId: "skill-typescript" },
      { projectId: "project-careergraph", skillId: "skill-graph-db" },
      { projectId: "project-careergraph", skillId: "skill-cypher" },
      { projectId: "project-supply-ops", skillId: "skill-sql" },
      { projectId: "project-supply-ops", skillId: "skill-system-design" },
      { projectId: "project-supply-ops", skillId: "skill-observability" },
      { projectId: "project-ml-chatbot", skillId: "skill-python" },
      { projectId: "project-ml-chatbot", skillId: "skill-llm-apps" },
      { projectId: "project-ml-chatbot", skillId: "skill-api-design" },
      { projectId: "project-merch-analytics", skillId: "skill-data-engineering" },
      { projectId: "project-merch-analytics", skillId: "skill-sql" },
      { projectId: "project-merch-analytics", skillId: "skill-kafka" },
      { projectId: "project-billing-apis", skillId: "skill-rest-apis" },
      { projectId: "project-billing-apis", skillId: "skill-security" },
      { projectId: "project-billing-apis", skillId: "skill-system-design" },
      { projectId: "project-infra-templates", skillId: "skill-docker" },
      { projectId: "project-infra-templates", skillId: "skill-kubernetes" },
      { projectId: "project-infra-templates", skillId: "skill-ci-cd" },
      { projectId: "project-ua-automation", skillId: "skill-ux-design" },
      { projectId: "project-ua-automation", skillId: "skill-prototyping" },
      { projectId: "project-ml-features", skillId: "skill-machine-learning" },
      { projectId: "project-ml-features", skillId: "skill-python" },
      { projectId: "project-warehouse-sync", skillId: "skill-event-driven" },
      { projectId: "project-warehouse-sync", skillId: "skill-distributed-systems" },
      { projectId: "project-identity-platform", skillId: "skill-auth" },
      { projectId: "project-identity-platform", skillId: "skill-security" },
      { projectId: "project-monitoring-suite", skillId: "skill-observability" },
      { projectId: "project-monitoring-suite", skillId: "skill-ci-cd" },
      { projectId: "project-collab-editor", skillId: "skill-react" },
      { projectId: "project-collab-editor", skillId: "skill-testing" },
      { projectId: "project-search-relevance", skillId: "skill-algorithms" },
      { projectId: "project-search-relevance", skillId: "skill-data-engineering" },
      { projectId: "project-mlops", skillId: "skill-machine-learning" },
      { projectId: "project-mlops", skillId: "skill-ci-cd" },
      { projectId: "project-api-gateway", skillId: "skill-rest-apis" },
      { projectId: "project-api-gateway", skillId: "skill-graphql" },
      { projectId: "project-design-system", skillId: "skill-ux-design" },
      { projectId: "project-design-system", skillId: "skill-accessibility" },
      { projectId: "project-knowledge-base", skillId: "skill-llm-apps" },
      { projectId: "project-knowledge-base", skillId: "skill-openai-api" },
      { projectId: "project-analytics-ingestion", skillId: "skill-data-engineering" },
      { projectId: "project-analytics-ingestion", skillId: "skill-kafka" },
      { projectId: "project-payments-ops", skillId: "skill-security" },
      { projectId: "project-payments-ops", skillId: "skill-monitoring" },
    ];

    for (const connection of projectSkillLinks) {
      await runWrite(
        session,
        "MATCH (pr:Project {id: $projectId}) MATCH (s:Skill {id: $skillId}) MERGE (pr)-[:DEMONSTRATES]->(s)",
        connection
      );
    }

    const skillRelatedPairs = [
      { source: "skill-react", target: "skill-typescript" },
      { source: "skill-react", target: "skill-nextjs" },
      { source: "skill-react", target: "skill-css" },
      { source: "skill-nextjs", target: "skill-nodejs" },
      { source: "skill-nextjs", target: "skill-react" },
      { source: "skill-nodejs", target: "skill-express" },
      { source: "skill-nodejs", target: "skill-rest-apis" },
      { source: "skill-typescript", target: "skill-javascript" },
      { source: "skill-postgresql", target: "skill-sql" },
      { source: "skill-docker", target: "skill-kubernetes" },
      { source: "skill-aws", target: "skill-docker" },
      { source: "skill-python", target: "skill-fastapi" },
      { source: "skill-python", target: "skill-machine-learning" },
      { source: "skill-machine-learning", target: "skill-pytorch" },
      { source: "skill-machine-learning", target: "skill-tensorflow" },
      { source: "skill-openai-api", target: "skill-llm-apps" },
      { source: "skill-graphql", target: "skill-rest-apis" },
      { source: "skill-sql", target: "skill-postgresql" },
      { source: "skill-accessibility", target: "skill-ux-design" },
      { source: "skill-testing", target: "skill-ci-cd" },
      { source: "skill-system-design", target: "skill-distributed-systems" },
      { source: "skill-communication", target: "skill-product-thinking" },
      { source: "skill-redis", target: "skill-caching" },
      { source: "skill-cypher", target: "skill-graph-db" },
      { source: "skill-graph-db", target: "skill-cypher" },
      { source: "skill-api-design", target: "skill-rest-apis" },
      { source: "skill-docker", target: "skill-ci-cd" },
      { source: "skill-kafka", target: "skill-event-driven" },
      { source: "skill-security", target: "skill-auth" },
      { source: "skill-observability", target: "skill-monitoring" },
    ];

    logSection("Creating skill-relatedness edges");
    for (const relation of skillRelatedPairs) {
      await runWrite(
        session,
        "MATCH (s1:Skill {id: $source}) MATCH (s2:Skill {id: $target}) MERGE (s1)-[:RELATED_TO]->(s2)",
        relation
      );
    }

    const technologyRelatedPairs = [
      { source: "tech-react", target: "tech-nextjs" },
      { source: "tech-react", target: "tech-typescript" },
      { source: "tech-nextjs", target: "tech-nodejs" },
      { source: "tech-nodejs", target: "tech-express" },
      { source: "tech-nodejs", target: "tech-rest" },
      { source: "tech-typescript", target: "tech-javascript" },
      { source: "tech-postgresql", target: "tech-sql" },
      { source: "tech-docker", target: "tech-kubernetes" },
      { source: "tech-aws", target: "tech-docker" },
      { source: "tech-python", target: "tech-fastapi" },
      { source: "tech-python", target: "tech-pytorch" },
      { source: "tech-pytorch", target: "tech-tensorflow" },
      { source: "tech-openai-api", target: "tech-python" },
      { source: "tech-graphql", target: "tech-rest" },
      { source: "tech-figma", target: "tech-react" },
      { source: "tech-tailwind", target: "tech-css" },
      { source: "tech-cognodb", target: "tech-neo4j" },
      { source: "tech-kafka", target: "tech-kinesis" },
      { source: "tech-aws", target: "tech-serverless" },
      { source: "tech-docker", target: "tech-observability" },
    ];

    logSection("Creating technology relatedness edges");
    for (const relation of technologyRelatedPairs) {
      await runWrite(
        session,
        "MATCH (t1:Technology {id: $source}) MATCH (t2:Technology {id: $target}) MERGE (t1)-[:RELATED_TO]->(t2)",
        relation
      );
    }

    const roleRequirements = [
      { roleId: "role-frontend-engineer", skillId: "skill-react" },
      { roleId: "role-frontend-engineer", skillId: "skill-typescript" },
      { roleId: "role-frontend-engineer", skillId: "skill-javascript" },
      { roleId: "role-frontend-engineer", skillId: "skill-css" },
      { roleId: "role-frontend-engineer", skillId: "skill-testing" },
      { roleId: "role-frontend-engineer", skillId: "skill-accessibility" },
      { roleId: "role-full-stack-engineer", skillId: "skill-react" },
      { roleId: "role-full-stack-engineer", skillId: "skill-typescript" },
      { roleId: "role-full-stack-engineer", skillId: "skill-nodejs" },
      { roleId: "role-full-stack-engineer", skillId: "skill-rest-apis" },
      { roleId: "role-full-stack-engineer", skillId: "skill-postgresql" },
      { roleId: "role-full-stack-engineer", skillId: "skill-docker" },
      { roleId: "role-backend-engineer", skillId: "skill-nodejs" },
      { roleId: "role-backend-engineer", skillId: "skill-rest-apis" },
      { roleId: "role-backend-engineer", skillId: "skill-postgresql" },
      { roleId: "role-backend-engineer", skillId: "skill-docker" },
      { roleId: "role-backend-engineer", skillId: "skill-system-design" },
      { roleId: "role-senior-backend-engineer", skillId: "skill-nodejs" },
      { roleId: "role-senior-backend-engineer", skillId: "skill-rest-apis" },
      { roleId: "role-senior-backend-engineer", skillId: "skill-postgresql" },
      { roleId: "role-senior-backend-engineer", skillId: "skill-distributed-systems" },
      { roleId: "role-senior-backend-engineer", skillId: "skill-caching" },
      { roleId: "role-staff-frontend-engineer", skillId: "skill-react" },
      { roleId: "role-staff-frontend-engineer", skillId: "skill-typescript" },
      { roleId: "role-staff-frontend-engineer", skillId: "skill-ux-design" },
      { roleId: "role-staff-frontend-engineer", skillId: "skill-testing" },
      { roleId: "role-product-engineer", skillId: "skill-react" },
      { roleId: "role-product-engineer", skillId: "skill-product-thinking" },
      { roleId: "role-product-engineer", skillId: "skill-communication" },
      { roleId: "role-product-engineer", skillId: "skill-api-design" },
      { roleId: "role-devops-engineer", skillId: "skill-docker" },
      { roleId: "role-devops-engineer", skillId: "skill-kubernetes" },
      { roleId: "role-devops-engineer", skillId: "skill-aws" },
      { roleId: "role-devops-engineer", skillId: "skill-ci-cd" },
      { roleId: "role-platform-engineer", skillId: "skill-system-design" },
      { roleId: "role-platform-engineer", skillId: "skill-distributed-systems" },
      { roleId: "role-platform-engineer", skillId: "skill-kubernetes" },
      { roleId: "role-cloud-engineer", skillId: "skill-aws" },
      { roleId: "role-cloud-engineer", skillId: "skill-docker" },
      { roleId: "role-cloud-engineer", skillId: "skill-serverless" },
      { roleId: "role-data-engineer", skillId: "skill-sql" },
      { roleId: "role-data-engineer", skillId: "skill-data-engineering" },
      { roleId: "role-data-engineer", skillId: "skill-kafka" },
      { roleId: "role-ai-engineer", skillId: "skill-python" },
      { roleId: "role-ai-engineer", skillId: "skill-machine-learning" },
      { roleId: "role-ai-engineer", skillId: "skill-openai-api" },
      { roleId: "role-ai-engineer", skillId: "skill-api-design" },
      { roleId: "role-ml-engineer", skillId: "skill-python" },
      { roleId: "role-ml-engineer", skillId: "skill-machine-learning" },
      { roleId: "role-ml-engineer", skillId: "skill-pytorch" },
      { roleId: "role-ml-engineer", skillId: "skill-data-engineering" },
      { roleId: "role-data-scientist", skillId: "skill-python" },
      { roleId: "role-data-scientist", skillId: "skill-machine-learning" },
      { roleId: "role-data-scientist", skillId: "skill-sql" },
      { roleId: "role-data-scientist", skillId: "skill-data-engineering" },
      { roleId: "role-solutions-architect", skillId: "skill-system-design" },
      { roleId: "role-solutions-architect", skillId: "skill-api-design" },
      { roleId: "role-solutions-architect", skillId: "skill-communication" },
      { roleId: "role-security-engineer", skillId: "skill-security" },
      { roleId: "role-security-engineer", skillId: "skill-auth" },
      { roleId: "role-security-engineer", skillId: "skill-system-design" },
      { roleId: "role-sre", skillId: "skill-docker" },
      { roleId: "role-sre", skillId: "skill-kubernetes" },
      { roleId: "role-sre", skillId: "skill-observability" },
      { roleId: "role-engineering-manager", skillId: "skill-communication" },
      { roleId: "role-engineering-manager", skillId: "skill-product-thinking" },
      { roleId: "role-engineering-manager", skillId: "skill-system-design" },
      { roleId: "role-ux-engineer", skillId: "skill-react" },
      { roleId: "role-ux-engineer", skillId: "skill-ux-design" },
      { roleId: "role-ux-engineer", skillId: "skill-accessibility" },
      { roleId: "role-product-designer", skillId: "skill-ux-design" },
      { roleId: "role-product-designer", skillId: "skill-ux-research" },
      { roleId: "role-product-designer", skillId: "skill-prototyping" },
      { roleId: "role-technical-product-manager", skillId: "skill-product-thinking" },
      { roleId: "role-technical-product-manager", skillId: "skill-communication" },
      { roleId: "role-technical-product-manager", skillId: "skill-api-design" },
    ];

    logSection("Creating role-to-skill requirements");
    for (const connection of roleRequirements) {
      await runWrite(
        session,
        "MATCH (r:Role {id: $roleId}) MATCH (s:Skill {id: $skillId}) MERGE (r)-[:REQUIRES]->(s)",
        connection
      );
    }

    const roleTechnologyUsage = [
      { roleId: "role-frontend-engineer", techId: "tech-react" },
      { roleId: "role-frontend-engineer", techId: "tech-typescript" },
      { roleId: "role-frontend-engineer", techId: "tech-tailwind" },
      { roleId: "role-full-stack-engineer", techId: "tech-react" },
      { roleId: "role-full-stack-engineer", techId: "tech-nextjs" },
      { roleId: "role-full-stack-engineer", techId: "tech-nodejs" },
      { roleId: "role-full-stack-engineer", techId: "tech-postgresql" },
      { roleId: "role-backend-engineer", techId: "tech-nodejs" },
      { roleId: "role-backend-engineer", techId: "tech-express" },
      { roleId: "role-backend-engineer", techId: "tech-rest" },
      { roleId: "role-backend-engineer", techId: "tech-postgresql" },
      { roleId: "role-senior-backend-engineer", techId: "tech-nodejs" },
      { roleId: "role-senior-backend-engineer", techId: "tech-kafka" },
      { roleId: "role-senior-backend-engineer", techId: "tech-redis" },
      { roleId: "role-senior-backend-engineer", techId: "tech-aws" },
      { roleId: "role-staff-frontend-engineer", techId: "tech-react" },
      { roleId: "role-staff-frontend-engineer", techId: "tech-nextjs" },
      { roleId: "role-staff-frontend-engineer", techId: "tech-tailwind" },
      { roleId: "role-product-engineer", techId: "tech-react" },
      { roleId: "role-product-engineer", techId: "tech-nextjs" },
      { roleId: "role-devops-engineer", techId: "tech-docker" },
      { roleId: "role-devops-engineer", techId: "tech-kubernetes" },
      { roleId: "role-devops-engineer", techId: "tech-ci-cd" },
      { roleId: "role-platform-engineer", techId: "tech-kubernetes" },
      { roleId: "role-platform-engineer", techId: "tech-aws" },
      { roleId: "role-cloud-engineer", techId: "tech-aws" },
      { roleId: "role-cloud-engineer", techId: "tech-docker" },
      { roleId: "role-cloud-engineer", techId: "tech-serverless" },
      { roleId: "role-data-engineer", techId: "tech-python" },
      { roleId: "role-data-engineer", techId: "tech-kafka" },
      { roleId: "role-data-engineer", techId: "tech-postgresql" },
      { roleId: "role-ai-engineer", techId: "tech-python" },
      { roleId: "role-ai-engineer", techId: "tech-openai-api" },
      { roleId: "role-ai-engineer", techId: "tech-fastapi" },
      { roleId: "role-ml-engineer", techId: "tech-python" },
      { roleId: "role-ml-engineer", techId: "tech-pytorch" },
      { roleId: "role-ml-engineer", techId: "tech-tensorflow" },
      { roleId: "role-data-scientist", techId: "tech-python" },
      { roleId: "role-data-scientist", techId: "tech-postgresql" },
      { roleId: "role-data-scientist", techId: "tech-kafka" },
      { roleId: "role-solutions-architect", techId: "tech-aws" },
      { roleId: "role-solutions-architect", techId: "tech-rest" },
      { roleId: "role-solutions-architect", techId: "tech-graphql" },
      { roleId: "role-security-engineer", techId: "tech-aws" },
      { roleId: "role-security-engineer", techId: "tech-observability" },
      { roleId: "role-sre", techId: "tech-docker" },
      { roleId: "role-sre", techId: "tech-kubernetes" },
      { roleId: "role-sre", techId: "tech-observability" },
      { roleId: "role-engineering-manager", techId: "tech-graphql" },
      { roleId: "role-engineering-manager", techId: "tech-ci-cd" },
      { roleId: "role-ux-engineer", techId: "tech-react" },
      { roleId: "role-ux-engineer", techId: "tech-figma" },
      { roleId: "role-product-designer", techId: "tech-figma" },
      { roleId: "role-technical-product-manager", techId: "tech-graphql" },
      { roleId: "role-technical-product-manager", techId: "tech-aws" },
    ];

    logSection("Creating role-to-technology usage");
    for (const connection of roleTechnologyUsage) {
      await runWrite(
        session,
        "MATCH (r:Role {id: $roleId}) MATCH (t:Technology {id: $techId}) MERGE (r)-[:USES]->(t)",
        connection
      );
    }

    const skillLeadsTo = [
      { skillId: "skill-react", roleId: "role-frontend-engineer" },
      { skillId: "skill-react", roleId: "role-full-stack-engineer" },
      { skillId: "skill-typescript", roleId: "role-full-stack-engineer" },
      { skillId: "skill-nodejs", roleId: "role-backend-engineer" },
      { skillId: "skill-rest-apis", roleId: "role-backend-engineer" },
      { skillId: "skill-system-design", roleId: "role-senior-backend-engineer" },
      { skillId: "skill-docker", roleId: "role-devops-engineer" },
      { skillId: "skill-aws", roleId: "role-cloud-engineer" },
      { skillId: "skill-python", roleId: "role-ai-engineer" },
      { skillId: "skill-machine-learning", roleId: "role-ml-engineer" },
      { skillId: "skill-data-engineering", roleId: "role-data-engineer" },
      { skillId: "skill-ux-design", roleId: "role-ux-engineer" },
      { skillId: "skill-product-thinking", roleId: "role-technical-product-manager" },
      { skillId: "skill-security", roleId: "role-security-engineer" },
      { skillId: "skill-observability", roleId: "role-sre" },
    ];

    logSection("Creating skill-to-role progression edges");
    for (const connection of skillLeadsTo) {
      await runWrite(
        session,
        "MATCH (s:Skill {id: $skillId}) MATCH (r:Role {id: $roleId}) MERGE (s)-[:LEADS_TO]->(r)",
        connection
      );
    }

    const technologyLeadsTo = [
      { techId: "tech-react", roleId: "role-frontend-engineer" },
      { techId: "tech-nextjs", roleId: "role-full-stack-engineer" },
      { techId: "tech-nodejs", roleId: "role-backend-engineer" },
      { techId: "tech-postgresql", roleId: "role-data-engineer" },
      { techId: "tech-pytorch", roleId: "role-ml-engineer" },
      { techId: "tech-openai-api", roleId: "role-ai-engineer" },
      { techId: "tech-aws", roleId: "role-cloud-engineer" },
      { techId: "tech-kubernetes", roleId: "role-sre" },
      { techId: "tech-figma", roleId: "role-product-designer" },
    ];

    logSection("Creating technology-to-role progression edges");
    for (const connection of technologyLeadsTo) {
      await runWrite(
        session,
        "MATCH (t:Technology {id: $techId}) MATCH (r:Role {id: $roleId}) MERGE (t)-[:LEADS_TO]->(r)",
        connection
      );
    }

    logSection("Final verification");
    await verifyCounts(session);
    console.log("\nSeed completed successfully.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Seeding failed:", message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
