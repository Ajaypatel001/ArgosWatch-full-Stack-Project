# ========== FRONTEND ALB ==========
resource "aws_lb" "frontend_alb" {
  name               = "agro-fe-${var.environment}"  # Shortened: agro-fe-development
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false
  enable_http2              = true

  tags = merge(var.tags, {
    Name      = "agrowatch-frontend-alb"
    Component = "frontend"
  })
}

# ========== BACKEND ALB (Internal) ==========
resource "aws_lb" "backend_alb" {
  name               = "agro-be-${var.environment}"  # Shortened: agro-be-development
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_internal.id]
  subnets            = aws_subnet.private[*].id

  enable_deletion_protection = false
  enable_http2              = true

  tags = merge(var.tags, {
    Name      = "agrowatch-backend-alb"
    Component = "backend"
  })
}

# ========== TARGET GROUPS ==========

# Frontend Target Group
resource "aws_lb_target_group" "frontend_tg" {
  name        = "agro-fe-tg-${var.environment}"  # Shortened: agro-fe-tg-development
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.agrowatch.id
  target_type = "instance"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    port                = "traffic-port"
    matcher             = "200-299"
  }

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }

  tags = merge(var.tags, {
    Name = "agrowatch-frontend-tg"
  })
}

# Backend Target Group
resource "aws_lb_target_group" "backend_tg" {
  name        = "agro-be-tg-${var.environment}"  # Shortened: agro-be-tg-development
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.agrowatch.id
  target_type = "instance"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/api/health"
    port                = "traffic-port"
    matcher             = "200-299"
  }

  tags = merge(var.tags, {
    Name = "agrowatch-backend-tg"
  })
}

# ========== LISTENERS ==========

# Frontend HTTP Listener (Redirect to HTTPS)
resource "aws_lb_listener" "frontend_http" {
  load_balancer_arn = aws_lb.frontend_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Frontend HTTPS Listener (Will be updated after ACM certificate)
resource "aws_lb_listener" "frontend_https" {
  load_balancer_arn = aws_lb.frontend_alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.frontend_cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg.arn
  }

  depends_on = [aws_acm_certificate_validation.frontend_cert]
}

# Backend HTTP Listener (Internal ALB)
resource "aws_lb_listener" "backend_http" {
  load_balancer_arn = aws_lb.backend_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }
}

