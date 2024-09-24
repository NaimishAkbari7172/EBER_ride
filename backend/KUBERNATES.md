<!-- kubernates used -->
-for manage containerized application in deifferent deployment environments
-change project monolithic microservice , so increase usage of containers, demand of managing those containers
-feature likes:
    high availability or no downtime
    scalability or high perfomance
    recovery backup and restore

<!-- k8s benefits -->
replication is easier
self healing of k8s like if one pod die then other will be generate and restart
smart scheduling, k8s find the best fitting worker node 

<!-- kubernates component -->
    1> pod:
        smallest unit of k8s
        container container 
        can use multiple container iniside one pod but usually can use onepod per 1 container
        each pod gets own IP address and communicate with that IP
        when pod died ,then new created , it gets new IP, for communicate with that IP every time need another k8s compo service
        In every pod there will be container runtime like docker and kubelet interface for u=intercting both container runtime and node, kubelet start the pod with a container inside

    2> Service & Ingress:
        permanant IP address
        each pod have each service
        lifecycle of pod and service not connected , so if pod died the service will be as it is

    3> configMap:
        stored external configuration like url, databases and other services of application

    4> secret:
        just like configMap, but it will store credential in not plain format but in base64 encoded

    5> Volumes for Data storage:
        when pod dies or restarted, the data will be gone. 
        storage is either in local machine or remote, outside of k8s cluster
        
    6> deployments
        if one pod will be died then our app will be crashed so need to ongoing application create replica of the each node on diff server. but both can use same service.
        service has 2 functionalities, permanant IP and load balancer

    7> statefulset
        statefulset is for stateful application like database


<!-- Minikube -->
-minikube is one node cluster where the master processes and worker processes both run on one node , also docker container runtime pre installed
-minikube creates virtual box on laptop and this node runs on that virtual box. 
-basically it is one node k8s cluster

<!-- kubectl -->
-command line tool for k8s

-kubectl create deployment name --image=nginx(img-name) (crating pod)
-kubectl get deployment 
-kubectl edit deployment name (change the configuration of that pod)-
-kubectl delete dployment name

-kubectl get node (gives node details)
-kubectl get pod (gives pod details)
-kubectl get services
-kubect get deployment
-kubectl get replicaset (give replicas of pod)

-kubectl logs pod-name
-kubectl exec -it pod-name --bin/bash
-kubectl apply -f config-file.yaml (create file)

kubectl apply -f file-name (apply a config. file)
kubectl delete -f file-name (delete with config file)

<!-- namespaces -->
-organise resources in namespaces   
-virtual cluater inside cluster
-kubectl get namespaces
-kubectl create namespaces name / also with creating configuration file
-why? =>  If have complex application which have many deployments, resource, pods, replicas of pods , services, configMap .So the default namespace is filled with different componentss and hard to overview of what is there. soo better use of namespace is group same kind of resources in namespaces. Like in database namespace where all mongoose DB related resources will be stored and other one like monitoring namespace which resources monitor the application, Nginx-ingress namespace..
-shouldn't use namespaces for small projects
-kubectl apply -f file-name --namespace=namespace_name (It will create a file in that namespace)
or also give namespace via config file, in metadata namespace: name

<!-- ingress -->
when external user request to server , the ingress will first handle the request and send to internal service ,creating a dedicated load balancer

<!-- helm -->
package manager of kubernetes, to package yaml file

<!-- helm charts -->
bundle of yaml file
create own helm chart with helm and push them helm repo so other can use and download