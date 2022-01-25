pipeline {
  agent any
  environment {
      DOCKER_HUB = credentials('DOCKER_HUB')
      SSH = credentials('SSH')
      BRANCH_NAME = getCurrentBranch()
      VERSIONS = getVersion()
      PORTS = getPort()
      NAME = 'cicd-template'
      DEV_IP = '68.183.226.229'
      PROD_IP = '68.183.226.229'
  }
  stages {
    stage('copy secret file') {
        steps {
            sh "sudo cp /root/file/.env ."
        }
    }
    stage('build && test') {
        steps {
            sh "sudo docker container stop $NAME || true && \
                sudo docker container rm $NAME || true"
            sh "sudo docker-compose -f docker-compose.yml build --no-cache"
            sh "sudo docker-compose -f docker-compose.yml up --force-recreate"
            sh "exit \$(docker inspect $NAME --format='{{.State.ExitCode}}')"
        }
    }
    stage('push (dev)') {
        when {
            not {
                branch "main"
            }
        }
        steps {
            sh "sudo echo '$DOCKER_HUB_PSW' | docker login --username $DOCKER_HUB_USR --password-stdin"
            sh "sudo docker push $DOCKER_HUB_USR/$NAME:dev"
        }
    }
    stage('push') {
        when {
            branch "main"
        }

        steps {
            sh "sudo echo '$DOCKER_HUB_PSW' | docker login --username $DOCKER_HUB_USR --password-stdin"
            sh "sudo docker image tag $DOCKER_HUB_USR/$NAME:dev $DOCKER_HUB_USR/$NAME:$VERSIONS"
            sh "sudo docker rmi $DOCKER_HUB_USR/$NAME:dev"
            sh "sudo docker push $DOCKER_HUB_USR/$NAME:$VERSIONS"
        }
    }
    stage('deploy (dev)') {
        when {
            not {
                branch "main"
            }
        }
        steps{
            sh """SSHPASS=$SSH_PSW sshpass -e ssh -o StrictHostKeyChecking=no $SSH_USR@$DEV_IP \
                "sudo echo '$DOCKER_HUB_PSW' | docker login --username $DOCKER_HUB_USR --password-stdin;
                sudo mkdir -p /root/app;
                sudo docker container stop $NAME-dev || true;
                sudo docker container rm $NAME-dev || true;
                sudo docker rmi $DOCKER_HUB_USR/$NAME:dev || true; 
                sudo docker run -d --name $NAME-dev -p 4999:5000 $DOCKER_HUB_USR/$NAME:dev;"
                """
        }
    }
    stage('deploy'){
        when {
                branch "main"
        }
        steps{
            sh """SSHPASS=$SSH_PSW sshpass -e ssh -o StrictHostKeyChecking=no $SSH_USR@$PROD_IP \
                "sudo echo '$DOCKER_HUB_PSW' | docker login --username $DOCKER_HUB_USR --password-stdin;
                sudo mkdir -p /root/app;
                sudo docker container stop $NAME-v$VERSIONS || true;
                sudo docker container rm $NAME-v$VERSIONS || true;
                sudo docker rmi $DOCKER_HUB_USR/$NAME:$VERSIONS || true; 
                sudo docker run -d --name $NAME-v$VERSIONS -p $PORTS:5000 $DOCKER_HUB_USR/$NAME:$VERSIONS;"
                """
        }
    }

  }
  post {
    always {
        sh "docker-compose down || true"
    }
    unsuccessful{
        sh "echo 'failed !!'"
    }
  }   

}

def getCurrentBranch () {
    return sh (
        script: 'git rev-parse --abbrev-ref HEAD',
        returnStdout: true
    ).trim()
}

def getVersion () {
    return sh (
        script: 'git log -1 --pretty=%B ${GIT_COMMIT}', 
        returnStdout: true
    ).trim().split(':')[0]
}

def getPort() {
    return sh (
        script: 'git log -1 --pretty=%B ${GIT_COMMIT}', 
        returnStdout: true
    ).trim().split(':')[1]
}