# ========== AWS CONFIGURATION ==========
variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
  default     = "development"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "agrowatch"
}

# ========== VPC CONFIGURATION ==========
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones_count" {
  description = "Number of availability zones to use"
  type        = number
  default     = 2
}

# ========== RDS CONFIGURATION ==========
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "agrowatch_db"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "agrowatch_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  default     = "AgroWatch2024!Secure" 
  sensitive   = true
}

variable "db_identifier" {
  description = "Database instance identifier"
  type        = string
  default     = "agrowatch-mysql"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}


#=========== EC2 CONFIGURATION ==========
variable "frontend-backend-ami" {
  description = "This is the AMI ID of both frontend and backend servers"
  type = string
  default = "ami-02dfbd4ff395f2a1b"
  
}

variable "instance_type" {
  description = "Here is the type of instance used for the servers"
  type = string 
  default = "t3.micro"
}

data "aws_key_pair" "existing" {
  key_name = "key" 
}


# ========== SECURITY CONFIGURATION ==========
variable "my_ip" {
  description = "Your current IP address for database access (format: IP/32)"
  type        = string
  default     = "183.82.124.67/32"
}

# ========== TAGS ==========
variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project   = "AgroWatch"
    ManagedBy = "Terraform"
    Owner     = "AgroWatch Team"
  }
}

# ========== AUTO SCALING CONFIGURATION ==========
variable "frontend_min_size" {
  description = "Minimum number of frontend instances"
  type        = number
  default     = 1  # Keep at 1 for free tier
}

variable "frontend_max_size" {
  description = "Maximum number of frontend instances"
  type        = number
  default     = 3
}

variable "frontend_desired_size" {
  description = "Desired number of frontend instances"
  type        = number
  default     = 1  # Keep at 1 for free tier
}

variable "backend_min_size" {
  description = "Minimum number of backend instances"
  type        = number
  default     = 1  # Keep at 1 for free tier
}

variable "backend_max_size" {
  description = "Maximum number of backend instances"
  type        = number
  default     = 3
}

variable "backend_desired_size" {
  description = "Desired number of backend instances"
  type        = number
  default     = 1  # Keep at 1 for free tier
}

# ========== DOMAIN CONFIGURATION ==========
variable "frontend_domain_name" {
  description = "Domain name for frontend application"
  type        = string
  default     = "pspunjab.online"  
}

variable "backend_domain_name" {
  description = "Domain name for backend API"
  type        = string
  default     = "agrowatch.pspunjab.online"  
}

# ========== ALERT CONFIGURATION ==========
variable "alert_email" {
  description = "Email address for CloudWatch alerts"
  type        = string
  default     = "sainiamandeep010@gmail.com"  
}

# ========== IAM CONFIGURATION ==========
variable "iam_role_name" {
  description = "Name for IAM role"
  type        = string
  default     = "agrowatch-ec2-role"
}