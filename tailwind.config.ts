import { DEFAULT_CIPHERS } from "node:tls";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./node_modules/flowbite-react/lib/**/*.{js,jsx,ts,tsx,mdx}",
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./config/**/*.{js,jsx,ts,tsx,mdx}",
    "./context/**/*.{js,jsx,ts,tsx,mdx}",
    "./locales/**/*.{js,jsx,ts,tsx,mdx}",
    "./gui/**/*.{js,jsx,ts,tsx,mdx}",

  ],

  theme: {
    extend: {
      screens: {
        'xs': '300px', // 添加自定义断点
      },
      borderColor: {
        DEFAULT: 'rgba(204, 204, 204, 0.3)',
      },
      borderWidth:{
        DEFAULT_CIPHERS:'0.5px'
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          "primary": "#C0E218",
          "secondary": "#3f1de7",
          "accent": "#ffffff",
          "neutral": "#9dba0d",
          "base-100": "#ffffff",
          "base-200": "#EDEDED",
          "base-content": "#1d1d1d",
          "info": "#A1C103",
          "success": "#1F7A1F",
          "warning": "#F37121",
          "error": "#ff0000",
          "--rounded-box": "1.5rem", //边框半径圆角盒实用类，用于卡片等大型盒子
          "--rounded-btn": "1.5rem",//border-radius圆角btn实用程序类，用于按钮和类似元素
          "--rounded-badge": "0.5rem", //边框半径圆形徽章实用类，用于徽章及类似产品
          "--animation-btn": "0.25s", //单击按钮时的动画持续时间
          "--animation-input": "0.2s", //复选框、切换、单选等输入的动画持续时间
          "--btn-focus-scale": "0.95", //聚焦按钮时的缩放变换
          "--border-btn": "0.8px", //聚焦按钮时的缩放变换
          "--tab-border": "0.8px", //选项卡的边框宽度
          "--tab-radius": "0rem", //选项卡的边界半径 
        },

        dark: {
          ...require("daisyui/src/theming/themes")["black"],
          "primary": "#C0E218",
          "secondary": "#3f1de7",
          "accent": "#000000",
          "neutral": "#C0E218",
          "base-100": "#000000",
          "base-200": "#111111",
          "base-content": "#ffffffe3",
          "info": "#C0E218",
          "success": "#2CFF2C",
          "warning": "#F37121",
          "error": "#ff0000",
          "--rounded-box": "1.5rem", //边框半径圆角盒实用类，用于卡片等大型盒子
          "--rounded-btn": "1.5rem",//border-radius圆角btn实用程序类，用于按钮和类似元素
          "--rounded-badge": "1rem", //边框半径圆形徽章实用类，用于徽章及类似产品
          "--animation-btn": "0.25s", //单击按钮时的动画持续时间
          "--animation-input": "0.2s", //复选框、切换、单选等输入的动画持续时间
          "--btn-focus-scale": "0.95", //聚焦按钮时的缩放变换
          "--border-btn": "0.8px", //聚焦按钮时的缩放变换
          "--tab-border": "0.8px", //选项卡的边框宽度
          "--tab-radius": "0rem", //选项卡的边界半径 
        }
      }
    ],//false:仅亮+暗|true:所有主题|array:像这样的特定主题[“亮”、“暗”、“纸杯蛋糕”]
    darkTheme: 'dark', //暗模式的一个包含主题的名称
    base: true, // 默认为根元素应用背景色和前景色
    styled: true, // 包括所有组件的daisyUI颜色和设计决策
    utils: true, //添加响应和修饰符实用程序类
    prefix: "", //用于daisyUI类名的前缀（组件、修饰符和响应类名。不是颜色）
    logs: false, // 在构建CSS时在控制台中显示有关daisyUI版本和使用的配置的信息
    themeRoot: ":root", // 接收主题颜色CSS变量的元素
  },
};
export default config;
