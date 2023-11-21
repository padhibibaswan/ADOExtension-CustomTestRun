import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, IProjectPageService,IHostNavigationService } from 'azure-devops-extension-api';



SDK.init().then(() => {
    SDK.ready().then(async () => {
        
        
        const testSuiteInfoElement = document.getElementById("test-suite-info");
        ////console.log(""SDK ready12345");
        SDK.register("showProperties", async function (context: any) {
            const navService = SDK.getService<IHostNavigationService>(CommonServiceIds.HostNavigationService);
            
            ////console.log(""event triggered successfully");
            //console.log("context);
            //console.log("typeof context);
            const tclist =[]
            for (var product of context) {
                tclist.push(product.testCaseId);
            }
            const allTClist = tclist.join(", ");
            //console.log("tclist)
            
            //console.log("tclist);
            (await navService).setQueryParams({ testCaselist: allTClist});

            SDK.getService("ms.vss-web.dialog-service").then(function(dialogService: any) {
                var extensionCtx = SDK.getExtensionContext();
                //console.log("dialogService);
                // Build absolute contribution ID for dialogContent
                //var contributionId = extensionCtx.publisherId + "." + extensionCtx.extensionId + ".registration-form";
                var contributionId = extensionCtx.publisherId + "." + extensionCtx.extensionId + ".test-custom-run-form";
                
                
                ////console.log(""In the process of opening the dialougue");
                //console.log("contributionId);
                
                // Show dialog
                var dialogOptions = {
                    title: "Fill and Submit Form",
                    width: 800,
                    height: 600,
                    buttons: [],
                    onClose: (result:any) => {
                        //console.log("result);
                    }
                    //okCallback: onOkButtonClicked,
                    // cancelCallback: () => {
                    //     ////console.log(""Cancel is clicked");
                    //     SDK.getService(SDK.ServiceIds.Dialog).then((dialogService) => {
                    //         dialogService.close(result);
                    //       });
                    //   }
                    

                    //cancelCallback: onCancelButtonClicked
                };
                    
                    

                ////console.log("dialogOptions);
                const extContext = SDK.getContributionId();
                ////console.log(""The contribution id of the CustoTestRun is :"+extContext);
   
                dialogService.openDialog(contributionId, dialogOptions).then(function(dialog:any) {
                    // Set true/false to enable/disable ok button
                    ////console.log(""inside the opendialog methds first line");
                    
                    dialog.getContributionInstance("showProperties_For_Dialog").then(async function (registrationFormInstance:any) {
                        //dialog.updateOkButton(true);
                        // Keep a reference of registration form instance (to be used previously in dialog options)
                        const registrationForm = registrationFormInstance;
                        ////console.log(""----getting reg form instance-----");
                        //console.log("registrationForm);
                        ////console.log(""-----getting form data-----");
                        //console.log("await registrationForm.getFormData());
                        ////console.log(""------if form valid---");
                        //console.log("await registrationForm.isFormValid());
                        ////console.log(""----saying hi-----");
                        //console.log("await registrationForm.sayHi());
                        ////console.log(""--------------");

                        // registrationForm.attachFormChanged(function(isValid: any) {
                        //     dialog.updateOkButton(isValid);
                        // });
                        
                        // Set the initial ok enabled state
                        // registrationForm.isFormValid().then(function (isValid: any) {
                        //     dialog.updateOkButton(isValid);
                        // });

                        // //console.log("document.getElementById('ok'));

                        
                        
                        
                    });
                    
                });
                
                
            });
        });

        
    });
});
