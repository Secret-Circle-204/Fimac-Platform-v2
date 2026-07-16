module.exports = {
  apps: [
    {
      name: 'fimac-app',
      //script: 'pnpm',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 8181', // تشغيل التطبيق على المنفذ 8181
      instances: 1, // يمكنك زيادتها لـ "max" إذا كان السيرفر قوياً
      exec_mode: 'fork', // استخدام fork لبيئات Next.js
      autorestart: true, // إعادة التشغيل تلقائياً في حالة الانهيار
      watch: false, // لا تراقب الملفات (تُستخدم في بيئة التطوير فقط)
      max_memory_restart: '2G', // إعادة تشغيل التطبيق إذا تجاوز استهلاك الذاكرة 1 جيجا
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
