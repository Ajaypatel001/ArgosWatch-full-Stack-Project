# Get availability zones in the region
data "aws_availability_zones" "available" {
  state = "available"
}

# ========== PUBLIC SUBNETS ==========
# For future use (Bastion Host, Load Balancer, etc.)
resource "aws_subnet" "public" {
  count = 2 # Create 2 public subnets for high availability

  vpc_id                  = aws_vpc.agrowatch.id
  cidr_block              = cidrsubnet(aws_vpc.agrowatch.cidr_block, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "agrowatch-public-subnet-${count.index + 1}"
    Environment = var.environment
    Project     = "AgroWatch"
    Type        = "Public"
    AZ          = data.aws_availability_zones.available.names[count.index]
  }
}

# ========== PRIVATE SUBNETS (For RDS) ==========
resource "aws_subnet" "private" {
  count = 2 # Create 2 private subnets for RDS high availability

  vpc_id                  = aws_vpc.agrowatch.id
  cidr_block              = cidrsubnet(aws_vpc.agrowatch.cidr_block, 8, count.index + 2)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name        = "agrowatch-private-subnet-${count.index + 1}"
    Environment = var.environment
    Project     = "AgroWatch"
    Type        = "Private"
    AZ          = data.aws_availability_zones.available.names[count.index]
  }
}

