# 🚀DevOps Deployment Guide

This document explains how to deploy the AgroWatch project using AWS, Jenkins, Docker, SonarQube, and MySQL (RDS).

---

# 📌 1. AWS Infrastructure Setup

## ✅ Create the following resources in AWS:

### 🔹 VPC

* CIDR: 10.0.0.0/16
* Enable DNS support and DNS hostnames

### 🔹 Subnets

* Create 2 public subnets (required for RDS)

### 🔹 Internet Gateway

* Attach to VPC

### 🔹 Route Table

* Add route:

```
0.0.0.0/0 → Internet Gateway
```

---

## 🔹 EC2 Instance

* Instance Type: t2.micro
* OS: Amazon Linux
* Used for:

  * Jenkins
  * Docker
  * SonarQube
  * Application deployment

---

## 🔹 RDS (MySQL)

* Engine: MySQL
* DB Name: agrowatch
* Username: admin
* Password: Ajay1234
* Public access: Enabled

---

## 🔹 Security Group (Important)

Open the following ports:

* 22 → SSH
* 81 → Frontend
* 5000 → Backend
* 8080 → Jenkins
* 9000 → SonarQube
* 3306 → MySQL

---

## 🔹 Route 53

* Create Hosted Zone
* Add A Record:

  * Domain → EC2 Public IP

---

## 🔹 ECR (Elastic Container Registry)

* Create repositories:

  * frontend-app
  * backend-app

---

## 🔹 Snapshots

* RDS snapshots (for backup)
* EC2 volume snapshots

---

# 📌 2. Connect to EC2

```
ssh ec2-user@<EC2-IP>
```

---

# 📌 3. Install Docker

```
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
```

Logout and login again.

Test Docker:

```
docker run hello-world
```

---

# 📌 4. Install Jenkins

## Install Java

```
sudo yum install java-17-amazon-corretto -y
```

## Install Jenkins

```
sudo wget -O /etc/yum.repos.d/jenkins.repo \
https://pkg.jenkins.io/redhat-stable/jenkins.repo

sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

sudo yum install jenkins -y
```

## Start Jenkins

```
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

Open in browser:

```
http://<EC2-IP>:8080
```

## Get initial password

```
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

---

# 📌 5. Install SonarQube (Using Docker)

```
sudo sysctl -w vm.max_map_count=262144

docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  sonarqube:lts
```

Open:

```
http://<EC2-IP>:9000
```

Login:

```
Username: admin
Password: admin
```

---

# 📌 6. Generate SonarQube Token

* Go to: My Account → Security
* Generate a token

---

# 📌 7. Jenkins Configuration

## 🔹 Install Plugins

Go to:
Manage Jenkins → Plugins

Install:

* Git
* Pipeline
* Docker Pipeline
* SonarQube Scanner

---

## 🔹 Configure SonarQube

Go to:
Manage Jenkins → System

Add:

```
Name: sonar
URL: http://<EC2-IP>:9000
Token: <your-token>
```

---

## 🔹 Give Docker access to Jenkins

```
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

---

# 📌 8. Create Jenkins Pipeline

## Steps:

1. Open Jenkins Dashboard
2. Click "New Item"
3. Enter project name
4. Select "Pipeline"
5. Click OK

---

## Pipeline Settings:

* Scroll to Pipeline section
* Select:

```
Pipeline script
```

* Paste your pipeline code

---

# 📌 9. Pipeline Stages

```
1. Clone Code (GitHub)
2. SonarQube Analysis
3. Build Docker Image
4. Stop Old Container
5. Run New Container
```

---

# 📌 10. Backend Dockerfile

```
FROM python:3.10
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
```

---

# 📌 11. Frontend Dockerfile

```
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

---

# 📌 12. MySQL (RDS) Connection Example

```
import mysql.connector

conn = mysql.connector.connect(
    host="your-rds-endpoint",
    user="admin",
    password="Ajay1234",
    database="agrowatch"
)
```

---

# 📌 13. Deployment Flow

```
GitHub → Jenkins → SonarQube → Docker → EC2 → RDS
```

---

# 🎯 Final Architecture

```
User → Route53 Domain
        ↓
     EC2 Server
       ├── Frontend (Port 81)
       ├── Backend (Port 5000)
       ├── Jenkins (Port 8080)
       └── SonarQube (Port 9000)
            ↓
           RDS MySQL
```

---

# 🔥 Future Improvements

* Kubernetes (EKS)
* CI/CD automation
* ECR integration
* HTTPS (SSL setup)

---
