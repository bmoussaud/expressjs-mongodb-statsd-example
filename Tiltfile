# You will need to modify this file to enable Tilt live debugging
SOURCE_IMAGE = os.getenv("SOURCE_IMAGE", default='akseutap3registry.azurecr.io/expressjs-mongodb-statsd-example') 
LOCAL_PATH = os.getenv("LOCAL_PATH", default='.')
NAMESPACE = os.getenv("NAMESPACE", default='dev-tap')
K8S_TEST_CONTEXT = os.getenv("K8S_TEST_CONTEXT", default='aks-eu-tap-3')

allow_k8s_contexts(K8S_TEST_CONTEXT)

k8s_custom_deploy(
    'expressjs-mongodb-statsd-example',
    apply_cmd="tanzu apps workload apply -f config/workload.yaml --live-update" +
        " --local-path " + LOCAL_PATH +
        " --source-image " + SOURCE_IMAGE +
        " --namespace " + NAMESPACE +
        " --yes >/dev/null" +
        " && kubectl get workload expressjs-mongodb-statsd-example --namespace " + NAMESPACE + " -o yaml",
    delete_cmd="tanzu apps workload delete -f config/workload.yaml --namespace " + NAMESPACE + " --yes" ,
    deps=['.'],
    container_selector='workload',
    live_update=[
        fall_back_on(['package.json']),
        sync('.', '/workspace')
]
)

k8s_resource('expressjs-mongodb-statsd-example', port_forwards=["8080:8080"],
    extra_pod_selectors=[{'serving.knative.dev/service': 'expressjs-mongodb-statsd-example'}])