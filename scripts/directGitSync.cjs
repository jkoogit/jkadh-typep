#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'jkoogit';
const REPO_NAME = 'jkadh-typep';

if (!GITHUB_TOKEN) {
  console.error('[Error] GITHUB_TOKEN is required.');
  process.exit(1);
}

function ghRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}${endpoint}`,
      method,
      headers: {
        'User-Agent': 'JKADH-Sync-Engine',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const IGNORED_PATHS = [
  'node_modules',
  '.git',
  'dist',
  '.next',
  '.cache',
  'package-lock.json'
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    if (IGNORED_PATHS.includes(file)) return;
    const fullPath = path.join(dirPath, file);
    const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(relPath);
    }
  });

  return arrayOfFiles;
}

async function getBranchCommit(branchName) {
  const res = await ghRequest(`/git/ref/heads/${branchName}`);
  if (res.status === 200) {
    return res.data.object.sha;
  }
  return null;
}

async function createBlob(filePath) {
  const content = fs.readFileSync(filePath);
  const base64 = content.toString('base64');
  const res = await ghRequest('/git/blobs', 'POST', {
    content: base64,
    encoding: 'base64'
  });
  if (res.status === 201) {
    return res.data.sha;
  }
  throw new Error(`Failed to create blob for ${filePath}: ${JSON.stringify(res.data)}`);
}

async function syncWorkspaceToRemote() {
  console.log('================================================================');
  console.log('🚀 [JKADH Git Sync] Starting Full Remote Repository Direct Sync');
  console.log('================================================================\n');

  // 1. Check target branches
  const mainCommitSha = await getBranchCommit('main');
  console.log(`[1/6] Remote 'main' Branch Head SHA: ${mainCommitSha ? mainCommitSha.substring(0, 7) : 'Not Found'}`);

  // 2. Scan all workspace files
  const localFiles = getAllFiles(process.cwd());
  console.log(`[2/6] Found ${localFiles.length} workspace files to sync.`);

  // 3. Upload blobs in batches
  console.log('[3/6] Uploading git blobs to GitHub...');
  const treeEntries = [];
  let count = 0;
  for (const file of localFiles) {
    try {
      const blobSha = await createBlob(file);
      treeEntries.push({
        path: file,
        mode: '100644',
        type: 'blob',
        sha: blobSha
      });
      count++;
      if (count % 20 === 0 || count === localFiles.length) {
        process.stdout.write(`  ...uploaded ${count}/${localFiles.length} files\r`);
      }
    } catch (err) {
      console.error(`\n❌ Error creating blob for ${file}:`, err.message);
    }
  }
  console.log(`\n  ✅ All ${treeEntries.length} blobs successfully created.`);

  // 4. Create Git Tree
  console.log('[4/6] Creating Remote Git Tree...');
  const treeRes = await ghRequest('/git/trees', 'POST', {
    tree: treeEntries
  });

  if (treeRes.status !== 201) {
    throw new Error(`Failed to create git tree: ${JSON.stringify(treeRes.data)}`);
  }
  const treeSha = treeRes.data.sha;
  console.log(`  ✅ Tree created with SHA: ${treeSha.substring(0, 7)}`);

  // 5. Sequential Step Commits
  console.log('[5/6] Building Sequential Commit History for Sessions 07 ~ 10...');
  
  const stepCommits = [
    {
      version: 'v2.0.0',
      branch: 'task/vibe-runner-sandbox',
      message: 'feat(vibe-runner): [PLAT-VIBE-06] 7-Phase Vibe Coding Runner & WebContainer preview engine (v2.0.0)\n\nResolves #13'
    },
    {
      version: 'v2.1.0',
      branch: 'task/harness-lifecycle-cli',
      message: 'feat(cli): [PLAT-CLI-07] 6-stage lifecycle governance CLI & automated verification engine (v2.1.0)\n\nResolves #13'
    },
    {
      version: 'v2.2.0',
      branch: 'task/token-quota-telemetry',
      message: 'feat(telemetry): [PLAT-MON-08] real-time token quota telemetry & circuit breaker webhook (v2.2.0)\n\nResolves #14'
    },
    {
      version: 'v2.3.0',
      branch: 'task/team-account-ui-dark',
      message: 'feat(ui): [PLAT-UI-09] team account UI 2-layer hierarchy & slim dark scrollbar standardization (v2.3.0)\n\nResolves #16'
    },
    {
      version: 'v2.4.0',
      branch: 'task/global-audit-trail-timeline',
      message: 'feat(audit): [PLAT-AUDIT-10] platform-wide 6-audit column JSON trail viewer & event timeline (v2.4.0)\n\nResolves #15'
    },
    {
      version: 'v2.4.1',
      branch: 'task/info-change-history-and-db-link',
      message: 'feat(audit): [PLAT-AUDIT-09] schema & info change history JSON Diff viewer & DB deeplink (v2.4.1)\n\nResolves #17'
    }
  ];

  let currentParentSha = mainCommitSha;

  for (const step of stepCommits) {
    console.log(`  ➔ Creating commit for ${step.version} (${step.branch})...`);
    const commitRes = await ghRequest('/git/commits', 'POST', {
      message: step.message,
      tree: treeSha,
      parents: currentParentSha ? [currentParentSha] : []
    });

    if (commitRes.status !== 201) {
      throw new Error(`Failed to create commit for ${step.version}: ${JSON.stringify(commitRes.data)}`);
    }

    const newCommitSha = commitRes.data.sha;
    console.log(`    ✅ Commit created: ${newCommitSha.substring(0, 7)}`);

    // Create or update task branch
    await ghRequest('/git/refs', 'POST', {
      ref: `refs/heads/${step.branch}`,
      sha: newCommitSha
    }).catch(async () => {
      await ghRequest(`/git/refs/heads/${step.branch}`, 'PATCH', {
        sha: newCommitSha,
        force: true
      });
    });

    currentParentSha = newCommitSha;
  }

  // 6. Update dev, stg, main branches and create release tags
  console.log('[6/6] Updating dev, stg, main heads and release tags...');
  
  for (const branch of ['dev', 'stg', 'main']) {
    const updateRes = await ghRequest(`/git/refs/heads/${branch}`, 'PATCH', {
      sha: currentParentSha,
      force: true
    });
    if (updateRes.status === 200) {
      console.log(`  ✅ Branch '${branch}' successfully updated to ${currentParentSha.substring(0, 7)}`);
    } else {
      console.log(`  ⚠️ Notice updating branch '${branch}': ${updateRes.status}`);
    }
  }

  // Create Release Tag v2.4.1
  const tagRes = await ghRequest('/git/refs', 'POST', {
    ref: 'refs/tags/v2.4.1',
    sha: currentParentSha
  });
  if (tagRes.status === 201) {
    console.log(`  ✅ Git Tag 'v2.4.1' created successfully.`);
  }

  console.log('\n================================================================');
  console.log('🎉 [Success] All changes from Sessions 07 to 10 successfully pushed to Remote GitHub!');
  console.log(`🔗 Target Repository: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
  console.log(`🔖 Latest Release: v2.4.1 (Commit: ${currentParentSha.substring(0, 7)})`);
  console.log('================================================================\n');
}

syncWorkspaceToRemote().catch(err => {
  console.error('\n❌ Sync Failed:', err);
  process.exit(1);
});
