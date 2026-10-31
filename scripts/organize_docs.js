const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const mdDir = path.join(rootDir, 'MD');

const subdirs = [
  'design',
  'ai-agents',
  'maps-and-routing',
  'architecture',
  'security',
  'testing',
  'deployment',
  'research',
  'reports'
];

subdirs.forEach(dir => {
  const target = path.join(mdDir, dir);
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
    console.log(`Created directory: ${target}`);
  }
});

const fileMapping = {
  // Design
  'ATTRACTION_IMAGE_AUDIT.md': 'design',
  'NAVBAR_I18N_IMPLEMENTATION.md': 'design',
  'DESIGN_SYSTEM.md': 'design',
  'TYPOGRAPHY_AND_CONTRAST_AUDIT.md': 'design',
  'UI_UX_IMPLEMENTATION_REPORT.md': 'design',

  // AI Agents
  'AI_AGENT_EXECUTION_REPORT.md': 'ai-agents',
  'AI_CHATBOT_ROOT_CAUSE_REPORT.md': 'ai-agents',
  'AI_AGENT_EXECUTION_VERIFICATION.md': 'ai-agents',
  'AI_AGENT_USER_EXPERIENCE_REPORT.md': 'ai-agents',

  // Maps and Routing
  'FEASIBILITY_MATH.md': 'maps-and-routing',
  'MAP_AND_ROUTING_ACCURACY_REPORT.md': 'maps-and-routing',
  'MAP_AND_ROUTING_COMPARISON_REPORT.md': 'maps-and-routing',
  'ROUTE_ANIMATION_AND_MOTION_SYSTEM.md': 'maps-and-routing',

  // Architecture
  'API_DOCUMENTATION.md': 'architecture',
  'API_SPEC.md': 'architecture',
  'ARCHITECTURE.md': 'architecture',
  'TOURISM_WORKFLOW.md': 'architecture',
  'MASTER_TRANSFORMATION_PLAN.md': 'architecture',
  'PROJECT_DEPENDENCY_INVENTORY.md': 'architecture',
  'DEPENDENCY_AND_RUNTIME_VERIFICATION.md': 'architecture',
  'LOCAL_RUNTIME_DIAGNOSTIC.md': 'architecture',

  // Security
  'AI_AGENT_SECURITY.md': 'security',
  'API_SECURITY.md': 'security',
  'AUTHENTICATION.md': 'security',
  'AUTHORIZATION.md': 'security',
  'DATABASE_SECURITY.md': 'security',
  'FINAL_SECURITY_AND_AUTH_REPORT.md': 'security',
  'PASSWORD_RESET_IMPLEMENTATION.md': 'security',
  'PRIVACY_POLICY.md': 'security',
  'PROJECT_SECURITY_BASELINE.md': 'security',
  'SECURITY.md': 'security',
  'SECURITY_AUDIT.md': 'security',

  // Testing
  'ACCEPTANCE_TESTS.md': 'testing',
  'AGENT_TEST_REPORT.md': 'testing',
  'AGENT_TEST_RESULTS.md': 'testing',
  'FINAL_IMPLEMENTATION_VERIFICATION.md': 'testing',
  'TESTING.md': 'testing',
  'ROUTE_BY_ROUTE_BROWSER_QA.md': 'testing',
  'FINAL_BROWSER_VISUAL_REGRESSION_REPORT.md': 'testing',
  'FINAL_VISUAL_REGRESSION_REPORT.md': 'testing',

  // Deployment
  'ADMIN_GUIDE.md': 'deployment',
  'BACKUP_AND_RECOVERY.md': 'deployment',
  'DEPLOYMENT.md': 'deployment',
  'DEPLOYMENT_PRECHECK_REPORT.md': 'deployment',
  'ENVIRONMENT_SETUP.md': 'deployment',
  'LIVE_DEPLOYMENT_TEST_REPORT.md': 'deployment',
  'PRODUCTION_DEPLOYMENT_CHECKLIST.md': 'deployment',
  'PRODUCTION_DEPLOYMENT_GUIDE.md': 'deployment',
  'PRODUCTION_ENVIRONMENT_VARIABLES.md': 'deployment',
  'SERVICE_STARTUP_GUIDE.md': 'deployment',

  // Research
  'DATASET_EXPLORATION.md': 'research',
  'LIVE_DESIGN_REFERENCE_RESEARCH.md': 'research',
  'INTERNATIONAL_UI_UX_BENCHMARK_REPORT.md': 'research',
  'BEYOND_THE_FORT_COMPETITIVE_SCORECARD.md': 'research',
  'BEYOND_THE_FORT_PRODUCT_DIFFERENTIATION.md': 'research',

  // Reports
  'ARCHIVE_MANIFEST.md': 'reports',
  'BACKEND_AND_AGENT_AUDIT.md': 'reports',
  'CHANGELOG.md': 'reports',
  'FINAL_PROJECT_READINESS_REPORT.md': 'reports',
  'FINAL_SYSTEM_READINESS_REPORT.md': 'reports',
  'USER_GUIDE.md': 'reports',
  'COMPLETE_UI_UX_AUDIT.md': 'reports',
  'FINAL_PRODUCT_QUALITY_REPORT.md': 'reports',
  'FINAL_TRANSFORMATION_REPORT.md': 'reports',
  'FINAL_UI_UX_ISSUE_TRACKER.md': 'reports',
  'FINAL_UI_UX_REFINEMENT_AUDIT.md': 'reports',
  'PRODUCT_IMPROVEMENT_ROADMAP.md': 'reports'
};

let movedCount = 0;

for (const [filename, category] of Object.entries(fileMapping)) {
  const rootSource = path.join(rootDir, filename);
  const mdSource = path.join(mdDir, filename);
  const target = path.join(mdDir, category, filename);

  let source = null;
  if (fs.existsSync(rootSource)) {
    source = rootSource;
  } else if (fs.existsSync(mdSource)) {
    source = mdSource;
  }

  if (source && source !== target) {
    fs.copyFileSync(source, target);
    fs.unlinkSync(source);
    console.log(`Moved: ${filename} -> MD/${category}/${filename}`);
    movedCount++;
  } else if (!source && fs.existsSync(target)) {
    console.log(`Already in place: MD/${category}/${filename}`);
  } else {
    console.warn(`File not found: ${filename}`);
  }
}

console.log(`Successfully organized ${movedCount} markdown files into MD subdirectories.`);

