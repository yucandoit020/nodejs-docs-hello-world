pipeline {
    agent any

    environment {
        AZURE_SUBSCRIPTION_ID = '2c9678e2-0629-4cec-aee3-529fd31d1325'
        AZURE_TENANT_ID       = '117b7a62-3294-46d9-8110-39ebbf7c7b16'
        RESOURCE_GROUP        = 'jenkins-rg-centralus'
        WEBAPP_NAME           = 'yucandoit020-nodeapp888'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Azure Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'AzureServicePrincipal',
                    usernameVariable: 'AZURE_CLIENT_ID',
                    passwordVariable: 'AZURE_CLIENT_SECRET'
                )]) {
                    sh '''
                        az login --service-principal \
                          --username $AZURE_CLIENT_ID \
                          --password $AZURE_CLIENT_SECRET \
                          --tenant $AZURE_TENANT_ID
                    '''
                }
            }
        }

        stage('Set Subscription') {
            steps {
                sh 'az account set --subscription $AZURE_SUBSCRIPTION_ID'
            }
        }

        stage('Configure Azure Web App') {
            steps {
                sh '''
                    az webapp config set \
                      --name $WEBAPP_NAME \
                      --resource-group $RESOURCE_GROUP \
                      --linux-fx-version "NODE|20-lts" \
                      --startup-file "pm2 start index.js --no-daemon"

                    az webapp config appsettings set \
                      --name $WEBAPP_NAME \
                      --resource-group $RESOURCE_GROUP \
                      --settings WEBSITE_NODE_DEFAULT_VERSION="~20" SCM_DO_BUILD_DURING_DEPLOYMENT=true
                '''
            }
        }

        stage('Deploy to Azure') {
            steps {
                sh '''
                    az webapp up \
                      --name $WEBAPP_NAME \
                      --resource-group $RESOURCE_GROUP \
                      --runtime "NODE:20-lts"
                '''
            }
        }

        stage('Restart Web App') {
            steps {
                sh '''
                    az webapp restart \
                      --name $WEBAPP_NAME \
                      --resource-group $RESOURCE_GROUP
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment SUCCESS'
        }
        failure {
            echo 'Deployment FAILED'
        }
    }
}
