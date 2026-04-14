# ========== LAUNCH TEMPLATES ==========

# Frontend Launch Template
resource "aws_launch_template" "frontend_lt" {
  name_prefix   = "agro-fe-${var.environment}-"  
  image_id      = var.frontend-backend-ami
  instance_type = var.instance_type
  key_name      = data.aws_key_pair.existing.key_name

  # IAM Instance Profile
  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  # Network settings
  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.bastion.id]
    delete_on_termination       = true
  }

  # User data script (will run when instance starts)
  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -e
    
    # Install nginx
    apt-get update -y
    apt-get install -y nginx
    
    # Create health check endpoint
    echo "healthy" > /var/www/html/health
    
    # Configure nginx
    cat > /etc/nginx/sites-available/default << 'NGINX'
    server {
        listen 80;
        server_name _;
        
        location / {
            root /var/www/html;
            try_files \$uri /index.html;
        }
        
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
    NGINX
    
    # Restart nginx
    systemctl restart nginx
    systemctl enable nginx
    
    echo "Frontend setup completed"
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = merge(var.tags, {
      Name        = "agro-fe-${var.environment}"
      Component   = "frontend"
      AutoScaling = "true"
    })
  }

  tags = merge(var.tags, {
    Name = "agro-fe-lt"
  })
}

# Backend Launch Template
resource "aws_launch_template" "backend_lt" {
  name_prefix   = "agro-be-${var.environment}-"  # Shortened prefix
  image_id      = var.frontend-backend-ami
  instance_type = var.instance_type
  key_name      = data.aws_key_pair.existing.key_name

  # IAM Instance Profile
  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  # Network settings (no public IP for backend)
  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.backend_sg.id]
    delete_on_termination       = true
  }

  # User data script
  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -e
    
    # Install Node.js and npm
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs nginx
    
    # Create simple backend API
    mkdir -p /var/www/backend
    
    cat > /var/www/backend/app.js << 'BACKEND'
    const http = require('http');
    
    const server = http.createServer((req, res) => {
      if (req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    
    server.listen(8080, () => {
      console.log('Backend API running on port 8080');
    });
    BACKEND
    
    # Run the backend API
    node /var/www/backend/app.js &
    
    echo "Backend setup completed"
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = merge(var.tags, {
      Name        = "agro-be-${var.environment}"
      Component   = "backend"
      AutoScaling = "true"
    })
  }

  tags = merge(var.tags, {
    Name = "agro-be-lt"
  })
}

# ========== AUTO SCALING GROUPS ==========

# Frontend Auto Scaling Group
resource "aws_autoscaling_group" "frontend_asg" {
  name                = "agro-fe-asg-${var.environment}"  # Shortened
  vpc_zone_identifier = aws_subnet.public[*].id
  target_group_arns   = [aws_lb_target_group.frontend_tg.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300

  min_size         = var.frontend_min_size
  max_size         = var.frontend_max_size
  desired_capacity = var.frontend_desired_size

  launch_template {
    id      = aws_launch_template.frontend_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "agro-fe-${var.environment}"
    propagate_at_launch = true
  }

  tag {
    key                 = "Component"
    value               = "frontend"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      desired_capacity
    ]
  }

  depends_on = [aws_lb_target_group.frontend_tg]
}

# Backend Auto Scaling Group
resource "aws_autoscaling_group" "backend_asg" {
  name                = "agro-be-asg-${var.environment}"  # Shortened
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.backend_tg.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300

  min_size         = var.backend_min_size
  max_size         = var.backend_max_size
  desired_capacity = var.backend_desired_size

  launch_template {
    id      = aws_launch_template.backend_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "agro-be-${var.environment}"
    propagate_at_launch = true
  }

  tag {
    key                 = "Component"
    value               = "backend"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      desired_capacity
    ]
  }

  depends_on = [aws_lb_target_group.backend_tg]
}

# ========== AUTO SCALING POLICIES ==========

# Frontend Scale Up Policy
resource "aws_autoscaling_policy" "frontend_scale_up" {
  name                   = "agro-fe-up-${var.environment}"  # Shortened
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.frontend_asg.name
}

# Frontend Scale Down Policy
resource "aws_autoscaling_policy" "frontend_scale_down" {
  name                   = "agro-fe-down-${var.environment}"  # Shortened
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.frontend_asg.name
}

# Backend Scale Up Policy
resource "aws_autoscaling_policy" "backend_scale_up" {
  name                   = "agro-be-up-${var.environment}"  # Shortened
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.backend_asg.name
}

# Backend Scale Down Policy
resource "aws_autoscaling_policy" "backend_scale_down" {
  name                   = "agro-be-down-${var.environment}"  # Shortened
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.backend_asg.name
}



# ========== NOTE: EC2 instances are now managed by Auto Scaling Groups ==========
# The individual instances below are replaced by the launch templates and ASGs

# If you still want to keep a single instance for testing, uncomment below,
# but it's recommended to use the ASGs for production-like setup.

# Frontend Instance (Optional - for testing without ASG)
# resource "aws_instance" "frontend_test" {
#     count                   = 0  # Set to 1 to enable
#     ami                     = var.frontend-backend-ami
#     instance_type           = var.instance_type
#     key_name                = data.aws_key_pair.existing.key_name
#     vpc_security_group_ids  = [aws_security_group.bastion.id]
#     subnet_id               = aws_subnet.public[0].id
#     iam_instance_profile    = aws_iam_instance_profile.ec2_profile.name
#     
#     tags = merge(var.tags, {
#         Name = "frontend-test"
#     })
# }

# Backend Instance (Optional - for testing without ASG)
# resource "aws_instance" "backend_test" {
#     count                   = 0  # Set to 1 to enable
#     ami                     = var.frontend-backend-ami
#     instance_type           = var.instance_type
#     key_name                = data.aws_key_pair.existing.key_name
#     vpc_security_group_ids  = [aws_security_group.backend_sg.id]
#     subnet_id               = aws_subnet.private[0].id
#     iam_instance_profile    = aws_iam_instance_profile.ec2_profile.name
#     
#     tags = merge(var.tags, {
#         Name = "backend-test"
#     })
# }
