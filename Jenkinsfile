def app

pipeline {
    agent { node { label 'master' } }
    stages {
        stage('Build') {
            steps {
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
