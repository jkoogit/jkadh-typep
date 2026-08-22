/**
 * JKADH AI Platform - Environment Variables Recognition & Diagnostics Script
 * Checks required environment variables during system boot and session startup.
 */

const https = require('https');

const REQUIRED_ENV_VARS = [
  {
    key: 'GITHUB_TOKEN',
    altKey: 'GH_TOKEN',
    name: 'GitHub Personal Access Token',
    required: true,
    description: '원격 GitHub 저장소 동기화, PR 자동 생성/머지, 브랜치 푸시 및 릴리즈 태그 배포에 필수',
    guide: 'AI Studio 우측 상단 Settings (⚙️) ➔ Secrets에 GITHUB_TOKEN 등록 (권한: repo, workflow)'
  },
  {
    key: 'GEMINI_API_KEY',
    altKey: null,
    name: 'Google Gemini API Key',
    required: true,
    description: '7-Phase Vibe Runner 및 AI 에이전트 코드/아키텍처 자율 생성에 필수',
    guide: 'AI Studio 우측 상단 Settings (⚙️) ➔ Secrets에 GEMINI_API_KEY 등록'
  }
];

const OPTIONAL_ENV_VARS = [
  {
    key: 'ANTHROPIC_API_KEY',
    name: 'Anthropic Claude API Key',
    required: false,
    description: 'Claude 3.7 Sonnet / Opus 모델 호출 및 서킷 브레이커 연동'
  },
  {
    key: 'OPENAI_API_KEY',
    name: 'OpenAI GPT-4o API Key',
    required: false,
    description: 'GPT-4o / o3-mini 모델 호출 및 텔레메트리 연동'
  },
  {
    key: 'DEEPSEEK_API_KEY',
    name: 'DeepSeek Reasoner API Key',
    required: false,
    description: 'DeepSeek R1 / V3 고난도 추론 에이전트 연동'
  }
];

async function checkGithubToken(token) {
  return new Promise((resolve) => {
    if (!token) {
      return resolve({ valid: false, reason: '토큰이 설정되지 않았습니다.' });
    }
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: '/user',
        method: 'GET',
        headers: {
          'User-Agent': 'JKADH-Env-Checker',
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(body);
              const scopes = res.headers['x-oauth-scopes'] || 'default';
              resolve({
                valid: true,
                statusCode: res.statusCode,
                username: data.login,
                name: data.name || data.login,
                scopes: scopes
              });
            } catch (e) {
              resolve({ valid: true, statusCode: res.statusCode, username: 'Unknown', scopes: 'parsed' });
            }
          } else {
            resolve({
              valid: false,
              statusCode: res.statusCode,
              reason: `GitHub API 응답 오류 (HTTP ${res.statusCode}) - 유효하지 않거나 만료된 토큰입니다.`
            });
          }
        });
      }
    );
    req.on('error', (err) => {
      resolve({ valid: false, reason: `네트워크 연결 실패: ${err.message}` });
    });
    req.end();
  });
}

async function runDiagnostics(silent = false) {
  const results = {
    timestamp: new Date().toISOString(),
    allRequiredValid: true,
    required: [],
    optional: []
  };

  if (!silent) {
    console.log('\n================================================================');
    console.log('🏛️  JKADH 플랫폼 필수 환경변수 인식 현황 및 자격 증명 진단');
    console.log('================================================================');
  }

  // 1. Check Required Variables
  for (const item of REQUIRED_ENV_VARS) {
    const rawVal = process.env[item.key] || (item.altKey ? process.env[item.altKey] : null);
    const exists = !!rawVal && rawVal.trim().length > 0;
    let detail = {};

    if (item.key === 'GITHUB_TOKEN') {
      const ghCheck = await checkGithubToken(rawVal);
      detail = ghCheck;
      if (!ghCheck.valid) {
        results.allRequiredValid = false;
      }
    } else if (!exists) {
      results.allRequiredValid = false;
    }

    const statusObj = {
      key: item.key,
      name: item.name,
      exists,
      required: item.required,
      description: item.description,
      guide: item.guide,
      masked: exists ? `${rawVal.slice(0, 4)}***${rawVal.slice(-4)}` : 'NOT_SET',
      valid: item.key === 'GITHUB_TOKEN' ? detail.valid : exists,
      detail
    };

    results.required.push(statusObj);

    if (!silent) {
      if (statusObj.valid) {
        console.log(`✅ [정상 인식] ${item.key} (${item.name})`);
        if (detail.username) {
          console.log(`   └─ 인증 사용자: @${detail.username} | 권한(Scopes): [${detail.scopes}]`);
        }
      } else {
        console.log(`❌ [미등록/오류] ${item.key} (${item.name})`);
        console.log(`   └─ 조치 가이드: ${item.guide}`);
        if (detail.reason) {
          console.log(`   └─ 진단 메시지: ${detail.reason}`);
        }
      }
    }
  }

  // 2. Check Optional Variables
  if (!silent) {
    console.log('----------------------------------------------------------------');
    console.log('⚙️  선택적 모델 공급자 API Key 상태 (옵션)');
    console.log('----------------------------------------------------------------');
  }

  for (const item of OPTIONAL_ENV_VARS) {
    const rawVal = process.env[item.key];
    const exists = !!rawVal && rawVal.trim().length > 0;
    const statusObj = {
      key: item.key,
      name: item.name,
      exists,
      required: false,
      description: item.description,
      masked: exists ? `${rawVal.slice(0, 4)}***${rawVal.slice(-4)}` : 'NOT_SET'
    };
    results.optional.push(statusObj);

    if (!silent) {
      if (exists) {
        console.log(`🔹 [등록됨] ${item.key} (${statusObj.masked}) - ${item.name}`);
      } else {
        console.log(`⚪ [미등록(옵션)] ${item.key} - ${item.name}`);
      }
    }
  }

  if (!silent) {
    console.log('================================================================');
    if (results.allRequiredValid) {
      console.log('🚀 [진단 완료] 모든 필수 환경변수가 정상 인식되었습니다. 하네스 프로세스를 진행합니다.\n');
    } else {
      console.log('🚨 [경고] 필수 환경변수 중 미등록 또는 무효한 항목이 존재합니다.');
      console.log('   Settings 메뉴에서 키를 등록한 후 다시 시도해 주시기 바랍니다.\n');
    }
  }

  return results;
}

if (require.main === module) {
  runDiagnostics().then((res) => {
    if (!res.allRequiredValid && process.argv.includes('--strict')) {
      process.exit(1);
    }
  });
}

module.exports = { runDiagnostics, REQUIRED_ENV_VARS, OPTIONAL_ENV_VARS };
