def app

pipeline {
    agent none
    stages {
        stage('Build') {
            steps {
                sh 'yarn install'
                script {
                    app = docker.build("kihira/holocron")
                }
            }
        }
        stage('Push') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        app.tag(env.BUILD_ID)
                        app.push('latest')
                    }
                }
            }
        }
    }
}
