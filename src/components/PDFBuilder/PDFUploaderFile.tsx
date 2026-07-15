import React, { useState, type FC } from 'react';
import { uploadFilePDF } from '../../firebase.ts'
import { PATH_PDF_STORAGE } from '../../types/Consts.ts'

interface PDFUploaderProps {
    formId: string,
    reupload:boolean
    onUploadNewPDF: (url_pdf: string) => void;
}

interface UploadState {
    isLoading: boolean;
    error: string | null;
    success: boolean;
    fileName: string | null;
}

const PDFUploader: FC<PDFUploaderProps> = ({ formId, reupload, onUploadNewPDF }) => {
    const [state, setState] = useState<UploadState>({
        isLoading: false,
        error: null,
        success: false,
        fileName: null,
    });

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            setState((prev) => ({
                ...prev,
                error: 'Please select a valid PDF file',
            }));
            return;
        }

        // Validate file size (e.g., max 30MB)
        const maxSizeInBytes = 30 * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
            setState((prev) => ({
                ...prev,
                error: 'File size must be less than 10MB',
            }));
            return;
        }

        setState((prev) => ({
            ...prev,
            isLoading: true,
            error: null,
            success: false,
        }));

        try {
            const fileName = formId + ".pdf";
            const filePath = PATH_PDF_STORAGE + fileName;
            await uploadFilePDF(file, filePath);
            const url_pdf = import.meta.env.VITE_ENDPOINT_PDF.replace("{{filename}}", fileName)
            onUploadNewPDF(url_pdf)
            setState({
                isLoading: false,
                error: null,
                success: true,
                fileName: file.name,
            });

            // Reset success message after 3 seconds
            setTimeout(() => {
                setState((prev) => ({
                    ...prev,
                    success: false,
                }));
            }, 3000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';
            setState({
                isLoading: false,
                error: errorMessage,
                success: false,
                fileName: null,
            });
        }
    };

    return (
        <div className={reupload ? "pdf-reuploader" :"pdf-uploader"}>

            <input
                type="file"
                id="pdf-file-upload"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={state.isLoading}
                className="visually-hidden"
                aria-label="PDF file input"
            />

            <label
                htmlFor="pdf-file-upload"
                className={`btn btn-primary btn-sm d-inline-flex align-items-center ${state.isLoading ? 'disabled' : ''}`}
            >
                {state.isLoading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Uploading...
                    </>
                ) : (
                    <>
                        <i className="bi bi-upload me-2"></i>
                        {reupload ? "Reupload PDF" : "Upload PDF"}
                    </>
                    )}
            </label>

            {state.error && <p className="error">{state.error}</p>}

            {state.success && !reupload && (
                <p className="success">
                    Successfully uploaded: {state.fileName}
                </p>
            )}
        </div>
    );
};

export default PDFUploader;