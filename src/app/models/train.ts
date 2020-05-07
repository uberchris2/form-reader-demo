export class TrainingDocument {
    documentName: string;
    pages: number;
    errors: string[];
    status: string;
}

export class Error {
    errorMessage: string;
}

export class TrainResponse {
    modelId: string;
    trainingDocuments: TrainingDocument[];
    errors: Error[];
}