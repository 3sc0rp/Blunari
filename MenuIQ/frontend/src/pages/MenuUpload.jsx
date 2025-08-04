import React, { useState } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';

const MenuUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const allowedTypes = ['.csv', '.json', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert('Please upload a CSV, JSON, or Excel file');
      return;
    }

    setUploadedFile(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;

    setUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setUploading(false);
      alert('Menu uploaded successfully!');
      setUploadedFile(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Upload Menu</h1>
        <p className="text-gray-400">Upload your menu data to get AI-powered insights and optimization suggestions.</p>
      </div>

      {/* Upload Form */}
      <div className="bg-[#0F1A2E] border border-gray-800 rounded-xl p-8">
        <div className="max-w-2xl mx-auto">
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
              dragActive
                ? 'border-[#00C4CC] bg-[#00C4CC]/5'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv,.json,.xlsx"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {!uploadedFile ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#00C4CC]/20 to-[#007DFF]/20 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[#00C4CC]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Drop your menu file here, or click to browse
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Supports CSV, JSON, and Excel files up to 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">File Ready</h3>
                  <div className="inline-flex items-center space-x-2 bg-gray-800/50 rounded-lg px-4 py-2">
                    <File className="w-4 h-4 text-gray-400" />
                    <span className="text-white text-sm">{uploadedFile.name}</span>
                    <button
                      onClick={removeFile}
                      className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {uploadedFile && (
            <div className="mt-6 text-center">
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="px-8 py-3 bg-gradient-to-r from-[#00C4CC] to-[#007DFF] text-white font-semibold rounded-lg hover:from-[#00C4CC]/90 hover:to-[#007DFF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {uploading ? 'Uploading...' : 'Process Menu'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[#0F1A2E] border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">File Format Requirements</h3>
        <div className="space-y-4 text-gray-300 text-sm">
          <div>
            <h4 className="font-medium text-white mb-2">CSV Format:</h4>
            <p className="mb-2">Your CSV should include the following columns:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li><code className="bg-gray-800 px-2 py-1 rounded">name</code> - Item name (required)</li>
              <li><code className="bg-gray-800 px-2 py-1 rounded">price</code> - Selling price (required)</li>
              <li><code className="bg-gray-800 px-2 py-1 rounded">cost</code> - Cost to make (optional)</li>
              <li><code className="bg-gray-800 px-2 py-1 rounded">category</code> - Item category (optional)</li>
              <li><code className="bg-gray-800 px-2 py-1 rounded">sales_count</code> - Historical sales (optional)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Example:</h4>
            <div className="bg-gray-800 p-3 rounded-lg font-mono text-xs">
              name,price,cost,category,sales_count<br/>
              "Grilled Salmon",24.99,12.50,"Main Course",89<br/>
              "Caesar Salad",12.99,4.25,"Appetizer",67
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuUpload;