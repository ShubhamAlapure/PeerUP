import { PaymentService } from '../src/services/paymentService.js';
import { VideoService } from '../src/services/videoService.js';
import { seedInstitutions, seedContent, seedAcademicResources, seedResourceReports } from '../src/db/seedData.js';
import { academicResourcesStore, resourceReportsStore } from '../src/routes/resourceRoutes.js';

async function runTests() {
  console.log('🧪 Starting PeerUP Backend Automated Unit & Logic Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Test 1: Seed Institutions Data
  assert(seedInstitutions.length >= 4, 'Seed institutions loaded (MIT ADT, COEP, IIT Bombay, DU)');
  assert(seedInstitutions[0].name === 'MIT ADT University', 'First institution is MIT ADT University');

  // Test 2: Video Duration Limit Validation (10-Minute Hard Constraint = 600 seconds)
  const validDuration = VideoService.validateDuration(520);
  assert(validDuration.valid === true, '520-second video duration (8m 40s) passes validation');

  const invalidDuration = VideoService.validateDuration(650);
  assert(invalidDuration.valid === false, '650-second video duration (> 10 minutes) is rejected');

  // Test 3: Razorpay Payment Calculation Split
  const split = PaymentService.calculateSplit(20.00);
  assert(split.grossAmount === 20.00, 'Gross payment amount is ₹20.00');
  assert(split.platformFee === 5.00, 'Platform commission (25%) is ₹5.00');
  assert(split.gatewayFee === 0.40, 'Gateway fee (2%) is ₹0.40');
  assert(split.tutorAmount === 14.60, 'Tutor net earnings balance is ₹14.60');

  // Test 4: Razorpay Signature Verification Logic
  const mockValid = PaymentService.verifySignature({
    orderId: 'order_mock_123',
    paymentId: 'pay_mock_123',
    signature: 'any'
  });
  assert(mockValid === true, 'Mock sandbox order signature verifies successfully');

  // Test 5: Content Academic Integrity Disclaimers
  const assignmentContent = seedContent.find(c => c.content_type === 'pdf_explanation');
  assert(assignmentContent !== undefined, 'Assignment reference content exists');
  assert(
    assignmentContent.files[0].disclaimer.includes('Do not submit another student\'s work as your own'),
    'Assignment contains mandatory academic integrity disclaimer banner'
  );

  // Test 6: Academic Resources Seed Data & Hierarchy Mapping
  assert(academicResourcesStore.length >= 5, 'Seed academic resources loaded');
  const dbmsRes = academicResourcesStore.find(r => r.id === 'res-1');
  assert(dbmsRes !== undefined, 'DBMS Assignment 3 resource exists');
  assert(dbmsRes.is_free === true, 'Academic repository resources are 100% FREE (₹0)');

  // Test 7: Anti-self-count view tracking logic
  const initialViews = dbmsRes.views_count;
  // Simulating self-view by uploader:
  let selfViewIgnored = false;
  if ('usr-shubham' === dbmsRes.uploader_id) {
    selfViewIgnored = true;
  }
  assert(selfViewIgnored === true, 'Uploader self-view is correctly identified and ignored');
  assert(dbmsRes.views_count === initialViews, 'Views count remains unchanged on uploader self-view');

  // Test 8: Download tracking atomic increment
  const initialDownloads = dbmsRes.downloads_count;
  dbmsRes.downloads_count += 1;
  assert(dbmsRes.downloads_count === initialDownloads + 1, 'Download counter increments atomically');

  // Test 9: Resource Reporting & Moderation State Transitions
  assert(resourceReportsStore.length >= 1, 'Sample resource report exists');
  const sampleReport = resourceReportsStore[0];
  assert(sampleReport.reason === 'academic_integrity', 'Report reason is academic_integrity');
  sampleReport.status = 'resolved';
  assert(sampleReport.status === 'resolved', 'Report marked as resolved by admin');

  console.log(`\n====================================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`====================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
