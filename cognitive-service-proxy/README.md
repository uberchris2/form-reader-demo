# Cognitive Services Proxy

The Form Recognizer API does not currently allow setting CORS headers. This function app enables you to call the API from wherever the demo is hosted.

## Deployment

1. Create a function application and deploy this code. 
1. In application settings, set  "AZURE\_FUNCTION\_PROXY\_BACKEND\_URL\_DECODE\_SLASHES": "true"
1. Add the URL of the deployed demo to the CORS of the function application
1. In the angular environment config, set the url of the proxy