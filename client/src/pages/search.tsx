import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SearchPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [resultType, setResultType] = useState<"success" | "error" | "loading" | "">("");

  const searchMutation = useMutation({
    mutationFn: async (correo: string) => {
      const response = await apiRequest("POST", "/api/search", { correo });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.found) {
        setResult(data.usuario);
        setResultType("success");
      } else {
        setResult(data.message);
        setResultType("error");
      }
    },
    onError: (error: any) => {
      setResult("Error: " + error.message);
      setResultType("error");
    },
  });

  const handleSearch = () => {
    if (!email.trim()) {
      setResult("Por favor ingrese un correo electrónico");
      setResultType("error");
      return;
    }

    setResult("Buscando...");
    setResultType("loading");
    searchMutation.mutate(email);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getResultClass = () => {
    switch (resultType) {
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
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="usuario@uv.mx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searchMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none"
            >
              Buscar
            </Button>
          </div>
          
          <div className={getResultClass()}>
            {result}
          </div>
        </div>
      </div>
    </div>
  );
}
