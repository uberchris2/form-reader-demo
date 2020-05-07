import { Component } from '@angular/core';
import { BlobServiceClient, BlockBlobParallelUploadOptions, BlobUploadCommonResponse } from '@azure/storage-blob';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TrainResponse } from './models/train';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  //step 1 fields
  storageAccount: string;
  sasToken: string;
  storageContainer: string;
  file: File;
  uploadedFileUri: string;
  //step 2 fields
  inputFileUri: string;
  recognizerKey: string;
  trainedModelId: string;
  //step 3 fields
  inputModelId: string;
  resultModel: object;

  constructor(private http: HttpClient) { }

  selectFile(event) {
    const fileList: FileList = event.target.files;
    this.file = fileList[0];
  }

  async uploadFile() {
    const blobServiceClient = new BlobServiceClient(
      `https://${this.storageAccount}.blob.core.windows.net${this.sasToken}`
    );
    const containerClient = blobServiceClient.getContainerClient(this.storageContainer);
    const blockBlobClient = containerClient.getBlockBlobClient(this.file.name);
    const options: BlockBlobParallelUploadOptions = { blobHTTPHeaders: { blobContentType: this.file.type } };
    await blockBlobClient.uploadBrowserData(this.file, options);
    this.uploadedFileUri = `https://${this.storageAccount}.blob.core.windows.net/${this.storageContainer}/${this.file.name}${this.sasToken}`;
    this.inputFileUri = this.uploadedFileUri;
  }

  trainModel() {
    const body = { source: this.inputFileUri };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': this.recognizerKey })
    }
    this.http.post<TrainResponse>(`${environment.cognitiveServiceProxy}train`, body, httpOptions)
      .subscribe(response => {
        this.trainedModelId = response.modelId;
        this.inputModelId = this.trainedModelId;
      });
  }

  viewModel() {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': this.recognizerKey })
    }
    this.http.get(`${environment.cognitiveServiceProxy}models/${this.inputModelId}/keys`, httpOptions)
      .subscribe(response => {
        this.resultModel = response;
      });
  }
}
