#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

// 配置参数
const CONFIG = {
    buildDir: 'build',           // 最终构建目录
    clientDir: 'client',         // 前端目录
    serverDir: 'server',         // 后端目录
    keepServerNodeModules: false // 是否保留后端node_modules
};

// 主函数
async function main() {
    try {
        console.log(`🚀 开始构建`);

        // 清理构建目录
        await cleanDirectory(CONFIG.buildDir);

        // 构建前端
        await buildClient();

        // 构建后端
        await buildServer();

        console.log('\n✅ 构建成功！');

    } catch (error) {
        console.error('\n❌ 构建失败:', error.message);
        process.exit(1);
    }
}

/* ========== 工具函数 ========== */

// 清理目录
async function cleanDirectory(dirPath) {
    try {
        await fs.rm(dirPath, { recursive: true, force: true });
        console.log(`🧹 已清理目录: ${dirPath}`);
    } catch (error) {
        throw new Error(`清理目录失败: ${error.message}`);
    }
}

// 替换 fs.rename 为 copy + delete
async function safeMoveDir(src, dest) {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.cp(src, dest, { recursive: true });
    await fs.rm(src, { recursive: true });
}

/* ========== 前端构建 ========== */
async function buildClient() {
    console.log('\n🖥️  开始构建前端...');

    try {
        // 执行构建命令
        execSync(`npm run build`, {
            cwd: CONFIG.clientDir,
            stdio: 'inherit'
        });

        // 移动构建产物
        await safeMoveDir(
            path.join(CONFIG.clientDir, 'dist'),
            path.join(CONFIG.buildDir, 'client')
        );

    } catch (error) {
        throw new Error(`前端构建失败: ${error.message}`);
    }
}

/* ========== 后端构建 ========== */
async function buildServer() {
    console.log('\n🔧 开始构建后端...');

    const serverBuildPath = path.join(CONFIG.buildDir, 'server');

    try {
        // 创建目录结构
        await fs.mkdir(serverBuildPath, { recursive: true });

        // 复制必要文件
        const copyItems = [
            'package.json',
            'package-lock.json',
            'server.js',
            '.env'
        ];

        await Promise.all(
            copyItems.map(file =>
                fs.copyFile(
                    path.join(CONFIG.serverDir, file),
                    path.join(serverBuildPath, file)
                )
            ));

        // 安装生产依赖
        if (!CONFIG.keepServerNodeModules) {
            console.log('📦 安装后端依赖...');
            execSync('npm ci --omit=dev', {
                cwd: serverBuildPath,
                stdio: 'inherit'
            });
        }
    } catch (error) {
        throw new Error(`后端构建失败: ${error.message}`);
    }
}

// 执行主函数
main();