# Document Upload API Documentation

This document describes the document upload functionality for chatbots in the AI Chatbot system.

## Overview

The document upload feature allows you to upload documents to chatbots, which are then processed by the RAG (Retrieval Augmented Generation) server to create vector embeddings for enhanced chat responses.

## Dependencies

Make sure to install the required packages:

```bash
npm install multer @types/multer form-data
```

## API Endpoints

### 1. Upload Documents to Existing Chatbot

**Endpoint:** `POST /api/chatbots/:chatbotId/documents`

**Authentication:** Required (JWT token)

**Content-Type:** `multipart/form-data`

**Parameters:**
- `chatbotId` (path parameter) - The ID of the chatbot

**Form Data:**
- `documents` (file or files) - Single or multiple document files to upload (max 10 files)

**Supported File Types:**
- PDF (`.pdf`)
- Text files (`.txt`)
- Markdown (`.md`)
- Word documents (`.doc`, `.docx`)
- CSV (`.csv`)
- JSON (`.json`)

**File Size Limit:** 16MB per file

**Maximum Files:** 10 files per request

**Example Request (Single File):**
```bash
curl -X POST \
  http://localhost:8000/api/chatbots/507f1f77bcf86cd799439011/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "documents=@/path/to/your/file.pdf"
```

**Example Request (Multiple Files):**
```bash
curl -X POST \
  http://localhost:8000/api/chatbots/507f1f77bcf86cd799439011/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "documents=@/path/to/file1.pdf" \
  -F "documents=@/path/to/file2.txt" \
  -F "documents=@/path/to/file3.md"
```

**Example Response (All Success):**
```json
{
  "success": true,
  "data": [
    {
      "filename": "file1.pdf",
      "documentId": "123abc",
      "status": "uploaded",
      "vectors_created": true
    },
    {
      "filename": "file2.txt",
      "documentId": "456def",
      "status": "uploaded",
      "vectors_created": true
    }
  ],
  "message": "Successfully uploaded 2 document(s)"
}
```

**Example Response (Partial Success - HTTP 207):**
```json
{
  "success": true,
  "data": [
    {
      "filename": "file1.pdf",
      "documentId": "123abc",
      "status": "uploaded",
      "vectors_created": true
    }
  ],
  "message": "1 document(s) uploaded, 1 failed",
  "errors": [
    {
      "filename": "file2.txt",
      "error": "File type not supported"
    }
  ]
}
```

**Example Response (All Failed):**
```json
{
  "success": false,
  "error": "Upload failed",
  "message": "All 2 document(s) failed to upload",
  "errors": [
    {
      "filename": "file1.pdf",
      "error": "File size exceeds limit"
    },
    {
      "filename": "file2.txt",
      "error": "Connection timeout"
    }
  ]
}
```

---

### 2. Create Chatbot with Documents

**Endpoint:** `POST /api/chatbots`

**Authentication:** Required (JWT token)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `name` (string, required) - Name of the chatbot (1-100 characters)
- `description` (string, required) - Description (1-500 characters)
- `systemPrompt` (string, optional) - System prompt (max 1000 characters)
- `metadata` (JSON string, optional) - Additional metadata
- `documents` (file or files, optional) - Single or multiple document files to upload during creation (max 10 files)

**Example Request (Single Document):**
```bash
curl -X POST \
  http://localhost:8000/api/chatbots \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Customer Support Bot" \
  -F "description=A helpful customer support assistant" \
  -F "systemPrompt=You are a helpful customer support assistant." \
  -F "documents=@/path/to/knowledge-base.pdf"
```

**Example Request (Multiple Documents):**
```bash
curl -X POST \
  http://localhost:8000/api/chatbots \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Customer Support Bot" \
  -F "description=A helpful customer support assistant" \
  -F "systemPrompt=You are a helpful customer support assistant." \
  -F "documents=@/path/to/knowledge-base.pdf" \
  -F "documents=@/path/to/faq.txt" \
  -F "documents=@/path/to/guide.md"
```

**Example Response (Success with Multiple Documents):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Customer Support Bot",
    "description": "A helpful customer support assistant",
    "userId": "user123",
    "systemPrompt": "You are a helpful customer support assistant.",
    "createdAt": "2025-11-11T10:00:00.000Z",
    "updatedAt": "2025-11-11T10:00:00.000Z"
  },
  "documents": [
    {
      "filename": "knowledge-base.pdf",
      "documentId": "123abc",
      "status": "uploaded",
      "vectors_created": true
    },
    {
      "filename": "faq.txt",
      "documentId": "456def",
      "status": "uploaded",
      "vectors_created": true
    },
    {
      "filename": "guide.md",
      "documentId": "789ghi",
      "status": "uploaded",
      "vectors_created": true
    }
  ],
  "message": "Chatbot created with 3 document(s)"
}
```

**Example Response (Partial Success):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Customer Support Bot",
    "description": "A helpful customer support assistant"
  },
  "documents": [
    {
      "filename": "knowledge-base.pdf",
      "documentId": "123abc",
      "status": "uploaded",
      "vectors_created": true
    }
  ],
  "warning": "Chatbot created. 1 document(s) uploaded, 1 failed",
  "uploadErrors": [
    {
      "filename": "faq.txt",
      "error": "File size exceeds limit"
    }
  ]
}
```

**Example Response (All Documents Failed):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Customer Support Bot",
    "description": "A helpful customer support assistant"
  },
  "warning": "Chatbot created but all 2 document(s) failed to upload",
  "uploadErrors": [
    {
      "filename": "knowledge-base.pdf",
      "error": "Connection timeout"
    },
    {
      "filename": "faq.txt",
      "error": "Invalid file type"
    }
  ]
}
```

---

### 3. Get All Documents for a Chatbot

**Endpoint:** `GET /api/chatbots/:chatbotId/documents`

**Authentication:** Required (JWT token)

**Parameters:**
- `chatbotId` (path parameter) - The ID of the chatbot

**Example Request:**
```bash
curl -X GET \
  http://localhost:8000/api/chatbots/507f1f77bcf86cd799439011/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "documentId": "123abc",
      "filename": "knowledge-base.pdf",
      "uploadedAt": "2025-11-11T10:00:00.000Z",
      "size": 1048576,
      "status": "processed"
    },
    {
      "documentId": "456def",
      "filename": "faq.txt",
      "uploadedAt": "2025-11-11T11:00:00.000Z",
      "size": 2048,
      "status": "processed"
    }
  ]
}
```

---

### 4. Delete a Document

**Endpoint:** `DELETE /api/chatbots/:chatbotId/documents/:documentId`

**Authentication:** Required (JWT token)

**Parameters:**
- `chatbotId` (path parameter) - The ID of the chatbot
- `documentId` (path parameter) - The ID of the document to delete

**Example Request:**
```bash
curl -X DELETE \
  http://localhost:8000/api/chatbots/507f1f77bcf86cd799439011/documents/123abc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "data": {
    "documentId": "123abc",
    "vectorsDeleted": true
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Bad request",
  "message": "No file provided"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not found",
  "message": "Chatbot not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Failed to upload document"
}
```

## How It Works

1. **File Upload:** When a document is uploaded, it's received as multipart/form-data using Multer middleware
2. **Storage:** The file is temporarily stored in memory (not written to disk)
3. **Forwarding:** The file is forwarded to the RAG server at `http://localhost:5000/api/chatbots/:chatbotId/documents`
4. **Vector Processing:** The RAG server processes the document and creates vector embeddings
5. **Response:** The result is returned to the client

## Configuration

The RAG server URL is configured via environment variable:

```env
RAG_SERVER_URL=http://localhost:5000/api
```

## File Validation

- **Allowed MIME types:** 
  - `application/pdf`
  - `text/plain`
  - `text/markdown`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `text/csv`
  - `application/json`

- **Allowed extensions:** `.pdf`, `.txt`, `.md`, `.doc`, `.docx`, `.csv`, `.json`
- **Maximum file size:** 16MB

## Frontend Integration

### Using Fetch API (Single File)

```javascript
async function uploadDocument(chatbotId, file) {
  const formData = new FormData();
  formData.append('documents', file);

  const response = await fetch(
    `http://localhost:8000/api/chatbots/${chatbotId}/documents`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }
  );

  return await response.json();
}
```

### Using Fetch API (Multiple Files)

```javascript
async function uploadDocuments(chatbotId, files) {
  const formData = new FormData();
  
  // Append multiple files with the same field name
  files.forEach(file => {
    formData.append('documents', file);
  });

  const response = await fetch(
    `http://localhost:8000/api/chatbots/${chatbotId}/documents`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }
  );

  return await response.json();
}
```

### Using Axios (Single or Multiple Files)

```javascript
import axios from 'axios';

async function uploadDocuments(chatbotId, files) {
  const formData = new FormData();
  
  // Works with single file or array of files
  if (Array.isArray(files)) {
    files.forEach(file => {
      formData.append('documents', file);
    });
  } else {
    formData.append('documents', files);
  }

  const response = await axios.post(
    `http://localhost:8000/api/chatbots/${chatbotId}/documents`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data;
}
```

### Creating Chatbot with Documents

```javascript
async function createChatbotWithDocuments(name, description, files) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description);
  formData.append('systemPrompt', 'You are a helpful assistant.');
  
  // Add multiple documents
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('documents', file);
    });
  }

  const response = await fetch('http://localhost:8000/api/chatbots', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
}
```

### React Example with File Input

```jsx
import { useState } from 'react';

function DocumentUpload({ chatbotId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file);
      });

      const response = await fetch(
        `http://localhost:8000/api/chatbots/${chatbotId}/documents`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      const result = await response.json();
      console.log('Upload result:', result);
      
      if (result.success) {
        alert(`Successfully uploaded ${result.data.length} document(s)`);
        setFiles([]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept=".pdf,.txt,.md,.doc,.docx,.csv,.json"
        onChange={handleFileChange}
      />
      <button onClick={handleUpload} disabled={uploading || files.length === 0}>
        {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
      </button>
      {files.length > 0 && (
        <ul>
          {files.map((file, index) => (
            <li key={index}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Notes

- Document upload during chatbot creation is optional - the chatbot will be created even if document upload fails
- **Multiple files supported** - You can upload up to 10 files at once
- All document operations are forwarded to the RAG server for processing
- Vector embeddings are automatically created when documents are uploaded
- Partial success handling - If some files fail, successful uploads are still processed
- Deleting a document also removes its associated vector embeddings
- The RAG server must be running for document operations to work
- Files are processed sequentially to avoid overwhelming the RAG server
- HTTP 207 (Multi-Status) is returned for partial successes

