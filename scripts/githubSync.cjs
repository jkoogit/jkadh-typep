/**
 * JKADH GitHub REST API & Git Remote Synchronizer
 * Automatically creates Issues, PRs, performs Merges, and pushes to remote GitHub repository
 */

const https = require('https');
const { execSync } = require('child_process');
const { runDiagnostics } = require('./envCheck.cjs');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const REPO = process.env.GITHUB_REPO || 'jkoogit/jkadh-typep';
const IS_DRY_RUN = !GITHUB_TOKEN || process.env.DRY_RUN === 'true';

// Ensure Git Remote URL is properly configured with Token if available
function configureGitRemote() {
  if (GITHUB_TOKEN) {
    try {
      execSync('git config user.name "jkoogit"', { stdio: 'ignore' });
      execSync('git config user.email "jkoogit@gmail.com"', { stdio: 'ignore' });
      const remoteUrl = `https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO}.git`;
      try {
        execSync(`git remote set-url origin "${remoteUrl}"`, { stdio: 'ignore' });
      } catch (e) {
        execSync(`git remote add origin "${remoteUrl}"`, { stdio: 'ignore' });
      }
    } catch (err) {
      console.warn('[Git Remote] Warning setting remote url:', err.message);
    }
  }
}

function githubRequest(method, path, data = null) {
  if (IS_DRY_RUN) {
    console.log(`[GitHub API Simulation] ${method} ${path}`);
    const mockNumber = Math.floor(10 + Math.random() * 90);
    const mockSha = 'a1b2c3d4e5f67890abcdef1234567890abcdef12';
    if (path === '/issues' && method === 'POST') {
      return Promise.resolve({
        status: 201,
        data: {
          number: mockNumber,
          title: data.title,
          html_url: `https://github.com/${REPO}/issues/${mockNumber}`,
          state: 'open'
        }
      });
    }
    if (path === '/pulls' && method === 'POST') {
      return Promise.resolve({
        status: 201,
        data: {
          number: mockNumber,
          title: data.title,
          html_url: `https://github.com/${REPO}/pull/${mockNumber}`,
          head: { ref: data.head },
          base: { ref: data.base },
          state: 'open'
        }
      });
    }
    if (path.includes('/merge') && method === 'PUT') {
      return Promise.resolve({
        status: 200,
        data: {
          sha: mockSha,
          merged: true,
          message: 'Pull Request successfully merged (Dry-run simulated)'
        }
      });
    }
    return Promise.resolve({ status: 200, data: { simulated: true } });
  }

  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: `/repos/${REPO}${path}`,
        method: method,
        headers: {
          'User-Agent': 'JKADH-Governance-Agent',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, data: parsed, raw: body });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

// 1. Create Issue on GitHub
async function createIssue(title, body, labels = ['governance', 'task']) {
  console.log(`[GitHub API] Creating Issue: "${title}"...`);
  const res = await githubRequest('POST', '/issues', {
    title,
    body,
    labels
  });

  if (res.status === 201) {
    console.log(`[GitHub API] ✅ Issue #${res.data.number} created: ${res.data.html_url}`);
    return res.data;
  } else {
    console.warn(`[GitHub API] ⚠️ Issue creation response (${res.status}):`, res.data?.message || res.raw);
    return res.data;
  }
}

// 2. Create Pull Request on GitHub
async function createPullRequest(title, head, base = 'dev', body = '') {
  console.log(`[GitHub API] Creating PR: "${title}" (${head} -> ${base})...`);
  const res = await githubRequest('POST', '/pulls', {
    title,
    head,
    base,
    body
  });

  if (res.status === 201) {
    console.log(`[GitHub API] ✅ PR #${res.data.number} created: ${res.data.html_url}`);
    return res.data;
  } else if (res.status === 422) {
    // If PR already exists or branch already merged, lookup open PRs
    const listRes = await githubRequest('GET', `/pulls?head=${encodeURIComponent(REPO.split('/')[0] + ':' + head)}&base=${base}&state=open`);
    if (listRes.status === 200 && Array.isArray(listRes.data) && listRes.data.length > 0) {
      console.log(`[GitHub API] Found existing PR #${listRes.data[0].number}: ${listRes.data[0].html_url}`);
      return listRes.data[0];
    }
    console.warn(`[GitHub API] PR Notice (HTTP ${res.status}):`, res.data?.message || res.data?.errors?.[0]?.message);
    return { number: null, error: res.data };
  } else {
    console.warn(`[GitHub API] ⚠️ Notice on creating PR (${head} -> ${base}):`, res.data?.message || res.raw);
    return res.data;
  }
}

// 3. Merge Pull Request on GitHub
async function mergePullRequest(prNumber, commitMessage = '') {
  console.log(`[GitHub API] Merging PR #${prNumber}...`);
  if (!prNumber) {
    console.log(`[GitHub API] PR number not provided, skipping API merge.`);
    return { merged: false };
  }
  const res = await githubRequest('PUT', `/pulls/${prNumber}/merge`, {
    commit_title: commitMessage || `Merge PR #${prNumber} into target branch`,
    merge_method: 'merge'
  });

  if (res.status === 200 && res.data.merged) {
    console.log(`[GitHub API] ✅ PR #${prNumber} successfully merged! (SHA: ${res.data.sha.slice(0, 7)})`);
    return res.data;
  } else {
    console.warn(`[GitHub API] ⚠️ Merge response for PR #${prNumber} (HTTP ${res.status}):`, res.data?.message || res.raw);
    return res.data;
  }
}

// 4. Create Release Tag on GitHub
async function createReleaseTag(tagName, releaseName, body = '') {
  console.log(`[GitHub API] Creating Release Tag: ${tagName}...`);
  const res = await githubRequest('POST', '/releases', {
    tag_name: tagName,
    target_commitish: 'main',
    name: releaseName || `Release ${tagName}`,
    body: body || `Automated release ${tagName} via JKADH Lifecycle Governance`,
    draft: false,
    prerelease: false
  });

  if (res.status === 201) {
    console.log(`[GitHub API] ✅ Release ${tagName} created: ${res.data.html_url}`);
    return res.data;
  } else {
    console.warn(`[GitHub API] Release creation response (${res.status}):`, res.data?.message || res.raw);
    return res.data;
  }
}

// 5. Git Physical Remote Push
function pushGitBranch(branch, force = false) {
  configureGitRemote();
  try {
    console.log(`[Git Remote] Pushing branch '${branch}' to origin...`);
    const forceFlag = force ? '--force' : '';
    execSync(`git push origin ${branch} ${forceFlag}`, { stdio: 'inherit' });
    console.log(`[Git Remote] ✅ Branch '${branch}' successfully pushed to origin.`);
    return true;
  } catch (err) {
    console.warn(`[Git Remote] ⚠️ Push branch failed: ${err.message}`);
    return false;
  }
}

function pushGitTag(tag) {
  configureGitRemote();
  try {
    console.log(`[Git Remote] Pushing tag '${tag}' to origin...`);
    execSync(`git push origin ${tag} --force`, { stdio: 'inherit' });
    console.log(`[Git Remote] ✅ Tag '${tag}' successfully pushed to origin.`);
    return true;
  } catch (err) {
    console.warn(`[Git Remote] ⚠️ Push tag failed: ${err.message}`);
    return false;
  }
}

// CLI Execution Routing
async function main() {
  const [,, command, ...args] = process.argv;
  configureGitRemote();

  switch (command) {
    case 'check-env':
    case 'verify-token': {
      await runDiagnostics();
      break;
    }
    case 'create-issue': {
      const [title, body, labels] = args;
      await createIssue(title, body, labels ? labels.split(',') : undefined);
      break;
    }
    case 'create-pr': {
      const [title, head, base, body] = args;
      await createPullRequest(title, head, base || 'dev', body);
      break;
    }
    case 'merge-pr': {
      const [prNumber, commitMessage] = args;
      await mergePullRequest(prNumber, commitMessage);
      break;
    }
    case 'create-tag': {
      const [tagName, releaseName, body] = args;
      await createReleaseTag(tagName, releaseName, body);
      pushGitTag(tagName);
      break;
    }
    case 'promote-pr': {
      const [sourceBranch, targetBranch, title, body] = args;
      console.log(`[GitHub API] Starting PR Lifecycle: ${sourceBranch} ➔ ${targetBranch}`);
      pushGitBranch(sourceBranch, true);
      const pr = await createPullRequest(title || `[Promotion] ${sourceBranch} ➔ ${targetBranch}`, sourceBranch, targetBranch, body);
      if (pr && pr.number) {
        await mergePullRequest(pr.number, `Merge PR #${pr.number} from ${sourceBranch} into ${targetBranch}`);
      }
      pushGitBranch(targetBranch, true);
      break;
    }
    case 'push-all': {
      pushGitBranch('dev', true);
      pushGitBranch('stg', true);
      pushGitBranch('main', true);
      break;
    }
    default:
      console.log('Usage: node scripts/githubSync.cjs [check-env | create-issue | create-pr | merge-pr | create-tag | promote-pr | push-all]');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createIssue,
  createPullRequest,
  mergePullRequest,
  createReleaseTag,
  pushGitBranch,
  pushGitTag,
  configureGitRemote
};
