import { exec } from "child_process"
import { promisify } from "util"
import { writeFileSync } from "fs"
import { prisma } from "@/lib/prisma"
import { registerSiteToSearchEngines } from "@/lib/search-engine-registrar"

const execAsync = promisify(exec)

const DOMAIN_SUFFIX = "adready.kr"
const WP_BASE_DIR = "/var/www"
const MYSQL_ROOT_PW = process.env.MYSQL_ROOT_PASSWORD || ""
const ADMIN_EMAIL_DEFAULT = process.env.WP_ADMIN_EMAIL || "admin@adready.kr"

async function setStep(siteId: string, step: number, log?: string) {
  await prisma.site.update({
    where: { id: siteId },
    data: {
      installStep: step,
      ...(log ? { installLog: log } : {}),
    },
  })
}

async function setFailed(siteId: string, log: string) {
  await prisma.site.update({
    where: { id: siteId },
    data: { status: "FAILED", installLog: log },
  })
}

function genPassword(len = 16): string {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("")
}

async function runWpCli(cmd: string): Promise<string> {
  const { stdout, stderr } = await execAsync(cmd, { timeout: 120_000 })
  if (stderr && !stderr.includes("Success") && !stderr.includes("Warning")) {
    throw new Error(stderr.trim())
  }
  return stdout.trim()
}

export async function installWordPress(siteId: string): Promise<void> {
  if (!MYSQL_ROOT_PW) {
    throw new Error(".env.local에 MYSQL_ROOT_PASSWORD가 설정되지 않았습니다")
  }
  const site = await prisma.site.findUnique({ where: { id: siteId } })
  if (!site || !site.slug) {
    throw new Error("사이트 정보 또는 slug가 없습니다")
  }

  const slug = site.slug
  const domain = slug + "." + DOMAIN_SUFFIX
  const wpPath = WP_BASE_DIR + "/" + slug
  const dbName = "wp_" + slug.replace(/-/g, "_")
  const dbUser = "wp_" + slug.replace(/-/g, "_").substring(0, 12)
  const dbPass = genPassword(20)
  const adminUser = "adready_admin"
  const adminPass = genPassword(16)
  const adminEmail = site.wpAdminEmail || ADMIN_EMAIL_DEFAULT

  await prisma.site.update({
    where: { id: siteId },
    data: { wpAdminUser: adminUser, wpAdminPass: adminPass, status: "INSTALLING" },
  })

  try {
    await setStep(siteId, 1)
    await runWpCli(
      'mysql -u root -p"' + MYSQL_ROOT_PW + '" -e "' +
      "CREATE DATABASE IF NOT EXISTS " + dbName + " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; " +
      "CREATE USER IF NOT EXISTS '" + dbUser + "'@'localhost' IDENTIFIED BY '" + dbPass + "'; " +
      "GRANT ALL PRIVILEGES ON " + dbName + ".* TO '" + dbUser + "'@'localhost'; " +
      'FLUSH PRIVILEGES;"'
    )

    await setStep(siteId, 2)
    await runWpCli("mkdir -p " + wpPath)
    await runWpCli("wp core download --path=" + wpPath + " --locale=ko_KR --allow-root")

    await setStep(siteId, 3)
    await runWpCli(
      "wp config create --path=" + wpPath + " " +
      "--dbname=" + dbName + " --dbuser=" + dbUser + ' --dbpass="' + dbPass + '" ' +
      "--dbhost=localhost --dbcharset=utf8mb4 --allow-root"
    )
    const siteTitle = (site.name || slug).replace(/"/g, '\\"')
    // HTTP로 먼저 설치 (SSL 발급 전)
    await runWpCli(
      "wp core install --path=" + wpPath + " " +
      "--url=http://" + domain + " " +
      '--title="' + siteTitle + '" ' +
      "--admin_user=" + adminUser + " " +
      '--admin_password="' + adminPass + '" ' +
      "--admin_email=" + adminEmail + " " +
      "--skip-email --allow-root"
    )

    await setStep(siteId, 4)
    const basePlugins = ["wordpress-seo", "wp-super-cache", "contact-form-7"]
    const monetizePlugins = site.plugin === "coupang" ? ["affiliate-wp"] : ["ad-inserter"]
    const plugins = [...basePlugins, ...monetizePlugins]
    for (const plugin of plugins) {
      await runWpCli(
        "wp plugin install " + plugin + " --activate --path=" + wpPath + " --allow-root"
      ).catch(() => {})
    }

    await runWpCli('wp option update blogdescription "" --path=' + wpPath + " --allow-root")
    await runWpCli('wp option update permalink_structure "/%postname%/" --path=' + wpPath + " --allow-root")
    await runWpCli("wp rewrite flush --path=" + wpPath + " --allow-root")

    await setStep(siteId, 5)
    // AlmaLinux 8: www.sock 사용
    const nginxConf = "server {\n    listen 80;\n    server_name " + domain + ";\n    root " + wpPath + ";\n    index index.php index.html;\n\n    client_max_body_size 64M;\n\n    location / {\n        try_files \$uri \$uri/ /index.php?\$args;\n    }\n\n    location ~ \\.php$ {\n        fastcgi_pass unix:/run/php-fpm/www.sock;\n        fastcgi_index index.php;\n        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;\n        include fastcgi_params;\n    }\n\n    location ~ /\\.ht {\n        deny all;\n    }\n}"
    writeFileSync("/etc/nginx/conf.d/" + slug + ".conf", nginxConf, "utf8")
    await runWpCli("nginx -t && systemctl reload nginx")

    await setStep(siteId, 6)
    // SSL 발급 시도
    try {
      await runWpCli(
        "certbot --nginx -d " + domain + " --non-interactive --agree-tos " +
        "-m " + adminEmail + " --redirect"
      )
      // SSL 성공 시 WordPress URL을 https로 업데이트
      await runWpCli("wp option update siteurl 'https://" + domain + "' --path=" + wpPath + " --allow-root")
      await runWpCli("wp option update home 'https://" + domain + "' --path=" + wpPath + " --allow-root")
    } catch (e) {
      // SSL 실패: HTTP로 유지
      await prisma.site.update({
        where: { id: siteId },
        data: { installLog: "SSL 발급 실패 (HTTP로 운영): " + (e instanceof Error ? e.message : String(e)) },
      })
    }

    await setStep(siteId, 7)
    await prisma.site.update({
      where: { id: siteId },
      data: {
        status: "ACTIVE",
        installStep: 7,
        installLog: null,
      },
    })

    registerSiteToSearchEngines(slug).catch(e =>
      console.error("[WpInstaller] 검색엔진 등록 실패:", e)
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    await setFailed(siteId, msg)
    throw error
  }
}
