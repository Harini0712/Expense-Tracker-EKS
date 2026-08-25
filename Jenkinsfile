pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = '398934907594'
        AWS_REGION     = 'ap-southeast-2'

        ECR_REGISTRY   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        BACKEND_REPO   = 'expense-tracker-backend'
        FRONTEND_REPO  = 'expense-tracker-frontend'

        ECS_CLUSTER = 'expense-tracker-cluster'

        ECS_SERVICE_BACKEND  = 'expense-tracker-backend-service'
        ECS_SERVICE_FRONTEND = 'expense-tracker-frontend-service'

        // Temporary URL until we create ALB
        VITE_API_BASE_URL = 'http://127.0.0.1:5000/api'

        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh """
                        docker build \
                        -t ${BACKEND_REPO}:${IMAGE_TAG} .
                    """
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh """
                        docker build \
                        --build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL} \
                        -t ${FRONTEND_REPO}:${IMAGE_TAG} .
                    """
                }
            }
        }

        stage('Login to ECR') {
            steps {
                sh """
                    aws ecr get-login-password \
                    --region ${AWS_REGION} | \
                    docker login \
                    --username AWS \
                    --password-stdin ${ECR_REGISTRY}
                """
            }
        }

        stage('Tag and Push Images') {
            steps {
                sh """
                    # Backend
                    docker tag \
                    ${BACKEND_REPO}:${IMAGE_TAG} \
                    ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG}

                    docker tag \
                    ${BACKEND_REPO}:${IMAGE_TAG} \
                    ${ECR_REGISTRY}/${BACKEND_REPO}:latest

                    docker push \
                    ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG}

                    docker push \
                    ${ECR_REGISTRY}/${BACKEND_REPO}:latest


                    # Frontend
                    docker tag \
                    ${FRONTEND_REPO}:${IMAGE_TAG} \
                    ${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG}

                    docker tag \
                    ${FRONTEND_REPO}:${IMAGE_TAG} \
                    ${ECR_REGISTRY}/${FRONTEND_REPO}:latest

                    docker push \
                    ${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG}

                    docker push \
                    ${ECR_REGISTRY}/${FRONTEND_REPO}:latest
                """
            }
        }

        stage('Deploy to ECS') {
            steps {
                sh """
                    aws ecs update-service \
                    --cluster ${ECS_CLUSTER} \
                    --service ${ECS_SERVICE_BACKEND} \
                    --force-new-deployment \
                    --region ${AWS_REGION}


                    aws ecs update-service \
                    --cluster ${ECS_CLUSTER} \
                    --service ${ECS_SERVICE_FRONTEND} \
                    --force-new-deployment \
                    --region ${AWS_REGION}
                """
            }
        }
    }

    post {
        success {
            echo """
            ========================================
            PIPELINE SUCCESS
            ========================================
            Backend image pushed to ECR
            Frontend image pushed to ECR
            ECS services deployment triggered

            Cluster:
            ${ECS_CLUSTER}
            ========================================
            """
        }

        failure {
            echo """
            ========================================
            PIPELINE FAILED
            ========================================
            Check the failed stage in Console Output.
            ========================================
            """
        }
    }
}