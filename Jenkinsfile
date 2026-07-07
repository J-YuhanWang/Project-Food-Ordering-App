pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        IMAGE_NAME = 'gigglen/campuseats-backend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build with Maven') {
            agent {
                docker {
                    image 'maven:3.9-eclipse-temurin-21'
                    args '-v $HOME/.m2:/root/.m2'
                }
            }
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${IMAGE_NAME}:latest"
            }
        }

        stage('Deploy to Server') {
            steps {
                sshagent(credentials: ['hetzner-blair-w-server-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no root@89.167.19.241 '
                            cd /app/campuseats &&
                            docker compose -f docker-compose.prod.yml --env-file .env.prod pull backend &&
                            docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment succeeded!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}