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
  fileList: FileList;
  filesUploaded: number;
  uploading: boolean = false;
  //step 2 fields
  inputBucketUri: string;
  recognizerKey: string;
  trainedModelId: string;
  training: boolean = false;
  //step 3 fields
  inputModelId: string;
  resultModel: object;
  viewing: boolean = false;
  //setp 4 fields
  form: File;
  resultForm: object;
  reading: boolean = false;

  constructor(private http: HttpClient) { }

  selectFile(event) {
    this.fileList = event.target.files;
  }

  async uploadFile() {
    this.uploading = true;
    const blobServiceClient = new BlobServiceClient(
      `https://${this.storageAccount}.blob.core.windows.net${this.sasToken}`
    );
    const containerClient = blobServiceClient.getContainerClient(this.storageContainer);
    for (var i = 0; i < this.fileList.length; i++) {
      const blockBlobClient = containerClient.getBlockBlobClient(this.fileList[i].name);
      const options: BlockBlobParallelUploadOptions = { blobHTTPHeaders: { blobContentType: this.fileList[i].type } };
      await blockBlobClient.uploadBrowserData(this.fileList[i], options);
    }
    this.uploading = false;
    this.filesUploaded = this.fileList.length;
    this.inputBucketUri = `https://${this.storageAccount}.blob.core.windows.net/${this.storageContainer}/${this.sasToken}`;
  }

  trainModel() {
    this.training = true;
    const body = { source: this.inputBucketUri };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': this.recognizerKey })
    }
    this.http.post<TrainResponse>(`${environment.cognitiveServiceProxy}train`, body, httpOptions)
      .subscribe(response => {
        this.training = false;
        this.trainedModelId = response.modelId;
        this.inputModelId = this.trainedModelId;
      });
  }

  viewModel() {
    this.viewing = true;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': this.recognizerKey })
    }
    this.http.get(`${environment.cognitiveServiceProxy}models/${this.inputModelId}/keys`, httpOptions)
      .subscribe(response => {
        this.viewing = false;
        this.resultModel = response;
      });
  }

  selectForm(event) {
    const fileList: FileList = event.target.files;
    this.form = fileList[0];
  }

  readForm() {
    this.reading = true;
    let formData: FormData = new FormData(); 
    formData.append('form', this.form); 
    formData.append('type', 'application/pdf');
    const httpOptions = {
      headers: new HttpHeaders({  'Ocp-Apim-Subscription-Key': this.recognizerKey })
    }
    this.http.post(`${environment.cognitiveServiceProxy}models/${this.inputModelId}/analyze`, formData, httpOptions)
      .subscribe(response => {
        this.reading = false;
        this.resultForm = response;
      });
  }
}
