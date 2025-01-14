#!/bin/bash

# 设置变量
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="warehouse"
DB_USER="postgres"
DB_HOST="db"
BACKUP_DAYS=7 # 保留最近7天的备份

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
echo "开始备份数据库..."
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "数据库备份成功: backup_${TIMESTAMP}.sql.gz"
else
    echo "数据库备份失败"
    exit 1
fi

# 删除旧备份
echo "清理旧备份..."
find $BACKUP_DIR -name "backup_*.sql.gz" -type f -mtime +$BACKUP_DAYS -delete

# 创建备份清单
echo "创建备份清单..."
ls -lh $BACKUP_DIR > "$BACKUP_DIR/backup_inventory.txt"

# 检查备份文件大小
echo "检查备份文件大小..."
du -sh "$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"

# 发送通知（如果需要可以取消注释）
# if [ -x "$(command -v curl)" ]; then
#     curl -X POST -H "Content-Type: application/json" \
#          -d "{\"text\":\"数据库备份完成: backup_${TIMESTAMP}.sql.gz\"}" \
#          "YOUR_WEBHOOK_URL"
# fi

echo "备份流程完成" 