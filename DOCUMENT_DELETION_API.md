# Document Deletion API Documentation

This document describes the document deletion functionality for chatbots in the AI Chatbot system.

## Overview

The system provides two levels of document deletion:
1. **Delete specific document** - Remove a single document by its ID
2. **Delete all documents** - Remove all documents for a chatbot

Both operations automatically update the vector store to reflect the changes.

## API Endpoints

### 1. Delete Specific Document

**Endpoint:** `DELETE /api/chatbots/:chatbotId/documents/:documentId`

**Authentication:** Required (JWT token)

**Parameters:**
- `chatbotId` (path parameter) - The ID of the chatbot
- `documentId` (path parameter) - The ID of the document to delete

**Example Request:**
```bash
curl -X DELETE \
  http://localhost:8000/api/chatbots/507f1f77bcf86cd799439011/documents/doc_20251111_120000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response (Success - HTTP 200):**
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "data": {
    "chatbot_id": "507f1f77bcf86cd799439011",
    "document_id": "doc_20251111_120000",
    "filename": "knowledge-base.pdf"
  }
}
```

**Example Response (Not Found - HTTP 404):**
```json
{
  "success": false,
  "error": "Document not found",
  "message": "Document with ID doc_20251111_120000 not found"
}
```

**What Happens:**
1. The physical file is deleted from the server
2. Document metadata is removed
3. Vector store is cleared for the chatbot
4. Vectors are recreated from remaining documents

---

### 2. Delete All Documents for a Chatbot

**Endpoint:** `DELETE /api/chatbots/:chatbotId/documents`

**Authentication:** Required (JWT token)

**Parameters:**
- `chatbotId` (path parameter) - The ID of the chatbot

**Example Request:**
```bash
curl -X DELETE \
  http://localhost:8000/api/chatbots/507f1f77bcf86cd799439011/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response (Success - HTTP 200):**
```json
{
  "success": true,
  "message": "All documents deleted successfully",
  "chatbot_id": "507f1f77bcf86cd799439011",
  "deleted_count": 5,
  "failed_count": 0
}
```

**What Happens:**
1. All physical files are deleted
2. The entire chatbot folder is removed
3. All document metadata is cleared
4. All vectors for the chatbot are deleted
5. This is automatically called when a chatbot is deleted

---

## Integration with Chatbot Deletion

When a chatbot is deleted via `DELETE /api/chatbots/:chatbotId`, all associated documents are automatically deleted as well.

**Example:**
```typescript
// In chatController.ts
async deleteChatbot(req: Request, res: Response) {
  const { chatbotId } = req.params;
  
  // Delete chatbot from database
  const chatbot = await ChatService.deleteChatbot(chatbotId);
  
  // Automatically delete all documents and vectors
  await VectorService.deleteAllDocuments(chatbotId);
  
  return res.status(200).json({ 
    success: true,
    message: "Chatbot deleted successfully" 
  });
}
```

---

## Backend Implementation (Python RAG Server)

### Document Metadata Storage

Documents are tracked using a JSON metadata file:

**File Location:** `uploads/{chatbot_id}/documents_metadata.json`

**Structure:**
```json
{
  "doc_20251111_120000": {
    "id": "doc_20251111_120000",
    "chatbot_id": "507f1f77bcf86cd799439011",
    "filename": "knowledge-base.pdf",
    "unique_filename": "knowledge-base_20251111_120000.pdf",
    "file_path": "/path/to/uploads/507f1f77bcf86cd799439011/knowledge-base_20251111_120000.pdf",
    "file_size": 1048576,
    "file_type": "pdf",
    "uploaded_at": "2025-11-11T12:00:00.000000"
  }
}
```

### Delete Single Document Flow

1. **Load metadata** - Read `documents_metadata.json`
2. **Check existence** - Verify document exists (404 if not)
3. **Delete file** - Remove physical file from disk
4. **Update metadata** - Remove entry from JSON file
5. **Delete vectors** - Clear vector store
6. **Recreate vectors** - Generate vectors from remaining documents
7. **Return success**

### Delete All Documents Flow

1. **Load metadata** - Read `documents_metadata.json`
2. **Delete files** - Remove all physical files
3. **Delete folder** - Remove entire chatbot folder
4. **Delete vectors** - Clear entire vector store
5. **Return counts** - Report deleted and failed counts

---

## Frontend Integration

### Delete Single Document

```typescript
async function deleteDocument(chatbotId: string, documentId: string) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/chatbots/${chatbotId}/documents/${documentId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const result = await response.json();
    
    if (result.success) {
      console.log('Document deleted:', result.data.filename);
    }
    
    return result;
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}
```

### Delete All Documents

```typescript
async function deleteAllDocuments(chatbotId: string) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/chatbots/${chatbotId}/documents`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const result = await response.json();
    
    if (result.success) {
      console.log(`Deleted ${result.deleted_count} documents`);
    }
    
    return result;
  } catch (error) {
    console.error('Delete all failed:', error);
    throw error;
  }
}
```

### React Component Example

```jsx
import { useState } from 'react';

function DocumentList({ chatbotId, documents }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeleting(documentId);
    try {
      const response = await fetch(
        `http://localhost:8000/api/chatbots/${chatbotId}/documents/${documentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();
      
      if (result.success) {
        alert('Document deleted successfully');
        // Refresh document list
        fetchDocuments();
      } else {
        alert('Failed to delete document: ' + result.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL documents? This cannot be undone!')) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/chatbots/${chatbotId}/documents`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();
      
      if (result.success) {
        alert(`Deleted ${result.deleted_count} documents successfully`);
        fetchDocuments();
      }
    } catch (error) {
      console.error('Delete all error:', error);
      alert('Failed to delete documents');
    }
  };

  return (
    <div>
      <div className="header">
        <h3>Documents ({documents.length})</h3>
        <button 
          onClick={handleDeleteAll}
          disabled={documents.length === 0}
          className="btn-danger"
        >
          Delete All
        </button>
      </div>
      
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            <span>{doc.filename}</span>
            <button
              onClick={() => handleDelete(doc.id)}
              disabled={deleting === doc.id}
              className="btn-delete"
            >
              {deleting === doc.id ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Error Handling

### Common Errors

**404 - Document Not Found**
```json
{
  "success": false,
  "error": "Document not found",
  "message": "Document with ID doc_123 not found"
}
```

**404 - Chatbot Not Found**
```json
{
  "success": false,
  "error": "Not found",
  "message": "Chatbot not found"
}
```

**500 - Server Error**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Failed to delete document"
}
```

---

## Important Notes

### Automatic Vector Updates
- When a single document is deleted, vectors are **automatically recreated** from remaining documents
- When all documents are deleted, the vector store is **completely cleared**
- This ensures the chatbot always has up-to-date context

### Cascading Deletion
- Deleting a chatbot **automatically deletes all its documents**
- This includes physical files, metadata, and vectors
- The operation is permanent and cannot be undone

### Performance Considerations
- Deleting a single document requires vector regeneration (may take time for large datasets)
- Deleting all documents is faster as it just clears the vector store
- Consider implementing a confirmation dialog for deletion operations

### Data Safety
- **No backup or recovery** - deleted files are permanently removed
- **No soft delete** - files are immediately removed from disk
- **No undo functionality** - implement backups if needed

### Best Practices

1. **Always confirm before deletion**
```typescript
if (!confirm('Are you sure?')) return;
```

2. **Provide feedback to users**
```typescript
setLoading(true);
// ... perform deletion
toast.success('Document deleted');
setLoading(false);
```

3. **Refresh UI after deletion**
```typescript
await deleteDocument(id);
await fetchDocuments(); // Refresh list
```

4. **Handle errors gracefully**
```typescript
try {
  await deleteDocument(id);
} catch (error) {
  showError('Failed to delete document');
}
```

5. **Implement permissions**
```typescript
// Only allow owners to delete
if (chatbot.userId !== currentUser.id) {
  throw new Error('Unauthorized');
}
```

---

## Testing

### Test Single Document Deletion

```bash
# 1. Upload a document
curl -X POST http://localhost:8000/api/chatbots/CHATBOT_ID/documents \
  -H "Authorization: Bearer TOKEN" \
  -F "documents=@test.pdf"

# Response will include document ID

# 2. Delete the document
curl -X DELETE http://localhost:8000/api/chatbots/CHATBOT_ID/documents/DOCUMENT_ID \
  -H "Authorization: Bearer TOKEN"

# 3. Verify deletion
curl -X GET http://localhost:8000/api/chatbots/CHATBOT_ID/documents \
  -H "Authorization: Bearer TOKEN"
```

### Test Delete All Documents

```bash
# 1. Upload multiple documents
curl -X POST http://localhost:8000/api/chatbots/CHATBOT_ID/documents \
  -H "Authorization: Bearer TOKEN" \
  -F "documents=@file1.pdf" \
  -F "documents=@file2.txt"

# 2. Delete all
curl -X DELETE http://localhost:8000/api/chatbots/CHATBOT_ID/documents \
  -H "Authorization: Bearer TOKEN"

# 3. Verify all deleted
curl -X GET http://localhost:8000/api/chatbots/CHATBOT_ID/documents \
  -H "Authorization: Bearer TOKEN"
# Should return empty array
```

---

## Summary

The document deletion system provides:

✅ **Single document deletion** with automatic vector updates  
✅ **Bulk deletion** for clearing all documents  
✅ **Automatic cleanup** when chatbots are deleted  
✅ **File system management** with metadata tracking  
✅ **Vector store synchronization** to maintain consistency  
✅ **Comprehensive error handling** for all edge cases  

This ensures documents and vectors stay in sync while providing a clean user experience.

