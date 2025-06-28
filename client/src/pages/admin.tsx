import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Upload } from "lucide-react";

interface Usuario {
  id: number;
  usuario: string;
  correo: string;
}

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [uploadStatus, setUploadStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "loading" | "">("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: usuarios = [], refetch } = useQuery<Usuario[]>({
    queryKey: ["/api/usuarios"],
  });

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Administrar Listado</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargar archivo CSV/Excel
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
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
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm">
                      <span className="font-medium text-blue-600">Haga clic para cargar</span> o arrastre el archivo aquí
                    </p>
                    <p className="text-xs text-gray-500 mt-1">CSV o Excel (máximo 10MB)</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending || !selectedFile}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Cargar Listado
              </Button>
              <Button
                onClick={() => setLocation('/')}
                variant="outline"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Volver
              </Button>
            </div>
          </div>

          <div className={getStatusClass()}>
            {uploadStatus}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-md font-medium text-gray-800 mb-4">Vista Previa del Listado</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.length > 0 ? (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{usuario.usuario}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{usuario.correo}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-sm text-gray-500 text-center">
                      No hay datos cargados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
