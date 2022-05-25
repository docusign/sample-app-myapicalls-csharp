# Scenario manifests
## Common configuration
### Api.json
Api.json contains common to all scenarios information. Right now, there is only one property, required to be configured - host. Configured host will be used for all scenarios execution. 

Example:
```
{
  "host": "https://demo.docusign.net"
}
```

## Scenarios configuration files
### File naming conventions
The filename should match the following patterns: `Scenario_X.json` or `Scenario_X_Y.json`, where `X` is a unique manifest number and `Y` is some additional text.

Example:
```
Scenario_1.json, Scenario_2_CreateTemplate.json
```
### Manifest file structure
* __name__ – scenario name
* __title__ – scenario title
* __shortDescription__ – short description of the scenario
* __description__ – full description of the scenario
* __categories__ – the list of categories to which the scenario belongs
* __areas__ – the list of API which are used in the scenario
* __steps__ – the list of steps that are executed by scenario
    * __name__ – step name. Should be unique
    * __title__ – step title
    * __description__ – step description
    * __parametersPrompts__ – the list of parameters displayed on the page
        * __name__ – parameter name
        * __title__ – parameter title
        * __note__ – note for the parameter
        * __type__ – parameter value type. Available types: `string`, `text`, `email`, `file`, `select`
        * __defaultValue__ – default value of parameter. This is not used in current version of application
        * __required__ – indicates whether the parameter is mandatory. At the moment only required parameters are supported
        * __requestParameterType__ – defines where the parameter value is used. Available values: `body` and `path`
        * __requestParameterPath__ – defines the JSON path where its value will be used in request
        * __options__ (optional) – the list of available drop-down menu values. Used only when the parameter type is "select"
    * __request__ – the request that will be performed in the step
        * __api__ – API endpoint path
        * __method__ – HTTP method. Available methods: `post`, `get`, `put`, `delete`
        * __documentationUrl__ – URL to the API documentation
        * __bodyTemplate__ – template of the request body
        * __parameters__ – the list of the additional parameters, that were not listed in the “parametersPrompts” property (e.g. values from response body of the others steps)
            * __name__ – parameter name. In case, if the parameter is used in path, name must be identical to path parameter (e.g. accountId)
            * __in__ – defines where the parameter value is used. Available values: path, body
            * __requestParameterPath__ - defines the JSON path where its value will be used in request
            * __description__ – parameter description
            * __source__ (optional) – the name of the step from which the value of the parameter is taken. Used only when passing a value from the previous step to the next. The only exception is the accountId parameter - it is taken from User Claims, all the other parameters must have this property to be passed from previous step 
            * __responseParameterPath__ (optional) – defines the JSON path where its value in response body is located. Used only when passing a value from the previous step to the next. As with the __source__, this property is also not required for the "accountId" parameter

### Creating and filling the manifest file
1. Create new file in the `Manifest` folder of the MyAPICalls project. Name it according to the provided pattern.

    Example:
    ```
    Scenario_1_RemoteSigningTemplate.json
    ```

2. Enter general scenario information in the file, namely the scenario `name`, `descriptions`, `categories`, `areas`.

    Example:
    ```
    {
    	"name": "RemoteSigningTemplate",
    	"title": "Remote Signing with Template",
    	"shortDescription": "Send an envelope created from a template using remote signing",
    	"description": "This example demonstrates how to generate a new envelope from a template for remote signing",
    	"categories": [
    		"Envelope",
    		"Template",
    		"Remote Signing"
    	],
    	"areas": [
    		"eSignature REST API"
    	]
    }
    ```

    In this case, the User creates an envelope from the template for remote signing, so you need to specify the `categories` "Envelope", "Template" and "Remote Signing". This feature is available in the eSignature REST API, so it needs to be added to the `areas`.

3.	Define what steps will be performed in the scenario and enter general information: `name`, `title`, `description`.

    Example:
    ```
    "steps": [
        {
            "name": "CreateTemplate",
            "title": "Create a template",
            "description": "Create a template"
        },
        {
            "name": "CreateTemplateEnvelopeRemote",
            "title": "Create an envelope from a template with remote recipients",
            "description": "Create and send an envelope from a template with remote recipients"
        }
    ]
    ```

4.	Define the list of the parameters that should be provided by User and enter the information about them in `parametersPrompts` property: `name`, `type`, `defaultValue`, `title`, `note`, `requestParameterType` and `required`.

    Example:
    ```
    "parametersPrompts": [
        {
        	"name": "name",
        	"type": "string",
        	"defaultValue": "Template Name",
        	"required": true,
        	"requestParameterType": "body",
        	"title": "Template name",
        	"note": "Please provide a template name."
        },
        {
        	"name": "signerEmail",
        	"type": "email",
        	"defaultValue": "signer@email.com",
        	"required": true,
        	"requestParameterType": "body",
        	"title": "Signer 1 Email",
        	"note": "Please provide signer email."
        },
        {
        	"name": "document1",
        	"type": "file",
        	"defaultValue": "",
        	"required": true,
        	"requestParameterType": "body",
        	"title": "Document 1",
        	"note": "Please select a file."
        },
        {
        	"name": "envelopeStatus",
        	"type": "select",
        	"defaultValue": "created",
        	"required": true,
        	"requestParameterType": "body",
        	"title": "Envelope Status",
        	"note": "Please provide envelope status.",
        	"options": {
        		"created": "created",
        		"sent": "sent",
        		"deleted": "deleted"
        	}
        },
    ]
    ```

5.	Use the [API references page](https://developers.docusign.com/docs) to determine request information: `api`, `method`, `bodyTemplate`.

    Example:
    ```
    "request": {
        "api": "/restapi/v2.1/accounts/{accountId}/templates",
        "method": "post",
        "documentationUrl": "https://developers.docusign.com/docs/esign-rest-api/reference/templates/templates/create/",
        "bodyTemplate": {
            "name": "[templateName]",
            "shared": "false",
            "emailSubject": "Please sign this document set",
            "documents": [
                {
                    "documentBase64": "dGVzdCBkb2M=",
                    "name": "Lorem Ipsum 1",
                    "fileExtension": "txt",
                    "documentId": "1"
                },
                {
                    "documentBase64": "dGVzdCBkb2M=",
                    "name": "Lorem Ipsum 2",
                    "fileExtension": "txt",
                    "documentId": "2"
                }
            ],
            "recipients": {
                "signers": [
                    {
                        "rolename": "signer",
                        "recipientId": "1",
                        "routingOrder": "1",
                        "email": "signerEmail"
                    }
                ],
                "carbonCopies": [
                    {
                        "rolename": "cc",
                        "recipientId": "2",
                        "routingOrder": "2",
                        "email": "ccEmail"
                    }
                ]
            },
            "status": "[status]"
        }
    }
    ```

6.	Update parameters prompts with `requestParameterPath` property. This property defines where the parameter value will be placed in request body. The value will substitute the default value from the `bodyTemplate`. If the value was not provided by User then the default value from body template will be used to perform the request.

    Example:
    ```
    "parametersPrompts": [
        {
        	"name": "name",
        	"type": "string",
        	"defaultValue": "Template Name",
        	"required": true,
        	"requestParameterType": "body",
        	"requestParameterPath": "name",
        	"title": "Template name",
        	"note": "Please provide a template name."
        },
        {
        	"name": "signerEmail",
        	"type": "email",
        	"defaultValue": "signer@email.com",
        	"required": true,
        	"requestParameterType": "body",
        	"requestParameterPath": "recipients.signers[0].email",
        	"title": "Signer 1 Email",
        	"note": "Please provide signer email."
        },
        {
        	"name": "document1",
        	"type": "file",
        	"defaultValue": "",
        	"required": true,
        	"requestParameterType": "body",
        	"requestParameterPath": "documents[0].documentBase64;documents[0].name;documents[0].fileExtension",
        	"title": "Document 1",
        	"note": "Please select a file."
        },
        {
        	"name": "envelopeStatus",
        	"type": "select",
        	"defaultValue": "created",
        	"required": true,
        	"requestParameterType": "body",
        	"requestParameterPath": "status",
        	"title": "Envelope Status",
        	"note": "Please provide envelope status.",
        	"options": {
        		"created": "created",
        		"sent": "sent",
        		"deleted": "deleted"
        	}
        },
    ]
    ```

    For the `file` type input, `requestParameterPath` property has 3 values: `documentBase64`, `name` and `fileExtension`. Users can specify: all three, skip `fileExtension` or skip both `name` and `fileExtension`. However, they cannot skip value in the middle or change the ordering.

    Square brackets in `requestParameterPath` property are used with the arrays. The indexes inside the brackets indicate the number of the element to which the value of the parameter will be assigned. Using "*" in brackets instead of a number, the parameter value will be assigned to all elements of the array.

    In this case, if the User provides values "My new template" as name, "my.email@gmail.com" as signer email and select "created" as status, the request body will look like this:
    ```
    {
        "name": "My new template",
        "shared": "false",
        "emailSubject": "Please sign this document set",
        "documents": [
            {
                "documentBase64": "dGVzdCBkb2M=",
                "name": "Lorem Ipsum 1",
                "fileExtension": "txt",
                "documentId": "1"
            },
            {
                "documentBase64": "dGVzdCBkb2M=",
                "name": "Lorem Ipsum 2",
                "fileExtension": "txt",
                "documentId": "2"
            }
        ],
        "recipients": {
            "signers": [
                {
                    "rolename": "signer",
                    "recipientId": "1",
                    "routingOrder": "1",
                    "email": "my.email@gmail.com"
                }
            ],
            "carbonCopies": [
                {
                    "rolename": "cc",
                    "recipientId": "2",
                    "routingOrder": "2",
                    "email": "ccEmail"
                }
            ]
        },
        "status": "created"
    }
    ```

7.	Update `request` property with parameters that will be used in the request path or passed from the previous step. To get the values from the previous steps, you need to add `source` (indicates the step from which the values are taken) and `responseParameterPath` (indicates the JSON path to the parameter value in the step response) properties.

    Example:
    ```
    "request": {
        "api": "/restapi/v2.1/accounts/{accountId}/templates",
        "method": "post",
        "documentationUrl": "https://developers.docusign.com/docs/esign-rest-api/reference/templates/templates/create/",
        "parameters": [
    		{
    			"name": "accountId",
    			"requestParameterPath": "accountId",
    			"in": "path",
    			"description": "The external account number (int) or account ID GUID."
    		}
    	],
        "bodyTemplate": {
            "name": "[templateName]",
            "shared": "false",
            "emailSubject": "Please sign this document set",
            "documents": [
                {
                    "documentBase64": "dGVzdCBkb2M=",
                    "name": "Lorem Ipsum 1",
                    "fileExtension": "txt",
                    "documentId": "1"
                },
                {
                    "documentBase64": "dGVzdCBkb2M=",
                    "name": "Lorem Ipsum 2",
                    "fileExtension": "txt",
                    "documentId": "2"
                }
            ],
            "recipients": {
                "signers": [
                    {
                        "rolename": "signer",
                        "recipientId": "1",
                        "routingOrder": "1",
                        "email": "signerEmail"
                    }
                ],
                "carbonCopies": [
                    {
                        "rolename": "cc",
                        "recipientId": "2",
                        "routingOrder": "2",
                        "email": "ccEmail"
                    }
                ]
            },
            "status": "[status]"
        }
    }
    ```

    The parameter passed from the previous step will look like this:
    ```
    "parameters": [
    	{
    		"in": "body",
    		"name": "templateId",
    		"source": "CreateTemplate",
    		"responseParameterPath": "templateId",
    		"requestParameterPath": "templateId",
    		"description": "The details required to create an envelope from a template"
    	}
    ],
    ```
8.	Compose the manifest according to the provided scenario structure
