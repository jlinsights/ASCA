#!/usr/bin/env node

/**
 * 🔐 ASCA 보안 API 테스트 스크립트
 * 새로운 보안 시스템의 모든 기능을 검증합니다.
 */

const https = require('https')
const http = require('http')

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

class SecurityTester {
  constructor() {
    this.testResults = []
    this.totalTests = 0
    this.passedTests = 0
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`)
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL)
      const client = url.protocol === 'https:' ? https : http
      
      const requestOptions = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ASCA-Security-Tester/1.0',
          ...options.headers
        }
      }

      const req = client.request(requestOptions, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            resolve({ status: res.statusCode, data: json, headers: res.headers })
          } catch (e) {
            resolve({ status: res.statusCode, data: data, headers: res.headers })
          }
        })
      })

      req.on('error', reject)
      
      if (options.body) {
        req.write(JSON.stringify(options.body))
      }
      
      req.end()
    })
  }

  async runTest(name, testFunction) {
    this.totalTests++
    this.log(`\\n🧪 Testing: ${name}`, 'blue')
    
    try {
      const result = await testFunction()
      if (result.success) {
        this.passedTests++
        this.log(`✅ PASS: ${result.message}`, 'green')
      } else {
        this.log(`❌ FAIL: ${result.message}`, 'red')
      }
      this.testResults.push({ name, ...result })
    } catch (error) {
      this.log(`💥 ERROR: ${error.message}`, 'red')
      this.testResults.push({ name, success: false, message: error.message })
    }
  }

  // 1. 비활성화된 엔드포인트 테스트
  async testDisabledEndpoints() {
    const disabledEndpoints = [
      '/api/migration/migrate-all',
      '/api/sync/start', 
      '/api/sync/stop',
      '/api/admin/stats'
    ]

    for (const endpoint of disabledEndpoints) {
      const response = await this.makeRequest(endpoint, { method: 'POST' })
      
      if (response.status === 503 && response.data.message?.includes('disabled')) {
        return { success: true, message: `${endpoint} correctly disabled` }
      } else {
        return { success: false, message: `${endpoint} should be disabled but returned ${response.status}` }
      }
    }
  }

  // 2. 인증 없는 접근 테스트
  async testUnauthenticatedAccess() {
    const secureEndpoints = [
      '/api/secure/migration/migrate-all',
      '/api/secure/sync/start',
      '/api/secure/sync/stop',
      '/api/secure/admin/stats'
    ]

    for (const endpoint of secureEndpoints) {
      const response = await this.makeRequest(endpoint, { method: 'GET' })
      
      if (response.status === 401) {
        return { success: true, message: `${endpoint} correctly requires authentication` }
      } else {
        return { success: false, message: `${endpoint} should require auth but returned ${response.status}` }
      }
    }
  }

  // 3. Rate Limiting 테스트
  async testRateLimiting() {
    const endpoint = '/api/test/secure'
    const requests = []
    
    // 빠른 연속 요청 (15개)
    for (let i = 0; i < 15; i++) {
      requests.push(this.makeRequest(endpoint))
    }
    
    const responses = await Promise.all(requests)
    const rateLimitedResponses = responses.filter(r => r.status === 429)
    
    if (rateLimitedResponses.length > 0) {
      return { 
        success: true, 
        message: `Rate limiting working: ${rateLimitedResponses.length} requests blocked` 
      }
    } else {
      return { 
        success: false, 
        message: 'Rate limiting not working - all requests succeeded' 
      }
    }
  }

  // 4. 보안 헤더 테스트
  async testSecurityHeaders() {
    const response = await this.makeRequest('/')
    const headers = response.headers
    
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options', 
      'x-xss-protection',
      'referrer-policy'
    ]
    
    const missingHeaders = requiredHeaders.filter(header => !headers[header])
    
    if (missingHeaders.length === 0) {
      return { success: true, message: 'All security headers present' }
    } else {
      return { 
        success: false, 
        message: `Missing security headers: ${missingHeaders.join(', ')}` 
      }
    }
  }

  // 5. CORS 정책 테스트
  async testCorsPolicy() {
    const response = await this.makeRequest('/api/test/secure', {
      headers: {
        'Origin': 'https://malicious-site.com',
        'Access-Control-Request-Method': 'POST'
      }
    })
    
    const allowOrigin = response.headers['access-control-allow-origin']
    
    if (!allowOrigin || allowOrigin === 'https://malicious-site.com') {
      return { 
        success: false, 
        message: 'CORS policy too permissive - allows malicious origins' 
      }
    } else {
      return { success: true, message: 'CORS policy correctly restrictive' }
    }
  }

  // 6. 개발 토큰 테스트 (개발 환경에서만)
  async testDevToken() {
    if (process.env.NODE_ENV !== 'development') {
      return { success: true, message: 'Dev token test skipped (not in development)' }
    }

    const response = await this.makeRequest('/api/test/secure', {
      headers: {
        'Authorization': 'Bearer dev-admin-token-change-in-production'
      }
    })
    
    if (response.status === 200) {
      return { success: true, message: 'Dev token authentication working' }
    } else {
      return { success: false, message: `Dev token failed: ${response.status}` }
    }
  }

  // 보고서 생성
  generateReport() {
    this.log('\\n' + '='.repeat(60), 'cyan')
    this.log('🔐 ASCA SECURITY TEST REPORT', 'cyan')
    this.log('='.repeat(60), 'cyan')
    
    this.log(`\\n📊 Overall Results:`, 'bright')
    this.log(`   Total Tests: ${this.totalTests}`)
    this.log(`   Passed: ${this.passedTests}`, 'green')
    this.log(`   Failed: ${this.totalTests - this.passedTests}`, 'red')
    this.log(`   Success Rate: ${Math.round((this.passedTests / this.totalTests) * 100)}%`)
    
    this.log(`\\n📋 Detailed Results:`, 'bright')
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌'
      const color = result.success ? 'green' : 'red'
      this.log(`   ${index + 1}. ${status} ${result.name}`, color)
      this.log(`      ${result.message}`, 'reset')
    })
    
    // 보안 권장사항
    this.log(`\\n🛡️  Security Recommendations:`, 'yellow')
    this.log(`   1. 정기적으로 보안 테스트 실행`)
    this.log(`   2. 프로덕션 환경에서 개발 토큰 비활성화`)
    this.log(`   3. Rate Limiting 설정 모니터링`)
    this.log(`   4. 감사 로그 정기 검토`)
    this.log(`   5. 보안 헤더 정책 업데이트`)
    
    this.log('\\n' + '='.repeat(60), 'cyan')
  }

  async runAllTests() {
    this.log('🚀 Starting ASCA Security Test Suite...', 'bright')
    this.log(`📍 Testing against: ${BASE_URL}`, 'blue')
    
    await this.runTest('Disabled Endpoints', () => this.testDisabledEndpoints())
    await this.runTest('Unauthenticated Access', () => this.testUnauthenticatedAccess())
    await this.runTest('Rate Limiting', () => this.testRateLimiting())
    await this.runTest('Security Headers', () => this.testSecurityHeaders())
    await this.runTest('CORS Policy', () => this.testCorsPolicy())
    await this.runTest('Dev Token (Development)', () => this.testDevToken())
    
    this.generateReport()
    
    // 종료 코드 설정
    process.exit(this.passedTests === this.totalTests ? 0 : 1)
  }
}

// 스크립트 실행
if (require.main === module) {
  const tester = new SecurityTester()
  tester.runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  })
}

module.exports = SecurityTester