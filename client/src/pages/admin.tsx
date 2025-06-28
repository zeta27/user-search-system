import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Usuario {
  id: number;
  usuario: string;
  correo: string;
}

export default function AdminPage() {
  const [uploadStatus, setUploadStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "loading" | "">("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadStatus(data.message);
      setStatusType("success");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      queryClient.invalidateQueries({ queryKey: ["/api/usuarios"] });
    },
    onError: (error: any) => {
      setUploadStatus("Error: " + error.message);
      setStatusType("error");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus(`Archivo seleccionado: ${file.name}`);
      setStatusType("");
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setUploadStatus("Por favor seleccione un archivo");
      setStatusType("error");
      return;
    }

    setUploadStatus("Cargando archivo...");
    setStatusType("loading");
    uploadMutation.mutate(selectedFile);
  };

  const getStatusClass = () => {
    switch (statusType) {
      case "success":
        return "mt-4 text-sm text-green-600 font-medium min-h-[1.5rem]";
      case "error":
        return "mt-4 text-sm text-red-600 min-h-[1.5rem]";
      case "loading":
        return "mt-4 text-sm text-blue-600 min-h-[1.5rem]";
      default:
        return "mt-4 text-sm text-gray-600 min-h-[1.5rem]";
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-medium text-gray-800 mb-6">Cargar Listado</h2>
          
          <div className="space-y-4">
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label 
                  htmlFor={fileInputRef.current?.id} 
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-gray-600">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                      📄
                    </div>
                    <p className="text-sm">
                      <span className="font-medium text-blue-600">Seleccionar archivo</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">CSV o Excel</p>
                  </div>
                </label>
              </div>
            </div>
            
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending || !selectedFile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Cargar Archivo
            </Button>
          </div>

          <div className={getStatusClass()}>
            {uploadStatus}
          </div>
        </div>
      </div>
    </div>
  );
}
