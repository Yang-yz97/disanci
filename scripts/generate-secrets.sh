#!/bin/bash

# 生成随机字符串的函数
generate_password() {
    local length=$1
    tr -dc 'A-Za-z0-9!@#$%^&*()_+' < /dev/urandom | head -c $length
}

# 检查是否存在 .env 文件
if [ ! -f .env ]; then
    echo "未找到 .env 文件，请先创建"
    exit 1
fi

# 生成新的密钥
DB_PASSWORD=$(generate_password 32)
REDIS_PASSWORD=$(generate_password 32)
JWT_SECRET=$(generate_password 64)
ELASTIC_PASSWORD=$(generate_password 32)

# 更新 .env 文件
sed -i "s/^POSTGRES_PASSWORD=.*$/POSTGRES_PASSWORD=$DB_PASSWORD/" .env
sed -i "s/^REDIS_PASSWORD=.*$/REDIS_PASSWORD=$REDIS_PASSWORD/" .env
sed -i "s/^JWT_SECRET=.*$/JWT_SECRET=$JWT_SECRET/" .env
sed -i "s/^ELASTIC_PASSWORD=.*$/ELASTIC_PASSWORD=$ELASTIC_PASSWORD/" .env

# 更新密钥文件
echo $DB_PASSWORD > secrets/db_password.txt
echo $JWT_SECRET > secrets/jwt_secret.txt

# 设置正确的权限
chmod 600 secrets/db_password.txt secrets/jwt_secret.txt
chmod 600 .env

echo "密钥已更新。请妥善保管以下信息："
echo "数据库密码: $DB_PASSWORD"
echo "Redis密码: $REDIS_PASSWORD"
echo "JWT密钥: $JWT_SECRET"
echo "Elastic密码: $ELASTIC_PASSWORD"

# 创建密钥备份
BACKUP_FILE="secrets/backup_$(date +%Y%m%d_%H%M%S).txt"
echo "数据库密码: $DB_PASSWORD" > $BACKUP_FILE
echo "Redis密码: $REDIS_PASSWORD" >> $BACKUP_FILE
echo "JWT密钥: $JWT_SECRET" >> $BACKUP_FILE
echo "Elastic密码: $ELASTIC_PASSWORD" >> $BACKUP_FILE
chmod 600 $BACKUP_FILE

echo "密钥备份已保存到: $BACKUP_FILE"
echo "请将此文件安全保存，并从服务器中删除" 