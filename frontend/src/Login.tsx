import { useEffect, useState } from "react"
import { kratos } from "@/lib/kratos"
import { Button } from "@/components/ui/button"
import {Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle,} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

function Login() {
  const [flowData, setFlowData] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading){
      if(isAuthenticated) {
        navigate("/", { replace: true });
      }else{
        kratos.createBrowserLoginFlow()
        .then(({ data }) => setFlowData(data))
        .catch((err) => console.error("Error setting up flow:", err))
      }
    }
  }, [isAuthenticated, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!flowData) return

    const csrfToken = flowData.ui.nodes.find(
    (node: any) => node.attributes.name === "csrf_token"
  )?.attributes.value

    try {
      await kratos.updateLoginFlow({
        flow: flowData.id,
        updateLoginFlowBody: {
          method: "password",
          identifier: email,
          password: password,
          csrf_token: csrfToken,
        },
      })
      window.location.href = "/"
    } catch (err) {
      console.error("Error en el login:", err)
      alert("Credenciales incorrectas")
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome to IR-Board!</CardTitle>
        <CardDescription>
          Enter your email below to login to the site
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} id="loginForm">
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                placeholder="mail@irboard.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
        </form>
      </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" form="loginForm" className="w-full">
            Login
          </Button>
        </CardFooter>
    </Card>
  )
}

export default Login
