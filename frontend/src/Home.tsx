import { useEffect, useState } from "react"
import {Card,} from "@/components/ui/card"

function Home() {
  const [projectsRequest, setProjectsRequest] = useState(null)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const VITE_API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${VITE_API_DOMAIN}/v1/home`);
        if (!response.ok) throw new Error('Error al conectar con la API');
        
        const result = await response.json();
        console.log(result)
        setProjectsRequest(projectsRequest);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (VITE_API_DOMAIN) {
      fetchData();
    } else {
      setError("La variable de entorno 'api_domain' no está configurada.");
      setLoading(false);
    }
  }, [VITE_API_DOMAIN]);

  if (loading) return <p>Cargando datos desde {VITE_API_DOMAIN}...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <Card className="w-full max-w-sm">
      hola
    </Card>
  )
}

export default Home
