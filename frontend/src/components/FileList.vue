<template>
    <div class="file-list">
      <div class="file-list-controls">
        <input 
          v-model="searchQuery" 
          placeholder="Search files..." 
          class="search-input"
        />
        <select v-model="sortBy" class="sort-select">
          <option value="name">Sort by Name</option>
          <option value="size">Sort by Size</option>
          <option value="createdAt">Sort by Date</option>
        </select>
      </div>
  
      <!-- Loading State -->
      <div v-if="loading" class="loading-spinner">
        Loading files...
      </div>
  
      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="fetchFiles" class="retry-btn">Retry</button>
      </div>
  
      <!-- Files Table -->
      <template v-else>
        <table v-if="filteredAndSortedFiles.length" class="files-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Type</th>
              <th>Uploaded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in filteredAndSortedFiles" :key="file.id">
              <td>
                <div class="file-name-container">
                  <span class="file-icon">{{ getFileIcon(file.type) }}</span>
                  <span>{{ file.name }}</span>
                </div>
              </td>
              <td>{{ formatFileSize(file.size) }}</td>
              <td>{{ file.type }}</td>
              <td>{{ formatDate(file.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="previewFile(file)" 
                    class="preview-btn"
                    :disabled="!canPreviewFile(file)"
                  >
                    Preview
                  </button>
                  <button 
                    @click="deleteFile(file.id)" 
                    class="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="no-files-message">No files found.</p>
      </template>
  
      <!-- File Preview Modal -->
      <FilePreviewModal 
        :file="fileToPreview" 
        :isVisible="isModalVisible" 
        :fileUrl="fileUrl" 
        :fileContent="fileContent" 
        @close="isModalVisible = false"
      />
    </div>
  </template>
  
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  import FilePreviewModal from './FilePreviewModal.vue'; // Import the modal component
  
  // Reactive state
  const files = ref([]);
  const searchQuery = ref('');
  const sortBy = ref('createdAt');
  const loading = ref(true);
  const error = ref(null);
  const isModalVisible = ref(false);
  const fileToPreview = ref(null);
  const fileUrl = ref('');
  const fileContent = ref('');
  
  // Fetch files method with improved error handling
  const fetchFiles = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await axios.get('/files');
      files.value = response.data.data || [];
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch files. Please try again.';
      console.error('Fetch files error:', err);
    } finally {
      loading.value = false;
    }
  };
  
  // Computed property for filtering and sorting
  const filteredAndSortedFiles = computed(() => {
    return files.value
      .filter(file => 
        file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
      .sort((a, b) => {
        switch(sortBy.value) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'size':
            return a.size - b.size;
          case 'createdAt':
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  });
  
  // Utility methods
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // File actions
  const previewFile = async (file) => {
    if (!canPreviewFile(file)) return;
  
    fileToPreview.value = file;
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      fileUrl.value = `/files/${file.id}`;
      isModalVisible.value = true;
    } else if (file.type.startsWith('text/')) {
      try {
        const response = await axios.get(`/files/${file.id}`, { responseType: 'text' });
        fileContent.value = response.data;
        isModalVisible.value = true;
      } catch (err) {
        console.error('Error fetching file content:', err);
      }
    }
  };
  
  const deleteFile = async (fileId) => {
    try {
      await axios.delete(`/files/${fileId}`);
      files.value = files.value.filter(file => file.id !== fileId);
    } catch (err) {
      error.value = 'Failed to delete file';
      console.error('Delete file error:', err);
    }
  };
  
  // Helper methods
  const getFileIcon = (fileType) => {
    const iconMap = {
      'image/': '📷',
      'video/': '🎥',
      'audio/': '🎵',
      'application/pdf': '📄',
      'text/': '📝',
      'application/': '📁'
    };
    
    for (const [type, icon] of Object.entries(iconMap)) {
      if (fileType.startsWith(type)) return icon;
    }
    return '📄'; // default icon
  };
  
  const canPreviewFile = (file) => {
    const previewableTypes = [
      'image/', 
      'application/pdf', 
      'text/'
    ];
    return previewableTypes.some(type => file.type.startsWith(type));
  };
  
  // Lifecycle hook
  onMounted(fetchFiles);
  
  // Expose methods for parent component
  defineExpose({ fetchFiles });
  </script>
  
  <style scoped>
  .file-list-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .search-input, .sort-select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .files-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .files-table th, 
  .files-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  .file-name-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .file-icon {
    font-size: 1.2em;
  }
  
  .action-buttons {
    display: flex;
    gap: 10px;
  }
  
  .preview-btn, 
  .delete-btn {
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .preview-btn {
    background-color: #4CAF50;
    color: white;
  }
  
  .preview-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .delete-btn {
    background-color: #ff4d4d;
    color: white;
  }
  
  .loading-spinner, 
  .error-message, 
  .no-files-message {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  
  .error-message {
    color: #d32f2f;
  }
  
  .retry-btn {
    margin-top: 10px;
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>