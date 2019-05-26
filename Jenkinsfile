pipeline {
    agent any
    environment {
        image = ''
    }
    stages {
        stage('Build') {
            steps {
                script {
                    image = docker.build 'kihira/holocron' + ":$BUILD_NUMBER"
                }
            }
        }
        stage('Push') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        image.push()
                    }
                }
            }
        }
        stage('Cleanup') {
            steps {
                sh "docker rmi kihira/Holocron:$BUILD_NUMBER"
            }
        }
    }
}
