/**
 * 图标生成脚本
 * 
 * 此脚本使用Node.js和puppeteer来生成PNG格式的图标
 * 
 * 安装依赖:
 * npm install puppeteer
 * 
 * 使用方法:
 * node generate-icons.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 确保目录存在
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// 主函数
async function generateIcons() {
  console.log('开始生成图标...');
  
  // 启动浏览器
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // 读取SVG文件
  const lightSvg = fs.readFileSync(path.join(__dirname, 'img/favicon.svg'), 'utf8');
  const darkSvg = fs.readFileSync(path.join(__dirname, 'img/favicon-dark.svg'), 'utf8');
  
  // 确保输出目录存在
  ensureDirectoryExists(path.join(__dirname, 'img'));
  
  // 生成不同尺寸的图标
  const sizes = [16, 32, 48, 64, 128, 192, 256];
  
  for (const size of sizes) {
    console.log(`生成 ${size}x${size} 图标...`);
    
    // 设置页面大小
    await page.setViewport({ width: size, height: size });
    
    // 生成亮色图标
    await page.setContent(`
      <style>
        body { margin: 0; padding: 0; }
        svg { width: ${size}px; height: ${size}px; }
      </style>
      ${lightSvg}
    `);
    
    const lightBuffer = await page.screenshot({ 
      omitBackground: true,
      type: 'png'
    });
    
    fs.writeFileSync(
      path.join(__dirname, `img/favicon-${size}x${size}.png`), 
      lightBuffer
    );
    
    // 生成暗色图标
    await page.setContent(`
      <style>
        body { margin: 0; padding: 0; background-color: #121212; }
        svg { width: ${size}px; height: ${size}px; }
      </style>
      ${darkSvg}
    `);
    
    const darkBuffer = await page.screenshot({ 
      omitBackground: true,
      type: 'png'
    });
    
    fs.writeFileSync(
      path.join(__dirname, `img/favicon-dark-${size}x${size}.png`), 
      darkBuffer
    );
  }
  
  // 创建favicon.ico (16x16 和 32x32 的组合)
  console.log('生成 favicon.ico...');
  
  // 关闭浏览器
  await browser.close();
  
  console.log('图标生成完成!');
}

// 执行主函数
generateIcons().catch(console.error);
