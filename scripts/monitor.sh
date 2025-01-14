#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查服务状态
check_service() {
    local service=$1
    if docker-compose ps | grep $service | grep -q "Up"; then
        echo -e "${GREEN}✓${NC} $service 运行正常"
        return 0
    else
        echo -e "${RED}✗${NC} $service 未运行"
        return 1
    fi
}

# 检查资源使用
check_resources() {
    local service=$1
    echo -e "\n${YELLOW}检查 $service 资源使用情况:${NC}"
    docker stats --no-stream $service
}

# 检查日志错误
check_logs() {
    local service=$1
    local error_count=$(docker-compose logs --tail=1000 $service | grep -i "error" | wc -l)
    if [ $error_count -gt 0 ]; then
        echo -e "${RED}发现 $error_count 个错误${NC}"
        echo "最近的错误日志:"
        docker-compose logs --tail=1000 $service | grep -i "error" | tail -n 5
    else
        echo -e "${GREEN}未发现错误${NC}"
    fi
}

# 检查数据库连接
check_database() {
    echo -e "\n${YELLOW}检查数据库连接:${NC}"
    if docker-compose exec db pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} 数据库连接正常"
    else
        echo -e "${RED}✗${NC} 数据库连接失败"
    fi
}

# 检查Redis连接
check_redis() {
    echo -e "\n${YELLOW}检查Redis连接:${NC}"
    if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Redis连接正常"
    else
        echo -e "${RED}✗${NC} Redis连接失败"
    fi
}

# 检查SSL证书
check_ssl() {
    echo -e "\n${YELLOW}检查SSL证书:${NC}"
    local domain=$(grep DOMAIN .env | cut -d '=' -f2)
    local cert_file="ssl/$domain.crt"
    if [ -f "$cert_file" ]; then
        local expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
        local expiry_epoch=$(date -d "$expiry_date" +%s)
        local now_epoch=$(date +%s)
        local days_left=$(( ($expiry_epoch - $now_epoch) / 86400 ))
        
        if [ $days_left -lt 30 ]; then
            echo -e "${RED}警告: SSL证书将在 $days_left 天后过期${NC}"
        else
            echo -e "${GREEN}✓${NC} SSL证书有效期还剩 $days_left 天"
        fi
    else
        echo -e "${RED}✗${NC} 未找到SSL证书"
    fi
}

# 检查磁盘使用
check_disk() {
    echo -e "\n${YELLOW}检查磁盘使用情况:${NC}"
    df -h | grep -E '^/dev/'
    
    echo -e "\n${YELLOW}检查Docker卷使用情况:${NC}"
    docker system df -v
}

# 检查备份
check_backups() {
    echo -e "\n${YELLOW}检查备份状态:${NC}"
    local latest_backup=$(ls -t backups/backup_*.sql.gz 2>/dev/null | head -n1)
    if [ -n "$latest_backup" ]; then
        local backup_time=$(stat -c %Y "$latest_backup")
        local now=$(date +%s)
        local hours_ago=$(( ($now - $backup_time) / 3600 ))
        
        if [ $hours_ago -gt 24 ]; then
            echo -e "${RED}警告: 最后一次备份是 $hours_ago 小时前${NC}"
        else
            echo -e "${GREEN}✓${NC} 最后一次备份是 $hours_ago 小时前"
        fi
    else
        echo -e "${RED}✗${NC} 未找到备份文件"
    fi
}

# 主函数
main() {
    echo -e "${YELLOW}开始系统检查...${NC}"
    
    # 检查各个服务
    for service in nginx api db redis prometheus logstash; do
        echo -e "\n${YELLOW}检查 $service 服务:${NC}"
        check_service $service
        check_resources $service
        check_logs $service
    done
    
    # 检查数据库和Redis
    check_database
    check_redis
    
    # 检查SSL证书
    check_ssl
    
    # 检查磁盘使用
    check_disk
    
    # 检查备份
    check_backups
    
    echo -e "\n${YELLOW}检查完成${NC}"
}

# 运行主函数
main 