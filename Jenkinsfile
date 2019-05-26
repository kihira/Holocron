void setBuildStatus(String message, String state) {
  step([
      $class: "GitHubCommitStatusSetter",
      reposSource: [$class: "ManuallyEnteredRepositorySource", url: env.GIT_URL],
      contextSource: [$class: "ManuallyEnteredCommitContextSource", context: "ci/jenkins/build-status"],
      errorHandlers: [[$class: "ChangingBuildStatusErrorHandler", result: "UNSTABLE"]],
      statusResultSource: [ $class: "ConditionalStatusResultSource", results: [[$class: "AnyBuildResult", message: message, state: state]] ]
  ]);
}

pipeline {
    agent any
    environment {
        image = ''
    }
    stages {
        stage('Build') {
            steps {
                setBuildStatus("Build pending", "PENDING");
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
                sh "docker rmi kihira/holocron:$BUILD_NUMBER"
            }
        }
        post {
            failure {
                setBuildStatus("Build failed", "FAILURE");
            }
            success {
                setBuildStatus("Build complete", "SUCCESS");
            }
        }
    }
}
