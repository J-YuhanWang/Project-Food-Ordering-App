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

        stage('Check for relevant changes') {
            steps {
                script {
                    def changes = ''
                    try {
                        changes = sh(
                            script: "git diff --name-only origin/master@{1} origin/master",
                            returnStdout: true
                        ).trim()
                    } catch (Exception e) {
                        echo "Could not determine changed files (likely first build), proceeding with full build."
                        changes = "src/ pom.xml Dockerfile"  // regard as relevant
                    }

                    echo "Changed files:\n${changes}"

                    def relevantChange = changes.split('\n').any { file ->
                        file.startsWith('src/') ||
                        file == 'pom.xml' ||
                        file == 'Dockerfile'
                    }

                    if (!relevantChange) {
                        currentBuild.result = 'NOT_BUILT'
                        error('No backend-relevant changes detected, skipping build.')
                    }
                }
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
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push ${IMAGE_NAME}:latest
                    '''
                }
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