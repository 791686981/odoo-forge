# 代码仓库约定

> 本文件描述 dev 使用的代码仓库约定。不同项目可以替换此文件。

---

## 仓库信息

| 项目 | 值 |
|------|---|
| 仓库名 | engi-one |
| 仓库路径 | /Users/majianhang/Code/Company/engi-one |
| Odoo 版本 | 18.0 |
| 运行方式 | Docker Compose |

## 目录结构

```
engi-one/
├── addons/
│   ├── custom/             ← 自研模块放这里
│   ├── third-party/        ← 第三方模块
│   └── nonprod/            ← 非生产环境模块
├── addons.local/
│   ├── enterprise/         ← 企业版模块（本地挂载）
│   └── labs/               ← 实验模块
├── odoo/                   ← Odoo 18 源码（不提交）
├── config/                 ← Odoo 配置模板
├── scripts/                ← 容器启动脚本
├── docker/                 ← Docker 镜像定义
├── .worktrees/             ← git worktree 目录
└── docs/                   ← 项目文档
```

## 模块存放位置

| 类型 | 路径 | 说明 |
|------|------|------|
| 自研模块（skill 产出） | `addons/custom/{module_name}/` | 代码生成的目标路径 |
| 第三方模块 | `addons/third-party/` | 不修改，整包放入 |
| 实验模块 | `addons.local/labs/` | 临时试验，不提交 |

## Git 工作流

| 项目 | 约定 |
|------|------|
| 主分支 | `main`（生产）、`staging`（集成/验收） |
| 功能分支 | `feature/{module-name}` 从 `staging` 切出 |
| 修复分支 | `fix/{module-name}-{issue}` 从 `staging` 切出 |
| 热修复 | `hotfix/{module-name}-{issue}` 从 `main` 切出 |
| 命名规则 | 小写英文 kebab-case |

### Worktree 使用

开发新 EPIC 时创建独立 worktree，避免影响主工作区：

```bash
# 创建
cd /Users/majianhang/Code/Company/engi-one
git worktree add .worktrees/{epic-name} -b feature/{module-name} staging

# 开发完成后清理
git worktree remove .worktrees/{epic-name}
```

## 常用命令

| 操作 | 命令 | 说明 |
|------|------|------|
| 启动环境 | `make up` | 启动 Docker Compose |
| 安装/更新模块 | `make update M={module}` | 安装或升级指定模块 |
| 重启 Odoo | `make restart` | 视图修改后需要重启 |
| 查看日志 | `make logs` | 实时查看 Odoo 日志 |
| 进容器 | `make shell` | 进入 Odoo 容器 bash |
| 停止环境 | `make down` | 停止所有服务 |
| 重置环境 | `make reset` | 停止并删除数据卷（慎用） |

## 测试执行

```bash
# 在容器内跑单个模块的测试
make shell
cd /opt/odoo
python3 odoo/odoo-bin -c /etc/odoo/odoo.conf -d {db_name} --test-enable -u {module} --stop-after-init

# 或者用 make update 带测试
make update M={module}  # update 本身会触发 post-install 测试
```

## 查看已有模型源码

继承已有模型时，需要查看原模型的源码：

```bash
# Odoo 标准模块源码
odoo/addons/{module_name}/models/

# 企业版模块源码
addons.local/enterprise/{module_name}/models/

# 第三方/OCA 模块源码
addons/third-party/{module_name}/models/
addons.local/labs/{module_name}/models/
```
