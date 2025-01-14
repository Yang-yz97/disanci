#!/bin/bash

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then 
    echo "请以 root 权限运行此脚本"
    exit 1
fi

# 检查必要的文件
for file in .env docker-compose.yml nginx.conf; do
    if [ ! -f $file ]; then
        echo "错误：未找到 $file"
        exit 1
    fi
done

# 检查必要的目录
for dir in ssl secrets logs dist; do
    if [ ! -d $dir ]; then
        echo "错误：未找到 $dir 目录"
        exit 1
    fi
done

# 安装必要的软件
echo "正在安装必要的软件..."
if command -v apt-get &> /dev/null; then
    # Debian/Ubuntu
    apt-get update
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        ufw
elif command -v yum &> /dev/null; then
    # CentOS/RHEL
    yum install -y \
        yum-utils \
        curl \
        firewalld
else
    echo "不支持的操作系统"
    exit 1
fi

# 安装 Docker（如果未安装）
if ! command -v docker &> /dev/null; then
    echo "正在安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 安装 Docker Compose（如果未安装）
if ! command -v docker-compose &> /dev/null; then
    echo "正在安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 配置防火墙
echo "配置防火墙..."
if command -v ufw &> /dev/null; then
    # Ubuntu/Debian
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
elif command -v firewall-cmd &> /dev/null; then
    # CentOS/RHEL
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
fi

# 创建必要的目录
mkdir -p logs/{nginx,api} backups

# 设置目录权限
chown -R 1000:1000 logs backups
chmod -R 755 logs backups

# 停止现有服务
echo "停止现有服务..."
docker-compose down

# 清理旧容器和数据（可选）
read -p "是否清理所有数据并重新开始？[y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "清理数据..."
    docker system prune -af
    docker volume prune -f
fi

# 启动服务
echo "启动服务..."
docker-compose up -d

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo "检查服务状态..."
docker-compose ps

# 检查日志是否有错误
echo "检查错误日志..."
docker-compose logs | grep -i error

# 设置日志轮转
cat > /etc/logrotate.d/warehouse << EOF
/var/log/warehouse/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -s /var/run/nginx.pid ] && kill -USR1 \$(cat /var/run/nginx.pid)
    endscript
}
EOF

echo "部署完成！"
echo "请检查以下内容："
echo "1. 访问 https://your-domain.com 确认网站是否正常运行"
echo "2. 检查 logs 目录下的日志文件"
echo "3. 使用 docker-compose logs 查看详细日志"
echo "4. 确认所有服务都已正常启动" 