pipeline {
    agent any

    environment {
        AZURE_SUBSCRIPTION_ID = '2c9678e2-0629-4cec-aee3-529fd31d1325'
        AZURE_TENANT_ID       = '117b7a62-3294-46d9-8110-39ebbf7c7b16'
        RESOURCE_GROUP        = 'jenkins-rg-centralus'
        WEBAPP_NAME           = 'yucandoit020-nodeapp888'
    }

    stages {
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

                        az account set --subscription $AZURE_SUBSCRIPTION_ID
                    '''
                }
            }
        }

        stage('Deploy to Azure') {
            steps {
                sh '''
                    zip -r app.zip .
                    az webapp deploy \
                      --resource-group $RESOURCE_GROUP \
                      --name $WEBAPP_NAME \
                      --src-path app.zip \
                      --type zip
                '''
            }
        }
    }
}
