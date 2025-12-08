/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // GitHub Raw Content
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/**", // Permite qualquer path do GitHub
      },
      // GitHub Assets (caso use github.com/user/repo/blob/)
      {
        protocol: "https",
        hostname: "github.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // CSP (Content Security Policy)
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
          },
          // Anti-Clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Anti-MIME Sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Controle de Referer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Bloqueia APIs sensíveis
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // XSS Protection (legado)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // HSTS (produção only)
          ...(process.env.NODE_ENV === "production"
            ? [
              {
                key: "Strict-Transport-Security",
                value: "max-age=31536000; includeSubDomains; preload",
              },
            ]
            : []),
          // CORS (desabilita acesso externo)
          {
            key: "Access-Control-Allow-Origin",
            value: "null",
          },
        ]
      }
    ]
  }
};

export default nextConfig;
