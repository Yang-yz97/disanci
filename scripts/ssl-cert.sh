#!/bin/bash

# 检查是否安装 certbot
if ! command -v certbot &> /dev/null; then
    echo "正在安装 certbot..."
    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        sudo apt-get update
        sudo apt-get install -y certbot
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        sudo yum install -y epel-release
        sudo yum install -y certbot
    else
        echo "无法安装 certbot，请手动安装"
        exit 1
    fi
fi

# 从环境变量文件读取域名
if [ -f .env ]; then
    source .env
else
    echo "未找到 .env 文件"
    exit 1
fi

if [ -z "$DOMAIN" ]; then
    echo "请在 .env 文件中设置 DOMAIN 变量"
    exit 1
fi

# 创建 SSL 证书目录
mkdir -p ssl

# 申请证书
echo "正在申请 SSL 证书..."
sudo certbot certonly --standalone \
    -d $DOMAIN \
    --non-interactive \
    --agree-tos \
    --email admin@$DOMAIN \
    --http-01-port=80

# 复制证书到项目目录
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "正在复制证书..."
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/$DOMAIN.crt
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/$DOMAIN.key
    
    # 设置正确的权限
    sudo chown $(whoami) ssl/$DOMAIN.crt ssl/$DOMAIN.key
    sudo chmod 644 ssl/$DOMAIN.crt
    sudo chmod 600 ssl/$DOMAIN.key
    
    echo "证书已成功安装到 ssl 目录"
else
    echo "证书申请失败"
    exit 1
fi

# 创建证书自动续期的 cron 任务
(crontab -l 2>/dev/null; echo "0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/$DOMAIN.crt && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/$DOMAIN.key") | crontab -

echo "已设置证书自动续期任务"
echo "完成！" 