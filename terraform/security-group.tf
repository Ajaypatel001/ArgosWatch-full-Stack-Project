# ========== RDS SECURITY GROUP ==========
resource "aws_security_group" "rds" {
  name        = "agro-rds-sg-${var.environment}"
  description = "Security group for AgroWatch RDS MySQL"
  vpc_id      = aws_vpc.agrowatch.id

  tags = merge(var.tags, {
    Name        = "agrowatch-rds-sg"
    Environment = var.environment
  })
}

# Allow MySQL from within VPC only (most secure)
resource "aws_security_group_rule" "rds_mysql_vpc" {
  type              = "ingress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  cidr_blocks       = [aws_vpc.agrowatch.cidr_block]
  security_group_id = aws_security_group.rds.id
  description       = "Allow MySQL access from within VPC"
}

# Allow MySQL from your IP for development/testing
resource "aws_security_group_rule" "rds_mysql_my_ip" {
  type              = "ingress"
  from_port         = 3306
  to_port           = 3306
  protocol          = "tcp"
  cidr_blocks       = [var.my_ip]
  security_group_id = aws_security_group.rds.id
  description       = "Allow MySQL access from my IP"
}

# Allow all outbound traffic from RDS
resource "aws_security_group_rule" "rds_outbound" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.rds.id
  description       = "Allow all outbound traffic"
}

# Bastion host security group for EC2 instances (frontend/backend)
resource "aws_security_group" "bastion" {
  name        = "agro-bastion-sg-${var.environment}"
  description = "Security group for EC2 instances (Frontend/Backend)"
  vpc_id      = aws_vpc.agrowatch.id

  ingress {
    description = "SSH from my IP"
    from_port   = All
    to_port     = All
    protocol    = "All traffic"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name        = "agrowatch-bastion-sg"
    Environment = var.environment
  })
}

resource "aws_security_group" "alb" {
  name = "agro-alb-sg-${var.environment}"
  description = "Security group for public ALB"
  vpc_id = aws_vpc.agrowatch.id

  ingress {
    description = "HTTP from anywhere"
    from_port = 80 
    to_port = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  } 

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name        = "agrowatch-alb-sg"
    Environment = var.environment
  })
}

# ========== INTERNAL ALB SECURITY GROUP ==========
resource "aws_security_group" "alb_internal" {
  name        = "agro-alb-internal-sg-${var.environment}"
  description = "Security group for internal ALB"
  vpc_id      = aws_vpc.agrowatch.id

  ingress {
    description     = "HTTP from frontend instances"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name        = "agrowatch-alb-internal-sg"
    Environment = var.environment
  })
}

# ========== BACKEND INSTANCE SECURITY GROUP ==========
resource "aws_security_group" "backend_sg" {
  name        = "agrowatch-backend-sg-${var.environment}"
  description = "Security group for backend instances"
  vpc_id      = aws_vpc.agrowatch.id

  ingress {
    description     = "HTTP from internal ALB"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_internal.id]
  }

  ingress {
    description     = "SSH from bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name        = "agrowatch-backend-sg"
    Environment = var.environment
  })
}
