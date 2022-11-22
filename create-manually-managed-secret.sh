kubectl delete secret mongodb-credentials-remote -n mongodb-instances-fr
kubectl delete secret mongodb-credentials-manually-managed -n mongodb-instances-fr
kubectl create secret generic mongodb-credentials-manually-managed \
    --from-literal=username='sample-mongodb-account-beta'  \
    --from-literal=password='mMmWOSsEMniWDo9Uha1hrUMWae4g3Zzk3fzO2DBoMRHbtfeBWxsxCrcN4xRBJcHIwhfHNhN4Oj8oACDbNpNgdQ=='  \
    --from-literal=host='sample-mongodb-account-beta.mongo.cosmos.azure.com'  \
    --from-literal=port='10255'  \
    --from-literal=type='mongodb'  \
    -n mongodb-instances-fr
kubectl label  secret  mongodb-credentials-manually-managed -n  mongodb-instances-fr  services.apps.tanzu.vmware.com/class=azure-mongodb
    
    