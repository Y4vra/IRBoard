import { useEffect, useState } from "react"
import { kratos } from "@/lib/kratos"
import { 
  type UpdateRegistrationFlowBody, 
  type UiNodeInputAttributes 
} from "@ory/client"
import { Button } from "@/components/ui/button"
import {Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle,} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

function Registration() {
  const [flowData, setFlowData] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        navigate("/", { replace: true })
      } else {
        kratos.createBrowserRegistrationFlow()
          .then(({ data }) => setFlowData(data))
          .catch((err) => console.error("Error setting up flow:", err))
      }
    }
  }, [isAuthenticated, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!flowData) return

    const csrfNode = flowData.ui.nodes.find(
        (node: any) => node.attributes.name === "csrf_token"
    )
    
    const csrfToken = (csrfNode?.attributes as UiNodeInputAttributes)?.value as string

    try {
        await kratos.updateRegistrationFlow({
        flow: flowData.id,
        updateRegistrationFlowBody: {
            method: "code",
            csrf_token: csrfToken,
            traits: {
            email: email,
            name: firstName,
            surname: lastName,
            },
            code: code,
        } as UpdateRegistrationFlowBody,
        })

        const settingsFlow = await kratos.createBrowserSettingsFlow()
        
        const settingsCsrfNode = settingsFlow.data.ui.nodes.find(
        (node: any) => node.attributes.name === "csrf_token"
        )
        
        const settingsCsrf = (settingsCsrfNode?.attributes as UiNodeInputAttributes)?.value as string

        await kratos.updateSettingsFlow({
        flow: settingsFlow.data.id,
        updateSettingsFlowBody: {
            method: "password",
            csrf_token: settingsCsrf,
            password: password,
        },
        })

        window.location.href = "/"
    } catch (err) {
        console.error("Registration error:", err)
        alert("Error during registration. Ensure the code is valid and password is 15-64 characters.")
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Finish your IR-Board Signup</CardTitle>
          <CardDescription>
            Enter your invitation code and set up your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} id="registrationForm">
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Signup Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  placeholder="Enter temporal code"
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    placeholder="John"
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    placeholder="Doe"
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
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
                <Label htmlFor="password">Permanent Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  placeholder="Min. 15 characters"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={15}
                  maxLength={64}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" form="registrationForm" className="w-full">
            Complete Registration
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Already registered?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Click here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Registration