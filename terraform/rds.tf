# ========== DB SUBNET GROUP ==========
resource "aws_db_subnet_group" "agrowatch" {
  name        = "agro-db-subnet-group-${var.environment}"
  description = "Subnet group for AgroWatch RDS MySQL"
  subnet_ids  = aws_subnet.public[*].id # Using public subnets for local access

  tags = {
    Name        = "agrowatch-db-subnet-group"
    Environment = var.environment
    Project     = "AgroWatch"
  }
}

# ========== RDS PARAMETER GROUP (Optional - for MySQL optimizations) ==========
resource "aws_db_parameter_group" "agrowatch" {
  name        = "agro-mysql-params-${var.environment}"
  family      = "mysql8.0"
  description = "Parameter group for AgroWatch MySQL"

  parameter {
    name  = "max_connections"
    value = "150"
  }

  parameter {
    name  = "innodb_buffer_pool_size"
    value = "{DBInstanceClassMemory*3/4}"
  }

  parameter {
    name  = "slow_query_log"
    value = "1"
  }

  parameter {
    name  = "long_query_time"
    value = "2"
  }

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  tags = {
    Name        = "agrowatch-mysql-params"
    Environment = var.environment
    Project     = "AgroWatch"
  }
}

# ========== RDS MYSQL INSTANCE ==========
resource "aws_db_instance" "agrowatch" {
  # Database Configuration
  identifier     = "${var.db_identifier}-${var.environment}"
  engine         = "mysql"
  engine_version = "8.0.45" 
  instance_class = var.db_instance_class

  # Storage Configuration
  allocated_storage        = var.db_allocated_storage
  storage_type             = "gp3"
  storage_encrypted        = true
  delete_automated_backups = var.environment != "production"

  # Database Credentials
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Network Configuration
  db_subnet_group_name   = aws_db_subnet_group.agrowatch.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Backup Configuration
  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  # High Availability
  multi_az = var.environment == "production" ? true : false

  # Security Settings
  publicly_accessible = true
  skip_final_snapshot = var.environment == "production" ? false : true

  # Performance Insights - REMOVED (not supported for db.t3.micro)
  # These lines have been completely removed

  # Parameter Group
  parameter_group_name = aws_db_parameter_group.agrowatch.name

  # Deletion Protection
  deletion_protection = var.environment == "production" ? true : false
  
  # Monitoring
  monitoring_interval = 0 # Set to 60 for enhanced monitoring (costs extra)

  # Timeouts
  timeouts {
    create = "20m"
    delete = "20m"
  }

  # Tags
  tags = {
    Name        = "agro-mysql-${var.environment}"
    Environment = var.environment
    Project     = "AgroWatch"
    ManagedBy   = "Terraform"
  }
}
