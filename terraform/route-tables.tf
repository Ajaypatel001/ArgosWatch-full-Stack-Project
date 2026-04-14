# ========== PUBLIC ROUTE TABLE ==========
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.agrowatch.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.agrowatch.id
  }

  tags = merge(var.tags, {
    Name        = "agrowatch-public-rt-${var.environment}"
    Environment = var.environment
    Project     = "AgroWatch"
    Type        = "Public"
  })
}

# Associate public subnets with public route table
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# ========== PRIVATE ROUTE TABLE ==========
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.agrowatch.id

  # No route to internet (private subnets have no direct internet access)
  tags = {
    Name        = "agrowatch-private-rt-${var.environment}"
    Environment = var.environment
    Project     = "AgroWatch"
    Type        = "Private"
  }
}

# Associate private subnets with private route table
resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# ========== NAT GATEWAY (Optional - for private subnets to access internet) ==========
# Uncomment if you need internet access from private subnets (for updates, etc.)

# Elastic IP for NAT Gateway
# resource "aws_eip" "nat" {
#   domain = "vpc"
#   
#   tags = {
#     Name        = "agrowatch-nat-eip-${var.environment}"
#     Environment = var.environment
#     Project     = "AgroWatch"
#   }
# }

# NAT Gateway in public subnet
# resource "aws_nat_gateway" "agrowatch" {
#   allocation_id = aws_eip.nat.id
#   subnet_id     = aws_subnet.public[0].id
#   
#   tags = {
#     Name        = "agrowatch-nat-gw-${var.environment}"
#     Environment = var.environment
#     Project     = "AgroWatch"
#   }
# }

# Add route to NAT Gateway in private route table
# resource "aws_route" "private_nat" {
#   route_table_id         = aws_route_table.private.id
#   destination_cidr_block = "0.0.0.0/0"
#   nat_gateway_id         = aws_nat_gateway.agrowatch.id
# }