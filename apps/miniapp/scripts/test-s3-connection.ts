/**
 * S3/R2 Connection Test Script
 * Run: tsx scripts/test-s3-connection.ts
 */

import { s3Client } from "@/lib/media/s3-client";
import { ListBucketsCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

async function testS3Connection() {
  console.log("🔍 Testing S3/R2 connection...\n");

  try {
    // Test 1: List buckets
    console.log("1️⃣ Testing bucket access...");
    const listCommand = new ListBucketsCommand({});
    const buckets = await s3Client.send(listCommand);
    console.log("✅ Connected! Found buckets:", buckets.Buckets?.map(b => b.Name));

    // Test 2: Upload test file
    console.log("\n2️⃣ Testing file upload...");
    const testKey = "test/connection-test.txt";
    const testContent = "Hello from VA-PC media pipeline! " + new Date().toISOString();

    const putCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: "text/plain",
    });

    await s3Client.send(putCommand);
    console.log("✅ File uploaded successfully!");

    // Test 3: Download test file
    console.log("\n3️⃣ Testing file download...");
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: testKey,
    });

    const response = await s3Client.send(getCommand);
    const downloadedContent = await response.Body?.transformToString();
    console.log("✅ File downloaded:", downloadedContent);

    // Test 4: Delete test file
    console.log("\n4️⃣ Testing file deletion...");
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: testKey,
    });

    await s3Client.send(deleteCommand);
    console.log("✅ File deleted successfully!");

    console.log("\n🎉 All tests passed! S3/R2 is configured correctly.");
    console.log("\n📋 Configuration:");
    console.log(`   Bucket: ${process.env.S3_BUCKET_NAME}`);
    console.log(`   Region: ${process.env.S3_REGION}`);
    console.log(`   Endpoint: ${process.env.S3_ENDPOINT || "AWS S3 default"}`);
    console.log(`   CDN: ${process.env.CDN_BASE_URL}`);

  } catch (error) {
    console.error("\n❌ Connection test failed:");
    console.error(error);
    console.log("\n💡 Check:");
    console.log("   1. .env.local file exists with correct credentials");
    console.log("   2. S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are valid");
    console.log("   3. Bucket name is correct");
    console.log("   4. CORS is configured properly");
    console.log("   5. IAM/API token has required permissions");
    process.exit(1);
  }
}

testS3Connection();
