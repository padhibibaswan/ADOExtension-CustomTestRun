import * as SDK from "azure-devops-extension-sdk";
import { getClient, IGlobalMessageLink } from 'azure-devops-extension-api/Common';
import { GitRestClient } from "azure-devops-extension-api/Git/GitClient";
import { PipelinesRestClient } from "azure-devops-extension-api/Pipelines/PipelinesClient";
 
import { getAccessToken, getExtensionContext, getService } from 'azure-devops-extension-sdk';
import { CommonServiceIds, IProjectPageService,IHostNavigationService } from 'azure-devops-extension-api';
import { GitResolutionPathConflictAction } from "azure-devops-extension-api/Git/Git";
//import { sendDataToReceiver } from '../CustomTestRun';

SDK.init();
var registrationForm = (async function() {
    var callbacks: any[] = [];
    
    

    function inputChanged() {
        // Execute registered callbacks
        for(var i = 0; i < callbacks.length; i++) {
            callbacks[i](isValid());
        }
        if(!isValid()){
            ok_btn.disabled = true;
        }else{
            ok_btn.disabled = false;
        }


    }

    async function inputChangedForRepo() {
        // Execute registered callbacks
        for(var i = 0; i < callbacks.length; i++) {
            callbacks[i](isValid());
        }
        testRun_Output.innerHTML ="";
        selectProjectFolder.innerHTML = "";
        branch.innerHTML = '';


        try{
            const gitCoreClient = getClient(GitRestClient);

            let RepoName = getFormData().name;
            var BranchList = await gitCoreClient.getBranches(RepoName,projectName);
            //console.log(""The branch lists are ");
            //console.log("BranchList);
            //console.log(""_____________________");
            branch.innerHTML = '<option value=""></option>';
            BranchList.forEach(async (curBranch) => {
            
    
                const optionBranch= document.createElement('option');
                // //console.log(""The option name is :",option['id']);
                // //console.log(""The option name is :",option['name']);
                optionBranch.value = curBranch['name'];
                
                
                optionBranch.text = curBranch['name'];
                //console.log("optionBranch);
                //console.log(""----");
                branch.add(optionBranch);
                });
        }catch(exceptionVar){
            testRun_Output.innerHTML = `<hr>
            <p>There was an error while performing the action please refere to the console log.</p>
            <p>${exceptionVar}</p>`;
        }finally {
            if(!isValid()){
                ok_btn.disabled = true;
            }else{
                ok_btn.disabled = false;
            }
          }

    }

    async function inputChangedForBranch() {
        // Execute registered callbacks
        for(var i = 0; i < callbacks.length; i++) {
            callbacks[i](isValid());
        }
        
        
        testRun_Output.innerHTML ="";
        selectProjectFolder.innerHTML = "";

        try {
            const gitCoreClient = getClient(GitRestClient);

            let RepoName = getFormData().name;
            let BranchName = getFormData().branch;
            var Branch = await gitCoreClient.getBranch(RepoName,BranchName);
            const commit = await gitCoreClient.getCommit(Branch.commit.commitId,RepoName );
            var treeid = commit.treeId;

            const treeRefs = await gitCoreClient.getTree(RepoName, treeid, projectName);
            
            selectProjectFolder.innerHTML = '<option value=""></option>';
            treeRefs.treeEntries.forEach((curTreeRef) => {
                const optionTree= document.createElement('option');
                // //console.log(""The option name is :",option['id']);
                // //console.log(""The option name is :",option['name']);
                optionTree.value = curTreeRef.relativePath;
                optionTree.text = curTreeRef.relativePath;
                //console.log("optionTree);
                //console.log(""----");
                selectProjectFolder.add(optionTree);
            });
          } catch (exceptionVar) {
            testRun_Output.innerHTML = `<hr>
                                            <p>There was an error while performing the action please refere to the console log.</p>
                                            <p>${exceptionVar}</p>`;
          } finally {
            if(!isValid()){
                ok_btn.disabled = true;
            }else{
                ok_btn.disabled = false;
            }
          }

    }

    

    async function handleOkButtonClick() {
        //console.log(""the form data are");
        //console.log("getFormData());
        //console.log(""printed above");
        const hostNavigationService = await SDK.getService<IHostNavigationService>(CommonServiceIds.HostNavigationService);
        let pageNavigationParams = await hostNavigationService.getQueryParams();
        //console.log(""-----the query parameters are ----------");
        //console.log("pageNavigationParams)
        const splitArray = pageNavigationParams.testCaselist.split(",");
        const trimmedArray = splitArray.map(item => `TestCategory=tc:${item.trim()}`);
        //console.log("trimmedArray);
        const TestFilterString = trimmedArray.join(" | ");
        //console.log("TestFilterString);
        const pipelineVariables = {
        // Define your variables here
        TestFilter: {
            value: TestFilterString,
            isSecret: false, // Set to true if the value is a secret
            allowOverride: true
        },
        TestPlanID: {
            value: pageNavigationParams.planId,
            isSecret: false,
            allowOverride: true
        },
        TestSuiteID: {
            value: pageNavigationParams.suiteId,
            isSecret: false,
            allowOverride: true
        },
        ProjetFolder: {
            value: getFormData().ProjetFolder,
            isSecret: false,
            allowOverride: true
        }
        // ,
        // TestRepoName: {
        //     value: getFormData().name,
        //     isSecret: false,
        //     allowOverride: true
        // }
        };
        //console.log(""-----the list of tests seected are as above ----------");
        //console.log(""-----the form data is  ----------");
        //console.log("getFormData())

        // Execute registered callbacks
        //console.log(""ok button clicked from i frame");

        const pipelineCoreClient = getClient(PipelinesRestClient);
        //pipelineCoreClient.preview()
        //console.log(""start pipeline");

        try {
            const TestRepoName = getFormData().repoNameText;
            var listRuns = await pipelineCoreClient.runPipeline({
            previewRun: false,
            resources: {
                builds: {},
                containers: {},
                packages: {},
                pipelines: {},
                repositories: { 
                        "self":{"refName":"refs/heads/main",
                        "token":"",
                        "tokenType":"",
                        "version":""},
                        
                        TestRepoName:{"refName":"refs/heads/"+getFormData().branch,
                        "token":"",
                        "tokenType":"",
                        "version":""}}
            },
            stagesToSkip: [],
            templateParameters: {
                "TestRepoName": TestRepoName,
                "TestRepoRef":getFormData().branch
            },
            variables: pipelineVariables,
            yamlOverride: ""
        },projectName,getFormData().selectPipeline);

        selectElement.disabled = true;
        branch.disabled=true;
        selectPipeline.disabled=true;
        selectProjectFolder.disabled=true;
        ok_btn.remove();
        //console.log("listRuns);
        //console.log("listRuns.finalYaml);
        var buildNumber = listRuns.name;
        var state = listRuns.state;
        var newBuildURL=  listRuns._links.web.href;
        testRun_Output.innerHTML = `<hr>
                                    <table>
                                            <tr> 
                                                <td> Build State</td> 
                                                <td> ${state}</td>
                                            </tr>
                                            <tr>
                                                <td> Build Number </td> 
                                                <td> ${buildNumber}</td>
                                            </tr>
                                            <tr> 
                                                <td> Build Pipeline URL</td> 
                                                <td> <a href=${newBuildURL}>Build URL Link</a> </td>
                                            </tr>
                                    </table>
                                    <p> You Can CLose the pop up Window</p>`;

          } catch (exceptionVar) {
            testRun_Output.innerHTML = `<hr>
                                            <p>There was an error while performing the action please refere to the console log.</p>
                                            <p>${exceptionVar}</p>`;
          } 



    }
    
    function isValid() {
        // Check whether form is valid or not
        return !!(selectElement.value) && !!(branch.value) && !!(selectPipeline.value) && !!(selectProjectFolder.value);
    }
    
    function getFormData() {
        // Get form values
        return {
            name: selectElement.value,
            repoNameText: selectElement.options[selectElement.selectedIndex].text,
            branch: branch.value,
            ProjetFolder: selectProjectFolder.value,
            selectPipeline: selectPipeline.value as unknown as number
             
        };
    }

    

    var selectElement = document.getElementById("repoName") as HTMLSelectElement;
    var branch = document.getElementById("branchName") as HTMLSelectElement;
    var selectPipeline = document.getElementById("pipelines") as HTMLSelectElement;
    var selectProjectFolder = document.getElementById("projectFolder") as HTMLSelectElement;

    var ok_btn = document.getElementById("OK-Btn") as HTMLButtonElement;
    var testRun_Output = document.getElementById("test-run-output") as HTMLButtonElement;

    
    
    const projectPageService = await getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    const projectInfo = await  projectPageService.getProject() ;
    //console.log(""project info is :");
    //console.log("projectInfo);
    const projectId = projectInfo?.id;
    const projectName = projectInfo?.name as string;
    const gitCoreClient = getClient(GitRestClient);
    const pipelineCoreClient = getClient(PipelinesRestClient);

            if (selectElement) {
                    // const projectPageService = await getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
                    // const projectInfo = await  projectPageService.getProject() ;
                    // //console.log(""project info is :");
                    // //console.log("projectInfo);
                    // const projectId = projectInfo?.id;
                    // const projectName = projectInfo?.name as string;
                    // //console.log(""The project id is :",projectId);
                    // //console.log(""The project name is :",projectName);
                    // const gitCoreClient = getClient(GitRestClient);
                    // const pipelineCoreClient = getClient(PipelinesRestClient);
                    ////console.log(""getAll the gitRepos");
                    var repoList = await gitCoreClient.getRepositories(projectName);
                    var pipeLineLists = await pipelineCoreClient.listPipelines(projectName);
                    //var BranchList = await gitCoreClient.getBranches("",projectName);
                    //console.log(""pipelineLists are");
                    //console.log("pipeLineLists);
                    selectElement.innerHTML = '<option value=""></option>';
                    repoList.forEach(async (option) => {
                        const optionElement = document.createElement('option');
                        // //console.log(""The option name is :",option['id']);
                        // //console.log(""The option name is :",option['name']);
                        optionElement.value = option['id'];
                        optionElement.text = option['name'];
                        selectElement.add(optionElement);
                        var BranchList = await gitCoreClient.getBranches(option['id'],projectName);
                        //console.log(""The branch lists are ");
                        //console.log("BranchList);
                        //console.log(""_____________________");

                      });
                      
                     

                    selectPipeline.innerHTML = '<option value=""></option>';
                    pipeLineLists.forEach((curpipeline) => {
                        const optionpipeLine= document.createElement('option');
                        // //console.log(""The option name is :",option['id']);
                        // //console.log(""The option name is :",option['name']);
                        optionpipeLine.value = curpipeline['id'].toString();
                        optionpipeLine.text = curpipeline['name'];
                        selectPipeline.add(optionpipeLine);
                      });
            }

    selectElement.addEventListener("change", inputChangedForRepo);
    branch.addEventListener("change", inputChangedForBranch);
    selectPipeline.addEventListener("change", inputChanged);
    selectProjectFolder.addEventListener("change", inputChanged);

    ok_btn.addEventListener("click", handleOkButtonClick);

    

    const extContext = SDK.getContributionId();
    //console.log(""The contribution id of the CustoTestRunForm is :"+extContext);
   
    
    return {
        isFormValid: function() {
            return isValid();   
        },
        getFormData: function() {
            return getFormData();
        },
        sayHi: function() {
            return "Hi";
        },
        attachFormChanged: function(cb: any) {
             callbacks.push(cb);
        }
    };
})();

SDK.register("showProperties_For_Dialog", registrationForm);

// SDK.init().then(() => {
//     SDK.ready().then(async () => {
//         const selectElement = document.getElementById("repoName") as HTMLSelectElement;
//         //console.log(""SDK ready");
//         if (selectElement) {
//             const projectPageService = await getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
//             const projectInfo = await  projectPageService.getProject() ;
//             //console.log(""project info is :");
//             //console.log("projectInfo);
//             const projectId = projectInfo?.id;
//             const projectName = projectInfo?.name
//             //console.log(""The project id is :",projectId);
//             //console.log(""The project name is :",projectName);
//             const gitCoreClient = getClient(GitRestClient);
//             //console.log(""getAll the gitRepos");
//             var repoList = await gitCoreClient.getRepositories(projectName);
//             selectElement.innerHTML = '';
//             repoList.forEach((option) => {
//                 const optionElement = document.createElement('option');
//                 // //console.log(""The option name is :",option['id']);
//                 // //console.log(""The option name is :",option['name']);
//                 optionElement.value = option['id'];
//                 optionElement.text = option['name'];
//                 selectElement.add(optionElement);
//               });

//             //console.log(""***********");
//             //console.log("SDK.getConfiguration());
//             //console.log(""***********");
//             //console.log("await SDK.getConfiguration().dialog?.getTitle());
//             //console.log(""**_________________***");
//             // Get data service
//             const hostNavigationService = await SDK.getService<IHostNavigationService>(CommonServiceIds.HostNavigationService);
//             let pageNavigationParams = await hostNavigationService.getQueryParams();
//             //console.log("pageNavigationParams)
//             const tcList = pageNavigationParams['testCaselist'].split(",");
//             const tclist = document.getElementById("testcaseList") as HTMLUListElement;

//             tcList.forEach((item: any) => {
//                         //console.log(""####");
//                         //console.log("item);
//                         //console.log(""####");
//                         const listItem = document.createElement("li");
//                         listItem.textContent = JSON.stringify(item, null, 2);
//                         tclist.appendChild(listItem);
//                       });

//             // Access individual query parameters
//             //const param1Value = queryParameters["id"];
//             ////console.log("param1Value);
//             //console.log(""**_________________***");
//             var name = document.getElementById("repoName") as HTMLSelectElement;

            

//             return {
                
//                 getFormData: function() {
//                     return name.value;
//                 }
//             };

 
//             }
//     });
// });

