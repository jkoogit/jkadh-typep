/**
 * JKADH GitHub REST API Synchronizer
 * Automatically creates Issues, PRs, and performs Merges directly on GitHub
 */

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'jkoogit/jkadh-typep';

if (!GITHUB_TOKEN) {
  console.error('[GitHub Sync] Error: GITHUB_TOKEN environment variable is missing.');
  process.exit(1);
}

function githubRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: `/repos/${REPO}${path}`,
        method: method,
        headers: {
          'User-Agent': 'JKADH-Governance-Agent',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function createIssue(title, body, labels = []) {
  console.log(`[GitHub API] Creating Issue: "${title}"...`);
  const res = await githubRequest('POST', '/issues', { title, body, labels });
  if (res.status === 201) {
    console.log(`[GitHub API] ✅ Issue #${res.data.number} created successfully: ${res.data.html_url}`);
    return res.data;
  } else {
    console.error(`[GitHub API] ❌ Failed to create Issue:`, res);
    return null;
  }
}

async function createPullRequest(title, head, base, body) {
  console.log(`[GitHub API] Creating PR: "${title}" (${head} -> ${base})...`);
  const res = await githubRequest('POST', '/pulls', { title, head, base, body });
  if (res.status === 201) {
    console.log(`[GitHub API] ✅ PR #${res.data.number} created successfully: ${res.data.html_url}`);
    return res.data;
  } else {
    console.error(`[GitHub API] ❌ Failed to create PR:`, res);
    return null;
  }
}

async function mergePullRequest(pullNumber, commitTitle, mergeMethod = 'merge') {
  console.log(`[GitHub API] Merging PR #${pullNumber}...`);
  const res = await githubRequest('PUT', `/pulls/${pullNumber}/merge`, {
    commit_title: commitTitle,
    merge_method: mergeMethod
  });
  if (res.status === 200) {
    console.log(`[GitHub API] ✅ PR #${pullNumber} merged successfully (SHA: ${res.data.sha})`);
    return res.data;
  } else {
    console.error(`[GitHub API] ❌ Failed to merge PR #${pullNumber}:`, res);
    return null;
  }
}

async function closeIssue(issueNumber) {
  console.log(`[GitHub API] Closing Issue #${issueNumber}...`);
  const res = await githubRequest('PATCH', `/issues/${issueNumber}`, { state: 'closed' });
  if (res.status === 200) {
    console.log(`[GitHub API] ✅ Issue #${issueNumber} closed successfully`);
    return res.data;
  } else {
    console.error(`[GitHub API] ❌ Failed to close Issue #${issueNumber}:`, res);
    return null;
  }
}

async function promoteBranchWithPR(head, base, title, body) {
  console.log(`[GitHub API] Starting PR Lifecycle: ${head} ➔ ${base}`);
  const pr = await createPullRequest(title, head, base, body);
  if (!pr) {
    throw new Error(`Failed to create PR for ${head} -> ${base}`);
  }
  console.log(`[GitHub API] PR #${pr.number} created: ${pr.html_url}`);
  
  const mergeResult = await mergePullRequest(pr.number, `Merge pull request #${pr.number} from ${head} into ${base}`);
  if (!mergeResult) {
    throw new Error(`Failed to merge PR #${pr.number}`);
  }
  console.log(`[GitHub API] ✅ PR #${pr.number} successfully merged into ${base}!`);
  return { pr, mergeResult };
}

module.exports = {
  createIssue,
  createPullRequest,
  mergePullRequest,
  closeIssue,
  promoteBranchWithPR
};

// CLI Command execution support
if (require.main === module) {
  const [,, command, ...args] = process.argv;
  (async () => {
    try {
      if (command === 'create-issue') {
        const [title, body, labels] = args;
        await createIssue(title, body, labels ? labels.split(',') : []);
      } else if (command === 'create-pr') {
        const [title, head, base, body] = args;
        await createPullRequest(title, head, base, body);
      } else if (command === 'merge-pr') {
        const [pullNumber, commitTitle] = args;
        await mergePullRequest(parseInt(pullNumber, 10), commitTitle);
      } else if (command === 'promote-pr') {
        const [head, base, title, body] = args;
        await promoteBranchWithPR(head, base, title, body);
      } else if (command === 'close-issue') {
        const [issueNumber] = args;
        await closeIssue(parseInt(issueNumber, 10));
      }
    } catch (err) {
      console.error('[GitHub CLI] Error:', err.message);
      process.exit(1);
    }
  })();
}
