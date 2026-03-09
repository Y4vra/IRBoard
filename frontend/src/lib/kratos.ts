import { Configuration, FrontendApi } from "@ory/client"

const authBasePath = `http://${import.meta.env.VITE_AUTH_DOMAIN}`

export const kratos = new FrontendApi(
  new Configuration({
    basePath: authBasePath, 
    baseOptions: { withCredentials: true }
  })
)