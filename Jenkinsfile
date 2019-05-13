#!/usr/bin/env groovy

pipeline {
  agent any

  triggers {
    pollSCM ''
  }

  options {
    buildDiscarder logRotator(numToKeepStr: '24')
    disableConcurrentBuilds()
    timeout(time: 240, unit: 'SECONDS')
  }


  stages {
    stage('Prepare') {
      steps {
        checkout scm
        script {
          ghtokens = "${env.JOB_NAME}".tokenize('/')
          org = ghtokens[ghtokens.size()-3]
          repo = ghtokens[ghtokens.size()-2]
          branch = ghtokens[ghtokens.size()-1]

          env.PROJECT_NAME = repo.replaceFirst(/-longread$/, "")
        }
        echo "Using project name ${env.PROJECT_NAME}"
        sh 'npm install'
      }
    }
    stage('Run') {
      steps {
        sh 'npm run-script build'
      }
    }
    stage('Package') {
      steps {
        sh 'rm build.zip || true'
        sh 'cd build; zip ../build.zip ./*; cd ..'
        archiveArtifacts 'build.zip'
      }
    }
    stage('Deploy') {
      steps {
        script {
          if (env.PROJECT_NAME == "") {
            throw 'extracted project name is empty. cannot deploy'
          }
        }
        sh 'mkdir /var/www/html/${PROJECT_NAME} || true'
        sh 'rsync --delete -rltvzb --chown=nobody:www-data build/ /var/www/html/${PROJECT_NAME}'
      }
    }
  }
}
