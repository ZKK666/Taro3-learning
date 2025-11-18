/**
 * 包大小分析脚本
 *
 * 【学习要点】小程序包大小限制
 *
 * 微信小程序限制：
 * - 主包：最大 2MB
 * - 单个分包：最大 2MB
 * - 总包：最大 20MB
 *
 * 使用方法：
 * node scripts/analyze-size.js
 *
 * 这个脚本会：
 * 1. 分析各个包的大小
 * 2. 按文件类型统计
 * 3. 找出最大的文件
 * 4. 检查是否超出限制
 */

const fs = require('fs')
const path = require('path')

// 包大小限制（字节）
const LIMITS = {
  MAIN_PACKAGE: 2 * 1024 * 1024,      // 主包 2MB
  SUB_PACKAGE: 2 * 1024 * 1024,       // 分包 2MB
  TOTAL: 20 * 1024 * 1024,            // 总包 20MB
  WARNING_THRESHOLD: 0.8               // 80% 时发出警告
}

// 输出目录
const DIST_DIR = path.join(__dirname, '..', 'dist', 'weapp')

/**
 * 【学习要点】递归遍历目录
 *
 * 使用递归方式遍历所有文件
 * 这是分析文件大小的基础
 */
function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) {
    return
  }

  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      walkDir(filePath, callback)
    } else {
      callback(filePath, stat)
    }
  })
}

/**
 * 【学习要点】按类型统计文件大小
 *
 * 了解各类型文件占比，有助于针对性优化
 * - JS 文件通常最大，需要 Tree Shaking
 * - 图片文件应该上传 CDN
 * - WXML/WXSS 可以压缩
 */
function analyzeByType(dir) {
  const stats = {
    js: { size: 0, count: 0, files: [] },
    wxss: { size: 0, count: 0, files: [] },
    wxml: { size: 0, count: 0, files: [] },
    json: { size: 0, count: 0, files: [] },
    images: { size: 0, count: 0, files: [] },
    other: { size: 0, count: 0, files: [] }
  }

  walkDir(dir, (filePath, stat) => {
    const ext = path.extname(filePath).toLowerCase()
    const size = stat.size
    const relativePath = path.relative(dir, filePath)
    const fileInfo = { path: relativePath, size }

    if (['.js'].includes(ext)) {
      stats.js.size += size
      stats.js.count++
      stats.js.files.push(fileInfo)
    } else if (['.wxss', '.css'].includes(ext)) {
      stats.wxss.size += size
      stats.wxss.count++
      stats.wxss.files.push(fileInfo)
    } else if (['.wxml'].includes(ext)) {
      stats.wxml.size += size
      stats.wxml.count++
      stats.wxml.files.push(fileInfo)
    } else if (['.json'].includes(ext)) {
      stats.json.size += size
      stats.json.count++
      stats.json.files.push(fileInfo)
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
      stats.images.size += size
      stats.images.count++
      stats.images.files.push(fileInfo)
    } else {
      stats.other.size += size
      stats.other.count++
      stats.other.files.push(fileInfo)
    }
  })

  return stats
}

/**
 * 【学习要点】分析分包大小
 *
 * 小程序按目录划分包：
 * - pages/ 目录是主包
 * - packageXxx/ 目录是分包
 */
function analyzePackages(dir) {
  const packages = {
    main: { name: '主包', size: 0, path: '' },
    sub: []
  }

  if (!fs.existsSync(dir)) {
    console.log('⚠️  输出目录不存在，请先运行构建命令')
    return packages
  }

  const items = fs.readdirSync(dir)

  items.forEach(item => {
    const itemPath = path.join(dir, item)
    const stat = fs.statSync(itemPath)

    if (stat.isDirectory()) {
      let packageSize = 0
      walkDir(itemPath, (_, fileStat) => {
        packageSize += fileStat.size
      })

      // 判断是否为分包目录
      if (item.startsWith('package')) {
        packages.sub.push({
          name: item,
          size: packageSize,
          path: itemPath
        })
      } else if (['pages', 'components', 'utils', 'assets'].includes(item)) {
        // 主包内容
        packages.main.size += packageSize
      }
    } else {
      // 根目录文件算入主包
      packages.main.size += stat.size
    }
  })

  return packages
}

/**
 * 【学习要点】格式化文件大小
 *
 * 将字节转换为人类可读的格式
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 【学习要点】生成分析报告
 *
 * 可视化显示包大小情况
 * 帮助快速定位问题
 */
function generateReport() {
  console.log('\n📊 小程序包大小分析报告\n')
  console.log('='.repeat(60))

  // 1. 分析分包
  console.log('\n📦 分包大小:\n')
  const packages = analyzePackages(DIST_DIR)

  // 主包
  const mainPercent = (packages.main.size / LIMITS.MAIN_PACKAGE * 100).toFixed(1)
  const mainStatus = packages.main.size > LIMITS.MAIN_PACKAGE ? '❌' :
                     packages.main.size > LIMITS.MAIN_PACKAGE * LIMITS.WARNING_THRESHOLD ? '⚠️' : '✅'
  console.log(`  ${mainStatus} 主包: ${formatSize(packages.main.size)} / ${formatSize(LIMITS.MAIN_PACKAGE)} (${mainPercent}%)`)

  // 分包
  let totalSize = packages.main.size
  packages.sub.forEach(pkg => {
    totalSize += pkg.size
    const percent = (pkg.size / LIMITS.SUB_PACKAGE * 100).toFixed(1)
    const status = pkg.size > LIMITS.SUB_PACKAGE ? '❌' :
                   pkg.size > LIMITS.SUB_PACKAGE * LIMITS.WARNING_THRESHOLD ? '⚠️' : '✅'
    console.log(`  ${status} ${pkg.name}: ${formatSize(pkg.size)} / ${formatSize(LIMITS.SUB_PACKAGE)} (${percent}%)`)
  })

  // 总包
  const totalPercent = (totalSize / LIMITS.TOTAL * 100).toFixed(1)
  const totalStatus = totalSize > LIMITS.TOTAL ? '❌' :
                      totalSize > LIMITS.TOTAL * LIMITS.WARNING_THRESHOLD ? '⚠️' : '✅'
  console.log(`\n  ${totalStatus} 总大小: ${formatSize(totalSize)} / ${formatSize(LIMITS.TOTAL)} (${totalPercent}%)`)

  // 2. 按类型统计
  console.log('\n\n📁 文件类型统计:\n')
  const typeStats = analyzeByType(DIST_DIR)

  Object.entries(typeStats).forEach(([type, data]) => {
    if (data.count > 0) {
      const percent = (data.size / totalSize * 100).toFixed(1)
      console.log(`  ${type.toUpperCase().padEnd(8)} ${formatSize(data.size).padStart(12)} (${percent}%) - ${data.count} 个文件`)
    }
  })

  // 3. 最大文件 TOP 10
  console.log('\n\n📈 最大文件 TOP 10:\n')
  const allFiles = []
  Object.values(typeStats).forEach(data => {
    allFiles.push(...data.files)
  })

  allFiles
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach((file, index) => {
      console.log(`  ${(index + 1).toString().padStart(2)}. ${formatSize(file.size).padStart(12)} - ${file.path}`)
    })

  // 4. 优化建议
  console.log('\n\n💡 优化建议:\n')

  if (typeStats.images.size > 100 * 1024) {
    console.log('  • 图片资源较大，建议上传到 CDN')
  }

  if (typeStats.js.size > 500 * 1024) {
    console.log('  • JS 文件较大，检查是否有未使用的依赖')
  }

  const largeFiles = allFiles.filter(f => f.size > 50 * 1024)
  if (largeFiles.length > 0) {
    console.log(`  • 有 ${largeFiles.length} 个文件超过 50KB，考虑代码分割`)
  }

  if (packages.main.size > LIMITS.MAIN_PACKAGE * 0.7) {
    console.log('  • 主包即将超限，考虑将更多页面移至分包')
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n✨ 分析完成!\n')

  // 返回是否通过检查
  return packages.main.size <= LIMITS.MAIN_PACKAGE &&
         packages.sub.every(p => p.size <= LIMITS.SUB_PACKAGE) &&
         totalSize <= LIMITS.TOTAL
}

// 运行分析
const passed = generateReport()
process.exit(passed ? 0 : 1)
