import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ベース：白〜オフホワイト
        base: "#FFFFFF",
        offwhite: "#F7F6F4",
        // テキスト：チャコール（純黒不使用）
        ink: "#2A2A2A",
        // アクセント：インクブルー（リンク/ボタン/見出し強調に限定）
        accent: "#1A2A40",
        // ビジュアルブロック背景：黒マット
        matte: "#111111",
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-jp)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      maxWidth: {
        content: "72rem", // 1カラム中心の最大幅
      },
      letterSpacing: {
        wide2: "0.08em",
      },
    },
  },
  plugins: [],
};

export default config;
