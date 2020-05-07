import { Component } from '@angular/core';
import { BlobServiceClient, BlockBlobParallelUploadOptions, BlobUploadCommonResponse } from '@azure/storage-blob';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  storageAccount: string;
  sasToken: string;
  storageContainer: string;
  file: File;
  fileUri: string = null;

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
    this.fileUri = `https://${this.storageAccount}.blob.core.windows.net/${this.storageContainer}/${this.file.name}${this.sasToken}`
  }
}
