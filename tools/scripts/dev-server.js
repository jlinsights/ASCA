#!/usr/bin/env node

/**
 * 개발 서버 시작 스크립트
 * 환경 검증, 의존성 확인, 데이터베이스 설정 등을 통합적으로 관리합니다.
 */

const { spawn, exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { checkEnvVars } = require('./check-env-vars')

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🔄${colors.reset} ${msg}`),
}

class DevServer {
  constructor() {
    this.processes = []
    this.isShuttingDown = false
    
    // 프로세스 종료 시 정리
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())
    process.on('exit', () => this.shutdown())
  }

  async start() {
    try {
      console.log(`${colors.magenta}`)
      console.log('╔══════════════════════════════════════════════════════════════╗')
      console.log('║                    ASCA 개발 서버 시작                        ║')
      console.log('║                  동양서예협회 CMS 시스템                       ║')
      console.log('╚══════════════════════════════════════════════════════════════╝')
      console.log(`${colors.reset}\n`)

      // 1. 환경 변수 검증
      await this.checkEnvironment()

      // 2. 의존성 확인
      await this.checkDependencies()

      // 3. 데이터베이스 상태 확인
      await this.checkDatabase()

      // 4. 포트 확인
      await this.checkPort()

      // 5. 개발 서버 시작
      await this.startServices()

      log.success('개발 서버가 성공적으로 시작되었습니다!')
      
    } catch (error) {
      log.error(`개발 서버 시작 실패: ${error.message}`)
      process.exit(1)
    }
  }

  async checkEnvironment() {
    log.step('환경 변수 검증 중...')
    
    // .env.local 파일 존재 확인
    const envPath = path.join(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) {
      log.warning('.env.local 파일이 없습니다.')
      
      const envExamplePath = path.join(process.cwd(), '.env.example')
      if (fs.existsSync(envExamplePath)) {
        log.info('.env.example을 .env.local로 복사합니다...')
        fs.copyFileSync(envExamplePath, envPath)
        log.success('.env.local 파일이 생성되었습니다.')
        log.warning('⚠️  환경 변수를 실제 값으로 수정해주세요!')
      }
    }

    // 환경 변수 검증 실행
    try {
      checkEnvVars()
    } catch (error) {
      throw new Error('환경 변수 검증 실패')
    }
  }

  async checkDependencies() {
    log.step('의존성 확인 중...')
    
    return new Promise((resolve, reject) => {
      exec('npm ls --depth=0', (error, stdout, stderr) => {
        if (error) {
          log.warning('일부 의존성이 누락되었을 수 있습니다.')
          log.info('npm install을 실행하여 의존성을 설치하세요.')
        } else {
          log.success('모든 의존성이 설치되어 있습니다.')
        }
        resolve()
      })
    })
  }

  async checkDatabase() {
    log.step('데이터베이스 연결 확인 중...')
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      log.warning('Supabase 설정이 없습니다. 모의 데이터 모드로 실행됩니다.')
      return
    }

    try {
      // Supabase 연결 테스트는 실제 앱에서 수행
      log.success('데이터베이스 설정이 확인되었습니다.')
    } catch (error) {
      log.warning(`데이터베이스 연결 실패: ${error.message}`)
      log.info('모의 데이터 모드로 실행됩니다.')
    }
  }

  async checkPort() {
    const port = process.env.DEV_SERVER_PORT || 3000
    
    return new Promise((resolve) => {
      const net = require('net')
      const server = net.createServer()
      
      server.listen(port, () => {
        server.once('close', () => {
          log.success(`포트 ${port}가 사용 가능합니다.`)
          resolve()
        })
        server.close()
      })
      
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          log.warning(`포트 ${port}가 이미 사용 중입니다.`)
          log.info('다른 포트를 사용하거나 기존 프로세스를 종료하세요.')
        }
        resolve()
      })
    })
  }

  async startServices() {
    log.step('개발 서비스 시작 중...')
    
    const services = []

    // 1. Next.js 개발 서버
    if (this.shouldStartNextjs()) {
      services.push({
        name: 'Next.js',
        command: 'npm',
        args: ['run', 'dev'],
        color: colors.green,
      })
    }

    // 2. 데이터베이스 스튜디오 (선택적)
    if (this.shouldStartDbStudio()) {
      services.push({
        name: 'DB Studio',
        command: 'npm',
        args: ['run', 'db:studio'],
        color: colors.blue,
      })
    }

    // 3. 타입 체크 (선택적)
    if (process.env.TYPE_CHECK_ON_BUILD === 'true') {
      services.push({
        name: 'TypeScript',
        command: 'npm',
        args: ['run', 'type-check:watch'],
        color: colors.cyan,
      })
    }

    // 서비스 시작
    for (const service of services) {
      await this.startService(service)
    }

    // 개발 서버 정보 출력
    this.printServerInfo()
  }

  shouldStartNextjs() {
    return !process.argv.includes('--no-nextjs')
  }

  shouldStartDbStudio() {
    return process.argv.includes('--with-db') && 
           process.env.NEXT_PUBLIC_SUPABASE_URL &&
           !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  }

  async startService(service) {
    return new Promise((resolve) => {
      log.info(`${service.name} 서비스 시작 중...`)
      
      const process = spawn(service.command, service.args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
      })

      // 출력 처리
      process.stdout.on('data', (data) => {
        const output = data.toString().trim()
        if (output) {
          console.log(`${service.color}[${service.name}]${colors.reset} ${output}`)
        }
      })

      process.stderr.on('data', (data) => {
        const output = data.toString().trim()
        if (output && !output.includes('warn')) {
          console.log(`${service.color}[${service.name}]${colors.reset} ${output}`)
        }
      })

      process.on('close', (code) => {
        if (code !== 0 && !this.isShuttingDown) {
          log.error(`${service.name} 서비스가 종료되었습니다. (코드: ${code})`)
        }
      })

      this.processes.push({
        name: service.name,
        process,
      })

      // 짧은 지연 후 다음 서비스 시작
      setTimeout(resolve, 1000)
    })
  }

  printServerInfo() {
    const host = process.env.DEV_SERVER_HOST || 'localhost'
    const port = process.env.DEV_SERVER_PORT || 3000
    
    console.log('\n' + '='.repeat(60))
    console.log(`${colors.green}🚀 개발 서버가 실행 중입니다!${colors.reset}`)
    console.log('='.repeat(60))
    console.log(`${colors.cyan}📍 메인 사이트:${colors.reset} http://${host}:${port}`)
    console.log(`${colors.cyan}🛡️  관리자 페이지:${colors.reset} http://${host}:${port}/admin`)
    console.log(`${colors.cyan}🔧 API 엔드포인트:${colors.reset} http://${host}:${port}/api`)
    
    if (this.shouldStartDbStudio()) {
      console.log(`${colors.cyan}💾 DB 스튜디오:${colors.reset} http://localhost:4983`)
    }
    
    console.log('='.repeat(60))
    console.log(`${colors.yellow}⚡ 개발 팁:${colors.reset}`)
    console.log('  • Ctrl+C: 서버 종료')
    console.log('  • 파일 수정 시 자동 새로고침')
    console.log('  • 환경변수 변경 시 서버 재시작 필요')
    
    if (process.env.DEV_ADMIN_MODE === 'true') {
      console.log(`${colors.red}⚠️  경고: 개발 관리자 모드가 활성화됨${colors.reset}`)
    }
    
    if (process.env.USE_MOCK_DATA === 'true') {
      console.log(`${colors.blue}🎭 모의 데이터 모드로 실행 중${colors.reset}`)
    }
    
    console.log('='.repeat(60) + '\n')
  }

  shutdown() {
    if (this.isShuttingDown) return
    this.isShuttingDown = true

    log.info('개발 서버를 종료하는 중...')

    this.processes.forEach(({ name, process }) => {
      log.info(`${name} 서비스 종료 중...`)
      process.kill('SIGTERM')
    })

    setTimeout(() => {
      log.success('개발 서버가 종료되었습니다.')
      process.exit(0)
    }, 2000)
  }
}

// CLI 인터페이스
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
ASCA 개발 서버 시작 도구

사용법:
  node scripts/dev-server.js [옵션]

옵션:
  --with-db      데이터베이스 스튜디오도 함께 시작
  --no-nextjs    Next.js 서버 시작하지 않음
  --help, -h     도움말 표시

예시:
  node scripts/dev-server.js                # 기본 개발 서버 시작
  node scripts/dev-server.js --with-db      # DB 스튜디오와 함께 시작
  npm run server:dev                        # package.json 스크립트 사용
`)
  process.exit(0)
}

// 스크립트 실행
if (require.main === module) {
  const devServer = new DevServer()
  devServer.start()
}

module.exports = DevServer 