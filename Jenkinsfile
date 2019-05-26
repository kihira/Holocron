pipeline {
    def app

    agent {
        docker {
            image 'node:10'
        }
    }
    stages {
        stage('Build') {
            steps {
                sh 'yarn install'
                app = docker.build("kihira/holocron")
            }
        }
        stage('Push') {
            steps {
                docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                    app.tag(env.BUILD_ID)
                    app.push('latest')
                }
            }
        }
    }
}
